import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Inbox, CheckCircle, Clock, ArrowRight,
    Loader2, AlertCircle, Play, ThumbsDown,
    CheckCircle2, TrendingUp, ShieldAlert,
    Target, Zap
} from 'lucide-react';
import api from '../../utils/api';

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
        <div className="p-4 sm:p-8 lg:p-12 space-y-10 max-w-[1600px] mx-auto">
            {/* Dynamic Welcome Header */}
            <div className="relative group overflow-hidden bg-gradient-to-br from-[#78350f] via-[#b45309] to-[#d97706] rounded-[40px] p-8 lg:p-12 shadow-2xl shadow-amber-900/20">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/30 shadow-sm">
                                Agent Pulse
                            </span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                            Hero Command, <br />
                            <span className="text-amber-200">{user.full_name?.split(' ')[0]}</span>
                        </h2>
                        <p className="text-amber-100/80 text-lg font-bold max-w-xl leading-relaxed">
                            {myActive.length > 0
                                ? `You have ${myActive.length} operations in progress. The pool has ${pool.length} incoming requests.`
                                : "Your queue is clear. Ready to take on new department challenges?"}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
                            <p className="text-3xl font-black text-white leading-none mb-1">{resolved.length}</p>
                            <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest">Today's Wins</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-center">
                            <p className="text-3xl font-black text-white leading-none mb-1">{highPriority.length}</p>
                            <p className="text-[10px] font-black text-amber-200 uppercase tracking-widest">Critical Focused</p>
                        </div>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
            </div>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Load', value: myActive.length, icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100', trend: 'Critical Velocity' },
                    { label: 'Department Pool', value: pool.length, icon: Inbox, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100', trend: 'Incoming Volume' },
                    { label: 'Resolved Today', value: resolved.length, icon: Target, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100', trend: 'Efficiency Rate' },
                    { label: 'SLA Guard', value: '100%', icon: ShieldAlert, color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', trend: 'Strict Adherence' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-xl shadow-gray-200/40 group hover:-translate-y-2 transition-all duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-gray-200" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-4xl font-black text-gray-900 tracking-tight">{stat.value}</p>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {stat.trend}
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Active Focus Table */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em]">Active Operations</h3>
                        <button onClick={() => navigate('/agent/queue')} className="text-[10px] font-black text-amber-600 hover:text-amber-700 uppercase tracking-widest flex items-center gap-2">
                            Expand Intelligence <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-gray-50">
                                    {myActive.length === 0 ? (
                                        <tr>
                                            <td className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4 opacity-30">
                                                    <Clock className="w-12 h-12 text-gray-300" />
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Your queue is clear.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : myActive.slice(0, 5).map((t) => (
                                        <tr key={t.id} className="group hover:bg-orange-50/20 transition-all">
                                            <td className="px-8 py-6">
                                                <div className="space-y-1">
                                                    <p className="text-base font-black text-gray-900 group-hover:text-amber-700 transition-colors leading-tight">{t.title}</p>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">#{t.ticket_number || t.id} · {t.issue_type}</p>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border-2 ${t.priority === 'HIGH' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                                    {t.priority}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button onClick={() => navigate(`/agent/tickets/${t.id}`)} className="p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl text-gray-400 hover:text-amber-600 transition-all">
                                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Pool Briefing Sidebar */}
                <div className="space-y-6">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] px-2">Unclaimed Briefs</h3>
                    <div className="space-y-4">
                        {pool.slice(0, 4).map((t) => (
                            <div key={t.id} className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-xl shadow-gray-200/30 group hover:border-amber-200 transition-all">
                                <div className="flex items-start justify-between mb-4">
                                    <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full uppercase tracking-tighter shadow-sm">
                                        Pool Request
                                    </span>
                                    <span className="text-[10px] font-black text-gray-300 font-mono">#{t.ticket_number || t.id}</span>
                                </div>
                                <h4 className="text-sm font-black text-gray-900 mb-2 truncate">{t.title}</h4>
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${t.priority === 'HIGH' ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/20' : 'bg-green-500'}`} />
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.priority}</span>
                                    </div>
                                    <button
                                        onClick={() => handleAction(t.id, 'ACCEPT')}
                                        disabled={actionLoading === `${t.id}-ACCEPT`}
                                        className="inline-flex items-center gap-2 py-2 px-4 bg-gray-900 border-2 border-gray-900 text-white rounded-[20px] text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-gray-900 active:scale-95 transition-all shadow-lg shadow-gray-900/10"
                                    >
                                        {actionLoading === `${t.id}-ACCEPT` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                        Claim
                                    </button>
                                </div>
                            </div>
                        ))}
                        {pool.length === 0 && (
                            <div className="bg-gray-50 rounded-[32px] p-10 border border-gray-100 flex flex-col items-center gap-4 text-center">
                                <AlertCircle className="w-8 h-8 text-gray-200" />
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">Incoming channel is currently empty.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
