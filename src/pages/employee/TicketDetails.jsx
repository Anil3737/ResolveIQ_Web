import React, { useState, useEffect, useRef } from 'react';
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
    Building,
    MessageSquare,
    ShieldCheck,
    History,
    Activity,
    ExternalLink,
    FileText,
    MapPin,
    Hash,
    RefreshCw,
    Hourglass,
    Wrench,
    BadgeCheck,
    XCircle
} from 'lucide-react';
import api from '../../utils/api';
import { parseTicketData } from '../../utils/ticketUtils';
import TicketProgressBar from '../../components/common/TicketProgressBar';

const STATUS_POLLING_INTERVAL = 30000; // 30 seconds

const STATUS_INFO = {
    OPEN: {
        label: 'Awaiting Review',
        description: 'Your ticket has been received and is waiting for a team lead to review and approve it.',
        icon: Hourglass,
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        badgeCls: 'text-blue-600 bg-blue-50 border-blue-100 ring-blue-500/10',
    },
    APPROVED: {
        label: 'Approved — Agent Being Assigned',
        description: 'Your ticket has been approved by the team lead and is now visible to support agents. An agent will pick it up shortly.',
        icon: BadgeCheck,
        color: 'text-purple-600',
        bg: 'bg-purple-50',
        border: 'border-purple-100',
        badgeCls: 'text-purple-600 bg-purple-50 border-purple-100 ring-purple-500/10',
    },
    IN_PROGRESS: {
        label: 'In Progress — Agent Working',
        description: 'A support agent has accepted your ticket and is actively working on it. You will be notified once resolved.',
        icon: Wrench,
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        badgeCls: 'text-amber-600 bg-amber-50 border-amber-100 ring-amber-500/10',
    },
    RESOLVED: {
        label: 'Resolved',
        description: 'Your issue has been resolved by our support team. If you\'re still experiencing problems, please create a new ticket.',
        icon: CheckCircle2,
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        badgeCls: 'text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-500/10',
    },
    CLOSED: {
        label: 'Closed',
        description: 'This ticket has been closed. If you have a new issue, please submit a new support request.',
        icon: XCircle,
        color: 'text-gray-600',
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        badgeCls: 'text-gray-600 bg-gray-50 border-gray-200 ring-gray-500/10',
    },
    ESCALATED: {
        label: 'Escalated',
        description: 'Your ticket has been escalated to senior management for urgent handling.',
        icon: AlertCircle,
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-100',
        badgeCls: 'text-red-600 bg-red-50 border-red-100 ring-red-500/10',
    },
};

