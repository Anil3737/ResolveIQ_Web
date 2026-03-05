import React, { useState, useEffect } from 'react';
import {
    Clock, ShieldAlert, Save, AlertCircle,
    CheckCircle2, Loader2, Building2, Zap,
    Shield, ArrowRight, History, Info
} from 'lucide-react';
import api from '../../utils/api';

const PRIORITIES = ['P1', 'P2', 'P3', 'P4'];
const PRIORITY_LABELS = {
    P1: { label: 'P1 - Critical', color: 'text-red-600', bg: 'bg-red-50' },
    P2: { label: 'P2 - High', color: 'text-orange-600', bg: 'bg-orange-50' },
    P3: { label: 'P3 - Medium', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    P4: { label: 'P4 - Low', color: 'text-green-600', bg: 'bg-green-50' },
};

const SLAPolicies = () => {
    const [departments, setDepartments] = useState([]);
    const [rules, setRules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // stores {deptId, priority}
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [deptsRes, rulesRes] = await Promise.all([
                api.get('/admin/departments'),
                api.get('/api/sla/rules') // Note: based on backend __init__ registration
            ]);
            setDepartments(deptsRes.data.data || []);
            setRules(rulesRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch SLA data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getRuleHours = (deptId, priority) => {
        const rule = rules.find(r => r.department_id === deptId && r.priority === priority);
        // Fallback to global defaults if no rule exists
        if (!rule) {
            if (priority === 'P1') return 4;
            if (priority === 'P2') return 8;
            if (priority === 'P3') return 16;
            return 24;
        }
        return rule.sla_hours;
    };

    const handleUpdateRule = async (deptId, priority, hours) => {
        setSaving({ deptId, priority });
        try {
            await api.post('/api/sla/rules', {
                department_id: deptId,
                priority: priority,
                sla_hours: parseInt(hours)
            });
            setMessage({ type: 'success', text: 'Policy updated successfully' });
            // Refresh rules
            const res = await api.get('/api/sla/rules');
            setRules(res.data.data);
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to update policy' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setSaving(null);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">Loading SLA Framework...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-[1400px] mx-auto p-6 lg:p-10 space-y-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-purple-600 text-[10px] font-black uppercase tracking-[0.3em]">Policy Engine</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-none">
                            Service Level<br />
                            <span className="text-purple-600">Agreements.</span>
                        </h2>
                        <p className="text-gray-500 text-sm font-medium max-w-md">
                            Define dynamic response and resolution deadlines for each department. SLARules are enforced at the moment of ticket creation.
                        </p>
                    </div>

                    {message && (
                        <div className={`px-6 py-4 rounded-3xl border flex items-center gap-3 animate-slide-up shadow-xl ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                            }`}>
                            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span className="text-sm font-black uppercase tracking-widest">{message.text}</span>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-[40px] p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
                    <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">System Intelligence</span>
                            </div>
                            <h3 className="text-2xl font-black tracking-tight">How SLA Rules Work</h3>
                            <ul className="space-y-2">
                                {[
                                    'Tickets are analyzed by AI to determine priority (P1-P4).',
                                    'The system looks up the SLA hours for that Priority + Department.',
                                    'If no specific rule exists, global defaults (4h, 8h, 16h, 24h) are applied.',
                                    'Deadlines are calculated instantly using UTC timestamps.'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm text-indigo-100/80">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="flex flex-col items-center bg-white/10 backdrop-blur-md rounded-[32px] p-8 border border-white/20 min-w-[240px]">
                            <History className="w-8 h-8 text-indigo-200 mb-4" />
                            <p className="text-3xl font-black">{rules.length}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Active Policies</p>
                        </div>
                    </div>
                </div>

                {/* Policy Matrix */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Department Matrix</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                        {departments.map(dept => (
                            <div key={dept.id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
                                {/* Side branding for department */}
                                <div className="lg:w-80 bg-gray-50/50 p-8 border-r border-gray-100 flex flex-col justify-between gap-6">
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                                            <Building2 className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-black text-gray-900 tracking-tight">{dept.name}</h4>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department ID: #{dept.id}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-2xl">
                                        <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">Status</p>
                                        <div className="flex items-center gap-2 text-purple-700">
                                            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                            <span className="text-xs font-bold">Enforcing active rules</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Matrix grid */}
                                <div className="flex-1 p-8 lg:p-10 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                    {PRIORITIES.map(priority => {
                                        const hours = getRuleHours(dept.id, priority);
                                        const isSaving = saving?.deptId === dept.id && saving?.priority === priority;
                                        const config = PRIORITY_LABELS[priority];

                                        return (
                                            <div key={priority} className="group flex flex-col gap-4 p-6 rounded-3xl bg-gray-50/30 border border-gray-50 hover:bg-white hover:border-purple-100 hover:shadow-xl hover:shadow-purple-500/5 transition-all">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
                                                        {config.label}
                                                    </span>
                                                    <Clock className="w-4 h-4 text-gray-300" />
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Response Hours</label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            defaultValue={hours}
                                                            onBlur={(e) => {
                                                                const val = e.target.value;
                                                                if (val != hours) {
                                                                    handleUpdateRule(dept.id, priority, val);
                                                                }
                                                            }}
                                                            className={`w-full bg-white border-2 border-transparent rounded-2xl px-4 py-3 text-lg font-black text-gray-900 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-600 transition-all ${isSaving ? 'opacity-50' : ''}`}
                                                        />
                                                        {isSaving && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-2xl">
                                                                <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <p className="text-[10px] font-medium text-gray-400 italic">
                                                    Deadlines will offset by {hours}h from creation.
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="flex items-center gap-3 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <Info className="w-5 h-5 text-blue-600" />
                    <p className="text-xs font-bold text-blue-800">
                        Changes to SLA rules are applied to <span className="underline">new tickets</span> only. Existing tickets will keep their original calculated deadlines.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SLAPolicies;
