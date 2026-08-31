import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import {
  ShieldCheck,
  MailCheck,
  AlertCircle,
  Sparkles,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";


// ============================================================
// VERIFY EMAIL
// ============================================================

export const VerifyEmail = () => {

  const [
    searchParams,
  ] = useSearchParams();

  const navigate =
    useNavigate();

  const {
    verifyEmail,
  } = useAuth();

  const [status, setStatus] =
    useState("verifying");

  const [error, setError] =
    useState("");

  // ============================================================
  // VERIFY TOKEN
  // ============================================================

  useEffect(() => {

    const token =
      searchParams.get("token");

    if (!token) {

      setStatus("error");

      setError(
        "Verification link is missing or invalid."
      );

      return;
    }

    const verify = async () => {

      try {

        await verifyEmail(
          token
        );

        setStatus(
          "success"
        );

      } catch (err) {

        console.error(
          "Verification failed:",
          err
        );

        setStatus(
          "error"
        );

        setError(
          err.message ||
            "We couldn't verify your email address."
        );
      }
    };

    verify();

  }, [
    searchParams,
    verifyEmail,
  ]);

  // ============================================================
  // SUCCESS
  // ============================================================

  if (
    status === "success"
  ) {

    return (

      <div className="min-h-screen bg-recon-dark-bg text-white flex items-center justify-center px-5">

        <div className="w-full max-w-md text-center">

          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">

            <MailCheck className="w-8 h-8 text-emerald-400" />

          </div>

          <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-recon-dark-accent">

            <Sparkles className="w-3 h-3" />

            Account Verification

          </div>

          <h1 className="mt-3 text-2xl font-black">

            Email verified successfully

          </h1>

          <p className="mt-3 text-sm text-slate-400">

            Your ReconAI account is ready.

          </p>

          <p className="mt-2 text-xs text-slate-500">

            Please sign in to continue.

          </p>

          <Link
            to="/login"
            className="mt-7 inline-flex w-full items-center justify-center py-3.5 rounded-xl bg-recon-dark-accent text-white text-sm font-extrabold hover:opacity-90 transition-opacity"
          >
            Go to Login →
          </Link>

        </div>

      </div>

    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (
    status === "error"
  ) {

    return (

      <div className="min-h-screen bg-recon-dark-bg text-white flex items-center justify-center px-5">

        <div className="w-full max-w-md">

          <div className="flex justify-center mb-8">

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

          <div className="p-7 sm:p-9 rounded-2xl bg-recon-dark-card border border-white/10 shadow-2xl text-center">

            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">

              <AlertCircle className="w-7 h-7 text-rose-400" />

            </div>

            <div className="inline-flex items-center gap-1.5 mt-6 text-[10px] font-extrabold uppercase tracking-widest text-recon-dark-accent">

              <Sparkles className="w-3 h-3" />

              Account Verification

            </div>

            <h1 className="mt-2 text-2xl font-black">

              Verification failed

            </h1>

            <p className="mt-3 text-sm text-slate-400">

              We couldn't verify your email address.

            </p>

            <div className="mt-6 p-4 rounded-xl bg-rose-950/30 border border-rose-800/50 text-rose-300 text-sm flex items-start gap-3 text-left">

              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

              <span>

                {error}

              </span>

            </div>

            <Link
              to="/login"
              className="mt-6 flex w-full items-center justify-center py-3.5 rounded-xl bg-recon-dark-accent text-white text-sm font-extrabold hover:opacity-90 transition-opacity"
            >
              Go to Login →
            </Link>

          </div>

          <p className="text-center mt-6 text-[10px] text-slate-600">

            ReconAI Financial Intelligence

          </p>

        </div>

      </div>

    );
  }

  // ============================================================
  // VERIFYING
  // ============================================================

  return (

    <div className="min-h-screen bg-recon-dark-bg text-white flex items-center justify-center px-5">

      <div className="w-full max-w-md text-center">

        <div className="w-16 h-16 rounded-2xl bg-recon-dark-accent/10 border border-recon-dark-accent/20 flex items-center justify-center mx-auto mb-6">

          <MailCheck className="w-8 h-8 text-recon-dark-accent" />

        </div>

        <div className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-widest text-recon-dark-accent">

          <Sparkles className="w-3 h-3" />

          Account Verification

        </div>

        <h1 className="mt-3 text-2xl font-black">

          Verifying your email...

        </h1>

        <p className="mt-3 text-sm text-slate-400">

          Please wait while we verify your account.

        </p>

        <div className="mt-6 w-7 h-7 rounded-full border-2 border-white/20 border-t-recon-dark-accent animate-spin mx-auto" />

      </div>

    </div>

  );
};