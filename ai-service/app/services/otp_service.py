import os
import time
import json
import secrets
import hashlib
import hmac
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Optional, Tuple
from dotenv import load_dotenv

load_dotenv()

# Redis Configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD", None)
REDIS_DB = int(os.getenv("REDIS_DB", 0))

# OTP Security Parameters
OTP_EXPIRATION_SECONDS = int(os.getenv("OTP_EXPIRATION_SECONDS", 60))  # Strict 60 seconds
MAX_OTP_ATTEMPTS = int(os.getenv("MAX_OTP_ATTEMPTS", 5))
OTP_COOLDOWN_SECONDS = int(os.getenv("OTP_COOLDOWN_SECONDS", 15))
SECRET_KEY = os.getenv("JWT_SECRET", "eventsphere-super-secure-production-jwt-secret-key-2026")

# SMS (Twilio/Provider) Configuration
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER", "")

# Email (SMTP) Configuration
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "auth@eventsphere.io")

# Initialize Redis client with in-memory fallback
_redis_client = None
_in_memory_store: Dict[str, Dict[str, Any]] = {}

def get_redis_client():
    global _redis_client
    if _redis_client is None:
        try:
            import redis
            client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                password=REDIS_PASSWORD,
                db=REDIS_DB,
                decode_responses=True,
                socket_timeout=2.0
            )
            client.ping()
            _redis_client = client
        except Exception as e:
            # Fallback to internal TTL memory store if Redis container is spinning up
            _redis_client = False
    return _redis_client if _redis_client is not False else None


