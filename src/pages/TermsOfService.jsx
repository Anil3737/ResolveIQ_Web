import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Lock, AlertTriangle, Users, Eye } from 'lucide-react';
import appLogo from '../assets/resolveiq-app-icon.png';

const sections = [
    {
        icon: FileText,
        title: '1. Acceptance of Terms',
        content: `By creating an account and accessing the ResolveIQ platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. These terms constitute a legally binding agreement between you and ResolveIQ. If you do not agree to these terms, you must not register for or use this platform.`,
    },
    {
        icon: Users,
        title: '2. Account Eligibility & Registration',
        content: `Self-registration is available exclusively for verified employees of the organization. Team Lead and Support Agent accounts are provisioned solely by system administrators. Providing false or inaccurate information during registration is strictly prohibited. You are responsible for maintaining the confidentiality of your account credentials and for all activities carried out under your account.`,
    },
    {
        icon: Lock,
        title: '3. Acceptable Use Policy',
        content: `You agree to use the ResolveIQ platform only for its intended purpose — submitting, tracking, and resolving internal support tickets. You must not misuse the platform by submitting false, malicious, or spam tickets. You must not attempt to gain unauthorized access to other user accounts, systems, or data within the platform. Any violation of this policy may result in immediate account suspension.`,
    },
    {
        icon: Eye,
        title: '4. Data Privacy & Confidentiality',
        content: `All data submitted through the ResolveIQ platform is treated as confidential organizational information. Ticket data, user information, and internal communications are stored securely and are accessible only to authorized personnel within their defined role scope. We do not share, sell, or transfer your personal data to third parties without explicit organizational consent. Data is retained in accordance with your organization's data retention policy.`,
    },
    {
        icon: Shield,
        title: '5. Platform Security',
        content: `You are responsible for maintaining the security of your login credentials. You must immediately report any unauthorized use of your account or any known security vulnerabilities to the system administrator. ResolveIQ implements industry-standard security measures including encrypted data transmission and role-based access control. However, no system is entirely infallible, and your cooperation is essential to maintaining platform security.`,
    },
    {
        icon: AlertTriangle,
        title: '6. Limitation of Liability',
        content: `ResolveIQ is provided on an "as-is" and "as-available" basis for internal organizational use. The platform administrators make no warranties regarding uninterrupted access or complete accuracy of information. In no event shall the platform administrators be liable for any indirect, incidental, or consequential damages arising from your use of the system, including but not limited to loss of data or operational disruptions.`,
    },
    {
        icon: FileText,
        title: '7. Amendments to Terms',
        content: `ResolveIQ reserves the right to modify these Terms of Service at any time. Significant changes will be communicated through appropriate in-platform notices. Your continued use of the platform following any such modifications constitutes your acceptance of the updated terms. It is your responsibility to review these terms periodically.`,
    },
    {
        icon: Users,
        title: '8. Termination of Access',
        content: `Your account may be suspended or terminated by a system administrator if you violate these terms, are no longer affiliated with the organization, or if required for security reasons. Upon termination, your access to the platform and all associated data may be revoked immediately. Provisions of these terms that by their nature should survive termination shall continue to remain in effect.`,
    },
];

export default function TermsOfService() {
    return (
        <div
            className="min-h-screen font-sans"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #0f172a 100%)' }}
        >
            {/* Header */}
            <header className="sticky top-0 z-20 backdrop-blur-md border-b border-white/10" style={{ background: 'rgba(15, 23, 42, 0.85)' }}>
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center overflow-hidden">
                            <img src={appLogo} alt="ResolveIQ" className="w-7 h-7 object-contain" />
                        </div>
                        <span className="text-base font-black text-white tracking-tight uppercase">ResolveIQ</span>
                    </div>
                    <Link
                        to="/register"
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Register
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <div className="max-w-4xl mx-auto px-6 pt-14 pb-10 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Legal Document</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4">
                    Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">Service</span>
                </h1>
                <p className="text-slate-400 text-base max-w-xl mx-auto leading-relaxed">
                    Please read these terms carefully before using the ResolveIQ platform. By registering, you agree to these conditions.
                </p>
                <div className="flex items-center justify-center gap-6 mt-6 text-xs text-slate-500">
                    <span>Effective: January 1, 2025</span>
                    <span>·</span>
                    <span>Last Updated: March 2025</span>
                    <span>·</span>
                    <span>Internal Use Only</span>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-6 pb-16 space-y-4">
                {sections.map(({ icon: Icon, title, content }) => (
                    <div
                        key={title}
                        className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/[0.07] transition-colors"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                <Icon className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-black text-white mb-3 tracking-tight">{title}</h2>
                                <p className="text-slate-400 text-sm leading-relaxed">{content}</p>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Contact */}
                <div className="bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/20 rounded-2xl p-6 sm:p-8 text-center">
                    <h3 className="text-white font-black text-base mb-2">Questions or Concerns?</h3>
                    <p className="text-slate-400 text-sm mb-4">
                        If you have any queries regarding these terms or your account access, please reach out to your system administrator.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all hover:opacity-90 active:scale-95"
                        style={{ background: 'linear-gradient(135deg, #1e3a8a, #4f46e5)' }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Return to Registration
                    </Link>
                </div>
            </div>
        </div>
    );
}
