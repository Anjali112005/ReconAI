import streamlit as st
import pandas as pd
import requests


# =====================================
# PAGE CONFIGURATION
# =====================================

st.set_page_config(
    page_title="ReconAI - AI Finance Controller",
    page_icon="💰",
    layout="wide"
)


# =====================================
# TITLE
# =====================================

st.title("💰 ReconAI")

st.subheader(
    "AI-Powered Financial Reconciliation & Investigation"
)

st.markdown(
    """
    Upload your bank statement and internal ledger.
    ReconAI automatically detects matches, discrepancies,
    duplicates, settlement delays, and financial risks.
    """
)


# =====================================
# SIDEBAR
# =====================================

with st.sidebar:

    st.header("📂 Upload Financial Data")

    bank_file = st.file_uploader(
        "Upload Bank Statement CSV",
        type=["csv"]
    )

    ledger_file = st.file_uploader(
        "Upload Internal Ledger CSV",
        type=["csv"]
    )

    run_button = st.button(
        "🚀 Run ReconAI",
        use_container_width=True
    )


# =====================================
# API FUNCTION
# =====================================

def run_reconciliation(bank_df, ledger_df):

    # Replace missing values with None
    bank_df = bank_df.astype(object)
    bank_df = bank_df.where(
        pd.notna(bank_df),
        None
    )

    ledger_df = ledger_df.astype(object)
    ledger_df = ledger_df.where(
        pd.notna(ledger_df),
        None
    )

    # Convert to JSON-compatible records
    bank_records = bank_df.to_dict(
        orient="records"
    )

    ledger_records = ledger_df.to_dict(
        orient="records"
    )

    # Send data to FastAPI
    response = requests.post(
        "http://127.0.0.1:8000/reconcile",
        json={
            "bank_transactions": bank_records,
            "ledger_transactions": ledger_records
        },
        timeout=30
    )

    # Show an error if API returns an error
    response.raise_for_status()

    return response.json()


# =====================================
# RUN RECONCILIATION
# =====================================

if run_button:

    if bank_file is None:

        st.error(
            "Please upload the Bank Statement CSV."
        )

    elif ledger_file is None:

        st.error(
            "Please upload the Internal Ledger CSV."
        )

    else:

        try:

            st.info(
                "📂 Reading financial data..."
            )

            bank_df = pd.read_csv(
                bank_file
            )

            ledger_df = pd.read_csv(
                ledger_file
            )

            st.info(
                "🤖 ReconAI is analyzing transactions..."
            )

            with st.spinner(
                "ReconAI is processing financial data..."
            ):

                result = run_reconciliation(
                    bank_df,
                    ledger_df
                )

            # Save result
            st.session_state[
                "recon_result"
            ] = result

            st.success(
                "✅ ReconAI analysis completed successfully!"
            )

        except requests.exceptions.ConnectionError:

            st.error(
                "❌ Cannot connect to the ReconAI backend. "
                "Make sure FastAPI is running on port 8000."
            )

        except requests.exceptions.HTTPError as error:

            st.error(
                f"❌ Backend API error: {error}"
            )

            if error.response is not None:

                st.code(
                    error.response.text
                )

        except Exception as error:

            st.error(
                f"❌ ReconAI Error: {error}"
            )


# =====================================
# DISPLAY RESULTS
# =====================================

