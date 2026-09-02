import React from 'react';
import { useNavigate } from 'react-router-dom';

import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileCheck2,
  AlertTriangle,
  BrainCircuit,
  CheckCircle2,
  LockKeyhole,
  Zap,
  Github,
  Linkedin,
  Mail,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-recon-light-bg dark:bg-recon-dark-bg text-recon-light-text dark:text-recon-dark-text">

      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="sticky top-0 z-40 border-b border-recon-light-border dark:border-recon-dark-border bg-white/90 dark:bg-recon-dark-card/90 backdrop-blur-xl">

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10">

          <div className="h-16 flex items-center justify-between">

            {/* LOGO */}

            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5"
            >

              <div className="w-9 h-9 rounded-xl bg-recon-forest dark:bg-recon-dark-accent flex items-center justify-center shadow-soft">

                <ShieldCheck className="w-5 h-5 text-white" />

              </div>

              <div className="text-left">

                <div className="font-black tracking-tight text-lg">
                  ReconAI
                </div>

                <div className="text-[9px] uppercase tracking-[0.18em] font-bold text-recon-light-muted dark:text-recon-dark-muted">
                  Financial Intelligence
                </div>

              </div>

            </button>


            {/* NAVIGATION */}

            <div className="flex items-center gap-2 sm:gap-3">

              {user ? (

                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white text-xs font-extrabold hover:bg-recon-forestHover transition-colors flex items-center gap-2"
                >

                  Open Dashboard

                  <ArrowRight className="w-4 h-4" />

                </button>

              ) : (

                <>

                  <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 rounded-xl text-xs font-extrabold text-recon-light-text dark:text-recon-dark-text hover:bg-recon-light-soft dark:hover:bg-recon-dark-cardHover transition-colors"
                  >
                    Sign In
                  </button>


                  <button
                    onClick={() => navigate('/signup')}
                    className="px-4 py-2 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white text-xs font-extrabold hover:bg-recon-forestHover transition-colors"
                  >
                    Get Started
                  </button>

                </>

              )}

            </div>

          </div>

        </div>

      </header>


      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="relative overflow-hidden">

        {/* Background decoration */}

        <div className="absolute inset-0 pointer-events-none">

          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-recon-forest/10 dark:bg-recon-dark-accent/10 blur-3xl" />

        </div>


        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 pt-16 sm:pt-24 pb-16">

          <div className="max-w-4xl mx-auto text-center">

            {/* BADGE */}

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-recon-light-soft dark:bg-recon-dark-cardHover border border-recon-light-border dark:border-recon-dark-border text-recon-forest dark:text-recon-dark-accent text-[10px] sm:text-xs font-extrabold uppercase tracking-wider mb-6">

              <Sparkles className="w-3.5 h-3.5" />

              AI-Powered Financial Reconciliation

            </div>


            {/* TITLE */}

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">

              Reconcile Financial Data

              <span className="block text-recon-forest dark:text-recon-dark-accent mt-2">

                Smarter with AI

              </span>

            </h1>


            {/* DESCRIPTION */}

            <p className="mt-6 max-w-2xl mx-auto text-sm sm:text-base text-recon-light-muted dark:text-recon-dark-muted leading-relaxed font-medium">

              ReconAI automatically compares bank and ledger transactions,
              identifies discrepancies, evaluates financial risk, and provides
              intelligent investigation recommendations — all in one platform.

            </p>


            {/* ACTIONS */}

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">

              <button
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white font-extrabold text-sm shadow-soft hover:bg-recon-forestHover transition-colors flex items-center justify-center gap-2"
              >

                {user ? 'Go to Dashboard' : 'Start Reconciliation'}

                <ArrowRight className="w-4 h-4" />

              </button>


              {!user && (

                <button
                  onClick={() => navigate('/login')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-recon-light-text dark:text-recon-dark-text font-extrabold text-sm hover:bg-recon-light-soft dark:hover:bg-recon-dark-cardHover transition-colors"
                >

                  Sign In

                </button>

              )}

            </div>


            {/* TRUST */}

            <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[10px] sm:text-xs text-recon-light-muted dark:text-recon-dark-muted font-bold">

              <span className="flex items-center gap-1.5">

                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />

                Automated Matching

              </span>


              <span className="flex items-center gap-1.5">

                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />

                AI Investigation

              </span>


              <span className="flex items-center gap-1.5">

                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />

                Financial Risk Analysis

              </span>

            </div>

          </div>


          {/* =========================================================
              DASHBOARD PREVIEW
          ========================================================= */}

          <div className="mt-14 max-w-6xl mx-auto">

            <div className="rounded-2xl border border-recon-light-border dark:border-recon-dark-border bg-white dark:bg-recon-dark-card shadow-2xl overflow-hidden">

              {/* Browser bar */}

              <div className="h-10 px-4 flex items-center gap-2 border-b border-recon-light-border dark:border-recon-dark-border bg-recon-light-bg dark:bg-recon-dark-bg">

                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />

                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />

                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />

                <div className="ml-4 flex-1 max-w-md mx-auto h-5 rounded-md bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border" />

              </div>


              {/* Preview */}

              <div className="p-5 sm:p-8">

                <div className="flex items-center justify-between mb-6">

                  <div>

                    <p className="text-[10px] uppercase tracking-wider font-bold text-recon-light-muted dark:text-recon-dark-muted">
                      Financial Intelligence
                    </p>

                    <h2 className="text-xl sm:text-2xl font-black mt-1">
                      Reconciliation Dashboard
                    </h2>

                  </div>


                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold">

                    <CheckCircle2 className="w-4 h-4" />

                    Analysis Complete

                  </div>

                </div>


                {/* Preview cards */}

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                  <PreviewCard
                    icon={<BarChart3 className="w-4 h-4" />}
                    label="Transactions"
                    value="1,248"
                  />


                  <PreviewCard
                    icon={<FileCheck2 className="w-4 h-4" />}
                    label="Matched"
                    value="1,176"
                    positive
                  />


                  <PreviewCard
                    icon={<AlertTriangle className="w-4 h-4" />}
                    label="Exceptions"
                    value="72"
                    danger
                  />


                  <PreviewCard
                    icon={<ShieldCheck className="w-4 h-4" />}
                    label="Risk Score"
                    value="24 / 100"
                  />

                </div>


                {/* Preview table */}

                <div className="mt-5 border border-recon-light-border dark:border-recon-dark-border rounded-xl overflow-hidden">

                  <div className="grid grid-cols-4 gap-3 px-4 py-3 bg-recon-light-bg dark:bg-recon-dark-bg text-[9px] uppercase tracking-wider font-extrabold text-recon-light-muted dark:text-recon-dark-muted">

                    <span>Bank Reference</span>

                    <span>Ledger Reference</span>

                    <span>Amount</span>

                    <span>Status</span>

                  </div>


                  {[1, 2, 3, 4].map((item) => (

                    <div
                      key={item}
                      className="grid grid-cols-4 gap-3 px-4 py-3 border-t border-recon-light-border dark:border-recon-dark-border text-[10px] font-semibold"
                    >

                      <span>
                        BANK-{String(item).padStart(4, '0')}
                      </span>


                      <span>
                        LEDGER-{String(item).padStart(4, '0')}
                      </span>


                      <span>
                        ₹{(12500 * item).toLocaleString()}
                      </span>


                      <span className="text-emerald-600 dark:text-emerald-400">
                        MATCHED
                      </span>

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          FEATURES
      ========================================================= */}

      <section className="bg-white dark:bg-recon-dark-card border-y border-recon-light-border dark:border-recon-dark-border">

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16">

          <div className="text-center max-w-2xl mx-auto mb-10">

            <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-recon-forest dark:text-recon-dark-accent">
              Built for Financial Teams
            </p>


            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              Everything you need to reconcile with confidence
            </h2>


            <p className="text-sm text-recon-light-muted dark:text-recon-dark-muted mt-3 font-medium">
              From transaction matching to risk investigation and reporting,
              ReconAI keeps the entire reconciliation workflow in one place.
            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

            <FeatureCard
              icon={<Zap />}
              title="Automated Reconciliation"
              description="Compare bank and ledger transactions quickly and identify successful matches automatically."
            />


            <FeatureCard
              icon={<AlertTriangle />}
              title="Exception Detection"
              description="Identify amount mismatches, missing transactions, settlement delays and possible duplicates."
            />


            <FeatureCard
              icon={<BrainCircuit />}
              title="AI Investigation"
              description="Use AI-powered investigation results to understand risk and prioritize financial exceptions."
            />


            <FeatureCard
              icon={<BarChart3 />}
              title="Financial Reporting"
              description="Generate detailed financial intelligence reports with reconciliation metrics and risk insights."
            />

          </div>

        </div>

      </section>


      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}

      <section>

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-16">

          <div className="text-center mb-10">

            <p className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-recon-forest dark:text-recon-dark-accent">
              Simple Workflow
            </p>


            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              From raw data to financial intelligence
            </h2>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            <StepCard
              number="01"
              title="Upload Data"
              description="Upload your bank and ledger CSV files into ReconAI."
            />


            <StepCard
              number="02"
              title="Run Reconciliation"
              description="ReconAI compares transactions and identifies matches and exceptions."
            />


            <StepCard
              number="03"
              title="Investigate & Report"
              description="Review AI insights, analyze risk and generate a complete PDF report."
            />

          </div>

        </div>

      </section>


      {/* =========================================================
          SECURITY
      ========================================================= */}

      <section className="pb-16">

        <div className="max-w-5xl mx-auto px-5 sm:px-8">

          <div className="rounded-2xl bg-recon-forest dark:bg-recon-dark-accent p-7 sm:p-10 text-white">

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-7">

              <div>

                <div className="flex items-center gap-2 mb-3">

                  <LockKeyhole className="w-5 h-5" />

                  <span className="text-xs uppercase tracking-wider font-extrabold">
                    Secure Financial Intelligence
                  </span>

                </div>


                <h2 className="text-2xl sm:text-3xl font-black">
                  Keep every reconciliation run organized.
                </h2>


                <p className="text-sm text-white/75 mt-3 max-w-xl leading-relaxed">
                  With authenticated accounts, each user's reconciliation
                  history can remain separated and associated with their own
                  account.
                </p>

              </div>


              <button
                onClick={() => navigate(user ? '/dashboard' : '/signup')}
                className="shrink-0 px-6 py-3 rounded-xl bg-white text-recon-forest font-extrabold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >

                {user ? 'Open Dashboard' : 'Create Account'}

                <ArrowRight className="w-4 h-4" />

              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          DEVELOPER FOOTER
      ========================================================= */}

      <footer className="border-t border-recon-light-border dark:border-recon-dark-border bg-white dark:bg-recon-dark-card">

        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-10 py-10">

          <div className="flex flex-col md:flex-row items-center justify-between gap-8">

            {/* RECONAI */}

            <div className="text-center md:text-left">

              <div className="flex items-center justify-center md:justify-start gap-2">

                <div className="w-9 h-9 rounded-xl bg-recon-forest dark:bg-recon-dark-accent flex items-center justify-center">

                  <ShieldCheck className="w-5 h-5 text-white" />

                </div>


                <div>

                  <p className="text-sm font-black">
                    ReconAI
                  </p>

                  <p className="text-[9px] uppercase tracking-wider font-bold text-recon-light-muted dark:text-recon-dark-muted">
                    Financial Intelligence
                  </p>

                </div>

              </div>


              <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted font-medium mt-3">
                AI-powered financial reconciliation and intelligence.
              </p>

            </div>


            {/* DEVELOPER */}

            <div className="text-center md:text-right">

              <p className="text-sm font-black">

                Built by{' '}

                <span className="text-recon-forest dark:text-recon-dark-accent uppercase">
                  NEELAM ANJALI
                </span>

              </p>


              <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted mt-1 font-medium">
                Computer Science and Engineering • Final Year
              </p>


              <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted mt-1 font-medium">
                Passionate about AI, Technology & Creative Development
              </p>


              {/* SOCIAL LINKS */}

              <div className="flex items-center justify-center md:justify-end gap-3 mt-4">

                {/* GITHUB */}

                <a
                  href="https://github.com/Anjali112005"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Neelam Anjali GitHub"
                  className="w-9 h-9 rounded-lg border border-recon-light-border dark:border-recon-dark-border bg-recon-light-bg dark:bg-recon-dark-bg flex items-center justify-center text-recon-light-text dark:text-recon-dark-text hover:text-recon-forest dark:hover:text-recon-dark-accent hover:border-recon-forest dark:hover:border-recon-dark-accent transition-colors"
                >

                  <Github className="w-4 h-4" />

                </a>


                {/* LINKEDIN */}

                <a
                  href="https://www.linkedin.com/in/anjali-neelam-a1a1422a6/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Neelam Anjali LinkedIn"
                  className="w-9 h-9 rounded-lg border border-recon-light-border dark:border-recon-dark-border bg-recon-light-bg dark:bg-recon-dark-bg flex items-center justify-center text-recon-light-text dark:text-recon-dark-text hover:text-recon-forest dark:hover:text-recon-dark-accent hover:border-recon-forest dark:hover:border-recon-dark-accent transition-colors"
                >

                  <Linkedin className="w-4 h-4" />

                </a>


                {/* EMAIL */}

                <a
                  href="mailto:anjalineelam11@gmail.com"
                  aria-label="Email Neelam Anjali"
                  className="w-9 h-9 rounded-lg border border-recon-light-border dark:border-recon-dark-border bg-recon-light-bg dark:bg-recon-dark-bg flex items-center justify-center text-recon-light-text dark:text-recon-dark-text hover:text-recon-forest dark:hover:text-recon-dark-accent hover:border-recon-forest dark:hover:border-recon-dark-accent transition-colors"
                >

                  <Mail className="w-4 h-4" />

                </a>

              </div>

            </div>

          </div>

        </div>

      </footer>

    </div>
  );
};


