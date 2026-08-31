from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
)

from sqlalchemy.orm import relationship

from app.database import Base


# ============================================================
# USER MODEL
# ============================================================

class User(Base):

    __tablename__ = "users"

    # --------------------------------------------------------
    # PRIMARY KEY
    # --------------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # --------------------------------------------------------
    # USER INFORMATION
    # --------------------------------------------------------

    name = Column(
        String(255),
        nullable=False,
    )

    email = Column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password = Column(
        String(255),
        nullable=False,
    )

    # --------------------------------------------------------
    # EMAIL VERIFICATION
    # --------------------------------------------------------

    is_verified = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    # --------------------------------------------------------
    # ACCOUNT CREATION
    # --------------------------------------------------------

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # --------------------------------------------------------
    # RELATIONSHIP
    # --------------------------------------------------------

    reconciliation_history = relationship(
        "ReconciliationHistory",
        back_populates="user",
        cascade="all, delete-orphan",
    )


# ============================================================
# RECONCILIATION HISTORY MODEL
# ============================================================

class ReconciliationHistory(Base):

    __tablename__ = "reconciliation_history"

    # --------------------------------------------------------
    # PRIMARY KEY
    # --------------------------------------------------------

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    # --------------------------------------------------------
    # USER ID
    # --------------------------------------------------------

    user_id = Column(
        Integer,
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # --------------------------------------------------------
    # CREATED TIME
    # --------------------------------------------------------

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    # --------------------------------------------------------
    # RECONCILIATION SUMMARY
    # --------------------------------------------------------

    summary = Column(
        JSON,
        nullable=True,
    )

    # --------------------------------------------------------
    # COMPLETE RECONCILIATION RESULT
    # --------------------------------------------------------

    result = Column(
        JSON,
        nullable=False,
    )

    # --------------------------------------------------------
    # RELATIONSHIP BACK TO USER
    # --------------------------------------------------------

    user = relationship(
        "User",
        back_populates="reconciliation_history",
    )