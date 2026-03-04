import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    User,
    Layers,
    ShieldAlert,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Briefcase,
    ChevronRight,
    UserCheck,
} from 'lucide-react';
import api from '../../utils/api';

const statusColors = {
    'OPEN': 'text-blue-600 bg-blue-50 border-blue-100',
    'APPROVED': 'text-purple-600 bg-purple-50 border-purple-100',
    'IN_PROGRESS': 'text-orange-600 bg-orange-50 border-orange-100',
    'RESOLVED': 'text-green-600 bg-green-50 border-green-100',
    'CLOSED': 'text-gray-600 bg-gray-50 border-gray-100',
};

const TeamLeadTicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tkRes, tmRes] = await Promise.all([
                    api.get(`/tickets/${id}`),
                    api.get('/team-lead/team-members')
                ]);
                setTicket(tkRes.data.data);
                setTeamMembers(tmRes.data.data || []);
            } catch (err) {
                console.error('Failed to fetch ticket details:', err);
                navigate('/team-lead/tickets');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await api.post('/team-lead/approve-ticket', { ticket_id: id });
            // Refresh local state
            const res = await api.get(`/tickets/${id}`);
            setTicket(res.data.data);
        } catch (err) {
            console.error('Failed to approve ticket:', err);
            alert(err.response?.data?.message || 'Error approving ticket');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedAgent) return;
        setActionLoading(true);
        try {
            await api.post('/team-lead/assign-ticket', { ticket_id: id, agent_id: selectedAgent });
            // Refresh local state
            const res = await api.get(`/tickets/${id}`);
            setTicket(res.data.data);
            setSelectedAgent('');
        } catch (err) {
            console.error('Failed to assign ticket:', err);
            alert(err.response?.data?.message || 'Error assigning ticket');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="p-4 sm:p-8 lg:p-12 space-y-10 max-w-[1400px] mx-auto">
            {/* Header / Back */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/team-lead/tickets')}
                    className="flex items-center gap-2 text-sm font-black text-gray-500 hover:text-teal-600 transition-colors py-2 uppercase tracking-widest"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Feed
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Info */}
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
                                    <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
                                        <User className="w-4 h-4" />
                                    </div>
                                    {ticket.created_by_name}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] block">Category</label>
                                <div className="flex items-center gap-2 text-base font-black text-gray-900">
                                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
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
                            <p className="text-gray-600 leading-relaxed text-lg font-medium whitespace-pre-wrap selection:bg-teal-50 selection:text-teal-900">
                                {ticket.description}
                            </p>
                        </div>

                        {/* AI Breakdown */}
                        {ticket.ai_explanation && (
                            <div className="pt-10 border-t border-gray-50 space-y-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-teal-50 text-teal-600">
                                        <ShieldAlert className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xs font-black text-gray-900 uppercase tracking-[0.3em]">AI Risk Intelligence</h3>
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

                {/* Actions Sidebar */}
                <div className="space-y-8">
                    {/* Decision Center */}
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
                        <div className="p-8 bg-gray-50/50 border-b border-gray-100">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-[0.2em] flex items-center gap-3">
                                <Briefcase className="w-5 h-5 text-teal-600" />
                                Action Center
                            </h3>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Approve Section */}
                            {ticket.status === 'OPEN' && (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest">Initial Validation</p>
                                    <button
                                        onClick={handleApprove}
                                        disabled={actionLoading}
                                        className="w-full py-5 bg-teal-600 hover:bg-teal-700 text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-teal-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><CheckCircle2 className="w-5 h-5" /> Approve Request</>}
                                    </button>
                                </div>
                            )}

                            {/* Assign Section */}
                            {['OPEN', 'APPROVED'].includes(ticket.status) && (
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-gray-400 leading-relaxed uppercase tracking-widest">Resource Allocation</p>
                                    <div className="space-y-3">
                                        <select
                                            value={selectedAgent}
                                            onChange={(e) => setSelectedAgent(e.target.value)}
                                            className="w-full bg-gray-50 border-transparent rounded-[20px] px-5 py-4 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-teal-500/10 transition-all cursor-pointer"
                                        >
                                            <option value="">Choose Agent</option>
                                            {teamMembers.map(a => (
                                                <option key={a.id} value={a.id}>{a.full_name} ({a.active_tickets} Active)</option>
                                            ))}
                                        </select>
                                        <button
                                            onClick={handleAssign}
                                            disabled={actionLoading || !selectedAgent}
                                            className="w-full py-5 bg-gray-900 hover:bg-black text-white rounded-[24px] font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-gray-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale disabled:scale-100"
                                        >
                                            {actionLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserCheck className="w-5 h-5" /> Delegate Task</>}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {ticket.status === 'IN_PROGRESS' && (
                                <div className="bg-orange-50 p-6 rounded-[28px] border border-orange-100 space-y-3">
                                    <div className="flex items-center gap-3 text-orange-600">
                                        <Clock className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Agent Working</h4>
                                    </div>
                                    <p className="text-[13px] font-bold text-orange-800 leading-snug">
                                        This ticket is currently being handled by {ticket.assigned_to_name || 'an agent'}.
                                    </p>
                                </div>
                            )}

                            {['RESOLVED', 'CLOSED'].includes(ticket.status) && (
                                <div className="bg-emerald-50 p-6 rounded-[28px] border border-emerald-100 space-y-3">
                                    <div className="flex items-center gap-3 text-emerald-600">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <h4 className="text-[10px] font-black uppercase tracking-widest">Resolution Finalized</h4>
                                    </div>
                                    <p className="text-[13px] font-bold text-emerald-800 leading-snug">
                                        This request has been resolved and closed. No further lead intervention required.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Meta Info */}
                    <div className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">AI Predictor</p>
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-black text-gray-900">{ticket.ai_score || 0}%</span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-tighter mb-1.5 leading-none">Risk Threshold</span>
                            </div>
                        </div>
                        <p className="text-[13px] font-bold text-gray-500 leading-relaxed italic">
                            System recommended priority is <span className="text-teal-600">{ticket.priority || 'NORMAL'}</span> based on linguistic pattern analysis.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamLeadTicketDetails;
