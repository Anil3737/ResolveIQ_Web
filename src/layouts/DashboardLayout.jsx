export default function DashboardLayout({ children }) {
    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white p-4">
                <h2 className="text-xl font-bold mb-6">ResolveIQ</h2>
                <nav className="space-y-2">
                    <p className="text-gray-300 cursor-pointer">Dashboard</p>
                    <p className="text-gray-300 cursor-pointer">Tickets</p>
                    <p className="text-gray-300 cursor-pointer">SLA</p>
                    <p className="text-gray-300 cursor-pointer">Reports</p>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}