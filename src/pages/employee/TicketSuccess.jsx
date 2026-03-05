import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ArrowRight, LayoutDashboard, Ticket } from 'lucide-react';

const TicketSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const ticketId = location.state?.ticketId || 'TNK-10293';

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6">
            <div className="max-w-xl w-full text-center space-y-12">
                {/* Hero Icon */}
                <div className="relative inline-block">
                    <div className="w-32 h-32 bg-emerald-500 rounded-[48px] flex items-center justify-center text-white shadow-2xl shadow-emerald-500/40 relative z-10">
                        <CheckCircle2 className="w-16 h-16" />
                    </div>
                    {/* Animated rings */}
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-[48px] animate-ping" />
                </div>

                <div className="space-y-4">
                    <h2 className="text-5xl font-black text-gray-900 tracking-tighter">Registration Complete!</h2>
                    <p className="text-gray-400 font-bold text-sm uppercase tracking-[0.2em] max-w-md mx-auto leading-relaxed">
                        Your support incident has been successfully logged into the ResolveIQ neural engine.
                    </p>
                </div>

                {/* Ticket ID Card */}
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col items-center gap-4 group hover:scale-[1.02] transition-transform">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Incident Identifier</span>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                            <Ticket className="w-6 h-6" />
                        </div>
                        <span className="text-4xl font-black text-gray-900 font-mono tracking-tighter">
                            #{ticketId}
                        </span>
                    </div>
                </div>

                {/* Action Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/employee/dashboard')}
                        className="flex items-center justify-center gap-3 px-8 py-5 bg-gray-900 text-white rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-900/20 active:scale-95 group"
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Command Center
                    </button>

                    <button
                        onClick={() => navigate(`/employee/tickets/${ticketId}`)}
                        className="flex items-center justify-center gap-3 px-8 py-5 bg-white border-2 border-gray-100 text-gray-900 rounded-[24px] font-black text-xs uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all active:scale-95 group"
                    >
                        Inspect Ticket
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>

                <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] opacity-40">
                    Auto-Redirection in Progress...
                </p>
            </div>
        </div>
    );
};

export default TicketSuccess;