/* =========================================================
   PREVIEW CARD
========================================================= */

const PreviewCard = ({
  icon,
  label,
  value,
  positive = false,
  danger = false,
}) => {

  return (

    <div className="p-4 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg border border-recon-light-border dark:border-recon-dark-border">

      <div className="flex items-center gap-2 text-recon-light-muted dark:text-recon-dark-muted">

        {icon}

        <span className="text-[9px] uppercase font-bold tracking-wide">
          {label}
        </span>

      </div>


      <p
        className={`text-lg sm:text-xl font-black mt-2 ${
          positive
            ? 'text-emerald-600 dark:text-emerald-400'
            : danger
              ? 'text-rose-600 dark:text-rose-400'
              : ''
        }`}
      >
        {value}
      </p>

    </div>

  );
};


/* =========================================================
   FEATURE CARD
========================================================= */

const FeatureCard = ({
  icon,
  title,
  description,
}) => {

  return (

    <div className="p-5 rounded-2xl bg-recon-light-bg dark:bg-recon-dark-bg border border-recon-light-border dark:border-recon-dark-border hover:-translate-y-1 transition-transform">

      <div className="w-10 h-10 rounded-xl bg-recon-light-soft dark:bg-recon-dark-cardHover text-recon-forest dark:text-recon-dark-accent flex items-center justify-center mb-4">

        {React.cloneElement(icon, {
          className: 'w-5 h-5',
        })}

      </div>


      <h3 className="text-sm font-extrabold">
        {title}
      </h3>


      <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted mt-2 leading-relaxed font-medium">
        {description}
      </p>

    </div>

  );
};


/* =========================================================
   STEP CARD
========================================================= */

const StepCard = ({
  number,
  title,
  description,
}) => {

  return (

    <div className="relative p-6 rounded-2xl bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border shadow-soft">

      <span className="text-4xl font-black text-recon-light-border dark:text-recon-dark-border">
        {number}
      </span>


      <h3 className="text-base font-extrabold mt-3">
        {title}
      </h3>


      <p className="text-xs text-recon-light-muted dark:text-recon-dark-muted mt-2 leading-relaxed font-medium">
        {description}
      </p>

    </div>

  );
};