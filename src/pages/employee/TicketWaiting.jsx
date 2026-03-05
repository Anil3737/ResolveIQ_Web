import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, Zap, Cpu, Search, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const TicketWaiting = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [status, setStatus] = useState('Initializing Secure Connection...');
    const [step, setStep] = useState(0);
    const [error, setError] = useState(null);

    // Guard against React 18 Strict Mode double-invocation which would POST twice
    const submittedRef = useRef(false);

    const ticketData = location.state?.ticketData;

    useEffect(() => {
        if (!ticketData) {
            navigate('/employee/create-ticket');
            return;
        }

        // CRITICAL: Prevent double submission (React 18 Strict Mode fires effects twice in dev)
        if (submittedRef.current) return;
        submittedRef.current = true;

        const submitFlow = async () => {
            try {
                // Step 1: Artificial delay for UX parity & Animation
                await new Promise(resolve => setTimeout(resolve, 800));
                setStep(1);
                setStatus('Analyzing Request Content...');

                await new Promise(resolve => setTimeout(resolve, 800));
                setStep(2);
                setStatus('Calculating Priority & Department Routing...');

                // Step 2: Actual API Call — fires only once thanks to submittedRef guard
                const response = await api.post('/tickets', ticketData);

                await new Promise(resolve => setTimeout(resolve, 600));
                setStep(3);
                setStatus('Finalizing Registration...');

                await new Promise(resolve => setTimeout(resolve, 800));
                navigate('/employee/success', {
                    state: { ticketId: response.data.data?.id || response.data.ticket_id || response.data.id },
                    replace: true  // replace history so back-button can't re-trigger
                });
            } catch (err) {
                console.error('Submission failed:', err);
                submittedRef.current = false; // Allow retry on failure
                setError(err.response?.data?.message || 'System failed to process the request.');
            }
        };

        submitFlow();
    }, []); // Empty deps — runs once on mount only. ticketData is read from location.state (stable ref)


    if (error) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-red-50 rounded-[32px] flex items-center justify-center text-red-500 mb-8 border border-red-100 shadow-xl shadow-red-500/10">
                    <AlertCircle className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter text-red-600">Submission Interrupted</h2>
                <p className="text-gray-500 font-bold max-w-sm mb-10 text-sm uppercase tracking-widest leading-loose">
                    {error}
                </p>
                <button
                    onClick={() => navigate('/employee/create-ticket')}
                    className="px-10 py-4 bg-gray-900 text-white rounded-[20px] font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-gray-900/20"
                >
                    Return to Form
                </button>
            </div>
        );
    }

    const steps = [
        { icon: ShieldCheck, label: 'Security Handshake' },
        { icon: Cpu, label: 'AI Content Analysis' },
        { icon: Search, label: 'Department Matching' },
        { icon: CheckCircle2, label: 'Finalizing' }
    ];

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 overflow-hidden relative">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center max-w-md w-full">
                {/* Main Animation Container */}
                <div className="relative mb-16">
                    <div className="w-40 h-40 bg-white rounded-[48px] shadow-2xl shadow-indigo-500/10 border border-indigo-50 flex items-center justify-center relative animate-pulse">
                        <Loader2 className="w-16 h-16 text-indigo-600 animate-spin" strokeWidth={1} />

                        {/* Orbiting Icons */}
                        <div className="absolute inset-0 animate-[spin_10s_linear_infinite]">
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 p-3 bg-white rounded-2xl shadow-lg border border-indigo-50 text-indigo-500">
                                <Zap className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Text */}
                <div className="text-center space-y-4 mb-12">
                    <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Processing Incident</h2>
                    <div className="flex flex-col items-center gap-2">
                        <p className="text-indigo-600 font-black text-xs uppercase tracking-[0.3em] font-mono animate-bounce">
                            {status}
                        </p>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="w-full flex justify-between gap-4 px-4">
                    {steps.map((s, idx) => (
                        <div key={idx} className="flex flex-col items-center gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${idx <= step
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200'
                                : 'bg-white border-gray-100 text-gray-300'
                                }`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-[8px] font-black uppercase tracking-widest text-center max-w-[60px] leading-tight ${idx <= step ? 'text-indigo-600' : 'text-gray-300'
                                }`}>
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="mt-20 text-gray-400 text-[10px] font-black uppercase tracking-[0.4em] text-center opacity-40">
                    System Synchronization In Progress
                </p>
            </div>
        </div>
    );
};

export default TicketWaiting;
