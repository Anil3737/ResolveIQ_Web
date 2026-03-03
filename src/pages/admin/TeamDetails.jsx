import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    UsersRound,
    UserPlus,
    UserMinus,
    Search,
    Loader2,
    Save,
    Trash2,
    CheckCircle2,
    Building2,
    Briefcase,
    ShieldCheck,
    Mail,
    Phone,
    Plus,
    X,
    Edit3,
    Users
} from 'lucide-react';
import api from '../../utils/api';

const TeamDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [leads, setLeads] = useState([]);
    const [allAgents, setAllAgents] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showAddMember, setShowAddMember] = useState(false);
    const [agentSearch, setAgentSearch] = useState('');

    // Edit State
    const [editMode, setEditMode] = useState(false);
    const [editedTeam, setEditedTeam] = useState({
        name: '',
        description: '',
        goal: '',
        issue_type: '',
        department_id: '',
        team_lead_id: ''
    });

    useEffect(() => {
        fetchTeamData();
    }, [id]);

    const fetchTeamData = async () => {
        try {
            setLoading(true);
            const [teamRes, membersRes, deptsRes, leadsRes, agentsRes] = await Promise.all([
                api.get(`/admin/teams/${id}`),
                api.get(`/admin/teams/${id}/members`),
                api.get('/admin/departments'),
                api.get('/admin/users?role=TEAM_LEAD'),
                api.get('/admin/users?role=AGENT')
            ]);

            const currentTeam = teamRes.data.data;
            if (!currentTeam) {
                navigate('/admin/teams');
                return;
            }

            setTeam(currentTeam);
            setMembers(membersRes.data.data || []);
            setDepartments(deptsRes.data.data || []);
            setLeads(leadsRes.data.data || []);
            setAllAgents(agentsRes.data.data || []);

            setEditedTeam({
                name: currentTeam.name,
                description: currentTeam.description,
                goal: currentTeam.goal || '',
                issue_type: currentTeam.issue_type || '',
                department_id: currentTeam.department_id || '',
                team_lead_id: currentTeam.team_lead_id || ''
            });

        } catch (err) {
            console.error('Failed to fetch team details:', err);
            navigate('/admin/teams');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTeam = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/admin/teams/${id}`, {
                ...editedTeam,
                agent_ids: members.map(m => m.id)
            });
            setEditMode(false);
            fetchTeamData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating team');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddMember = async (agent) => {
        if (members.find(m => m.id === agent.id)) return;

        const updatedMembers = [...members, agent];
        setMembers(updatedMembers);

        // Auto-save the member list change
        try {
            await api.put(`/admin/teams/${id}`, {
                ...editedTeam,
                agent_ids: updatedMembers.map(m => m.id)
            });
        } catch (err) {
            alert('Error updating team members');
            setMembers(members); // Rollback
        }
    };

    const handleRemoveMember = async (agentId) => {
        const updatedMembers = members.filter(m => m.id !== agentId);
        setMembers(updatedMembers);

        try {
            await api.put(`/admin/teams/${id}`, {
                ...editedTeam,
                agent_ids: updatedMembers.map(m => m.id)
            });
        } catch (err) {
            alert('Error removing member');
            setMembers(members); // Rollback
        }
    };

    const availableAgents = allAgents.filter(a =>
        !members.find(m => m.id === a.id) &&
        a.full_name.toLowerCase().includes(agentSearch.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-6xl mx-auto pb-20">
            {/* Header / Back */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => navigate('/admin/teams')}
                    className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-purple-600 transition-colors py-2"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Teams
                </button>
                <div className="flex gap-2">
                    {!editMode ? (
                        <button
                            onClick={() => setEditMode(true)}
                            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 rounded-2xl text-sm font-bold transition-all shadow-xl shadow-purple-100 active:scale-95"
                        >
                            <Edit3 className="w-4 h-4" />
                            Update Team
                        </button>
                    ) : (
                        <button
                            onClick={() => setEditMode(false)}
                            className="px-4 py-2 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Team Details Section */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[40px] p-8 sm:p-10 border border-gray-100 shadow-sm space-y-8 relative overflow-hidden">
                        {/* Status Decorative */}
                        <div className="absolute top-0 left-0 w-2 bg-purple-600 h-full" />

                        {!editMode ? (
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">{team.name}</h1>
                                        <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {team.issue_type || 'Network Issue'}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm font-medium leading-relaxed max-w-2xl">{team.description || 'No description available for this team.'}</p>
                                </div>

                                <div className="bg-gradient-to-br from-purple-50 to-white p-6 rounded-[32px] border border-purple-100/50 space-y-3 relative overflow-hidden shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 bg-purple-600 rounded-lg text-white">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-[10px] font-bold text-purple-600 uppercase tracking-widest">Team Primary Goal</span>
                                    </div>
                                    <p className="text-lg font-bold text-gray-900 leading-relaxed">
                                        {team.goal || 'To achieve excellence in every ticket and provide world-class support.'}
                                    </p>
                                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-600/5 rounded-full blur-2xl" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Building2 className="w-3 h-3" /> Dept
                                        </span>
                                        <p className="text-base font-bold text-gray-900">{team.department_name}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Briefcase className="w-3 h-3" /> Team Lead
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-black text-purple-600">
                                                {team.team_lead_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <p className="text-base font-bold text-gray-900">{team.team_lead_name}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdateTeam} className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Team Name</label>
                                        <input
                                            required
                                            type="text"
                                            value={editedTeam.name}
                                            onChange={(e) => setEditedTeam({ ...editedTeam, name: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Department</label>
                                        <select
                                            required
                                            value={editedTeam.department_id}
                                            onChange={(e) => setEditedTeam({ ...editedTeam, department_id: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                                        >
                                            <option value="">Select Dept</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Issue Type</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Technical, Billing"
                                            value={editedTeam.issue_type}
                                            onChange={(e) => setEditedTeam({ ...editedTeam, issue_type: e.target.value })}
                                            className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Team Goal</label>
                                    <textarea
                                        rows="2"
                                        placeholder="Define the team's primary objective"
                                        value={editedTeam.goal}
                                        onChange={(e) => setEditedTeam({ ...editedTeam, goal: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20 resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Team Lead</label>
                                    <select
                                        required
                                        value={editedTeam.team_lead_id}
                                        onChange={(e) => setEditedTeam({ ...editedTeam, team_lead_id: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                                    >
                                        <option value="">Select Lead</option>
                                        {leads.map(l => (
                                            <option key={l.id} value={l.id}>{l.full_name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        rows="4"
                                        value={editedTeam.description}
                                        onChange={(e) => setEditedTeam({ ...editedTeam, description: e.target.value })}
                                        className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20 resize-none"
                                    />
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full px-8 py-5 bg-purple-600 hover:bg-black text-white rounded-[24px] text-sm font-black shadow-2xl shadow-purple-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Update Team
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Member Management Section */}
                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Team Members</h3>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{members.length} Agents Assigned</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowAddMember(true)}
                                className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white hover:bg-black rounded-xl text-xs font-bold transition-all active:scale-95"
                            >
                                <UserPlus className="w-4 h-4" />
                                Add Member
                            </button>
                        </div>

                        <div className="divide-y divide-gray-50">
                            {members.length === 0 ? (
                                <div className="p-20 text-center grayscale opacity-40">
                                    <UsersRound className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-sm font-bold text-gray-900 tracking-tight">No members in this team</p>
                                    <p className="text-xs text-gray-400">Add agents to start managing tickets together.</p>
                                </div>
                            ) : members.map((member) => (
                                <div key={member.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-100 to-white flex items-center justify-center text-purple-700 text-sm font-black shadow-sm border border-purple-50 group-hover:scale-110 transition-transform duration-500">
                                            {member.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-extrabold text-gray-900">{member.full_name}</p>
                                            <div className="flex items-center gap-3 text-gray-400">
                                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
                                                    <Mail className="w-3 h-3" /> {member.email}
                                                </span>
                                                <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-tighter">
                                                    <Phone className="w-3 h-3" /> {member.phone}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveMember(member.id)}
                                        className="p-2.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        title="Remove from team"
                                    >
                                        <UserMinus className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Performance / Stats Card (Placeholder) */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-700 to-purple-900 rounded-[40px] p-8 text-white shadow-2xl shadow-purple-200 relative overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-[0.2em]">Quick Stats</span>
                                <ShieldCheck className="w-5 h-5 text-purple-300/50" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-end justify-between border-b border-white/10 pb-4">
                                    <div className="space-y-1">
                                        <p className="text-3xl font-black">{members.length}</p>
                                        <p className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">Active Agents</p>
                                    </div>
                                    <UsersRound className="w-8 h-8 text-white/20 mb-1" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-purple-300 font-bold uppercase tracking-tighter">Team Health</span>
                                        <span className="font-black text-emerald-400">OPTIMAL</span>
                                    </div>
                                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: '85%' }} />
                                    </div>
                                </div>
                            </div>

                            <p className="text-[11px] text-purple-300/80 leading-relaxed font-medium">
                                This team is currently operating within SLAs. Management is active under <b>{team.team_lead_name}</b>.
                            </p>
                        </div>

                        {/* Abstract Backgrounds */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
                        <div className="absolute -left-10 -top-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl" />
                    </div>
                </div>
            </div>

            {/* Add Member Modal */}
            {showAddMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[80vh]">
                        <div className="p-8 border-b border-gray-50 space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Add Team Member</h3>
                                <button
                                    onClick={() => setShowAddMember(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search available agents..."
                                    value={agentSearch}
                                    onChange={(e) => setAgentSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-purple-500/20"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
                            {availableAgents.length === 0 ? (
                                <div className="p-12 text-center opacity-50 space-y-2">
                                    <p className="text-sm font-bold text-gray-900">No agents available</p>
                                    <p className="text-xs text-gray-500">All matching agents are already in this team.</p>
                                </div>
                            ) : availableAgents.map(agent => (
                                <div key={agent.id} className="p-5 flex items-center justify-between hover:bg-purple-50/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xs font-black">
                                            {agent.full_name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900">{agent.full_name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{agent.email}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleAddMember(agent)}
                                        className="p-2 bg-purple-50 text-purple-600 hover:bg-purple-600 hover:text-white rounded-xl transition-all"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                onClick={() => setShowAddMember(false)}
                                className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all shadow-sm"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamDetails;
