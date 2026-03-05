import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Clock, User, Layers, ShieldAlert,
    CheckCircle2, AlertCircle, Loader2, MapPin,
    UserCheck, Play, ThumbsDown, BriefcaseBusiness,
    AlertTriangle, RotateCcw, Brain
} from 'lucide-react';
import api from '../../utils/api';
import { parseTicketData } from '../../utils/ticketUtils';
import TicketProgressBar from '../../components/common/TicketProgressBar';

const statusColors = {
    'APPROVED': 'text-purple-600 bg-purple-50 border-purple-100',
    'IN_PROGRESS': 'text-orange-600 bg-orange-50 border-orange-100',
    'RESOLVED': 'text-green-600 bg-green-50 border-green-100',
    'CLOSED': 'text-gray-600 bg-gray-50 border-gray-100',
};

const getRiskColor = (score) => {
    if (score >= 70) return { bar: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', border: 'border-red-100', label: 'HIGH RISK' };
    if (score >= 40) return { bar: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', label: 'MODERATE' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'LOW RISK' };
};

const AgentTicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [ticket, setTicket] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showDeclineConfirm, setShowDeclineConfirm] = useState(false);

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    const fetchTicketDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/tickets/${id}`);
            const parsed = parseTicketData(res.data.data);
            setTicket(parsed);
            setProgress(res.data.progress);
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
            await api.post('/agent/update-ticket', { ticket_id: parseInt(id), action });
            if (action === 'DECLINE') {
                // After decline, go back to the queue
                navigate('/agent/queue');
            } else {
                // Refresh ticket for ACCEPT / RESOLVE
                await fetchTicketDetails();
            }
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action.toLowerCase()} ticket`);
        } finally {
            setActionLoading(false);
            setShowDeclineConfirm(false);
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

    const canAccept = ticket.can_accept;
    const canResolve = ticket.can_resolve;
    const canDecline = ticket.can_decline;
    const riskScore = ticket.ai_score || 0;
    const riskColors = getRiskColor(riskScore);

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

            <TicketProgressBar progress={progress} />

            {/* Decline Confirmation Modal */}
            {showDeclineConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[40px] p-10 max-w-md w-full shadow-2xl space-y-6 border border-red-100">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center">
                                <AlertTriangle className="w-7 h-7 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Decline Ticket?</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-600 font-medium text-sm leading-relaxed">
                            Declining this ticket will release it back to the department pool or allow the team lead to reassign it to another agent. Only decline if you genuinely cannot handle this request.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeclineConfirm(false)}
                                className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-black rounded-[20px] text-xs uppercase tracking-widest transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction('DECLINE')}
                                disabled={actionLoading}
                                className="flex-1 py-4 bg-red-600 hover:bg-red-700 text-white font-black rounded-[20px] text-xs uppercase tracking-widest transition-all shadow-xl shadow-red-500/20 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><ThumbsDown className="w-4 h-4" /> Confirm Decline</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Risk Score Banner — shown prominently */}
                    <div className={`flex items-center justify-between gap-6 p-6 rounded-[28px] border-2 ${riskColors.bg} ${riskColors.border}`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl bg-white shadow-sm ${riskColors.text}`}>
                                <ShieldAlert className="w-6 h-6" />
                            </div>
                            <div>
                                <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${riskColors.text}`}>AI Risk Score</p>
                                <p className={`text-3xl font-black ${riskColors.text}`}>{riskScore}<span className="text-lg">%</span></p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border-2 ${riskColors.bg} ${riskColors.border} ${riskColors.text}`}>
                                {riskColors.label}
                            </span>
                            <div className="mt-2 w-32 h-2 bg-white rounded-full overflow-hidden shadow-sm">
                                <div className={`h-full ${riskColors.bar} transition-all duration-1000`} style={{ width: `${riskScore}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* Ticket Card */}
                    <div className="bg-white rounded-[40px] p-8 sm:p-12 border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-10">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border-2 uppercase tracking-[0.2em] shadow-sm ${statusColors[ticket.status] || 'text-gray-600 bg-gray-50 border-gray-100'}`}>
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
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block">Location</label>
                                <div className="flex items-center gap-2 text-base font-black text-gray-900 capitalize">
                                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    {ticket.location || 'N/A'}
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
                                    <div className={`w-3 h-3 rounded-full shadow-lg ${ticket.priority === 'HIGH' || ticket.priority === 'P1' ? 'bg-red-500 shadow-red-500/20' : ticket.priority === 'MEDIUM' || ticket.priority === 'P2' ? 'bg-orange-500 shadow-orange-500/20' : 'bg-emerald-500 shadow-emerald-500/20'}`} />
                                    {ticket.priority || 'Normal'}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block">Description</label>
                            <p className="text-gray-600 leading-relaxed text-lg font-medium whitespace-pre-wrap selection:bg-amber-50 selection:text-amber-900">
                                {ticket.cleanDescription || ticket.description}
                            </p>
                        </div>

                        {/* AI Explanation Breakdown */}
                        {ticket.ai_explanation && (
                            <div className="pt-10 border-t border-gray-50 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-red-50 text-red-600">
                                        <Brain className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">AI Conflict/Risk Analysis</h3>
                                </div>

                                {/* Summary text if available */}
                                {ticket.ai_explanation.summary && (
                                    <div className="p-5 bg-gray-50 rounded-[24px] border border-gray-100">
                                        <p className="text-sm text-gray-600 leading-relaxed font-medium italic">
                                            "{ticket.ai_explanation.summary}"
                                        </p>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Severity', value: ticket.ai_explanation.severity, max: 40, color: 'bg-red-500' },
                                        { label: 'Impact', value: ticket.ai_explanation.impact, max: 20, color: 'bg-orange-500' },
                                        { label: 'Urgency', value: ticket.ai_explanation.urgency, max: 15, color: 'bg-amber-500' },
                                        { label: 'Complexity', value: ticket.ai_explanation.complexity, max: 10, color: 'bg-teal-500' }
                                    ].filter(item => item.value !== undefined && item.value !== null).map((item) => (
                                        <div key={item.label} className="bg-gray-50/50 rounded-3xl p-5 space-y-3 border border-gray-100 shadow-inner">
                                            <div className="flex justify-between items-center">
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.label}</span>
                                                <span className="text-sm font-black text-gray-900">{item.value}</span>
                                            </div>
                                            <div className="h-2 w-full bg-white rounded-full overflow-hidden shadow-sm">
                                                <div
                                                    className={`h-full ${item.color} transition-all duration-1000 ease-out`}
                                                    style={{ width: `${Math.min((item.value / item.max) * 100, 100)}%` }}
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
                    {/* Resolution Center */}
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                        <div className="p-8 bg-gray-50/50 border-b border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                <BriefcaseBusiness className="w-5 h-5 text-amber-600" />
                                Resolution Center
                            </h3>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* ACCEPT */}
                            {canAccept && (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest px-1">Accept & Begin</p>
                                    <button
                                        onClick={() => handleAction('ACCEPT')}
                                        disabled={actionLoading}
                                        className="w-full py-5 bg-amber-600 hover:bg-amber-700 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-amber-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Play className="w-5 h-5" /> Accept Ticket</>}
                                    </button>
                                    <p className="text-[10px] text-gray-400 font-bold text-center uppercase tracking-tighter">
                                        Accepting will assign this ticket exclusively to you.
                                    </p>
                                </div>
                            )}

                            {/* RESOLVE */}
                            {canResolve && (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest px-1">Mark Complete</p>
                                    <button
                                        onClick={() => handleAction('RESOLVE')}
                                        disabled={actionLoading}
                                        className="w-full py-5 bg-green-600 hover:bg-green-700 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Mark Resolved</>}
                                    </button>
                                </div>
                            )}

                            {/* DECLINE */}
                            {canDecline && (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-red-400 leading-relaxed uppercase tracking-widest px-1">Cannot Handle?</p>
                                    <button
                                        onClick={() => setShowDeclineConfirm(true)}
                                        disabled={actionLoading}
                                        className="w-full py-5 bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 rounded-[24px] font-black uppercase tracking-[0.2em] text-xs active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ThumbsDown className="w-5 h-5" /> Decline Ticket</>}
                                    </button>
                                    <p className="text-[10px] text-gray-400 font-bold text-center px-4 uppercase tracking-tighter">
                                        Ticket will return to pool for reassignment by team lead.
                                    </p>
                                </div>
                            )}

                            {/* Resolved State */}
                            {ticket.status === 'RESOLVED' && (
                                <div className="bg-green-50 p-6 rounded-[28px] border border-green-100 space-y-3">
                                    <div className="flex items-center gap-3 text-green-600">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Incident Resolved</h4>
                                    </div>
                                    <p className="text-[13px] font-bold text-green-800 leading-snug text-center">
                                        This ticket has been marked as resolved. Great work!
                                    </p>
                                </div>
                            )}

                            {/* In Progress waiting for action */}
                            {ticket.status === 'IN_PROGRESS' && !canResolve && !canDecline && (
                                <div className="bg-orange-50 p-6 rounded-[28px] border border-orange-100 space-y-3">
                                    <div className="flex items-center gap-3 text-orange-600">
                                        <UserCheck className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">In Progress</h4>
                                    </div>
                                    <p className="text-[13px] font-bold text-orange-800 leading-snug text-center">
                                        Being handled by another agent.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Risk Score Card */}
                    <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">AI Risk Index</p>
                            <div className="flex items-end gap-3">
                                <span className={`text-5xl font-black ${riskColors.text}`}>{riskScore}</span>
                                <span className={`text-lg font-black ${riskColors.text} mb-1`}>%</span>
                            </div>
                            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full ${riskColors.bar} transition-all duration-1000`} style={{ width: `${riskScore}%` }} />
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest ${riskColors.text}`}>{riskColors.label}</span>
                        </div>
                        {ticket.breach_risk !== undefined && ticket.breach_risk !== null && (
                            <div className="pt-4 border-t border-gray-50">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Breach Risk</p>
                                <p className="text-2xl font-black text-gray-900">{ticket.breach_risk}%</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgentTicketDetails;
