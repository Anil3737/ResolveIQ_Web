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
    CheckCircle2,
    ArrowLeft,
    MessageSquare,
    Calendar
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
        expected_resolution_time: ''
    });

    const issueTypes = [
        'Network Issue',
        'Hardware Failure',
        'Software Installation',
        'Application Issues',
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
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F8FAFC]">
                <div className="w-32 h-32 bg-emerald-100 rounded-[48px] flex items-center justify-center text-emerald-600 mb-10 border border-emerald-200 shadow-2xl">
                    <CheckCircle2 className="w-16 h-16" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Ticket Registered!</h2>
                <p className="text-gray-400 text-center font-bold text-lg max-w-sm uppercase tracking-widest text-xs">
                    Your request has been securely submitted to our support infrastructure.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            <main className="max-w-[1200px] mx-auto p-4 sm:p-8 lg:p-12 space-y-12">

                {/* Header Area */}
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate('/employee/dashboard')} className="p-4 bg-white shadow-md hover:bg-gray-50 rounded-[24px] border border-gray-100 transition-all">
                        <ArrowLeft className="w-8 h-8 text-indigo-600" />
                    </button>
                    <div>
                        <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Submit a Request</h2>
                        <p className="text-gray-400 font-black mt-2 uppercase tracking-widest text-xs px-1">New Support Incident</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Form Section (Spans 7 columns) */}
                    <div className="lg:col-span-7 space-y-8">
                        <form onSubmit={handleSubmit} className="bg-white p-10 md:p-14 rounded-[56px] border border-gray-50 shadow-2xl shadow-gray-500/5 space-y-12">
                            <div className="space-y-10">
                                {/* Title Section */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-xs font-black text-indigo-600 uppercase tracking-widest px-2">
                                        <FileText className="w-5 h-5" />
                                        Request Title
                                    </label>
                                    <input
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="Briefly state the issue..."
                                        className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-2xl shadow-inner-sm"
                                        required
                                    />
                                    <p className="text-[10px] text-gray-400 font-bold px-4">Keep it concise—e.g., "VPN connection failing in Chennai site"</p>
                                </div>

                                {/* Issue Type Section */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-xs font-black text-indigo-600 uppercase tracking-widest px-2">
                                        <Tag className="w-5 h-5" />
                                        Service Category
                                    </label>
                                    <div className="relative group">
                                        <select
                                            name="issue_type"
                                            value={formData.issue_type}
                                            onChange={handleInputChange}
                                            className="w-full px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-lg appearance-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Select Category</option>
                                            {issueTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 rotate-90 pointer-events-none" />
                                    </div>
                                </div>

                                {/* Expected Resolution Time */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-xs font-black text-indigo-600 uppercase tracking-widest px-2">
                                        <Calendar className="w-5 h-5" />
                                        Requested Resolution Window (Hours)
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="number"
                                            name="expected_resolution_time"
                                            value={formData.expected_resolution_time}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 24"
                                            min="1"
                                            className="w-full max-w-[200px] px-8 py-5 bg-gray-50 border-2 border-transparent rounded-[24px] focus:bg-white focus:border-indigo-500 outline-none transition-all font-black text-lg shadow-inner-sm"
                                        />
                                        <p className="text-sm text-gray-400 font-bold italic">
                                            Suggest a timeframe for resolution. AI will validate against complexity.
                                        </p>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-3 text-xs font-black text-indigo-600 uppercase tracking-widest px-2">
                                        <MessageSquare className="w-5 h-5" />
                                        Detailed Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Describe the problem, when it started, and any troubleshooting steps you've already taken..."
                                        className="w-full px-8 py-6 bg-gray-50 border-2 border-transparent rounded-[32px] focus:bg-white focus:border-indigo-500 outline-none transition-all font-bold text-lg h-52 resize-none leading-relaxed shadow-inner-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[32px] font-black text-2xl shadow-2xl shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-4 group"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                        <span>Submitting to System...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-8 h-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        <span>Confirm Submission</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Information Sidebar (Spans 5 columns) */}
                    <div className="lg:col-span-5 space-y-10">
                        {/* Status Card */}
                        <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-12 rounded-[56px] text-white shadow-2xl shadow-indigo-500/20 relative overflow-hidden">
                            <HelpCircle className="absolute right-[-20px] top-[-20px] w-48 h-48 text-white/5" />
                            <div className="relative z-10 space-y-8">
                                <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[24px] flex items-center justify-center border border-white/20">
                                    <HelpCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black tracking-tight mb-4">Need Rapid Assistance?</h3>
                                    <p className="text-indigo-100 text-base leading-relaxed font-medium">
                                        For critical system failures or platform outages, please contact the IT emergency desk directly through our live portal.
                                    </p>
                                </div>
                                <div className="pt-4 flex items-center gap-4 text-xs font-black uppercase tracking-widest opacity-60">
                                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                    Support Desk Active
                                </div>
                            </div>
                        </div>

                        {/* Guide Card */}
                        <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-xl shadow-gray-500/5 space-y-8">
                            <h4 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                <AlertCircle className="w-6 h-6 text-amber-500" />
                                Submission Guidelines
                            </h4>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-1.5 h-auto bg-indigo-100 rounded-full" />
                                    <p className="text-sm text-gray-500 font-medium leading-normal">
                                        Ensure your **title is descriptive** but brief to ensure fast categorization.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1.5 h-auto bg-indigo-100 rounded-full" />
                                    <p className="text-sm text-gray-500 font-medium leading-normal">
                                        Select the **most relevant category** to bypass automated triage systems.
                                    </p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-1.5 h-auto bg-indigo-100 rounded-full" />
                                    <p className="text-sm text-gray-500 font-medium leading-normal">
                                        Include **screenshots or error codes** in the description for technical issues.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* System Note */}
                        <p className="text-center text-gray-400 text-[10px] font-black uppercase tracking-[0.43em] italic leading-loose opacity-60">
                            © MMXXVI System-Auth-Verified <br /> ResolveIQ Support Cluster 04
                        </p>
                    </div>

                </div >
            </main >
        </div >
    );
};

export default CreateTicket;
