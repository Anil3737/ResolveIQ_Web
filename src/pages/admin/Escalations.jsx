import React from 'react';
import { Bell, AlertTriangle, ArrowRight } from 'lucide-react';

const EscalationsPage = () => {
    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto pb-20">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Escalations</h2>
                <p className="text-sm text-gray-500 font-medium">Track tickets that have been escalated to senior management.</p>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 p-12 text-center space-y-4 shadow-sm">
                <div className="w-20 h-20 bg-orange-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Bell className="w-10 h-10 text-orange-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">Escalation Queue</h3>
                <p className="text-gray-500 max-w-md mx-auto">Detailed escalation management is being implemented. Use the "Tickets" module and filter by status for now.</p>
            </div>
        </div>
    );
};

export default EscalationsPage;
