import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Loader2,
    MoreVertical,
    Edit3,
    Trash2,
    X,
    Save,
    AlertCircle,
    Building2,
    Shield,
    Briefcase,
    Mail,
    Phone,
    Filter,
    CheckCircle2
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import api from '../../utils/api';

const UsersPage = () => {
    const location = useLocation();
    const [users, setUsers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        emp_id: '',
        role: 'EMPLOYEE',
        department_id: '',
        password: ''
    });

    useEffect(() => {
        fetchInitialData();

        // Handle query params for "Create Staff" flow
        const params = new URLSearchParams(location.search);
        const roleParam = params.get('role');
        const actionParam = params.get('action');

        if (actionParam === 'new' && roleParam) {
            setFormData(prev => ({ ...prev, role: roleParam }));
            setModalMode('create');
            setShowModal(true);
        }
    }, [location]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [usersRes, deptsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/departments')
            ]);
            setUsers(usersRes.data.data || []);
            setDepartments(deptsRes.data.data || []);
        } catch (err) {
            console.error('Failed to fetch initial data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, user = null) => {
        setModalMode(mode);
        if (user) {
            setFormData({
                id: user.id,
                full_name: user.full_name,
                email: user.email,
                emp_id: user.phone || '',
                role: user.role,
                department_id: user.department_id || '',
            });
        } else {
            setFormData({
                full_name: '',
                email: '',
                emp_id: '',
                role: 'EMPLOYEE',
                department_id: '',
                password: ''
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (modalMode === 'create') {
                const isStaff = ['AGENT', 'TEAM_LEAD'].includes(formData.role);
                const endpoint = isStaff ? '/admin/create-staff' : '/admin/create-user';

                // Prepare sanitized payload
                const payload = {
                    ...formData,
                    emp_id: formData.emp_id.trim().toUpperCase(),
                    full_name: formData.full_name.trim(),
                    // Backend expects 'department' string, not ID for staff creation
                    department: isStaff ? departments.find(d => d.id == formData.department_id)?.name : undefined,
                    location: 'Main Campus' // Default if not selected
                };

                await api.post(endpoint, payload);
            } else {
                await api.put(`/admin/users/${formData.id}`, formData);
            }
            setShowModal(false);
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (user_id) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/users/${user_id}`);
            fetchInitialData();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting user');
        }
    };

    const filteredUsers = users.filter(u => {
        const matchesSearch =
            u.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.phone?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const getRoleBadge = (role) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-700 border-red-200';
            case 'TEAM_LEAD': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'AGENT': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN': return <Shield className="w-3.5 h-3.5" />;
            case 'TEAM_LEAD': return <Users className="w-3.5 h-3.5" />;
            case 'AGENT': return <Briefcase className="w-3.5 h-3.5" />;
            default: return <UserPlus className="w-3.5 h-3.5" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Users</h2>
                    <p className="text-sm text-gray-500 font-medium">Manage employees, support agents, and team leads.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by name, email or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-[20px] text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal('create')}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white hover:bg-black rounded-[20px] text-sm font-black transition-all shadow-xl shadow-purple-100 active:scale-95 uppercase tracking-widest"
                    >
                        <UserPlus className="w-5 h-5" />
                        New User
                    </button>
                </div>
            </div>

            {/* Role Tabs */}
            <div className="flex p-1.5 bg-gray-100/80 backdrop-blur-sm rounded-[24px] w-fit shadow-inner">
                {['ALL', 'EMPLOYEE', 'AGENT', 'TEAM_LEAD', 'ADMIN'].map((role) => (
                    <button
                        key={role}
                        onClick={() => setRoleFilter(role)}
                        className={`px-6 py-2.5 rounded-[20px] text-xs font-black transition-all uppercase tracking-widest ${roleFilter === role
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {role}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-bold text-gray-900">No users found</p>
                        <p className="text-sm text-gray-500">Try adjusting your filters or search terms.</p>
                    </div>
                ) : filteredUsers.map((user) => (
                    <div key={user.id} className="group bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-purple-900/5 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-purple-600/10 transition-colors" />

                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center text-purple-600 font-black text-xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                                    {user.full_name.charAt(0)}
                                </div>
                                <div>
                                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-tighter mb-1.5 ${getRoleBadge(user.role)}`}>
                                        {getRoleIcon(user.role)}
                                        {user.role}
                                    </div>
                                    <h3 className="text-xl font-black text-gray-900 group-hover:text-purple-700 transition-colors truncate max-w-[150px]">
                                        {user.full_name}
                                    </h3>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => handleOpenModal('edit', user)} className="p-2 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(user.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-50">
                            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                <Mail className="w-4 h-4 text-purple-400 shrink-0" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                <Phone className="w-4 h-4 text-purple-400 shrink-0" />
                                <span>{user.phone || 'N/A'}</span>
                            </div>
                            {user.department_name && (
                                <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
                                    <Building2 className="w-4 h-4 text-purple-400 shrink-0" />
                                    <span>{user.department_name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden my-8">
                        <div className="p-8 sm:p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                                        {modalMode === 'create' ? 'Onboard New' : 'Edit'} User
                                    </h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                        Configure user profile & access
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-1.5 sm:col-span-2">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 text-[10px]">Full Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.full_name}
                                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 text-[10px]">Email Address</label>
                                    <input
                                        required
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 text-[10px]">EMP ID / Phone</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="EMP123"
                                        value={formData.emp_id}
                                        onChange={(e) => setFormData({ ...formData, emp_id: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 text-[10px]">System Role</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20 appearance-none"
                                    >
                                        <option value="EMPLOYEE">Employee</option>
                                        <option value="AGENT">Agent</option>
                                        <option value="TEAM_LEAD">Team Lead</option>
                                        <option value="ADMIN">Administrator</option>
                                    </select>
                                </div>

                                {['AGENT', 'TEAM_LEAD'].includes(formData.role) && (
                                    <div className="space-y-1.5 transition-all">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 text-[10px]">Department</label>
                                        <select
                                            required
                                            value={formData.department_id}
                                            onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20 appearance-none"
                                        >
                                            <option value="">Select Department</option>
                                            {departments.map(d => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {modalMode === 'create' && (
                                    <div className="space-y-1.5 sm:col-span-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1 text-[10px]">Initial Password</label>
                                        <input
                                            required
                                            type="password"
                                            placeholder="••••••••"
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="sm:col-span-2 mt-4 px-8 py-5 bg-purple-600 hover:bg-black text-white rounded-[24px] text-sm font-black shadow-2xl shadow-purple-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (modalMode === 'create' ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />)}
                                    {modalMode === 'create' ? 'Create User Account' : 'Update Profile'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersPage;
