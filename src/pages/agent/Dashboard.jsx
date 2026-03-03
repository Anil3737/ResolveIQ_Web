import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Inbox, CheckCircle, Clock, ArrowRight,
    Loader2, AlertCircle, Play, ThumbsDown, CheckCircle2
} from 'lucide-react';
import api from '../../utils/api';

const statusColor = (s) => {
    switch (s) {
        case 'APPROVED': return 'text-blue-600 bg-blue-50';
        case 'IN_PROGRESS': return 'text-orange-600 bg-orange-50';
        case 'RESOLVED': return 'text-green-600 bg-green-50';
        default: return 'text-gray-500 bg-gray-50';
    }
};

const priorityColor = (p) => {
    switch (p) {
        case 'HIGH': return 'text-red-600 bg-red-50';
        case 'MEDIUM': return 'text-orange-600 bg-orange-50';
        default: return 'text-gray-500 bg-gray-50';
    }
};

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
            console.error(`Action ${action} failed:`, err);
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

    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-amber-800 to-amber-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-amber-100">
                <div className="relative z-10">
                    <p className="text-amber-200 text-xs font-medium uppercase tracking-widest mb-1">Agent Portal</p>
                    <h2 className="text-2xl font-bold mb-1">Welcome, {user.full_name?.split(' ')[0]}!</h2>
                    <p className="text-amber-200 text-sm">Your support queue and active tickets.</p>
                </div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'My Active', value: myActive.length, icon: Clock, bg: 'bg-orange-50 text-orange-600' },
                    { label: 'Available Pool', value: pool.length, icon: Inbox, bg: 'bg-blue-50 text-blue-600' },
                    { label: 'Resolved', value: resolved.length, icon: CheckCircle, bg: 'bg-green-50 text-green-600' },
                ].map(({ label, value, icon: Icon, bg }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500 font-medium">{label}</p>
                    </div>
                ))}
            </div>

            {/* Available Pool */}
            {pool.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Available to Accept</h3>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{pool.length} tickets</span>
                    </div>
                    <div className="space-y-3">
                        {pool.map((t) => (
                            <div key={t.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">#{t.ticket_number || t.id}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${priorityColor(t.priority)}`}>{t.priority}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                                    <p className="text-[10px] text-gray-400 mt-0.5">{t.issue_type}</p>
                                </div>
                                <button
                                    onClick={() => handleAction(t.id, 'ACCEPT')}
                                    disabled={actionLoading === `${t.id}-ACCEPT`}
                                    className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50">
                                    {actionLoading === `${t.id}-ACCEPT` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                                    Accept
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* My Active Tickets */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">My Active Tickets</h3>
                    <button onClick={() => navigate('/agent/queue')}
                        className="text-[11px] font-bold text-amber-600 flex items-center gap-1 hover:underline">
                        View All <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
                <div className="space-y-3">
                    {myActive.length === 0 ? (
                        <div className="flex flex-col items-center py-8 gap-2">
                            <AlertCircle className="w-8 h-8 text-gray-200" />
                            <p className="text-sm text-gray-400">No active tickets. Accept from the pool above!</p>
                        </div>
                    ) : myActive.map((t) => (
                        <div key={t.id} className="bg-orange-50 rounded-xl p-4 border border-orange-100 flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{t.title}</p>
                                <p className="text-[10px] text-gray-500 mt-0.5">#{t.ticket_number || t.id} · {t.issue_type}</p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                                <button
                                    onClick={() => handleAction(t.id, 'RESOLVE')}
                                    disabled={actionLoading === `${t.id}-RESOLVE`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50">
                                    {actionLoading === `${t.id}-RESOLVE` ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                    Resolve
                                </button>
                                <button
                                    onClick={() => handleAction(t.id, 'DECLINE')}
                                    disabled={actionLoading === `${t.id}-DECLINE`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 text-xs font-bold rounded-lg transition-all disabled:opacity-50">
                                    {actionLoading === `${t.id}-DECLINE` ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsDown className="w-3 h-3" />}
                                    Release
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AgentDashboard;
