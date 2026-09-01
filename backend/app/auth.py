from datetime import datetime, timedelta, timezone
import json
import os
import urllib.error
import urllib.request

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

from pydantic import (
    BaseModel,
    EmailStr,
)

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

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:3000",
)


# ============================================================
# RESEND EMAIL CONFIGURATION
# ============================================================

RESEND_API_KEY = os.getenv(
    "RESEND_API_KEY"
)

EMAIL_FROM = os.getenv(
    "EMAIL_FROM",
    "ReconAI <anjali@theonestop.in>",
)


if RESEND_API_KEY:
    print(
        "Resend email client configured successfully."
    )
else:
    print(
        "WARNING: RESEND_API_KEY is not configured."
    )


# ============================================================
# PASSWORD HASHING
# ============================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
)


def validate_password_length(
    password: str,
) -> None:

    password_bytes = password.encode(
        "utf-8"
    )

    if len(password_bytes) > 72:

        raise HTTPException(
            status_code=400,
            detail=(
                "Password is too long. "
                "Please use a password of "
                "72 bytes or fewer."
            ),
        )


def hash_password(
    password: str,
) -> str:

    validate_password_length(
        password
    )

    return pwd_context.hash(
        password
    )


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:

    try:

        validate_password_length(
            plain_password
        )

    except HTTPException:

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
        "type": "access",
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )


# ============================================================
# CREATE EMAIL VERIFICATION TOKEN
# ============================================================

def create_verification_token(
    user_id: int,
    email: str,
) -> str:

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            hours=24
        )
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
# SEND EMAIL USING RESEND API
# ============================================================

def send_verification_email(
    email: str,
    name: str,
    verification_token: str,
) -> None:

    """
    Send email verification using Resend API.

    Required environment variables:

        RESEND_API_KEY
        EMAIL_FROM
        FRONTEND_URL
    """

    # --------------------------------------------------------
    # CHECK RESEND CONFIGURATION
    # --------------------------------------------------------

    if not RESEND_API_KEY:

        raise RuntimeError(
            "RESEND_API_KEY is not configured."
        )

    if not EMAIL_FROM:

        raise RuntimeError(
            "EMAIL_FROM is not configured."
        )

    # --------------------------------------------------------
    # CREATE VERIFICATION URL
    # --------------------------------------------------------

    frontend_url = (
        FRONTEND_URL.rstrip("/")
    )

    verification_url = (
        f"{frontend_url}"
        f"/verify-email"
        f"?token={verification_token}"
    )

    # --------------------------------------------------------
    # EMAIL HTML
    # --------------------------------------------------------

    html_content = f"""
<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <title>
        Verify your ReconAI account
    </title>

</head>

<body
    style="
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        font-family: Arial, Helvetica, sans-serif;
    "
>

    <div
        style="
            max-width: 600px;
            margin: 40px auto;
            background: white;
            padding: 40px;
            border-radius: 12px;
        "
    >

        <h1
            style="
                margin-top: 0;
                color: #111827;
            "
        >
            Welcome to ReconAI
        </h1>

        <p
            style="
                font-size: 16px;
                color: #374151;
            "
        >
            Hello {name},
        </p>

        <p
            style="
                font-size: 16px;
                color: #374151;
                line-height: 1.6;
            "
        >
            Thank you for creating your
            ReconAI account.
        </p>

        <p
            style="
                font-size: 16px;
                color: #374151;
                line-height: 1.6;
            "
        >
            Please click the button below
            to verify your email address.
        </p>

        <div
            style="
                margin: 30px 0;
                text-align: center;
            "
        >

            <a
                href="{verification_url}"
                style="
                    display: inline-block;
                    padding: 14px 28px;
                    background-color: #7c3aed;
                    color: white;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 16px;
                    font-weight: bold;
                "
            >
                Verify Email Address
            </a>

        </div>

        <p
            style="
                font-size: 14px;
                color: #6b7280;
                line-height: 1.6;
            "
        >
            This verification link will
            expire in 24 hours.
        </p>

        <p
            style="
                font-size: 14px;
                color: #6b7280;
                line-height: 1.6;
            "
        >
            If you did not create a ReconAI
            account, you can safely ignore
            this email.
        </p>

        <hr
            style="
                margin: 30px 0;
                border: none;
                border-top: 1px solid #e5e7eb;
            "
        >

        <p
            style="
                font-size: 13px;
                color: #9ca3af;
            "
        >
            ReconAI Team
        </p>

    </div>

</body>

</html>
"""

    # --------------------------------------------------------
    # RESEND API REQUEST
    # --------------------------------------------------------

    payload = {
        "from": EMAIL_FROM,
        "to": [email],
        "subject": "Verify your ReconAI account",
        "html": html_content,
    }

    request_data = json.dumps(
        payload
    ).encode("utf-8")

    request = urllib.request.Request(
        "https://api.resend.com/emails",
        data=request_data,
        method="POST",
        headers={
            "Authorization": (
                f"Bearer {RESEND_API_KEY}"
            ),
            "Content-Type": "application/json",
        },
    )

    # --------------------------------------------------------
    # SEND EMAIL
    # --------------------------------------------------------

    try:

        with urllib.request.urlopen(
            request,
            timeout=20,
        ) as response:

            response_body = (
                response.read()
                .decode("utf-8")
            )

            print(
                "VERIFICATION EMAIL SENT SUCCESSFULLY"
            )

            print(
                "Recipient:",
                email,
            )

            print(
                "Resend response:",
                response_body,
            )

    except urllib.error.HTTPError as error:

        error_body = ""

        try:

            error_body = (
                error.read()
                .decode("utf-8")
            )

        except Exception:

            pass

        print(
            "RESEND API ERROR:",
            error.code,
            error_body,
        )

        raise RuntimeError(
            "Resend failed to send email."
        )

    except urllib.error.URLError as error:

        print(
            "RESEND NETWORK ERROR:",
            str(error),
        )

        raise RuntimeError(
            "Could not connect to Resend."
        )

    except Exception as error:

        print(
            "RESEND EMAIL ERROR:",
            str(error),
        )

        raise


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


