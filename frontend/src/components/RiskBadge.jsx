import React from 'react';

export const RiskBadge = ({ priority }) => {
  const p = (priority || '').toUpperCase();

  let styleClass = 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200';
  let dotColor = 'bg-gray-400';

  if (p === 'CRITICAL') {
    styleClass = 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200 dark:border-red-800';
    dotColor = 'bg-red-500';
  } else if (p === 'HIGH') {
    styleClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    dotColor = 'bg-amber-500';
  } else if (p === 'MEDIUM') {
    styleClass = 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
    dotColor = 'bg-yellow-500';
  } else if (p === 'LOW') {
    styleClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    dotColor = 'bg-emerald-500';
  } else if (p === 'MATCHED' || p === 'SUCCESS') {
    styleClass = 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    dotColor = 'bg-emerald-500';
  } else if (p === 'UNMATCHED') {
    styleClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
    dotColor = 'bg-rose-500';
  } else if (p === 'REVIEW REQUIRED' || p === 'PARTIAL MATCH') {
    styleClass = 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800';
    dotColor = 'bg-orange-500';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${styleClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {priority}
    </span>
  );
};
