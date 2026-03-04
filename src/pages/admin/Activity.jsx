import React, { useState, useEffect, useCallback } from 'react';
import {
    History, Search, Filter, ArrowDownToLine, Clock, User,
    MoreHorizontal, ChevronLeft, ChevronRight, CheckCircle2,
    AlertCircle, Trash2, Edit, Plus, RefreshCcw, LogIn, Key
} from 'lucide-react';
import api from '../../utils/api';

const ACTION_ICONS = {
    'CREATE': { icon: Plus, color: 'text-green-600', bg: 'bg-green-50' },
    'TICKET_CREATED': { icon: Plus, color: 'text-green-600', bg: 'bg-green-50' },
    'USER_CREATED': { icon: Plus, color: 'text-green-600', bg: 'bg-green-50' },
    'UPDATE': { icon: Edit, color: 'text-amber-600', bg: 'bg-amber-50' },
    'STATUS_UPDATED': { icon: Edit, color: 'text-amber-600', bg: 'bg-amber-50' },
    'PROFILE_UPDATED': { icon: Edit, color: 'text-amber-600', bg: 'bg-amber-50' },
    'DELETE': { icon: Trash2, color: 'text-red-500', bg: 'bg-red-50' },
    'TICKET_DELETED': { icon: Trash2, color: 'text-red-500', bg: 'bg-red-50' },
    'USER_LOGIN': { icon: LogIn, color: 'text-blue-600', bg: 'bg-blue-50' },
    'PASSWORD_CHANGED': { icon: Key, color: 'text-purple-600', bg: 'bg-purple-50' },
    'TICKET_ASSIGNED': { icon: User, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

const ActivityCard = ({ log }) => {
    const config = ACTION_ICONS[log.action_type] || { icon: History, color: 'text-gray-500', bg: 'bg-gray-50' };
    const Icon = config.icon;

    return (
        <div className="group bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all animate-slide-up">
            <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${config.bg} ${config.color}`}>
                    <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-4 mb-1">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                {log.entity_type} {log.entity_id ? `#${log.entity_id}` : ''}
                            </span>
                            <span className="w-1 h-1 bg-gray-200 rounded-full" />
                            <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>
                                {log.action_type.replace('_', ' ')}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-400 whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-bold">
                                {new Date(log.created_at).toLocaleString()}
                            </span>
                        </div>
                    </div>

                    <p className="text-sm font-bold text-gray-900 mb-3 leading-relaxed">
                        {log.description}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                <User className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-black text-gray-900 leading-none mb-0.5">
                                    {log.user}
                                </span>
                                <span className="text-[9px] font-black uppercase text-purple-600 leading-none">
                                    {log.role}
                                </span>
                            </div>
                        </div>

                        <button className="p-1.5 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ActivityPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
    const [filters, setFilters] = useState({
        action_type: '',
        entity_type: '',
        date_from: '',
        date_to: ''
    });

    const fetchLogs = useCallback(async (page = 1, isAuto = false) => {
        if (!isAuto) setRefreshing(true);
        try {
            const params = {
                page,
                limit: 15,
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
            };
            const response = await api.get('/admin/system-activity', { params });
            if (response.data.success) {
                setLogs(response.data.logs);
                setPagination({
                    page: response.data.page,
                    total: response.data.total,
                    pages: response.data.pages
                });
            }
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchLogs(1);
        const interval = setInterval(() => fetchLogs(pagination.page, true), 30000);
        return () => clearInterval(interval);
    }, [fetchLogs, pagination.page]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    const handleExport = () => {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Time,User,Role,Action,Entity,Description\n";
        logs.forEach(log => {
            csvContent += `"${new Date(log.created_at).toLocaleString()}","${log.user}","${log.role}","${log.action_type}","${log.entity_type}","${log.description.replace(/"/g, '""')}"\n`;
        });
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `resolveiq_activity_log_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading && logs.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="w-10 h-10 border-4 border-purple-100 border-t-purple-600 rounded-full animate-spin" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Scanning Audit Trail...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 space-y-8 max-w-[1400px] mx-auto pb-24">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">System Activity</h2>
                    <p className="text-sm text-gray-500 font-medium">Monitoring all system events and security actions in real-time.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end mr-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Live Polling (30s)</span>
                        <span className="text-[11px] font-bold text-gray-500">Total Events: {pagination.total}</span>
                    </div>
                    <button
                        onClick={() => fetchLogs(pagination.page)}
                        className={`p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-600 hover:text-purple-600 hover:border-purple-200 transition-all ${refreshing ? 'animate-spin' : 'active:scale-95'}`}
                    >
                        <RefreshCcw className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 text-gray-900 rounded-2xl text-sm font-black transition-all shadow-sm hover:bg-black hover:text-white uppercase tracking-widest active:scale-95"
                    >
                        <ArrowDownToLine className="w-5 h-5" />
                        Export Log
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-white rounded-[32px] border border-gray-100 shadow-sm">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Action Type</label>
                    <div className="relative">
                        <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            name="action_type"
                            value={filters.action_type}
                            onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-purple-600/20 transition-all appearance-none"
                        >
                            <option value="">All Actions</option>
                            <option value="CREATE">Creation</option>
                            <option value="UPDATE">Updates</option>
                            <option value="DELETE">Deletions</option>
                            <option value="TICKET_CREATED">Ticket Creation</option>
                            <option value="STATUS_UPDATED">Status Changes</option>
                            <option value="USER_LOGIN">User Logins</option>
                            <option value="PASSWORD_CHANGED">Password Changes</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Entity Type</label>
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <select
                            name="entity_type"
                            value={filters.entity_type}
                            onChange={handleFilterChange}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-purple-600/20 transition-all appearance-none"
                        >
                            <option value="">All Entities</option>
                            <option value="USER">User Accounts</option>
                            <option value="TEAM">Teams</option>
                            <option value="TICKET">Tickets</option>
                            <option value="DEPARTMENT">Departments</option>
                        </select>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">From Date</label>
                    <input
                        type="date"
                        name="date_from"
                        value={filters.date_from}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-purple-600/20 transition-all"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To Date</label>
                    <input
                        type="date"
                        name="date_to"
                        value={filters.date_to}
                        onChange={handleFilterChange}
                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-purple-600/20 transition-all"
                    />
                </div>
            </div>

            {/* Activity Feed */}
            <div className="space-y-4">
                {logs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {logs.map(log => (
                            <ActivityCard key={log.id} log={log} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-[40px] border border-gray-100 p-20 text-center space-y-4 shadow-sm">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <History className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">No activity found</h3>
                        <p className="text-gray-500 max-w-md mx-auto font-medium text-sm">Adjust your filters or check back later for new system events.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-4 py-8">
                    <button
                        onClick={() => fetchLogs(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="px-6 py-3 bg-white border border-gray-100 rounded-2xl text-xs font-black text-gray-900 uppercase tracking-widest shadow-sm">
                        Page {pagination.page} <span className="text-gray-300 mx-2">/</span> {pagination.pages}
                    </div>
                    <button
                        onClick={() => fetchLogs(pagination.page + 1)}
                        disabled={pagination.page >= pagination.pages}
                        className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-600 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActivityPage;
