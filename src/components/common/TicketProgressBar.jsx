import React from 'react';
import {
    CheckCircle2,
    Circle,
    Clock,
    User,
    Briefcase,
    ShieldAlert,
    Calendar
} from 'lucide-react';

const stages = [
    { key: 'created', label: 'Created', icon: Calendar },
    { key: 'approved', label: 'Approved', icon: CheckCircle2 },
    { key: 'assigned', label: 'Assigned', icon: User },
    { key: 'accepted', label: 'Accepted', icon: Briefcase },
    { key: 'resolved', label: 'Resolved', icon: ShieldAlert },
    { key: 'closed', label: 'Closed', icon: Clock }
];

const TicketProgressBar = ({ progress }) => {
    if (!progress) return null;

    return (
        <div className="w-full py-8 px-4 sm:px-8 bg-white rounded-[40px] border border-gray-100 shadow-sm mb-8 overflow-x-auto no-scrollbar">
            <div className="min-w-[800px] relative flex justify-between">
                {/* Connecting Track */}
                <div className="absolute top-[35px] left-0 right-0 h-[2px] bg-gray-100 -z-0" />

                {/* Active Track Overlay */}
                <div
                    className="absolute top-[35px] left-0 h-[2px] bg-indigo-600 transition-all duration-700 ease-in-out -z-0"
                    style={{
                        width: `${(stages.filter(s => progress[s.key]?.status).length - 1) * (100 / (stages.length - 1))}%`
                    }}
                />

                {stages.map((stage, index) => {
                    const data = progress[stage.key];
                    const isActive = data?.status;
                    const Icon = stage.icon;

                    return (
                        <div key={stage.key} className="flex flex-col items-center gap-4 relative z-10 w-32">
                            {/* Dot/Icon Container */}
                            <div className={`
                                w-[70px] h-[70px] rounded-[24px] flex items-center justify-center transition-all duration-500
                                ${isActive
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 scale-110'
                                    : 'bg-white text-gray-300 border-2 border-gray-100'}
                            `}>
                                <Icon className={`w-7 h-7 ${isActive ? 'animate-in zoom-in duration-500' : ''}`} />
                            </div>

                            {/* Label & Meta */}
                            <div className="text-center space-y-1">
                                <p className={`text-[11px] font-black uppercase tracking-widest transition-colors ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                                    {stage.label}
                                </p>
                                {isActive && data.timestamp ? (
                                    <p className="text-[9px] font-bold text-indigo-500/70 whitespace-nowrap">
                                        {new Date(data.timestamp).toLocaleString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                ) : (
                                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">
                                        Pending
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TicketProgressBar;
