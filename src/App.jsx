import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';

// Layouts
import EmployeeLayout from './layouts/EmployeeLayout';
import AdminLayout from './layouts/AdminLayout';
import TeamLeadLayout from './layouts/TeamLeadLayout';
import AgentLayout from './layouts/AgentLayout';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import CreateTicket from './pages/employee/CreateTicket';
import MyTickets from './pages/employee/MyTickets';
import TicketDetails from './pages/employee/TicketDetails';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTickets from './pages/admin/Tickets';
import AdminTicketDetails from './pages/admin/TicketDetails';
import AdminTeams from './pages/admin/Teams';
import AdminTeamDetails from './pages/admin/TeamDetails';
import AdminDepartments from './pages/admin/Departments';
import AdminGroupedTickets from './pages/admin/AdminGroupedTickets';
import AdminFilteredTickets from './pages/admin/AdminFilteredTickets';

// Team Lead Pages
import TeamLeadDashboard from './pages/teamlead/Dashboard';

// Agent Pages
import AgentDashboard from './pages/agent/Dashboard';

// Protected Route — checks token AND role
const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (!token) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* ── Public ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Employee ── */}
        <Route path="/employee" element={<ProtectedRoute role="EMPLOYEE"><EmployeeLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="create-ticket" element={<CreateTicket />} />
          <Route path="my-tickets" element={<MyTickets />} />
          <Route path="ticket/:id" element={<TicketDetails />} />
        </Route>

        {/* ── Admin ── */}
        <Route path="/admin" element={<ProtectedRoute role="ADMIN"><AdminLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="tickets/:id" element={<AdminTicketDetails />} />
          <Route path="grouped-tickets" element={<AdminGroupedTickets />} />
          <Route path="filtered-tickets/:type/:id" element={<AdminFilteredTickets />} />
          <Route path="teams" element={<AdminTeams />} />
          <Route path="teams/:id" element={<AdminTeamDetails />} />
          <Route path="departments" element={<AdminDepartments />} />
        </Route>

        {/* ── Team Lead ── */}
        <Route path="/team-lead" element={<ProtectedRoute role="TEAM_LEAD"><TeamLeadLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeamLeadDashboard />} />
        </Route>

        {/* ── Agent ── */}
        <Route path="/agent" element={<ProtectedRoute role="AGENT"><AgentLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AgentDashboard />} />
        </Route>

        {/* ── Default ── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
