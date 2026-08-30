from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle
)
from reportlab.lib.units import inch
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    PageBreak
)


# =====================================
# HELPER FUNCTIONS
# =====================================

def safe_text(value, default="N/A"):
    """
    Safely convert a value to text.
    """

    if value is None:
        return default

    text = str(value).strip()

    if not text:
        return default

    # Escape characters that can break ReportLab XML
    text = text.replace("&", "&amp;")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")

    return text


def safe_amount(value):
    """
    Safely convert an amount to float.
    """

    try:
        return float(value or 0)

    except (TypeError, ValueError):
        return 0.0


# =====================================
# GENERATE RECONAI PDF REPORT
# =====================================

def generate_pdf_report(reconciliation_result):

    # =====================================
    # CREATE PDF BUFFER
    # =====================================

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()


    # =====================================
    # CUSTOM STYLES
    # =====================================

    title_style = ParagraphStyle(
        "ReconAITitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=24,
        leading=30,
        spaceAfter=8
    )

    subtitle_style = ParagraphStyle(
        "ReconAISubtitle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontSize=11,
        leading=15,
        spaceAfter=25
    )

    heading_style = ParagraphStyle(
        "ReconAIHeading",
        parent=styles["Heading2"],
        fontSize=15,
        leading=20,
        spaceBefore=18,
        spaceAfter=10
    )

    subheading_style = ParagraphStyle(
        "ReconAISubHeading",
        parent=styles["Heading3"],
        fontSize=12,
        leading=16,
        spaceBefore=12,
        spaceAfter=8
    )

    normal_style = ParagraphStyle(
        "ReconAINormal",
        parent=styles["Normal"],
        fontSize=10,
        leading=15,
        spaceAfter=6
    )

    small_style = ParagraphStyle(
        "ReconAISmall",
        parent=styles["Normal"],
        fontSize=8,
        leading=11
    )

    story = []


    # =====================================
    # EXTRACT DATA
    # =====================================

    if not isinstance(reconciliation_result, dict):

        reconciliation_result = {}

    summary = reconciliation_result.get(
        "summary",
        {}
    ) or {}

    exceptions = reconciliation_result.get(
        "exceptions",
        []
    ) or []

    matches = reconciliation_result.get(
        "matches",
        []
    ) or []

    investigations = reconciliation_result.get(
        "investigations",
        []
    ) or []


    # =====================================
    # CALCULATE METRICS
    # =====================================

    total_exposure = sum(
        safe_amount(
            exception.get(
                "amount_at_risk",
                0
            )
        )
        for exception in exceptions
    )

    risk_scores = [
        safe_amount(
            exception.get(
                "risk_score",
                0
            )
        )
        for exception in exceptions
    ]

    if risk_scores:

        overall_risk_score = round(
            sum(risk_scores)
            / len(risk_scores)
        )

    else:

        overall_risk_score = 0


    # =====================================
    # PRIORITY COUNTS
    # =====================================

    critical_count = sum(
        1
        for exception in exceptions
        if safe_text(
            exception.get(
                "priority",
                ""
            ),
            ""
        ).upper() == "CRITICAL"
    )

    high_count = sum(
        1
        for exception in exceptions
        if safe_text(
            exception.get(
                "priority",
                ""
            ),
            ""
        ).upper() == "HIGH"
    )

    medium_count = sum(
        1
        for exception in exceptions
        if safe_text(
            exception.get(
                "priority",
                ""
            ),
            ""
        ).upper() == "MEDIUM"
    )

    low_count = sum(
        1
        for exception in exceptions
        if safe_text(
            exception.get(
                "priority",
                ""
            ),
            ""
        ).upper() == "LOW"
    )


    # =====================================
    # DETERMINE FINANCE HEALTH
    # =====================================

    if critical_count > 0:

        finance_health = "ATTENTION REQUIRED"

    elif high_count > 0:

        finance_health = "HIGH PRIORITY REVIEW"

    elif medium_count > 0:

        finance_health = "REVIEW REQUIRED"

    elif low_count > 0:

        finance_health = "MINOR ISSUES DETECTED"

    else:

        finance_health = "HEALTHY"


    # =====================================
    # TITLE
    # =====================================

    story.append(
        Paragraph(
            "RECONAI",
            title_style
        )
    )

    story.append(
        Paragraph(
            "AI-Powered Financial Reconciliation Report",
            subtitle_style
        )
    )


    # =====================================
    # EXECUTIVE SUMMARY
    # =====================================

    story.append(
        Paragraph(
            "Executive Summary",
            heading_style
        )
    )

    executive_text = (
        f"ReconAI analyzed "
        f"<b>{safe_text(summary.get('bank_transactions', 0))}</b> "
        f"bank transactions and "
        f"<b>{safe_text(summary.get('ledger_transactions', 0))}</b> "
        f"ledger transactions. "
        f"The reconciliation process identified "
        f"<b>{len(exceptions)}</b> financial exception(s) "
        f"with a total financial exposure of "
        f"<b>Rs. {total_exposure:,.2f}</b>."
    )

    story.append(
        Paragraph(
            executive_text,
            normal_style
        )
    )

    story.append(
        Spacer(
            1,
            12
        )
    )

    health_text = (
        f"<b>Finance Health Status:</b> "
        f"{finance_health}"
    )

    story.append(
        Paragraph(
            health_text,
            normal_style
        )
    )


    # =====================================
    # FINANCIAL RISK SUMMARY
    # =====================================

    story.append(
        Paragraph(
            "Financial Risk Summary",
            heading_style
        )
    )

    risk_data = [
        [
            "Metric",
            "Value"
        ],

        [
            "Overall Risk Score",
            f"{overall_risk_score}/100"
        ],

        [
            "Total Financial Exposure",
            f"Rs. {total_exposure:,.2f}"
        ],

        [
            "Total Exceptions",
            str(len(exceptions))
        ],

        [
            "Critical Issues",
            str(critical_count)
        ],

        [
            "High Priority Issues",
            str(high_count)
        ],

        [
            "Medium Priority Issues",
            str(medium_count)
        ],

        [
            "Low Priority Issues",
            str(low_count)
        ]
    ]

    risk_table = Table(
        risk_data,
        colWidths=[
            3.5 * inch,
            2.0 * inch
        ],
        repeatRows=1
    )

    risk_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey
                ),

                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.black
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),

                (
                    "ALIGN",
                    (1, 1),
                    (1, -1),
                    "CENTER"
                ),

                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "MIDDLE"
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )
            ]
        )
    )

    story.append(
        risk_table
    )


    # =====================================
    # TRANSACTION OVERVIEW
    # =====================================

    story.append(
        Paragraph(
            "Transaction Overview",
            heading_style
        )
    )

    overview_data = [
        [
            "Metric",
            "Value"
        ],

        [
            "Bank Transactions",
            safe_text(
                summary.get(
                    "bank_transactions",
                    0
                )
            )
        ],

        [
            "Ledger Transactions",
            safe_text(
                summary.get(
                    "ledger_transactions",
                    0
                )
            )
        ],

        [
            "Successful Matches",
            safe_text(
                summary.get(
                    "total_matches",
                    len(matches)
                )
            )
        ],

        [
            "Exact Matches",
            safe_text(
                summary.get(
                    "exact_matches",
                    0
                )
            )
        ],

        [
            "Fuzzy Matches",
            safe_text(
                summary.get(
                    "fuzzy_matches",
                    0
                )
            )
        ],

        [
            "Settlement Delays",
            safe_text(
                summary.get(
                    "settlement_delays",
                    0
                )
            )
        ],

        [
            "Amount Mismatches",
            safe_text(
                summary.get(
                    "amount_mismatches",
                    0
                )
            )
        ],

        [
            "Possible Duplicates",
            safe_text(
                summary.get(
                    "possible_duplicates",
                    0
                )
            )
        ]
    ]

    overview_table = Table(
        overview_data,
        colWidths=[
            3.5 * inch,
            2.0 * inch
        ],
        repeatRows=1
    )

    overview_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.lightgrey
                ),

                (
                    "FONTNAME",
                    (0, 0),
                    (-1, 0),
                    "Helvetica-Bold"
                ),

                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.5,
                    colors.grey
                ),

                (
                    "ALIGN",
                    (1, 1),
                    (1, -1),
                    "CENTER"
                ),

                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    8
                )
            ]
        )
    )

    story.append(
        overview_table
    )


    # =====================================
    # FINANCIAL EXCEPTIONS
    # =====================================

    story.append(
        PageBreak()
    )

    story.append(
        Paragraph(
            "Financial Exceptions",
            heading_style
        )
    )

    if exceptions:

        priority_order = {
            "CRITICAL": 1,
            "HIGH": 2,
            "MEDIUM": 3,
            "LOW": 4
        }

        sorted_exceptions = sorted(
            exceptions,
            key=lambda item: priority_order.get(
                safe_text(
                    item.get(
                        "priority",
                        "LOW"
                    )
                ).upper(),
                5
            )
        )

        for index, exception in enumerate(
            sorted_exceptions,
            start=1
        ):

            exception_type = safe_text(
                exception.get(
                    "exception_type",
                    "UNKNOWN"
                )
            )

            priority = safe_text(
                exception.get(
                    "priority",
                    "LOW"
                )
            ).upper()

            risk_score = safe_amount(
                exception.get(
                    "risk_score",
                    0
                )
            )

            amount = safe_amount(
                exception.get(
                    "amount_at_risk",
                    0
                )
            )

            reason = safe_text(
                exception.get(
                    "reason",
                    "No reason available."
                )
            )

            action = safe_text(
                exception.get(
                    "recommended_action",
                    "Review transaction details."
                )
            )

            story.append(
                Paragraph(
                    f"{index}. {exception_type}",
                    subheading_style
                )
            )

            exception_data = [
                [
                    "Priority",
                    priority
                ],

                [
                    "Risk Score",
                    f"{risk_score:.0f}/100"
                ],

                [
                    "Amount at Risk",
                    f"Rs. {amount:,.2f}"
                ]
            ]

            exception_table = Table(
                exception_data,
                colWidths=[
                    2.0 * inch,
                    3.5 * inch
                ]
            )

            exception_table.setStyle(
                TableStyle(
                    [
                        (
                            "GRID",
                            (0, 0),
                            (-1, -1),
                            0.5,
                            colors.grey
                        ),

                        (
                            "BACKGROUND",
                            (0, 0),
                            (0, -1),
                            colors.whitesmoke
                        ),

                        (
                            "FONTNAME",
                            (0, 0),
                            (0, -1),
                            "Helvetica-Bold"
                        ),

                        (
                            "TOPPADDING",
                            (0, 0),
                            (-1, -1),
                            6
                        ),

                        (
                            "BOTTOMPADDING",
                            (0, 0),
                            (-1, -1),
                            6
                        )
                    ]
                )
            )

            story.append(
                exception_table
            )

            story.append(
                Spacer(
                    1,
                    8
                )
            )

            story.append(
                Paragraph(
                    f"<b>Reason:</b> {reason}",
                    normal_style
                )
            )

            story.append(
                Paragraph(
                    f"<b>Recommended Action:</b> {action}",
                    normal_style
                )
            )

            story.append(
                Spacer(
                    1,
                    12
                )
            )

    else:

        story.append(
            Paragraph(
                "No financial exceptions were detected. "
                "The reconciliation results currently appear healthy.",
                normal_style
            )
        )


    # =====================================
    # AI INVESTIGATION RESULTS
    # =====================================

    if investigations:

        story.append(
            PageBreak()
        )

        story.append(
            Paragraph(
                "AI Investigation Results",
                heading_style
            )
        )

        for index, investigation in enumerate(
            investigations,
            start=1
        ):

            exception_type = safe_text(
                investigation.get(
                    "exception_type",
                    "UNKNOWN"
                )
            )

            priority = safe_text(
                investigation.get(
                    "priority",
                    "MEDIUM"
                )
            )

            story.append(
                Paragraph(
                    f"{index}. {exception_type} ({priority})",
                    subheading_style
                )
            )

            analysis = safe_text(
                investigation.get(
                    "analysis",
                    "No analysis available."
                )
            )

            story.append(
                Paragraph(
                    f"<b>AI Analysis:</b> {analysis}",
                    normal_style
                )
            )


            # ---------------------------------
            # POSSIBLE CAUSES
            # ---------------------------------

            possible_causes = investigation.get(
                "possible_causes",
                []
            ) or []

            if possible_causes:

                story.append(
                    Spacer(
                        1,
                        5
                    )
                )

                story.append(
                    Paragraph(
                        "<b>Possible Causes:</b>",
                        normal_style
                    )
                )

                for cause in possible_causes:

                    story.append(
                        Paragraph(
                            f"• {safe_text(cause)}",
                            normal_style
                        )
                    )


            # ---------------------------------
            # INVESTIGATION STEPS
            # ---------------------------------

            investigation_steps = investigation.get(
                "investigation_steps",
                []
            ) or []

            if investigation_steps:

                story.append(
                    Spacer(
                        1,
                        5
                    )
                )

                story.append(
                    Paragraph(
                        "<b>Recommended Investigation Steps:</b>",
                        normal_style
                    )
                )

                for step_number, step in enumerate(
                    investigation_steps,
                    start=1
                ):

                    story.append(
                        Paragraph(
                            f"{step_number}. {safe_text(step)}",
                            normal_style
                        )
                    )

            story.append(
                Spacer(
                    1,
                    15
                )
            )


    # =====================================
    # RECONCILIATION RESULT
    # =====================================

    story.append(
        PageBreak()
    )

    story.append(
        Paragraph(
            "ReconAI Conclusion",
            heading_style
        )
    )

    if not exceptions:

        conclusion = (
            "ReconAI found no significant financial exceptions "
            "in the submitted reconciliation data. The available "
            "bank and ledger transactions appear to be reconciled "
            "successfully."
        )

    elif critical_count > 0:

        conclusion = (
            f"ReconAI identified {critical_count} critical financial "
            f"issue(s) requiring immediate investigation. "
            f"The total amount currently identified as financial "
            f"exposure is Rs. {total_exposure:,.2f}. "
            f"Priority should be given to critical discrepancies "
            f"before reviewing lower-risk exceptions."
        )

    else:

        conclusion = (
            f"ReconAI identified {len(exceptions)} financial "
            f"exception(s) with a total financial exposure of "
            f"Rs. {total_exposure:,.2f}. "
            f"The finance team should review the identified "
            f"exceptions and complete the recommended "
            f"investigation steps."
        )

    story.append(
        Paragraph(
            conclusion,
            normal_style
        )
    )


    # =====================================
    # DISCLAIMER
    # =====================================

    story.append(
        Spacer(
            1,
            20
        )
    )

    story.append(
        Paragraph(
            "Disclaimer",
            heading_style
        )
    )

    disclaimer = (
        "ReconAI provides automated financial reconciliation "
        "analysis and AI-assisted decision-support insights. "
        "The results in this report should be reviewed by "
        "qualified finance, accounting, audit, or other "
        "appropriate professionals before financial decisions "
        "are made."
    )

    story.append(
        Paragraph(
            disclaimer,
            small_style
        )
    )


    # =====================================
    # BUILD PDF
    # =====================================

    doc.build(
        story
    )

    buffer.seek(0)

    return buffer