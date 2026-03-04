import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    User,
    CreditCard,
    Building2,
    MapPin,
    UserPlus,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    Mail,
    Shield,
    Briefcase,
    ChevronDown,
    X,
    Copy,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import api from '../../utils/api';

// ── Copy-to-clipboard button ──
const CopyBtn = ({ text }) => {
    const [copied, setCopied] = useState(false);
    const handle = () => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <button
            onClick={handle}
            title="Copy to clipboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-600'}`}
        >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy'}
        </button>
    );
};

const DEPARTMENTS = [
    'Network Issue',
    'Hardware Failure',
    'Software Installation',
    'Application Downtime / Application Issues',
    'Other'
];

const LOCATIONS = ['Chennai HQ', 'Bangalore', 'Hyderabad'];

const CreateStaff = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const role = searchParams.get('role') || 'AGENT'; // TEAM_LEAD or AGENT

    const isLead = role === 'TEAM_LEAD';
    const empRange = isLead ? '2000–3000' : '1000–1999';
    const title = isLead ? 'Register Team Lead' : 'Register Support Agent';
    const subtitle = isLead
        ? 'Fill in the information below to create a new Team Lead account.'
        : 'Assign a new Support Agent to a department.';
    const sectionTitle = isLead ? 'Team Lead Details' : 'Agent Details';

    // ── Form State ──
    const [formData, setFormData] = useState({
        full_name: '',
        emp_id: '',
        department: '',
        location: ''
    });
    const [errors, setErrors] = useState({});
    const [empIdStatus, setEmpIdStatus] = useState(null); // null | 'checking' | 'ok' | 'taken'
    const debounceRef = useRef(null);

    // ── Dropdown open state ──
    const [deptOpen, setDeptOpen] = useState(false);
    const [locOpen, setLocOpen] = useState(false);

    // ── Submission State ──
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(null); // null or { full_name, email, emp_id, role, department }

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e) => {
            if (!e.target.closest('[data-dropdown]')) {
                setDeptOpen(false);
                setLocOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // ── Real-time EMP ID uniqueness check ──
    useEffect(() => {
        const empId = formData.emp_id.trim().toUpperCase();
        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (/^EMP\d{4}$/.test(empId)) {
            setEmpIdStatus('checking');
            debounceRef.current = setTimeout(async () => {
                try {
                    const res = await api.get(`/admin/check-id?emp_id=${empId}`);
                    setEmpIdStatus(res.data.exists ? 'taken' : 'ok');
                    if (res.data.exists) {
                        setErrors(prev => ({ ...prev, emp_id: 'Employee ID already exists' }));
                    } else {
                        setErrors(prev => {
                            const next = { ...prev };
                            if (next.emp_id === 'Employee ID already exists') delete next.emp_id;
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
    }, [formData.emp_id]);

    // ── Validation ──
    const validate = () => {
        const errs = {};

        // Full Name
        const name = formData.full_name.trim();
        if (name.length < 3) {
            errs.full_name = 'Name must be at least 3 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(name)) {
            errs.full_name = 'Only alphabets and spaces allowed';
        }

        // EMP ID
        const empId = formData.emp_id.trim().toUpperCase();
        const empRegex = /^EMP\d{4}$/;
        if (!empId.startsWith('EMP')) {
            errs.emp_id = "Must start with 'EMP'";
        } else if (empId.length !== 7) {
            errs.emp_id = 'Must be exactly 7 characters (EMP + 4 digits)';
        } else if (!empRegex.test(empId)) {
            errs.emp_id = 'Invalid format. Expected EMPXXXX';
        } else {
            const num = parseInt(empId.substring(3), 10);
            if (isLead && !(num >= 2000 && num <= 3000)) {
                errs.emp_id = 'For Team Lead, numeric part must be 2000–3000';
            } else if (!isLead && !(num >= 1000 && num <= 1999)) {
                errs.emp_id = 'For Agent, numeric part must be 1000–1999';
            } else if (empIdStatus === 'taken') {
                errs.emp_id = 'Employee ID already exists';
            }
        }

        // Department
        if (!formData.department) {
            errs.department = 'Required field';
        }

        // Location
        if (!formData.location) {
            errs.location = 'Required field';
        }

        return errs;
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => {
            const next = { ...prev };
            if (next[field] && next[field] !== 'Employee ID already exists') delete next[field];
            return next;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
            setErrors(errs);
            return;
        }
        if (empIdStatus === 'checking') return; // wait for check

        setSubmitting(true);
        try {
            const payload = {
                full_name: formData.full_name.trim(),
                emp_id: formData.emp_id.trim().toUpperCase(),
                department: formData.department,
                location: formData.location,
                role: role
            };
            const res = await api.post('/admin/create-staff', payload);
            if (res.data.success) {
                setSuccess(res.data.data);
            } else {
                setErrors({ submit: res.data.message || 'Error creating staff' });
            }
        } catch (err) {
            setErrors({ submit: err.response?.data?.message || 'Network error. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    // ── Success Screen ──
    const DEFAULT_PASSWORD = 'Resolveiq@123';
    const [showPassword, setShowPassword] = useState(false);

    if (success) {
        return (
            <div className="min-h-full bg-gray-50 p-4 sm:p-6">
                <div className="max-w-xl mx-auto space-y-5">

                    {/* Top success banner */}
                    <div className={`rounded-[28px] p-8 text-white text-center space-y-3 shadow-2xl ${isLead ? 'bg-gradient-to-br from-purple-600 to-purple-800 shadow-purple-300' : 'bg-gradient-to-br from-blue-600 to-blue-800 shadow-blue-300'}`}>
                        <div className="flex justify-center">
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner">
                                <CheckCircle2 className="w-10 h-10 text-white" />
                            </div>
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-2">
                                {isLead ? <Shield className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
                                {isLead ? 'Team Lead' : 'Support Agent'} Created
                            </div>
                            <h2 className="text-2xl font-black">{success.full_name}</h2>
                            <p className="text-white/70 text-sm font-medium mt-1">{success.emp_id} &nbsp;·&nbsp; {success.department}</p>
                        </div>
                    </div>

                    {/* ── Login Credentials Card ── */}
                    <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 overflow-hidden">
                        {/* Card Header */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-50 bg-amber-50">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Lock className="w-4 h-4 text-amber-600" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-black text-amber-900">Login Credentials</p>
                                <p className="text-[11px] text-amber-600 font-medium">Share these with the staff member — visible only now</p>
                            </div>
                        </div>

                        {/* Email Row */}
                        <div className="px-6 py-4 border-b border-gray-50">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                                        <Mail className="w-4 h-4 text-blue-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                                        <p className="text-sm font-black text-gray-900 truncate">{success.email}</p>
                                    </div>
                                </div>
                                <CopyBtn text={success.email} />
                            </div>
                        </div>

                        {/* Password Row */}
                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                                        <Lock className="w-4 h-4 text-purple-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Default Password</p>
                                        <p className="text-sm font-black text-gray-900 font-mono tracking-wide">
                                            {showPassword ? DEFAULT_PASSWORD : '••••••••••••'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => setShowPassword(v => !v)}
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                        className="p-2 rounded-xl bg-gray-100 text-gray-500 hover:bg-purple-100 hover:text-purple-600 transition-all"
                                    >
                                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                    <CopyBtn text={DEFAULT_PASSWORD} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Must-change-password note */}
                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                        <AlertCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-700 font-semibold leading-relaxed">
                            Staff will be prompted to <strong>change their password</strong> on first login. Make sure you share the above credentials with them now.
                        </p>
                    </div>

                    {/* Profile summary */}
                    <div className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-6">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Profile Summary</p>
                        <div className="grid grid-cols-2 gap-y-4">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-purple-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Name</p>
                                    <p className="text-xs font-black text-gray-800">{success.full_name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-orange-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">EMP ID</p>
                                    <p className="text-xs font-black text-gray-800">{success.emp_id}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-green-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Department</p>
                                    <p className="text-xs font-black text-gray-800">{success.department}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {isLead ? <Shield className="w-4 h-4 text-purple-400 shrink-0" /> : <Briefcase className="w-4 h-4 text-blue-400 shrink-0" />}
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Role</p>
                                    <p className="text-xs font-black text-gray-800">{isLead ? 'Team Lead' : 'Support Agent'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pb-8">
                        <button
                            onClick={() => { setSuccess(null); setFormData({ full_name: '', emp_id: '', department: '', location: '' }); setErrors({}); setEmpIdStatus(null); }}
                            className="flex-1 py-4 border-2 border-gray-100 text-gray-600 hover:border-purple-200 hover:text-purple-600 rounded-2xl text-sm font-black transition-all"
                        >
                            Create Another
                        </button>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="flex-1 py-4 bg-purple-600 hover:bg-black text-white rounded-2xl text-sm font-black transition-all shadow-xl shadow-purple-200"
                        >
                            View All Users
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Form ──
    return (
        <div className="min-h-full bg-gray-50 p-4 sm:p-6">
            <div className="max-w-xl mx-auto space-y-6">

                {/* Back Button */}
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Users
                </button>

                {/* Header Card */}
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isLead ? 'bg-purple-600 shadow-purple-200' : 'bg-blue-600 shadow-blue-200'}`}>
                            <UserPlus className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-0.5">
                                {isLead ? 'Team Lead' : 'Support Agent'} Registration
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-8">
                    <div className="mb-7">
                        <h2 className="text-xl font-black text-gray-900">{sectionTitle}</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">{subtitle}</p>
                    </div>

                    <form onSubmit={handleSubmit} noValidate className="space-y-5">

                        {/* Submit Error */}
                        {errors.submit && (
                            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                <p className="text-sm font-bold text-red-600">{errors.submit}</p>
                            </div>
                        )}

                        {/* Full Name */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Full Name
                            </label>
                            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all ${errors.full_name ? 'border-red-300 bg-red-50' : 'border-gray-100 bg-gray-50 focus-within:border-purple-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-purple-500/5'}`}>
                                <User className={`w-5 h-5 shrink-0 ${errors.full_name ? 'text-red-400' : 'text-purple-500'}`} />
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={formData.full_name}
                                    onChange={(e) => handleChange('full_name', e.target.value)}
                                    className="flex-1 bg-transparent text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none"
                                />
                            </div>
                            {errors.full_name && (
                                <p className="text-xs font-bold text-red-500 ml-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.full_name}
                                </p>
                            )}
                        </div>

                        {/* Employee ID */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Employee ID
                            </label>
                            <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all ${errors.emp_id ? 'border-red-300 bg-red-50' : empIdStatus === 'ok' ? 'border-green-300 bg-green-50' : 'border-gray-100 bg-gray-50 focus-within:border-purple-500 focus-within:bg-white focus-within:shadow-lg focus-within:shadow-purple-500/5'}`}>
                                <CreditCard className={`w-5 h-5 shrink-0 ${errors.emp_id ? 'text-red-400' : empIdStatus === 'ok' ? 'text-green-500' : 'text-purple-500'}`} />
                                <input
                                    type="text"
                                    placeholder="Employee ID"
                                    value={formData.emp_id}
                                    onChange={(e) => handleChange('emp_id', e.target.value.toUpperCase())}
                                    maxLength={7}
                                    className="flex-1 bg-transparent text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none uppercase"
                                />
                                {empIdStatus === 'checking' && <Loader2 className="w-4 h-4 text-purple-400 animate-spin shrink-0" />}
                                {empIdStatus === 'ok' && <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />}
                                {empIdStatus === 'taken' && <X className="w-4 h-4 text-red-500 shrink-0" />}
                            </div>
                            {errors.emp_id ? (
                                <p className="text-xs font-bold text-red-500 ml-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.emp_id}
                                </p>
                            ) : (
                                <p className="text-[11px] text-gray-400 ml-2 font-medium">
                                    Format: EMPXXXX &nbsp;(Range: {empRange})
                                </p>
                            )}
                        </div>

                        {/* Department */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Select Department
                            </label>
                            <div className="relative" data-dropdown="dept">
                                <button
                                    type="button"
                                    onClick={() => { setDeptOpen(!deptOpen); setLocOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all text-left ${errors.department ? 'border-red-300 bg-red-50' : deptOpen ? 'border-purple-500 bg-white shadow-lg shadow-purple-500/5' : 'border-gray-100 bg-gray-50 hover:border-purple-200'}`}
                                >
                                    <Building2 className={`w-5 h-5 shrink-0 ${errors.department ? 'text-red-400' : 'text-purple-500'}`} />
                                    <span className={`flex-1 text-sm font-bold ${formData.department ? 'text-gray-900' : 'text-gray-300'}`}>
                                        {formData.department || 'Select Department'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${deptOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {deptOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden z-50">
                                        {DEPARTMENTS.map((d) => (
                                            <button
                                                key={d}
                                                type="button"
                                                onClick={() => { handleChange('department', d); setDeptOpen(false); }}
                                                className={`w-full text-left px-5 py-3.5 text-sm font-bold transition-colors hover:bg-purple-50 hover:text-purple-700 ${formData.department === d ? 'bg-purple-50 text-purple-700' : 'text-gray-700'}`}
                                            >
                                                {d}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {errors.department && (
                                <p className="text-xs font-bold text-red-500 ml-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.department}
                                </p>
                            )}
                        </div>

                        {/* Location */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                                Select Location
                            </label>
                            <div className="relative" data-dropdown="loc">
                                <button
                                    type="button"
                                    onClick={() => { setLocOpen(!locOpen); setDeptOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all text-left ${errors.location ? 'border-red-300 bg-red-50' : locOpen ? 'border-purple-500 bg-white shadow-lg shadow-purple-500/5' : 'border-gray-100 bg-gray-50 hover:border-purple-200'}`}
                                >
                                    <MapPin className={`w-5 h-5 shrink-0 ${errors.location ? 'text-red-400' : 'text-purple-500'}`} />
                                    <span className={`flex-1 text-sm font-bold ${formData.location ? 'text-gray-900' : 'text-gray-300'}`}>
                                        {formData.location || 'Select Location'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${locOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {locOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-gray-200/80 border border-gray-100 overflow-hidden z-50">
                                        {LOCATIONS.map((l) => (
                                            <button
                                                key={l}
                                                type="button"
                                                onClick={() => { handleChange('location', l); setLocOpen(false); }}
                                                className={`w-full text-left px-5 py-3.5 text-sm font-bold transition-colors hover:bg-purple-50 hover:text-purple-700 ${formData.location === l ? 'bg-purple-50 text-purple-700' : 'text-gray-700'}`}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {errors.location && (
                                <p className="text-xs font-bold text-red-500 ml-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" />{errors.location}
                                </p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting || empIdStatus === 'checking' || empIdStatus === 'taken'}
                                className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all active:scale-[0.98] shadow-2xl
                                    ${isLead
                                        ? 'bg-purple-600 hover:bg-black shadow-purple-200 text-white'
                                        : 'bg-blue-600 hover:bg-black shadow-blue-200 text-white'}
                                    disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {submitting ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                                ) : (
                                    <><UserPlus className="w-5 h-5" /> {isLead ? 'Register Team Lead' : 'Register Agent'}</>
                                )}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateStaff;
