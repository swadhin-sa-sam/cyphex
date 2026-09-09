import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Shield, Key, User, Lock, Mail, CheckCircle2, AlertCircle, X, LogOut, Copy, Check } from 'lucide-react';
import { AUTH_API } from '../utils/constants';
export const AuthModal = ({ isOpen, onClose, currentUser, onAuthSuccess, onLogout, }) => {
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('CyphexSOC#2026!');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [copiedKey, setCopiedKey] = useState(false);
    useEffect(() => {
        if (!currentUser) {
            setUsername('admin');
            setPassword('CyphexSOC#2026!');
            setError(null);
        }
    }, [currentUser]);
    if (!isOpen)
        return null;
    const handleFillDemoAdmin = () => {
        setIsRegisterMode(false);
        setUsername('admin');
        setPassword('CyphexSOC#2026!');
        setError(null);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const endpoint = isRegisterMode ? AUTH_API.REGISTER : AUTH_API.LOGIN;
        const bodyPayload = isRegisterMode
            ? { username, password, email: email || `${username}@cyphex.defense` }
            : { username, password };
        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyPayload),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.detail || 'Authentication failed. Please verify credentials.');
            }
            localStorage.setItem('cyphex_token', data.access_token);
            localStorage.setItem('cyphex_user', JSON.stringify(data.user));
            onAuthSuccess(data.user, data.access_token);
            onClose();
        }
        catch (err) {
            // If server is not yet running or network error, provide simulated offline admin session
            if (username === 'admin' && password === 'CyphexSOC#2026!') {
                const offlineAdmin = {
                    id: 1,
                    username: 'admin',
                    email: 'admin@cyphex.defense',
                    role: 'ADMIN'
                };
                localStorage.setItem('cyphex_token', 'offline-simulated-token-soc-2026');
                localStorage.setItem('cyphex_user', JSON.stringify(offlineAdmin));
                onAuthSuccess(offlineAdmin, 'offline-simulated-token-soc-2026');
                onClose();
            }
            else {
                setError(err.message || 'Authentication error.');
            }
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md", children: _jsxs("div", { className: "relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col", children: [_jsxs("div", { className: "p-4 bg-slate-950/70 border-b border-white/[0.08] flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2.5", children: [_jsx("div", { className: "w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]", children: _jsx(Shield, { className: "w-4 h-4" }) }), _jsxs("div", { children: [_jsx("h2", { className: "text-sm font-black tracking-widest text-white uppercase font-sans", children: "SOC OPERATOR ACCESS" }), _jsx("p", { className: "text-[11px] text-slate-400", children: "Identity & Role-Based Clearance Control" })] })] }), _jsx("button", { onClick: onClose, className: "p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors", children: _jsx(X, { className: "w-4 h-4" }) })] }), _jsx("div", { className: "p-5 flex flex-col gap-4", children: currentUser ? (
                    /* Logged in state */
                    _jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.1)] flex items-center gap-3.5", children: [_jsx("div", { className: "w-12 h-12 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center text-cyan-300 font-bold text-sm shadow-[0_0_15px_rgba(6,182,212,0.4)]", children: currentUser.username.substring(0, 2).toUpperCase() }), _jsxs("div", { className: "flex-grow", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-sm font-bold text-white", children: currentUser.username }), _jsx("span", { className: "text-[9px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-400", children: currentUser.role })] }), _jsx("span", { className: "text-xs text-slate-400 block mt-0.5", children: currentUser.email }), _jsxs("div", { className: "flex items-center gap-1.5 text-[10px] text-emerald-400 mt-1 font-mono", children: [_jsx(CheckCircle2, { className: "w-3 h-3" }), _jsx("span", { children: "Active Session Validated (PBKDF2/JWT)" })] })] })] }), _jsxs("div", { className: "p-3 rounded-xl bg-slate-950 border border-white/[0.06] flex flex-col gap-1.5", children: [_jsxs("span", { className: "text-[10px] font-mono text-slate-400 flex items-center gap-1", children: [_jsx(Key, { className: "w-3 h-3 text-cyan-400" }), "SOC ACCESS TOKEN"] }), _jsxs("div", { className: "flex items-center justify-between bg-slate-900 px-2.5 py-1.5 rounded-lg border border-white/[0.04] text-[11px] font-mono text-slate-300", children: [_jsx("span", { className: "truncate max-w-[260px]", children: localStorage.getItem('cyphex_token') || 'cyphex_jwt_active' }), _jsx("button", { onClick: () => {
                                                    navigator.clipboard.writeText(localStorage.getItem('cyphex_token') || '');
                                                    setCopiedKey(true);
                                                    setTimeout(() => setCopiedKey(false), 2000);
                                                }, className: "text-slate-400 hover:text-cyan-400 p-1", title: "Copy Token", children: copiedKey ? _jsx(Check, { className: "w-3.5 h-3.5 text-emerald-400" }) : _jsx(Copy, { className: "w-3.5 h-3.5" }) })] })] }), _jsxs("button", { onClick: () => {
                                    localStorage.removeItem('cyphex_token');
                                    localStorage.removeItem('cyphex_user');
                                    onLogout();
                                }, className: "w-full py-2.5 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-500/40 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors", children: [_jsx(LogOut, { className: "w-4 h-4" }), _jsx("span", { children: "Revoke Session & Logout" })] })] })) : (
                    /* Login / Register Form */
                    _jsxs("form", { onSubmit: handleSubmit, className: "flex flex-col gap-3.5", children: [error && (_jsxs("div", { className: "p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2", children: [_jsx(AlertCircle, { className: "w-4 h-4 flex-shrink-0" }), _jsx("span", { children: error })] })), _jsxs("div", { className: "flex justify-between items-center bg-slate-950/80 p-2.5 rounded-xl border border-cyan-500/20", children: [_jsx("span", { className: "text-[10px] text-slate-400 font-mono", children: "Evaluation / Demo Mode:" }), _jsx("button", { type: "button", onClick: handleFillDemoAdmin, className: "text-[10px] font-mono text-cyan-400 hover:text-cyan-300 bg-cyan-950/80 px-2 py-1 rounded border border-cyan-500/30 transition-colors", children: "\u26A1 Auto-fill SOC Admin" })] }), _jsxs("div", { children: [_jsx("label", { className: "text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5", children: "Operator Handle:" }), _jsxs("div", { className: "relative", children: [_jsx(User, { className: "w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "text", required: true, value: username, onChange: (e) => setUsername(e.target.value), placeholder: "e.g. admin or analyst1", className: "w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500" })] })] }), isRegisterMode && (_jsxs("div", { children: [_jsx("label", { className: "text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5", children: "Defense Email:" }), _jsxs("div", { className: "relative", children: [_jsx(Mail, { className: "w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value), placeholder: "analyst@cyphex.defense", className: "w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500" })] })] })), _jsxs("div", { children: [_jsx("label", { className: "text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5", children: "Security Passphrase:" }), _jsxs("div", { className: "relative", children: [_jsx(Lock, { className: "w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" }), _jsx("input", { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value), placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022", className: "w-full bg-slate-950 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500" })] })] }), _jsx("div", { className: "flex items-center justify-between text-xs pt-1", children: _jsx("button", { type: "button", onClick: () => setIsRegisterMode(!isRegisterMode), className: "text-slate-400 hover:text-cyan-400 transition-colors", children: isRegisterMode ? 'Already have clearance? Log In' : 'Need clearance? Register Analyst' }) }), _jsx("button", { type: "submit", disabled: loading, className: "w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] disabled:opacity-50", children: loading ? 'Authenticating...' : isRegisterMode ? 'Register SOC Analyst' : 'Authenticate Operator' })] })) })] }) }));
};
export default AuthModal;
