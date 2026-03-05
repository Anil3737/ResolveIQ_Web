import React, { useState, useEffect } from 'react';
import {
    Bell, AlertTriangle, Search, Filter,
    ChevronLeft, Loader2, Clock, ShieldAlert,
    CheckCircle2, ArrowRight, User, Building2,
    MoreHorizontal, ShieldCheck, Mail, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const statusColors = {
    'OPEN': 'bg-blue-100 text-blue-700',
    'APPROVED': 'bg-purple-100 text-purple-700',
    'IN_PROGRESS': 'bg-orange-100 text-orange-700',
    'RESOLVED': 'bg-green-100 text-green-700',
    'CLOSED': 'bg-gray-100 text-gray-700',
    'ESCALATED': 'bg-red-100 text-red-700 border border-red-200 animate-pulse',
};

const Escalations = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchEscalatedTickets();
    }, []);

    const fetchEscalatedTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/tickets?escalated=true');
            setTickets(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch escalated tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleResolveEscalation = async (ticketId) => {
        setActionLoading(ticketId);
        try {
            await api.post(`/api/tickets/${ticketId}/resolve-escalation`);
            setMessage({ type: 'success', text: 'Escalation cleared successfully' });
            setTickets(tickets.filter(t => t.id !== ticketId));
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to clear escalation' });
            setTimeout(() => setMessage(null), 3000);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredTickets = tickets.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <Loader2 className="w-12 h-12 text-orange-600 animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Scanning Escalation Matrix...</p>
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
                            <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                                <Bell className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-orange-600 text-[10px] font-black uppercase tracking-[0.3em]">Senior Management Intervention</span>
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-none">
                            Escalation<br />
                            <span className="text-orange-600">Queue.</span>
                        </h2>
                        <p className="text-gray-500 text-sm font-medium max-w-md">
                            High-priority tickets flagged for management review due to SLA breach, risk score, or manual escalation.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {message && (
                            <div className={`px-6 py-4 rounded-3xl border flex items-center gap-3 animate-slide-up shadow-xl ${message.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
                                }`}>
                                {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                                <span className="text-sm font-black uppercase tracking-widest">{message.text}</span>
                            </div>
                        )}
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-600 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search escalated tickets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-6 py-4 bg-white border border-gray-100 rounded-[24px] text-sm focus:outline-none focus:ring-4 focus:ring-orange-500/5 focus:border-orange-500 transition-all w-full md:w-80 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center">
                            <AlertTriangle className="w-7 h-7 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">{tickets.length}</p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Escalations</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                            <Clock className="w-7 h-7 text-red-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">
                                {tickets.filter(t => t.sla_breached).length}
                            </p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SLA Breaches</p>
                        </div>
                    </div>
                    <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center">
                            <ShieldAlert className="w-7 h-7 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-3xl font-black text-gray-900">
                                {tickets.filter(t => t.ai_score >= 85).length}
                            </p>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Critical Risk</p>
                        </div>
                    </div>
                </div>

                {/* Queue Table */}
                <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-400 text-[10px] font-black uppercase tracking-[0.2em]">
                                    <th className="px-10 py-6">Ticket Identity</th>
                                    <th className="px-10 py-6">Involved Dept</th>
                                    <th className="px-10 py-6">Risk Signal</th>
                                    <th className="px-10 py-6">Management Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredTickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-10 py-32 text-center text-gray-400">
                                            <div className="flex flex-col items-center gap-4 opacity-50">
                                                <ShieldCheck className="w-16 h-16 text-gray-200" />
                                                <p className="text-xl font-black uppercase tracking-widest">System Clear</p>
                                                <p className="font-medium">No active escalations requiring intervention.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTickets.map((t) => (
                                    <tr key={t.id} className="group hover:bg-orange-50/30 transition-all duration-300">
                                        <td className="px-10 py-8">
                                            <div className="flex items-start gap-4">
                                                <div className="mt-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse shrink-0" />
                                                <div className="space-y-1">
                                                    <h4 className="text-sm font-black text-gray-900 group-hover:text-orange-700 transition-colors">
                                                        {t.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">#{t.ticket_number}</span>
                                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${statusColors[t.status]}`}>
                                                            {t.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-gray-800">{t.department_name}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assignee: {t.assigned_to_name || 'Unassigned'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between gap-4 w-40">
                                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">AI Score</span>
                                                    <span className={`text-xs font-black ${t.ai_score >= 85 ? 'text-red-600' : 'text-orange-600'}`}>{t.ai_score}%</span>
                                                </div>
                                                <div className="w-40 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${t.ai_score >= 85 ? 'bg-red-500' : 'bg-orange-500'}`}
                                                        style={{ width: `${t.ai_score}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-8">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => navigate(`/admin/tickets/${t.id}`)}
                                                    className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-orange-600 hover:border-orange-100 hover:bg-orange-50/50 transition-all shadow-sm"
                                                    title="Deep Analysis"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleResolveEscalation(t.id)}
                                                    disabled={actionLoading === t.id}
                                                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-orange-600 rounded-2xl text-xs font-black text-white hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50"
                                                >
                                                    {actionLoading === t.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            <span>CLEAR ESCALATION</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50/50 transition-all shadow-sm">
                                                    <Mail className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-8 px-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span>SLA Breached</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span>Critical Risk Level</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span>Approved Policy</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Escalations;
