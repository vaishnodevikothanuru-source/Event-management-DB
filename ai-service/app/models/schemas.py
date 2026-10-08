from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class ChatQueryRequest(BaseModel):
    query: str = Field(..., description="Attendee or organizer natural language query")
    eventId: Optional[str] = Field(None, description="Event scope ID for multi-tenant isolation")
    organizationId: Optional[str] = Field(None, description="Organization tenant ID")
    userId: Optional[str] = Field(None, description="User ID for personalized context")

class ChatQueryResponse(BaseModel):
    answer: str
    sources: List[str] = Field(default_factory=list)
    confidenceScore: float = 0.96
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())

class RecommendationRequest(BaseModel):
    userId: str
    skills: List[str] = Field(default_factory=list)
    interests: List[str] = Field(default_factory=list)
    industry: Optional[str] = None
    eventId: Optional[str] = None

class SessionRecommendation(BaseModel):
    sessionId: str
    title: str
    matchScore: int
    reason: str

class AttendeeRecommendation(BaseModel):
    userId: str
    name: str
    jobTitle: str
    company: str
    matchScore: int
    commonSkills: List[str]

class RecommendationResponse(BaseModel):
    sessionRecommendations: List[SessionRecommendation] = Field(default_factory=list)
    attendeeRecommendations: List[AttendeeRecommendation] = Field(default_factory=list)

class DocumentIngestRequest(BaseModel):
    eventId: str
    organizationId: str
    filename: str
    content: str
    fileType: str = "TXT"

class DocumentIngestResponse(BaseModel):
    documentId: str
    chunksCreated: int
    summary: str
    keyPoints: List[str]
    status: str = "INDEXED"

# ==========================================
# OTP AUTHENTICATION SCHEMAS
# ==========================================
class SendOtpRequest(BaseModel):
    target: str = Field(..., description="Recipient email address or phone number")
    type: str = Field("email", description="Delivery channel: 'email' or 'phone'")
    purpose: Optional[str] = Field("LOGIN", description="Purpose: 'LOGIN', 'SIGNUP', or 'REGISTRATION'")
    email: Optional[str] = Field(None, description="Optional recipient email for simultaneous dual dispatch")
    phone: Optional[str] = Field(None, description="Optional recipient phone for simultaneous dual dispatch")

class SendOtpResponse(BaseModel):
    success: bool
    message: str
    expiresIn: int = 60
    deliveryChannel: str = "EMAIL"
    otp: Optional[str] = Field(None, description="The generated 6-digit OTP code for on-screen display & instant testing")
    otpCode: Optional[str] = Field(None, description="Alias for generated OTP code")
    error: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    target: str = Field(..., description="Recipient email or phone number that received the OTP")
    otp: str = Field(..., description="6-digit numeric OTP code entered by the user")

class VerifyOtpResponse(BaseModel):
    success: bool
    message: str
    verifiedTarget: Optional[str] = None
    token: Optional[str] = None
    attemptsRemaining: Optional[int] = None
    error: Optional[str] = None

