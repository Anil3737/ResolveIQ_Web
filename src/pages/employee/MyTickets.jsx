import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Filter,
    Calendar,
    ChevronRight,
    AlertCircle,
    Loader2
} from 'lucide-react';
import api from '../../utils/api';

const MyTickets = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredTickets = tickets.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id.toString().includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <div className="bg-white px-4 py-4 sticky top-0 z-10 shadow-sm">
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID or Title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <button className="p-2 bg-gray-50 border border-gray-100 rounded-xl hover:bg-gray-100">
                        <Filter className="w-5 h-5 text-gray-500" />
                    </button>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-4 sm:p-6">
                <div className="space-y-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        </div>
                    ) : filteredTickets.length > 0 ? (
                        filteredTickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => navigate(`/employee/ticket/${ticket.id}`)}
                                className="card-premium p-0 overflow-hidden hover:border-primary transition-all cursor-pointer group flex flex-col sm:flex-row"
                            >
                                <div className="p-5 flex-1 flex flex-col gap-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-blue-50 rounded italic">#{ticket.id}</span>
                                        <div className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                            {ticket.status}
                                        </div>
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors">{ticket.title}</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-medium">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
                                        <span className="text-[10px] text-gray-400 font-medium uppercase">{ticket.priority} Priority</span>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:w-12 sm:p-0 flex items-center justify-center border-t sm:border-t-0 sm:border-l border-gray-100">
                                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors sm:group-hover:translate-x-1" />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="card-premium border-dashed border-2 py-20 flex flex-col items-center gap-3">
                            <AlertCircle className="w-12 h-12 text-gray-200" />
                            <p className="text-gray-400 font-medium italic">No tickets found matches your search.</p>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="text-xs font-bold text-primary hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default MyTickets;
