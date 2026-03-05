import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Search,
    Filter,
    Calendar,
    ChevronRight,
    AlertCircle,
    Loader2,
    Plus,
    ArrowLeft,
    Tag,
    Clock,
    CheckCircle2,
    Activity,
    MoreHorizontal,
    ArrowUpDown
} from 'lucide-react';
import api from '../../utils/api';

const MyTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tickets');
            setTickets(response.data.data);
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'OPEN': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'APPROVED': return 'text-purple-600 bg-purple-50 border-purple-100';
            case 'IN_PROGRESS': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'RESOLVED':
            case 'CLOSED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-gray-500 bg-gray-50 border-gray-100';
        }
    };

    const getPriorityStyles = (priority) => {
        switch (priority?.toUpperCase()) {
            case 'HIGH': return 'text-red-600';
            case 'MEDIUM': return 'text-amber-600';
            case 'LOW': return 'text-emerald-600';
            default: return 'text-gray-600';
        }
    };

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toString().includes(searchTerm);
        const matchesFilter = filterStatus === 'ALL' || t.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:p-12 space-y-10">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-4">
                            <button onClick={() => navigate('/employee/dashboard')} className="p-3 bg-white shadow-sm hover:bg-gray-50 rounded-2xl border border-gray-100 transition-all">
                                <ArrowLeft className="w-6 h-6 text-indigo-600" />
                            </button>
                            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">My Support History</h2>
                        </div>
                        <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs px-16">
                            Manage and track all your service requests
                        </p>
                    </div>

                    <div className="flex items-center gap-4 px-1">
                        <Link
                            to="/employee/create-ticket"
                            className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 group"
                        >
                            <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
                            <span>New Request</span>
                        </Link>
                    </div>
                </div>

                {/* Filters & Search Bar */}
                <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-xl shadow-gray-200/20 flex flex-col lg:flex-row items-center gap-6">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-300" />
                        <input
                            type="text"
                            placeholder="Search by ID, keyword, or title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-gray-50/50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-lg"
                        />
                    </div>

                    <div className="flex items-center gap-4 w-full lg:w-auto">
                        <div className="bg-gray-50 p-2 rounded-[24px] flex items-center gap-2 border border-gray-100 w-full lg:w-auto overflow-x-auto no-scrollbar">
                            {['ALL', 'OPEN', 'APPROVED', 'IN_PROGRESS', 'RESOLVED'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilterStatus(status)}
                                    className={`px-6 py-3 rounded-[18px] text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${filterStatus === status
                                        ? 'bg-white text-indigo-600 shadow-md'
                                        : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {status.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                        <button className="p-5 bg-gray-50 border border-gray-100 rounded-[24px] hover:bg-gray-100 text-gray-500 shadow-sm transition-all hidden lg:block">
                            <Filter className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Tickets Table (Web Optimized) */}
                <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">
                                        <div className="flex items-center gap-2">Request Information <ArrowUpDown className="w-3 h-3" /></div>
                                    </th>
                                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">Reporting Date</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50">Department</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center">Priority</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50 text-center">Status</th>
                                    <th className="px-10 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] border-b border-gray-50"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="relative">
                                                    <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" />
                                                    <Activity className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-400" />
                                                </div>
                                                <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Refreshing secure data stream...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredTickets.length > 0 ? (
                                    filteredTickets.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            onClick={() => navigate(`/employee/ticket/${ticket.id}`)}
                                            className="group hover:bg-gray-50/80 cursor-pointer transition-all active:scale-[0.998]"
                                        >
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 font-extrabold text-sm group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors border border-gray-100 group-hover:border-indigo-100">
                                                        #{ticket.id}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <p className="font-black text-gray-900 text-xl group-hover:text-indigo-600 transition-colors tracking-tight line-clamp-1">{ticket.title}</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">{ticket.issue_type || 'Platform Issue'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3 text-gray-500">
                                                    <Calendar className="w-5 h-5 opacity-40" />
                                                    <p className="font-bold text-lg tracking-tight">
                                                        {new Date(ticket.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex items-center gap-3 text-gray-500">
                                                    <Tag className="w-5 h-5 opacity-40 text-indigo-400" />
                                                    <p className="font-bold text-lg tracking-tight text-gray-600">{ticket.department_name || 'General support'}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex justify-center">
                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${getPriorityStyles(ticket.priority)}`}>
                                                        {ticket.priority}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="flex justify-center">
                                                    <div className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border-2 shadow-sm ${getStatusStyles(ticket.status)}`}>
                                                        {ticket.status}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right">
                                                <div className="bg-gray-100 p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 inline-flex shadow-sm">
                                                    <ChevronRight className="w-5 h-5 text-indigo-600" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-6 opacity-40">
                                                <div className="w-24 h-24 bg-gray-50 rounded-[40px] flex items-center justify-center border border-gray-100">
                                                    <Search className="w-10 h-10 text-gray-300" />
                                                </div>
                                                <div className="space-y-2">
                                                    <p className="text-gray-400 font-black uppercase tracking-widest text-lg italic">No results found</p>
                                                    <p className="text-gray-300 font-medium text-sm">Try adjusting your filters or search term to locate the record.</p>
                                                </div>
                                                <button
                                                    onClick={() => { setSearchTerm(''); setFilterStatus('ALL'); }}
                                                    className="mt-4 px-8 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 rounded-full font-black text-xs uppercase tracking-widest border border-gray-100 transition-all"
                                                >
                                                    Reset All Filters
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modern Table Footer/Legend */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 pt-6">
                    <div className="flex items-center gap-10">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Open Requests</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">In Active Analysis</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Resolved & Validated</span>
                        </div>
                    </div>
                    <p className="text-gray-300 font-bold text-[10px] uppercase tracking-[0.3em]">
                        ResolveIQ Secure Archive Management
                    </p>
                </div>
            </div>
        </div>
    );
};

export default MyTickets;
