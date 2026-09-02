import os

from fastapi import (
    FastAPI,
    HTTPException,
    Depends,
)

from fastapi.responses import StreamingResponse

from fastapi.middleware.cors import CORSMiddleware

from pydantic import BaseModel

from sqlalchemy.orm import Session

import pandas as pd


# ============================================================
# DATABASE
# ============================================================

from app.database import (
    Base,
    engine,
    get_db,
)


# ============================================================
# MODELS
# ============================================================

from app import models

from app.models import User


# ============================================================
# AUTHENTICATION
# ============================================================

from app.auth import (
    router as auth_router,
    get_current_user,
)


# ============================================================
# RECONCILIATION ENGINE
# ============================================================

from app.reconciliation.engine import (
    reconcile,
)


# ============================================================
# AI COPILOT
# ============================================================

from app.copilot import (
    generate_copilot_response,
)


# ============================================================
# PDF REPORT
# ============================================================

from app.report_generator import (
    generate_pdf_report,
)


# ============================================================
# HISTORY SERVICE
# ============================================================

from app.services.history_service import (
    add_reconciliation_history,
    get_reconciliation_history,
    get_history_by_id,
    delete_history_record,
    clear_reconciliation_history,
)


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="ReconAI API",
    description=(
        "AI-Powered Financial Reconciliation, "
        "Investigation and Reporting API"
    ),
    version="1.0.0",
)


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

Base.metadata.create_all(bind=engine)


# ============================================================
# AUTHENTICATION ROUTER
# ============================================================

app.include_router(auth_router)


# ============================================================
# CORS CONFIGURATION
# ============================================================

# Get frontend URL from Railway environment variable.
#
# Railway:
# FRONTEND_URL=https://recon-ai-one.vercel.app
#
# We also keep the Vercel URL explicitly here so the application
# continues working even if the environment variable is missing.

frontend_url = os.getenv(
    "FRONTEND_URL",
    "https://recon-ai-one.vercel.app",
).strip().rstrip("/")


allowed_origins = [
    # Production Vercel frontend
    "https://recon-ai-one.vercel.app",

    # Environment-based frontend URL
    frontend_url,

    # Local development
    "http://localhost:3000",
    "http://127.0.0.1:3000",

    # LAN frontend
    "http://192.168.56.1:3000",

    # Vite development server
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.56.1:5173",
]

# Remove duplicates while preserving order
allowed_origins = list(dict.fromkeys(allowed_origins))


app.add_middleware(
    CORSMiddleware,

    allow_origins=allowed_origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# REQUEST MODELS
# ============================================================


class ReconciliationRequest(BaseModel):

    bank_transactions: list

    ledger_transactions: list


class CopilotRequest(BaseModel):

    question: str

    reconciliation_result: dict


# ============================================================
# HOME / HEALTH CHECK
# ============================================================


@app.get("/")
def home():

    return {
        "message": "ReconAI Backend is Running Successfully",

        "features": [
            "Authentication",
            "Financial Reconciliation",
            "AI Finance Copilot",
            "PDF Financial Reports",
            "MySQL Reconciliation History",
        ],
    }


# ============================================================
# RECONCILIATION
# ============================================================


@app.post("/reconcile")
def reconcile_data(

    request: ReconciliationRequest,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):

    try:

        # ====================================================
        # VALIDATE BANK TRANSACTIONS
        # ====================================================

        if not request.bank_transactions:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Bank transactions "
                    "cannot be empty."
                ),
            )


        # ====================================================
        # VALIDATE LEDGER TRANSACTIONS
        # ====================================================

        if not request.ledger_transactions:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Ledger transactions "
                    "cannot be empty."
                ),
            )


        # ====================================================
        # CONVERT BANK DATA TO DATAFRAME
        # ====================================================

        bank_df = pd.DataFrame(
            request.bank_transactions
        )


        # ====================================================
        # CONVERT LEDGER DATA TO DATAFRAME
        # ====================================================

        ledger_df = pd.DataFrame(
            request.ledger_transactions
        )


        # ====================================================
        # RUN RECONCILIATION ENGINE
        # ====================================================

        result = reconcile(
            bank_df,
            ledger_df,
        )


        # ====================================================
        # VALIDATE RECONCILIATION RESULT
        # ====================================================

        if result is None:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Reconciliation engine "
                    "returned no result."
                ),
            )


        if not isinstance(result, dict):

            raise HTTPException(
                status_code=500,
                detail=(
                    "Reconciliation engine "
                    "returned an invalid result."
                ),
            )


        # ====================================================
        # SAVE RECONCILIATION TO MYSQL
        # ====================================================

        history_record = add_reconciliation_history(

            db=db,

            reconciliation_result=result,

            user_id=current_user.id,

        )


        # ====================================================
        # ADD HISTORY INFORMATION TO RESULT
        # ====================================================

        if history_record:

            result["history_id"] = (
                history_record.get("id")
            )


            created_at = (
                history_record.get(
                    "created_at"
                )
            )


            if created_at is not None:

                if hasattr(
                    created_at,
                    "isoformat",
                ):

                    result["created_at"] = (
                        created_at.isoformat()
                    )

                else:

                    result["created_at"] = str(
                        created_at
                    )


        # ====================================================
        # RETURN RECONCILIATION RESULT
        # ====================================================

        return result


    except HTTPException:

        raise


    except Exception as error:

        # ====================================================
        # ROLLBACK DATABASE
        # ====================================================

        try:

            db.rollback()

        except Exception:

            pass


        # ====================================================
        # LOG ERROR
        # ====================================================

        print(
            "====================================="
        )

        print(
            "RECONCILIATION ERROR:",
            str(error),
        )

        print(
            "====================================="
        )


        # ====================================================
        # RETURN ERROR
        # ====================================================

        raise HTTPException(
            status_code=500,
            detail=(
                "Reconciliation failed: "
                f"{str(error)}"
            ),
        )


