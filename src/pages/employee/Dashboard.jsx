import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Plus,
    Grid,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Loader2,
    Calendar,
    Clock,
    User as UserIcon,
    Ticket,
    Activity,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import api from '../../utils/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ open: 0, pending: 0, resolved: 0, total: 0 });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tickets?limit=10');
            const allTickets = response.data.data;
            setTickets(allTickets);

            // Calculate stats
            const open = allTickets.filter(t => t.status === 'OPEN').length;
            const pending = allTickets.filter(t => ['APPROVED', 'IN_PROGRESS'].includes(t.status)).length;
            const resolved = allTickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length;
            setStats({ open, pending, resolved, total: allTickets.length });
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'OPEN': return 'text-blue-600 bg-blue-50 border-blue-100';
            case 'IN_PROGRESS':
            case 'APPROVED': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'RESOLVED':
            case 'CLOSED': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
            default: return 'text-gray-500 bg-gray-50 border-gray-100';
        }
    };

    const StatCard = ({ label, value, icon: Icon, colorClass, gradient }) => (
        <div className={`relative overflow-hidden bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group lg:p-8`}>
            <div className={`absolute top-0 right-0 w-32 h-32 ${gradient} opacity-5 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110`} />
            <div className="relative z-10 flex flex-col gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorClass} shadow-lg shadow-current/10`}>
                    <Icon className="w-6 h-6" />
                </div>
                <div>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mb-1">{label}</p>
                    <p className="text-4xl font-black text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Main Content Area */}
            <div className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:p-12 space-y-10">

                {/* Header & Welcome Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-10 bg-indigo-600 rounded-full" />
                            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">
                                Hello, {user.full_name?.split(' ')[0]}!
                            </h2>
                        </div>
                        <p className="text-gray-400 font-bold text-lg px-4 uppercase tracking-[0.2em] text-xs">
                            Your personal support headquarters
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/employee/create-ticket')}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[24px] font-black shadow-2xl shadow-indigo-500/20 transition-all active:scale-95 group"
                        >
                            <Plus className="w-6 h-6 transition-transform group-hover:rotate-90" />
                            <span>Create New Ticket</span>
                        </button>
                    </div>
                </div>

                {/* Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Stats Row - Spans 3 columns on LG */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:col-span-4">
                        <StatCard
                            label="Total Requests"
                            value={stats.total}
                            icon={Ticket}
                            colorClass="bg-indigo-600 text-white"
                            gradient="bg-indigo-600"
                        />
                        <StatCard
                            label="Open Issues"
                            value={stats.open}
                            icon={Activity}
                            colorClass="bg-blue-500 text-white"
                            gradient="bg-blue-500"
                        />
                        <StatCard
                            label="In Progress"
                            value={stats.pending}
                            icon={Clock}
                            colorClass="bg-amber-500 text-white"
                            gradient="bg-amber-500"
                        />
                        <StatCard
                            label="Resolved"
                            value={stats.resolved}
                            icon={CheckCircle}
                            colorClass="bg-emerald-500 text-white"
                            gradient="bg-emerald-500"
                        />
                    </div>

                    {/* Left Column: Recent Tickets Table (Spans 3 columns) */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Recent Tickets</h3>
                                    <span className="bg-indigo-50 text-indigo-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                        Latest Activity
                                    </span>
                                </div>
                                <Link to="/employee/my-tickets" className="text-sm font-black text-indigo-600 flex items-center gap-2 hover:translate-x-1 transition-transform">
                                    Browse All <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket Information</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Reported</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Current Status</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4">
                                                        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronizing with system...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : tickets.length > 0 ? (
                                            tickets.map((ticket) => (
                                                <tr key={ticket.id} onClick={() => navigate(`/employee/ticket/${ticket.id}`)} className="group hover:bg-gray-50/80 cursor-pointer transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xs group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                                #{ticket.id}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-gray-900 text-lg group-hover:text-indigo-600 transition-colors tracking-tight">{ticket.title}</p>
                                                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">{ticket.issue_type || 'General Support'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-gray-500 font-bold text-sm">
                                                        {new Date(ticket.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex justify-center">
                                                            <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border-2 ${getStatusStyles(ticket.status)}`}>
                                                                {ticket.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        <div className="bg-gray-100 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 inline-flex">
                                                            <ArrowRight className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                                        <Ticket className="w-16 h-16 text-gray-400" />
                                                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">No recent activity detected</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: User Overview & Quick Links */}
                    <div className="lg:col-span-1 space-y-8">
                        {/* User Profile Summary */}
                        <div className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-8 rounded-[48px] text-white shadow-2xl shadow-indigo-500/30">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-16 h-16 rounded-[24px] bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl border border-white/20">
                                    {user.full_name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-xl tracking-tight">{user.full_name}</p>
                                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest opacity-80">{user.role}</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Office Location</p>
                                    <p className="font-bold text-sm tracking-wide">Chennai Headquarters</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-indigo-300 text-[10px] font-black uppercase tracking-widest">Employee Identity</p>
                                    <p className="font-bold text-sm tracking-wide">{user.phone || 'RIQ-EMP-0000'}</p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/employee/settings')}
                                className="w-full mt-10 py-4 bg-white/10 hover:bg-white/20 rounded-[20px] border border-white/10 font-black text-xs uppercase tracking-widest transition-all"
                            >
                                Manage Profile
                            </button>
                        </div>

                        {/* Quick Tips or Announcements */}
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12" />
                            <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-3 relative z-10">
                                <Plus className="w-5 h-5 text-indigo-600" />
                                Support Tip
                            </h4>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed relative z-10">
                                Be sure to include screenshots when creating tickets for faster resolution by our technical team.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
