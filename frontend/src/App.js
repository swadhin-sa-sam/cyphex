import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Dashboard from './components/Dashboard';
function App() {
    return (_jsxs("div", { className: "cyphex-app-root relative min-h-screen text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden", children: [_jsxs("div", { className: "fixed inset-0 pointer-events-none z-0 overflow-hidden app-illumination-orbs", children: [_jsx("div", { className: "absolute -top-40 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.12] rounded-full blur-[140px] mix-blend-screen animate-pulse-slow" }), _jsx("div", { className: "absolute top-1/3 -right-40 w-[650px] h-[650px] bg-blue-600/[0.10] rounded-full blur-[160px] mix-blend-screen" }), _jsx("div", { className: "absolute -bottom-40 left-1/3 w-[550px] h-[550px] bg-emerald-500/[0.08] rounded-full blur-[150px] mix-blend-screen" }), _jsx("div", { className: "pro-laser-beam opacity-40" })] }), _jsx("div", { className: "relative z-10", children: _jsx(Dashboard, {}) })] }));
}
export default App;
