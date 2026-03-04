import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    ClipboardList, Users, CheckCircle, Clock,
    ArrowRight, Loader2, AlertCircle, ChevronRight,
    Plus, Ticket, LayoutDashboard, UserCheck, Layers
} from 'lucide-react';
import api from '../../utils/api';

const statusColor = (s) => {
    switch (s) {
        case 'OPEN': return 'text-blue-600 bg-blue-50 border-blue-100';
        case 'APPROVED': case 'IN_PROGRESS': return 'text-orange-600 bg-orange-50 border-orange-100';
        case 'RESOLVED': case 'CLOSED': return 'text-green-600 bg-green-50 border-green-100';
        default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
};

const StatCard = ({ label, value, icon: Icon, colorClass, gradient }) => (
    <div className="relative overflow-hidden bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl transition-all group lg:p-8">
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

const TeamLeadDashboard = () => {
    const [tickets, setTickets] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tkRes, tmRes] = await Promise.all([
                    api.get('/tickets'),
                    api.get('/team-lead/team-members'),
                ]);
                setTickets(tkRes.data.data || []);
                setTeamMembers(tmRes.data.data || []);
            } catch (err) {
                console.error('Team Lead dashboard fetch failed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
            </div>
        );
    }

    const totalAgents = teamMembers.length;
    const totalResolved = teamMembers.reduce((sum, a) => sum + (a.resolved_today || 0), 0);
    const totalActive = teamMembers.reduce((sum, a) => sum + (a.active_tickets || 0), 0);
    const pendingTickets = tickets.filter(t => t.status === 'OPEN').length;
    const unallocatedTickets = tickets.filter(t => t.status === 'APPROVED' && !t.assigned_to).length;
    const pendingTableTickets = tickets.filter(t => t.status === 'OPEN');

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <div className="max-w-[1400px] mx-auto p-4 sm:p-8 lg:p-12 space-y-10">

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-10 bg-teal-600 rounded-full" />
                            <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">
                                Hello, {user.full_name?.split(' ')[0]}!
                            </h2>
                        </div>
                        <p className="text-gray-400 font-bold text-lg px-4 uppercase tracking-[0.2em] text-xs">
                            Team Lead Command Center
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/team-lead/assign')}
                            className="inline-flex items-center gap-3 px-8 py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-[24px] font-black shadow-2xl shadow-teal-500/20 transition-all active:scale-95 group"
                        >
                            <UserCheck className="w-6 h-6 transition-transform group-hover:scale-110" />
                            <span>Assign Tickets</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        label="Pending Approval"
                        value={pendingTickets}
                        icon={ClipboardList}
                        colorClass="bg-blue-600 text-white"
                        gradient="bg-blue-600"
                    />
                    <StatCard
                        label="Unallocated Pool"
                        value={unallocatedTickets}
                        icon={Layers}
                        colorClass="bg-purple-600 text-white"
                        gradient="bg-purple-600"
                    />
                    <StatCard
                        label="Active Agents"
                        value={totalAgents}
                        icon={Users}
                        colorClass="bg-teal-600 text-white"
                        gradient="bg-teal-600"
                    />
                    <StatCard
                        label="Team Workload"
                        value={totalActive}
                        icon={Clock}
                        colorClass="bg-amber-500 text-white"
                        gradient="bg-amber-500"
                    />
                    <StatCard
                        label="Resolved Today"
                        value={totalResolved}
                        icon={CheckCircle}
                        colorClass="bg-emerald-500 text-white"
                        gradient="bg-emerald-500"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Recent Tickets Table */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Pending Approval</h3>
                                    <span className="bg-teal-50 text-teal-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                        Action Required
                                    </span>
                                </div>
                                <button onClick={() => navigate('/team-lead/tickets')}
                                    className="text-sm font-black text-teal-600 flex items-center gap-2 hover:translate-x-1 transition-transform">
                                    Browse All <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50/50">
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket Details</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Employee</th>
                                            <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {pendingTableTickets.length > 0 ? (
                                            pendingTableTickets.slice(0, 5).map((t) => (
                                                <tr key={t.id} onClick={() => navigate(`/team-lead/tickets/${t.id}`)} className="group hover:bg-gray-50/80 cursor-pointer transition-colors">
                                                    <td className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xs group-hover:bg-teal-50 group-hover:text-teal-600 transition-colors">
                                                                #{t.ticket_number || t.id}
                                                            </div>
                                                            <div>
                                                                <p className="font-black text-gray-900 text-lg group-hover:text-teal-600 transition-colors tracking-tight">{t.title}</p>
                                                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mt-0.5">{t.issue_type || 'General Support'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-gray-500 font-bold text-sm">
                                                        {t.created_by_name || 'System User'}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex justify-center">
                                                            <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase tracking-widest border-2 ${statusColor(t.status)}`}>
                                                                {t.status}
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="3" className="px-8 py-20 text-center">
                                                    <div className="flex flex-col items-center gap-4 opacity-30">
                                                        <Ticket className="w-16 h-16 text-gray-400" />
                                                        <p className="text-gray-400 font-black uppercase tracking-widest text-sm">All caught up!</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Team Overview Card */}
                    <div className="space-y-8">
                        <div className="bg-gradient-to-br from-teal-700 to-teal-900 p-8 rounded-[48px] text-white shadow-2xl shadow-teal-500/30">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="font-black text-2xl tracking-tight text-white/90">My Team</h3>
                                <button onClick={() => navigate('/team-lead/team')} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {teamMembers.slice(0, 5).map((a) => (
                                    <div key={a.id} className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-[24px] border border-white/5 transition-all group">
                                        <div className="w-12 h-12 rounded-2xl bg-teal-500/30 flex items-center justify-center font-black text-lg border border-teal-400/20">
                                            {a.full_name?.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm truncate">{a.full_name}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                                <p className="text-teal-200 text-[10px] font-black uppercase tracking-widest">{a.active_tickets} Load</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {teamMembers.length === 0 && (
                                    <p className="text-teal-300 text-xs font-bold text-center py-4">No agents assigned yet</p>
                                )}
                            </div>

                            <button
                                onClick={() => navigate('/team-lead/team')}
                                className="w-full mt-8 py-4 bg-white text-teal-900 rounded-[20px] font-black text-xs uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl shadow-teal-900/40"
                            >
                                Management Portal
                            </button>
                        </div>

                        {/* Quick Tips */}
                        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full -mr-12 -mt-12" />
                            <h4 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-3 relative z-10">
                                <LayoutDashboard className="w-5 h-5 text-teal-600" />
                                Efficiency Tip
                            </h4>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed relative z-10">
                                High priority tickets should be assigned to senior agents for immediate resolution.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default TeamLeadDashboard;
