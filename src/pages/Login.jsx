import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, Shield, Zap, Users } from 'lucide-react';
import api from '../utils/api';
import appLogo from '../assets/resolveiq-app-icon.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [emailReadOnly, setEmailReadOnly] = useState(true);
    const [passwordReadOnly, setPasswordReadOnly] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const wasRemembered = localStorage.getItem('rememberMe') === 'true';
        if (wasRemembered) setRememberMe(true);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/auth/login', { email, password });
            const { data } = response.data;

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.user));

            if (rememberMe) {
                localStorage.setItem('rememberedEmail', email);
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberedEmail');
                localStorage.removeItem('rememberMe');
            }

            if (data.user.require_password_change) {
                navigate('/change-password');
                return;
            }

            const role = data.user.role;
            if (role === 'EMPLOYEE') navigate('/employee/dashboard');
            else if (role === 'ADMIN') navigate('/admin/dashboard');
            else if (role === 'TEAM_LEAD') navigate('/team-lead/dashboard');
            else if (role === 'AGENT') navigate('/agent/dashboard');
            else navigate('/employee/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        { icon: Shield, text: 'Enterprise-grade security' },
        { icon: Zap, text: 'Real-time ticket tracking' },
        { icon: Users, text: 'Collaborative resolution' },
    ];

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans"
            style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)',
            }}
        >
            {/* Background decorative blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
            </div>

            {/* Card */}
            <div className="relative w-full max-w-4xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[580px]">

                {/* ── Left Panel: Branding ── */}
                <div
                    className="hidden lg:flex lg:w-5/12 flex-col justify-between p-10 relative overflow-hidden"
                    style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 100%)' }}
                >
                    {/* Subtle grid pattern */}
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }} />

                    <div className="relative z-10">
                        {/* Logo */}
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-11 h-11 bg-black rounded-2xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                                <img src={appLogo} alt="ResolveIQ Logo" className="w-9 h-9 object-contain" />
                            </div>
                            <span className="text-xl font-black text-white tracking-tight uppercase">ResolveIQ</span>
                        </div>

                        <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
                            Smarter<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Resolution.</span>
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            Empowering teams to track, manage, and resolve issues with intelligent prioritization.
                        </p>

                        <div className="space-y-3">
                            {features.map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                        <Icon className="w-3.5 h-3.5 text-blue-400" />
                                    </div>
                                    <span className="text-slate-300 text-xs font-medium">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <div className="flex -space-x-2 shrink-0">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-900 bg-slate-700 overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <p className="text-slate-400 text-[11px] font-medium">Trusted by 500+ departments worldwide</p>
                    </div>
                </div>

                {/* ── Right Panel: Form ── */}
                <div className="w-full lg:w-7/12 flex flex-col justify-center p-8 sm:p-12 bg-white">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 justify-center mb-8">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center overflow-hidden">
                            <img src={appLogo} alt="ResolveIQ Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight uppercase">ResolveIQ</span>
                    </div>

                    <div className="max-w-sm w-full mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-1">Welcome back</h1>
                            <p className="text-gray-400 text-sm">Sign in to access your dashboard</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5" autoComplete="on">
                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onFocus={() => setEmailReadOnly(false)}
                                        placeholder="name@company.com"
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder:text-gray-300"
                                        required
                                        autoComplete="email"
                                        readOnly={emailReadOnly}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Password</label>
                                    <button type="button" className="text-[11px] font-semibold text-indigo-600 hover:underline">Forgot?</button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => setPasswordReadOnly(false)}
                                        placeholder="••••••••"
                                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder:text-gray-300"
                                        required
                                        autoComplete="current-password"
                                        readOnly={passwordReadOnly}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-700 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                    <p className="text-xs text-red-600 font-semibold">{error}</p>
                                </div>
                            )}

                            {/* Remember Me */}
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-4 h-4 border-2 border-gray-200 rounded group-hover:border-slate-300 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600" />
                                    <svg className="absolute inset-0 w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                                <span className="text-xs font-semibold text-gray-400">Remember me</span>
                            </label>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 rounded-xl font-black text-sm tracking-wider text-white transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #1e3a8a, #4f46e5)' }}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <span className="text-xs text-gray-400">New employee? </span>
                            <Link to="/register" className="text-xs font-bold text-indigo-600 hover:underline">Create an account</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