class UpdateProfileRequest(BaseModel):

    name: str


class ChangePasswordRequest(BaseModel):

    current_password: str

    new_password: str


class ResendVerificationRequest(BaseModel):

    email: EmailStr


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
    # VALIDATE PASSWORD
    # --------------------------------------------------------

    if len(password) < 8:

        raise HTTPException(
            status_code=400,
            detail=(
                "Password must be at least "
                "8 characters long."
            ),
        )

    validate_password_length(
        password
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

    hashed_password = hash_password(
        password
    )

    # --------------------------------------------------------
    # CREATE USER
    # --------------------------------------------------------

    user = User(
        name=name,
        email=email,
        hashed_password=hashed_password,
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
    # CREATE VERIFICATION TOKEN
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
            "FAILED TO SEND VERIFICATION EMAIL:"
        )

        print(
            str(error)
        )

        email_status = (
            "Account created, but the "
            "verification email could not "
            "be sent. Please use the "
            "resend verification option."
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
# RESEND VERIFICATION EMAIL
# ============================================================

@router.post(
    "/resend-verification"
)
def resend_verification(
    request: ResendVerificationRequest,
    db: Session = Depends(get_db),
):

    email = (
        str(request.email)
        .lower()
        .strip()
    )

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    # --------------------------------------------------------
    # DO NOT REVEAL WHETHER ACCOUNT EXISTS
    # --------------------------------------------------------

    if not user:

        return {
            "message": (
                "If an account exists with "
                "this email, a verification "
                "email has been sent."
            )
        }

    # --------------------------------------------------------
    # ALREADY VERIFIED
    # --------------------------------------------------------

    if user.is_verified:

        return {
            "message": (
                "This email address is "
                "already verified."
            )
        }

    # --------------------------------------------------------
    # CREATE NEW TOKEN
    # --------------------------------------------------------

    verification_token = (
        create_verification_token(
            user.id,
            user.email,
        )
    )

    # --------------------------------------------------------
    # SEND EMAIL
    # --------------------------------------------------------

    try:

        send_verification_email(
            user.email,
            user.name,
            verification_token,
        )

    except Exception as error:

        print(
            "RESEND VERIFICATION ERROR:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to send verification "
                "email right now."
            ),
        )

    return {
        "message": (
            "Verification email sent successfully."
        )
    }


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

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[
                ALGORITHM
            ],
        )

        if (
            payload.get("type")
            != "email_verification"
        ):

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid verification token."
                ),
            )

        user_id = payload.get("sub")

        token_email = payload.get(
            "email"
        )

        if not user_id:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Invalid verification token."
                ),
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

        user_id_int = int(
            user_id
        )

    except (TypeError, ValueError):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid verification token."
            ),
        )

    user = (
        db.query(User)
        .filter(
            User.id == user_id_int
        )
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    # --------------------------------------------------------
    # MAKE SURE TOKEN EMAIL MATCHES USER
    # --------------------------------------------------------

    if (
        token_email
        and token_email.lower()
        != user.email.lower()
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid verification token."
            ),
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
            "EMAIL VERIFICATION ERROR:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to verify email.",
        )

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
        user.hashed_password,
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
    # CREATE ACCESS TOKEN
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
    db: Session = Depends(
        get_db
    ),
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[
                ALGORITHM
            ],
        )

        # ----------------------------------------------------
        # ONLY ACCEPT ACCESS TOKENS
        # ----------------------------------------------------

        if (
            payload.get("type")
            != "access"
        ):

            raise HTTPException(
                status_code=401,
                detail=(
                    "Invalid authentication token."
                ),
            )

        user_id = payload.get(
            "sub"
        )

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
    # CONVERT USER ID
    # --------------------------------------------------------

    try:

        user_id_int = int(
            user_id
        )

    except (TypeError, ValueError):

        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid authentication token."
            ),
        )

    # --------------------------------------------------------
    # FIND USER
    # --------------------------------------------------------

    user = (
        db.query(User)
        .filter(
            User.id == user_id_int
        )
        .first()
    )

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


