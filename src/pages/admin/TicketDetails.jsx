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
    Trash2,
    ChevronRight,
    Calendar,
    Briefcase,
} from 'lucide-react';
import api from '../../utils/api';

const statusColors = {
    'OPEN': 'text-blue-600 bg-blue-50 border-blue-100',
    'APPROVED': 'text-purple-600 bg-purple-50 border-purple-100',
    'IN_PROGRESS': 'text-orange-600 bg-orange-50 border-orange-100',
    'RESOLVED': 'text-green-600 bg-green-50 border-green-100',
    'CLOSED': 'text-gray-600 bg-gray-50 border-gray-100',
};

const stageOrder = [
    { key: 'created', label: 'Created', icon: Calendar },
    { key: 'approved', label: 'Approved', icon: CheckCircle2 },
    { key: 'assigned', label: 'Assigned', icon: User },
    { key: 'accepted', label: 'Accepted', icon: Briefcase },
    { key: 'resolved', label: 'Resolved', icon: ShieldAlert },
    { key: 'closed', label: 'Closed', icon: AlertCircle },
];

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const res = await api.get(`/tickets/${id}`);
                setTicket(res.data.data);
                setProgress(res.data.progress);
            } catch (err) {
                console.error('Failed to fetch ticket details:', err);
                navigate('/admin/tickets');
            } finally {
                setLoading(false);
            }
        };
        fetchTicket();
    }, [id, navigate]);

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) return;
        setActionLoading(true);
        try {
            await api.delete(`/tickets/${id}`);
            navigate('/admin/tickets');
        } catch (err) {
            console.error('Failed to delete ticket:', err);
            alert('Error deleting ticket');
        } finally {
            setActionLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setActionLoading(true);
        try {
            await api.post('/tickets/update-status', { ticket_id: id, new_status: newStatus });
            // Refresh local state
            const res = await api.get(`/tickets/${id}`);
            setTicket(res.data.data);
            setProgress(res.data.progress);
        } catch (err) {
            console.error('Failed to update status:', err);
            alert(err.response?.data?.message || 'Error updating status');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    if (!ticket) return null;

    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto">
            {/* Header / Back */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/tickets')}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors py-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to All Tickets
                </button>
                <button
                    onClick={handleDelete}
                    disabled={actionLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Ticket
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm space-y-6">
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-widest ${statusColors[ticket.status]}`}>
                                    {ticket.status}
                                </span>
                                <span className="text-[10px] font-bold text-gray-400 font-mono tracking-tighter">
                                    #{ticket.ticket_number || ticket.id}
                                </span>
                            </div>
                            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">{ticket.title}</h1>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-y border-gray-50 py-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Created By</label>
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <User className="w-4 h-4 text-purple-400" />
                                    {ticket.created_by_name}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Department</label>
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Layers className="w-4 h-4 text-purple-400" />
                                    {ticket.department_name || 'N/A'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Priority</label>
                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <div className={`w-2 h-2 rounded-full ${ticket.priority === 'HIGH' ? 'bg-red-500' : ticket.priority === 'MEDIUM' ? 'bg-orange-500' : 'bg-green-500'}`} />
                                    {ticket.priority}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Description</label>
                            <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{ticket.description}</p>
                        </div>
                    </div>

                    {/* Quick Admin Actions */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Admin Status Override</h3>
                        <div className="flex flex-wrap gap-2">
                            {['OPEN', 'APPROVED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => (
                                <button
                                    key={s}
                                    disabled={actionLoading || ticket.status === s}
                                    onClick={() => handleStatusUpdate(s)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-50
                                        ${ticket.status === s
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-200 cursor-default'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-100'}
                                    `}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* AI Risk Card */}
                    <div className={`rounded-3xl p-6 border shadow-sm relative overflow-hidden ${ticket.ai_score >= 85 ? 'bg-red-50 border-red-100' :
                            ticket.ai_score >= 70 ? 'bg-orange-50 border-orange-100' : 'bg-green-50 border-green-100'
                        }`}>
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <ShieldAlert className={`w-10 h-10 mb-2 ${ticket.ai_score >= 85 ? 'text-red-500' :
                                    ticket.ai_score >= 70 ? 'text-orange-500' : 'text-green-500'
                                }`} />
                            <div className="text-3xl font-black text-gray-900 leading-none">{ticket.ai_score || 0}%</div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">AI Risk Score</p>
                            <p className="text-xs text-gray-500 mt-4 leading-relaxed font-medium">
                                {ticket.ai_score >= 70 ? 'High risk detected. Immediate attention recommended.' : 'Low risk detected by system.'}
                            </p>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/20 rounded-full blur-xl" />
                    </div>

                    {/* Progress Tracker */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-6">Workflow Progress</h3>
                        <div className="space-y-0 relative pl-4">
                            {/* Vertical Line */}
                            <div className="absolute left-[31px] top-6 bottom-6 w-0.5 bg-gray-100" />

                            {stageOrder.map((stage, idx) => {
                                const data = progress?.[stage.key];
                                const isActive = data?.status;
                                const isLatest = isActive && (idx === stageOrder.length - 1 || !progress?.[stageOrder[idx + 1].key]?.status);

                                return (
                                    <div key={stage.key} className="flex gap-4 pb-8 last:pb-0 relative">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-all duration-500 ${isActive
                                                ? 'bg-purple-600 text-white shadow-lg shadow-purple-100 scale-110'
                                                : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            <stage.icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col pt-1.5">
                                            <span className={`text-sm font-bold tracking-tight ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                                {stage.label}
                                            </span>
                                            {data?.timestamp && (
                                                <span className="text-[10px] text-gray-400 font-medium">
                                                    {new Date(data.timestamp).toLocaleString('en-US', {
                                                        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                                    })}
                                                </span>
                                            )}
                                            {isActive && !data?.timestamp && (
                                                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-tighter">Current Stage</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
