import os
import json

from dotenv import load_dotenv
from google import genai


# =====================================
# LOAD ENVIRONMENT VARIABLES
# =====================================

load_dotenv()

GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)


# =====================================
# CREATE GEMINI CLIENT
# =====================================

client = None

if GEMINI_API_KEY:

    try:

        client = genai.Client(
            api_key=GEMINI_API_KEY
        )

        print(
            "Gemini AI client initialized successfully."
        )

    except Exception as error:

        print(
            "Failed to initialize Gemini client:",
            str(error)
        )

        client = None

else:

    print(
        "GEMINI_API_KEY not found. "
        "ReconAI will use the rule-based fallback."
    )


# =====================================
# HELPER FUNCTION
# CONVERT VALUE TO FLOAT SAFELY
# =====================================

def get_float_value(value):

    try:

        return float(
            value or 0
        )

    except (
        TypeError,
        ValueError
    ):

        return 0.0


# =====================================
# RULE-BASED FALLBACK RESPONSE
# =====================================

def generate_fallback_response(
    question,
    reconciliation_result
):

    # ---------------------------------
    # NORMALIZE QUESTION
    # ---------------------------------

    question = (
        question
        .lower()
        .strip()
    )


    # =====================================
    # GENERAL CONVERSATION
    # =====================================

    if any(
        phrase in question
        for phrase in [
            "about yourself",
            "about you",
            "who are you",
            "tell me about yourself",
            "what are you",
            "introduce yourself",
            "introduce you"
        ]
    ):

        return (
            "👋 **Hi! I'm ReconAI Finance Copilot.**\n\n"

            "I am an AI-powered financial reconciliation "
            "assistant designed to help finance teams understand "
            "their reconciliation data, financial risks, and "
            "transaction discrepancies.\n\n"

            "**I can help you with:**\n\n"

            "• 📊 Understanding reconciliation results\n"
            "• 💰 Calculating financial exposure\n"
            "• ⚠️ Explaining exceptions and discrepancies\n"
            "• 🚨 Identifying high-risk transactions\n"
            "• 🔍 Suggesting what to investigate first\n"
            "• 📈 Explaining reconciliation match rates\n"
            "• 🧠 Providing investigation insights\n"
            "• 📋 Creating executive-level financial summaries\n\n"

            "Ask me anything about your reconciliation analysis, "
            "and I will help you understand what the data means."
        )


    # =====================================
    # GREETINGS
    # =====================================

    if any(
        phrase in question
        for phrase in [
            "hello",
            "hi",
            "hey",
            "good morning",
            "good afternoon",
            "good evening"
        ]
    ):

        return (
            "👋 **Hello! I'm ReconAI Finance Copilot.**\n\n"

            "I can help you analyze your reconciliation results, "
            "understand financial exceptions, identify risks, "
            "calculate exposure, and prioritize investigations.\n\n"

            "What would you like to know?"
        )


    # =====================================
    # WHAT CAN YOU DO?
    # =====================================

    if any(
        phrase in question
        for phrase in [
            "what can you do",
            "how can you help",
            "help me",
            "your capabilities",
            "features",
            "what do you do"
        ]
    ):

        return (
            "🤖 **I can help you analyze your reconciliation data.**\n\n"

            "**My capabilities include:**\n\n"

            "• Explaining reconciliation results\n"
            "• Identifying financial exceptions\n"
            "• Calculating total financial exposure\n"
            "• Finding high-risk transactions\n"
            "• Prioritizing investigations\n"
            "• Explaining transaction discrepancies\n"
            "• Calculating reconciliation match rates\n"
            "• Providing executive financial summaries\n"
            "• Highlighting important financial patterns\n\n"

            "Try asking me a question about your current "
            "reconciliation analysis."
        )


    # =====================================
    # GET RECONCILIATION DATA
    # =====================================

    exceptions = reconciliation_result.get(
        "exceptions",
        []
    )

    summary = reconciliation_result.get(
        "summary",
        {}
    )


    # =====================================
    # NO EXCEPTIONS
    # =====================================

    if not exceptions:

        return (
            "🟢 **Financial Status: Healthy**\n\n"

            "ReconAI found no financial exceptions in the "
            "current reconciliation results.\n\n"

            "The available financial data appears to be "
            "reconciled successfully."
        )


    # =====================================
    # CALCULATE FINANCIAL EXPOSURE
    # =====================================

    total_risk = sum(

        get_float_value(
            item.get(
                "amount_at_risk",
                0
            )
        )

        for item in exceptions

    )


    # =====================================
    # GROUP ISSUES BY PRIORITY
    # =====================================

    critical_issues = [

        item

        for item in exceptions

        if str(
            item.get(
                "priority",
                ""
            )
        ).upper() == "CRITICAL"

    ]


    high_issues = [

        item

        for item in exceptions

        if str(
            item.get(
                "priority",
                ""
            )
        ).upper() == "HIGH"

    ]


    medium_issues = [

        item

        for item in exceptions

        if str(
            item.get(
                "priority",
                ""
            )
        ).upper() == "MEDIUM"

    ]


    low_issues = [

        item

        for item in exceptions

        if str(
            item.get(
                "priority",
                ""
            )
        ).upper() == "LOW"

    ]


    # =====================================
    # IDENTIFY HIGHEST-RISK EXCEPTION
    # =====================================

    highest_risk = max(

        exceptions,

        key=lambda item: (

            get_float_value(
                item.get(
                    "risk_score",
                    0
                )
            ),

            get_float_value(
                item.get(
                    "amount_at_risk",
                    0
                )
            )

        )

    )


    # =====================================
    # BIGGEST / HIGHEST FINANCIAL RISK
    # =====================================

    if any(
        keyword in question
        for keyword in [
            "biggest",
            "highest",
            "largest",
            "financial risk",
            "critical",
            "main risk",
            "top risk"
        ]
    ):

        return (
            f"🚨 **Highest Financial Risk: "
            f"{highest_risk.get('exception_type', 'UNKNOWN')}**\n\n"

            f"**Priority:** "
            f"{highest_risk.get('priority', 'UNKNOWN')}\n\n"

            f"**Risk Score:** "
            f"{highest_risk.get('risk_score', 0)}/100\n\n"

            f"**Amount at Risk:** "
            f"₹{get_float_value(highest_risk.get('amount_at_risk')):,.2f}\n\n"

            f"**Reason:** "
            f"{highest_risk.get('reason', 'No reason available.')}\n\n"

            f"**Recommended Action:** "
            f"{highest_risk.get('recommended_action', 'Review transaction details.')}"
        )


    # =====================================
    # TOTAL FINANCIAL EXPOSURE
    # =====================================

    if any(
        keyword in question
        for keyword in [
            "money",
            "amount",
            "exposure",
            "total risk",
            "total financial",
            "how much",
            "financial amount",
            "money at risk"
        ]
    ):

        return (
            f"💰 **Total Financial Exposure: "
            f"₹{total_risk:,.2f}**\n\n"

            f"ReconAI detected "
            f"**{len(exceptions)} financial exception(s)**.\n\n"

            f"🔴 Critical Issues: "
            f"{len(critical_issues)}\n\n"

            f"🟠 High Priority Issues: "
            f"{len(high_issues)}\n\n"

            f"🟡 Medium Priority Issues: "
            f"{len(medium_issues)}\n\n"

            f"🟢 Low Priority Issues: "
            f"{len(low_issues)}"
        )


    # =====================================
    # INVESTIGATION PRIORITY
    # =====================================

    if any(
        keyword in question
        for keyword in [
            "investigate",
            "what should",
            "priority",
            "first",
            "action",
            "start with",
            "focus on",
            "important"
        ]
    ):

        if critical_issues:

            issue = critical_issues[0]

        elif high_issues:

            issue = high_issues[0]

        elif medium_issues:

            issue = medium_issues[0]

        else:

            issue = low_issues[0]


        return (
            f"🔍 **Investigate This First: "
            f"{issue.get('exception_type', 'UNKNOWN')}**\n\n"

            f"**Priority:** "
            f"{issue.get('priority', 'UNKNOWN')}\n\n"

            f"**Risk Score:** "
            f"{issue.get('risk_score', 0)}/100\n\n"

            f"**Amount at Risk:** "
            f"₹{get_float_value(issue.get('amount_at_risk')):,.2f}\n\n"

            f"**Why This Should Be Investigated First:** "
            f"{issue.get('reason', 'This issue has been prioritized based on financial risk.')}\n\n"

            f"**Recommended Action:** "
            f"{issue.get('recommended_action', 'Review transaction details.')}"
        )


    # =====================================
    # EXCEPTIONS QUESTION
    # =====================================

    if any(
        keyword in question
        for keyword in [
            "exception",
            "issues",
            "problems",
            "discrepancy",
            "discrepancies"
        ]
    ):

        response = (
            f"⚠️ **ReconAI identified "
            f"{len(exceptions)} financial exception(s):**\n\n"
        )


        for index, exception in enumerate(
            exceptions,
            start=1
        ):

            response += (
                f"**{index}. "
                f"{exception.get('exception_type', 'UNKNOWN')}**\n\n"

                f"• Priority: "
                f"{exception.get('priority', 'UNKNOWN')}\n\n"

                f"• Risk Score: "
                f"{exception.get('risk_score', 0)}/100\n\n"

                f"• Amount at Risk: ₹"
                f"{get_float_value(exception.get('amount_at_risk')):,.2f}\n\n"
            )


        return response


    # =====================================
    # FINANCIAL SUMMARY
    # =====================================

    if any(
        keyword in question
        for keyword in [
            "report",
            "summary",
            "overview",
            "situation",
            "cfo",
            "financial summary",
            "executive"
        ]
    ):

        bank_transactions = summary.get(
            "bank_transactions",
            0
        )

        ledger_transactions = summary.get(
            "ledger_transactions",
            0
        )

        total_matches = summary.get(
            "total_matches",
            0
        )


        match_rate = 0


        if bank_transactions:

            try:

                match_rate = (
                    float(total_matches)
                    / float(bank_transactions)
                ) * 100

            except (
                TypeError,
                ValueError,
                ZeroDivisionError
            ):

                match_rate = 0


        return (
            "📊 **RECONAI EXECUTIVE FINANCIAL SUMMARY**\n\n"

            "### Transaction Overview\n\n"

            f"• Bank Transactions: "
            f"{bank_transactions}\n\n"

            f"• Ledger Transactions: "
            f"{ledger_transactions}\n\n"

            f"• Successful Matches: "
            f"{total_matches}\n\n"

            f"• Match Rate: "
            f"{match_rate:.1f}%\n\n"

            "### Financial Risk Summary\n\n"

            f"• Total Exceptions: "
            f"{len(exceptions)}\n\n"

            f"• 🔴 Critical Issues: "
            f"{len(critical_issues)}\n\n"

            f"• 🟠 High Priority Issues: "
            f"{len(high_issues)}\n\n"

            f"• 🟡 Medium Priority Issues: "
            f"{len(medium_issues)}\n\n"

            f"• 🟢 Low Priority Issues: "
            f"{len(low_issues)}\n\n"

            f"• Total Financial Exposure: "
            f"₹{total_risk:,.2f}\n\n"

            "### Priority Recommendation\n\n"

            f"Prioritize investigation of "
            f"**{highest_risk.get('exception_type', 'UNKNOWN')}** "
            f"because it currently represents the highest "
            f"financial risk identified in the reconciliation data."
        )


    # =====================================
    # MATCH RATE QUESTION
    # =====================================

    if any(
        keyword in question
        for keyword in [
            "match rate",
            "matching",
            "matches",
            "matched",
            "reconciliation rate",
            "how many transactions matched"
        ]
    ):

        bank_transactions = summary.get(
            "bank_transactions",
            0
        )

        total_matches = summary.get(
            "total_matches",
            0
        )


        match_rate = 0


        if bank_transactions:

            try:

                match_rate = (
                    float(total_matches)
                    / float(bank_transactions)
                ) * 100

            except (
                TypeError,
                ValueError,
                ZeroDivisionError
            ):

                match_rate = 0


        return (
            f"📈 **Reconciliation Match Rate: "
            f"{match_rate:.1f}%**\n\n"

            f"• Total Bank Transactions: "
            f"{bank_transactions}\n\n"

            f"• Successful Matches: "
            f"{total_matches}\n\n"

            f"• Financial Exceptions: "
            f"{len(exceptions)}"
        )


    # =====================================
    # DEFAULT RESPONSE
    # =====================================

    return (
        "🤖 I can help you understand your current "
        "reconciliation results.\n\n"

        "You can ask me questions such as:\n\n"

        "• What is my biggest financial risk?\n\n"

        "• How much money is at risk?\n\n"

        "• What should I investigate first?\n\n"

        "• Show me all financial exceptions.\n\n"

        "• What is my reconciliation match rate?\n\n"

        "• Give me an executive financial summary.\n\n"

        "• Can you tell me about yourself?"
    )