# ============================================================
# UPDATE PROFILE
# ============================================================

@router.put(
    "/profile",
    response_model=UserResponse,
)
def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):

    name = request.name.strip()

    if not name:

        raise HTTPException(
            status_code=400,
            detail=(
                "Name cannot be empty."
            ),
        )

    current_user.name = name

    try:

        db.commit()

        db.refresh(
            current_user
        )

    except Exception as error:

        db.rollback()

        print(
            "UPDATE PROFILE ERROR:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to update profile."
            ),
        )

    return UserResponse(

        id=current_user.id,

        name=current_user.name,

        email=current_user.email,

        is_verified=current_user.is_verified,

        created_at=current_user.created_at,

    )


# ============================================================
# CHANGE PASSWORD
# ============================================================

@router.put(
    "/change-password"
)
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):

    # --------------------------------------------------------
    # VALIDATE CURRENT PASSWORD
    # --------------------------------------------------------

    if not verify_password(
        request.current_password,
        current_user.hashed_password,
    ):

        raise HTTPException(
            status_code=400,
            detail=(
                "Current password is incorrect."
            ),
        )

    # --------------------------------------------------------
    # VALIDATE NEW PASSWORD
    # --------------------------------------------------------

    if len(
        request.new_password
    ) < 8:

        raise HTTPException(
            status_code=400,
            detail=(
                "New password must be at least "
                "8 characters long."
            ),
        )

    validate_password_length(
        request.new_password
    )

    # --------------------------------------------------------
    # UPDATE PASSWORD
    # --------------------------------------------------------

    current_user.hashed_password = (
        hash_password(
            request.new_password
        )
    )

    try:

        db.commit()

        db.refresh(
            current_user
        )

    except Exception as error:

        db.rollback()

        print(
            "CHANGE PASSWORD ERROR:",
            str(error),
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to change password."
            ),
        )

    return {
        "message": (
            "Password changed successfully."
        )
    }