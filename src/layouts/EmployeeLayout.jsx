import React, { useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
    LayoutDashboard,
    Ticket,
    PlusCircle,
    User,
    LogOut,
    Menu,
    X,
    Bell,
    ChevronRight,
    Headphones,
} from 'lucide-react';

const navItems = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        to: '/employee/dashboard',
    },
    {
        label: 'My Tickets',
        icon: Ticket,
        to: '/employee/my-tickets',
    },
    {
        label: 'Create Ticket',
        icon: PlusCircle,
        to: '/employee/create-ticket',
    },
    {
        label: 'Settings',
        icon: User,
        to: '/employee/settings',
    },
];

export default function EmployeeLayout({ children }) {
    const [collapsed, setCollapsed] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const initials = user.full_name
        ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : 'EMP';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const SidebarContent = ({ onNav }) => (
        <div className="flex flex-col h-full">
            {/* Brand */}
            <div className={`flex items-center gap-3 px-5 py-6 border-b border-white/10 ${collapsed ? 'justify-center px-3' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <Headphones className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                    <div>
                        <span className="text-white font-bold text-lg tracking-tight leading-none">ResolveIQ</span>
                        <p className="text-blue-300 text-[10px] font-medium mt-0.5">Employee Portal</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto no-scrollbar">
                {!collapsed && (
                    <p className="text-blue-400/70 text-[10px] font-bold uppercase tracking-widest px-3 mb-3">
                        Navigation
                    </p>
                )}
                {navItems.map(({ label, icon: Icon, to }) => {
                    const active = isActive(to);
                    return (
                        <Link
                            key={to}
                            to={to}
                            onClick={onNav}
                            title={collapsed ? label : undefined}
                            className={`
                                flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm
                                transition-all duration-200 group relative
                                ${active
                                    ? 'bg-white text-primary shadow-md'
                                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                                }
                                ${collapsed ? 'justify-center' : ''}
                            `}
                        >
                            <Icon className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-primary' : ''}`} />
                            {!collapsed && <span className="flex-1">{label}</span>}
                            {!collapsed && active && (
                                <ChevronRight className="w-4 h-4 text-primary/50" />
                            )}
                            {/* Tooltip when collapsed */}
                            {collapsed && (
                                <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg
                                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-xl">
                                    {label}
                                </div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* User Profile Footer */}
            <div className={`border-t border-white/10 p-3 space-y-1`}>
                <Link
                    to="/employee/settings"
                    onClick={onNav}
                    title={collapsed ? 'Profile' : undefined}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-white/10 group
                        ${collapsed ? 'justify-center' : ''}
                        ${isActive('/employee/settings') ? 'bg-white/15' : ''}
                    `}
                >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials}
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{user.full_name || 'Employee'}</p>
                            <p className="text-blue-300 text-[10px] truncate">{user.email || ''}</p>
                        </div>
                    )}
                    {!collapsed && <User className="w-4 h-4 text-blue-300 shrink-0" />}
                </Link>

                <button
                    onClick={handleLogout}
                    title={collapsed ? 'Logout' : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-200 hover:bg-red-500/20 hover:text-red-300 transition-all text-sm font-medium group
                        ${collapsed ? 'justify-center' : ''}
                    `}
                >
                    <LogOut className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">

            {/* ── Desktop Sidebar ── */}
            <aside
                className={`
                    hidden lg:flex flex-col
                    bg-gradient-to-b from-[#1e3a8a] to-[#1e40af]
                    transition-all duration-300 ease-in-out shrink-0
                    relative shadow-2xl shadow-blue-900/30
                    ${collapsed ? 'w-[72px]' : 'w-64'}
                `}
            >
                {/* Collapse Toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-4 top-8 z-10 w-8 h-8 rounded-xl bg-white border border-gray-200 shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all hover:scale-110 active:scale-90"
                >
                    <Menu className={`w-4 h-4 text-blue-600 transition-transform ${collapsed ? '' : 'rotate-90'}`} />
                </button>

                <SidebarContent />
            </aside>

            {/* ── Mobile Sidebar Overlay ── */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-[#1e3a8a] to-[#1e40af] shadow-2xl flex flex-col">
                        <SidebarContent onNav={() => setMobileOpen(false)} />
                    </aside>
                </div>
            )}

            {/* ── Main Area ── */}
            <div className="flex flex-col flex-1 overflow-hidden">

                {/* Top Navbar */}
                <header className="bg-white border-b border-gray-100 px-4 sm:px-6 h-16 flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-3">
                        {/* Mobile hamburger */}
                        <button
                            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="w-5 h-5 text-gray-600" />
                        </button>

                        <div>
                            <h1 className="text-base font-bold text-gray-900 leading-tight">
                                {navItems.find(n => isActive(n.to))?.label ?? 'Employee Portal'}
                            </h1>
                            <p className="text-[11px] text-gray-400 leading-none">
                                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                            <Bell className="w-5 h-5 text-gray-500" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        </button>

                        <div className="h-8 w-px bg-gray-100 mx-1" />

                        <Link to="/employee/settings" className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-gray-50 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                                {initials}
                            </div>
                            <span className="hidden sm:block text-sm font-semibold text-gray-700">
                                {user.full_name?.split(' ')[0] ?? 'Employee'}
                            </span>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
