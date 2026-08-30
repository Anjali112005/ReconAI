import React, { useMemo, useState } from 'react';

import {
  FileSpreadsheet,
  Download,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  FileText,
} from 'lucide-react';

import { PageHeader } from '../components/PageHeader';

import { formatCurrency } from '../utils/formatCurrency';

import { useRecon } from '../context/ReconContext';


export const Reports = () => {


  /* =========================================
     CONTEXT
  ========================================= */

  const {
    reconciliationResult,
  } = useRecon();


  /* =========================================
     STATE
  ========================================= */

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [generatedSuccess, setGeneratedSuccess] =
    useState(false);


  /* =========================================
     SUMMARY
  ========================================= */

  const summary =
    reconciliationResult?.summary || {};


  /* =========================================
     CALCULATE REPORT METRICS
  ========================================= */

  const reportMetrics =
    useMemo(() => {

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


      /* ===============================
         TOTAL EXPOSURE
      =============================== */

      const totalExposure =
        investigations.reduce(

          (total, item) =>

            total +
            Number(
              item.amount_at_risk ||
              item.amount_difference ||
              0
            ),

          0

        );


      /* ===============================
         AVERAGE RISK SCORE
      =============================== */

      const riskScore =

        investigations.length > 0

          ? Math.round(

              investigations.reduce(

                (total, item) =>

                  total +
                  Number(
                    item.risk_score || 0
                  ),

                0

              )

              /

              investigations.length

            )

          : 0;


      /* ===============================
         TRANSACTION COUNT
      =============================== */

      const bankTransactions =
        Number(
          summary.bank_transactions || 0
        );


      const ledgerTransactions =
        Number(
          summary.ledger_transactions || 0
        );


      const totalMatches =
        Number(
          summary.total_matches ||

          reconciliationResult.matches?.length ||

          0
        );


      const exceptions =
        Number(
          summary.exceptions ||

          reconciliationResult.exceptions?.length ||

          0
        );


      /* ===============================
         MATCH ACCURACY
      =============================== */

      const totalTransactions =
        Math.max(
          bankTransactions,
          ledgerTransactions
        );


      const accuracy =

        totalTransactions > 0

          ? (
              totalMatches /
              totalTransactions
            ) * 100

          : 0;


      return {

        riskScore,

        totalExposure,

        totalMatches,

        totalTransactions,

        exceptions,

        accuracy:
          accuracy.toFixed(1),

        amountMismatches:

          Number(
            summary.amount_mismatches || 0
          ),

        settlementDelays:

          Number(
            summary.settlement_delays || 0
          ),

        duplicates:

          Number(
            summary.possible_duplicates || 0
          ),

      };

    }, [

      reconciliationResult,

      summary,

    ]);


  /* =========================================
     GENERATE REPORT
  ========================================= */

  const handleGenerateReport =
    () => {

      if (!reconciliationResult) {

        alert(
          'Please run a reconciliation analysis first.'
        );

        return;

      }


      setIsGenerating(true);


      setTimeout(() => {

        setIsGenerating(false);

        setGeneratedSuccess(true);

      }, 1500);

    };


  /* =========================================
     DOWNLOAD CSV REPORT
  ========================================= */

  const handleDownloadReport =
    () => {

      if (!reconciliationResult) {

        alert(
          'No reconciliation data available.'
        );

        return;

      }


      const reportRows = [

        [
          'ReconAI Financial Intelligence Report'
        ],

        [],

        [
          'Report Metric',
          'Value'
        ],

        [
          'Bank Transactions',
          summary.bank_transactions || 0
        ],

        [
          'Ledger Transactions',
          summary.ledger_transactions || 0
        ],

        [
          'Successful Matches',
          reportMetrics.totalMatches
        ],

        [
          'Exceptions',
          reportMetrics.exceptions
        ],

        [
          'Amount Mismatches',
          reportMetrics.amountMismatches
        ],

        [
          'Settlement Delays',
          reportMetrics.settlementDelays
        ],

        [
          'Possible Duplicates',
          reportMetrics.duplicates
        ],

        [
          'Total Exposure',
          reportMetrics.totalExposure
        ],

        [
          'Risk Score',
          `${reportMetrics.riskScore}/100`
        ],

        [
          'Match Accuracy',
          `${reportMetrics.accuracy}%`
        ],

        [],

        [
          'Transaction Details'
        ],

        [
          'Bank Reference',
          'Ledger Reference',
          'Amount',
          'Status',
          'Risk Score'
        ],

      ];


      /* ===============================
         MATCHES
      =============================== */

      const matches =
        reconciliationResult.matches || [];


      matches.forEach(
        (item) => {

          reportRows.push([

            item.bank_ref || '',

            item.ledger_ref || '',

            item.amount || 0,

            item.match_type ||
            'MATCHED',

            item.confidence
              ? `${item.confidence * 100}%`
              : '100%',

          ]);

        }
      );


      /* ===============================
         EXCEPTIONS
      =============================== */

      const exceptions =
        reconciliationResult.exceptions || [];


      exceptions.forEach(
        (item) => {

          reportRows.push([

            item.bank_ref || '',

            item.ledger_ref || '',

            item.amount_at_risk ||
            item.bank_amount ||
            0,

            item.exception_type ||
            'EXCEPTION',

            item.risk_score || 0,

          ]);

        }
      );


      /* ===============================
         CONVERT TO CSV
      =============================== */

      const csvContent =

        reportRows

          .map(

            (row) =>

              row

                .map(

                  (value) =>

                    `"${String(value)
                      .replace(/"/g, '""')
                    }"`

                )

                .join(',')

          )

          .join('\n');


      const blob =
        new Blob(

          [
            csvContent
          ],

          {
            type:
              'text/csv;charset=utf-8;'
          }

        );


      const url =
        URL.createObjectURL(
          blob
        );


      const link =
        document.createElement(
          'a'
        );


      link.href =
        url;


      link.setAttribute(

        'download',

        'ReconAI_Financial_Report.csv'

      );


      document.body.appendChild(
        link
      );


      link.click();


      document.body.removeChild(
        link
      );


      URL.revokeObjectURL(
        url
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

        subtitle="Generate and download reconciliation reports based on your actual financial analysis."

      />


      {/* =====================================
          EXECUTIVE REPORT
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

              Contains real reconciliation results including
              {' '}

              {reportMetrics.totalMatches}

              {' '}
              matched transactions,
              {' '}

              {reportMetrics.exceptions}

              {' '}
              detected exceptions and

              {' '}

              {formatCurrency(
                reportMetrics.totalExposure
              )}

              {' '}
              total financial exposure.

            </p>


            {/* =================================
                METRIC CARDS
            ================================= */}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-bold text-recon-light-text dark:text-recon-dark-text">


              {/* RISK SCORE */}

              <div className="p-2.5 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg border border-recon-light-border dark:border-recon-dark-border">


                <span className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted uppercase block">

                  Risk Index

                </span>


                <span className="text-rose-600 dark:text-rose-400">

                  {reportMetrics.riskScore} / 100

                </span>


              </div>


              {/* EXPOSURE */}

              <div className="p-2.5 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg border border-recon-light-border dark:border-recon-dark-border">


                <span className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted uppercase block">

                  Total Exposure

                </span>


                <span>

                  {formatCurrency(
                    reportMetrics.totalExposure
                  )}

                </span>


              </div>


              {/* ACCURACY */}

              <div className="p-2.5 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg border border-recon-light-border dark:border-recon-dark-border">


                <span className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted uppercase block">

                  Match Accuracy

                </span>


                <span className="text-emerald-600 dark:text-emerald-400">

                  {reportMetrics.accuracy}%

                </span>


              </div>


              {/* EXCEPTIONS */}

              <div className="p-2.5 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg border border-recon-light-border dark:border-recon-dark-border">


                <span className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted uppercase block">

                  Exceptions

                </span>


                <span className="text-rose-600 dark:text-rose-400">

                  {reportMetrics.exceptions}

                </span>


              </div>


            </div>


          </div>


          {/* =================================
              REPORT GENERATOR
          ================================= */}

          <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-recon-light-bg/70 dark:bg-recon-dark-cardHover/70 border border-recon-light-border dark:border-recon-dark-border text-center min-w-[240px]">


            <FileSpreadsheet className="w-12 h-12 text-recon-forest dark:text-recon-dark-accent mb-3" />


            {

              generatedSuccess

                ? (

                  <div className="space-y-3">


                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">


                      <CheckCircle2 className="w-4 h-4" />


                      Report Ready


                    </span>


                    <button

                      onClick={
                        handleDownloadReport
                      }

                      className="w-full px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-soft transition-colors flex items-center justify-center gap-2"

                    >


                      <Download className="w-4 h-4" />


                      <span>

                        Download Report

                      </span>


                    </button>


                  </div>

                )

                : (

                  <button

                    onClick={
                      handleGenerateReport
                    }

                    disabled={
                      isGenerating
                    }

                    className="w-full px-5 py-2.5 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white font-extrabold text-xs shadow-soft hover:bg-recon-forestHover transition-colors flex items-center justify-center gap-2"

                  >


                    {

                      isGenerating

                        ? (

                          <>

                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />


                            <span>

                              Generating Report...

                            </span>


                          </>

                        )

                        : (

                          <>

                            <Sparkles className="w-4 h-4" />


                            <span>

                              Generate Report

                            </span>


                          </>

                        )

                    }


                  </button>

                )

            }


          </div>


        </div>


      </div>


      {/* =====================================
          DETAILED REPORT SUMMARY
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


          {/* TOTAL TRANSACTIONS */}

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