# ============================================================
# AI FINANCE COPILOT
# ============================================================


@app.post("/copilot")
def copilot(

    request: CopilotRequest,

    current_user: User = Depends(
        get_current_user
    ),

):

    try:

        # ====================================================
        # VALIDATE QUESTION
        # ====================================================

        if not request.question.strip():

            raise HTTPException(
                status_code=400,
                detail=(
                    "Question cannot be empty."
                ),
            )


        # ====================================================
        # GENERATE AI RESPONSE
        # ====================================================

        result = generate_copilot_response(
            request.question,
            request.reconciliation_result,
        )


        # ====================================================
        # RETURN AI RESPONSE
        # ====================================================

        return result


    except HTTPException:

        raise


    except Exception as error:

        print(
            "COPILOT ERROR:",
            str(error),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Copilot failed: "
                f"{str(error)}"
            ),
        )


# ============================================================
# PDF REPORT
# ============================================================


@app.post("/report/pdf")
def generate_report(

    reconciliation_result: dict,

    current_user: User = Depends(
        get_current_user
    ),

):

    try:

        # ====================================================
        # VALIDATE RESULT
        # ====================================================

        if not reconciliation_result:

            raise HTTPException(
                status_code=400,
                detail=(
                    "Reconciliation result "
                    "is required."
                ),
            )


        # ====================================================
        # GENERATE PDF
        # ====================================================

        pdf_buffer = generate_pdf_report(
            reconciliation_result
        )


        # ====================================================
        # RETURN PDF
        # ====================================================

        return StreamingResponse(

            pdf_buffer,

            media_type="application/pdf",

            headers={
                "Content-Disposition": (
                    "attachment; "
                    "filename="
                    "ReconAI_Financial_Report.pdf"
                ),
            },

        )


    except HTTPException:

        raise


    except Exception as error:

        print(
            "PDF REPORT ERROR:",
            str(error),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "PDF report generation failed: "
                f"{str(error)}"
            ),
        )


# ============================================================
# GET ALL HISTORY FOR CURRENT USER
# ============================================================


@app.get("/history")
def get_history(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):

    try:

        # ====================================================
        # GET ONLY CURRENT USER'S HISTORY
        # ====================================================

        history = get_reconciliation_history(

            db=db,

            user_id=current_user.id,

        )


        # ====================================================
        # RETURN HISTORY
        # ====================================================

        return {

            "total_records": len(history),

            "history": history,

        }


    except Exception as error:

        print(
            "GET HISTORY ERROR:",
            str(error),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to retrieve history: "
                f"{str(error)}"
            ),
        )


# ============================================================
# GET SINGLE HISTORY RECORD
# ============================================================


@app.get("/history/{history_id}")
def get_history_record(

    history_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):

    try:

        # ====================================================
        # GET RECORD
        # ====================================================

        record = get_history_by_id(

            db=db,

            history_id=history_id,

            user_id=current_user.id,

        )


        # ====================================================
        # RECORD NOT FOUND
        # ====================================================

        if record is None:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Reconciliation history "
                    "record not found."
                ),
            )


        # ====================================================
        # RETURN RECORD
        # ====================================================

        return record


    except HTTPException:

        raise


    except Exception as error:

        print(
            "GET HISTORY RECORD ERROR:",
            str(error),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to retrieve history record: "
                f"{str(error)}"
            ),
        )


# ============================================================
# DELETE SINGLE HISTORY RECORD
# ============================================================


@app.delete("/history/{history_id}")
def delete_history(

    history_id: int,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):

    try:

        # ====================================================
        # DELETE ONLY IF RECORD BELONGS TO CURRENT USER
        # ====================================================

        deleted = delete_history_record(

            db=db,

            history_id=history_id,

            user_id=current_user.id,

        )


        # ====================================================
        # RECORD NOT FOUND
        # ====================================================

        if not deleted:

            raise HTTPException(
                status_code=404,
                detail=(
                    "Reconciliation history "
                    "record not found."
                ),
            )


        # ====================================================
        # RETURN SUCCESS
        # ====================================================

        return {

            "message": (
                "Reconciliation history record "
                "deleted successfully."
            ),

            "history_id": history_id,

        }


    except HTTPException:

        raise


    except Exception as error:

        print(
            "DELETE HISTORY ERROR:",
            str(error),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to delete history record: "
                f"{str(error)}"
            ),
        )


# ============================================================
# CLEAR ALL HISTORY FOR CURRENT USER
# ============================================================


@app.delete("/history")
def clear_history(

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    ),

):

    try:

        # ====================================================
        # DELETE CURRENT USER'S HISTORY
        # ====================================================

        deleted_count = clear_reconciliation_history(

            db=db,

            user_id=current_user.id,

        )


        # ====================================================
        # RETURN SUCCESS
        # ====================================================

        return {

            "message": (
                "All reconciliation history "
                "was cleared successfully."
            ),

            "deleted_count": deleted_count,

        }


    except Exception as error:

        print(
            "CLEAR HISTORY ERROR:",
            str(error),
        )


        raise HTTPException(
            status_code=500,
            detail=(
                "Failed to clear history: "
                f"{str(error)}"
            ),
        )