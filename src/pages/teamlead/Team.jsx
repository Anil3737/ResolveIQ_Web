import React, { useState, useEffect } from 'react';
import {
    Users, UserCheck, Shield, Zap,
    Loader2, AlertCircle, ArrowRight,
    TrendingUp, UserX, Mail, Phone,
    Calendar, Briefcase
} from 'lucide-react';
import api from '../../utils/api';

const Team = () => {
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const res = await api.get('/team-lead/team-members');
                setTeamMembers(res.data.data || []);
            } catch (err) {
                console.error('Failed to fetch team members:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeam();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-teal-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-8 lg:p-12 space-y-10 max-w-[1400px] mx-auto">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="space-y-2">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-[28px] bg-white shadow-xl shadow-teal-500/5 border border-teal-50 text-teal-600">
                            <Users className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-4xl font-black tracking-tight text-gray-900 leading-none">Team Command</h2>
                            <p className="text-sm text-gray-400 font-black uppercase tracking-[0.2em] mt-2">Manage your elite agent squadron</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-white px-6 py-3 rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Team Capacity</p>
                            <p className="text-lg font-black text-gray-900">{teamMembers.length} Agents</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Team Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                        <div key={member.id} className="group bg-white rounded-[48px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:border-teal-500/20 transition-all duration-500 relative overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -mr-16 -mt-16 group-hover:bg-teal-100/50 transition-colors" />

                            <div className="relative z-10 space-y-8">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 rounded-[32px] bg-gradient-to-br from-teal-500 to-teal-800 flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-teal-500/20 group-hover:scale-110 transition-transform duration-500">
                                            {member.full_name?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 group-hover:text-teal-700 transition-colors">{member.full_name}</h3>
                                            <span className="inline-flex items-center px-3 py-1 bg-teal-50 text-teal-600 text-[10px] font-black uppercase tracking-widest rounded-full mt-1 border border-teal-100">
                                                Active Agent
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Performance Metrics */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50/50 p-4 rounded-[28px] border border-gray-50">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Active Load</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black text-gray-900">{member.active_tickets}</span>
                                            <Briefcase className="w-4 h-4 text-orange-500" />
                                        </div>
                                    </div>
                                    <div className="bg-gray-50/50 p-4 rounded-[28px] border border-gray-50">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Resolved Today</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl font-black text-gray-900">{member.resolved_today}</span>
                                            <TrendingUp className="w-4 h-4 text-emerald-500" />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div className="space-y-3 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-900 transition-colors">
                                        <Mail className="w-4 h-4 text-teal-400" />
                                        <span className="text-sm font-bold truncate">{member.email || 'agent@resolveiq.com'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 group-hover:text-gray-900 transition-colors">
                                        <Phone className="w-4 h-4 text-teal-400" />
                                        <span className="text-sm font-bold">{member.phone || '+91 98765 43210'}</span>
                                    </div>
                                </div>

                                <button className="w-full py-5 bg-gray-50 hover:bg-teal-600 text-gray-400 hover:text-white rounded-[24px] font-black text-xs uppercase tracking-[0.2em] transition-all group-hover:shadow-xl group-hover:shadow-teal-600/20 active:scale-95">
                                    Performance Analytics
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full flex flex-col items-center justify-center py-32 opacity-30 grayscale gap-6">
                        <UserX className="w-24 h-24 text-gray-400" />
                        <div className="text-center">
                            <p className="text-2xl font-black text-gray-900 uppercase tracking-widest">Squadron Empty</p>
                            <p className="text-sm font-bold text-gray-500 mt-2">No active agents are currently under your command.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Team;