# =====================================
# BUILD FINANCIAL CONTEXT
# =====================================

def build_finance_context(
    reconciliation_result
):

    summary = reconciliation_result.get(
        "summary",
        {}
    )

    exceptions = reconciliation_result.get(
        "exceptions",
        []
    )

    matches = reconciliation_result.get(
        "matches",
        []
    )

    investigations = reconciliation_result.get(
        "investigations",
        []
    )


    context = {

        "summary":
            summary,

        "exceptions":
            exceptions,

        "matches":
            matches,

        "investigations":
            investigations

    }


    return json.dumps(

        context,

        indent=2,

        default=str

    )


# =====================================
# MAIN AI COPILOT FUNCTION
# =====================================

def generate_copilot_response(
    question,
    reconciliation_result
):

    # =====================================
    # VALIDATE QUESTION
    # =====================================

    if not question or not question.strip():

        return (
            "Please ask me a question."
        )


    # =====================================
    # BUILD FINANCIAL CONTEXT
    # =====================================

    financial_context = build_finance_context(
        reconciliation_result
    )


    # =====================================
    # AI PROMPT
    # =====================================

    prompt = f"""
You are ReconAI Finance Copilot, an AI-powered
financial reconciliation assistant.

You help finance teams understand reconciliation
results, financial discrepancies, risk exposure,
and investigation priorities.

IMPORTANT RULES:

1. For questions about financial data, use ONLY
   the reconciliation data provided below.

2. For general questions about yourself, explain
   that you are ReconAI Finance Copilot and describe
   your role and capabilities.

3. Never invent transactions, amounts, dates,
   financial risks, or financial conclusions.

4. Clearly explain financial discrepancies.

5. Prioritize CRITICAL issues over HIGH, MEDIUM,
   and LOW issues.

6. Give practical and actionable recommendations.

7. Use Indian Rupees (₹) when discussing money.

8. Be concise, professional, and easy to understand.

9. For CFO or executive questions, provide an
   executive-level analysis.

10. Identify patterns when multiple exceptions exist.

11. Explain why an issue matters to the business.

12. Clearly distinguish between facts from the
    data and reasonable interpretations.

13. Do not claim to replace an accountant, auditor,
    or financial professional.

14. If a financial answer cannot be determined
    from the provided reconciliation data,
    clearly say so.

15. You may answer general questions about
    ReconAI, its purpose, and its capabilities.

16. If the user asks a greeting or casual question,
    respond naturally and professionally.

RECONCILIATION DATA:

{financial_context}

USER QUESTION:

{question}

INSTRUCTIONS:

For financial questions, answer using the
reconciliation data provided above.

For general questions about ReconAI, answer based
on your defined role and capabilities.

Do not invent financial information.
"""


    # =====================================
    # USE GEMINI IF AVAILABLE
    # =====================================

    if GEMINI_API_KEY and client is not None:

        try:

            print(
                "Calling Gemini AI..."
            )


            response = (
                client.models.generate_content(
                    model="gemini-3.6-flash",
                    contents=prompt
                )
            )


            answer = getattr(
                response,
                "text",
                None
            )


            if not answer or not answer.strip():

                raise ValueError(
                    "Gemini returned an empty response."
                )


            print(
                "Gemini AI response received successfully."
            )


            return answer.strip()


        except Exception as error:

            print(
                "Gemini error:",
                str(error)
            )


            fallback = (
                generate_fallback_response(
                    question,
                    reconciliation_result
                )
            )


            return (
                fallback
                + "\n\n⚠️ **Gemini AI analysis is temporarily "
                "unavailable, so ReconAI used its built-in "
                "financial analysis engine.**"
            )


    # =====================================
    # FALLBACK
    # =====================================

    print(
        "Using rule-based ReconAI fallback."
    )


    return generate_fallback_response(
        question,
        reconciliation_result
    )