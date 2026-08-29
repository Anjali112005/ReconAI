def investigate_exception(exception):
    """
    Generate an investigation report based on
    the detected financial exception.

    This version uses structured investigation logic.
    An LLM can be added later as an enhancement.
    """

    exception_type = exception.get(
        "exception_type",
        "UNKNOWN"
    )

    priority = exception.get(
        "priority",
        "MEDIUM"
    )

    risk_score = exception.get(
        "risk_score",
        0
    )

    amount_at_risk = exception.get(
        "amount_at_risk",
        0
    )

    investigation = {
        "exception_type": exception_type,
        "priority": priority,
        "risk_score": risk_score,
        "amount_at_risk": amount_at_risk
    }

    # =====================================
    # POSSIBLE DUPLICATE
    # =====================================

    if exception_type == "POSSIBLE_DUPLICATE":

        investigation["analysis"] = (
            "Two ledger transactions have highly "
            "similar transaction details. This may "
            "indicate that the same transaction was "
            "recorded more than once."
        )

        investigation["possible_causes"] = [
            "Duplicate transaction entry",
            "Payment retry after a processing timeout",
            "Duplicate API or webhook event",
            "Manual accounting entry error"
        ]

        investigation["investigation_steps"] = [
            "Compare the original transaction references",
            "Check payment gateway or bank settlement records",
            "Verify whether both transactions resulted in a payment",
            "Reverse or correct the duplicate entry if confirmed"
        ]

    # =====================================
    # AMOUNT MISMATCH
    # =====================================

    elif exception_type == "AMOUNT_MISMATCH":

        difference = exception.get(
            "difference",
            0
        )

        investigation["analysis"] = (
            "The bank transaction and internal ledger "
            "appear to represent related transactions, "
            "but their recorded amounts are different."
        )

        investigation["possible_causes"] = [
            "Processing or settlement fee",
            "Partial settlement",
            "Incorrect ledger entry",
            "Incorrect bank transaction amount"
        ]

        investigation["investigation_steps"] = [
            "Compare the original payment records",
            "Check whether fees were deducted during settlement",
            "Verify the expected settlement amount",
            "Correct the inaccurate record if an error is confirmed"
        ]

        investigation["amount_difference"] = difference

    # =====================================
    # BANK FEE
    # =====================================

    elif exception_type == "BANK_FEE":

        investigation["analysis"] = (
            "A bank charge was detected without a "
            "corresponding internal ledger transaction."
        )

        investigation["possible_causes"] = [
            "Scheduled bank service fee",
            "Transaction processing charge",
            "Account maintenance charge"
        ]

        investigation["investigation_steps"] = [
            "Check the applicable bank fee schedule",
            "Verify the charge against the bank statement",
            "Confirm whether the fee should be recorded internally",
            "Create an accounting entry if required"
        ]

    # =====================================
    # MISSING BANK ENTRY
    # =====================================

    elif exception_type == "MISSING_BANK_ENTRY":

        investigation["analysis"] = (
            "An internal transaction does not currently "
            "have a corresponding bank record."
        )

        investigation["possible_causes"] = [
            "Pending settlement",
            "Delayed bank posting",
            "Failed transaction",
            "Missing bank statement data"
        ]

        investigation["investigation_steps"] = [
            "Check settlement status",
            "Verify the bank account activity",
            "Check whether the transaction was reversed",
            "Review future bank statements"
        ]

    # =====================================
    # MISSING LEDGER ENTRY
    # =====================================

    elif exception_type == "MISSING_LEDGER_ENTRY":

        investigation["analysis"] = (
            "A bank transaction does not have a "
            "corresponding internal ledger record."
        )

        investigation["possible_causes"] = [
            "Missing accounting entry",
            "Unrecorded transaction",
            "Data import issue",
            "Incorrect transaction classification"
        ]

        investigation["investigation_steps"] = [
            "Search accounting records",
            "Verify the transaction source",
            "Check data import logs",
            "Create a ledger entry if appropriate"
        ]

    # =====================================
    # UNKNOWN EXCEPTION
    # =====================================

    else:

        investigation["analysis"] = (
            "ReconAI detected an exception that requires "
            "manual review."
        )

        investigation["possible_causes"] = [
            "Incomplete transaction data",
            "Data inconsistency",
            "Unexpected transaction event"
        ]

        investigation["investigation_steps"] = [
            "Review the original transaction records",
            "Compare bank and ledger data",
            "Investigate the source of the discrepancy"
        ]

    return investigation


def investigate_exceptions(exceptions):
    """
    Generate investigation reports for all exceptions.
    """

    investigations = []

    for exception in exceptions:

        report = investigate_exception(
            exception
        )

        investigations.append(report)

    return investigations