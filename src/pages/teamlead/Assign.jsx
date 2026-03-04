import React, { useState, useEffect } from 'react';
import {
    UserCheck, Users, Ticket, ArrowRight,
    Loader2, AlertCircle, CheckCircle2,
    Shield, Zap, Layers, ChevronRight
} from 'lucide-react';
import api from '../../utils/api';

const Assign = () => {
    const [unassignedTickets, setUnassignedTickets] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(null);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [tkRes, tmRes] = await Promise.all([
                    api.get('/tickets'),
                    api.get('/team-lead/team-members'),
                ]);
                // Show unassigned tickets that are either OPEN (Pending Approval) or APPROVED (Unallocated Pool)
                setUnassignedTickets(tkRes.data.data?.filter(t => (t.status === 'OPEN' || t.status === 'APPROVED') && !t.assigned_to) || []);
                setTeamMembers(tmRes.data.data || []);
            } catch (err) {
                console.error('Failed to fetch assignment data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleAssign = async (ticketId, agentId) => {
        setAssigning(ticketId);
        try {
            await api.post('/team-lead/assign-ticket', { ticket_id: ticketId, agent_id: agentId });
            setSuccess(`Ticket successfully assigned!`);
            setUnassignedTickets(unassignedTickets.filter(t => t.id !== ticketId));
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            alert(err.response?.data?.message || 'Assignment failed');
        } finally {
            setAssigning(null);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 lg:p-12 space-y-10 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-[28px] bg-white shadow-xl shadow-indigo-500/5 border border-indigo-50 text-indigo-600">
                            <UserCheck className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black tracking-tight text-gray-900 leading-none">Resource Allocation</h2>
                            <p className="text-sm text-gray-400 font-black uppercase tracking-[0.2em] mt-2">Optimize team throughput via smart assignment</p>
                        </div>
                    </div>
                </div>

                {success && (
                    <div className="bg-emerald-50 border border-emerald-100 px-6 py-3 rounded-[24px] flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-black text-emerald-700 uppercase tracking-widest">{success}</span>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                {/* Tickets Column */}
                <div className="xl:col-span-12 space-y-6">
                    <div className="bg-white rounded-[40px] shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                            <div className="flex items-center gap-4">
                                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Unallocated Queue</h3>
                                <span className="bg-white text-indigo-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
                                    {unassignedTickets.length} Pending
                                </span>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Incident</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Workload Rating</th>
                                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Assign Agent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {unassignedTickets.length > 0 ? (
                                        unassignedTickets.map((t) => (
                                            <tr key={t.id} className="group hover:bg-gray-50/80 transition-all duration-300">
                                                <td className="px-8 py-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 font-black text-sm group-hover:border-indigo-200 group-hover:text-indigo-600 transition-all shadow-sm">
                                                            #{t.ticket_number || t.id}
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-xl text-gray-900 group-hover:text-indigo-600 transition-colors tracking-tight">{t.title}</p>
                                                            <div className="flex items-center gap-3 mt-1.5">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                                    <Layers className="w-3 h-3" />
                                                                    {t.issue_type || 'General'}
                                                                </span>
                                                                <span className="w-1 h-1 rounded-full bg-gray-200" />
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                                                    Created by {t.created_by_name}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3].map(i => (
                                                                <div key={i} className={`w-3 h-1.5 rounded-full ${i <= (t.priority === 'HIGH' ? 3 : t.priority === 'MEDIUM' ? 2 : 1) ? 'bg-orange-400' : 'bg-gray-100'}`} />
                                                            ))}
                                                        </div>
                                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter mt-1">{t.priority || 'NORMAL'} Priority</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-8">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <select
                                                            disabled={assigning === t.id}
                                                            onChange={(e) => handleAssign(t.id, e.target.value)}
                                                            className="bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all disabled:opacity-50 min-w-[200px]"
                                                        >
                                                            <option value="">Select Agent...</option>
                                                            {teamMembers.map(a => (
                                                                <option key={a.id} value={a.id}>{a.full_name} ({a.active_tickets} active)</option>
                                                            ))}
                                                        </select>
                                                        {assigning === t.id && <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-24 text-center">
                                                <div className="flex flex-col items-center gap-6 opacity-30 grayscale">
                                                    <Zap className="w-16 h-16 text-indigo-400" />
                                                    <div className="space-y-1">
                                                        <p className="text-xl font-black text-gray-900 uppercase tracking-widest">Queue Clear</p>
                                                        <p className="text-sm font-bold text-gray-500">All team tickets have been successfully allocated.</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Assign;
