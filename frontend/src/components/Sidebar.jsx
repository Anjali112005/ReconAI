import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  ShieldAlert,
  BrainCircuit,
  FileSpreadsheet,
  History,
  ShieldCheck,
  X,
  Radio
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/upload', label: 'Upload Data', icon: Upload },
    { path: '/reconciliation', label: 'Reconciliation', icon: BarChart3 },
    { path: '/risk-center', label: 'Risk Center', icon: ShieldAlert },
    { path: '/investigation', label: 'AI Investigation', icon: BrainCircuit },
    { path: '/reports', label: 'Reports', icon: FileSpreadsheet },
    { path: '/history', label: 'History', icon: History },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-64 bg-white dark:bg-recon-dark-sidebar border-r border-recon-light-border dark:border-recon-dark-border z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Top Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-recon-light-border/60 dark:border-recon-dark-border/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-recon-forest dark:bg-recon-dark-accent flex items-center justify-center text-white shadow-soft">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg leading-tight tracking-tight text-recon-light-text dark:text-recon-dark-text">
                  ReconAI
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-wider text-recon-forest dark:text-recon-dark-accent">
                  Financial Intelligence
                </p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-recon-light-muted dark:text-recon-dark-muted hover:bg-gray-100 dark:hover:bg-recon-dark-card"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all relative ${
                      isActive
                        ? 'bg-recon-light-soft dark:bg-recon-dark-cardHover text-recon-forest dark:text-recon-dark-accent shadow-sm'
                        : 'text-recon-light-muted dark:text-recon-dark-muted hover:bg-gray-100/70 dark:hover:bg-recon-dark-card/60 hover:text-recon-light-text dark:hover:text-recon-dark-text'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-recon-forest dark:bg-recon-dark-accent rounded-r-full" />
                      )}
                      <Icon className={`w-4 h-4 ${isActive ? 'text-recon-forest dark:text-recon-dark-accent' : 'text-recon-light-muted dark:text-recon-dark-muted'}`} />
                      <span>{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Engine Status Card */}
        <div className="p-4 border-t border-recon-light-border/60 dark:border-recon-dark-border/60">
          <div className="p-3 rounded-xl bg-recon-light-bg dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-recon-light-text dark:text-recon-dark-text flex items-center gap-1.5">
                <Radio className="w-3 h-3 text-recon-forest dark:text-recon-dark-accent animate-pulse" />
                Intelligence Engine
              </p>
              <p className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted mt-0.5">
                v2.4 Neural Match
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Online
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
