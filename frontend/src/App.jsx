import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FloatingCopilot } from './components/FloatingCopilot';
import { Dashboard } from './pages/Dashboard';
import { UploadData } from './pages/UploadData';
import { Reconciliation } from './pages/Reconciliation';
import { RiskCenter } from './pages/RiskCenter';
import { AIInvestigation } from './pages/AIInvestigation';
import { Reports } from './pages/Reports';
import { History } from './pages/History';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-recon-light-bg dark:bg-recon-dark-bg text-recon-light-text dark:text-recon-dark-text transition-colors duration-200 flex relative">
          {/* Responsive Sidebar */}
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Layout Container */}
          <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
            <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<UploadData />} />
                <Route path="/reconciliation" element={<Reconciliation />} />
                <Route path="/risk-center" element={<RiskCenter />} />
                <Route path="/investigation" element={<AIInvestigation />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/history" element={<History />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Persistent Floating AI Copilot Chatbot */}
          <FloatingCopilot />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}