if "recon_result" in st.session_state:

    result = st.session_state[
        "recon_result"
    ]

    summary = result.get(
        "summary",
        {}
    )

    st.divider()

    st.header("📊 Financial Overview")


    # =====================================
    # METRICS
    # =====================================

    col1, col2, col3, col4 = st.columns(4)

    with col1:

        st.metric(
            "Bank Transactions",
            summary.get(
                "bank_transactions",
                0
            )
        )

    with col2:

        st.metric(
            "Ledger Transactions",
            summary.get(
                "ledger_transactions",
                0
            )
        )

    with col3:

        st.metric(
            "Successful Matches",
            summary.get(
                "total_matches",
                0
            )
        )

    with col4:

        st.metric(
            "Exceptions",
            summary.get(
                "exceptions",
                0
            )
        )


    # =====================================
    # MATCH RATE
    # =====================================

    bank_transactions = summary.get(
        "bank_transactions",
        0
    )

    total_matches = summary.get(
        "total_matches",
        0
    )

    if bank_transactions > 0:

        match_rate = (
            total_matches
            / bank_transactions
        ) * 100

    else:

        match_rate = 0


    st.progress(
        int(match_rate)
    )

    st.write(
        f"### Match Rate: {match_rate:.1f}%"
    )


    # =====================================
    # RECONCILIATION BREAKDOWN
    # =====================================

    st.header(
        "🔍 Reconciliation Breakdown"
    )

    col1, col2, col3 = st.columns(3)

    with col1:

        st.metric(
            "Exact Matches",
            summary.get(
                "exact_matches",
                0
            )
        )

        st.metric(
            "Fuzzy Matches",
            summary.get(
                "fuzzy_matches",
                0
            )
        )

    with col2:

        st.metric(
            "Settlement Delays",
            summary.get(
                "settlement_delays",
                0
            )
        )

        st.metric(
            "Amount Mismatches",
            summary.get(
                "amount_mismatches",
                0
            )
        )

    with col3:

        st.metric(
            "Possible Duplicates",
            summary.get(
                "possible_duplicates",
                0
            )
        )

        st.metric(
            "Exceptions",
            summary.get(
                "exceptions",
                0
            )
        )


    # =====================================
    # TABS
    # =====================================

    tab1, tab2, tab3 = st.tabs(
        [
            "✅ Matches",
            "⚠️ Exceptions",
            "🤖 AI Investigation"
        ]
    )


    # =====================================
    # MATCHES
    # =====================================

    with tab1:

        matches = result.get(
            "matches",
            []
        )

        if matches:

            st.dataframe(
                pd.DataFrame(matches),
                use_container_width=True
            )

        else:

            st.info(
                "No successful matches found."
            )


    # =====================================
    # EXCEPTIONS
    # =====================================

    with tab2:

        exceptions = result.get(
            "exceptions",
            []
        )

        if exceptions:

            for exception in exceptions:

                priority = exception.get(
                    "priority",
                    "LOW"
                )

                st.subheader(
                    f"{priority} — "
                    f"{exception.get('exception_type')}"
                )

                col1, col2, col3 = st.columns(3)

                with col1:

                    st.metric(
                        "Risk Score",
                        exception.get(
                            "risk_score",
                            0
                        )
                    )

                with col2:

                    amount = exception.get(
                        "amount_at_risk",
                        0
                    )

                    st.metric(
                        "Amount at Risk",
                        f"₹{amount:,.2f}"
                    )

                with col3:

                    st.metric(
                        "Priority",
                        priority
                    )

                st.write(
                    "**Reason:** "
                    + str(
                        exception.get(
                            "reason",
                            ""
                        )
                    )
                )

                st.write(
                    "**Recommended Action:** "
                    + str(
                        exception.get(
                            "recommended_action",
                            ""
                        )
                    )
                )

                st.divider()

        else:

            st.success(
                "🎉 No financial exceptions detected!"
            )


    # =====================================
    # AI INVESTIGATION
    # =====================================

    with tab3:

        investigations = result.get(
            "investigations",
            []
        )

        if investigations:

            for investigation in investigations:

                priority = investigation.get(
                    "priority",
                    "MEDIUM"
                )

                with st.expander(
                    f"{priority} — "
                    f"{investigation.get('exception_type')}"
                ):

                    st.metric(
                        "Risk Score",
                        investigation.get(
                            "risk_score",
                            0
                        )
                    )

                    amount = investigation.get(
                        "amount_at_risk",
                        0
                    )

                    st.metric(
                        "Amount at Risk",
                        f"₹{amount:,.2f}"
                    )

                    st.subheader(
                        "AI Analysis"
                    )

                    st.write(
                        investigation.get(
                            "analysis",
                            ""
                        )
                    )

                    st.subheader(
                        "Possible Causes"
                    )

                    for cause in investigation.get(
                        "possible_causes",
                        []
                    ):

                        st.write(
                            f"• {cause}"
                        )

                    st.subheader(
                        "Recommended Investigation"
                    )

                    for index, step in enumerate(
                        investigation.get(
                            "investigation_steps",
                            []
                        ),
                        start=1
                    ):

                        st.write(
                            f"{index}. {step}"
                        )

        else:

            st.info(
                "No AI investigations available."
            )