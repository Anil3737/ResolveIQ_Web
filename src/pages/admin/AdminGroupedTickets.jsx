import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Building2,
    ChevronRight,
    Loader2,
    Ticket,
    Layers,
    AlertCircle
} from 'lucide-react';
import api from '../../utils/api';

const AdminGroupedTickets = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                // We reuse the departments endpoint as it now returns ticket counts
                const res = await api.get('/admin/departments');
                setDepartments(res.data.data || []);
            } catch (err) {
                console.error('Failed to fetch ticket groups:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchGroups();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-10 h-10 text-purple-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto pb-20">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Grouped Tickets</h2>
                <p className="text-sm text-gray-500 font-medium">Browse tickets organized by department and issue types.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departments.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-white rounded-[32px] border border-dashed border-gray-200">
                        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-lg font-bold text-gray-900">No ticket groups found</p>
                    </div>
                ) : departments.map((dept) => (
                    <div
                        key={dept.id}
                        onClick={() => navigate(`/admin/filtered-tickets/department/${dept.id}`, { state: { name: dept.name } })}
                        className="group bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm hover:shadow-2xl hover:shadow-purple-900/5 transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col justify-between"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 rounded-bl-[100px] -mr-8 -mt-8 group-hover:bg-purple-600/10 transition-colors" />

                        <div className="space-y-6">
                            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-500">
                                <Layers className="w-7 h-7" />
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-purple-700 transition-colors">
                                    {dept.name}
                                </h3>
                                <p className="text-sm text-gray-500 font-medium line-clamp-2">
                                    {dept.description || `View all tickets related to ${dept.name} issues.`}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                    <Ticket className="w-4 h-4" />
                                </div>
                                <span className="text-sm font-black text-gray-900">{dept.ticket_count || 0} Tickets</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminGroupedTickets;
