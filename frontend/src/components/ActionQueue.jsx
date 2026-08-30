import React, { useState } from 'react';
import { ArrowRight, ChevronRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { RiskBadge } from './RiskBadge';
import { formatCurrency } from '../utils/formatCurrency';
import { actionQueueItems } from '../data/mockData';

export const ActionQueue = ({ onInvestigateItem }) => {
  const [resolvedIds, setResolvedIds] = useState([]);

  const handleResolve = (id, e) => {
    e.stopPropagation();
    setResolvedIds((prev) => [...prev, id]);
  };

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft transition-colors">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-recon-light-text dark:text-recon-dark-text tracking-tight">
              AI Priority Action Queue
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-recon-forest/10 dark:bg-recon-dark-accent/20 text-recon-forest dark:text-recon-dark-accent">
              Live Priority Ranking
            </span>
          </div>
          <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted mt-0.5 font-medium">
            Financial discrepancies ranked by neural risk score & exposure amount
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {actionQueueItems.map((item) => {
          const isResolved = resolvedIds.includes(item.id);

          return (
            <div
              key={item.id}
              onClick={() => onInvestigateItem && onInvestigateItem(item)}
              className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                isResolved
                  ? 'bg-gray-50/50 dark:bg-recon-dark-bg/50 border-gray-200/50 dark:border-recon-dark-border/40 opacity-60'
                  : 'bg-recon-light-bg/60 dark:bg-recon-dark-cardHover/60 border-recon-light-border dark:border-recon-dark-border hover:border-recon-forest/30 dark:hover:border-recon-dark-accent/40 hover:shadow-sm'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left details */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="mt-0.5">
                    <RiskBadge priority={item.priority} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xs sm:text-sm font-bold text-recon-light-text dark:text-recon-dark-text truncate">
                        {item.issue}
                      </h3>
                      <span className="text-[10px] font-mono text-recon-light-muted dark:text-recon-dark-muted">
                        Ref: {item.bankRef}
                      </span>
                    </div>
                    <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted mt-1 line-clamp-1">
                      {item.description}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] text-recon-forest dark:text-recon-dark-accent font-semibold">
                      <Sparkles className="w-3 h-3" />
                      <span>{item.recommendedAction}</span>
                    </div>
                  </div>
                </div>

                {/* Right stats & action button */}
                <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-recon-light-border/40 dark:border-recon-dark-border/40">
                  <div className="text-left md:text-right">
                    <p className="text-xs font-extrabold text-recon-light-text dark:text-recon-dark-text">
                      {formatCurrency(item.amount)}
                    </p>
                    <p className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted">
                      Risk Score: <span className="font-bold text-rose-600 dark:text-rose-400">{item.riskScore}/100</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isResolved ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        Resolved
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={(e) => handleResolve(item.id, e)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition-colors"
                        >
                          Resolve
                        </button>
                        <div className="p-1.5 rounded-lg text-recon-light-muted dark:text-recon-dark-muted group-hover:text-recon-forest dark:group-hover:text-recon-dark-accent group-hover:translate-x-0.5 transition-all">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
