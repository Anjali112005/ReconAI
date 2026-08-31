from datetime import datetime, timedelta, timezone

import os
import smtplib

from email.message import EmailMessage

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from fastapi.security import (
    HTTPAuthorizationCredentials,
    HTTPBearer,
)

from jose import JWTError, jwt

from passlib.context import CryptContext

from pydantic import BaseModel, EmailStr

from sqlalchemy.orm import Session

from .database import get_db
from .models import User


# ============================================================
# CONFIGURATION
# ============================================================

SECRET_KEY = os.getenv(
    "JWT_SECRET_KEY",
    "change-this-secret-key-in-production",
)

ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "60",
    )
)


# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def hash_password(password: str) -> str:
    """
    Hash a password using bcrypt.

    bcrypt has a maximum input size of 72 bytes.
    Validate before hashing so the application does not crash.
    """

    password_bytes = password.encode("utf-8")

    if len(password_bytes) > 72:
        raise HTTPException(
            status_code=400,
            detail=(
                "Password is too long. "
                "Please use a password of 72 bytes or fewer."
            ),
        )

    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a plain password against the stored bcrypt hash.
    """

    password_bytes = plain_password.encode("utf-8")

    if len(password_bytes) > 72:
        return False

    try:
        return pwd_context.verify(
            plain_password,
            hashed_password,
        )

    except Exception as error:
        print(
            "PASSWORD VERIFICATION ERROR:",
            str(error),
        )
        return False


# ============================================================
# JWT SECURITY
# ============================================================

security = HTTPBearer()


# ============================================================
# CREATE ACCESS TOKEN
# ============================================================

def create_access_token(
    user_id: int,
    email: str,
) -> str:

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ============================================================
# EMAIL VERIFICATION TOKEN
# ============================================================

def create_verification_token(
    user_id: int,
    email: str,
) -> str:

    expire = (
        datetime.now(timezone.utc)
        + timedelta(hours=24)
    )

    payload = {
        "sub": str(user_id),
        "email": email,
        "type": "email_verification",
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ============================================================
# EMAIL SENDING
# ============================================================

def send_verification_email(
    email: str,
    name: str,
    verification_token: str,
):
    """
    Send the email verification message.

    SMTP configuration comes from environment variables:

        SMTP_HOST
        SMTP_PORT
        SMTP_USERNAME
        SMTP_PASSWORD
        FRONTEND_URL
    """

    smtp_host = os.getenv("SMTP_HOST")

    smtp_port = int(
        os.getenv(
            "SMTP_PORT",
            "587",
        )
    )

    smtp_username = os.getenv(
        "SMTP_USERNAME"
    )

    smtp_password = os.getenv(
        "SMTP_PASSWORD"
    )

    frontend_url = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173",
    )

    # --------------------------------------------------------
    # CHECK SMTP CONFIGURATION
    # --------------------------------------------------------

    if not all(
        [
            smtp_host,
            smtp_username,
            smtp_password,
        ]
    ):
        print(
            "WARNING: SMTP is not configured."
        )

        print(
            "Verification token:"
        )

        print(
            verification_token
        )

        return

    # --------------------------------------------------------
    # REMOVE TRAILING SLASH FROM FRONTEND URL
    # --------------------------------------------------------

    frontend_url = frontend_url.rstrip("/")

    # --------------------------------------------------------
    # VERIFICATION URL
    # --------------------------------------------------------

    verification_url = (
        f"{frontend_url}"
        f"/verify-email?token="
        f"{verification_token}"
    )

    # --------------------------------------------------------
    # CREATE EMAIL
    # --------------------------------------------------------

    message = EmailMessage()

    message["Subject"] = (
        "Verify your ReconAI account"
    )

    message["From"] = smtp_username

    message["To"] = email

    message.set_content(
        f"""
Hello {name},

Welcome to ReconAI.

Please verify your email address by clicking the link below:

{verification_url}

This verification link will expire in 24 hours.

If you did not create a ReconAI account, you can safely ignore this email.

