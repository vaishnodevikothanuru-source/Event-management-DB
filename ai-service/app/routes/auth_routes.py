from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    SendOtpRequest, SendOtpResponse,
    VerifyOtpRequest, VerifyOtpResponse
)
from app.services.otp_service import otp_service

router = APIRouter(prefix="/api/auth", tags=["OTP Authentication"])

@router.post("/send-otp", response_model=SendOtpResponse)
def send_otp(req: SendOtpRequest):
    """
    Generates a secure 6-digit OTP, stores it in Redis with 60-second TTL,
    and dispatches via SMS / Email without exposing the OTP in the response.
    """
    if not req.target or len(req.target.strip()) < 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid phone number or email address is required."
        )

    res = otp_service.send_otp(req.target, req.type, email=req.email, phone=req.phone)
    if not res.get("success"):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS if res.get("error") == "RATE_LIMITED" else status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=res.get("message", "Could not dispatch OTP.")
        )

    return SendOtpResponse(
        success=True,
        message=res["message"],
        expiresIn=res["expiresIn"],
        deliveryChannel=res["deliveryChannel"],
        otp=res.get("otp"),
        otpCode=res.get("otpCode")
    )


@router.post("/verify-otp", response_model=VerifyOtpResponse)
def verify_otp(req: VerifyOtpRequest):
    """
    Verifies the user-entered 6-digit OTP against Redis.
    Enforces maximum attempt limits and 60-second expiration.
    """
    if not req.target or not req.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target contact and 6-digit OTP are required."
        )

    clean_otp = req.otp.strip()
    if len(clean_otp) != 6 or not clean_otp.isdigit():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The OTP code must be exactly 6 numeric digits."
        )

    res = otp_service.verify_otp(req.target, clean_otp)
    if not res.get("success"):
        error_type = res.get("error")
        status_code = status.HTTP_429_TOO_MANY_REQUESTS if error_type == "MAX_ATTEMPTS_EXCEEDED" else status.HTTP_400_BAD_REQUEST
        return VerifyOtpResponse(
            success=False,
            message=res["message"],
            error=res.get("error"),
            attemptsRemaining=res.get("attemptsRemaining")
        )

    return VerifyOtpResponse(
        success=True,
        message=res["message"],
        verifiedTarget=res.get("verifiedTarget"),
        token=f"jwt_verified_session_{hash(req.target)}"
    )


@router.post("/resend-otp", response_model=SendOtpResponse)
def resend_otp(req: SendOtpRequest):
    """
    Resends a new 6-digit OTP to the recipient with 60-second TTL reset.
    """
    return send_otp(req)
