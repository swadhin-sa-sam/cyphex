import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CallsPage from './pages/CallsPage';
import LiveCallPage from './pages/LiveCallPage';
import VerificationPage from './pages/VerificationPage';
import TransactionsPage from './pages/TransactionsPage';
import IncidentsPage from './pages/IncidentsPage';
import IncidentDetailPage from './pages/IncidentDetailPage';
import VoiceProfilesPage from './pages/VoiceProfilesPage';
import SettingsPage from './pages/SettingsPage';
import DemoPage from './pages/DemoPage';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  
  // Clean hash/path router
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.hash.replace('#', '') || '/dashboard';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || '/dashboard';
      setCurrentPath(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // If unauthenticated, show login
  if (!user || currentPath === '/login') {
    return <LoginPage onLoginSuccess={() => navigate('/dashboard')} />;
  }

  const renderRoute = () => {
    if (currentPath === '/dashboard') {
      return <DashboardPage onNavigate={navigate} />;
    }
    if (currentPath === '/calls') {
      return <CallsPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/calls/')) {
      const callId = currentPath.split('/calls/')[1] || "call-sih-001";
      return <LiveCallPage callId={callId} onNavigate={navigate} />;
    }
    if (currentPath === '/verification') {
      return <VerificationPage onNavigate={navigate} />;
    }
    if (currentPath === '/transactions') {
      return <TransactionsPage onNavigate={navigate} />;
    }
    if (currentPath === '/incidents') {
      return <IncidentsPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/incidents/')) {
      const incidentId = currentPath.split('/incidents/')[1] || "VC-28491";
      return <IncidentDetailPage incidentId={incidentId} onNavigate={navigate} />;
    }
    if (currentPath === '/voice-profiles') {
      return <VoiceProfilesPage onNavigate={navigate} />;
    }
    if (currentPath === '/settings' || currentPath.startsWith('/settings/')) {
      return <SettingsPage onNavigate={navigate} />;
    }
    if (currentPath === '/demo') {
      return <DemoPage onNavigate={navigate} />;
    }

    return <DashboardPage onNavigate={navigate} />;
  };

  return (
    <div className="min-h-screen bg-[#070A11] text-slate-100 flex flex-col font-sans">
      <Navbar />
      <div className="flex flex-grow">
        <Sidebar currentPath={currentPath} onNavigate={navigate} />
        <main className="flex-grow overflow-x-hidden">
          {renderRoute()}
        </main>
      </div>

      {/* Global Security Footer */}
      <footer className="border-t border-white/[0.04] bg-navy-950/80 px-6 py-2.5 text-[10px] text-slate-500 font-mono flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">VOICESHIELD AI</span>
          <span>&bull;</span>
          <span>Smart India Hackathon (SIH 2026)</span>
          <span>&bull;</span>
          <span>Problem Statement: Real-Time Automated AI Voice Cloning & Impersonation Defense</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-emerald-400/80">LATENCY SLA: &lt;300ms</span>
          <span>&bull;</span>
          <span>DPDP ACT 2023 COMPLIANT</span>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
