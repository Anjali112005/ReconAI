import React, { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";

import { ThemeProvider } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";

import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { FloatingCopilot } from "./components/FloatingCopilot";

import { Dashboard } from "./pages/Dashboard";
import { UploadData } from "./pages/UploadData";
import { Reconciliation } from "./pages/Reconciliation";
import { RiskCenter } from "./pages/RiskCenter";
import { AIInvestigation } from "./pages/AIInvestigation";
import { Reports } from "./pages/Reports";
import { History } from "./pages/History";

import { Profile } from "./pages/Profile";
import { SettingsPage } from "./pages/Settings";

import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { VerifyEmail } from "./pages/VerifyEmail";


/* =========================================================
   PUBLIC ROUTE
   ========================================================= */

const PublicRoute = () => {

  const {
    isAuthenticated,
    loading,
  } = useAuth();


  if (loading) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-recon-light-bg
          dark:bg-recon-dark-bg
        "
      >

        <div
          className="
            flex
            flex-col
            items-center
            gap-3
          "
        >

          <div
            className="
              w-8
              h-8
              border-4
              border-recon-light-border
              dark:border-recon-dark-border
              border-t-recon-forest
              dark:border-t-recon-dark-accent
              rounded-full
              animate-spin
            "
          />

          <p
            className="
              text-xs
              font-bold
              text-recon-light-muted
              dark:text-recon-dark-muted
            "
          >
            Loading...
          </p>

        </div>

      </div>

    );

  }


  if (isAuthenticated) {

    return (

      <Navigate
        to="/dashboard"
        replace
      />

    );

  }


  return <Outlet />;

};


/* =========================================================
   PROTECTED ROUTE
   ========================================================= */

const ProtectedRoute = () => {

  const {

    isAuthenticated,

    loading,

  } = useAuth();


  if (loading) {

    return (

      <div
        className="
          min-h-screen
          flex
          items-center
          justify-center
          bg-recon-light-bg
          dark:bg-recon-dark-bg
        "
      >

        <div
          className="
            flex
            flex-col
            items-center
            gap-3
          "
        >

          <div
            className="
              w-8
              h-8
              border-4
              border-recon-light-border
              dark:border-recon-dark-border
              border-t-recon-forest
              dark:border-t-recon-dark-accent
              rounded-full
              animate-spin
            "
          />

          <p
            className="
              text-xs
              font-bold
              text-recon-light-muted
              dark:text-recon-dark-muted
            "
          >
            Checking authentication...
          </p>

        </div>

      </div>

    );

  }


  if (!isAuthenticated) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  return <Outlet />;

};


/* =========================================================
   APPLICATION LAYOUT
   ========================================================= */

const DashboardLayout = () => {

  const [

    isSidebarOpen,

    setIsSidebarOpen,

  ] = useState(false);


  return (

    <div
      className="
        min-h-screen
        bg-recon-light-bg
        dark:bg-recon-dark-bg
        text-recon-light-text
        dark:text-recon-dark-text
        transition-colors
        duration-200
        flex
        relative
      "
    >

      <Sidebar

        isOpen={
          isSidebarOpen
        }

        onClose={() =>
          setIsSidebarOpen(false)
        }

      />


      <div
        className="
          flex-1
          flex
          flex-col
          min-w-0
          lg:pl-64
        "
      >

        <Header

          onOpenSidebar={() =>
            setIsSidebarOpen(true)
          }

        />


        <main
          className="
            flex-1
            p-4
            sm:p-6
            lg:p-8
            max-w-7xl
            w-full
            mx-auto
          "
        >

          <Outlet />

        </main>

      </div>


      <FloatingCopilot />

    </div>

  );

};


/* =========================================================
   APP
   ========================================================= */

export default function App() {

  return (

    <ThemeProvider>

      <BrowserRouter>

        <Routes>


          {/* ===============================================
              PUBLIC ROUTES
             =============================================== */}

          <Route
            element={<PublicRoute />}
          >

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/signup"
              element={<Signup />}
            />

            <Route
              path="/verify-email"
              element={<VerifyEmail />}
            />

          </Route>


          {/* ===============================================
              PROTECTED ROUTES
             =============================================== */}

          <Route
            element={<ProtectedRoute />}
          >

            <Route
              element={<DashboardLayout />}
            >


              <Route
                path="/dashboard"
                element={<Dashboard />}
              />


              <Route
                path="/upload"
                element={<UploadData />}
              />


              <Route
                path="/reconciliation"
                element={<Reconciliation />}
              />


              <Route
                path="/risk-center"
                element={<RiskCenter />}
              />


              <Route
                path="/investigation"
                element={<AIInvestigation />}
              />


              <Route
                path="/reports"
                element={<Reports />}
              />


              <Route
                path="/history"
                element={<History />}
              />


              {/* ===========================================
                  MY PROFILE
                 =========================================== */}

              <Route
                path="/profile"
                element={<Profile />}
              />


              {/* ===========================================
                  SETTINGS
                 =========================================== */}

              <Route
                path="/settings"
                element={<SettingsPage />}
              />


              {/* ===========================================
                  DEFAULT PROTECTED ROUTE
                 =========================================== */}

              <Route
                path="*"
                element={
                  <Navigate
                    to="/dashboard"
                    replace
                  />
                }
              />


            </Route>

          </Route>


          {/* ===============================================
              GLOBAL FALLBACK
             =============================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />


        </Routes>

      </BrowserRouter>

    </ThemeProvider>

  );

}