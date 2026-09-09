import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <div className="cyphex-app-root relative min-h-screen text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
      {/* Dynamic Ambient Background Illumination Orbs & Pro Glow Sweeps */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden app-illumination-orbs">
        <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.12] rounded-full blur-[140px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute top-1/3 -right-40 w-[650px] h-[650px] bg-blue-600/[0.10] rounded-full blur-[160px] mix-blend-screen" />
        <div className="absolute -bottom-40 left-1/3 w-[550px] h-[550px] bg-emerald-500/[0.08] rounded-full blur-[150px] mix-blend-screen" />
        <div className="pro-laser-beam opacity-40" />
      </div>

      <div className="relative z-10">
        <Dashboard />
      </div>
    </div>
  );
}

export default App;


