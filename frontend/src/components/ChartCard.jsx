import React from 'react';

export const ChartCard = ({ title, subtitle, children, action }) => {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-recon-light-text dark:text-recon-dark-text tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>

      <div className="w-full flex-1 min-h-[240px]">
        {children}
      </div>
    </div>
  );
};
