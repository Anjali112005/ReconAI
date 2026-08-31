import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  MailCheck,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';


export const Signup = () => {

  const navigate = useNavigate();

  const {
    signup,
  } = useAuth();


  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [accountCreated, setAccountCreated] =
    useState(false);


  /* =========================================
     SIGNUP
  ========================================= */

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError('');


    /* -----------------------------------------
       PASSWORD MATCH
    ----------------------------------------- */

    if (password !== confirmPassword) {

      setError(
        'Passwords do not match.'
      );

      return;

    }


    /* -----------------------------------------
       PASSWORD LENGTH
    ----------------------------------------- */

    if (password.length < 8) {

      setError(
        'Password must contain at least 8 characters.'
      );

      return;

    }


    setIsLoading(true);


    try {

      const result =
        await signup({

          name: name.trim(),

          email: email.trim(),

          password,

        });


      /*
       * Account creation succeeded.
       *
       * The backend sends the verification
       * link by email.
       *
       * We do NOT navigate directly to the
       * verification page because the user
       * needs to open the email first.
       */

      if (
        result?.requiresVerification ||
        result?.user ||
        result?.message
      ) {

        setAccountCreated(true);

        return;

      }


      /*
       * Fallback in case the API returns
       * a different successful response.
       */

      setAccountCreated(true);

    } catch (err) {

      setError(
        err?.message ||
        'Unable to create your account.'
      );

    } finally {

      setIsLoading(false);

    }

  };


  /* =========================================
     CHECK YOUR EMAIL SCREEN
  ========================================= */

  if (accountCreated) {

    return (

      <div className="min-h-screen bg-recon-dark-bg text-white flex items-center justify-center px-5 py-10">


        <div className="w-full max-w-md">


          {/* LOGO */}

          <div className="flex justify-center mb-10">

            <Link
              to="/"
              className="flex items-center gap-3"
            >

              <div className="w-11 h-11 rounded-xl bg-recon-forest flex items-center justify-center">

                <ShieldCheck className="w-6 h-6" />

              </div>


              <div className="text-left">

                <div className="font-extrabold">

                  ReconAI

                </div>


                <div className="text-[9px] uppercase tracking-widest text-recon-dark-accent font-bold">

                  Financial Intelligence

                </div>

              </div>

            </Link>

          </div>


          {/* CARD */}

          <div className="p-8 sm:p-9 rounded-2xl bg-recon-dark-card border border-white/10 shadow-2xl text-center">


            {/* MAIL ICON */}

            <div className="w-16 h-16 rounded-2xl bg-recon-dark-accent/10 border border-recon-dark-accent/20 flex items-center justify-center mx-auto">

              <MailCheck className="w-8 h-8 text-recon-dark-accent" />

            </div>


            {/* LABEL */}

            <div className="mt-6 inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-recon-dark-accent">

              <Sparkles className="w-3 h-3" />

              Account Created

            </div>


            {/* TITLE */}

            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight">

              Check your email

            </h1>


            {/* DESCRIPTION */}

            <p className="mt-4 text-sm text-slate-400 leading-relaxed">

              We've sent a verification link to:

            </p>


            {/* EMAIL */}

            <div className="mt-3 px-4 py-3 rounded-xl bg-recon-dark-bg border border-white/10">

              <p className="text-sm font-bold text-white break-all">

                {email}

              </p>

            </div>


            {/* INSTRUCTIONS */}

            <div className="mt-6 p-4 rounded-xl bg-recon-dark-accent/5 border border-recon-dark-accent/10 text-left">

              <div className="flex items-start gap-3">

                <Mail className="w-5 h-5 text-recon-dark-accent shrink-0 mt-0.5" />

                <div>

                  <p className="text-sm font-bold text-slate-200">

                    Verify your email address

                  </p>


                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">

                    Open the email from ReconAI and click the verification link. Your account will be verified automatically.

                  </p>

                </div>

              </div>

            </div>


            {/* SPAM NOTE */}

            <p className="mt-5 text-[11px] text-slate-500 leading-relaxed">

              Didn't receive the email? Check your spam or junk folder.

            </p>


            {/* LOGIN BUTTON */}

            <button

              type="button"

              onClick={() =>
                navigate('/login')
              }

              className="mt-7 w-full py-3.5 rounded-xl bg-recon-dark-accent text-white text-sm font-extrabold shadow-soft hover:opacity-90 transition-opacity flex items-center justify-center gap-2"

            >

              Go to Login

              <ArrowRight className="w-4 h-4" />

            </button>


            {/* BACK */}

            <button

              type="button"

              onClick={() =>
                setAccountCreated(false)
              }

              className="mt-5 text-xs text-slate-500 hover:text-recon-dark-accent transition-colors"

            >

              ← Create another account

            </button>

          </div>


          {/* FOOTER */}

          <p className="text-center mt-6 text-[10px] text-slate-600">

            ReconAI Financial Intelligence

          </p>

        </div>

      </div>

    );

  }


  /* =========================================
     SIGNUP FORM
  ========================================= */

  return (

    <div className="min-h-screen bg-recon-dark-bg text-white flex">


      {/* =========================================
         LEFT PANEL
      ========================================= */}

      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden border-r border-white/5">


        <div className="absolute inset-0 bg-recon-forest/10" />

        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-recon-forest/20 blur-[140px]" />


        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">


          {/* LOGO */}

          <Link
            to="/"
            className="flex items-center gap-3 w-fit"
          >

            <div className="w-11 h-11 rounded-xl bg-recon-forest flex items-center justify-center">

              <ShieldCheck className="w-6 h-6" />

            </div>


            <div>

              <div className="text-lg font-extrabold">

                ReconAI

              </div>


              <div className="text-[9px] uppercase tracking-[0.18em] text-recon-dark-accent font-bold">

                Financial Intelligence

              </div>

            </div>

          </Link>


          {/* CONTENT */}

          <div className="max-w-lg">


            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-recon-dark-accent/10 border border-recon-dark-accent/20 text-recon-dark-accent text-[10px] font-extrabold uppercase tracking-wider mb-6">

              <Sparkles className="w-3.5 h-3.5" />

              Start Your Intelligence Workspace

            </div>


            <h1 className="text-4xl xl:text-5xl font-black leading-tight tracking-tight">

              Build smarter

              <span className="block text-recon-dark-accent">

                financial workflows.

              </span>

            </h1>


            <p className="mt-6 text-sm text-slate-400 leading-relaxed">

              Create your ReconAI account and bring
              reconciliation, risk analysis and AI
              investigation together in one workspace.

            </p>


            <div className="mt-8 space-y-3">

              <SignupBenefit
                text="Automated transaction reconciliation"
              />

              <SignupBenefit
                text="AI-powered exception investigation"
              />

              <SignupBenefit
                text="Professional financial reports"
              />

              <SignupBenefit
                text="Complete reconciliation history"
              />

            </div>

          </div>


          {/* FOOTER */}

          <p className="text-xs text-slate-600">

            ReconAI Financial Intelligence

          </p>

        </div>

      </div>


      {/* =========================================
         SIGNUP PANEL
      ========================================= */}

      <div className="flex-1 flex items-center justify-center px-5 py-10 overflow-y-auto">


        <div className="w-full max-w-md">


          {/* MOBILE LOGO */}

          <div className="lg:hidden flex justify-center mb-9">

            <Link
              to="/"
              className="flex items-center gap-3"
            >

              <div className="w-11 h-11 rounded-xl bg-recon-forest flex items-center justify-center">

                <ShieldCheck className="w-6 h-6" />

              </div>


              <div>

                <div className="font-extrabold">

                  ReconAI

                </div>


                <div className="text-[9px] uppercase tracking-widest text-recon-dark-accent font-bold">

                  Financial Intelligence

                </div>

              </div>

            </Link>

          </div>


          {/* HEADER */}

          <div className="mb-7">

            <p className="text-xs uppercase tracking-widest text-recon-dark-accent font-extrabold">

              New Account

            </p>


            <h2 className="mt-2 text-3xl font-black tracking-tight">

              Create your account

            </h2>


            <p className="mt-3 text-sm text-slate-400">

              Start using ReconAI with your email address.

            </p>

          </div>


          {/* ERROR */}

          {error && (

            <div className="mb-5 p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-xs font-medium flex items-start gap-2">

              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

              <span>

                {error}

              </span>

            </div>

          )}


          {/* FORM */}

          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >


            {/* NAME */}

            <div>

              <label className="block text-xs font-bold text-slate-300 mb-2">

                Full Name

              </label>


              <div className="relative">

                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />


                <input

                  type="text"

                  value={name}

                  onChange={(event) =>
                    setName(
                      event.target.value
                    )
                  }

                  placeholder="Your full name"

                  autoComplete="name"

                  required

                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-recon-dark-card border border-white/10 text-white text-sm placeholder:text-slate-600 outline-none focus:border-recon-dark-accent/60 focus:ring-2 focus:ring-recon-dark-accent/10 transition"

                />

              </div>

            </div>


            {/* EMAIL */}

            <div>

              <label className="block text-xs font-bold text-slate-300 mb-2">

                Email Address

              </label>


              <div className="relative">

                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />


                <input

                  type="email"

                  value={email}

                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }

                  placeholder="you@example.com"

                  autoComplete="email"

                  required

                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-recon-dark-card border border-white/10 text-white text-sm placeholder:text-slate-600 outline-none focus:border-recon-dark-accent/60 focus:ring-2 focus:ring-recon-dark-accent/10 transition"

                />

              </div>

            </div>


            {/* PASSWORD */}

            <div>

              <label className="block text-xs font-bold text-slate-300 mb-2">

                Password

              </label>


              <div className="relative">

                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />


                <input

                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }

                  value={password}

                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }

                  placeholder="At least 8 characters"

                  autoComplete="new-password"

                  required

                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-recon-dark-card border border-white/10 text-white text-sm placeholder:text-slate-600 outline-none focus:border-recon-dark-accent/60 focus:ring-2 focus:ring-recon-dark-accent/10 transition"

                />


                <button

                  type="button"

                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }

                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"

                >

                  {showPassword ? (

                    <EyeOff className="w-4 h-4" />

                  ) : (

                    <Eye className="w-4 h-4" />

                  )}

                </button>

              </div>

            </div>


            {/* CONFIRM PASSWORD */}

            <div>

              <label className="block text-xs font-bold text-slate-300 mb-2">

                Confirm Password

              </label>


              <div className="relative">

                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />


                <input

                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }

                  value={confirmPassword}

                  onChange={(event) =>
                    setConfirmPassword(
                      event.target.value
                    )
                  }

                  placeholder="Repeat your password"

                  autoComplete="new-password"

                  required

                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-recon-dark-card border border-white/10 text-white text-sm placeholder:text-slate-600 outline-none focus:border-recon-dark-accent/60 focus:ring-2 focus:ring-recon-dark-accent/10 transition"

                />


                <button

                  type="button"

                  onClick={() =>
                    setShowConfirmPassword(
                      (previous) =>
                        !previous
                    )
                  }

                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"

                >

                  {showConfirmPassword ? (

                    <EyeOff className="w-4 h-4" />

                  ) : (

                    <Eye className="w-4 h-4" />

                  )}

                </button>

              </div>

            </div>


            {/* EMAIL NOTE */}

            <div className="p-3 rounded-xl bg-recon-dark-accent/5 border border-recon-dark-accent/10">

              <p className="text-[11px] text-slate-400 leading-relaxed">

                After creating your account, we'll send a verification link to your email. You must verify your email before logging in.

              </p>

            </div>


            {/* SUBMIT */}

            <button

              type="submit"

              disabled={isLoading}

              className="w-full py-3.5 rounded-xl bg-recon-dark-accent text-white text-sm font-extrabold shadow-soft hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"

            >

              {isLoading ? (

                <>

                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />

                  Creating account...

                </>

              ) : (

                <>

                  Create Account

                  <ArrowRight className="w-4 h-4" />

                </>

              )}

            </button>

          </form>


          {/* LOGIN */}

          <div className="mt-7 text-center text-xs text-slate-500">

            Already have an account?

            {' '}

            <Link
              to="/login"
              className="text-recon-dark-accent font-extrabold hover:underline"
            >

              Sign in

            </Link>

          </div>


          {/* BACK */}

          <div className="mt-5 text-center">

            <Link
              to="/"
              className="text-[11px] text-slate-600 hover:text-slate-400 transition-colors"
            >

              ← Back to ReconAI

            </Link>

          </div>

        </div>

      </div>

    </div>

  );

};


/* =========================================
   SIGNUP BENEFIT
========================================= */

const SignupBenefit = ({
  text,
}) => {

  return (

    <div className="flex items-center gap-2.5 text-xs text-slate-400">

      <CheckCircle2 className="w-4 h-4 text-recon-dark-accent shrink-0" />

      {text}

    </div>

  );

};