import React, { useState, useEffect, useCallback } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
    TrendingUp, Users, Building2, ShieldCheck, Clock,
    ArrowUpRight, ArrowDownRight, RefreshCcw, Download,
    Filter, Calendar, ChevronRight, CheckCircle2,
    Star, Heart, Award, ThumbsUp, MessageSquare
} from 'lucide-react';
import api from '../../utils/api';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4'];

const StatCard = ({ title, value, subValue, icon: Icon, color, trend }) => (
    <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
        <div className="flex justify-between items-start mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon className="w-6 h-6" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-xs font-bold ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {trend > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <h3 className="text-3xl font-black text-gray-900">{value}</h3>
            {subValue && <p className="text-xs text-gray-500 font-medium mt-1">{subValue}</p>}
        </div>
    </div>
);

const SectionHeader = ({ title, description, badge }) => (
    <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
            <h3 className="text-xl font-black text-gray-900">{title}</h3>
            {badge && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-black rounded-lg uppercase tracking-wider">
                    {badge}
                </span>
            )}
        </div>
        <p className="text-sm text-gray-500 font-medium">{description}</p>
    </div>
);

const Reports = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [lastRefresh, setLastRefresh] = useState(new Date());
    const [data, setData] = useState({
        summary: null,
        department: [],
        trend: [],
        agents: [],
        sla: null,
        feedback: null
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [summaryRes, deptRes, trendRes, agentRes, slaRes, feedbackRes] = await Promise.all([
                api.get('/analytics/summary'),
                api.get('/analytics/by-department'),
                api.get('/analytics/trend?days=14'),
                api.get('/analytics/agent-performance'),
                api.get('/analytics/sla-compliance'),
                api.get('/analytics/feedback-summary')
            ]);

            setData({
                summary: summaryRes.data.data,
                department: deptRes.data.data,
                trend: trendRes.data.data,
                agents: agentRes.data.data,
                sla: slaRes.data.data,
                feedback: feedbackRes.data.data
            });
            setLastRefresh(new Date());
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleExport = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        if (activeTab === 'departments') {
            csvContent += "Department,Total,Open,Resolved\n";
            data.department.forEach(d => {
                csvContent += `${d.department},${d.total},${d.open},${d.resolved}\n`;
            });
        } else if (activeTab === 'agents') {
            csvContent += "Agent,EMP ID,Assigned,Resolved,Rate (%),Avg (Hrs)\n";
            data.agents.forEach(a => {
                csvContent += `${a.agent},${a.emp_id},${a.assigned},${a.resolved},${a.resolution_rate},${a.avg_resolution_hours}\n`;
            });
        } else {
            alert("Export not supported for this view yet");
            return;
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `resolveiq_report_${activeTab}_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && !data.summary) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-12 h-12 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Crunching data...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 max-w-[1600px] mx-auto space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">Intelligence Hub</h2>
                    <p className="text-sm text-gray-500 font-medium">Real-time analytical insights driving operational excellence.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Auto-refresh Active</span>
                        <span className="text-[11px] font-bold text-gray-500">Last updated: {lastRefresh.toLocaleTimeString()}</span>
                    </div>
                    <button
                        onClick={fetchData}
                        className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-600 hover:text-purple-600 hover:border-purple-200 transition-all active:scale-95"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-5 py-3 bg-purple-600 text-white rounded-2xl shadow-xl shadow-purple-200 hover:bg-black transition-all font-black text-sm active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Export Data
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 p-1.5 bg-gray-100/50 rounded-2xl w-fit">
                {[
                    { id: 'overview', label: 'Overview', icon: TrendingUp },
                    { id: 'departments', label: 'Departments', icon: Building2 },
                    { id: 'agents', label: 'Agent Performance', icon: Users },
                    { id: 'sla', label: 'SLA Analysis', icon: ShieldCheck },
                    { id: 'feedback', label: 'Feedback Analysis', icon: Award },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${activeTab === tab.id ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/50'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === 'overview' && (
                <div className="space-y-8 animate-slide-up">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <StatCard
                            title="Total Tickets"
                            value={data.summary?.total_tickets || 0}
                            subValue="Lifetime aggregate"
                            icon={TrendingUp}
                            color="bg-purple-50 text-purple-600"
                        />
                        <StatCard
                            title="Resolved"
                            value={data.summary?.status_summary?.RESOLVED || 0}
                            subValue={`${Math.round((data.summary?.status_summary?.RESOLVED / data.summary?.total_tickets) * 100) || 0}% Completion rate`}
                            icon={CheckCircle2}
                            color="bg-green-50 text-green-600"
                        />
                        <StatCard
                            title="Pending Approval"
                            value={data.summary?.status_summary?.OPEN || 0}
                            subValue="Waiting for action"
                            icon={Clock}
                            color="bg-amber-50 text-amber-600"
                        />
                        <StatCard
                            title="SLA Compliance"
                            value={`${data.sla?.compliance_pct || 0}%`}
                            subValue={`${data.sla?.breached || 0} Tickets breached`}
                            icon={ShieldCheck}
                            color="bg-blue-50 text-blue-600"
                        />
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <SectionHeader
                            title="Ticket Volatility Index"
                            description="Daily ticket creation trends over the last 14 days."
                            badge="Live Trend"
                        />
                        <div className="h-[400px] w-full mt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.trend}>
                                    <defs>
                                        <linearGradient id="colorTickets" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                        tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: '900', color: '#6366f1' }}
                                        labelStyle={{ fontSize: '10px', fontWeight: '700', color: '#9ca3af', marginBottom: '4px' }}
                                    />
                                    <Area type="monotone" dataKey="tickets" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorTickets)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'departments' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slide-up">
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <SectionHeader
                            title="Resource Distribution"
                            description="Workload balance across all organizational units."
                        />
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data.department} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="department"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        width={120}
                                        tick={{ fontSize: 11, fontWeight: 700, fill: '#374151' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f9fafb' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: '700' }} />
                                    <Bar dataKey="open" name="Active Tickets" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                                    <Bar dataKey="resolved" name="Resolved" fill="#22c55e" radius={[0, 4, 4, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                        <SectionHeader
                            title="Volume Mix"
                            description="Proportional analysis of ticket volume by department."
                        />
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.department}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={130}
                                        paddingAngle={5}
                                        dataKey="total"
                                        nameKey="department"
                                    >
                                        {data.department.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px', fontWeight: '700' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'agents' && (
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm p-4 overflow-hidden animate-slide-up">
                    <div className="p-4 sm:p-6 border-b border-gray-50 flex items-center justify-between">
                        <SectionHeader
                            title="Force Multipliers"
                            description="Granular performance metrics for frontline support agents."
                            badge="Agent Analytics"
                        />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Agent Identity</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Load</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Resolved</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Resolution Rate</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Avg Resolution</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {data.agents.map((agent, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-black text-xs">
                                                    {agent.agent.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 leading-none mb-1">{agent.agent}</p>
                                                    <p className="text-[10px] font-bold text-gray-400">{agent.emp_id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-black">
                                                {agent.assigned} Assigned
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-black">
                                                {agent.resolved} Completed
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center gap-1.5 min-w-[120px]">
                                                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-purple-600"
                                                        style={{ width: `${agent.resolution_rate}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-black text-gray-700">{agent.resolution_rate}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-sm font-black text-gray-900">{agent.avg_resolution_hours || '-'} h</span>
                                                <span className="text-[10px] font-bold text-gray-400">Mean Time</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'sla' && (
                <div className="space-y-8 animate-slide-up">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-4 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                            <SectionHeader
                                title="SLA Compliance Status"
                                description="Real-time fidelity to Service Level Agreements."
                            />

                            <div className="relative w-64 h-64 flex items-center justify-center">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="128" cy="128" r="100"
                                        stroke="currentColor"
                                        strokeWidth="20"
                                        fill="transparent"
                                        className="text-gray-100"
                                    />
                                    <circle
                                        cx="128" cy="128" r="100"
                                        stroke="currentColor"
                                        strokeWidth="20"
                                        fill="transparent"
                                        strokeDasharray={628}
                                        strokeDashoffset={628 - (628 * (data.sla?.compliance_pct || 0)) / 100}
                                        className="text-purple-600 transition-all duration-1000 ease-out"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-5xl font-black text-gray-900">{data.sla?.compliance_pct}%</span>
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Compliance</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 w-full mt-8 pt-8 border-t border-gray-50">
                                <div>
                                    <p className="text-sm font-black text-gray-900">{data.sla?.met}</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SLA Met</p>
                                </div>
                                <div>
                                    <p className="text-sm font-black text-red-500">{data.sla?.breached}</p>
                                    <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">SLA Breached</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-8 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                            <SectionHeader
                                title="Fidelity Breakdown"
                                description="Compliance performance segmented by department."
                            />

                            <div className="space-y-6 mt-8">
                                {data.sla?.by_department.map((dept, idx) => (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{dept.department}</p>
                                                <p className="text-[10px] font-bold text-gray-400">{dept.total} Total SLA Tickets</p>
                                            </div>
                                            <span className={`text-sm font-black ${dept.compliance_pct > 90 ? 'text-green-600' : dept.compliance_pct > 70 ? 'text-amber-500' : 'text-red-500'}`}>
                                                {dept.compliance_pct}%
                                            </span>
                                        </div>
                                        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 ${dept.compliance_pct > 90 ? 'bg-green-500' : dept.compliance_pct > 70 ? 'bg-amber-400' : 'bg-red-500'}`}
                                                style={{ width: `${dept.compliance_pct}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'feedback' && (
                <div className="space-y-8 animate-slide-up">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <StatCard
                            title="Average Rating"
                            value={data.feedback?.avg_rating || 0}
                            subValue="Out of 5 stars"
                            icon={Star}
                            color="bg-amber-50 text-amber-600"
                        />
                        <StatCard
                            title="Total Submissions"
                            value={data.feedback?.total_feedbacks || 0}
                            subValue="Employee sentiment data"
                            icon={MessageSquare}
                            color="bg-purple-50 text-purple-600"
                        />
                        <StatCard
                            title="Resolution Score"
                            value={`${Math.round(((data.feedback?.avg_rating || 0) / 5) * 100)}%`}
                            subValue="Satisfaction index"
                            icon={Heart}
                            color="bg-rose-50 text-rose-600"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                            <SectionHeader
                                title="Sentiment Distribution"
                                description="Percentage breakdown of user ratings."
                            />
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={Object.entries(data.feedback?.rating_distribution || {}).map(([star, count]) => ({
                                                name: `${star} Stars`,
                                                value: count
                                            })).filter(d => d.value > 0)}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={130}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {['#EF4444', '#F97316', '#FBBF24', '#34D399', '#4F46E5'].map((color, index) => (
                                                <Cell key={`cell-${index}`} fill={color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '11px', fontWeight: '700' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                            <SectionHeader
                                title="Service Highlights"
                                description="Most common positive attributes reported by staff."
                            />
                            <div className="h-[400px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={Object.entries(data.feedback?.top_suggestions || {}).map(([label, count]) => ({
                                        name: label,
                                        count: count
                                    }))} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="name"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            width={140}
                                            tick={{ fontSize: 11, fontWeight: 700, fill: '#374151' }}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f9fafb' }}
                                            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Bar dataKey="count" name="Frequency" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24}>
                                            {Object.entries(data.feedback?.top_suggestions || {}).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
