import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

export const Login = () => {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ============================================================
  // LOGIN
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // ----------------------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------------------

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      // --------------------------------------------------------
      // CALL AUTH CONTEXT
      // --------------------------------------------------------

      await login(
        email.trim(),
        password
      );

      // --------------------------------------------------------
      // LOGIN SUCCESS
      // --------------------------------------------------------

      navigate("/", {
        replace: true,
      });

    } catch (err) {
      console.error(
        "Login error:",
        err
      );

      setError(
        err.message ||
          "Unable to login. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-recon-light-bg dark:bg-recon-dark-bg flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* ======================================================
            BRAND
        ====================================================== */}

        <div className="text-center mb-8">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-recon-forest dark:bg-recon-dark-accent text-white shadow-soft mb-4">

            <ShieldCheck className="w-7 h-7" />

          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-recon-light-text dark:text-recon-dark-text">

            Welcome back

          </h1>

          <p className="mt-2 text-sm text-recon-light-muted dark:text-recon-dark-muted">

            Sign in to continue to ReconAI

          </p>

        </div>


        {/* ======================================================
            LOGIN CARD
        ====================================================== */}

        <div className="bg-white dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border rounded-2xl shadow-soft p-6 sm:p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* ==================================================
                ERROR
            ================================================== */}

            {error && (

              <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 px-4 py-3">

                <p className="text-sm font-medium text-red-700 dark:text-red-300">

                  {error}

                </p>

              </div>

            )}


            {/* ==================================================
                EMAIL
            ================================================== */}

            <div>

              <label
                htmlFor="email"
                className="block text-xs font-extrabold text-recon-light-text dark:text-recon-dark-text mb-2"
              >
                Email address
              </label>

              <div className="relative">

                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-recon-light-muted dark:text-recon-dark-muted" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg border border-recon-light-border dark:border-recon-dark-border text-sm text-recon-light-text dark:text-recon-dark-text placeholder-recon-light-muted dark:placeholder-recon-dark-muted focus:outline-none focus:ring-2 focus:ring-recon-forest/20 dark:focus:ring-recon-dark-accent/20 focus:border-recon-forest dark:focus:border-recon-dark-accent disabled:opacity-60 transition-all"
                />

              </div>

            </div>


            {/* ==================================================
                PASSWORD
            ================================================== */}

            <div>

              <div className="flex items-center justify-between mb-2">

                <label
                  htmlFor="password"
                  className="block text-xs font-extrabold text-recon-light-text dark:text-recon-dark-text"
                >
                  Password
                </label>

              </div>

              <div className="relative">

                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-recon-light-muted dark:text-recon-dark-muted" />

                <input
                  id="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-recon-light-bg dark:bg-recon-dark-bg border border-recon-light-border dark:border-recon-dark-border text-sm text-recon-light-text dark:text-recon-dark-text placeholder-recon-light-muted dark:placeholder-recon-dark-muted focus:outline-none focus:ring-2 focus:ring-recon-forest/20 dark:focus:ring-recon-dark-accent/20 focus:border-recon-forest dark:focus:border-recon-dark-accent disabled:opacity-60 transition-all"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-recon-light-muted dark:text-recon-dark-muted hover:text-recon-light-text dark:hover:text-recon-dark-text transition-colors"
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}

                </button>

              </div>

            </div>


            {/* ==================================================
                LOGIN BUTTON
            ================================================== */}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-recon-forest dark:bg-recon-dark-accent text-white font-extrabold text-sm shadow-soft hover:bg-recon-forestHover disabled:opacity-60 disabled:cursor-not-allowed transition-all"
            >

              {loading ? (

                <>
                  <Loader2 className="w-4 h-4 animate-spin" />

                  Signing in...
                </>

              ) : (

                <>
                  Sign in

                  <ArrowRight className="w-4 h-4" />

                </>

              )}

            </button>

          </form>


          {/* ====================================================
              SIGNUP
          ==================================================== */}

          <div className="mt-6 pt-6 border-t border-recon-light-border dark:border-recon-dark-border text-center">

            <p className="text-sm text-recon-light-muted dark:text-recon-dark-muted">

              Don't have an account?{" "}

              <Link
                to="/signup"
                className="font-extrabold text-recon-forest dark:text-recon-dark-accent hover:underline"
              >
                Create one
              </Link>

            </p>

          </div>

        </div>


        {/* ======================================================
            BACK TO HOME
        ====================================================== */}

        <div className="text-center mt-6">

          <Link
            to="/home"
            className="text-xs font-bold text-recon-light-muted dark:text-recon-dark-muted hover:text-recon-light-text dark:hover:text-recon-dark-text transition-colors"
          >
            ← Back to ReconAI home
          </Link>

        </div>

      </div>

    </div>
  );
};