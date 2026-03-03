import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Plus,
    Grid,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    Loader2
} from 'lucide-react';
import api from '../../utils/api';

const Dashboard = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ open: 0, pending: 0, resolved: 0 });

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/tickets?limit=5');
            const allTickets = response.data.data;
            setTickets(allTickets);

            // Calculate stats (in a real app, the backend should provide this)
            const open = allTickets.filter(t => t.status === 'OPEN').length;
            const pending = allTickets.filter(t => ['APPROVED', 'IN_PROGRESS'].includes(t.status)).length;
            const resolved = allTickets.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length;
            setStats({ open, pending, resolved });
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
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

    return (
        <div className="min-h-screen bg-gray-50">
            <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-8">
                {/* Welcome Banner */}
                <div className="bg-primary rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg shadow-blue-200">
                    <div className="relative z-10">
                        <h2 className="text-2xl font-bold mb-1">Welcome, {user.full_name?.split(' ')[0]}!</h2>
                        <p className="text-blue-100 text-sm">How can we help you today?</p>
                    </div>
                    {/* Decorative circles */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                    <div className="absolute right-20 -bottom-10 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <Link to="/employee/create-ticket" className="card-premium flex flex-col items-center gap-3 hover:border-primary transition-all group active:scale-95">
                        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-900">Create Ticket</p>
                            <p className="text-[10px] text-gray-400">Report an issue</p>
                        </div>
                    </Link>
                    <Link to="/employee/my-tickets" className="card-premium flex flex-col items-center gap-3 hover:border-primary transition-all group active:scale-95">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-full flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform">
                            <Grid className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-900">My Tickets</p>
                            <p className="text-[10px] text-gray-400">View all requests</p>
                        </div>
                    </Link>
                </div>

                {/* Status Counts */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="card-premium p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                            <span className="text-[10px] font-bold text-blue-600">OPEN</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                    </div>
                    <div className="card-premium p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div>
                            <span className="text-[10px] font-bold text-orange-600 uppercase">Pending</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                    </div>
                    <div className="card-premium p-4 flex flex-col gap-2">
                        <div className="flex items-center gap-1.5">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span className="text-[10px] font-bold text-green-600 uppercase">Resolved</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                    </div>
                </div>

                {/* Recent Tickets */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-1">
                        <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">My Recent Tickets</h3>
                        <Link to="/employee/my-tickets" className="text-xs font-bold text-primary flex items-center gap-1 hover:underline">
                            View All <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-10">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <div
                                    key={ticket.id}
                                    onClick={() => navigate(`/employee/ticket/${ticket.id}`)}
                                    className="card-premium p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer active:scale-[0.99] transition-all"
                                >
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-bold text-gray-900">{ticket.title}</p>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] text-gray-400 font-medium">#{ticket.id}</span>
                                            <span className="text-[10px] text-gray-400">•</span>
                                            <span className="text-[10px] text-gray-400">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                        {ticket.status}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="card-premium border-dashed border-2 py-12 flex flex-col items-center gap-2">
                                <AlertCircle className="w-8 h-8 text-gray-300" />
                                <p className="text-sm text-gray-400">No tickets found</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

        </div>
    );
};

export default Dashboard;
