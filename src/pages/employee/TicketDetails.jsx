import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Clock,
    User,
    Tag,
    AlertCircle,
    CheckCircle2,
    Circle,
    Loader2,
    Calendar,
    Building
} from 'lucide-react';
import api from '../../utils/api';

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTicketDetails();
    }, [id]);

    const fetchTicketDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/tickets/${id}`);
            setTicket(response.data.data);
            setProgress(response.data.progress);
        } catch (err) {
            console.error('Failed to fetch ticket details:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'OPEN': return 'text-blue-500 bg-blue-50';
            case 'IN_PROGRESS':
            case 'APPROVED': return 'text-orange-500 bg-orange-50';
            case 'RESOLVED':
            case 'CLOSED': return 'text-green-500 bg-green-50';
            default: return 'text-gray-500 bg-gray-50';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
                <button onClick={() => navigate(-1)} className="btn-outline w-40 h-10 flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>
        );
    }

    const timelineSteps = [
        { key: 'created', label: 'Ticket Created' },
        { key: 'approved', label: 'Approved by Lead' },
        { key: 'assigned', label: 'Assigned to Agent' },
        { key: 'accepted', label: 'Agent Accepted' },
        { key: 'resolved', label: 'Issue Resolved' },
        { key: 'closed', label: 'Ticket Closed' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <header className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
                <div>
                    <h1 className="text-lg font-bold text-gray-900">Ticket Details</h1>
                    <p className="text-xs text-gray-400 font-medium italic">#{ticket.id}</p>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
                {/* Status Banner */}
                <div className={`rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border ${getStatusColor(ticket.status).replace('bg-', 'border-')}`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(ticket.status)}`}>
                            {ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">Status: {ticket.status}</p>
                            <p className="text-xs text-gray-500">Updated on {new Date(ticket.updated_at).toLocaleString()}</p>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 text-xs font-bold text-gray-700 uppercase tracking-wider">
                        {ticket.priority} Priority
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card-premium h-full">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">{ticket.title}</h2>

                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Tag className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Department</span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-700">{ticket.department_name || 'General Support'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Calendar className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Issue Type</span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-700">{ticket.issue_type}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Building className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Location</span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-700">{ticket.location || 'Not Specified'}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <User className="w-4 h-4" />
                                        <span className="text-[10px] font-bold uppercase tracking-tight">Assigned To</span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-700">{ticket.assigned_to_name || 'Awaiting Assignment'}</p>
                                </div>
                            </div>

                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Description</h3>
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                        {ticket.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Progress Timeline */}
                    <div className="lg:col-span-1">
                        <div className="card-premium">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-6">Execution Progress</h3>

                            <div className="relative pl-8 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                                {timelineSteps.map((step) => {
                                    const data = progress?.[step.key];
                                    const isActive = data?.status;

                                    return (
                                        <div key={step.key} className="relative">
                                            <div className={`absolute -left-[30px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-colors ${isActive ? 'bg-primary' : 'bg-gray-200'}`}>
                                                {isActive ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Circle className="w-2 h-2 text-gray-300 fill-gray-300" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-bold transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </span>
                                                {isActive && data.timestamp && (
                                                    <span className="text-[10px] text-gray-400 mt-0.5">
                                                        {new Date(data.timestamp).toLocaleString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default TicketDetails;
