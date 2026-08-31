import React, { useMemo, useState } from 'react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  FileText,
  Download,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { formatCurrency } from '../utils/formatCurrency';
import { useRecon } from '../context/ReconContext';


export const Reports = () => {
  /* =========================================
     CONTEXT
  ========================================= */

  const { reconciliationResult } = useRecon();


  /* =========================================
     STATE
  ========================================= */

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);


  /* =========================================
     SUMMARY
  ========================================= */

  const summary = reconciliationResult?.summary || {};


  /* =========================================
     REPORT METRICS
  ========================================= */

  const reportMetrics = useMemo(() => {
    if (!reconciliationResult) {
      return {
        riskScore: 0,
        totalExposure: 0,
        totalMatches: 0,
        totalTransactions: 0,
        exceptions: 0,
        accuracy: 0,
        amountMismatches: 0,
        settlementDelays: 0,
        duplicates: 0,
      };
    }

    const investigations =
      reconciliationResult.investigations || [];

    const exceptionsList =
      reconciliationResult.exceptions || [];

    /* =====================================
       TOTAL EXPOSURE
    ===================================== */

    const investigationExposure =
      investigations.reduce(
        (total, item) =>
          total +
          Number(
            item.amount_at_risk ??
            item.amount_difference ??
            0
          ),
        0
      );

    const exceptionExposure =
      exceptionsList.reduce(
        (total, item) =>
          total +
          Number(
            item.amount_at_risk ??
            item.amount_difference ??
            item.bank_amount ??
            0
          ),
        0
      );

    const totalExposure =
      investigationExposure > 0
        ? investigationExposure
        : exceptionExposure;


    /* =====================================
       AVERAGE RISK SCORE
    ===================================== */

    const riskScore =
      investigations.length > 0
        ? Math.round(
            investigations.reduce(
              (total, item) =>
                total +
                Number(item.risk_score || 0),
              0
            ) / investigations.length
          )
        : exceptionsList.length > 0
          ? Math.round(
              exceptionsList.reduce(
                (total, item) =>
                  total +
                  Number(item.risk_score || 0),
                0
              ) / exceptionsList.length
            )
          : 0;


    /* =====================================
       TRANSACTION COUNTS
    ===================================== */

    const bankTransactions = Number(
      summary.bank_transactions || 0
    );

    const ledgerTransactions = Number(
      summary.ledger_transactions || 0
    );

    const totalMatches = Number(
      summary.total_matches ??
      reconciliationResult.matches?.length ??
      0
    );

    const exceptions = Number(
      summary.exceptions ??
      reconciliationResult.exceptions?.length ??
      0
    );


    const totalTransactions = Math.max(
      bankTransactions,
      ledgerTransactions,
      totalMatches + exceptions
    );


    /* =====================================
       ACCURACY
    ===================================== */

    const accuracy =
      totalTransactions > 0
        ? (
            (totalMatches / totalTransactions) *
            100
          ).toFixed(1)
        : '0.0';


    return {
      riskScore,
      totalExposure,
      totalMatches,
      totalTransactions,
      exceptions,
      accuracy,

      amountMismatches: Number(
        summary.amount_mismatches || 0
      ),

      settlementDelays: Number(
        summary.settlement_delays || 0
      ),

      duplicates: Number(
        summary.possible_duplicates || 0
      ),
    };
  }, [reconciliationResult, summary]);


  /* =========================================
     GENERATE REPORT
  ========================================= */

  const handleGenerateReport = () => {
    if (!reconciliationResult) {
      alert(
        'Please run a reconciliation analysis first.'
      );
      return;
    }

    setGeneratedSuccess(false);
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedSuccess(true);
    }, 1200);
  };


  /* =========================================
     PDF REPORT
  ========================================= */

  const handleDownloadReport = () => {
    if (!reconciliationResult) {
      alert(
        'No reconciliation data available.'
      );
      return;
    }


    /* =====================================
       PDF SETUP
    ===================================== */

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });


    const pageWidth =
      pdf.internal.pageSize.getWidth();

    const pageHeight =
      pdf.internal.pageSize.getHeight();

    const margin = 14;

    const contentWidth =
      pageWidth - margin * 2;


    /* =====================================
       COLORS
    ===================================== */

    const COLORS = {
      forest: [23, 74, 58],
      forestLight: [47, 125, 90],

      text: [35, 45, 42],
      muted: [105, 112, 109],

      border: [220, 225, 223],
      light: [245, 248, 247],

      white: [255, 255, 255],

      red: [190, 55, 55],
      redLight: [252, 239, 239],

      amber: [185, 115, 35],
      amberLight: [253, 246, 231],

      green: [38, 125, 83],
      greenLight: [235, 247, 240],
    };


    /* =====================================
       HELPERS
    ===================================== */

    const setText = (
      r,
      g,
      b
    ) => {
      pdf.setTextColor(r, g, b);
    };


    const safeCurrency = (value) => {
      const amount = Number(value || 0);

      /*
       * Use ASCII "INR" in the PDF instead of ₹.
       * jsPDF's default Helvetica font does not
       * reliably support the ₹ glyph.
       */
      return `INR ${amount.toLocaleString(
        'en-IN',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
    };


    const safeText = (
      value,
      fallback = 'N/A'
    ) => {
      if (
        value === null ||
        value === undefined ||
        value === ''
      ) {
        return fallback;
      }

      return String(value);
    };


    const getRiskLevel = (score) => {
      if (score >= 75) return 'CRITICAL';
      if (score >= 50) return 'HIGH';
      if (score >= 25) return 'MEDIUM';
      return 'LOW';
    };


    const riskLevel =
      getRiskLevel(
        reportMetrics.riskScore
      );


    /* =====================================
       FOOTER
    ===================================== */

    const addFooter = () => {
      const totalPages =
        pdf.getNumberOfPages();

      for (
        let page = 1;
        page <= totalPages;
        page++
      ) {
        pdf.setPage(page);

        pdf.setDrawColor(
          ...COLORS.border
        );

        pdf.line(
          margin,
          pageHeight - 16,
          pageWidth - margin,
          pageHeight - 16
        );

        pdf.setFont(
          'helvetica',
          'normal'
        );

        pdf.setFontSize(7.5);

        setText(
          ...COLORS.muted
        );

        pdf.text(
          'ReconAI Financial Intelligence Report',
          margin,
          pageHeight - 9
        );

        pdf.text(
          `Page ${page} of ${totalPages}`,
          pageWidth - margin,
          pageHeight - 9,
          {
            align: 'right',
          }
        );
      }
    };


    /* =====================================
       SECTION TITLE
    ===================================== */

    const addSectionTitle = (
      title,
      subtitle = null
    ) => {
      let y =
        pdf.lastAutoTable?.finalY
          ? pdf.lastAutoTable.finalY + 10
          : 20;

      /*
       * If section heading would be too close
       * to footer, start a new page.
       */
      if (y > pageHeight - 45) {
        pdf.addPage();
        y = 22;
      }

      pdf.setFont(
        'helvetica',
        'bold'
      );

      pdf.setFontSize(13);

      setText(
        ...COLORS.forest
      );

      pdf.text(
        title,
        margin,
        y
      );

      pdf.setDrawColor(
        ...COLORS.border
      );

      pdf.setLineWidth(0.35);

      pdf.line(
        margin,
        y + 3,
        pageWidth - margin,
        y + 3
      );

      if (subtitle) {
        pdf.setFont(
          'helvetica',
          'normal'
        );

        pdf.setFontSize(8);

        setText(
          ...COLORS.muted
        );

        pdf.text(
          subtitle,
          margin,
          y + 9
        );

        return y + 15;
      }

      return y + 9;
    };


    /* =====================================
       REPORT HEADER
    ===================================== */

    pdf.setFillColor(
      ...COLORS.forest
    );

    pdf.rect(
      0,
      0,
      pageWidth,
      42,
      'F'
    );


    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(23);

    setText(
      ...COLORS.white
    );

    pdf.text(
      'ReconAI',
      margin,
      17
    );


    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.setFontSize(11);

    pdf.text(
      'Financial Intelligence Report',
      margin,
      25
    );


    pdf.setFontSize(8);

    setText(
      220,
      235,
      230
    );

    pdf.text(
      `Generated: ${new Date().toLocaleString()}`,
      margin,
      33
    );


    /*
     * Right side report status.
     */

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(8);

    pdf.text(
      'RECONCILIATION ANALYSIS',
      pageWidth - margin,
      17,
      {
        align: 'right',
      }
    );

    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.text(
      `${reportMetrics.totalTransactions} transactions analyzed`,
      pageWidth - margin,
      25,
      {
        align: 'right',
      }
    );


    /* =====================================
       EXECUTIVE SUMMARY
    ===================================== */

    let currentY = 52;

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(13);

    setText(
      ...COLORS.forest
    );

    pdf.text(
      'Executive Summary',
      margin,
      currentY
    );

    pdf.setDrawColor(
      ...COLORS.border
    );

    pdf.line(
      margin,
      currentY + 3,
      pageWidth - margin,
      currentY + 3
    );

    currentY += 11;


    const executiveText =
      `The reconciliation analysis processed ` +
      `${reportMetrics.totalTransactions} transactions. ` +
      `${reportMetrics.totalMatches} transactions were successfully matched, ` +
      `while ${reportMetrics.exceptions} exceptions were identified for review. ` +
      `The analysis identified total financial exposure of ` +
      `${safeCurrency(reportMetrics.totalExposure)}. ` +
      `The calculated reconciliation risk index is ` +
      `${reportMetrics.riskScore}/100 (${riskLevel}).`;


    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.setFontSize(9.5);

    setText(
      ...COLORS.text
    );


    const executiveLines =
      pdf.splitTextToSize(
        executiveText,
        contentWidth
      );


    pdf.text(
      executiveLines,
      margin,
      currentY,
      {
        lineHeightFactor: 1.5,
      }
    );


    currentY +=
      executiveLines.length * 5 +
      9;


    /* =====================================
       EXECUTIVE METRIC BOXES
    ===================================== */

    const metricGap = 4;

    const metricWidth =
      (
        contentWidth -
        metricGap * 3
      ) / 4;

    const metricHeight = 25;


    const metrics = [
      {
        label: 'TRANSACTIONS',
        value:
          reportMetrics.totalTransactions,
        color: COLORS.forest,
      },

      {
        label: 'MATCHED',
        value:
          reportMetrics.totalMatches,
        color: COLORS.green,
      },

      {
        label: 'EXCEPTIONS',
        value:
          reportMetrics.exceptions,
        color: COLORS.red,
      },

      {
        label: 'RISK INDEX',
        value:
          `${reportMetrics.riskScore}/100`,
        color:
          reportMetrics.riskScore >= 50
            ? COLORS.red
            : COLORS.forest,
      },
    ];


    metrics.forEach(
      (metric, index) => {
        const x =
          margin +
          index *
            (metricWidth + metricGap);

        pdf.setFillColor(
          248,
          250,
          249
        );

        pdf.setDrawColor(
          ...COLORS.border
        );

        pdf.roundedRect(
          x,
          currentY,
          metricWidth,
          metricHeight,
          2,
          2,
          'FD'
        );


        pdf.setFont(
          'helvetica',
          'bold'
        );

        pdf.setFontSize(7);

        setText(
          ...COLORS.muted
        );

        pdf.text(
          metric.label,
          x + 4,
          currentY + 7
        );


        pdf.setFontSize(13);

        setText(
          ...metric.color
        );

        pdf.text(
          String(metric.value),
          x + 4,
          currentY + 18
        );
      }
    );


    currentY +=
      metricHeight + 12;


    /* =====================================
       KEY METRICS
    ===================================== */

    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(13);

    setText(
      ...COLORS.forest
    );

    pdf.text(
      'Key Reconciliation Metrics',
      margin,
      currentY
    );

    pdf.setDrawColor(
      ...COLORS.border
    );

    pdf.line(
      margin,
      currentY + 3,
      pageWidth - margin,
      currentY + 3
    );

    currentY += 8;


    autoTable(pdf, {
      startY: currentY,

      head: [
        [
          'Metric',
          'Result',
        ],
      ],

      body: [
        [
          'Bank Transactions',
          safeText(
            summary.bank_transactions,
            '0'
          ),
        ],

        [
          'Ledger Transactions',
          safeText(
            summary.ledger_transactions,
            '0'
          ),
        ],

        [
          'Transactions Analyzed',
          reportMetrics.totalTransactions,
        ],

        [
          'Successful Matches',
          reportMetrics.totalMatches,
        ],

        [
          'Exceptions Detected',
          reportMetrics.exceptions,
        ],

        [
          'Match Accuracy',
          `${reportMetrics.accuracy}%`,
        ],

        [
          'Amount Mismatches',
          reportMetrics.amountMismatches,
        ],

        [
          'Settlement Delays',
          reportMetrics.settlementDelays,
        ],

        [
          'Possible Duplicates',
          reportMetrics.duplicates,
        ],

        [
          'Total Financial Exposure',
          safeCurrency(
            reportMetrics.totalExposure
          ),
        ],

        [
          'Risk Index',
          `${reportMetrics.riskScore}/100`,
        ],
      ],

      theme: 'grid',

      tableWidth: contentWidth,

      columnStyles: {
        0: {
          cellWidth: contentWidth * 0.68,
          halign: 'left',
        },

        1: {
          cellWidth: contentWidth * 0.32,
          halign: 'right',
          fontStyle: 'bold',
        },
      },

      headStyles: {
        fillColor:
          COLORS.forest,
        textColor:
          COLORS.white,
        fontStyle:
          'bold',
        fontSize: 8.5,
        cellPadding: 3,
      },

      bodyStyles: {
        fontSize: 8.5,
        textColor:
          COLORS.text,
        cellPadding: 2.7,
      },

      alternateRowStyles: {
        fillColor:
          COLORS.light,
      },

      styles: {
        lineColor:
          COLORS.border,
        lineWidth: 0.25,
        overflow: 'linebreak',
      },

      margin: {
        left: margin,
        right: margin,
        bottom: 22,
      },

      pageBreak: 'auto',

      rowPageBreak: 'avoid',
    });


    /* =====================================
       RISK ASSESSMENT
    ===================================== */

    currentY =
      pdf.lastAutoTable.finalY + 11;


    if (
      currentY >
      pageHeight - 75
    ) {
      pdf.addPage();
      currentY = 22;
    }


    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(13);

    setText(
      ...COLORS.forest
    );

    pdf.text(
      'Risk Assessment',
      margin,
      currentY
    );

    pdf.setDrawColor(
      ...COLORS.border
    );

    pdf.line(
      margin,
      currentY + 3,
      pageWidth - margin,
      currentY + 3
    );

    currentY += 8;


    autoTable(pdf, {
      startY: currentY,

      head: [
        [
          'Risk Category',
          'Assessment',
        ],
      ],

      body: [
        [
          'Overall Risk Level',
          riskLevel,
        ],

        [
          'Risk Score',
          `${reportMetrics.riskScore}/100`,
        ],

        [
          'Financial Exposure',
          safeCurrency(
            reportMetrics.totalExposure
          ),
        ],

        [
          'Exceptions Requiring Review',
          reportMetrics.exceptions,
        ],
      ],

      theme: 'grid',

      tableWidth: contentWidth,

      columnStyles: {
        0: {
          cellWidth:
            contentWidth * 0.65,
          halign: 'left',
        },

        1: {
          cellWidth:
            contentWidth * 0.35,
          halign: 'right',
          fontStyle: 'bold',
        },
      },

      headStyles: {
        fillColor:
          COLORS.amber,
        textColor:
          COLORS.white,
        fontStyle:
          'bold',
        fontSize: 8.5,
        cellPadding: 3,
      },

      bodyStyles: {
        fontSize: 8.5,
        cellPadding: 3,
        textColor:
          COLORS.text,
      },

      alternateRowStyles: {
        fillColor:
          COLORS.amberLight,
      },

      styles: {
        lineColor:
          COLORS.border,
        lineWidth: 0.25,
      },

      margin: {
        left: margin,
        right: margin,
        bottom: 22,
      },

      rowPageBreak: 'avoid',
    });


    /* =====================================
       MATCHED TRANSACTIONS
    ===================================== */

    const matches =
      reconciliationResult.matches || [];


    if (matches.length > 0) {
      currentY =
        pdf.lastAutoTable.finalY + 12;


      /*
       * Keep the section heading with the
       * table header. If there isn't enough
       * space, move the whole section.
       */

      if (
        currentY >
        pageHeight - 65
      ) {
        pdf.addPage();
        currentY = 22;
      }


      pdf.setFont(
        'helvetica',
        'bold'
      );

      pdf.setFontSize(13);

      setText(
        ...COLORS.forest
      );

      pdf.text(
        `Matched Transactions (${matches.length})`,
        margin,
        currentY
      );

      pdf.setDrawColor(
        ...COLORS.border
      );

      pdf.line(
        margin,
        currentY + 3,
        pageWidth - margin,
        currentY + 3
      );

      currentY += 8;


      autoTable(pdf, {
        startY: currentY,

        head: [
          [
            'Bank Reference',
            'Ledger Reference',
            'Amount',
            'Match Type',
            'Confidence',
          ],
        ],

        body: matches.map(
          (item) => [
            safeText(
              item.bank_ref ||
              item.bank_reference
            ),

            safeText(
              item.ledger_ref ||
              item.ledger_reference
            ),

            safeCurrency(
              item.amount ||
              item.bank_amount ||
              0
            ),

            safeText(
              item.match_type,
              'MATCHED'
            ),

            item.confidence !==
              undefined &&
            item.confidence !== null
              ? `${(
                  Number(
                    item.confidence
                  ) * 100
                ).toFixed(1)}%`
              : '100%',
          ]
        ),

        theme: 'striped',

        tableWidth: contentWidth,

        columnStyles: {
          0: {
            cellWidth:
              contentWidth * 0.22,
            halign: 'left',
          },

          1: {
            cellWidth:
              contentWidth * 0.22,
            halign: 'left',
          },

          2: {
            cellWidth:
              contentWidth * 0.18,
            halign: 'right',
          },

          3: {
            cellWidth:
              contentWidth * 0.20,
            halign: 'center',
          },

          4: {
            cellWidth:
              contentWidth * 0.18,
            halign: 'right',
          },
        },

        headStyles: {
          fillColor:
            COLORS.forestLight,
          textColor:
            COLORS.white,
          fontStyle:
            'bold',
          fontSize: 7.5,
          cellPadding: 2.7,
          halign: 'center',
        },

        bodyStyles: {
          fontSize: 7.5,
          cellPadding: 2.5,
          textColor:
            COLORS.text,
        },

        alternateRowStyles: {
          fillColor:
            COLORS.light,
        },

        styles: {
          lineColor:
            COLORS.border,
          lineWidth: 0.25,
          overflow: 'linebreak',
          valign: 'middle',
        },

        margin: {
          left: margin,
          right: margin,
          bottom: 22,
        },

        showHead: 'everyPage',

        rowPageBreak: 'avoid',
      });
    }


    /* =====================================
       DETECTED EXCEPTIONS
    ===================================== */

    const exceptions =
      reconciliationResult.exceptions || [];


    if (exceptions.length > 0) {
      currentY =
        pdf.lastAutoTable.finalY + 12;


      if (
        currentY >
        pageHeight - 65
      ) {
        pdf.addPage();
        currentY = 22;
      }


      pdf.setFont(
        'helvetica',
        'bold'
      );

      pdf.setFontSize(13);

      setText(
        ...COLORS.forest
      );

      pdf.text(
        `Detected Exceptions (${exceptions.length})`,
        margin,
        currentY
      );

      pdf.setDrawColor(
        ...COLORS.border
      );

      pdf.line(
        margin,
        currentY + 3,
        pageWidth - margin,
        currentY + 3
      );

      currentY += 8;


      autoTable(pdf, {
        startY: currentY,

        head: [
          [
            'Bank Reference',
            'Ledger Reference',
            'Exception Type',
            'Amount at Risk',
            'Risk Score',
          ],
        ],

        body: exceptions.map(
          (item) => [
            safeText(
              item.bank_ref ||
              item.bank_reference
            ),

            safeText(
              item.ledger_ref ||
              item.ledger_reference
            ),

            safeText(
              item.exception_type ||
              item.issue,
              'EXCEPTION'
            ),

            safeCurrency(
              item.amount_at_risk ||
              item.amount_difference ||
              item.bank_amount ||
              0
            ),

            `${Number(
              item.risk_score || 0
            )}/100`,
          ]
        ),

        theme: 'striped',

        tableWidth: contentWidth,

        columnStyles: {
          0: {
            cellWidth:
              contentWidth * 0.19,
            halign: 'left',
          },

          1: {
            cellWidth:
              contentWidth * 0.19,
            halign: 'left',
          },

          2: {
            cellWidth:
              contentWidth * 0.27,
            halign: 'left',
          },

          3: {
            cellWidth:
              contentWidth * 0.20,
            halign: 'right',
          },

          4: {
            cellWidth:
              contentWidth * 0.15,
            halign: 'right',
          },
        },

        headStyles: {
          fillColor:
            COLORS.red,
          textColor:
            COLORS.white,
          fontStyle:
            'bold',
          fontSize: 7.5,
          cellPadding: 2.7,
          halign: 'center',
        },

        bodyStyles: {
          fontSize: 7.5,
          cellPadding: 2.5,
          textColor:
            COLORS.text,
        },

        alternateRowStyles: {
          fillColor:
            COLORS.redLight,
        },

        styles: {
          lineColor:
            COLORS.border,
          lineWidth: 0.25,
          overflow: 'linebreak',
          valign: 'middle',
        },

        margin: {
          left: margin,
          right: margin,
          bottom: 22,
        },

        showHead: 'everyPage',

        rowPageBreak: 'avoid',
      });
    }


    /* =====================================
       AI INVESTIGATION RESULTS
    ===================================== */

    const investigations =
      reconciliationResult.investigations || [];


    if (investigations.length > 0) {
      currentY =
        pdf.lastAutoTable.finalY + 12;


      if (
        currentY >
        pageHeight - 70
      ) {
        pdf.addPage();
        currentY = 22;
      }


      pdf.setFont(
        'helvetica',
        'bold'
      );

      pdf.setFontSize(13);

      setText(
        ...COLORS.forest
      );

      pdf.text(
        `AI Investigation Results (${investigations.length})`,
        margin,
        currentY
      );

      pdf.setDrawColor(
        ...COLORS.border
      );

      pdf.line(
        margin,
        currentY + 3,
        pageWidth - margin,
        currentY + 3
      );

      currentY += 8;


      autoTable(pdf, {
        startY: currentY,

        head: [
          [
            'Issue',
            'Priority',
            'Amount at Risk',
            'Risk Score',
            'Recommended Action',
          ],
        ],

        body: investigations.map(
          (item) => [
            safeText(
              item.issue ||
              item.exception_type,
              'Financial Exception'
            ),

            safeText(
              item.priority,
              'MEDIUM'
            ),

            safeCurrency(
              item.amount_at_risk ||
              item.amount_difference ||
              0
            ),

            `${Number(
              item.risk_score || 0
            )}/100`,

            safeText(
              item.recommended_action ||
              item.recommendedAction,
              'Review transaction'
            ),
          ]
        ),

        theme: 'striped',

        tableWidth: contentWidth,

        columnStyles: {
          0: {
            cellWidth:
              contentWidth * 0.20,
            halign: 'left',
          },

          1: {
            cellWidth:
              contentWidth * 0.14,
            halign: 'center',
          },

          2: {
            cellWidth:
              contentWidth * 0.18,
            halign: 'right',
          },

          3: {
            cellWidth:
              contentWidth * 0.13,
            halign: 'right',
          },

          4: {
            cellWidth:
              contentWidth * 0.35,
            halign: 'left',
          },
        },

        headStyles: {
          fillColor:
            COLORS.forest,
          textColor:
            COLORS.white,
          fontStyle:
            'bold',
          fontSize: 7.3,
          cellPadding: 2.7,
          halign: 'center',
        },

        bodyStyles: {
          fontSize: 7.2,
          cellPadding: 2.8,
          textColor:
            COLORS.text,
        },

        alternateRowStyles: {
          fillColor:
            COLORS.light,
        },

        styles: {
          lineColor:
            COLORS.border,
          lineWidth: 0.25,
          overflow: 'linebreak',
          valign: 'top',
          cellWidth: 'wrap',
        },

        margin: {
          left: margin,
          right: margin,
          bottom: 22,
        },

        showHead: 'everyPage',

        rowPageBreak: 'avoid',
      });
    }


    /* =====================================
       REPORT CONCLUSION
    ===================================== */

    currentY =
      pdf.lastAutoTable?.finalY
        ? pdf.lastAutoTable.finalY + 12
        : 30;


    if (
      currentY >
      pageHeight - 55
    ) {
      pdf.addPage();
      currentY = 22;
    }


    pdf.setFillColor(
      ...COLORS.light
    );

    pdf.setDrawColor(
      ...COLORS.border
    );

    pdf.roundedRect(
      margin,
      currentY,
      contentWidth,
      30,
      2,
      2,
      'FD'
    );


    pdf.setFont(
      'helvetica',
      'bold'
    );

    pdf.setFontSize(9);

    setText(
      ...COLORS.forest
    );

    pdf.text(
      'Report Summary',
      margin + 5,
      currentY + 8
    );


    const conclusion =
      `The reconciliation process identified ` +
      `${reportMetrics.exceptions} exception(s) requiring review. ` +
      `The current risk index is ${reportMetrics.riskScore}/100 ` +
      `with ${safeCurrency(reportMetrics.totalExposure)} ` +
      `in identified financial exposure.`;


    pdf.setFont(
      'helvetica',
      'normal'
    );

    pdf.setFontSize(8);

    setText(
      ...COLORS.text
    );


    const conclusionLines =
      pdf.splitTextToSize(
        conclusion,
        contentWidth - 10
      );


    pdf.text(
      conclusionLines,
      margin + 5,
      currentY + 15,
      {
        lineHeightFactor: 1.4,
      }
    );


    /* =====================================
       FOOTER
    ===================================== */

    addFooter();


    /* =====================================
       DOWNLOAD
    ===================================== */

    const date =
      new Date()
        .toISOString()
        .split('T')[0];


    pdf.save(
      `ReconAI_Financial_Intelligence_Report_${date}.pdf`
    );
  };


  /* =========================================
     EMPTY STATE
  ========================================= */

  if (!reconciliationResult) {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">

        <PageHeader
          title="Financial Intelligence Reports"
          subtitle="Run a reconciliation analysis first to generate a financial intelligence report."
        />

        <div className="p-12 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-center">

          <div className="w-14 h-14 rounded-2xl bg-recon-light-soft dark:bg-recon-dark-cardHover flex items-center justify-center mx-auto mb-4">

            <FileText className="w-7 h-7 text-recon-forest dark:text-recon-dark-accent" />

          </div>

          <p className="text-sm font-bold text-recon-light-text dark:text-recon-dark-text">
            No reconciliation report available.
          </p>

          <p className="text-xs mt-2 text-recon-light-muted dark:text-recon-dark-muted">
            Upload your bank and ledger CSV files and run ReconAI analysis first.
          </p>

        </div>

      </div>
    );
  }


  /* =========================================
     MAIN UI
  ========================================= */

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">

      <PageHeader
        title="Financial Intelligence Reports"
        subtitle="Generate and download a complete PDF report based on your actual reconciliation analysis."
      />


      {/* =====================================
          REPORT GENERATOR
      ===================================== */}

      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft transition-colors">

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">


          {/* REPORT INFORMATION */}

          <div className="space-y-3 max-w-2xl">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-recon-light-soft dark:bg-recon-dark-cardHover text-recon-forest dark:text-recon-dark-accent text-xs font-extrabold uppercase tracking-wider">

              <Sparkles className="w-3.5 h-3.5" />

              <span>
                ReconAI Executive Briefing
              </span>

            </div>


            <h2 className="text-xl sm:text-2xl font-extrabold text-recon-light-text dark:text-recon-dark-text tracking-tight">
              Reconciliation Intelligence Report
            </h2>


            <p className="text-xs sm:text-sm text-recon-light-muted dark:text-recon-dark-muted font-medium leading-relaxed">

              Generate a complete PDF report containing{' '}

              {reportMetrics.totalMatches}

              {' '}matched transactions,{' '}

              {reportMetrics.exceptions}

              {' '}detected exceptions, AI investigation results and{' '}

              {formatCurrency(
                reportMetrics.totalExposure
              )}

              {' '}total financial exposure.

            </p>


            {/* METRIC CARDS */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">

              <div className="p-2.5 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg border border-recon-light-border dark:border-recon-dark-border">

                <span className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted uppercase block">
                  Risk Index
                </span>

                <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                  {reportMetrics.riskScore} / 100
                </span>

              </div>


              <div className="p-2.5 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg border border-recon-light-border dark:border-recon-dark-border">

                <span className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted uppercase block">
                  Total Exposure
                </span>

                <span className="text-sm font-extrabold text-recon-light-text dark:text-recon-dark-text">
                  {formatCurrency(
                    reportMetrics.totalExposure
                  )}
                </span>

              </div>


              <div className="p-2.5 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg border border-recon-light-border dark:border-recon-dark-border">

                <span className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted uppercase block">
                  Match Accuracy
                </span>

                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  {reportMetrics.accuracy}%
                </span>

              </div>


              <div className="p-2.5 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg border border-recon-light-border dark:border-recon-dark-border">

                <span className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted uppercase block">
                  Exceptions
                </span>

                <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                  {reportMetrics.exceptions}
                </span>

              </div>

            </div>

          </div>


          {/* PDF GENERATOR */}

          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-recon-light-bg/70 dark:bg-recon-dark-cardHover/70 border border-recon-light-border dark:border-recon-dark-border text-center min-w-[240px]">

            <FileText className="w-12 h-12 text-recon-forest dark:text-recon-dark-accent mb-3" />


            {generatedSuccess ? (

              <div className="space-y-3 w-full">

                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">

                  <CheckCircle2 className="w-4 h-4" />

                  PDF Report Ready

                </span>


                <button
                  onClick={handleDownloadReport}
                  className="w-full px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-soft transition-colors flex items-center justify-center gap-2"
                >

                  <Download className="w-4 h-4" />

                  <span>
                    Download PDF
                  </span>

                </button>

              </div>

            ) : (

              <button
                onClick={handleGenerateReport}
                disabled={isGenerating}
                className="w-full px-5 py-2.5 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white font-extrabold text-xs shadow-soft hover:bg-recon-forestHover transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
              >

                {isGenerating ? (

                  <>

                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                    <span>
                      Generating PDF...
                    </span>

                  </>

                ) : (

                  <>

                    <Sparkles className="w-4 h-4" />

                    <span>
                      Generate PDF Report
                    </span>

                  </>

                )}

              </button>

            )}

          </div>

        </div>

      </div>


      {/* =====================================
          SUMMARY CARDS
      ===================================== */}

      <div className="space-y-4">

        <h3 className="text-base font-extrabold text-recon-light-text dark:text-recon-dark-text">
          Reconciliation Summary
        </h3>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">


          {/* MATCHES */}

          <div className="p-5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft">

            <div className="flex items-center gap-3 mb-3">

              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">

                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />

              </div>

              <div>

                <p className="text-xs font-bold text-recon-light-muted dark:text-recon-dark-muted">
                  Successful Matches
                </p>

                <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">
                  {reportMetrics.totalMatches}
                </p>

              </div>

            </div>

            <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted">
              Transactions successfully reconciled between bank and ledger records.
            </p>

          </div>


          {/* EXCEPTIONS */}

          <div className="p-5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft">

            <div className="flex items-center gap-3 mb-3">

              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center">

                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />

              </div>

              <div>

                <p className="text-xs font-bold text-recon-light-muted dark:text-recon-dark-muted">
                  Exceptions Detected
                </p>

                <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400">
                  {reportMetrics.exceptions}
                </p>

              </div>

            </div>

            <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted">
              Transactions requiring manual review and investigation.
            </p>

          </div>


          {/* TRANSACTIONS */}

          <div className="p-5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft">

            <div className="flex items-center gap-3 mb-3">

              <div className="w-10 h-10 rounded-xl bg-recon-light-soft dark:bg-recon-dark-cardHover flex items-center justify-center">

                <ShieldCheck className="w-5 h-5 text-recon-forest dark:text-recon-dark-accent" />

              </div>

              <div>

                <p className="text-xs font-bold text-recon-light-muted dark:text-recon-dark-muted">
                  Transactions Analyzed
                </p>

                <p className="text-xl font-extrabold text-recon-light-text dark:text-recon-dark-text">
                  {reportMetrics.totalTransactions}
                </p>

              </div>

            </div>

            <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted">
              Total transactions processed during the reconciliation analysis.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};