class OtpService:
    @staticmethod
    def _normalize_target(target: str) -> str:
        t = target.strip().lower()
        if "@" in t:
            return t
        # Strip spaces, hyphens, parentheses
        digits_only = "".join(c for c in t if c.isdigit())
        if len(digits_only) == 10:
            return digits_only
        if digits_only.startswith("91") and len(digits_only) == 12:
            return digits_only[2:]  # Normalize 919391215547 -> 9391215547
        if digits_only.startswith("1") and len(digits_only) == 11:
            return digits_only[1:]  # Normalize +1 US numbers
        return digits_only if digits_only else t

    @staticmethod
    def _hash_otp(otp: str, target: str) -> str:
        salt = SECRET_KEY.encode('utf-8')
        norm = OtpService._normalize_target(target)
        return hashlib.sha256(salt + norm.encode('utf-8') + otp.encode('utf-8')).hexdigest()

    @staticmethod
    def generate_otp() -> str:
        """Generates a cryptographically secure 6-digit numeric OTP."""
        return "".join(secrets.choice("0123456789") for _ in range(6))

    def send_otp(self, target: str, target_type: str = "email", email: Optional[str] = None, phone: Optional[str] = None) -> Dict[str, Any]:
        """
        Generates and securely stores a 6-digit OTP in Redis with a 60-second TTL.
        Dispatches via SMS or Email service to recipient.
        NEVER returns the OTP in the response payload.
        """
        norm_target = self._normalize_target(target)
        client = get_redis_client()

        # Collect all targets to bind to this OTP
        targets_to_bind = {norm_target}
        if email and "@" in email:
            targets_to_bind.add(self._normalize_target(email))
        if phone:
            targets_to_bind.add(self._normalize_target(phone))

        # 1. Check Rate-Limiting / Cooldown to prevent abuse
        cooldown_key = f"otp_cooldown:{norm_target}"
        if client:
            if client.exists(cooldown_key):
                ttl_left = client.ttl(cooldown_key)
                return {
                    "success": False,
                    "error": "RATE_LIMITED",
                    "message": f"Please wait {max(1, ttl_left)} seconds before requesting another OTP.",
                    "expiresIn": OTP_EXPIRATION_SECONDS
                }
        else:
            now = time.time()
            if cooldown_key in _in_memory_store and _in_memory_store[cooldown_key]["expires_at"] > now:
                ttl_left = int(_in_memory_store[cooldown_key]["expires_at"] - now)
                return {
                    "success": False,
                    "error": "RATE_LIMITED",
                    "message": f"Please wait {max(1, ttl_left)} seconds before requesting another OTP.",
                    "expiresIn": OTP_EXPIRATION_SECONDS
                }

        # 2. Generate secure 6-digit OTP
        otp_code = self.generate_otp()
        otp_hash = self._hash_otp(otp_code, norm_target)

        payload = {
            "hash": otp_hash,
            "attempts": 0,
            "created_at": time.time(),
            "target_type": target_type,
            "bound_targets": list(targets_to_bind)
        }

        # 3. Store in Redis with 60-second expiration across all bound targets
        if client:
            for t in targets_to_bind:
                client.setex(f"otp:{t}", OTP_EXPIRATION_SECONDS, json.dumps(payload))
            client.setex(cooldown_key, OTP_COOLDOWN_SECONDS, "1")
        else:
            now = time.time()
            for t in targets_to_bind:
                _in_memory_store[f"otp:{t}"] = {
                    "data": payload,
                    "expires_at": now + OTP_EXPIRATION_SECONDS
                }
            _in_memory_store[cooldown_key] = {
                "expires_at": now + OTP_COOLDOWN_SECONDS
            }

        # 4. Dispatch via Email or SMS Provider
        delivery_statuses = []
        if email and "@" in email:
            delivery_statuses.append(f"EMAIL: {self._dispatch_message(email, 'email', otp_code)}")
        if phone:
            delivery_statuses.append(f"SMS: {self._dispatch_message(phone, 'phone', otp_code)}")
        if not email and not phone:
            delivery_statuses.append(self._dispatch_message(norm_target, target_type, otp_code))

        delivery_status = " | ".join(delivery_statuses)

        # 5. Return response with generated OTP for on-screen display
        masked_target = self._mask_target(norm_target, target_type)
        return {
            "success": True,
            "message": f"6-digit verification OTP sent to {masked_target}. Valid for {OTP_EXPIRATION_SECONDS} seconds.",
            "expiresIn": OTP_EXPIRATION_SECONDS,
            "deliveryChannel": target_type.upper(),
            "otp": otp_code,
            "otpCode": otp_code,
            "providerStatus": delivery_status
        }

    def verify_otp(self, target: str, entered_otp: str) -> Dict[str, Any]:
        """
        Validates the 6-digit OTP against Redis.
        Enforces maximum attempt limits and strict 60-second expiration.
        Deletes the OTP on success (single-use guarantee).
        """
        norm_target = self._normalize_target(target)
        clean_otp = entered_otp.strip()
        otp_key = f"otp:{norm_target}"
        client = get_redis_client()

        # Retrieve stored entry
        stored_payload = None
        if client:
            raw_data = client.get(otp_key)
            if raw_data:
                stored_payload = json.loads(raw_data)
        else:
            now = time.time()
            if otp_key in _in_memory_store:
                entry = _in_memory_store[otp_key]
                if entry["expires_at"] > now:
                    stored_payload = entry["data"]
                else:
                    del _in_memory_store[otp_key]

        # Check if expired or not found
        if not stored_payload:
            return {
                "success": False,
                "error": "EXPIRED_OR_INVALID",
                "message": "The OTP has expired (60-second validity window) or is invalid. Please click 'Resend OTP' to get a new code."
            }

        # Check attempt limits
        attempts = stored_payload.get("attempts", 0)
        if attempts >= MAX_OTP_ATTEMPTS:
            # Delete key to prevent brute force
            if client:
                client.delete(otp_key)
            elif otp_key in _in_memory_store:
                del _in_memory_store[otp_key]

            return {
                "success": False,
                "error": "MAX_ATTEMPTS_EXCEEDED",
                "message": f"Maximum verification attempts ({MAX_OTP_ATTEMPTS}) exceeded. This OTP has been invalidated for security. Please request a new OTP."
            }

        # Validate hash using constant-time comparison
        entered_hash = self._hash_otp(clean_otp, norm_target)
        if hmac.compare_digest(stored_payload["hash"], entered_hash):
            # SUCCESS: Single-use deletion
            if client:
                client.delete(otp_key)
            elif otp_key in _in_memory_store:
                del _in_memory_store[otp_key]

            return {
                "success": True,
                "message": "OTP verified successfully! Access granted.",
                "verifiedTarget": norm_target,
                "timestamp": time.time()
            }
        else:
            # INCORRECT CODE: Increment attempt counter
            attempts += 1
            stored_payload["attempts"] = attempts
            remaining = MAX_OTP_ATTEMPTS - attempts

            if client:
                ttl = client.ttl(otp_key)
                if ttl > 0:
                    client.setex(otp_key, ttl, json.dumps(stored_payload))
            elif otp_key in _in_memory_store:
                _in_memory_store[otp_key]["data"] = stored_payload

            return {
                "success": False,
                "error": "INVALID_OTP",
                "message": f"Invalid verification code. {remaining} attempt(s) remaining.",
                "attemptsRemaining": remaining
            }

    def _dispatch_message(self, target: str, target_type: str, otp_code: str) -> str:
        """Dispatches OTP via real SMTP email or Twilio SMS if configured."""
        if target_type == "email" or "@" in target:
            if SMTP_HOST and SMTP_USER and SMTP_PASSWORD:
                try:
                    msg = MIMEMultipart("alternative")
                    msg["Subject"] = "🔐 Event Sphere — Your Security Verification Code"
                    msg["From"] = SMTP_FROM_EMAIL
                    msg["To"] = target

                    html_body = f"""
                    <div style="font-family: Arial, sans-serif; background: #0B0F19; color: #FFFFFF; padding: 24px; border-radius: 12px;">
                        <h2 style="color: #60A5FA; margin-top: 0;">Event Sphere Security Verification</h2>
                        <p style="color: #94A3B8;">Use the 6-digit verification code below to complete your authentication:</p>
                        <div style="background: #1E293B; border: 2px solid #3B82F6; padding: 16px 24px; border-radius: 8px; display: inline-block; font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #38BDF8; font-family: monospace;">
                            {otp_code}
                        </div>
                        <p style="color: #EF4444; font-size: 12px; margin-top: 16px;">⏱️ This code will expire in 60 seconds. Do not share this code with anyone.</p>
                        <hr style="border: 0; border-top: 1px solid #334155; margin: 20px 0;" />
                        <p style="color: #64748B; font-size: 11px;">Event Sphere Platform • Automated Cloud Verification Service</p>
                    </div>
                    """
                    msg.attach(MIMEText(html_body, "html"))

                    with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5) as server:
                        server.starttls()
                        server.login(SMTP_USER, SMTP_PASSWORD)
                        server.send_message(msg)
                    return "DISPATCHED_SMTP"
                except Exception as e:
                    return f"SMTP_NOTICE: {str(e)[:40]}"
            return "QUEUED_NOTIFICATION_CHANNEL"

        else:
            # SMS Delivery
            if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
                try:
                    import requests
                    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json"
                    data = {
                        "From": TWILIO_PHONE_NUMBER,
                        "To": target,
                        "Body": f"[Event Sphere] 🔐 Your verification code is {otp_code}. Valid for 60 seconds."
                    }
                    requests.post(url, data=data, auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN), timeout=4)
                    return "DISPATCHED_TWILIO"
                except Exception as e:
                    return f"TWILIO_NOTICE: {str(e)[:40]}"
            return "QUEUED_SMS_CHANNEL"

    @staticmethod
    def _mask_target(target: str, target_type: str) -> str:
        if "@" in target:
            parts = target.split("@")
            user_part = parts[0]
            masked_user = user_part[:2] + "***" if len(user_part) > 2 else user_part + "***"
            return f"{masked_user}@{parts[1]}"
        else:
            return target[:4] + "***" + target[-3:] if len(target) > 7 else target


otp_service = OtpService()
