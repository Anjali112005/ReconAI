from app.models import ReconciliationHistory


# ============================================================
# SERIALIZE HISTORY RECORD
# ============================================================

def _serialize_history_record(record):
    """
    Convert SQLAlchemy ReconciliationHistory object
    into a normal dictionary for the API.
    """

    return {
        "id": record.id,

        "user_id": record.user_id,

        "created_at": record.created_at,

        "summary": record.summary,

        "result": record.result,
    }


# ============================================================
# ADD RECONCILIATION HISTORY
# ============================================================

def add_reconciliation_history(
    db,
    user_id,
    reconciliation_result,
):
    """
    Save a reconciliation result to MySQL.

    The record is permanently associated with the
    authenticated user's user_id.
    """

    if user_id is None:
        raise ValueError(
            "user_id is required when saving reconciliation history."
        )

    if not isinstance(
        reconciliation_result,
        dict,
    ):
        raise ValueError(
            "reconciliation_result must be a dictionary."
        )

    record = ReconciliationHistory(

        user_id=int(user_id),

        summary=reconciliation_result.get(
            "summary",
            {},
        ),

        result=reconciliation_result,

    )

    try:

        db.add(record)

        db.commit()

        db.refresh(record)

    except Exception:

        db.rollback()

        raise


    # --------------------------------------------------------
    # RETURN DICTIONARY
    # --------------------------------------------------------

    return _serialize_history_record(
        record
    )


# ============================================================
# GET ALL HISTORY FOR CURRENT USER
# ============================================================

def get_reconciliation_history(
    db,
    user_id,
):
    """
    Get ONLY reconciliation history belonging
    to the authenticated user.
    """

    if user_id is None:
        raise ValueError(
            "user_id is required when retrieving history."
        )


    records = (

        db.query(
            ReconciliationHistory
        )

        .filter(

            ReconciliationHistory.user_id
            == int(user_id)

        )

        .order_by(

            ReconciliationHistory.created_at.desc()

        )

        .all()

    )


    return [

        _serialize_history_record(
            record
        )

        for record in records

    ]


# ============================================================
# GET SINGLE HISTORY RECORD
# ============================================================

def get_history_by_id(
    db,
    history_id,
    user_id,
):
    """
    Get one history record.

    IMPORTANT:
    Both history_id AND user_id are checked.

    This prevents User B from accessing User A's
    record even if User B knows the history ID.
    """

    if user_id is None:
        raise ValueError(
            "user_id is required when retrieving history."
        )


    record = (

        db.query(
            ReconciliationHistory
        )

        .filter(

            ReconciliationHistory.id
            == int(history_id),

            ReconciliationHistory.user_id
            == int(user_id),

        )

        .first()

    )


    if record is None:

        return None


    return _serialize_history_record(
        record
    )


# ============================================================
# DELETE SINGLE HISTORY RECORD
# ============================================================

def delete_history_record(
    db,
    history_id,
    user_id,
):
    """
    Delete one history record belonging
    to the authenticated user.

    A user cannot delete another user's record.
    """

    if user_id is None:
        raise ValueError(
            "user_id is required when deleting history."
        )


    record = (

        db.query(
            ReconciliationHistory
        )

        .filter(

            ReconciliationHistory.id
            == int(history_id),

            ReconciliationHistory.user_id
            == int(user_id),

        )

        .first()

    )


    if record is None:

        return False


    try:

        db.delete(record)

        db.commit()

    except Exception:

        db.rollback()

        raise


    return True


# ============================================================
# CLEAR ALL HISTORY FOR CURRENT USER
# ============================================================

def clear_reconciliation_history(
    db,
    user_id,
):
    """
    Delete ALL reconciliation history belonging
    to the authenticated user.

    Other users' history is NOT affected.
    """

    if user_id is None:
        raise ValueError(
            "user_id is required when clearing history."
        )


    try:

        deleted_count = (

            db.query(
                ReconciliationHistory
            )

            .filter(

                ReconciliationHistory.user_id
                == int(user_id)

            )

            .delete(

                synchronize_session=False

            )

        )

        db.commit()

    except Exception:

        db.rollback()

        raise


    return deleted_count