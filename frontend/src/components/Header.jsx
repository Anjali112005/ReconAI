import React from 'react';
import { Menu, Search, Bell, Sparkles } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

export const Header = ({ onOpenSidebar }) => {
  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-recon-dark-bg/80 backdrop-blur-md border-b border-recon-light-border dark:border-recon-dark-border px-4 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-recon-light-muted dark:text-recon-dark-muted hover:bg-gray-100 dark:hover:bg-recon-dark-card"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative hidden md:block w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-recon-light-muted dark:text-recon-dark-muted" />
          <input
            type="text"
            placeholder="Search transactions, reference IDs, cases..."
            className="w-full pl-9 pr-4 py-1.5 text-xs font-medium rounded-xl bg-recon-light-bg dark:bg-recon-dark-card border border-recon-light-border dark:border-recon-dark-border text-recon-light-text dark:text-recon-dark-text placeholder-recon-light-muted dark:placeholder-recon-dark-muted focus:outline-none focus:ring-2 focus:ring-recon-forest/20 dark:focus:ring-recon-dark-accent/20 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick AI Status Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-recon-light-soft dark:bg-recon-dark-cardHover border border-recon-forest/10 dark:border-recon-dark-accent/20 text-recon-forest dark:text-recon-dark-accent text-[11px] font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Audit Ready</span>
        </div>

        {/* Notifications Button */}
        <button className="p-2 rounded-xl text-recon-light-muted dark:text-recon-dark-muted hover:bg-gray-100 dark:hover:bg-recon-dark-card relative transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-recon-dark-bg" />
        </button>

        {/* Theme Selector */}
        <ThemeToggle />

        {/* Divider */}
        <div className="h-6 w-px bg-recon-light-border dark:bg-recon-dark-border mx-1" />

        {/* User Profile Avatar (No Auth) */}
        <div className="flex items-center gap-2.5 pl-1">
          <div className="w-8 h-8 rounded-full bg-recon-forest dark:bg-recon-dark-accent text-white flex items-center justify-center font-bold text-xs shadow-sm">
            NA
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <p className="text-xs font-bold text-recon-light-text dark:text-recon-dark-text">
              Anjali M.
            </p>
            <p className="text-[10px] text-recon-light-muted dark:text-recon-dark-muted font-medium">
              Lead CFO Analyst
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};
