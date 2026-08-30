import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';

import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import { ActionQueue } from '../components/ActionQueue';

import { formatCurrency } from '../utils/formatCurrency';
import { useTheme } from '../context/ThemeContext';
import { useRecon } from '../context/ReconContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const {
    reconciliationResult,
    setReconciliationResult
  } = useRecon();

  const [result, setResult] = useState(
    reconciliationResult
  );

  /* =========================================
     LOAD RESULT FROM SESSION STORAGE
  ========================================= */

  useEffect(() => {
    if (reconciliationResult) {
      setResult(reconciliationResult);
      return;
    }

    const savedResult = sessionStorage.getItem(
      'reconciliationResult'
    );

    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult);

        setResult(parsedResult);

        setReconciliationResult(parsedResult);
      } catch (error) {
        console.error(
          'Failed to load reconciliation result:',
          error
        );
      }
    }
  }, [
    reconciliationResult,
    setReconciliationResult
  ]);

  /* =========================================
     THEME COLORS
  ========================================= */

  const gridColor = isDark
    ? '#2A3730'
    : '#E7E9E5';

  const textColor = isDark
    ? '#9CA8A1'
    : '#6B7470';

  const tooltipBg = isDark
    ? '#18221D'
    : '#FFFFFF';

  const tooltipBorder = isDark
    ? '#2A3730'
    : '#E7E9E5';

  /* =========================================
     EXTRACT MATCHES
  ========================================= */

  const matches = useMemo(() => {
    if (!result) return [];

    return (
      result.matches ||
      result.matched_transactions ||
      result.matchedTransactions ||
      []
    );
  }, [result]);

  /* =========================================
     EXTRACT EXCEPTIONS
  ========================================= */

  const exceptions = useMemo(() => {
    if (!result) return [];

    return (
      result.exceptions ||
      result.unmatched_transactions ||
      result.unmatchedTransactions ||
      []
    );
  }, [result]);

  /* =========================================
     TOTAL MATCHES
  ========================================= */

  const totalMatches = useMemo(() => {
    if (!result) return 0;

    if (matches.length > 0) {
      return matches.length;
    }

    return (
      result.total_matches ||
      result.totalMatches ||
      result.summary?.matched ||
      result.summary?.total_matches ||
      0
    );
  }, [result, matches]);

  /* =========================================
     TOTAL EXCEPTIONS
  ========================================= */

  const totalExceptions = useMemo(() => {
    if (!result) return 0;

    if (exceptions.length > 0) {
      return exceptions.length;
    }

    return (
      result.total_exceptions ||
      result.totalExceptions ||
      result.summary?.exceptions ||
      result.summary?.total_exceptions ||
      0
    );
  }, [result, exceptions]);

  /* =========================================
     TOTAL TRANSACTIONS
  ========================================= */

  const totalTransactions = useMemo(() => {
    if (!result) return 0;

    return (
      result.total_transactions ||
      result.totalTransactions ||
      result.summary?.total_transactions ||
      totalMatches + totalExceptions
    );
  }, [
    result,
    totalMatches,
    totalExceptions
  ]);

  /* =========================================
     MATCH RATE
  ========================================= */

  const matchRate = useMemo(() => {
    if (!totalTransactions) return 0;

    return Number(
      (
        (totalMatches / totalTransactions) *
        100
      ).toFixed(1)
    );
  }, [
    totalMatches,
    totalTransactions
  ]);

  /* =========================================
     TOTAL FINANCIAL EXPOSURE
  ========================================= */

  const totalExposure = useMemo(() => {
    if (!result) return 0;

    if (
      result.total_exposure !== undefined
    ) {
      return Number(result.total_exposure) || 0;
    }

    if (
      result.totalExposure !== undefined
    ) {
      return Number(result.totalExposure) || 0;
    }

    if (
      result.summary?.total_exposure !== undefined
    ) {
      return (
        Number(
          result.summary.total_exposure
        ) || 0
      );
    }

    if (exceptions.length > 0) {
      return exceptions.reduce(
        (total, item) => {
          const amount =
            Number(
              item.amount ||
              item.difference ||
              item.exposure ||
              item.value ||
              0
            );

          return total + Math.abs(amount);
        },
        0
      );
    }

    return 0;
  }, [
    result,
    exceptions
  ]);

  /* =========================================
     RISK SCORE
  ========================================= */

  const riskScore = useMemo(() => {
    if (!result) return 0;

    if (
      result.risk_score !== undefined
    ) {
      return Number(result.risk_score);
    }

    if (
      result.riskScore !== undefined
    ) {
      return Number(result.riskScore);
    }

    if (
      result.summary?.risk_score !== undefined
    ) {
      return Number(
        result.summary.risk_score
      );
    }

    if (
      totalTransactions === 0
    ) {
      return 0;
    }

    const exceptionRate =
      (totalExceptions /
        totalTransactions) *
      100;

    return Math.min(
      100,
      Math.round(exceptionRate * 5)
    );
  }, [
    result,
    totalTransactions,
    totalExceptions
  ]);

  /* =========================================
     CRITICAL EXCEPTIONS
  ========================================= */

  const criticalExceptions = useMemo(() => {
    return exceptions.filter((item) => {
      const priority =
        item.priority ||
        item.risk ||
        item.riskLevel ||
        '';

      return (
        String(priority)
          .toUpperCase() ===
        'CRITICAL'
      );
    }).length;
  }, [exceptions]);

  /* =========================================
     RISK DISTRIBUTION
  ========================================= */

  const riskDistribution =
    useMemo(() => {
      const distribution = {
        Critical: 0,
        High: 0,
        Medium: 0,
        Low: 0
      };

      exceptions.forEach((item) => {
        const priority = String(
          item.priority ||
            item.risk ||
            item.riskLevel ||
            'Medium'
        ).toUpperCase();

        if (priority === 'CRITICAL') {
          distribution.Critical += 1;
        } else if (
          priority === 'HIGH'
        ) {
          distribution.High += 1;
        } else if (
          priority === 'LOW'
        ) {
          distribution.Low += 1;
        } else {
          distribution.Medium += 1;
        }
      });

      return [
        {
          name: 'Critical',
          value:
            distribution.Critical,
          count:
            distribution.Critical,
          color: '#E11D48'
        },
        {
          name: 'High',
          value:
            distribution.High,
          count:
            distribution.High,
          color: '#F97316'
        },
        {
          name: 'Medium',
          value:
            distribution.Medium,
          count:
            distribution.Medium,
          color: '#F59E0B'
        },
        {
          name: 'Low',
          value:
            distribution.Low,
          count:
            distribution.Low,
          color: '#10B981'
        }
      ].filter(
        (item) => item.value > 0
      );
    }, [exceptions]);

  /* =========================================
     FINANCIAL EXPOSURE DATA
  ========================================= */

  const financialExposure =
    useMemo(() => {
      const categories = {};

      exceptions.forEach((item) => {
        const category =
          item.category ||
          item.issue ||
          item.type ||
          item.reason ||
          'Other Exceptions';

        const amount = Math.abs(
          Number(
            item.amount ||
              item.difference ||
              item.exposure ||
              item.value ||
              0
          )
        );

        categories[category] =
          (categories[category] ||
            0) + amount;
      });

      return Object.entries(
        categories
      )
        .map(
          ([
            category,
            exposure
          ]) => ({
            category,
            exposure
          })
        )
        .sort(
          (a, b) =>
            b.exposure -
            a.exposure
        )
        .slice(0, 6);
    }, [exceptions]);

  /* =========================================
     PERFORMANCE TREND
  ========================================= */

  const performanceTrend =
    useMemo(() => {
      if (!result) {
        return [];
      }

      return [
        {
          month: 'Current Audit',
          rate: matchRate
        }
      ];
    }, [
      result,
      matchRate
    ]);

  /* =========================================
     RISK LABEL
  ========================================= */

  const riskLabel = useMemo(() => {
    if (riskScore <= 30) {
      return 'Low Risk';
    }

    if (riskScore <= 60) {
      return 'Moderate Risk';
    }

    if (riskScore <= 80) {
      return 'High Risk';
    }

    return 'Critical Risk';
  }, [riskScore]);

  /* =========================================
     EMPTY STATE
  ========================================= */

  if (!result) {
    return (
      <div className="space-y-6 pb-12 animate-in fade-in duration-200">

        <PageHeader
          title="Dashboard"
          subtitle="Financial intelligence overview and reconciliation performance."
        />

        <div className="p-12 text-center rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft">

          <BarChart3 className="w-14 h-14 text-recon-light-muted dark:text-recon-dark-muted mx-auto mb-4" />

          <h3 className="text-lg font-extrabold text-recon-light-text dark:text-recon-dark-text">
            No Reconciliation Data Available
          </h3>

          <p className="text-sm text-recon-light-muted dark:text-recon-dark-muted mt-2 max-w-md mx-auto">
            Upload your bank statement and
            internal ledger CSV files to run
            a reconciliation analysis.
          </p>

          <button
            onClick={() =>
              navigate('/upload')
            }
            className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white font-extrabold text-xs shadow-soft hover:bg-recon-forestHover transition-all"
          >
            <Sparkles className="w-4 h-4" />

            Run New Audit
          </button>

        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">

      {/* =========================================
         PAGE HEADER
      ========================================= */}

      <PageHeader
        title="Dashboard"
        subtitle="Financial intelligence overview and reconciliation performance."
        actions={
          <button
            onClick={() =>
              navigate('/upload')
            }
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white font-extrabold text-xs shadow-soft hover:bg-recon-forestHover transition-all"
          >
            <Sparkles className="w-4 h-4" />

            <span>
              Run New Audit
            </span>

          </button>
        }
      />

      {/* =========================================
         WELCOME BANNER
      ========================================= */}

      <div className="p-6 rounded-2xl bg-gradient-to-r from-recon-forest via-recon-sage to-emerald-900 text-white shadow-soft relative overflow-hidden">

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>

            <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">

              <Calendar className="w-3.5 h-3.5" />

              <span>
                Latest Reconciliation Audit
              </span>

            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              Reconciliation Analysis Complete
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl font-medium">

              {totalMatches.toLocaleString()} transactions matched with{' '}

              {matchRate}% accuracy.{' '}

              {totalExceptions.toLocaleString()} exceptions detected
              {criticalExceptions > 0 &&
                `, including ${criticalExceptions} critical issues.`}

            </p>

          </div>

          <div className="flex items-center gap-3">

            <button
              onClick={() =>
                navigate('/reconciliation')
              }
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >

              <span>
                View Reconciliations
              </span>

              <ArrowUpRight className="w-4 h-4" />

            </button>

          </div>

        </div>

      </div>

      {/* =========================================
         KPI CARDS
      ========================================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <StatCard
          title="Financial Risk Score"
          value={`${riskScore} / 100`}
          subtext={riskLabel}
          icon={ShieldAlert}
          accentColor="critical"
        />

        <StatCard
          title="Total Exposure"
          value={formatCurrency(totalExposure)}
          subtext="Financial value affected by exceptions"
          icon={AlertTriangle}
          accentColor="high"
        />

        <StatCard
          title="Successful Matches"
          value={totalMatches.toLocaleString()}
          subtext={`${matchRate}% reconciliation rate`}
          icon={CheckCircle2}
          accentColor="success"
        />

        <StatCard
          title="Exceptions"
          value={totalExceptions}
          subtext={`${criticalExceptions} critical attention required`}
          icon={BarChart3}
          accentColor="forest"
        />

      </div>

      {/* =========================================
         ANALYTICS ROW 1
      ========================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* PERFORMANCE */}

        <div className="lg:col-span-2">

          <ChartCard
            title="Reconciliation Performance"
            subtitle="Current reconciliation match accuracy"
          >

            <ResponsiveContainer
              width="100%"
              height={260}
            >

              <AreaChart
                data={performanceTrend}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0
                }}
              >

                <defs>

                  <linearGradient
                    id="colorRate"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor={
                        isDark
                          ? '#4F9B78'
                          : '#174A3A'
                      }
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="95%"
                      stopColor={
                        isDark
                          ? '#4F9B78'
                          : '#174A3A'
                      }
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  stroke={textColor}
                  fontSize={12}
                  tickLine={false}
                />

                <YAxis
                  domain={[0, 100]}
                  stroke={textColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      tooltipBg,
                    borderColor:
                      tooltipBorder,
                    borderRadius:
                      '12px',
                    fontSize:
                      '12px',
                    color:
                      isDark
                        ? '#F3F5F2'
                        : '#1C2B26'
                  }}
                  formatter={(val) => [
                    `${val}%`,
                    'Match Rate'
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke={
                    isDark
                      ? '#4F9B78'
                      : '#174A3A'
                  }
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRate)"
                />

              </AreaChart>

            </ResponsiveContainer>

          </ChartCard>

        </div>

        {/* RISK DISTRIBUTION */}

        <ChartCard
          title="Risk Distribution"
          subtitle={`Breakdown of ${totalExceptions} exceptions`}
        >

          <div className="relative flex items-center justify-center">

            {riskDistribution.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={220}
              >

                <PieChart>

                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >

                    {riskDistribution.map(
                      (entry, index) => (

                        <Cell
                          key={`cell-${index}`}
                          fill={entry.color}
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        tooltipBg,
                      borderColor:
                        tooltipBorder,
                      borderRadius:
                        '12px',
                      fontSize:
                        '12px'
                    }}
                    formatter={(val) => [
                      `${val} items`,
                      'Count'
                    ]}
                  />

                </PieChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-[220px] flex items-center justify-center text-xs text-recon-light-muted dark:text-recon-dark-muted">
                No exceptions detected
              </div>

            )}

            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

              <span className="text-2xl font-extrabold text-recon-light-text dark:text-recon-dark-text">

                {totalExceptions}

              </span>

              <span className="text-[10px] font-bold uppercase tracking-wider text-recon-light-muted dark:text-recon-dark-muted">

                Exceptions

              </span>

            </div>

          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-recon-light-border/40 dark:border-recon-dark-border/40">

            {riskDistribution.map(
              (item) => (

                <div
                  key={item.name}
                  className="flex items-center gap-2 text-xs"
                >

                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        item.color
                    }}
                  />

                  <span className="text-recon-light-muted dark:text-recon-dark-muted font-medium">

                    {item.name}:

                  </span>

                  <span className="font-bold text-recon-light-text dark:text-recon-dark-text">

                    {item.count}

                  </span>

                </div>

              )
            )}

          </div>

        </ChartCard>

      </div>

      {/* =========================================
         ANALYTICS ROW 2
      ========================================= */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* FINANCIAL EXPOSURE */}

        <div className="lg:col-span-2">

          <ChartCard
            title="Financial Exposure by Category"
            subtitle="Total amount affected by each discrepancy category"
          >

            {financialExposure.length > 0 ? (

              <ResponsiveContainer
                width="100%"
                height={240}
              >

                <BarChart
                  data={financialExposure}
                  layout="vertical"
                  margin={{
                    top: 10,
                    right: 20,
                    left: 40,
                    bottom: 0
                  }}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={gridColor}
                    horizontal={false}
                  />

                  <XAxis
                    type="number"
                    stroke={textColor}
                    fontSize={11}
                    tickFormatter={(v) =>
                      `₹${v / 1000}k`
                    }
                  />

                  <YAxis
                    dataKey="category"
                    type="category"
                    stroke={textColor}
                    fontSize={11}
                    width={120}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor:
                        tooltipBg,
                      borderColor:
                        tooltipBorder,
                      borderRadius:
                        '12px',
                      fontSize:
                        '12px'
                    }}
                    formatter={(val) => [
                      formatCurrency(val),
                      'Exposure'
                    ]}
                  />

                  <Bar
                    dataKey="exposure"
                    fill={
                      isDark
                        ? '#4F9B78'
                        : '#2F6B57'
                    }
                    radius={[
                      0,
                      8,
                      8,
                      0
                    ]}
                    barSize={18}
                  />

                </BarChart>

              </ResponsiveContainer>

            ) : (

              <div className="h-[240px] flex items-center justify-center text-xs text-recon-light-muted dark:text-recon-dark-muted">

                No financial exposure detected

              </div>

            )}

          </ChartCard>

        </div>

        {/* RISK GAUGE */}

        <ChartCard
          title="Risk Index Gauge"
          subtitle="Calculated from reconciliation exceptions"
        >

          <div className="flex flex-col items-center justify-center h-full py-4 text-center">

            <div className="relative w-44 h-44 flex items-center justify-center rounded-full border-8 border-amber-500/20 bg-amber-500/5">

              <div className="text-center">

                <span className="text-4xl font-extrabold text-amber-600 dark:text-amber-400 block tracking-tight">

                  {riskScore}

                </span>

                <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">

                  {riskLabel}

                </span>

              </div>

            </div>

            <div className="grid grid-cols-4 gap-1 w-full mt-6 text-[10px] text-center font-bold">

              <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">

                0-30 Low

              </div>

              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300">

                31-60 Mod

              </div>

              <div className="p-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300">

                61-80 High

              </div>

              <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300">

                81-100 Crit

              </div>

            </div>

          </div>

        </ChartCard>

      </div>

      {/* =========================================
         AI ACTION QUEUE
      ========================================= */}

      <ActionQueue
        onInvestigateItem={() =>
          navigate('/investigation')
        }
      />

    </div>
  );
};