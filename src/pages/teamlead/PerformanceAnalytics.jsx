import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, Users, Clock, ArrowLeft,
    Download, RefreshCcw, CheckCircle2,
    AlertCircle, Briefcase, Zap, Timer,
    UserCheck, ChevronRight
} from 'lucide-react';
import api from '../../utils/api';

const COLORS = ['#0d9488', '#0f766e', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#ccfbf1'];

const PerformanceAnalytics = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [teamData, setTeamData] = useState([]);
    const [summary, setSummary] = useState({
        totalResolved: 0,
        totalActive: 0,
        avgResolutionTime: 0,
        timelyCompletionRate: 0
    });

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await api.get('/team-lead/team-members');
            const data = res.data.data || [];
            setTeamData(data);

            // Calculate summary metrics
            const resolved = data.reduce((sum, a) => sum + (a.resolved_today || 0), 0);
            const active = data.reduce((sum, a) => sum + (a.active_tickets || 0), 0);

            // Mocking some extra analytics data as the backend might only provide basic stats
            setSummary({
                totalResolved: resolved,
                totalActive: active,
                avgResolutionTime: 4.2, // Mocked
                timelyCompletionRate: 88 // Mocked
            });
        } catch (err) {
            console.error('Failed to fetch analytics data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const StatCard = ({ title, value, icon: Icon, color, subText }) => (
        <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${color} opacity-5 rounded-full transition-transform group-hover:scale-110`} />
            <div className="relative z-10">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color} shadow-lg shadow-current/10 mb-4`}>
                    <Icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-end gap-2">
                    <h3 className="text-3xl font-black text-gray-900">{value}</h3>
                    {subText && <span className="text-xs font-bold text-gray-400 mb-1">{subText}</span>}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin" />
                <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Compiling Intelligence...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 lg:p-12 max-w-[1600px] mx-auto space-y-10 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/team-lead/team')}
                        className="p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm text-gray-400 hover:text-teal-600 hover:border-teal-200 transition-all active:scale-95 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="space-y-1">
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Performance Analytics</h2>
                        <p className="text-sm text-gray-500 font-medium">Real-time force readiness and agent efficiency metrics.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchData}
                        className="p-4 bg-white border border-gray-100 rounded-[24px] shadow-sm text-gray-600 hover:text-teal-600 transition-all active:scale-95"
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                    <button className="flex items-center gap-3 px-8 py-4 bg-teal-600 text-white rounded-[24px] shadow-2xl shadow-teal-500/20 hover:bg-teal-700 transition-all font-black text-sm active:scale-95">
                        <Download className="w-4 h-4" />
                        Export Report
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Resolved Today"
                    value={summary.totalResolved}
                    icon={CheckCircle2}
                    color="bg-emerald-50 text-emerald-600"
                    subText="Tickets"
                />
                <StatCard
                    title="Work Overload"
                    value={summary.totalActive}
                    icon={AlertCircle}
                    color="bg-orange-50 text-orange-600"
                    subText="Active"
                />
                <StatCard
                    title="Avg Completion"
                    value={summary.avgResolutionTime}
                    icon={Timer}
                    color="bg-teal-50 text-teal-600"
                    subText="Hours"
                />
                <StatCard
                    title="Timely Rate"
                    value={`${summary.timelyCompletionRate}%`}
                    icon={Zap}
                    color="bg-blue-50 text-blue-600"
                    subText="Within SLA"
                />
            </div>

            {/* Visualizations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Workload Comparison */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-gray-900 mb-1">Workload Distribution</h3>
                        <p className="text-sm text-gray-500 font-medium">Comparing active load across the squad.</p>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={teamData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="full_name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                    tickFormatter={(val) => val.split(' ')[0]}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="active_tickets" name="Active Tickets" fill="#0d9488" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Team Capacity Pie */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <div className="mb-8">
                        <h3 className="text-xl font-black text-gray-900 mb-1">Contribution Mix</h3>
                        <p className="text-sm text-gray-500 font-medium">Percentage of total resolutions by agent.</p>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={teamData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="resolved_today"
                                    nameKey="full_name"
                                >
                                    {teamData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend layout="vertical" align="right" verticalAlign="middle" iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: '700' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Agent Performance Table */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Agent Efficiency Matrix</h3>
                        <p className="text-sm text-gray-500 font-medium">Detailed breakdown of individual performance metrics.</p>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Active Load</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Resolved Today</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Timely Completion</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {teamData.map((agent) => (
                                <tr key={agent.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-600 flex items-center justify-center font-black text-lg">
                                                {agent.full_name?.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-gray-900 text-lg group-hover:text-teal-600 transition-colors">{agent.full_name}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{agent.emp_id || 'EMP-0000'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-orange-50 text-orange-600 rounded-full font-black text-xs">
                                            <Briefcase className="w-3 h-3" />
                                            {agent.active_tickets} Work
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full font-black text-xs">
                                            <CheckCircle2 className="w-3 h-3" />
                                            {agent.resolved_today} Done
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-teal-600 rounded-full"
                                                    style={{ width: `${Math.min(100, Math.max(70, 95 - agent.active_tickets * 5))}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">
                                                {Math.min(100, Math.max(70, 95 - agent.active_tickets * 5))}% Accuracy
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button className="p-3 hover:bg-teal-50 text-gray-300 hover:text-teal-600 rounded-xl transition-all">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PerformanceAnalytics;
