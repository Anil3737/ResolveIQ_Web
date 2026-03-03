import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send,
    AlertCircle,
    HelpCircle,
    ChevronRight,
    FileText,
    Tag,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import api from '../../utils/api';

const CreateTicket = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        issue_type: '',
        priority: 'LOW'
    });

    const issueTypes = [
        'Technical Support',
        'Hardware Issue',
        'Software Installation',
        'Network Connection',
        'Email/Account Access',
        'Other'
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/tickets', formData);
            setSuccess(true);
            setTimeout(() => navigate('/employee/dashboard'), 2000);
        } catch (err) {
            console.error('Failed to create ticket:', err);
            alert('Failed to create ticket. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-6 animate-bounce">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Ticket Created!</h2>
                <p className="text-gray-500 text-center">Your request has been submitted successfully. Returning to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <main className="max-w-2xl mx-auto p-4 sm:p-6">
                <div className="bg-blue-600 rounded-2xl p-6 text-white mb-8 shadow-lg shadow-blue-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-xl font-bold mb-2">Need Help?</h2>
                        <p className="text-blue-100 text-xs leading-relaxed">
                            Describe your issue in detail and our support team will get back to you as soon as possible.
                        </p>
                    </div>
                    <HelpCircle className="absolute right-[-10px] bottom-[-10px] w-24 h-24 text-white/10" />
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card-premium space-y-5">
                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Ticket Title</label>
                            <div className="relative">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Summarize the issue"
                                    className="input-field pl-12"
                                    required
                                />
                            </div>
                        </div>

                        {/* Issue Type */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Issue Type</label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    name="issue_type"
                                    value={formData.issue_type}
                                    onChange={handleInputChange}
                                    className="input-field pl-12 appearance-none"
                                    required
                                >
                                    <option value="">Select Issue Type</option>
                                    {issueTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <ChevronRight className="w-5 h-5 text-gray-400 rotate-90" />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Provide details about the problem and when it started..."
                                className="input-field h-40 resize-none py-4"
                                required
                            />
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2">Priority Level</label>
                            <div className="flex gap-3">
                                {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, priority: p }))}
                                        className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs transition-all ${formData.priority === p
                                            ? 'border-primary bg-blue-50 text-primary'
                                            : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'
                                            }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-xl border border-orange-100">
                        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                        <p className="text-[11px] text-orange-700 leading-normal">
                            Tickets are typically reviewed within 24 hours. For critical system failures, please contact the IT emergency line.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                            <>
                                <Send className="w-5 h-5" /> Submit Ticket
                            </>
                        )}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default CreateTicket;
