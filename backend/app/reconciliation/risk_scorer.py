def calculate_risk_score(exception):
    """
    Calculate a risk score between 0 and 100
    based on exception type, financial impact,
    and confidence.
    """

    exception_type = exception.get(
        "exception_type",
        ""
    )

    # =====================================
    # GET AMOUNT AT RISK
    # =====================================

    amount = 0

    if exception_type == "AMOUNT_MISMATCH":
        amount = exception.get(
            "difference",
            0
        )

    elif exception_type == "POSSIBLE_DUPLICATE":
        amount = max(
            exception.get("amount_1", 0),
            exception.get("amount_2", 0)
        )

    elif exception_type == "BANK_FEE":
        amount = exception.get(
            "amount",
            0
        )

    else:
        amount = exception.get(
            "amount",
            0
        )

    amount = float(amount)

    # =====================================
    # BASE SCORE BY EXCEPTION TYPE
    # =====================================

    type_scores = {
        "POSSIBLE_DUPLICATE": 60,
        "AMOUNT_MISMATCH": 45,
        "MISSING_BANK_ENTRY": 55,
        "MISSING_LEDGER_ENTRY": 55,
        "BANK_FEE": 10
    }

    base_score = type_scores.get(
        exception_type,
        30
    )

    # =====================================
    # FINANCIAL IMPACT SCORE
    # =====================================

    if amount >= 100000:
        impact_score = 40

    elif amount >= 50000:
        impact_score = 30

    elif amount >= 10000:
        impact_score = 20

    elif amount >= 1000:
        impact_score = 10

    else:
        impact_score = 5

    # =====================================
    # CONFIDENCE BONUS
    # =====================================

    confidence = exception.get(
        "confidence",
        0.8
    )

    confidence = float(confidence)

    if confidence >= 0.95:
        confidence_bonus = 10

    elif confidence >= 0.80:
        confidence_bonus = 5

    else:
        confidence_bonus = 0

    # =====================================
    # FINAL SCORE
    # =====================================

    risk_score = min(
        100,
        base_score
        + impact_score
        + confidence_bonus
    )

    # =====================================
    # PRIORITY LEVEL
    # =====================================

    if risk_score >= 85:
        priority = "CRITICAL"

    elif risk_score >= 65:
        priority = "HIGH"

    elif risk_score >= 40:
        priority = "MEDIUM"

    else:
        priority = "LOW"

    # =====================================
    # RECOMMENDED ACTION
    # =====================================

    recommended_actions = {

        "POSSIBLE_DUPLICATE":
            "Investigate immediately and verify whether a duplicate transaction was processed.",

        "AMOUNT_MISMATCH":
            "Compare the bank and ledger amounts and verify whether the difference is due to fees, partial settlement, or an incorrect entry.",

        "MISSING_BANK_ENTRY":
            "Verify whether the transaction is pending settlement or missing from the bank statement.",

        "MISSING_LEDGER_ENTRY":
            "Investigate why the bank transaction was not recorded in the internal ledger.",

        "BANK_FEE":
            "Verify the bank fee against the applicable bank fee schedule."
    }

    recommended_action = recommended_actions.get(
        exception_type,
        "Review this transaction manually."
    )

    return {
        "risk_score": risk_score,
        "priority": priority,
        "amount_at_risk": amount,
        "recommended_action": recommended_action
    }


def score_exceptions(exceptions):
    """
    Add risk scoring information
    to every exception.
    """

    scored_exceptions = []

    for exception in exceptions:

        risk_data = calculate_risk_score(
            exception
        )

        updated_exception = {
            **exception,
            **risk_data
        }

        scored_exceptions.append(
            updated_exception
        )

    # Sort highest risk first
    scored_exceptions.sort(
        key=lambda item: item["risk_score"],
        reverse=True
    )

    return scored_exceptions