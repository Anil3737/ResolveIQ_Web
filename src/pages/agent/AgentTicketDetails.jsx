import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Clock, User, Layers, ShieldAlert,
    CheckCircle2, AlertCircle, Loader2, Briefcase,
    UserCheck, Play, ThumbsDown
} from 'lucide-react';
import api from '../../utils/api';

const statusColors = {
    'APPROVED': 'text-purple-600 bg-purple-50 border-purple-100',
    'IN_PROGRESS': 'text-orange-600 bg-orange-50 border-orange-100',
    'RESOLVED': 'text-green-600 bg-green-50 border-green-100',
    'CLOSED': 'text-gray-600 bg-gray-50 border-gray-100',
};

const AgentTicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    const fetchTicketDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tickets/${id}`);
            // Note: The /tickets/:id endpoint for Agent role should return can_accept etc logic
            // But we can also derive it here based on the ticket object
            setTicket(res.data.data);
        } catch (err) {
            console.error('Failed to fetch ticket details:', err);
            navigate('/agent/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (action) => {
        setActionLoading(true);
        try {
            await api.post('/agent/update-ticket', { ticket_id: id, action });
            await fetchTicketDetails();
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action.toLowerCase()} ticket`);
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
            </div>
        );
    }

    if (!ticket) return null;

    // Derived flags for actions
    const canAccept = ticket.status === 'APPROVED' && !ticket.assigned_to;
    const canResolve = ticket.status === 'IN_PROGRESS' && ticket.assigned_to === user.id;
    const canRelease = ticket.assigned_to === user.id && ticket.status === 'IN_PROGRESS';

    return (
        <div className="p-4 sm:p-8 lg:p-12 space-y-10 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-amber-600 transition-colors py-2 uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Queue
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[40px] p-8 sm:p-12 border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-10">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border-2 uppercase tracking-[0.2em] shadow-sm ${statusColors[ticket.status]}`}>
                                    {ticket.status}
                                </span>
                                <span className="text-[11px] font-black text-gray-400 font-mono tracking-tighter uppercase">
                                    #{ticket.ticket_number || ticket.id}
                                </span>
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.1]">{ticket.title}</h1>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 border-y border-gray-50 py-10">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block">Reporter</label>
                                <div className="flex items-center gap-2 text-base font-black text-gray-900">
                                    <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-gray-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                    {ticket.created_by_name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block">Category</label>
                                <div className="flex items-center gap-2 text-base font-black text-gray-900">
                                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                                        <Layers className="w-4 h-4" />
                                    </div>
                                    {ticket.issue_type || 'Support'}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block">Priority</label>
                                <div className="flex items-center gap-2 text-base font-black text-gray-900 uppercase">
                                    <div className={`w-3 h-3 rounded-full shadow-lg ${ticket.priority === 'HIGH' ? 'bg-red-500 shadow-red-500/20' : ticket.priority === 'MEDIUM' ? 'bg-orange-500 shadow-orange-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`} />
                                    {ticket.priority || 'Normal'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block">Description</label>
                            <p className="text-gray-600 leading-relaxed text-lg font-medium whitespace-pre-wrap selection:bg-amber-50 selection:text-amber-900">
                                {ticket.description}
                            </p>
                        </div>

                        {/* AI Breakdown */}
                        {ticket.ai_explanation && (
                            <div className="pt-10 border-t border-gray-50 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-50 text-red-600">
                                        <ShieldAlert className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">AI Conflict/Risk Analysis</h3>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Severity', value: ticket.ai_explanation.severity, max: 40, color: 'bg-red-500' },
                                        { label: 'Impact', value: ticket.ai_explanation.impact, max: 20, color: 'bg-orange-500' },
                                        { label: 'Urgency', value: ticket.ai_explanation.urgency, max: 15, color: 'bg-amber-500' },
                                        { label: 'Complexity', value: ticket.ai_explanation.complexity, max: 10, color: 'bg-teal-500' }
                                    ].map((item) => (
                                        <div key={item.label} className="bg-gray-50/50 rounded-3xl p-5 space-y-3 border border-gray-100 shadow-inner">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.label}</span>
                                                <span className="text-sm font-black text-gray-900">{item.value}</span>
                                            </div>
                                            <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-sm">
                                                <div
                                                    className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                                                    style={{ width: `${(item.value / item.max) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar Actions */}
                <div className="space-y-8">
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                        <div className="p-8 bg-gray-50/50 border-b border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-amber-600" />
                                Resolution Center
                            </h3>
                        </div>

                        <div className="p-8 space-y-8">
                            {canAccept && (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest px-1">Engagement</p>
                                    <button
                                        onClick={() => handleAction('ACCEPT')}
                                        disabled={actionLoading}
                                        className="w-full py-5 bg-amber-600 hover:bg-amber-700 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Play className="w-5 h-5" /> Start Resolution</>}
                                    </button>
                                </div>
                            )}

                            {canResolve && (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest px-1">Completion</p>
                                    <button
                                        onClick={() => handleAction('RESOLVE')}
                                        disabled={actionLoading}
                                        className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Mark Resolved</>}
                                    </button>
                                </div>
                            )}

                            {canRelease && (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest px-1">Escalation / Release</p>
                                    <button
                                        onClick={() => handleAction('DECLINE')}
                                        disabled={actionLoading}
                                        className="w-full py-5 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ThumbsDown className="w-5 h-5" /> Release Back to Pool</>}
                                    </button>
                                    <p className="text-[10px] text-gray-400 font-bold text-center px-4 uppercase tracking-tighter">Only release if you cannot fulfill this request</p>
                                </div>
                            )}

                            {ticket.status === 'RESOLVED' && (
                                <div className="bg-green-50 p-6 rounded-[28px] border border-green-100 space-y-3">
                                    <div className="flex items-center gap-3 text-green-600">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Incident Resolved</h4>
                                    </div>
                                    <p className="text-[13px] font-bold text-green-800 leading-snug text-center">
                                        This ticket has been marked as resolved.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Metadata */}
                    <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">AI Prediction Score</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-black text-gray-900">{ticket.ai_score || 0}%</span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mb-1.5 leading-none">Risk Index</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentTicketDetails;
