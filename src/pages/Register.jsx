import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, IdCard, Mail, Lock, MapPin, Eye, EyeOff, Loader2, Shield, Zap, Users } from 'lucide-react';
import api from '../utils/api';
import appLogo from '../assets/resolveiq-app-icon.png';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        employee_id: '',
        email: '',
        password: '',
        confirm_password: '',
        office_location: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [empIdStatus, setEmpIdStatus] = useState(null);
    const debounceRef = React.useRef(null);

    React.useEffect(() => {
        const empId = formData.employee_id.trim().toUpperCase();
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (empId.length >= 3) {
            setEmpIdStatus('checking');
            debounceRef.current = setTimeout(async () => {
                try {
                    const res = await api.get(`/auth/check-id?emp_id=${empId}`);
                    setEmpIdStatus(res.data.exists ? 'taken' : 'ok');
                    if (res.data.exists) {
                        setErrors(prev => ({ ...prev, employee_id: 'Employee ID already exists' }));
                    } else {
                        setErrors(prev => {
                            const next = { ...prev };
                            if (next.employee_id === 'Employee ID already exists') delete next.employee_id;
                            return next;
                        });
                    }
                } catch {
                    setEmpIdStatus(null);
                }
            }, 500);
        } else {
            setEmpIdStatus(null);
        }

        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    }, [formData.employee_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.full_name) newErrors.full_name = 'Full name is required';
        if (!formData.employee_id) newErrors.employee_id = 'Employee ID is required';
        if (!formData.email) newErrors.email = 'Company email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
        if (!formData.password) newErrors.password = 'Password is required';
        else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
        if (formData.confirm_password !== formData.password) newErrors.confirm_password = 'Passwords do not match';
        if (!termsAccepted) newErrors.terms = 'You must accept the terms & conditions';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const response = await api.post('/auth/register', {
                full_name: formData.full_name,
                phone: formData.employee_id.toUpperCase(),
                email: formData.email,
                password: formData.password,
                location: formData.office_location,
            });

            if (response.data.success) {
                const loginRes = await api.post('/auth/login', {
                    email: formData.email,
                    password: formData.password,
                });
                const { data } = loginRes.data;
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('user', JSON.stringify(data.user));
                navigate('/employee/dashboard');
            }
        } catch (err) {
            const message = err.response?.data?.message || 'Registration failed';
            setErrors(prev => ({ ...prev, server: message }));
        } finally {
            setLoading(false);
        }
    };

    const inputClass = (field) =>
        `w-full h-11 bg-slate-50 border rounded-xl pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all placeholder:text-gray-300 ${errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200'}`;

    const features = [
        { icon: Shield, text: 'Secure identity management' },
        { icon: Zap, text: 'Instant ticket creation' },
        { icon: Users, text: 'Team collaboration tools' },
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
                <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />
                <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
            </div>

            {/* Card */}
            <div className="relative w-full max-w-5xl bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row">

                {/* ── Left Panel: Branding ── */}
                <div
                    className="hidden lg:flex lg:w-2/5 flex-col justify-between p-10 relative overflow-hidden shrink-0"
                    style={{ background: 'linear-gradient(160deg, #0f172a 0%, #064e3b 100%)' }}
                >
                    {/* Subtle grid */}
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.3) 1px, transparent 1px)',
                        backgroundSize: '32px 32px',
                    }} />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-11 h-11 bg-black rounded-2xl flex items-center justify-center shadow-lg overflow-hidden shrink-0">
                                <img src={appLogo} alt="ResolveIQ Logo" className="w-9 h-9 object-contain" />
                            </div>
                            <span className="text-xl font-black text-white tracking-tight uppercase">ResolveIQ</span>
                        </div>

                        <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">
                            Built for<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Teams.</span>
                        </h2>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">
                            Create your employee profile and start collaborating on issue resolution instantly.
                        </p>

                        <div className="space-y-3">
                            {features.map(({ icon: Icon, text }) => (
                                <div key={text} className="flex items-center gap-3">
                                    <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                        <Icon className="w-3.5 h-3.5 text-teal-400" />
                                    </div>
                                    <span className="text-slate-300 text-xs font-medium">{text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 p-4 bg-white/5 border border-white/10 rounded-2xl">
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Already have an account?</p>
                        <Link to="/login" className="text-teal-400 text-sm font-bold hover:underline">Sign in here →</Link>
                    </div>
                </div>

                {/* ── Right Panel: Form ── */}
                <div className="w-full lg:w-3/5 flex flex-col justify-center p-8 sm:p-12 bg-white overflow-y-auto max-h-screen">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-3 justify-center mb-6">
                        <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center overflow-hidden">
                            <img src={appLogo} alt="ResolveIQ Logo" className="w-8 h-8 object-contain" />
                        </div>
                        <span className="text-xl font-black text-slate-900 tracking-tight uppercase">ResolveIQ</span>
                    </div>

                    <div className="mb-6">
                        <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-1">Create Account</h1>
                        <p className="text-gray-400 text-sm">Fill in your employee details to get started</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Row 1: Full Name + Employee ID */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="full_name"
                                        value={formData.full_name}
                                        onChange={handleChange}
                                        placeholder="Your full name"
                                        className={inputClass('full_name')}
                                    />
                                </div>
                                {errors.full_name && <p className="mt-1 text-[10px] font-semibold text-red-500">{errors.full_name}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Employee ID</label>
                                <div className="relative">
                                    <IdCard className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${errors.employee_id ? 'text-red-400' : 'text-gray-400'}`} />
                                    <input
                                        name="employee_id"
                                        value={formData.employee_id}
                                        onChange={handleChange}
                                        placeholder="e.g. EMP123"
                                        className={`${inputClass('employee_id')} pr-8`}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                        {empIdStatus === 'checking' && <Loader2 className="w-3.5 h-3.5 text-slate-600 animate-spin" />}
                                        {empIdStatus === 'ok' && !errors.employee_id && <div className="w-2 h-2 rounded-full bg-green-500" />}
                                    </div>
                                </div>
                                {errors.employee_id && <p className="mt-1 text-[10px] font-semibold text-red-500">{errors.employee_id}</p>}
                            </div>
                        </div>

                        {/* Row 2: Email + Location */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Official Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@company.com"
                                        className={inputClass('email')}
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-[10px] font-semibold text-red-500">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Office Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="office_location"
                                        type="text"
                                        value={formData.office_location}
                                        onChange={handleChange}
                                        placeholder="Your work location"
                                        className={inputClass('office_location')}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Row 3: Password + Confirm */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Min 8 characters"
                                        className={`${inputClass('password')} pr-10`}
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-700 transition-colors">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.password && <p className="mt-1 text-[10px] font-semibold text-red-500">{errors.password}</p>}
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        name="confirm_password"
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={formData.confirm_password}
                                        onChange={handleChange}
                                        placeholder="Confirm password"
                                        className={`${inputClass('confirm_password')} pr-10`}
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-700 transition-colors">
                                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {errors.confirm_password && <p className="mt-1 text-[10px] font-semibold text-red-500">{errors.confirm_password}</p>}
                            </div>
                        </div>

                        {/* Errors */}
                        {errors.server && (
                            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                <p className="text-xs text-red-600 font-semibold">{errors.server}</p>
                            </div>
                        )}

                        {/* Terms */}
                        <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="relative mt-0.5 shrink-0">
                                <input
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="w-4 h-4 border-2 border-gray-200 rounded group-hover:border-slate-300 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600" />
                                <svg className="absolute inset-0 w-4 h-4 text-white scale-0 peer-checked:scale-100 transition-transform p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <span className="text-[11px] text-gray-400 leading-relaxed">
                                I confirm this is my official employee identity and agree to the{' '}
                                <Link to="/terms" target="_blank" className="text-indigo-600 font-semibold border-b border-indigo-600 hover:text-indigo-800 transition-colors">Terms of Service</Link>
                            </span>
                        </label>
                        {errors.terms && <p className="text-[10px] font-semibold text-red-500 -mt-2">{errors.terms}</p>}

                        {/* Submit */}
                        <div className="flex flex-col sm:flex-row gap-3 pt-1">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 h-12 rounded-xl font-black text-sm tracking-wider text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:opacity-90 active:scale-95"
                                style={{ background: 'linear-gradient(135deg, #064e3b, #059669)' }}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Account'}
                            </button>
                            <Link
                                to="/login"
                                className="sm:w-36 h-12 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs flex items-center justify-center hover:bg-slate-50 transition-all"
                            >
                                Back to Login
                            </Link>
                        </div>
                    </form>

                    {/* Admin Info Banner */}
                    <div className="mt-6 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xs font-bold text-amber-800 mb-0.5">Role-Based Account Notice</p>
                            <p className="text-[11px] text-amber-700 leading-relaxed">
                                <strong>Team Lead</strong> and <strong>Support Agent</strong> accounts are provisioned exclusively by a System Administrator. If you require elevated access, please contact your Admin to have your account created.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