const getPriorityStyles = (priority) => {
    switch (priority?.toUpperCase()) {
        case 'P1':
        case 'HIGH': return 'text-red-500 bg-red-50 border-red-100';
        case 'P2': return 'text-orange-600 bg-orange-50 border-orange-100';
        case 'P3':
        case 'MEDIUM': return 'text-amber-600 bg-amber-50 border-amber-100';
        case 'P4':
        case 'LOW': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
        default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
};

const TicketDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [progress, setProgress] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const pollingRef = useRef(null);

    const fetchTicketDetails = async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            else setRefreshing(true);
            const response = await api.get(`/tickets/${id}`);
            const parsed = parseTicketData(response.data.data);
            setTicket(parsed);
            setProgress(response.data.progress);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Failed to fetch ticket details:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTicketDetails(false);

        // Start polling every 30 seconds for live status updates
        pollingRef.current = setInterval(() => {
            fetchTicketDetails(true);
        }, STATUS_POLLING_INTERVAL);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8FAFC]">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400" />
                </div>
                <p className="mt-6 text-gray-400 font-black uppercase tracking-widest text-xs animate-pulse">Retrieving record from archive...</p>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#F8FAFC]">
                <div className="w-24 h-24 bg-gray-100 rounded-[40px] flex items-center justify-center mb-8 border border-gray-200 opacity-50">
                    <AlertCircle className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Record Not Found</h2>
                <p className="text-gray-400 font-medium mb-10 max-w-sm">The ticket you're looking for might have been archived or deleted from the system.</p>
                <button onClick={() => navigate(-1)} className="px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black shadow-xl transition-all flex items-center gap-3 active:scale-95">
                    <ArrowLeft className="w-5 h-5" /> Return to History
                </button>
            </div>
        );
    }

    const statusInfo = STATUS_INFO[ticket.status] || STATUS_INFO['OPEN'];
    const StatusIcon = statusInfo.icon;

    const DetailItem = ({ label, value, icon: Icon }) => (
        <div className="flex items-start gap-4 p-5 rounded-[24px] border border-gray-50 bg-white/50 hover:bg-white hover:shadow-lg hover:shadow-gray-200/20 transition-all cursor-default group">
            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-base font-black text-gray-900 tracking-tight">{value || '-'}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:p-12 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate(-1)} className="p-4 bg-white shadow-md hover:bg-gray-50 rounded-[24px] border border-gray-100 transition-all">
                            <ArrowLeft className="w-8 h-8 text-indigo-600" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-5xl font-black text-gray-900 tracking-tighter line-clamp-1 max-w-[600px]">{ticket.title}</h1>
                                <div className="bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full border border-indigo-100 flex items-center gap-2">
                                    <Hash className="w-4 h-4" />
                                    <span className="text-xs font-black uppercase tracking-widest">{ticket.ticket_number || ticket.id}</span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-[10px] font-black mt-2 uppercase tracking-[0.3em] px-1">Case Investigation Protocol</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`px-8 py-4 rounded-[28px] border-2 shadow-sm font-black text-xs uppercase tracking-[0.2em] ring-4 ${statusInfo.badgeCls}`}>
                            {statusInfo.label}
                        </div>
                        <div className={`px-8 py-4 rounded-[28px] border font-black text-xs uppercase tracking-[0.2em] ${getPriorityStyles(ticket.priority)} shadow-sm`}>
                            {ticket.priority} Priority
                        </div>
                    </div>
                </div>

                {/* Live Status Pulse */}
                <div className={`flex items-start gap-5 p-6 rounded-[32px] border-2 ${statusInfo.bg} ${statusInfo.border} relative overflow-hidden`}>
                    <div className={`p-3 rounded-2xl bg-white shadow-sm shrink-0 ${statusInfo.color}`}>
                        <StatusIcon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <p className={`text-sm font-black uppercase tracking-[0.2em] mb-1 ${statusInfo.color}`}>{statusInfo.label}</p>
                        <p className="text-gray-600 font-medium text-sm leading-relaxed">{statusInfo.description}</p>
                        {ticket.status === 'IN_PROGRESS' && ticket.assigned_to_name && (
                            <p className={`text-xs font-black mt-2 ${statusInfo.color}`}>
                                Agent: {ticket.assigned_to_name}
                            </p>
                        )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        <div className="flex items-center gap-2">
                            {refreshing
                                ? <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />
                                : <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                            }
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live</span>
                        </div>
                        {lastUpdated && (
                            <span className="text-[9px] text-gray-300 font-bold">
                                Updated {lastUpdated.toLocaleTimeString()}
                            </span>
                        )}
                    </div>
                </div>

                {/* Progress Bar */}
                <TicketProgressBar progress={progress} />

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Primary Info */}
                    <div className="lg:col-span-8 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-10 rounded-[56px] border border-gray-100 shadow-xl shadow-gray-500/5">
                            <div className="col-span-full flex items-center gap-4 mb-4">
                                <ShieldCheck className="w-10 h-10 text-indigo-600" />
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Technical Metadata</h3>
                            </div>
                            <DetailItem label="Asset Department" value={ticket.department_name || 'General Support'} icon={Building} />
                            <DetailItem label="Classification" value={ticket.issue_type} icon={Tag} />
                            <DetailItem label="Site Location" value={ticket.location || 'Global/Remote'} icon={MapPin} />
                            <DetailItem label="Resolution Lead" value={ticket.assigned_to_name || 'Pending Assignment'} icon={User} />
                        </div>

                        {/* Description */}
                        <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-xl shadow-gray-500/5 space-y-8">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-8">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-4">
                                    <FileText className="w-10 h-10 text-indigo-600" />
                                    Incident Report
                                </h3>
                                <div className="flex items-center gap-3 text-gray-400 text-xs font-black uppercase tracking-widest">
                                    <Calendar className="w-4 h-4" />
                                    Reported: {new Date(ticket.created_at).toLocaleDateString()}
                                </div>
                            </div>

                            <div className="bg-gray-50/50 rounded-[40px] p-8 border border-gray-50 shadow-inner-sm">
                                <p className="text-lg text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                                    {ticket.cleanDescription || ticket.description}
                                </p>
                            </div>

                            <div className="flex items-start gap-4 p-6 bg-indigo-50/30 rounded-[32px] border border-indigo-100/50">
                                <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm shrink-0">
                                    <MessageSquare className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-gray-800 tracking-tight mb-1">System Internal Note</p>
                                    <p className="text-xs text-indigo-700/70 font-bold leading-normal italic">
                                        All historical communications and attachments related to this case can be found in the secure audit trail.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* Status Timeline */}
                        <div className="bg-white p-8 rounded-[48px] border border-gray-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <History className="w-5 h-5 text-indigo-600" />
                                <h4 className="text-xs font-black text-gray-900 uppercase tracking-[0.2em]">Status Timeline</h4>
                            </div>
                            <div className="space-y-4">
                                {[
                                    { key: 'created', label: 'Ticket Created', ts: progress?.created?.timestamp, done: progress?.created?.status },
                                    { key: 'approved', label: 'Approved by Lead', ts: progress?.approved?.timestamp, done: progress?.approved?.status },
                                    { key: 'assigned', label: 'Assigned to Agent', ts: progress?.assigned?.timestamp, done: progress?.assigned?.status },
                                    { key: 'accepted', label: 'Agent Accepted', ts: progress?.accepted?.timestamp, done: progress?.accepted?.status },
                                    { key: 'resolved', label: 'Issue Resolved', ts: progress?.resolved?.timestamp, done: progress?.resolved?.status },
                                ].map((step) => (
                                    <div key={step.key} className="flex items-start gap-3">
                                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${step.done ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-300'}`}>
                                            {step.done
                                                ? <CheckCircle2 className="w-3 h-3" />
                                                : <Circle className="w-3 h-3" />
                                            }
                                        </div>
                                        <div>
                                            <p className={`text-xs font-black ${step.done ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</p>
                                            {step.done && step.ts && (
                                                <p className="text-[10px] text-gray-400 font-bold">
                                                    {new Date(step.ts).toLocaleString()}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick card */}
                        <div className="bg-indigo-900 p-10 rounded-[48px] text-white shadow-2xl shadow-indigo-500/20 group cursor-pointer relative overflow-hidden">
                            <Clock className="absolute right-[-10px] top-[-10px] w-32 h-32 text-white/5 group-hover:scale-110 transition-transform" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-6">Need Update?</p>
                                <h4 className="text-xl font-black tracking-tight mb-4">Escalate this incident if high urgency persists.</h4>
                                <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-white hover:text-indigo-200 transition-colors">
                                    Request escalation Protocol
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
