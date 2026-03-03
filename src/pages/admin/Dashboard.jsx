import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Ticket, Users, ShieldAlert, AlertTriangle,
    TrendingUp, ArrowRight, Loader2, CheckCircle2,
    Clock, Zap
} from 'lucide-react';
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../utils/api';

const StatCard = ({ label, value, icon: Icon, color, to }) => (
    <Link to={to || '#'} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4 hover:border-gray-200 hover:shadow-md transition-all group">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
            <Icon className="w-6 h-6" />
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
            <p className="text-xs text-gray-500 font-medium">{label}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 ml-auto transition-colors" />
    </Link>
);

const riskColor = (score) => {
    if (score >= 85) return 'text-red-600 bg-red-50';
    if (score >= 70) return 'text-orange-600 bg-orange-50';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50';
    return 'text-green-600 bg-green-50';
};

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState(null);
    const [distribution, setDistribution] = useState(null);
    const [topRisky, setTopRisky] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

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
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-6xl mx-auto">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-purple-800 to-purple-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-purple-200">
                <div className="relative z-10">
                    <p className="text-purple-200 text-xs font-medium uppercase tracking-widest mb-1">Admin Console</p>
                    <h2 className="text-2xl font-bold mb-1">Welcome back, {user.full_name?.split(' ')[0]}!</h2>
                    <p className="text-purple-200 text-sm">System overview and ticket risk monitoring.</p>
                </div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute right-20 -bottom-10 w-32 h-32 bg-purple-400/20 rounded-full blur-xl" />
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard label="Total Tickets" value={metrics?.total_tickets} icon={Ticket}
                    color="bg-blue-50 text-blue-600" to="/admin/tickets?filter=all" />
                <StatCard label="High Risk" value={metrics?.high_risk} icon={ShieldAlert}
                    color="bg-red-50 text-red-600" to="/admin/tickets?filter=high_risk" />
                <StatCard label="SLA Breached" value={metrics?.sla_breached} icon={Clock}
                    color="bg-orange-50 text-orange-600" to="/admin/tickets?filter=sla" />
                <StatCard label="Escalated" value={metrics?.escalated} icon={AlertTriangle}
                    color="bg-yellow-50 text-yellow-600" to="/admin/tickets?filter=escalated" />
            </div>

            {/* Risk Distribution + Top Risky */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Risk Distribution */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Risk Distribution</h3>
                        <TrendingUp className="w-4 h-4 text-gray-400" />
                    </div>

                    <div className="flex-1 min-h-[240px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Critical', value: distribution?.critical || 0, color: '#ef4444' },
                                        { name: 'High', value: distribution?.high || 0, color: '#f97316' },
                                        { name: 'Medium', value: distribution?.medium || 0, color: '#facc15' },
                                        { name: 'Low', value: distribution?.low || 0, color: '#22c55e' },
                                    ].filter(d => d.value > 0)}
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                    animationBegin={0}
                                    animationDuration={1500}
                                >
                                    {[
                                        { name: 'Critical', color: '#ef4444' },
                                        { name: 'High', color: '#f97316' },
                                        { name: 'Medium', color: '#facc15' },
                                        { name: 'Low', color: '#22c55e' },
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Total Label in Center */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pt-8">
                            <span className="text-xl font-bold text-gray-900">
                                {(distribution?.critical || 0) + (distribution?.high || 0) + (distribution?.medium || 0) + (distribution?.low || 0)}
                            </span>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tickets</span>
                        </div>
                    </div>
                </div>

                {/* Top Risky Tickets */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Top Risk Tickets</h3>
                        <Zap className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="space-y-3">
                        {topRisky.length === 0 ? (
                            <div className="flex flex-col items-center py-8 gap-2">
                                <CheckCircle2 className="w-8 h-8 text-green-300" />
                                <p className="text-sm text-gray-400">No high-risk tickets</p>
                            </div>
                        ) : topRisky.map((t) => (
                            <div key={t.id} onClick={() => navigate(`/admin/tickets/${t.id}`)}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer group transition-all border border-transparent hover:border-gray-100">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-purple-700">{t.title}</p>
                                    <p className="text-[10px] text-gray-400 font-medium">#{t.ticket_number || t.id}</p>
                                </div>
                                <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${riskColor(t.ai_score)}`}>
                                    Score {t.ai_score}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: 'Manage Users', to: '/admin/users', color: 'from-blue-50 to-blue-100 text-blue-700 border-blue-100' },
                    { label: 'View Teams', to: '/admin/teams', color: 'from-purple-50 to-purple-100 text-purple-700 border-purple-100' },
                    { label: 'Departments', to: '/admin/departments', color: 'from-teal-50 to-teal-100 text-teal-700 border-teal-100' },
                    { label: 'All Tickets', to: '/admin/tickets', color: 'from-orange-50 to-orange-100 text-orange-700 border-orange-100' },
                ].map(({ label, to, color }) => (
                    <Link key={to} to={to}
                        className={`bg-gradient-to-br ${color} border rounded-xl p-4 text-center text-sm font-bold hover:shadow-md transition-all active:scale-95`}>
                        {label}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AdminDashboard;
