import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UsersRound,
    Plus,
    Search,
    Filter,
    ChevronRight,
    Loader2,
    Users,
    Building2,
    Briefcase,
    MoreVertical,
    Trash2,
    Edit3
} from 'lucide-react';
import api from '../../utils/api';

const Teams = () => {
    const [teams, setTeams] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDept, setFilterDept] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const navigate = useNavigate();

    // Create Modal State
    const [newTeam, setNewTeam] = useState({
        name: '',
        description: '',
        goal: '',
        issue_type: '',
        department_id: '',
        team_lead_id: '',
        agent_ids: []
    });
    const [leads, setLeads] = useState([]);
    const [agents, setAgents] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [teamsRes, deptsRes, leadsRes, agentsRes] = await Promise.all([
                    api.get('/admin/teams'),
                    api.get('/admin/departments'),
                    api.get('/admin/users?role=TEAM_LEAD&exclude_assigned=true'),
                    api.get('/admin/users?role=AGENT&exclude_assigned=true')
                ]);
                setTeams(teamsRes.data.data || []);
                setDepartments(deptsRes.data.data || []);
                setLeads(leadsRes.data.data || []);
                setAgents(agentsRes.data.data || []);
            } catch (err) {
                console.error('Failed to fetch teams data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const res = await api.post('/admin/teams', newTeam);
            setTeams([res.data.data, ...teams]);
            setShowCreateModal(false);
            setNewTeam({ name: '', description: '', goal: '', issue_type: '', department_id: '', team_lead_id: '', agent_ids: [] });
            // Re-fetch to get complete object with department names etc.
            const refresh = await api.get('/admin/teams');
            setTeams(refresh.data.data);
        } catch (err) {
            alert(err.response?.data?.message || 'Error creating team');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteTeam = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this team?')) return;
        try {
            await api.delete(`/admin/teams/${id}`);
            setTeams(teams.filter(t => t.id !== id));
        } catch (err) {
            alert('Error deleting team');
        }
    };

    const filteredTeams = teams.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDept = !filterDept || t.department === filterDept;
        return matchesSearch && matchesDept;
    });

    const filteredLeads = leads.filter(l => {
        if (!newTeam.department_id) return true;

        const targetId = String(newTeam.department_id);
        const userDeptId = l.department_id ? String(l.department_id) : '';

        // Exact ID match
        if (userDeptId === targetId) return true;

        // Fallback: Name-based match (case-insensitive and partial)
        const targetDept = departments.find(d => String(d.id) === targetId);
        if (targetDept && l.department_name) {
            const tName = targetDept.name.toLowerCase();
            const uName = l.department_name.toLowerCase();
            return uName.includes(tName) || tName.includes(uName);
        }

        return false;
    });

    const filteredAgents = agents.filter(a => {
        if (!newTeam.department_id) return true;

        const targetId = String(newTeam.department_id);
        const userDeptId = a.department_id ? String(a.department_id) : '';

        if (userDeptId === targetId) return true;

        const targetDept = departments.find(d => String(d.id) === targetId);
        if (targetDept && a.department_name) {
            const tName = targetDept.name.toLowerCase();
            const uName = a.department_name.toLowerCase();
            return uName.includes(tName) || tName.includes(uName);
        }

        return false;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight leading-tight">Teams Management</h2>
                    <p className="text-sm text-gray-500">Organize agents into teams and assign leads</p>
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-200 transition-all active:scale-95 shrink-0"
                >
                    <Plus className="w-5 h-5" />
                    Create New Team
                </button>
            </div>

            {/* Sub-header / Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search teams..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={filterDept}
                        onChange={(e) => setFilterDept(e.target.value)}
                        className="flex-1 sm:w-48 bg-gray-50 border-none rounded-xl text-xs font-bold px-3 py-2 cursor-pointer focus:ring-2 focus:ring-purple-500/20"
                    >
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Teams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                    <div
                        key={team.id}
                        onClick={() => navigate(`/admin/teams/${team.id}`)}
                        className="group bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-purple-200/50 hover:border-purple-200 transition-all duration-500 cursor-pointer relative overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50/50 rounded-bl-full -mr-16 -mt-16 group-hover:bg-purple-100 transition-colors" />

                        <div className="relative z-10 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-6">
                                <div className="p-4 bg-purple-50 text-purple-600 rounded-[22px] group-hover:bg-purple-600 group-hover:text-white transition-all duration-500 shadow-sm">
                                    <UsersRound className="w-7 h-7" />
                                </div>
                                <button
                                    onClick={(e) => handleDeleteTeam(team.id, e)}
                                    className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-purple-700 transition-colors truncate">{team.name}</h3>
                            <p className="text-xs text-gray-400 line-clamp-1 min-h-[1rem] mb-2">{team.description || 'No description provided.'}</p>
                            <div className="bg-purple-50/50 p-2 rounded-xl mb-4">
                                <div className="flex items-center justify-between mb-1">
                                    <p className="text-[9px] font-bold text-purple-400 uppercase tracking-widest">Team Goal</p>
                                    <span className="text-[9px] font-black text-purple-600 bg-purple-100/50 px-1.5 py-0.5 rounded-md uppercase">
                                        {team.issue_type || 'General'}
                                    </span>
                                </div>
                                <p className="text-xs text-purple-700 font-medium line-clamp-2 italic">"{team.goal || 'To provide excellent service.'}"</p>
                            </div>

                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                        <Building2 className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Department</span>
                                        <span className="text-xs font-semibold text-gray-700">{team.department}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                                        <Users className="w-4 h-4 text-gray-400" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Team Size</span>
                                        <span className="text-xs font-semibold text-gray-700">{team.member_count} Agents</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-gray-50 flex items-center justify-between">
                                <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
                                    Manage Members
                                </span>
                                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredTeams.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 grayscale opacity-40">
                    <UsersRound className="w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-lg font-bold text-gray-900">No teams found</p>
                    <p className="text-sm text-gray-500">Try adjusting your search or create a new team.</p>
                </div>
            )}

            {/* Create Team Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Create New Team</h3>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <Plus className="w-6 h-6 rotate-45 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTeam} className="space-y-5">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Team Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Enter team name"
                                        value={newTeam.name}
                                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Briefly describe the team's focus"
                                        value={newTeam.description}
                                        onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Team Goal</label>
                                    <textarea
                                        rows="2"
                                        placeholder="What is this team's primary goal?"
                                        value={newTeam.goal}
                                        onChange={(e) => setNewTeam({ ...newTeam, goal: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Issue Type</label>
                                    <select
                                        required
                                        value={newTeam.issue_type}
                                        onChange={(e) => {
                                            const issueType = e.target.value;
                                            // Robust mapping of Issue Type to Department Name
                                            const MAPPING = {
                                                "Network Issues": "Network Issues",
                                                "Hardware Failure": "Hardware Failure",
                                                "Software Installation": "Software Installation",
                                                "Application Down/ Application Issue": "Application Down/ Application Issue",
                                                "Others": "Others"
                                            };
                                            const targetDeptName = MAPPING[issueType];
                                            const dept = departments.find(d => d.name === targetDeptName);

                                            setNewTeam({
                                                ...newTeam,
                                                issue_type: issueType,
                                                department_id: dept ? dept.id.toString() : '',
                                                team_lead_id: '', // Reset selections when specialty changes
                                                agent_ids: []
                                            });
                                        }}
                                        className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                                    >
                                        <option value="">Select Issue Type</option>
                                        <option value="Network Issues">Network Issues</option>
                                        <option value="Hardware Failure">Hardware Failure</option>
                                        <option value="Software Installation">Software Installation</option>
                                        <option value="Application Down/ Application Issue">Application Down/ Application Issue</option>
                                        <option value="Others">Others</option>
                                    </select>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Department</label>
                                        <select
                                            required
                                            value={newTeam.department_id}
                                            onChange={(e) => setNewTeam({ ...newTeam, department_id: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                                        >
                                            <option value="">Select Dept</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Team Lead</label>
                                        <select
                                            required
                                            value={newTeam.team_lead_id}
                                            onChange={(e) => setNewTeam({ ...newTeam, team_lead_id: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-purple-500/20 cursor-pointer"
                                        >
                                            <option value="">Select Lead</option>
                                            {filteredLeads.map(l => (
                                                <option key={l.id} value={l.id}>{l.full_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Support Agents (Multiple)</label>
                                    <div className="bg-gray-50 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                                        {filteredAgents.length > 0 ? (
                                            filteredAgents.map(agent => (
                                                <label key={agent.id} className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer transition-colors group">
                                                    <input
                                                        type="checkbox"
                                                        checked={newTeam.agent_ids.includes(agent.id)}
                                                        onChange={(e) => {
                                                            const ids = e.target.checked
                                                                ? [...newTeam.agent_ids, agent.id]
                                                                : newTeam.agent_ids.filter(id => id !== agent.id);
                                                            setNewTeam({ ...newTeam, agent_ids: ids });
                                                        }}
                                                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                                                    />
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-gray-700 group-hover:text-purple-700">{agent.full_name}</span>
                                                        <span className="text-[10px] text-gray-400">{agent.phone}</span>
                                                    </div>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-xs text-gray-400 text-center py-4 italic">No unassigned agents found for this specialty.</p>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-gray-400 ml-1">
                                        Selected: {newTeam.agent_ids.length} agents
                                    </p>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl text-sm font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-purple-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                        Create Team
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Teams;
