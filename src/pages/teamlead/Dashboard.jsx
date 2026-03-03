import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList, Users, CheckCircle, Clock,
    ArrowRight, Loader2, AlertCircle, ChevronRight
} from 'lucide-react';
import api from '../../utils/api';

const statusColor = (s) => {
    switch (s) {
        case 'OPEN': return 'text-blue-600 bg-blue-50';
        case 'APPROVED': case 'IN_PROGRESS': return 'text-orange-600 bg-orange-50';
        case 'RESOLVED': case 'CLOSED': return 'text-green-600 bg-green-50';
        default: return 'text-gray-600 bg-gray-50';
    }
};

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
                    api.get('/team-lead/my-tickets'),
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

    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-5xl mx-auto">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-teal-800 to-teal-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg shadow-teal-100">
                <div className="relative z-10">
                    <p className="text-teal-200 text-xs font-medium uppercase tracking-widest mb-1">Team Lead Portal</p>
                    <h2 className="text-2xl font-bold mb-1">Welcome, {user.full_name?.split(' ')[0]}!</h2>
                    <p className="text-teal-200 text-sm">Manage incoming tickets and keep your team on track.</p>
                </div>
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Pending Tickets', value: tickets.length, icon: ClipboardList, bg: 'bg-blue-50 text-blue-600' },
                    { label: 'Team Agents', value: totalAgents, icon: Users, bg: 'bg-teal-50 text-teal-600' },
                    { label: 'Tickets Resolved', value: totalResolved, icon: CheckCircle, bg: 'bg-green-50 text-green-600' },
                ].map(({ label, value, icon: Icon, bg }) => (
                    <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{value}</p>
                        <p className="text-xs text-gray-500 font-medium">{label}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pending Tickets */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">Pending Tickets</h3>
                        <button onClick={() => navigate('/team-lead/tickets')}
                            className="text-[11px] font-bold text-teal-600 flex items-center gap-1 hover:underline">
                            View All <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {tickets.length === 0 ? (
                            <div className="flex flex-col items-center py-8 gap-2">
                                <CheckCircle className="w-8 h-8 text-green-300" />
                                <p className="text-sm text-gray-400">No pending tickets</p>
                            </div>
                        ) : tickets.slice(0, 5).map((t) => (
                            <div key={t.id}
                                onClick={() => navigate('/team-lead/tickets')}
                                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-100 group transition-all">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900 group-hover:text-teal-700 truncate max-w-[180px]">{t.title}</p>
                                    <p className="text-[10px] text-gray-400">#{t.ticket_number || t.id}</p>
                                </div>
                                <div className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusColor(t.status)}`}>
                                    {t.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* My Team */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">My Team</h3>
                        <button onClick={() => navigate('/team-lead/team')}
                            className="text-[11px] font-bold text-teal-600 flex items-center gap-1 hover:underline">
                            View All <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="space-y-2">
                        {teamMembers.length === 0 ? (
                            <div className="flex flex-col items-center py-8 gap-2">
                                <AlertCircle className="w-8 h-8 text-gray-200" />
                                <p className="text-sm text-gray-400">No agents in your team yet</p>
                            </div>
                        ) : teamMembers.slice(0, 5).map((a) => (
                            <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all">
                                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-xs font-bold shrink-0">
                                    {a.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{a.full_name}</p>
                                    <p className="text-[10px] text-gray-400">{a.active_tickets} active · {a.resolved_today} resolved</p>
                                </div>
                                <div className={`w-2 h-2 rounded-full ${a.active_tickets > 0 ? 'bg-green-400' : 'bg-gray-200'}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamLeadDashboard;
