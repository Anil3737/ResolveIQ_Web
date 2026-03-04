import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, Info } from 'lucide-react';

const RiskPoliciesPage = () => {
    return (
        <div className="p-4 sm:p-6 space-y-8 max-w-7xl mx-auto pb-20">
            <div className="space-y-1">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">SLA Policies</h2>
                <p className="text-sm text-gray-500 font-medium">Define and manage Service Level Agreements across departments.</p>
            </div>

            <div className="bg-white rounded-[32px] border border-gray-100 p-12 text-center space-y-4 shadow-sm">
                <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-teal-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900">SLA Policy Manager</h3>
                <p className="text-gray-500 max-w-md mx-auto">The interactive policy editor is under development. Policies are currently enforced by the AI risk engine.</p>
            </div>
        </div>
    );
};

export default RiskPoliciesPage;
