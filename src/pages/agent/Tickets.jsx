import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Search, Filter, ChevronRight, Loader2,
    AlertCircle, CheckCircle2, User, Layers,
    Clock, Ticket, ArrowRight, ShieldAlert,
    Inbox, Play, ThumbsDown
} from 'lucide-react';
import api from '../../utils/api';

const statusColors = {
    'APPROVED': 'bg-blue-100 text-blue-700 border-blue-200',
    'IN_PROGRESS': 'bg-orange-100 text-orange-700 border-orange-200',
    'RESOLVED': 'bg-green-100 text-green-700 border-green-200',
    'CLOSED': 'bg-gray-100 text-gray-700 border-gray-200',
};

const priorityColors = {
    'HIGH': 'bg-red-100 text-red-700 border-red-200',
    'MEDIUM': 'bg-amber-100 text-amber-700 border-amber-200',
    'LOW': 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const AgentTickets = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Determine active tab based on route
    const getInitialTab = () => {
        if (location.pathname.includes('resolved')) return 'resolved';
        return 'pool';
    };

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState(getInitialTab());
    const [filters, setFilters] = useState({ issue_type: '', priority: '' });
    const [showFilters, setShowFilters] = useState(false);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    // Sync tab with route changes
    useEffect(() => {
        setActiveTab(getInitialTab());
    }, [location.pathname]);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await api.get('/agent/tickets');
            setTickets(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch agent tickets:', err);
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
            alert(err.response?.data?.message || `Failed to perform ${action}`);
        } finally {
            setActionLoading(null);
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesTab = false;
        if (activeTab === 'pool') {
            matchesTab = t.can_accept;
        } else if (activeTab === 'active') {
            matchesTab = t.assigned_to === user.id && t.status === 'IN_PROGRESS';
        } else if (activeTab === 'resolved') {
            matchesTab = t.assigned_to === user.id && (t.status === 'RESOLVED' || t.status === 'CLOSED');
        }

        const matchesIssueType = !filters.issue_type || t.issue_type === filters.issue_type;
        const matchesPriority = !filters.priority || t.priority === filters.priority;

        return matchesSearch && matchesTab && matchesIssueType && matchesPriority;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-amber-600 animate-spin" />
            </div>
        );
    }

    const issueTypes = [...new Set(tickets.map(t => t.issue_type).filter(Boolean))];

    return (
        <div className="p-4 sm:p-8 lg:p-12 space-y-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-4 rounded-[24px] bg-white shadow-sm border border-amber-100 text-amber-600">
                        <Inbox className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-gray-900">Task Command</h2>
                        <p className="text-sm text-gray-500 font-bold uppercase tracking-widest px-1">Optimize your resolution workflow</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-amber-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-[20px] text-sm focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all w-72 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-3 rounded-[18px] border transition-all ${showFilters ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-inner' : 'bg-white border-gray-100 text-gray-600 hover:bg-gray-50 shadow-sm'}`}
                    >
                        <Filter className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-[24px] w-fit shadow-inner overflow-x-auto no-scrollbar">
                    {[
                        { id: 'pool', label: 'Available Pool', icon: Layers },
                        { id: 'active', label: 'My Active', icon: Clock },
                        { id: 'resolved', label: 'Resolved History', icon: CheckCircle2 }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-[20px] text-xs font-black transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white text-amber-600 shadow-sm scale-110 z-10'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {showFilters && (
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-wrap gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Issue Type</label>
                        <select
                            value={filters.issue_type}
                            onChange={(e) => setFilters({ ...filters, issue_type: e.target.value })}
                            className="block w-48 bg-gray-50 border-transparent rounded-[16px] text-[10px] font-black uppercase px-4 py-3 cursor-pointer focus:ring-4 focus:ring-amber-500/10 transition-all"
                        >
                            <option value="">All Types</option>
                            {issueTypes.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-1">Priority</label>
                        <select
                            value={filters.priority}
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                            className="block w-48 bg-gray-50 border-transparent rounded-[16px] text-[10px] font-black uppercase px-4 py-3 cursor-pointer focus:ring-4 focus:ring-amber-500/10 transition-all"
                        >
                            <option value="">All Priorities</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>

                    <div className="flex items-end pb-1">
                        <button
                            onClick={() => setFilters({ issue_type: '', priority: '' })}
                            className="text-[10px] font-black text-amber-600 hover:text-amber-700 px-4 py-2 bg-amber-50 rounded-xl transition-colors uppercase tracking-widest"
                        >
                            Reset All
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Incident</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status Info</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-center">Priority</th>
                                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-right whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <AlertCircle className="w-16 h-16 text-gray-400" />
                                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No tickets found in this queue</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTickets.map((t) => (
                                <tr key={t.id} className="hover:bg-amber-50/20 transition-all group">
                                    <td className="px-8 py-7">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-[17px] font-black text-gray-900 group-hover:text-amber-700 transition-colors leading-tight">
                                                {t.title}
                                            </span>
                                            <span className="text-[11px] font-black text-gray-400 font-mono tracking-tighter uppercase">
                                                #{t.ticket_number || t.id} · {t.issue_type}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border-2 shadow-sm ${statusColors[t.status] || 'bg-gray-100 border-gray-200'}`}>
                                                {t.status}
                                            </span>
                                            {t.accepted_at && (
                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                                    Accepted {new Date(t.accepted_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-7">
                                        <div className="flex justify-center">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border-2 shadow-sm ${priorityColors[t.priority] || 'bg-gray-100 border-gray-200 text-gray-500'}`}>
                                                {t.priority}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-7 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {t.can_accept && (
                                                <button
                                                    onClick={() => handleAction(t.id, 'ACCEPT')}
                                                    disabled={actionLoading === `${t.id}-ACCEPT`}
                                                    className="inline-flex items-center gap-2 text-[10px] font-black text-white bg-amber-600 hover:bg-amber-700 px-4 py-2.5 rounded-[12px] transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-amber-600/20 disabled:opacity-50"
                                                >
                                                    {actionLoading === `${t.id}-ACCEPT` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                                                    Accept
                                                </button>
                                            )}
                                            {t.can_resolve && (
                                                <button
                                                    onClick={() => handleAction(t.id, 'RESOLVE')}
                                                    disabled={actionLoading === `${t.id}-RESOLVE`}
                                                    className="inline-flex items-center gap-2 text-[10px] font-black text-white bg-green-600 hover:bg-green-700 px-4 py-2.5 rounded-[12px] transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-green-600/20 disabled:opacity-50"
                                                >
                                                    {actionLoading === `${t.id}-RESOLVE` ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                                    Resolve
                                                </button>
                                            )}
                                            <button
                                                onClick={() => navigate(`/agent/tickets/${t.id}`)}
                                                className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-600 rounded-xl transition-all"
                                                title="View Details"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AgentTickets;
