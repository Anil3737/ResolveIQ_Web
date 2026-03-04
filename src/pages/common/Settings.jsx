import React, { useState, useEffect } from 'react';
import {
    User,
    Lock,
    Save,
    AlertCircle,
    CheckCircle2,
    SmartphoneNfc,
    Mail,
    ShieldCheck,
    ChevronRight,
    ArrowLeft,
    Bell,
    Eye,
    EyeOff,
    Info,
    MapPin,
    Calendar,
    Users as UsersIcon,
    UserCircle,
    User as UserIcon,
    HelpCircle,
    Globe,
    ExternalLink,
    FileText,
    MessageSquare,
    Search,
    BookOpen,
    Zap,
    Shield,
    Terminal,
    Twitter,
    Github,
    Linkedin
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Base URL for API
const API_BASE_URL = 'http://127.0.0.1:5000/api';

export default function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [view, setView] = useState('menu'); // 'menu', 'profile', 'security', 'edit_profile', 'help', 'about'
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Feature toggles
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

    // Sync dark class on <html> whenever darkMode changes
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [darkMode]);

    // Search for Help Center
    const [searchQuery, setSearchQuery] = useState('');

    // Visibility toggles
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile form state (for editing)
    const [profileData, setProfileData] = useState({
        full_name: user.full_name || '',
        phone: user.phone || ''
    });

    // Password form state
    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    });

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_BASE_URL}/auth/update-profile`, profileData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                const updatedUser = response.data.data;
                localStorage.setItem('user', JSON.stringify(updatedUser));
                setUser(updatedUser);
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setTimeout(() => setView('profile'), 1500);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile.'
            });
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${API_BASE_URL}/auth/change-password`, {
                password: passwordData.newPassword
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Password changed successfully! Logging out...' });
                setPasswordData({ newPassword: '', confirmPassword: '' });
                setTimeout(() => handleLogout(), 2000);
            }
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to change password.'
            });
        } finally {
            setLoading(false);
        }
    };

    const MenuItem = ({ icon: Icon, label, color, onClick, rightElement, hasChevron = true }) => (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between p-6 bg-white hover:bg-gray-50 transition-all first:rounded-t-[32px] last:rounded-b-[32px] border-b last:border-b-0 border-gray-100 group"
        >
            <div className="flex items-center gap-6">
                <div className={`w-14 h-14 rounded-[24px] flex items-center justify-center shadow-md transition-transform group-hover:scale-105 ${color}`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-gray-800 font-extrabold text-xl">{label}</span>
            </div>
            <div className="flex items-center">
                {rightElement}
                {hasChevron && <ChevronRight className="w-6 h-6 text-gray-300 ml-2 group-hover:translate-x-1 transition-transform" />}
            </div>
        </button>
    );

    const Toggle = ({ enabled, setEnabled }) => (
        <div
            onClick={() => setEnabled(!enabled)}
            className={`w-16 h-8 rounded-full p-1 cursor-pointer transition-colors duration-200 ease-in-out ${enabled ? 'bg-indigo-600' : 'bg-gray-200'}`}
        >
            <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${enabled ? 'translate-x-8' : 'translate-x-0'}`} />
        </div>
    );

    const ProfileDetailItem = ({ label, value, icon: Icon }) => (
        <div className="flex items-start gap-5 group">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-xl font-black text-gray-900 tracking-tight">{value || '-'}</p>
            </div>
        </div>
    );

    // Profile View (Web Optimized)
    if (view === 'profile') {
        const initials = user.full_name
            ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            : 'U';

        const roleDisplay = user.role?.toLowerCase().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'User';

        return (
            <div className="max-w-[1200px] mx-auto p-6 sm:p-12">
                <div className="flex items-center gap-6 mb-16">
                    <button onClick={() => setView('menu')} className="p-4 bg-white shadow-md hover:bg-gray-100 rounded-[24px] border border-gray-100 transition-all">
                        <ArrowLeft className="w-8 h-8 text-indigo-600" />
                    </button>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter">My Identity</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Persona Card (Web Optimized) */}
                    <div className="lg:col-span-4 bg-white p-12 rounded-[56px] border border-gray-100 shadow-xl shadow-gray-500/5 flex flex-col items-center text-center">
                        <div className="relative mb-8">
                            <div className="w-48 h-48 rounded-full bg-indigo-50 flex items-center justify-center border-8 border-white shadow-2xl overflow-hidden ring-1 ring-gray-100">
                                <div className="w-44 h-44 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-6xl font-black">
                                    {initials}
                                </div>
                            </div>
                            <div className="absolute bottom-4 right-4 bg-emerald-500 w-8 h-8 rounded-full border-4 border-white shadow-lg" />
                        </div>
                        <h3 className="text-4xl font-black text-gray-900 tracking-tight mb-2">{user.full_name}</h3>
                        <p className="text-indigo-600 font-black text-sm uppercase tracking-[0.2em] mb-8">{roleDisplay}</p>

                        <div className="w-full pt-8 border-t border-gray-50 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Mail className="w-5 h-5" />
                                <span className="text-sm font-bold truncate max-w-[200px]">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <SmartphoneNfc className="w-5 h-5" />
                                <span className="text-sm font-bold">{user.phone || 'Corporate Identity'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Information Grid (Web Optimized) */}
                    <div className="lg:col-span-8 bg-white p-12 rounded-[56px] border border-gray-100 shadow-xl shadow-gray-500/5">
                        <div className="flex items-center gap-4 mb-12">
                            <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                            <h4 className="text-3xl font-black text-gray-900 tracking-tight">Professional Details</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                            <ProfileDetailItem label="Employment ID" value={user.phone} icon={UserCircle} />
                            <ProfileDetailItem label="Access Role" value={roleDisplay} icon={ShieldCheck} />
                            <ProfileDetailItem label="Assigned Team" value={user.team_name || 'Service Delivery'} icon={UsersIcon} />
                            <ProfileDetailItem label="Supervisor" value={user.team_lead_name || 'Operations Head'} icon={UserIcon} />
                            <ProfileDetailItem label="Site Location" value={user.location || 'Chennai HQ'} icon={MapPin} />
                            <ProfileDetailItem label="Joining Date" value={user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'} icon={Calendar} />
                        </div>

                        <div className="mt-16 pt-10 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <p className="text-gray-400 text-sm font-black italic">
                                Note: This data is managed by HR and cannot be edited manually.
                            </p>
                            <div className="flex items-center gap-3 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-full">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-[10px] font-black uppercase tracking-widest">System Verified</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Security & Password View
    if (view === 'security') {
        return (
            <div className="max-w-[1200px] mx-auto p-6 sm:p-12">
                <div className="flex items-center gap-6 mb-16">
                    <button onClick={() => setView('menu')} className="p-4 bg-white shadow-md hover:bg-gray-50 rounded-[24px] border border-gray-100 transition-all">
                        <ArrowLeft className="w-8 h-8 text-indigo-600" />
                    </button>
                    <div>
                        <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Account Security</h2>
                        <p className="text-indigo-600 font-black mt-2 uppercase tracking-widest text-xs px-1">Access & Authentication</p>
                    </div>
                </div>

                {message.text && (
                    <div className={`mb-12 p-8 rounded-[40px] flex items-center gap-6 shadow-2xl border-2 transition-all animate-in fade-in slide-in-from-top-4 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                        {message.type === 'success' ? <CheckCircle2 className="w-10 h-10 flex-shrink-0" /> : <AlertCircle className="w-10 h-10 flex-shrink-0" />}
                        <div>
                            <p className="text-xl font-black">{message.type === 'success' ? 'Success' : 'Attention Required'}</p>
                            <p className="font-bold opacity-80">{message.text}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Left side: branding/context */}
                    <div className="lg:col-span-5 bg-gradient-to-br from-indigo-600 to-indigo-800 p-16 rounded-[64px] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-[32px] flex items-center justify-center mb-10 border border-white/20 shadow-2xl">
                                <Lock className="w-12 h-12 text-white" />
                            </div>
                            <h3 className="text-5xl font-black tracking-tighter mb-6 leading-tight">Fortify Your Identity</h3>
                            <p className="text-indigo-100 text-lg font-medium leading-relaxed mb-12">
                                Your digital security is our highest priority. Regularly updating your password ensures your account remains protected against unauthorized access.
                            </p>

                            <div className="space-y-6">
                                <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[32px] border border-white/10">
                                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-widest">End-to-End Encryption</p>
                                        <p className="text-xs text-indigo-200 font-medium mt-0.5">Your password is never stored in plain text.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-5 bg-white/5 rounded-[32px] border border-white/10">
                                    <SmartphoneNfc className="w-8 h-8 text-amber-400" />
                                    <div>
                                        <p className="font-black text-sm uppercase tracking-widest">Global Authentication</p>
                                        <p className="text-xs text-indigo-200 font-medium mt-0.5">Consistent security across all your devices.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Abstract background elements */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl" />
                    </div>

                    {/* Right side: form */}
                    <div className="lg:col-span-7 bg-white p-12 sm:p-16 rounded-[64px] border border-gray-100 shadow-2xl shadow-gray-500/5">
                        <form onSubmit={handlePasswordSubmit} className="space-y-12">
                            <div className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-indigo-600 uppercase tracking-widest px-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                                        New Account Password
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-2xl placeholder:font-normal placeholder:text-gray-300"
                                            placeholder="Enter new strong password"
                                            required minLength={8}
                                        />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors">
                                            {showNewPassword ? <EyeOff className="w-7 h-7" /> : <Eye className="w-7 h-7" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-indigo-600 uppercase tracking-widest px-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                                        Verify New Password
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-2xl placeholder:font-normal placeholder:text-gray-300"
                                            placeholder="Repeat password to confirm"
                                            required minLength={8}
                                        />
                                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-colors">
                                            {showConfirmPassword ? <EyeOff className="w-7 h-7" /> : <Eye className="w-7 h-7" />}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8 pt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-8 bg-blue-600 hover:bg-blue-700 text-white rounded-[32px] font-black text-2xl shadow-2xl shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4"
                                >
                                    {loading ? 'Updating Credentials...' : (
                                        <>
                                            Save New Password
                                            <ChevronRight className="w-8 h-8" />
                                        </>
                                    )}
                                </button>
                                <div className="flex items-center justify-center gap-3">
                                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                                    <p className="text-rose-500 text-sm font-black italic uppercase tracking-widest">
                                        Automatic Logout Required After Update
                                    </p>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    // Help Center View (Web Optimized)
    if (view === 'help') {
        const faqs = [
            { q: "How do I create a ticket?", a: "Navigate to the 'Create Ticket' page from your sidebar, fill in the details, and submit. Our system will automatically route it to the correct department." },
            { q: "What is an SLA?", a: "SLA stands for Service Level Agreement. It's the maximum time allowed to resolve your issue. Different priorities have different SLA targets." },
            { q: "How do I change my password?", a: "Go to Settings > Security & Password. You'll need to enter a new 8-character password and confirm it." },
            { q: "Can I edit my profile?", a: "Yes, you can edit your name and phone/EmpID in the Profile Information section of your settings." },
            { q: "What is ResolveIQ?", a: "ResolveIQ is an enterprise-grade ticketing system designed to optimize internal communication and issue resolution." },
            { q: "How are tickets prioritized?", a: "Tickets are prioritized by urgency (High, Medium, Low) and Impact, often calculated automatically by our routing engine." }
        ];

        return (
            <div className="max-w-[1200px] mx-auto p-6 sm:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                    <div className="flex items-center gap-6">
                        <button onClick={() => setView('menu')} className="p-4 bg-white shadow-md hover:bg-gray-50 rounded-[24px] border border-gray-100">
                            <ArrowLeft className="w-8 h-8 text-indigo-600" />
                        </button>
                        <div>
                            <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Help Center</h2>
                            <p className="text-gray-400 font-bold mt-2 uppercase tracking-widest text-xs px-1">Support & Documentation</p>
                        </div>
                    </div>

                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search for help..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-white border-2 border-gray-50 rounded-[28px] shadow-sm focus:ring-8 focus:ring-indigo-500/5 focus:border-indigo-500 outline-none transition-all font-bold"
                        />
                    </div>
                </div>

                {/* Web Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-10 rounded-[48px] text-white shadow-xl shadow-blue-500/20 transform hover:-translate-y-2 transition-transform cursor-pointer">
                        <MessageSquare className="w-12 h-12 mb-6" />
                        <h3 className="text-2xl font-black mb-3">Live Support</h3>
                        <p className="text-blue-50 font-medium leading-relaxed">Chat with our dedicated support agents in real-time for urgent issues.</p>
                        <button className="mt-8 flex items-center gap-2 font-black text-sm uppercase tracking-widest bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full transition-colors w-fit">
                            Start Chat <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl shadow-gray-500/5 transform hover:-translate-y-2 transition-transform cursor-pointer group">
                        <BookOpen className="w-12 h-12 text-emerald-600 mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-black text-gray-900 mb-3">Knowledge Base</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">Detailed documentation on every feature across the ResolveIQ ecosystem.</p>
                        <button className="mt-8 flex items-center gap-2 font-black text-sm uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors w-fit">
                            Read Guides <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl shadow-gray-500/5 transform hover:-translate-y-2 transition-transform cursor-pointer group">
                        <Zap className="w-12 h-12 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
                        <h3 className="text-2xl font-black text-gray-900 mb-3">Video Tutorials</h3>
                        <p className="text-gray-500 font-medium leading-relaxed">Quick video walkthroughs to help you master the platform in minutes.</p>
                        <button className="mt-8 flex items-center gap-2 font-black text-sm uppercase tracking-widest text-amber-500 hover:text-amber-600 transition-colors w-fit">
                            Watch Now <ExternalLink className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-[56px] p-10 md:p-16 border border-gray-50 shadow-2xl shadow-gray-500/5">
                    <h3 className="text-3xl font-black text-gray-900 mb-12 tracking-tight flex items-center gap-4">
                        <HelpCircle className="w-10 h-10 text-indigo-600" />
                        Popular FAQ's
                    </h3>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-x-20 md:gap-y-12">
                        {faqs.filter(f => f.q.toLowerCase().includes(searchQuery.toLowerCase())).map((faq, idx) => (
                            <div key={idx} className="group cursor-default">
                                <h4 className="text-xl font-black text-gray-900 mb-4 group-hover:text-indigo-600 transition-colors flex items-center gap-2">
                                    <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                                    {faq.q}
                                </h4>
                                <p className="text-lg text-gray-500 leading-relaxed font-medium pl-4 border-l-2 border-gray-50">
                                    {faq.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // About Page View (Web Optimized)
    if (view === 'about') {
        return (
            <div className="max-w-[1200px] mx-auto p-6 sm:p-12">
                <div className="flex items-center gap-6 mb-16">
                    <button onClick={() => setView('menu')} className="p-4 bg-white shadow-md hover:bg-gray-100 rounded-[24px] border border-gray-100 transition-all">
                        <ArrowLeft className="w-8 h-8 text-indigo-600" />
                    </button>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter">About ResolveIQ</h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Brand Section */}
                    <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left bg-gradient-to-br from-indigo-600 to-indigo-900 p-16 rounded-[64px] text-white shadow-2xl shadow-indigo-500/30">
                        <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-[40px] flex items-center justify-center mb-10 border border-white/20 shadow-2xl">
                            <SmartphoneNfc className="w-16 h-16 text-white" />
                        </div>
                        <h3 className="text-6xl font-black tracking-tighter mb-4">ResolveIQ</h3>
                        <p className="text-indigo-100 text-xl font-medium leading-relaxed max-w-sm uppercase tracking-widest text-sm mb-12">
                            The future of intelligent ticketing and resolution management.
                        </p>

                        <div className="flex flex-col gap-4 w-full">
                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/10">
                                <span className="font-bold text-lg">System Version</span>
                                <span className="bg-white text-indigo-600 px-4 py-1.5 rounded-full font-black text-sm">v1.0.0 STABLE</span>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-[32px] border border-white/10">
                                <span className="font-bold text-lg">Environment</span>
                                <span className="text-emerald-400 font-black text-sm flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    PRODUCTION
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-6 mt-12">
                            <Twitter className="w-6 h-6 cursor-pointer hover:text-blue-400 transition-colors" />
                            <Github className="w-6 h-6 cursor-pointer hover:text-black transition-colors" />
                            <Linkedin className="w-6 h-6 cursor-pointer hover:text-blue-300 transition-colors" />
                        </div>
                    </div>

                    {/* Platform Highlights */}
                    <div className="lg:col-span-7 space-y-10 pt-4">
                        <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-xl shadow-gray-500/5">
                            <h4 className="text-3xl font-black text-gray-900 mb-6 tracking-tight flex items-center gap-4">
                                <Shield className="w-10 h-10 text-emerald-500" />
                                Our Mission
                            </h4>
                            <p className="text-xl text-gray-500 leading-relaxed font-medium">
                                To empower organizations with a seamless, data-driven support ecosystem that reduces friction, accelerates resolution times, and provides unprecedented visibility into operational performance.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="bg-gray-50 p-10 rounded-[48px] border border-gray-100 hover:bg-white hover:shadow-2xl hover:shadow-gray-500/10 transition-all cursor-pointer group">
                                <Terminal className="w-10 h-10 text-amber-500 mb-6 group-hover:scale-110 transition-transform" />
                                <h5 className="text-2xl font-black text-gray-900 mb-3">API Access</h5>
                                <p className="text-gray-500 font-medium">Full RESTful API documentation for custom integrations.</p>
                            </div>
                            <div className="bg-gray-50 p-10 rounded-[48px] border border-gray-100 hover:bg-white hover:shadow-2xl hover:shadow-gray-500/10 transition-all cursor-pointer group">
                                <Globe className="w-10 h-10 text-emerald-500 mb-6 group-hover:scale-110 transition-transform" />
                                <h5 className="text-2xl font-black text-gray-900 mb-3">Global Infrastructure</h5>
                                <p className="text-gray-500 font-medium">High availability and distributed data centers.</p>
                            </div>
                        </div>

                        {/* Legal Links (Web Style) */}
                        <div className="bg-white p-10 rounded-[48px] shadow-sm border border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[32px] hover:bg-gray-100 transition-colors gap-3 group">
                                <FileText className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                <span className="text-xs font-black uppercase tracking-widest text-gray-700">Terms</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[32px] hover:bg-gray-100 transition-colors gap-3 group">
                                <ShieldCheck className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                <span className="text-xs font-black uppercase tracking-widest text-gray-700">Privacy</span>
                            </button>
                            <button className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[32px] hover:bg-gray-100 transition-colors gap-3 group">
                                <Globe className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                                <span className="text-xs font-black uppercase tracking-widest text-gray-700">Contact</span>
                            </button>
                        </div>
                    </div>
                </div>

                <p className="text-center text-gray-400 text-[11px] font-black mt-20 italic uppercase tracking-[0.4em]">
                    © MMXXVI ResolveIQ Corporation. All Rights Reserved.
                </p>
            </div>
        );
    }

    if (view === 'edit_profile') {
        return (
            <div className="max-w-2xl mx-auto p-12">
                <div className="flex items-center gap-4 mb-14">
                    <button onClick={() => setView('profile')} className="p-4 hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-8 h-8 text-gray-600" />
                    </button>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Edit Information</h2>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-12">
                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Full Name</label>
                            <input
                                type="text"
                                value={profileData.full_name}
                                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                                className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-2xl"
                                required
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Phone / EMP ID</label>
                            <input
                                type="text"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-2xl"
                                placeholder="Enter phone or EMP ID"
                            />
                        </div>
                    </div>
                    <button type="submit" disabled={loading} className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[32px] font-black text-2xl shadow-2xl transition-all active:scale-95 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        );
    }

    // Main Settings Menu (Web Optimized)
    return (
        <div className="max-w-[1200px] mx-auto p-8 sm:p-12 pt-16 pb-32">
            {/* Header */}
            <div className="flex items-center gap-10 mb-20">
                <button className="p-5 bg-white shadow-xl hover:bg-gray-50 rounded-[28px] transition-all border border-gray-100 flex items-center justify-center transform hover:-translate-x-2">
                    <ArrowLeft className="w-10 h-10 text-indigo-600" />
                </button>
                <div>
                    <h2 className="text-6xl font-black text-gray-900 tracking-tighter">Settings</h2>
                    <p className="text-indigo-600 font-black mt-2 uppercase tracking-[0.3em] text-xs px-1">System Architecture & Preferences</p>
                </div>
            </div>

            {/* Grid Layout for Categories (Web Optimized) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
                {/* Account */}
                <div>
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <h3 className="text-xs font-black text-gray-400 tracking-[0.25em] uppercase">User Account</h3>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <div className="bg-white rounded-[48px] shadow-2xl shadow-indigo-500/10 border border-gray-50 overflow-hidden divide-y divide-gray-50">
                        <MenuItem
                            icon={User}
                            label="Profile Info"
                            color="bg-blue-500"
                            onClick={() => setView('profile')}
                        />
                        <MenuItem
                            icon={Lock}
                            label="Security"
                            color="bg-orange-500"
                            onClick={() => setView('security')}
                        />
                    </div>
                </div>

                {/* App Settings */}
                <div>
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <h3 className="text-xs font-black text-gray-400 tracking-[0.25em] uppercase">Experience</h3>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <div className="bg-white rounded-[48px] shadow-2xl shadow-indigo-500/10 border border-gray-50 overflow-hidden divide-y divide-gray-50">
                        <MenuItem
                            icon={Bell}
                            label="Notifications"
                            color="bg-emerald-500"
                            hasChevron={false}
                            rightElement={<Toggle enabled={notifications} setEnabled={setNotifications} />}
                        />
                        <MenuItem
                            icon={Eye}
                            label="Dark Mode"
                            color="bg-purple-600"
                            hasChevron={false}
                            rightElement={<Toggle enabled={darkMode} setEnabled={(val) => setDarkMode(val)} />}
                        />
                    </div>
                </div>

                {/* Support */}
                <div>
                    <div className="flex items-center gap-3 mb-8 px-2">
                        <h3 className="text-xs font-black text-gray-400 tracking-[0.25em] uppercase">Enterprise Support</h3>
                        <div className="flex-1 h-px bg-gray-100" />
                    </div>
                    <div className="bg-white rounded-[48px] shadow-2xl shadow-indigo-500/10 border border-gray-50 overflow-hidden divide-y divide-gray-50">
                        <MenuItem
                            icon={HelpCircle}
                            label="Help Center"
                            color="bg-red-400"
                            onClick={() => setView('help')}
                        />
                        <MenuItem
                            icon={SmartphoneNfc}
                            label="System About"
                            color="bg-indigo-600"
                            onClick={() => setView('about')}
                        />
                    </div>
                </div>
            </div>

            {/* Premium Web Footer */}
            <div className="mt-32 border-t border-gray-100 pt-16 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex items-center gap-10">
                    <div className="flex flex-col">
                        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">Status</span>
                        <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-green-50 rounded-full border border-green-100">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <p className="text-green-600 text-[10px] font-black tracking-widest uppercase">System Operational</p>
                        </div>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mb-1">Platform</span>
                        <p className="text-gray-900 text-xs font-black tracking-widest uppercase">ResolveIQ v1.0.0 Stable</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <span className="text-gray-300 hover:text-indigo-600 cursor-pointer text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Architecture</span>
                    <span className="text-gray-300 hover:text-indigo-600 cursor-pointer text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Privacy</span>
                    <span className="text-gray-300 hover:text-indigo-600 cursor-pointer text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Cloud Status</span>
                </div>
            </div>
        </div>
    );
}
