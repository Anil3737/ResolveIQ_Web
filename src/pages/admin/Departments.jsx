import React, { useState, useEffect } from 'react';
import {
    Building2,
    Users,
    Ticket,
    Plus,
    Search,
    Loader2,
    MoreVertical,
    Edit3,
    Trash2,
    X,
    Save,
    AlertCircle,
    Layers,
    Calendar
} from 'lucide-react';
import api from '../../utils/api';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [submitting, setSubmitting] = useState(false);
    const [currentDept, setCurrentDept] = useState({ name: '', description: '' });

    useEffect(() => {
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/departments');
            setDepartments(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch departments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (mode, dept = { name: '', description: '' }) => {
        setModalMode(mode);
        setCurrentDept(dept);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            if (modalMode === 'create') {
                await api.post('/admin/departments', currentDept);
            } else {
                await api.put(`/admin/departments/${currentDept.id}`, currentDept);
            }
            setShowModal(false);
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.message || 'Error processing request');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this department?')) return;
        try {
            await api.delete(`/admin/departments/${id}`);
            fetchDepartments();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting department');
        }
    };

    const filteredDepts = departments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">System Departments</h2>
                    <p className="text-sm text-gray-500 font-medium">Manage organizational structures and workload distribution.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 pr-6 py-3 bg-white border border-gray-100 rounded-[20px] text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/5 focus:border-purple-500 transition-all w-64 shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => handleOpenModal('create')}
                        className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white hover:bg-black rounded-[20px] text-sm font-black transition-all shadow-xl shadow-purple-100 active:scale-95 uppercase tracking-widest"
                    >
                        <Plus className="w-5 h-5" />
                        New Dept
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDepts.length === 0 ? (
                    <div className="col-span-full py-20 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-bold text-gray-900">No departments found</p>
                        <p className="text-sm text-gray-500">Try adjusting your search or create a new department.</p>
                    </div>
                ) : filteredDepts.map((dept) => (
                    <div key={dept.id} className="group bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-purple-900/5 transition-all duration-500 relative overflow-hidden flex flex-col justify-between h-full">
                        {/* Glass Overlay Effect */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-purple-600/10 transition-colors" />

                        <div>
                            <div className="flex items-start justify-between mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-500">
                                    <Building2 className="w-7 h-7" />
                                </div>
                                <div className="flex gap-1">
                                    <button onClick={() => handleOpenModal('edit', dept)} className="p-2.5 text-gray-300 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all">
                                        <Edit3 className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleDelete(dept.id)} className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-purple-700 transition-colors">{dept.name}</h3>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                        <Calendar className="w-3 h-3" /> Created {new Date(dept.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 font-medium leading-relaxed line-clamp-2 min-h-[2.5rem]">
                                    {dept.description || 'Dedicated to handling specialized issues and optimizing workflows.'}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-8 pt-6 border-t border-gray-50">
                            <div className="bg-gray-50/50 rounded-2xl p-4 space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Layers className="w-3 h-3 text-purple-400" /> Teams
                                </div>
                                <p className="text-xl font-black text-gray-900">{dept.team_count}</p>
                            </div>
                            <div className="bg-gray-50/50 rounded-2xl p-4 space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <Ticket className="w-3 h-3 text-purple-400" /> Tickets
                                </div>
                                <p className="text-xl font-black text-gray-900">{dept.ticket_count}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl overflow-hidden">
                        <div className="p-8 sm:p-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">{modalMode === 'create' ? 'Create New' : 'Edit'} Department</h3>
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Configure department profiles</p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                    <X className="w-6 h-6 text-gray-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Dept Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. IT Operations"
                                        value={currentDept.name}
                                        onChange={(e) => setCurrentDept({ ...currentDept, name: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea
                                        rows="4"
                                        placeholder="What does this department handle?"
                                        value={currentDept.description}
                                        onChange={(e) => setCurrentDept({ ...currentDept, description: e.target.value })}
                                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-purple-500/20 resize-none"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full px-8 py-5 bg-purple-600 hover:bg-black text-white rounded-[24px] text-sm font-black shadow-2xl shadow-purple-200 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest"
                                >
                                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                    {modalMode === 'create' ? 'Create Department' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Departments;
