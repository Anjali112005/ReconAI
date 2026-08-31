from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    JSON,
    String,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    reconciliation_runs = relationship(
        "ReconciliationRun",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class ReconciliationRun(Base):
    __tablename__ = "reconciliation_runs"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    run_number: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    date_time: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    bank_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    ledger_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    match_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    exception_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    exposure: Mapped[float] = mapped_column(
        Float,
        default=0,
        nullable=False,
    )

    result_data: Mapped[dict] = mapped_column(
        JSON,
        nullable=False,
    )

    user = relationship(
        "User",
        back_populates="reconciliation_runs",
    )