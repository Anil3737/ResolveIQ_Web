import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import api from '../../utils/api';

const ChangePassword = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Password strength checks
    const checks = [
        { label: 'At least 8 characters', pass: newPassword.length >= 8 },
        { label: 'Contains uppercase letter', pass: /[A-Z]/.test(newPassword) },
        { label: 'Contains lowercase letter', pass: /[a-z]/.test(newPassword) },
        { label: 'Contains a number', pass: /\d/.test(newPassword) },
        { label: 'Contains special character', pass: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
    ];
    const strength = checks.filter(c => c.pass).length;
    const strengthLabel = ['', 'Weak', 'Weak', 'Fair', 'Good', 'Strong'][strength];
    const strengthColor = ['', 'bg-red-400', 'bg-red-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'][strength];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (strength < 3) {
            setError('Password is too weak. Please make it stronger.');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/change-password', { password: newPassword });

            // Update local user so require_password_change is cleared
            const updated = { ...user, require_password_change: false };
            localStorage.setItem('user', JSON.stringify(updated));

            setSuccess(true);

            // Redirect to the right dashboard after 2 seconds
            setTimeout(() => {
                const role = updated.role;
                if (role === 'ADMIN') navigate('/admin/dashboard');
                else if (role === 'TEAM_LEAD') navigate('/team-lead/dashboard');
                else if (role === 'AGENT') navigate('/agent/dashboard');
                else navigate('/employee/dashboard');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to change password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 p-6">
                <div className="bg-white rounded-[40px] shadow-2xl shadow-purple-900/10 p-12 w-full max-w-sm text-center space-y-5">
                    <div className="flex justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-400/30">
                            <CheckCircle2 className="w-10 h-10 text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900">Password Updated!</h2>
                        <p className="text-gray-500 text-sm font-medium mt-1">Redirecting you to your dashboard…</p>
                    </div>
                    <div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50 p-6">
            <div className="w-full max-w-md space-y-6">

                {/* Header */}
                <div className="text-center space-y-3">
                    <div className="flex justify-center">
                        <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center shadow-xl shadow-purple-300">
                            <ShieldCheck className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900">Set Your Password</h1>
                        <p className="text-sm text-gray-500 font-medium mt-1">
                            Hi <span className="font-black text-gray-700">{user.full_name || 'there'}</span>, you must set a new password before continuing.
                        </p>
                    </div>
                </div>

                {/* Warning banner */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-800 font-semibold leading-relaxed">
                        Your account was created by an administrator with a temporary password.
                        You must change it now to access the system.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8 space-y-6">

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                            <p className="text-sm font-bold text-red-600">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* New Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                New Password
                            </label>
                            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus-within:border-purple-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-purple-500/5 transition-all">
                                <Lock className="w-5 h-5 text-purple-500 shrink-0" />
                                <input
                                    type={showNew ? 'text' : 'password'}
                                    placeholder="Create a strong password"
                                    value={newPassword}
                                    onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
                                    className="flex-1 bg-transparent text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none"
                                    required
                                />
                                <button type="button" onClick={() => setShowNew(v => !v)} className="text-gray-400 hover:text-purple-600 transition-colors">
                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Strength Bar */}
                            {newPassword && (
                                <div className="px-1 space-y-2 mt-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-gray-100'}`} />
                                        ))}
                                    </div>
                                    <p className={`text-xs font-black ${['', 'text-red-500', 'text-red-500', 'text-yellow-500', 'text-blue-500', 'text-green-600'][strength]}`}>
                                        {strengthLabel}
                                    </p>
                                    <div className="space-y-1">
                                        {checks.map((c) => (
                                            <div key={c.label} className="flex items-center gap-2">
                                                <CheckCircle2 className={`w-3 h-3 shrink-0 ${c.pass ? 'text-green-500' : 'text-gray-200'}`} />
                                                <span className={`text-xs font-semibold ${c.pass ? 'text-green-600' : 'text-gray-400'}`}>{c.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Confirm New Password
                            </label>
                            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all
                                ${confirmPassword && confirmPassword !== newPassword ? 'border-red-300 bg-red-50' : confirmPassword && confirmPassword === newPassword ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-gray-50 focus-within:border-purple-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-purple-500/5'}`}>
                                <Lock className={`w-5 h-5 shrink-0 ${confirmPassword && confirmPassword !== newPassword ? 'text-red-400' : confirmPassword && confirmPassword === newPassword ? 'text-green-500' : 'text-purple-500'}`} />
                                <input
                                    type={showConfirm ? 'text' : 'password'}
                                    placeholder="Re-enter your new password"
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                                    className="flex-1 bg-transparent text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none"
                                    required
                                />
                                <button type="button" onClick={() => setShowConfirm(v => !v)} className="text-gray-400 hover:text-purple-600 transition-colors">
                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {confirmPassword && confirmPassword !== newPassword && (
                                <p className="text-xs font-bold text-red-500 ml-2">Passwords do not match</p>
                            )}
                            {confirmPassword && confirmPassword === newPassword && (
                                <p className="text-xs font-bold text-green-600 ml-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Passwords match
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-5 bg-purple-600 hover:bg-black text-white rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-2xl shadow-purple-200 active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Updating...</> : <><ShieldCheck className="w-5 h-5" /> Set New Password</>}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;
