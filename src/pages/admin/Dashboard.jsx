import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Ticket, Users, ShieldAlert, AlertTriangle,
    TrendingUp, ArrowRight, Loader2, CheckCircle2,
    Clock, Zap, Activity, BarChart3, Globe,
    ArrowUpRight, Settings, Building2, FileText
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import api from '../../utils/api';

const riskColor = (score) => {
    if (score >= 85) return { text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', dot: 'bg-red-500' };
    if (score >= 70) return { text: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', dot: 'bg-orange-500' };
    if (score >= 40) return { text: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-100', dot: 'bg-yellow-500' };
    return { text: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', dot: 'bg-green-500' };
};

const KpiCard = ({ label, value, icon: Icon, gradient, accent, sub, to, trend }) => (
    <Link to={to || '#'} className="group relative bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/60 transition-all overflow-hidden flex flex-col gap-4">
        {/* Gradient glow in corner */}
        <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-30 ${gradient}`} />
        <div className="relative z-10 flex items-start justify-between">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${accent} shadow-sm`}>
                <Icon className="w-7 h-7" />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-black text-gray-300 group-hover:text-gray-500 uppercase tracking-widest transition-colors">
                View <ArrowUpRight className="w-3 h-3" />
            </span>
        </div>
        <div className="relative z-10">
            <p className="text-5xl font-black text-gray-900 tracking-tighter leading-none mb-2">
                {value ?? <span className="text-gray-200">—</span>}
            </p>
            <p className="text-sm font-bold text-gray-500">{label}</p>
            {sub && <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest mt-1">{sub}</p>}
        </div>
    </Link>
);

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [distribution, setDistribution] = useState(null);
    const [topRisky, setTopRisky] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const now = new Date();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api.get('/admin/dashboard');
                setMetrics(res.data.metrics);
                setDistribution(res.data.risk_distribution);
                setTopRisky(res.data.top_risky_tickets || []);
            } catch (err) {
                console.error('Admin dashboard fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
                <p className="text-xs font-black text-gray-300 uppercase tracking-[0.3em]">Loading Intelligence...</p>
            </div>
        );
    }

    const pieData = [
        { name: 'Critical', value: distribution?.critical || 0, color: '#ef4444' },
        { name: 'High', value: distribution?.high || 0, color: '#f97316' },
        { name: 'Medium', value: distribution?.medium || 0, color: '#facc15' },
        { name: 'Low', value: distribution?.low || 0, color: '#22c55e' },
    ].filter(d => d.value > 0);

    const totalRisk = (distribution?.critical || 0) + (distribution?.high || 0) + (distribution?.medium || 0) + (distribution?.low || 0);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-10">

                {/* ── Hero Banner ── */}
                <div className="relative bg-gradient-to-r from-purple-900 via-purple-700 to-indigo-700 rounded-[40px] p-10 lg:p-14 text-white overflow-hidden shadow-2xl shadow-purple-500/20">
                    {/* Abstract blobs */}
                    <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute right-40 -bottom-12 w-48 h-48 bg-indigo-400/20 rounded-full blur-2xl" />
                    <div className="absolute left-1/2 top-0 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl" />

                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                <span className="text-purple-200 text-[10px] font-black uppercase tracking-[0.4em]">
                                    System Online — {now.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter leading-none">
                                Welcome back,<br />
                                <span className="text-purple-200">{user.full_name?.split(' ')[0] || 'Admin'}.</span>
                            </h1>
                            <p className="text-purple-200/80 text-base font-medium max-w-lg leading-relaxed">
                                System overview, ticket risk monitoring and operational command centre.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3 lg:flex-col lg:items-end shrink-0">
                            {[
                                { label: 'Total Tickets', val: metrics?.total_tickets ?? '—' },
                                { label: 'Active Agents', val: metrics?.active_agents ?? '—' },
                                { label: 'Open Tickets', val: metrics?.open_tickets ?? '—' },
                            ].map(item => (
                                <div key={item.label} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3 text-right">
                                    <p className="text-2xl font-black">{item.val}</p>
                                    <p className="text-purple-200 text-[10px] font-black uppercase tracking-widest">{item.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── KPI Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <KpiCard
                        label="Total Tickets"
                        value={metrics?.total_tickets}
                        icon={Ticket}
                        gradient="bg-blue-400"
                        accent="bg-blue-50 text-blue-600"
                        sub="All time"
                        to="/admin/tickets?filter=all"
                    />
                    <KpiCard
                        label="High Risk Tickets"
                        value={metrics?.high_risk}
                        icon={ShieldAlert}
                        gradient="bg-red-400"
                        accent="bg-red-50 text-red-600"
                        sub="AI Score ≥ 70"
                        to="/admin/tickets?filter=high_risk"
                    />
                    <KpiCard
                        label="SLA Breached"
                        value={metrics?.sla_breached}
                        icon={Clock}
                        gradient="bg-orange-400"
                        accent="bg-orange-50 text-orange-600"
                        sub="Needs immediate action"
                        to="/admin/tickets?filter=sla"
                    />
                    <KpiCard
                        label="Escalated"
                        value={metrics?.escalated}
                        icon={AlertTriangle}
                        gradient="bg-yellow-400"
                        accent="bg-yellow-50 text-yellow-600"
                        sub="Senior management review"
                        to="/admin/escalations"
                    />
                </div>

                {/* ── Middle Row: Chart + Table ── */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">

                    {/* Risk Distribution Donut */}
                    <div className="xl:col-span-2 bg-white rounded-[40px] border border-gray-100 shadow-sm p-8 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Risk Distribution</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Across all tickets</p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-2xl text-purple-600">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                        </div>

                        {pieData.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-40">
                                <CheckCircle2 className="w-12 h-12 text-green-400" />
                                <p className="text-sm font-bold text-gray-500">No risk data yet</p>
                            </div>
                        ) : (
                            <div className="flex-1 relative min-h-[260px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={72}
                                            outerRadius={100}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                            animationBegin={0}
                                            animationDuration={1200}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                        <Legend
                                            verticalAlign="bottom"
                                            height={40}
                                            formatter={(value) => <span style={{ fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{value}</span>}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center label */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: '40px' }}>
                                    <span className="text-4xl font-black text-gray-900">{totalRisk}</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Tickets</span>
                                </div>
                            </div>
                        )}

                        {/* Legend pills */}
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-6 border-t border-gray-50">
                            {[
                                { label: 'Critical', val: distribution?.critical || 0, color: 'bg-red-500' },
                                { label: 'High', val: distribution?.high || 0, color: 'bg-orange-500' },
                                { label: 'Medium', val: distribution?.medium || 0, color: 'bg-yellow-400' },
                                { label: 'Low', val: distribution?.low || 0, color: 'bg-green-500' },
                            ].map(item => (
                                <div key={item.label} className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-2xl">
                                    <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm`} />
                                    <div>
                                        <p className="text-xs font-black text-gray-900">{item.val}</p>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Risky Tickets Table */}
                    <div className="xl:col-span-3 bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-8 pb-6 border-b border-gray-50">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">High Risk Tickets</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Requires immediate attention</p>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-2xl text-red-500">
                                <Zap className="w-5 h-5" />
                            </div>
                        </div>

                        {topRisky.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 p-12 opacity-40">
                                <CheckCircle2 className="w-12 h-12 text-green-300" />
                                <p className="text-sm font-bold text-gray-400">No high-risk tickets — system is healthy</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto">
                                {/* Table header */}
                                <div className="grid grid-cols-12 px-8 py-3 bg-gray-50/80 border-b border-gray-100">
                                    <span className="col-span-1 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">#</span>
                                    <span className="col-span-6 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Ticket</span>
                                    <span className="col-span-3 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</span>
                                    <span className="col-span-2 text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Risk</span>
                                </div>
                                {topRisky.map((t, idx) => {
                                    const rc = riskColor(t.ai_score);
                                    return (
                                        <div
                                            key={t.id}
                                            onClick={() => navigate(`/admin/tickets/${t.id}`)}
                                            className="grid grid-cols-12 items-center px-8 py-5 hover:bg-purple-50/30 cursor-pointer border-b border-gray-50 last:border-0 transition-colors group"
                                        >
                                            <span className="col-span-1 text-xs font-black text-gray-300">{String(idx + 1).padStart(2, '0')}</span>
                                            <div className="col-span-6 pr-4">
                                                <p className="text-sm font-black text-gray-900 group-hover:text-purple-700 transition-colors truncate">{t.title}</p>
                                                <p className="text-[10px] font-bold text-gray-400 font-mono">#{t.ticket_number || t.id}</p>
                                            </div>
                                            <div className="col-span-3">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${t.status === 'IN_PROGRESS' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                                    t.status === 'OPEN' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        t.status === 'APPROVED' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                            'bg-gray-50 text-gray-500 border-gray-100'
                                                    }`}>
                                                    {t.status?.replace('_', ' ')}
                                                </span>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-end gap-2">
                                                <div className={`w-2 h-2 rounded-full ${rc.dot}`} />
                                                <span className={`text-sm font-black ${rc.text}`}>{t.ai_score}</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="px-8 py-4 border-t border-gray-50 bg-gray-50/50">
                            <Link to="/admin/tickets?filter=high_risk" className="text-[11px] font-black text-purple-600 hover:text-purple-800 uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all">
                                View all high risk tickets <ArrowRight className="w-3 h-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* ── Quick Actions ── */}
                <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-5">Quick Navigation</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { label: 'Manage Users', desc: 'Add, edit & remove staff', to: '/admin/users', icon: Users, from: 'from-blue-600', to_: 'to-blue-700' },
                            { label: 'View Teams', desc: 'Team composition & leads', to: '/admin/teams', icon: Globe, from: 'from-purple-600', to_: 'to-purple-700' },
                            { label: 'Departments', desc: 'Department overview', to: '/admin/departments', icon: Building2, from: 'from-teal-600', to_: 'to-teal-700' },
                            { label: 'All Tickets', desc: 'Browse full ticket list', to: '/admin/tickets', icon: FileText, from: 'from-orange-500', to_: 'to-orange-600' },
                        ].map(({ label, desc, to, icon: Icon, from, to_ }) => (
                            <Link key={to} to={to}
                                className={`bg-gradient-to-br ${from} ${to_} text-white rounded-[28px] p-7 hover:shadow-xl hover:scale-[1.02] transition-all active:scale-[0.98] flex flex-col gap-4 group`}>
                                <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center group-hover:bg-white/25 transition-colors">
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-black text-base tracking-tight">{label}</p>
                                    <p className="text-white/60 text-[11px] font-bold leading-tight mt-0.5">{desc}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
