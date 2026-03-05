import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Inbox, CheckCircle, Clock, ArrowRight,
    Loader2, AlertCircle, Play, ThumbsDown,
    CheckCircle2, TrendingUp, ShieldAlert,
    Target, Zap, ChevronRight, LayoutDashboard
} from 'lucide-react';
import api from '../../utils/api';

const StatCard = ({ label, value, icon: Icon, colorClass, gradient }) => (
    <div className="relative overflow-hidden bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group lg:p-8">
        <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`} />
        <div className="relative z-10 flex flex-col gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass} shadow-lg shadow-current/10`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">{label}</p>
                <p className="text-4xl font-black text-gray-900">{value}</p>
            </div>
        </div>
    </div>
);

const AgentDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => { fetchTickets(); }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/agent/tickets');
            setTickets(res.data.data || []);
        } catch (err) {
            console.error('Agent dashboard fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (ticketId, action) => {
        setActionLoading(`${ticketId}-${action}`);
        try {
            await api.post('/agent/update-ticket', { ticket_id: ticketId, action });
            await fetchTickets();
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action.toLowerCase()} ticket`);
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
            </div>
        );
    }

    const myActive = tickets.filter(t => t.assigned_to === user.id && t.status === 'IN_PROGRESS');
    const pool = tickets.filter(t => t.can_accept);
    const resolved = tickets.filter(t => t.status === 'RESOLVED');
    const highPriority = tickets.filter(t => t.priority === 'HIGH' && t.assigned_to === user.id);

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:p-12 space-y-10">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-10 bg-amber-600 rounded-full" />
                            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">
                                Hello, {user.full_name?.split(' ')[0]}!
                            </h2>
                        </div>
                        <p className="text-gray-400 font-bold text-lg px-4 uppercase tracking-[0.2em] text-xs">
                            Resolution Command Center
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/agent/queue')}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-[24px] font-black shadow-2xl shadow-amber-500/20 transition-all active:scale-95 group"
                        >
                            <Inbox className="w-6 h-6 transition-transform group-hover:scale-110" />
                            <span>Browse Pool</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Active Focus"
                        value={myActive.length}
                        icon={Zap}
                        colorClass="bg-orange-600 text-white"
                        gradient="bg-orange-600"
                    />
                    <StatCard
                        label="Department Pool"
                        value={pool.length}
                        icon={Inbox}
                        colorClass="bg-blue-600 text-white"
                        gradient="bg-blue-600"
                    />
                    <StatCard
                        label="Resolved Today"
                        value={resolved.length}
                        icon={Target}
                        colorClass="bg-emerald-500 text-white"
                        gradient="bg-emerald-500"
                    />
                    <StatCard
                        label="SLA Compliance"
                        value="100%"
                        icon={ShieldAlert}
                        colorClass="bg-purple-600 text-white"
                        gradient="bg-purple-600"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Active Focus Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Active Operations</h3>
                                    <span className="bg-amber-50 text-amber-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                        Immediate Attention
                                    </span>
                                </div>
                                <button onClick={() => navigate('/agent/queue')}
                                    className="text-sm font-black text-amber-600 flex items-center gap-2 hover:translate-x-1 transition-transform">
                                    Full Queue <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Incident Details</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Priority</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {myActive.length > 0 ? (
                                            myActive.slice(0, 5).map((t) => (
                                                <tr key={t.id} onClick={() => navigate(`/agent/tickets/${t.id}`)} className="group hover:bg-gray-50/80 cursor-pointer transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xs group-hover:bg-amber-50 group-hover:text-amber-600 transition-colors">
                                                                #{t.ticket_number || t.id}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-gray-900 text-lg group-hover:text-amber-600 transition-colors tracking-tight">{t.title}</p>
                                                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">{t.issue_type || 'General Support'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex justify-center">
                                                            <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border-2 ${t.priority === 'HIGH' ? 'text-red-600 bg-red-50 border-red-100' : 'text-gray-500 bg-gray-50 border-gray-100'}`}>
                                                                {t.priority}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <button className="p-3 bg-gray-100 group-hover:bg-amber-100 rounded-2xl text-gray-400 group-hover:text-amber-600 transition-all">
                                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                                        <Clock className="w-16 h-16 text-gray-400" />
                                                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Clear Queue</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Pool Briefing Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-amber-700 to-amber-900 p-8 rounded-[48px] text-white shadow-2xl shadow-amber-500/30">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-black text-2xl tracking-tight text-white/90">Pool Requests</h3>
                                <button onClick={() => navigate('/agent/queue')} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {pool.slice(0, 4).map((t) => (
                                    <div key={t.id} className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-[24px] border border-white/5 transition-all group">
                                        <div className="w-12 h-12 rounded-2xl bg-amber-500/30 flex items-center justify-center font-black text-lg border border-amber-400/20">
                                            #{t.ticket_number?.slice(-2) || '!!'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{t.title}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${t.priority === 'HIGH' ? 'bg-red-400 animate-pulse' : 'bg-amber-400'}`} />
                                                <p className="text-amber-200 text-[10px] font-black uppercase tracking-widest">{t.priority}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleAction(t.id, 'ACCEPT'); }}
                                            disabled={actionLoading === `${t.id}-ACCEPT`}
                                            className="p-2 bg-white/10 hover:bg-white text-white hover:text-amber-900 rounded-lg transition-all"
                                        >
                                            {actionLoading === `${t.id}-ACCEPT` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                                        </button>
                                    </div>
                                ))}
                                {pool.length === 0 && (
                                    <p className="text-amber-300 text-xs font-bold text-center py-4">No incoming requests</p>
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/agent/queue')}
                                className="w-full mt-8 py-4 bg-white text-amber-900 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-amber-900/40"
                            >
                                Enter Warehouse
                            </button>
                        </div>

                        {/* Efficiency Tip */}
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12" />
                            <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-3 relative z-10">
                                <LayoutDashboard className="w-5 h-5 text-amber-600" />
                                Protocol Note
                            </h4>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed relative z-10">
                                Maintain strict SLA adherence. Resolve high-velocity incidents before engaging in new pool requests.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
