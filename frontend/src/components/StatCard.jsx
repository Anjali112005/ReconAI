import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const StatCard = ({ title, value, subtext, icon: Icon, trend, trendLabel, accentColor = 'forest' }) => {
  const isPositiveTrend = trend && trend.startsWith('+');

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft hover:shadow-soft-hover transition-all duration-200 relative overflow-hidden group">
      {/* Subtle Top Accent Line */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 bg-${accentColor}`}
        style={{
          backgroundColor:
            accentColor === 'critical' ? '#D9534F' :
            accentColor === 'high' ? '#E58A3A' :
            accentColor === 'success' ? '#2F7D5A' :
            accentColor === 'forest' ? '#174A3A' : undefined
        }}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-recon-light-muted dark:text-recon-dark-muted">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-recon-light-text dark:text-recon-dark-text tracking-tight">
              {value}
            </h3>
          </div>
        </div>

        {Icon && (
          <div className="p-2.5 rounded-xl bg-recon-light-soft dark:bg-recon-dark-cardHover text-recon-forest dark:text-recon-dark-accent group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between pt-3 border-t border-recon-light-border/50 dark:border-recon-dark-border/50 text-xs">
        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-bold ${
              isPositiveTrend
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {isPositiveTrend ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
        <span className="text-recon-light-muted dark:text-recon-dark-muted font-medium truncate">
          {trendLabel || subtext}
        </span>
      </div>
    </div>
  );
};
