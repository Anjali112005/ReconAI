import React, { useMemo } from 'react';
import {
  AlertTriangle,
  CheckSquare,
  Sparkles,
  ArrowRight,
  BrainCircuit,
} from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { useRecon } from '../context/ReconContext';


export const AIInvestigation = () => {

  /* =========================================
     GET RECONCILIATION DATA
  ========================================= */

  const {
    reconciliationResult,
  } = useRecon();


  /* =========================================
     TRANSFORM BACKEND INVESTIGATIONS
  ========================================= */

  const investigations = useMemo(() => {

    if (!reconciliationResult) {
      return [];
    }


    const backendInvestigations =
      reconciliationResult.investigations || [];


    return backendInvestigations.map(
      (item, index) => ({

        id:
          `CASE-${String(index + 1).padStart(3, '0')}`,

        title:
          item.exception_type
            ?.replace(/_/g, ' ')
            || 'Financial Discrepancy',

        priority:
          item.priority || 'MEDIUM',

        status:
          item.status ||
          'INVESTIGATION REQUIRED',

        exposure:
          Number(
            item.amount_at_risk ||
            item.amount_difference ||
            0
          ),

        riskScore:
          Number(
            item.risk_score || 0
          ),

        summary:
          item.analysis ||
          'AI analysis identified a transaction discrepancy that requires further investigation.',

        causes:
          item.possible_causes || [],

        actions:
          item.investigation_steps || [],

      })
    );

  }, [
    reconciliationResult
  ]);


  /* =========================================
     EMPTY STATE
  ========================================= */

  if (!reconciliationResult) {

    return (

      <div className="space-y-6 pb-12 animate-in fade-in duration-200">

        <PageHeader
          title="AI Forensic Investigation"
          subtitle="Run a reconciliation first to generate AI-powered forensic investigations."
        />


        <div className="p-12 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-center">

          <div className="w-14 h-14 rounded-2xl bg-recon-light-soft dark:bg-recon-dark-cardHover flex items-center justify-center mx-auto mb-4">

            <BrainCircuit className="w-7 h-7 text-recon-forest dark:text-recon-dark-accent" />

          </div>


          <p className="text-sm font-bold text-recon-light-text dark:text-recon-dark-text">

            No AI investigation data available.

          </p>


          <p className="text-xs mt-2 text-recon-light-muted dark:text-recon-dark-muted">

            Upload your bank and ledger CSV files and run ReconAI analysis first.

          </p>

        </div>

      </div>

    );

  }


  /* =========================================
     NO INVESTIGATIONS
  ========================================= */

  if (investigations.length === 0) {

    return (

      <div className="space-y-6 pb-12 animate-in fade-in duration-200">

        <PageHeader
          title="AI Forensic Investigation"
          subtitle="Automated neural case analysis, root-cause identification, and suggested resolution steps."
        />


        <div className="p-12 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-center">

          <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-4">

            <CheckSquare className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />

          </div>


          <p className="text-sm font-bold text-recon-light-text dark:text-recon-dark-text">

            No investigations required.

          </p>


          <p className="text-xs mt-2 text-recon-light-muted dark:text-recon-dark-muted">

            ReconAI did not detect any issues requiring further forensic investigation.

          </p>

        </div>

      </div>

    );

  }


  /* =========================================
     UI
  ========================================= */

  return (

    <div className="space-y-6 pb-12 animate-in fade-in duration-200">


      {/* =====================================
          PAGE HEADER
      ===================================== */}

      <PageHeader

        title="AI Forensic Investigation"

        subtitle="Automated neural case analysis, root-cause identification, and suggested CFO resolution steps."

      />


      {/* =====================================
          INVESTIGATION CARDS
      ===================================== */}

      <div className="space-y-6">


        {investigations.map(
          (caseItem) => (

            <div

              key={caseItem.id}

              className="p-6 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft space-y-5 transition-colors"

            >


              {/* =================================
                  CASE HEADER
              ================================= */}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-recon-light-border/60 dark:border-recon-dark-border/60">


                <div className="flex items-center gap-3">


                  <div className="w-10 h-10 rounded-xl bg-recon-light-soft dark:bg-recon-dark-cardHover flex items-center justify-center text-recon-forest dark:text-recon-dark-accent font-mono font-bold text-xs">

                    {caseItem.id}

                  </div>


                  <div>


                    <div className="flex items-center gap-2 flex-wrap">


                      <h3 className="text-base font-extrabold text-recon-light-text dark:text-recon-dark-text">

                        {caseItem.title}

                      </h3>


                      <RiskBadge
                        priority={caseItem.priority}
                      />


                    </div>


                    <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted mt-0.5 font-medium">

                      Status:{' '}

                      <span className="font-semibold text-recon-forest dark:text-recon-dark-accent">

                        {caseItem.status}

                      </span>

                    </p>


                  </div>


                </div>


                {/* =================================
                    RISK METRICS
                ================================= */}

                <div className="flex items-center gap-4">


                  <div className="text-left sm:text-right">


                    <p className="text-xs font-bold text-recon-light-muted dark:text-recon-dark-muted">

                      Capital Exposure

                    </p>


                    <p className="text-lg font-extrabold text-recon-light-text dark:text-recon-dark-text">

                      {formatCurrency(
                        caseItem.exposure
                      )}

                    </p>


                  </div>


                  <div className="text-left sm:text-right">


                    <p className="text-xs font-bold text-recon-light-muted dark:text-recon-dark-muted">

                      Risk Score

                    </p>


                    <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">

                      {caseItem.riskScore}/100

                    </p>


                  </div>


                </div>


              </div>


              {/* =================================
                  AI SUMMARY
              ================================= */}

              <div className="p-4 rounded-xl bg-recon-light-bg/70 dark:bg-recon-dark-cardHover/70 border border-recon-light-border dark:border-recon-dark-border space-y-2">


                <div className="flex items-center gap-2 text-xs font-bold text-recon-forest dark:text-recon-dark-accent">

                  <Sparkles className="w-4 h-4" />

                  <span>

                    AI Automated Summary

                  </span>

                </div>


                <p className="text-xs text-recon-light-text dark:text-recon-dark-text font-medium leading-relaxed">

                  {caseItem.summary}

                </p>


              </div>


              {/* =================================
                  CAUSES + ACTIONS
              ================================= */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                {/* =============================
                    POSSIBLE CAUSES
                ============================= */}

                <div className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40">


                  <h4 className="text-xs font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">

                    <AlertTriangle className="w-4 h-4" />

                    <span>

                      Identified Root Causes

                    </span>

                  </h4>


                  {

                    caseItem.causes.length > 0

                      ? (

                        <ul className="space-y-2">


                          {

                            caseItem.causes.map(
                              (cause, index) => (

                                <li

                                  key={index}

                                  className="text-xs text-recon-light-text dark:text-recon-dark-text font-medium flex items-start gap-2"

                                >


                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />


                                  <span>

                                    {cause}

                                  </span>


                                </li>

                              )
                            )

                          }


                        </ul>

                      )

                      : (

                        <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted">

                          No specific root causes identified.

                        </p>

                      )

                  }


                </div>


                {/* =============================
                    ACTION PLAN
                ============================= */}

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40">


                  <h4 className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 mb-3">

                    <CheckSquare className="w-4 h-4" />

                    <span>

                      Recommended Action Plan

                    </span>

                  </h4>


                  {

                    caseItem.actions.length > 0

                      ? (

                        <ol className="space-y-2">


                          {

                            caseItem.actions.map(
                              (action, index) => (

                                <li

                                  key={index}

                                  className="text-xs text-recon-light-text dark:text-recon-dark-text font-medium flex items-start gap-2"

                                >


                                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-[11px] shrink-0">

                                    {index + 1}.

                                  </span>


                                  <span>

                                    {action}

                                  </span>


                                </li>

                              )
                            )

                          }


                        </ol>

                      )

                      : (

                        <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted">

                          No action plan available.

                        </p>

                      )

                  }


                </div>


              </div>


              {/* =================================
                  ACTION FOOTER
              ================================= */}

              <div className="flex items-center justify-end gap-3 pt-2">


                <button

                  onClick={() => {

                    alert(
                      `Action plan approved for ${caseItem.id}`
                    );

                  }}

                  className="px-4 py-2 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white font-extrabold text-xs shadow-soft hover:bg-recon-forestHover transition-colors flex items-center gap-2"

                >


                  <span>

                    Approve Action Plan

                  </span>


                  <ArrowRight className="w-4 h-4" />


                </button>


              </div>


            </div>

          )
        )}


      </div>


    </div>

  );

};