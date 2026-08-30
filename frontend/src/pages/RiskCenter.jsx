import React, { useState, useMemo, useEffect } from 'react';

import {
  ShieldAlert,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Filter,
  CheckCircle2,
} from 'lucide-react';

import { PageHeader } from '../components/PageHeader';
import { RiskBadge } from '../components/RiskBadge';
import { formatCurrency } from '../utils/formatCurrency';

import { useRecon } from '../context/ReconContext';

export const RiskCenter = () => {
  /* =========================================
     CONTEXT
  ========================================= */

  const {
    reconciliationResult: contextResult,
  } = useRecon();

  /* =========================================
     LOCAL STATE
  ========================================= */

  const [reconciliationResult, setReconciliationResult] =
    useState(contextResult || null);

  const [expandedId, setExpandedId] = useState(null);

  const [priorityFilter, setPriorityFilter] =
    useState('ALL');

  /* =========================================
     LOAD RESULT FROM CONTEXT / SESSION STORAGE
  ========================================= */

  useEffect(() => {
    if (contextResult) {
      setReconciliationResult(contextResult);
      return;
    }

    const savedResult =
      sessionStorage.getItem('reconciliationResult');

    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult);

        setReconciliationResult(parsedResult);
      } catch (error) {
        console.error(
          'Failed to load reconciliation data:',
          error
        );
      }
    }
  }, [contextResult]);

  /* =========================================
     HELPER FUNCTIONS
  ========================================= */

  const normalizePriority = (value) => {
    if (!value) return 'MEDIUM';

    const priority = String(value)
      .trim()
      .toUpperCase();

    if (
      priority === 'CRITICAL' ||
      priority === 'HIGH' ||
      priority === 'MEDIUM' ||
      priority === 'LOW'
    ) {
      return priority;
    }

    return 'MEDIUM';
  };

  const getArrayValue = (...values) => {
    for (const value of values) {
      if (Array.isArray(value)) {
        return value;
      }
    }

    return [];
  };

  const getNumberValue = (...values) => {
    for (const value of values) {
      const number = Number(value);

      if (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        !Number.isNaN(number)
      ) {
        return number;
      }
    }

    return 0;
  };

  /* =========================================
     TRANSFORM BACKEND DATA
  ========================================= */

  const riskItems = useMemo(() => {
    if (!reconciliationResult) {
      return [];
    }

    const exceptions = getArrayValue(
      reconciliationResult.exceptions,
      reconciliationResult.unmatched_transactions,
      reconciliationResult.discrepancies,
      reconciliationResult.risk_items
    );

    const investigations = getArrayValue(
      reconciliationResult.investigations,
      reconciliationResult.ai_investigations
    );

    return exceptions.map((exception, index) => {
      const investigation =
        investigations.find((item) => {
          return (
            item?.exception_type &&
            item.exception_type ===
              exception?.exception_type
          );
        }) ||
        investigations[index] ||
        {};

      const priority = normalizePriority(
        exception?.priority ||
        investigation?.priority ||
        exception?.severity ||
        investigation?.severity
      );

      return {
        id:
          exception?.id ||
          exception?.exception_id ||
          `${exception?.bank_ref || 'BANK'}-${exception?.ledger_ref || 'LEDGER'}-${index}`,

        issue:
          exception?.issue ||
          exception?.exception_type
            ?.replace(/_/g, ' ')
            ?.replace(/\b\w/g, (char) =>
              char.toUpperCase()
            ) ||
          'Reconciliation Issue',

        bankRef:
          exception?.bank_ref ||
          exception?.bank_reference ||
          exception?.bank_transaction_id ||
          'N/A',

        ledgerRef:
          exception?.ledger_ref ||
          exception?.ledger_reference ||
          exception?.ledger_transaction_id ||
          'N/A',

        priority,

        riskScore: getNumberValue(
          exception?.risk_score,
          investigation?.risk_score,
          exception?.score,
          investigation?.score
        ),

        amount: getNumberValue(
          exception?.amount_at_risk,
          investigation?.amount_at_risk,
          exception?.difference,
          exception?.amount_difference,
          exception?.amount,
          investigation?.amount
        ),

        description:
          investigation?.analysis ||
          investigation?.summary ||
          exception?.reason ||
          exception?.description ||
          'ReconAI detected a financial discrepancy that requires review.',

        recommendedAction:
          exception?.recommended_action ||
          investigation?.recommended_action ||
          investigation?.action ||
          'Review the transaction details and verify the related financial records.',

        possibleCauses: getArrayValue(
          investigation?.possible_causes,
          investigation?.causes,
          exception?.possible_causes,
          exception?.causes
        ),

        investigationSteps: getArrayValue(
          investigation?.investigation_steps,
          investigation?.steps,
          exception?.investigation_steps,
          exception?.steps
        ),

        exceptionType:
          exception?.exception_type ||
          exception?.type ||
          'UNKNOWN',

        severity:
          exception?.severity ||
          investigation?.severity ||
          priority,
      };
    });
  }, [reconciliationResult]);

  /* =========================================
     EXPAND FIRST ITEM
  ========================================= */

  useEffect(() => {
    if (
      riskItems.length > 0 &&
      !riskItems.some(
        (item) => item.id === expandedId
      )
    ) {
      setExpandedId(riskItems[0].id);
    }

    if (riskItems.length === 0) {
      setExpandedId(null);
    }
  }, [riskItems, expandedId]);

  /* =========================================
     TOGGLE EXPAND
  ========================================= */

  const toggleExpand = (id) => {
    setExpandedId((previousId) =>
      previousId === id ? null : id
    );
  };

  /* =========================================
     FILTER ITEMS
  ========================================= */

  const filteredItems = riskItems.filter((item) => {
    if (priorityFilter === 'ALL') {
      return true;
    }

    return (
      normalizePriority(item.priority) ===
      priorityFilter
    );
  });

  /* =========================================
     KPI CALCULATIONS
  ========================================= */

  const totalExposure = riskItems.reduce(
    (total, item) =>
      total + Number(item.amount || 0),
    0
  );

  const averageRiskScore =
    riskItems.length > 0
      ? Math.round(
          riskItems.reduce(
            (total, item) =>
              total +
              Number(item.riskScore || 0),
            0
          ) / riskItems.length
        )
      : 0;

  const criticalIssues = riskItems.filter(
    (item) =>
      normalizePriority(item.priority) ===
      'CRITICAL'
  ).length;

  const highPriorityIssues = riskItems.filter(
    (item) =>
      normalizePriority(item.priority) ===
      'HIGH'
  ).length;

  /* =========================================
     NO RECONCILIATION RESULT
  ========================================= */

  if (!reconciliationResult) {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">
        <PageHeader
          title="Risk Center"
          subtitle="Run a reconciliation first to view risk analysis."
        />

        <div className="p-12 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-center">
          <ShieldAlert className="w-10 h-10 mx-auto text-amber-500 mb-4" />

          <p className="text-sm font-bold text-recon-light-text dark:text-recon-dark-text">
            No risk analysis available.
          </p>

          <p className="text-xs mt-2 text-recon-light-muted dark:text-recon-dark-muted">
            Upload your bank and ledger CSV files and run
            ReconAI analysis first.
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

      {/* PAGE HEADER */}

      <PageHeader
        title="Risk Center"
        subtitle="Monitor, filter, and investigate high-risk financial discrepancies and capital exposure."
      />

      {/* KPI ROW */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* AVERAGE RISK SCORE */}

        <div className="p-4 rounded-2xl bg-white dark:bg-recon-dark-card border-l-4 border-l-rose-500 border-recon-light-border dark:border-recon-dark-border shadow-soft">

          <p className="text-[11px] font-bold uppercase tracking-wider text-recon-light-muted dark:text-recon-dark-muted">
            Average Risk Score
          </p>

          <p className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {averageRiskScore} / 100
          </p>

        </div>

        {/* TOTAL EXPOSURE */}

        <div className="p-4 rounded-2xl bg-white dark:bg-recon-dark-card border-l-4 border-l-amber-500 border-recon-light-border dark:border-recon-dark-border shadow-soft">

          <p className="text-[11px] font-bold uppercase tracking-wider text-recon-light-muted dark:text-recon-dark-muted">
            Total Exposure
          </p>

          <p className="text-2xl font-extrabold text-recon-light-text dark:text-recon-dark-text mt-1">
            {formatCurrency(totalExposure)}
          </p>

        </div>

        {/* CRITICAL ISSUES */}

        <div className="p-4 rounded-2xl bg-white dark:bg-recon-dark-card border-l-4 border-l-red-600 border-recon-light-border dark:border-recon-dark-border shadow-soft">

          <p className="text-[11px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            Critical Issues
          </p>

          <p className="text-2xl font-extrabold text-red-600 dark:text-red-400 mt-1">
            {criticalIssues}
          </p>

        </div>

        {/* HIGH PRIORITY */}

        <div className="p-4 rounded-2xl bg-white dark:bg-recon-dark-card border-l-4 border-l-amber-500 border-recon-light-border dark:border-recon-dark-border shadow-soft">

          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
            High Priority
          </p>

          <p className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
            {highPriorityIssues}
          </p>

        </div>

      </div>

      {/* FILTER HEADER */}

      <div className="flex items-center justify-between gap-4">

        <h2 className="text-base font-extrabold text-recon-light-text dark:text-recon-dark-text">
          Financial Discrepancy Matrix ({filteredItems.length} Issues)
        </h2>

        <div className="flex items-center gap-2">

          <Filter className="w-4 h-4 text-recon-light-muted dark:text-recon-dark-muted" />

          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value)
            }
            className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-recon-light-text dark:text-recon-dark-text focus:outline-none"
          >
            <option value="ALL">
              All Priorities
            </option>

            <option value="CRITICAL">
              Critical Only
            </option>

            <option value="HIGH">
              High Priority
            </option>

            <option value="MEDIUM">
              Medium Priority
            </option>

            <option value="LOW">
              Low Priority
            </option>

          </select>

        </div>

      </div>

      {/* EMPTY STATE */}

      {filteredItems.length === 0 ? (

        <div className="p-10 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-center">

          <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-3" />

          <p className="text-sm font-bold text-recon-light-text dark:text-recon-dark-text">
            No risk issues found.
          </p>

          <p className="text-xs mt-2 text-recon-light-muted dark:text-recon-dark-muted">
            No discrepancies match the selected priority filter.
          </p>

        </div>

      ) : (

        <div className="space-y-4">

          {filteredItems.map((item) => {

            const isExpanded =
              expandedId === item.id;

            return (

              <div
                key={item.id}
                className="rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft overflow-hidden transition-all"
              >

                {/* CARD HEADER */}

                <div
                  onClick={() =>
                    toggleExpand(item.id)
                  }
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-recon-light-soft/30 dark:hover:bg-recon-dark-cardHover/40 transition-colors"
                >

                  <div className="flex items-start gap-3">

                    <RiskBadge
                      priority={item.priority}
                    />

                    <div>

                      <h3 className="text-sm font-extrabold text-recon-light-text dark:text-recon-dark-text">
                        {item.issue}
                      </h3>

                      <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted mt-0.5 font-medium">

                        Bank Ref:{' '}

                        <span className="font-mono">
                          {item.bankRef}
                        </span>

                        {' • '}

                        Ledger Ref:{' '}

                        <span className="font-mono">
                          {item.ledgerRef}
                        </span>

                      </p>

                    </div>

                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">

                    <div className="text-left sm:text-right">

                      <p className="text-sm font-extrabold text-recon-light-text dark:text-recon-dark-text">
                        {formatCurrency(item.amount)}
                      </p>

                      <p className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted font-bold">
                        Risk Score: {item.riskScore}/100
                      </p>

                    </div>

                    <button
                      type="button"
                      className="p-1.5 rounded-lg text-recon-light-muted dark:text-recon-dark-muted"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>

                  </div>

                </div>

                {/* EXPANDED DETAILS */}

                {isExpanded && (

                  <div className="p-5 bg-recon-light-bg/50 dark:bg-recon-dark-cardHover/50 border-t border-recon-light-border/60 dark:border-recon-dark-border/60 space-y-5 animate-in fade-in duration-150">

                    {/* AI ANALYSIS */}

                    <div>

                      <h4 className="text-xs font-bold uppercase tracking-wider text-recon-light-muted dark:text-recon-dark-muted mb-1">
                        AI Risk Analysis
                      </h4>

                      <p className="text-xs text-recon-light-text dark:text-recon-dark-text font-medium leading-relaxed">
                        {item.description}
                      </p>

                    </div>

                    {/* POSSIBLE CAUSES */}

                    {item.possibleCauses.length > 0 && (

                      <div>

                        <h4 className="text-xs font-bold uppercase tracking-wider text-recon-light-muted dark:text-recon-dark-muted mb-2">
                          Possible Causes
                        </h4>

                        <ul className="space-y-1.5">

                          {item.possibleCauses.map(
                            (cause, index) => (

                              <li
                                key={index}
                                className="text-xs text-recon-light-text dark:text-recon-dark-text font-medium flex items-start gap-2"
                              >

                                <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-amber-500 shrink-0" />

                                <span>
                                  {cause}
                                </span>

                              </li>

                            )
                          )}

                        </ul>

                      </div>

                    )}

                    {/* INVESTIGATION STEPS */}

                    {item.investigationSteps.length > 0 && (

                      <div>

                        <h4 className="text-xs font-bold uppercase tracking-wider text-recon-light-muted dark:text-recon-dark-muted mb-2">
                          Recommended Investigation Steps
                        </h4>

                        <ol className="space-y-1.5">

                          {item.investigationSteps.map(
                            (step, index) => (

                              <li
                                key={index}
                                className="text-xs text-recon-light-text dark:text-recon-dark-text font-medium flex gap-2"
                              >

                                <span className="font-bold">
                                  {index + 1}.
                                </span>

                                <span>
                                  {step}
                                </span>

                              </li>

                            )
                          )}

                        </ol>

                      </div>

                    )}

                    {/* AI RECOMMENDATION */}

                    <div className="p-3.5 rounded-xl bg-recon-light-soft dark:bg-recon-dark-card border border-recon-forest/15 dark:border-recon-dark-accent/20">

                      <div className="flex items-center gap-2 text-xs font-bold text-recon-forest dark:text-recon-dark-accent mb-1">

                        <Sparkles className="w-4 h-4" />

                        <span>
                          AI Forensic Recommendation
                        </span>

                      </div>

                      <p className="text-xs text-recon-light-text dark:text-recon-dark-text font-medium">
                        {item.recommendedAction}
                      </p>

                    </div>

                  </div>

                )}

              </div>

            );

          })}

        </div>

      )}

    </div>
  );
};