Regards,
ReconAI Team
"""
    )

    # --------------------------------------------------------
    # SEND EMAIL
    # --------------------------------------------------------

    with smtplib.SMTP(
        smtp_host,
        smtp_port,
        timeout=20,
    ) as server:

        server.ehlo()

        server.starttls()

        server.ehlo()

        server.login(
            smtp_username,
            smtp_password,
        )

        server.send_message(
            message
        )


# ============================================================
# REQUEST SCHEMAS
# ============================================================

class SignupRequest(BaseModel):

    name: str

    email: EmailStr

    password: str


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


# ============================================================
# RESPONSE SCHEMAS
# ============================================================

class UserResponse(BaseModel):

    id: int

    name: str

    email: str

    is_verified: bool

    created_at: datetime


class AuthResponse(BaseModel):

    message: str

    access_token: str | None = None

    token_type: str = "bearer"

    user: UserResponse | None = None


# ============================================================
# ROUTER
# ============================================================

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


# ============================================================
# SIGNUP
# ============================================================

@router.post(
    "/signup",
    response_model=AuthResponse,
)
def signup(
    request: SignupRequest,
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # NORMALIZE INPUT
    # --------------------------------------------------------

    email = (
        str(request.email)
        .lower()
        .strip()
    )

    name = request.name.strip()

    password = request.password

    # --------------------------------------------------------
    # VALIDATE NAME
    # --------------------------------------------------------

    if not name:

        raise HTTPException(
            status_code=400,
            detail="Name is required.",
        )

    # --------------------------------------------------------
    # VALIDATE PASSWORD LENGTH
    # --------------------------------------------------------

    if len(password) < 8:

        raise HTTPException(
            status_code=400,
            detail=(
                "Password must be at least "
                "8 characters long."
            ),
        )

    # bcrypt maximum = 72 bytes

    if len(password.encode("utf-8")) > 72:

        raise HTTPException(
            status_code=400,
            detail=(
                "Password is too long. "
                "Please use a password of 72 bytes or fewer."
            ),
        )

    # --------------------------------------------------------
    # CHECK EXISTING USER
    # --------------------------------------------------------

    existing_user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=409,
            detail=(
                "An account with this "
                "email already exists."
            ),
        )

    # --------------------------------------------------------
    # HASH PASSWORD
    # --------------------------------------------------------

    password_hash = hash_password(
        password
    )

    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------

    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        is_verified=False,
    )

    db.add(user)

    try:

        db.commit()

        db.refresh(user)

    except Exception as error:

        db.rollback()

        print(
            "DATABASE SIGNUP ERROR:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to create account.",
        )

    # --------------------------------------------------------
    # CREATE EMAIL VERIFICATION TOKEN
    # --------------------------------------------------------

    verification_token = (
        create_verification_token(
            user.id,
            user.email,
        )
    )

    # --------------------------------------------------------
    # SEND VERIFICATION EMAIL
    # --------------------------------------------------------

    try:

        send_verification_email(
            user.email,
            user.name,
            verification_token,
        )

        email_status = (
            "Verification email sent."
        )

    except Exception as error:

        print(
            "Failed to send verification email:"
        )

        print(
            error
        )

        email_status = (
            "Account created, but the "
            "verification email could not be sent."
        )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return AuthResponse(

        message=(
            "Account created successfully. "
            "Please verify your email. "
            f"{email_status}"
        ),

        user=UserResponse(

            id=user.id,

            name=user.name,

            email=user.email,

            is_verified=user.is_verified,

            created_at=user.created_at,

        ),
    )


# ============================================================
# VERIFY EMAIL
# ============================================================

@router.get(
    "/verify-email"
)
def verify_email(
    token: str,
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # DECODE TOKEN
    # --------------------------------------------------------

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        # ----------------------------------------------------
        # CHECK TOKEN TYPE
        # ----------------------------------------------------

        if payload.get("type") != "email_verification":

            raise HTTPException(
                status_code=400,
                detail="Invalid verification token.",
            )

        # ----------------------------------------------------
        # GET USER ID
        # ----------------------------------------------------

        user_id = payload.get("sub")

        if not user_id:

            raise HTTPException(
                status_code=400,
                detail="Invalid verification token.",
            )

    except HTTPException:

        raise

    except JWTError:

        raise HTTPException(
            status_code=400,
            detail=(
                "Verification link is invalid "
                "or has expired."
            ),
        )

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    try:

        user = (
            db.query(User)
            .filter(
                User.id == int(user_id)
            )
            .first()
        )

    except Exception as error:

        print(
            "VERIFY USER DATABASE ERROR:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to verify user.",
        )

    # --------------------------------------------------------
    # USER NOT FOUND
    # --------------------------------------------------------

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # --------------------------------------------------------
    # ALREADY VERIFIED
    # --------------------------------------------------------

    if user.is_verified:

        return {
            "message": (
                "Email is already verified."
            ),
            "email": user.email,
        }

    # --------------------------------------------------------
    # VERIFY USER
    # --------------------------------------------------------

    user.is_verified = True

    try:

        db.commit()

        db.refresh(user)

    except Exception as error:

        db.rollback()

        print(
            "EMAIL VERIFICATION DATABASE ERROR:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to verify email.",
        )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {

        "message": (
            "Email verified successfully. "
            "You can now log in."
        ),

        "email": user.email,

    }


# ============================================================
# LOGIN
# ============================================================

@router.post(
    "/login",
    response_model=AuthResponse,
)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # NORMALIZE EMAIL
    # --------------------------------------------------------

    email = (
        str(request.email)
        .lower()
        .strip()
    )

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    # --------------------------------------------------------
    # USER NOT FOUND
    # --------------------------------------------------------

    if not user:

        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid email or password."
            ),
        )

    # --------------------------------------------------------
    # CHECK PASSWORD
    # --------------------------------------------------------

    if not verify_password(
        request.password,
        user.password_hash,
    ):

        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid email or password."
            ),
        )

    # --------------------------------------------------------
    # CHECK EMAIL VERIFICATION
    # --------------------------------------------------------

    if not user.is_verified:

        raise HTTPException(
            status_code=403,
            detail=(
                "Please verify your email "
                "before logging in."
            ),
        )

    # --------------------------------------------------------
    # CREATE JWT
    # --------------------------------------------------------

    access_token = (
        create_access_token(
            user.id,
            user.email,
        )
    )

    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return AuthResponse(

        message="Login successful.",

        access_token=access_token,

        token_type="bearer",

        user=UserResponse(

            id=user.id,

            name=user.name,

            email=user.email,

            is_verified=user.is_verified,

            created_at=user.created_at,

        ),
    )


# ============================================================
# GET CURRENT USER DEPENDENCY
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        security
    ),
    db: Session = Depends(get_db),
):

    # --------------------------------------------------------
    # GET TOKEN
    # --------------------------------------------------------

    token = credentials.credentials

    # --------------------------------------------------------
    # DECODE JWT
    # --------------------------------------------------------

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        user_id = payload.get("sub")

        if not user_id:

            raise HTTPException(
                status_code=401,
                detail=(
                    "Invalid authentication token."
                ),
            )

    except HTTPException:

        raise

    except JWTError:

        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid or expired "
                "authentication token."
            ),
        )

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    try:

        user = (
            db.query(User)
            .filter(
                User.id == int(user_id)
            )
            .first()
        )

    except Exception as error:

        print(
            "CURRENT USER DATABASE ERROR:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to authenticate user.",
        )

    # --------------------------------------------------------
    # USER DOES NOT EXIST
    # --------------------------------------------------------

    if not user:

        raise HTTPException(
            status_code=401,
            detail=(
                "User no longer exists."
            ),
        )

    return user


# ============================================================
# GET CURRENT USER
# ============================================================

@router.get(
    "/me",
    response_model=UserResponse,
)
def get_me(
    current_user: User = Depends(
        get_current_user
    ),
):

    return UserResponse(

        id=current_user.id,

        name=current_user.name,

        email=current_user.email,

        is_verified=current_user.is_verified,

        created_at=current_user.created_at,

    )