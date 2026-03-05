import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Ticket,
    Users,
    Building2,
    UsersRound,
    ShieldAlert,
    LogOut,
    Menu,
    Bell,
    ChevronRight,
    Shield,
    Settings,
    History,
    BarChart3,
    UserPlus,
    ChevronDown,
    AlertCircle
} from 'lucide-react';

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, to: '/admin/dashboard' },
    { label: 'Tickets', icon: Ticket, to: '/admin/grouped-tickets' },
    { label: 'Teams', icon: UsersRound, to: '/admin/teams' },
    { label: 'Employees', icon: Users, to: '/admin/users' },
    { label: 'System Activity', icon: History, to: '/admin/activity' },
];

const secondaryNavItems = [
    { label: 'SLA Engine', icon: ShieldAlert, to: '/admin/risk' },
    { label: 'Escalations', icon: Bell, to: '/admin/escalations' },
    { label: 'Reports', icon: BarChart3, to: '/admin/reports' },
    { label: 'Settings', icon: Settings, to: '/admin/settings' },
];

export default function AdminLayout({ children }) {
    const [collapsed, setCollapsed] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [staffOpen, setStaffOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const initials = user.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'AD';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const SidebarContent = ({ onNav }) => (
        <div className="flex flex-col h-full bg-[#1e1e2e]">
            {/* Brand */}
            <div className={`flex items-center gap-3 px-5 py-6 border-b border-white/5 ${collapsed ? 'justify-center px-3' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                    <Shield className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div>
                        <span className="text-white font-bold text-lg tracking-tight leading-none">ResolveIQ</span>
                        <p className="text-purple-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Admin Console</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto no-scrollbar">
                {!collapsed && (
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">
                        Management
                    </p>
                )}

                {/* Main Nav Items */}
                {navItems.map(({ label, icon: Icon, to }) => {
                    const active = isActive(to);
                    return (
                        <Link
                            key={to} to={to} onClick={onNav}
                            title={collapsed ? label : undefined}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm
                                transition-all duration-200 group relative
                                ${active ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                                ${collapsed ? 'justify-center' : ''}`}
                        >
                            <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                            {!collapsed && <span className="flex-1">{label}</span>}
                            {collapsed && (
                                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg
                                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                                    {label}
                                </div>
                            )}
                        </Link>
                    );
                })}

                {/* Create Staff Accordion */}
                <div className="pt-2">
                    <button
                        onClick={() => !collapsed && setStaffOpen(!staffOpen)}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm
                            transition-all duration-200 group relative
                            ${staffOpen ? 'text-white bg-white/5' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                            ${collapsed ? 'justify-center cursor-default' : ''}`}
                    >
                        <UserPlus className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="flex-1 text-left">Create Staff</span>}
                        {!collapsed && (
                            <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${staffOpen ? 'rotate-180' : ''}`} />
                        )}
                        {collapsed && (
                            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg
                                opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                                Create Staff (Expand to see)
                            </div>
                        )}
                    </button>

                    {!collapsed && staffOpen && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                            <Link to="/admin/create-staff?role=TEAM_LEAD" onClick={onNav}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                                • Lead
                            </Link>
                            <Link to="/admin/create-staff?role=AGENT" onClick={onNav}
                                className="block px-3 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
                                • Agent
                            </Link>
                        </div>
                    )}
                </div>

                {!collapsed && (
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest px-3 mb-3 mt-6">
                        System
                    </p>
                )}

                {/* Secondary Items */}
                {secondaryNavItems.map(({ label, icon: Icon, to }) => {
                    const active = isActive(to);
                    return (
                        <Link
                            key={to} to={to} onClick={onNav}
                            title={collapsed ? label : undefined}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm
                                transition-all duration-200 group relative
                                ${active ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                                ${collapsed ? 'justify-center' : ''}`}
                        >
                            <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
                            {!collapsed && <span className="flex-1">{label}</span>}
                            {collapsed && (
                                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg
                                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl border border-white/10">
                                    {label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="border-t border-white/5 p-3 space-y-1">
                <div className={`flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/[0.02] border border-white/[0.05] ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-lg">
                        {initials}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-bold truncate">{user.full_name || 'Admin'}</p>
                            <p className="text-gray-500 text-[10px] font-medium truncate">{user.email || ''}</p>
                        </div>
                    )}
                </div>
                <button onClick={handleLogout} title={collapsed ? 'Logout' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-sm font-bold group ${collapsed ? 'justify-center' : ''}`}>
                    <LogOut className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className={`hidden lg:flex flex-col bg-gradient-to-b from-[#4c1d95] to-[#6d28d9]
                transition-all duration-300 ease-in-out shrink-0 relative shadow-2xl shadow-purple-900/30
                ${collapsed ? 'w-[72px]' : 'w-64'}`}>
                <button onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-4 top-8 z-10 w-8 h-8 rounded-xl bg-white border border-gray-200 shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 active:scale-90">
                    <Menu className={`w-4 h-4 text-purple-600 transition-transform ${collapsed ? '' : 'rotate-90'}`} />
                </button>
                <SidebarContent />
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-[#4c1d95] to-[#6d28d9] shadow-2xl flex flex-col">
                        <SidebarContent onNav={() => setMobileOpen(false)} />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex flex-col flex-1 overflow-hidden">
                <header className="bg-white border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(true)}>
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-base font-bold text-gray-900 leading-tight">
                                {navItems.find(n => isActive(n.to))?.label ?? 'Admin Console'}
                            </h1>
                            <p className="text-[11px] text-gray-400 leading-none">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="relative p-2 rounded-xl hover:bg-gray-100">
                            <Bell className="w-5 h-5 text-gray-500" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        </button>
                        <div className="h-8 w-px bg-gray-100 mx-1" />
                        <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {initials}
                            </div>
                            <span className="hidden sm:block text-sm font-semibold text-gray-700">
                                {user.full_name?.split(' ')[0] ?? 'Admin'}
                            </span>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto"><Outlet /></main>
            </div>
        </div>
    );
}
