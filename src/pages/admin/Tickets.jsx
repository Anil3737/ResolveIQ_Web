import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Search,
    Filter,
    ChevronRight,
    Loader2,
    AlertCircle,
    CheckCircle2,
    User,
    Layers,
    ShieldAlert,
    Clock,
    AlertTriangle,
    Ticket
} from 'lucide-react';
import api from '../../utils/api';

const statusColors = {
    'OPEN': 'bg-blue-100 text-blue-700',
    'APPROVED': 'bg-purple-100 text-purple-700',
    'IN_PROGRESS': 'bg-orange-100 text-orange-700',
    'RESOLVED': 'bg-green-100 text-green-700',
    'CLOSED': 'bg-gray-100 text-gray-700',
};

const priorityColors = {
    'HIGH': 'bg-red-100 text-red-700',
    'P1': 'bg-red-100 text-red-700',
    'MEDIUM': 'bg-amber-100 text-amber-700',
    'P2': 'bg-amber-100 text-amber-700',
    'LOW': 'bg-emerald-100 text-emerald-700',
    'P3': 'bg-emerald-100 text-emerald-700',
    'P4': 'bg-emerald-100 text-emerald-700',
};

const Tickets = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        department: '',
    });
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'resolved'
    const [showFilters, setShowFilters] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Get filter from URL query params
    const queryParams = new URLSearchParams(location.search);
    const variant = queryParams.get('filter') || 'all';

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const res = await api.get('/tickets');
                let allTickets = res.data.data || [];

                // Apply variant filters if any
                if (variant === 'high_risk') {
                    allTickets = allTickets.filter(t => t.ai_score && t.ai_score >= 70);
                } else if (variant === 'sla') {
                    allTickets = allTickets.filter(t => t.sla_breached || t.status === 'OVERDUE');
                } else if (variant === 'escalated') {
                    allTickets = allTickets.filter(t => t.escalation_required || t.status === 'ESCALATED');
                }

                setTickets(allTickets);
            } catch (err) {
                console.error('Failed to fetch tickets:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [variant]);

    const filteredTickets = tickets.filter(t => {
        const matchesSearch =
            t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const isResolved = ['RESOLVED', 'CLOSED'].includes(t.status);
        const matchesTab = activeTab === 'active' ? !isResolved : isResolved;

        const matchesStatus = !filters.status || t.status === filters.status;
        const matchesPriority = !filters.priority || t.priority === filters.priority;
        const matchesDept = !filters.department || t.department_name === filters.department;

        return matchesSearch && matchesTab && matchesStatus && matchesPriority && matchesDept;
    });

    const getHeaderInfo = () => {
        switch (variant) {
            case 'high_risk': return { title: 'High Risk Tickets', icon: ShieldAlert, color: 'text-red-600', desc: 'Critical issues requiring immediate attention.' };
            case 'sla': return { title: 'SLA Breached', icon: Clock, color: 'text-orange-600', desc: 'Tickets that have exceeded their service level agreement.' };
            case 'escalated': return { title: 'Escalated Tickets', icon: AlertTriangle, color: 'text-yellow-600', desc: 'Issues that have been escalated to management.' };
            default: return { title: 'System Tickets', icon: Ticket, color: 'text-purple-600', desc: 'View and manage all tickets across ResolveIQ' };
        }
    };

    const header = getHeaderInfo();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl bg-white shadow-sm border border-gray-100 ${header.color}`}>
                        <header.icon className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-black tracking-tight ${header.color}`}>{header.title}</h2>
                        <p className="text-sm text-gray-500 font-medium">{header.desc}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search tickets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-xl border transition-all ${showFilters ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                    >
                        <Filter className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Active / Resolved Tabs */}
            <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-[24px] w-fit shadow-inner">
                {[
                    { id: 'active', label: 'Active', icon: Clock },
                    { id: 'resolved', label: 'Resolved', icon: CheckCircle2 }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-8 py-2.5 rounded-[20px] text-sm font-black transition-all ${activeTab === tab.id
                            ? 'bg-white text-purple-600 shadow-sm scale-110 z-10'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {showFilters && (
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="block w-40 bg-gray-50 border-none rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 px-3 py-2 cursor-pointer"
                        >
                            <option value="">All Statuses</option>
                            <option value="OPEN">Open</option>
                            <option value="APPROVED">Approved</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="RESOLVED">Resolved</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Priority</label>
                        <select
                            value={filters.priority}
                            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                            className="block w-40 bg-gray-50 border-none rounded-lg text-xs font-semibold focus:ring-2 focus:ring-purple-500/20 px-3 py-2 cursor-pointer"
                        >
                            <option value="">All Priorities</option>
                            <option value="HIGH">High</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="LOW">Low</option>
                        </select>
                    </div>

                    <div className="flex items-end pb-0.5">
                        <button
                            onClick={() => setFilters({ status: '', priority: '', department: '' })}
                            className="text-xs font-bold text-purple-600 hover:text-purple-700 px-2 py-1"
                        >
                            Reset Filters
                        </button>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Info</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTickets.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-2 grayscale opacity-50">
                                            <AlertCircle className="w-10 h-10 text-gray-300" />
                                            <p className="text-sm font-medium text-gray-400">No tickets found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredTickets.map((t) => (
                                <tr key={t.id} className={`hover:bg-purple-50/30 transition-colors group ${(['HIGH', 'P1'].includes(t.priority)) ? 'bg-red-50/50' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-900 group-hover:text-purple-700 transition-colors cursor-pointer" onClick={() => navigate(`/admin/tickets/${t.id}`)}>
                                                {t.title}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-tighter">
                                                #{t.ticket_number || t.id}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <User className="w-3 h-3" />
                                                <span className="font-semibold">{t.created_by_name || 'System'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase">
                                                <Layers className="w-3 h-3" />
                                                <span className="truncate max-w-[120px]">{t.department_name || 'Unassigned'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[t.status] || 'bg-gray-100'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${priorityColors[t.priority] || 'bg-gray-100'}`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/admin/tickets/${t.id}`)}
                                            className="inline-flex items-center gap-1 text-xs font-black text-purple-600 hover:text-purple-700 bg-white border border-gray-100 hover:border-purple-200 px-4 py-2 rounded-xl transition-all active:scale-95 shadow-sm"
                                        >
                                            Details
                                            <ChevronRight className="w-3 h-3" />
                                        </button>
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

export default Tickets;
