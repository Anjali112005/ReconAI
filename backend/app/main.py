from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import pandas as pd

from app.reconciliation.engine import reconcile
from app.copilot import generate_copilot_response
from app.report_generator import generate_pdf_report

from app.services.history_service import (
    add_reconciliation_history,
    get_reconciliation_history,
    get_history_by_id,
    delete_history_record,
    clear_reconciliation_history
)


# =====================================
# FASTAPI APPLICATION
# =====================================

app = FastAPI(
    title="ReconAI API",
    description=(
        "AI-Powered Financial Reconciliation, "
        "Investigation and Reporting API"
    ),
    version="1.0.0"
)


# =====================================
# CORS CONFIGURATION
# =====================================

# =====================================
# CORS CONFIGURATION
# =====================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =====================================
# RECONCILIATION REQUEST MODEL
# =====================================

class ReconciliationRequest(BaseModel):

    bank_transactions: list
    ledger_transactions: list


# =====================================
# COPILOT REQUEST MODEL
# =====================================

class CopilotRequest(BaseModel):

    question: str
    reconciliation_result: dict


# =====================================
# HOME / BACKEND HEALTH CHECK
# =====================================

@app.get("/")
def home():

    return {
        "message": "ReconAI Backend is Running Successfully",

        "features": [
            "Financial Reconciliation",
            "AI Finance Copilot",
            "PDF Financial Reports",
            "Reconciliation History"
        ]
    }


# =====================================
# RECONCILIATION API
# =====================================

@app.post("/reconcile")
def reconcile_data(
    request: ReconciliationRequest
):

    try:

        # ---------------------------------
        # VALIDATE INPUT DATA
        # ---------------------------------

        if not request.bank_transactions:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Bank transactions cannot be empty."
                )
            )


        if not request.ledger_transactions:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Ledger transactions cannot be empty."
                )
            )


        # ---------------------------------
        # CONVERT BANK DATA TO DATAFRAME
        # ---------------------------------

        bank_df = pd.DataFrame(
            request.bank_transactions
        )


        # ---------------------------------
        # CONVERT LEDGER DATA TO DATAFRAME
        # ---------------------------------

        ledger_df = pd.DataFrame(
            request.ledger_transactions
        )


        # ---------------------------------
        # RUN RECONCILIATION ENGINE
        # ---------------------------------

        result = reconcile(
            bank_df,
            ledger_df
        )


        # ---------------------------------
        # SAVE RECONCILIATION TO HISTORY
        # ---------------------------------

        history_record = (
            add_reconciliation_history(
                result
            )
        )


        # ---------------------------------
        # ADD HISTORY INFORMATION
        # ---------------------------------

        if isinstance(
            history_record,
            dict
        ):

            result["history_id"] = (
                history_record.get("id")
            )

            result["created_at"] = (
                history_record.get("created_at")
            )


        # ---------------------------------
        # RETURN RESULT
        # ---------------------------------

        return result


    except HTTPException:

        raise


    except Exception as error:

        print(
            "RECONCILIATION ERROR:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Reconciliation failed: "
                f"{str(error)}"
            )
        )


# =====================================
# RECONAI FINANCE COPILOT
# =====================================

@app.post("/copilot")
def copilot(
    request: CopilotRequest
):

    try:

        if not request.question.strip():

            raise HTTPException(
                status_code=400,
                detail=(
                    "Question cannot be empty."
                )
            )


        result = (
            generate_copilot_response(
                request.question,
                request.reconciliation_result
            )
        )


        return result


    except HTTPException:

        raise


    except Exception as error:

        print(
            "COPILOT ERROR:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Copilot failed: "
                f"{str(error)}"
            )
        )


# =====================================
# PDF REPORT API
# =====================================

@app.post("/report/pdf")
def generate_report(
    reconciliation_result: dict
):

    try:

        if not reconciliation_result:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Reconciliation result is required."
                )
            )


        # ---------------------------------
        # GENERATE PDF
        # ---------------------------------

        pdf_buffer = (
            generate_pdf_report(
                reconciliation_result
            )
        )


        # ---------------------------------
        # RETURN PDF FILE
        # ---------------------------------

        return StreamingResponse(

            pdf_buffer,

            media_type="application/pdf",

            headers={

                "Content-Disposition": (
                    "attachment; "
                    "filename=ReconAI_Financial_Report.pdf"
                )

            }

        )


    except HTTPException:

        raise


    except Exception as error:

        print(
            "PDF REPORT ERROR:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "PDF report generation failed: "
                f"{str(error)}"
            )
        )


# =====================================
# GET ALL RECONCILIATION HISTORY
# =====================================

@app.get("/history")
def get_history():

    try:

        history = (
            get_reconciliation_history()
        )


        return {

            "total_records":
                len(history),

            "history":
                history

        }


    except Exception as error:

        print(
            "GET HISTORY ERROR:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to retrieve history: "
                f"{str(error)}"
            )
        )


# =====================================
# GET SINGLE HISTORY RECORD
# =====================================

@app.get("/history/{history_id}")
def get_history_record(
    history_id: str
):

    try:

        record = (
            get_history_by_id(
                history_id
            )
        )


        if record is None:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Reconciliation history "
                    "record not found."
                )
            )


        return record


    except HTTPException:

        raise


    except Exception as error:

        print(
            "GET HISTORY RECORD ERROR:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to retrieve history record: "
                f"{str(error)}"
            )
        )


# =====================================
# DELETE SINGLE HISTORY RECORD
# =====================================

@app.delete("/history/{history_id}")
def delete_history(
    history_id: str
):

    try:

        deleted = (
            delete_history_record(
                history_id
            )
        )


        if not deleted:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Reconciliation history "
                    "record not found."
                )
            )


        return {

            "message": (
                "Reconciliation history record "
                "deleted successfully."
            ),

            "history_id":
                history_id

        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "DELETE HISTORY ERROR:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to delete history record: "
                f"{str(error)}"
            )
        )


# =====================================
# CLEAR ALL HISTORY
# =====================================

@app.delete("/history")
def clear_history():

    try:

        clear_reconciliation_history()


        return {

            "message": (
                "All reconciliation history "
                "was cleared successfully."
            )

        }


    except Exception as error:

        print(
            "CLEAR HISTORY ERROR:",
            str(error)
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to clear history: "
                f"{str(error)}"
            )
        )