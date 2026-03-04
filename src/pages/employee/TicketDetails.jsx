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
    Building,
    MessageSquare,
    ShieldCheck,
    History,
    Activity,
    ExternalLink,
    FileText,
    MapPin,
    Hash
} from 'lucide-react';
import api from '../../utils/api';
import { parseTicketData } from '../../utils/ticketUtils';

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
            const parsed = parseTicketData(response.data.data);
            setTicket(parsed);
            setProgress(response.data.progress);
        } catch (err) {
            console.error('Failed to fetch ticket details:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'OPEN': return 'text-blue-600 bg-blue-50 border-blue-100 ring-blue-500/10';
            case 'IN_PROGRESS':
            case 'APPROVED': return 'text-amber-600 bg-amber-50 border-amber-100 ring-amber-500/10';
            case 'RESOLVED':
            case 'CLOSED': return 'text-emerald-600 bg-emerald-50 border-emerald-100 ring-emerald-500/10';
            default: return 'text-gray-500 bg-gray-50 border-gray-100 ring-gray-500/10';
        }
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

    const timelineSteps = [
        { key: 'created', label: 'Incident Created' },
        { key: 'approved', label: 'Lead Validation' },
        { key: 'assigned', label: 'Agent Assigned' },
        { key: 'accepted', label: 'Agent Accepted' },
        { key: 'resolved', label: 'Resolution Verified' },
        { key: 'closed', label: 'Case Closed' }
    ];

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
            {/* Header Section */}
            <div className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:p-12 space-y-12">
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
                                    <span className="text-xs font-black uppercase tracking-widest">{ticket.id}</span>
                                </div>
                            </div>
                            <p className="text-gray-400 text-[10px] font-black mt-2 uppercase tracking-[0.3em] px-1">Case Investigation Protocol</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`px-8 py-4 rounded-[28px] border-2 shadow-sm font-black text-xs uppercase tracking-[0.2em] ring-4 ${getStatusStyles(ticket.status)}`}>
                            {ticket.status}
                        </div>
                        <div className={`px-8 py-4 rounded-[28px] border font-black text-xs uppercase tracking-[0.2em] ${getPriorityStyles(ticket.priority)} shadow-sm`}>
                            {ticket.priority} Priority
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Primary Info (Spans 8 columns) */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Summary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-10 rounded-[56px] border border-gray-100 shadow-xl shadow-gray-500/5">
                            <div className="col-span-full flex items-center gap-4 mb-4">
                                <ShieldCheck className="w-10 h-10 text-indigo-600" />
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Technical Metadata</h3>
                            </div>
                            <DetailItem label="Asset Department" value={ticket.department_name || 'General Support'} icon={Building} />
                            <DetailItem label="Classification" value={ticket.issue_type} icon={Tag} />
                            <DetailItem label="Site Location" value={ticket.location || 'Global/Remote'} icon={MapPin} />
                            <DetailItem label="Resolution Lead" value={ticket.assigned_to_name || 'Protocol Pending'} icon={User} />
                        </div>

                        {/* Description Section */}
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

                    {/* Sidebar Progress (Spans 4 columns) */}
                    <div className="lg:col-span-4 space-y-10">

                        {/* Progress Timeline */}
                        <div className="bg-white p-10 rounded-[56px] border border-gray-100 shadow-xl shadow-gray-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 opacity-50" />

                            <h3 className="text-xl font-black text-gray-900 tracking-tight mb-12 flex items-center gap-4 relative z-10">
                                <History className="w-8 h-8 text-indigo-600" />
                                Execution Flow
                            </h3>

                            <div className="relative pl-10 space-y-10 before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-[2px] before:bg-gray-50 before:shadow-inner relative z-10">
                                {timelineSteps.map((step) => {
                                    const data = progress?.[step.key];
                                    const isActive = data?.status;

                                    return (
                                        <div key={step.key} className="relative group/step">
                                            <div className={`absolute -left-[38px] top-1.5 w-8 h-8 rounded-full border-4 border-white shadow-xl flex items-center justify-center z-10 transition-all duration-300 ${isActive ? 'bg-indigo-600 scale-110 ring-4 ring-indigo-500/10' : 'bg-gray-100'}`}>
                                                {isActive ? <CheckCircle2 className="w-4 h-4 text-white" /> : <Circle className="w-2.5 h-2.5 text-gray-200 fill-gray-200" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-sm font-black uppercase tracking-widest transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </span>
                                                {isActive && data.timestamp ? (
                                                    <span className="text-[10px] font-black text-indigo-500 mt-1 opacity-70">
                                                        {new Date(data.timestamp).toLocaleString(undefined, { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-gray-300 mt-1 uppercase tracking-widest">Protocol Pending</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col items-center">
                                <button className="w-full py-4 bg-gray-50 hover:bg-gray-100 border border-transparent hover:border-gray-200 rounded-[24px] text-[10px] font-black uppercase tracking-widest text-gray-400 transition-all flex items-center justify-center gap-3 group">
                                    <ExternalLink className="w-4 h-4 group-hover:text-indigo-600" />
                                    Export secure log
                                </button>
                            </div>
                        </div>

                        {/* Quick Assistance Card */}
                        <div className="bg-indigo-900 p-10 rounded-[48px] text-white shadow-2xl shadow-indigo-500/20 group cursor-pointer relative overflow-hidden">
                            <Clock className="absolute right-[-10px] top-[-10px] w-32 h-32 text-white/5 group-hover:scale-110 transition-transform" />
                            <div className="relative z-10">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-6">Need Update?</p>
                                <h4 className="text-xl font-black tracking-tight mb-4">Escalate this incident if high urgency persists.</h4>
                                <button className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest text-white hover:text-indigo-200 transition-colors">
                                    Request escalation Protocol <ChevronRight className="w-4 h-4 translate-y-[-1px]" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
