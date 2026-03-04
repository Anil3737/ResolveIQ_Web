import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import api from '../utils/api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    // Reset state on mount to ensure clean fields on refresh
    useEffect(() => {
        setEmail('');
        setPassword('');
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

            // ── First-login guard: admin-created staff must change password ──
            if (data.user.require_password_change) {
                navigate('/change-password');
                return;
            }

            // Route based on role
            const role = data.user.role;
            if (role === 'EMPLOYEE') {
                navigate('/employee/dashboard');
            } else if (role === 'ADMIN') {
                navigate('/admin/dashboard');
            } else if (role === 'TEAM_LEAD') {
                navigate('/team-lead/dashboard');
            } else if (role === 'AGENT') {
                navigate('/agent/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
            <div className="w-full max-w-md">
                <header className="text-center mb-10">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to ResolveIQ</h1>
                    <p className="text-sm text-gray-500">Sign in to access your account</p>
                </header>

                <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
                    <div className="card-premium space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@company.com"
                                    className="input-field pl-12"
                                    required
                                    autoComplete="email-hidden"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-bold text-gray-900">Enter Password</label>
                                <button type="button" className="text-xs font-semibold text-primary hover:underline">Forgot Password?</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                    required
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-red-600 font-medium px-2">{error}</p>
                    )}

                    <div className="flex items-center px-1">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <label htmlFor="remember" className="ml-2 text-sm text-gray-500">Remember me</label>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-xs font-semibold text-gray-400">NEW EMPLOYEE</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <Link to="/register" className="btn-outline flex items-center justify-center">
                        Create Employee Account
                    </Link>
                </div>

                <footer className="mt-8 text-center">
                    <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                        Team Leads and Admins must be registered through the system administrator.
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Login;
