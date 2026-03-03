import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
    Search,
    ChevronLeft,
    Loader2,
    Ticket,
    User,
    Clock,
    AlertCircle,
    CheckCircle2,
    Filter
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
    'MEDIUM': 'bg-amber-100 text-amber-700',
    'LOW': 'bg-emerald-100 text-emerald-700',
};

const AdminFilteredTickets = () => {
    const { type, id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('active'); // 'active' or 'resolved'
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchGroupTickets = async () => {
            try {
                setLoading(true);
                // Fetch all tickets for the department
                // Assuming backend can filter by department_id
                const res = await api.get(`/tickets?department_id=${id}`);
                setTickets(res.data.data || []);
            } catch (err) {
                console.error('Failed to fetch filtered tickets:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroupTickets();
    }, [id]);

    const filteredByTab = tickets.filter(t => {
        const isResolved = ['RESOLVED', 'CLOSED'].includes(t.status);
        if (activeTab === 'active') return !isResolved;
        return isResolved;
    });

    const finalTickets = filteredByTab.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.created_by_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                            {state?.name || 'Department'} Tickets
                        </h2>
                        <p className="text-sm text-gray-500 font-medium">Viewing all activity for this group</p>
                    </div>
                </div>

                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search in group..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-11 pr-6 py-2.5 bg-white border border-gray-100 rounded-[20px] text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all w-64 shadow-sm"
                    />
                </div>
            </div>

            {/* Tabs */}
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

            {/* Table */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ticket</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Requester</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                                <th className="px-8 py-5 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {finalTickets.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <AlertCircle className="w-12 h-12 text-gray-300" />
                                            <p className="text-lg font-bold text-gray-400">No {activeTab} tickets found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : finalTickets.map((t) => (
                                <tr key={t.id} className={`hover:bg-purple-50/30 transition-colors group ${t.priority === 'HIGH' ? 'bg-red-50/30' : ''}`}>
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-gray-900 group-hover:text-purple-700 transition-colors">
                                                {t.title}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400 font-mono uppercase tracking-tighter">
                                                #{t.ticket_number || t.id}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black text-gray-500">
                                                {t.created_by_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">{t.created_by_name || 'System'}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[t.status] || 'bg-gray-100'}`}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${priorityColors[t.priority] || 'bg-gray-100'}`}>
                                            {t.priority}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <button
                                            onClick={() => navigate(`/admin/tickets/${t.id}`)}
                                            className="px-6 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black text-purple-600 hover:bg-purple-600 hover:text-white hover:border-purple-600 transition-all shadow-sm active:scale-95"
                                        >
                                            View
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

export default AdminFilteredTickets;
