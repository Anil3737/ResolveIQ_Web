import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import Login from './pages/Login';
import Register from './pages/Register';
import TermsOfService from './pages/TermsOfService';

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
import TicketWaiting from './pages/employee/TicketWaiting';
import TicketSuccess from './pages/employee/TicketSuccess';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminTickets from './pages/admin/Tickets';
import AdminTicketDetails from './pages/admin/TicketDetails';
import AdminTeams from './pages/admin/Teams';
import AdminTeamDetails from './pages/admin/TeamDetails';
import AdminDepartments from './pages/admin/Departments';
import AdminGroupedTickets from './pages/admin/AdminGroupedTickets';
import AdminUsers from './pages/admin/Users';
import AdminFilteredTickets from './pages/admin/AdminFilteredTickets';
import AdminActivity from './pages/admin/Activity';
import AdminEscalations from './pages/admin/Escalations';
import AdminReports from './pages/admin/Reports';
import SLAPolicies from './pages/admin/SLAPolicies';
import CreateStaff from './pages/admin/CreateStaff';

// Team Lead Pages
import TeamLeadDashboard from './pages/teamlead/Dashboard';
import TeamLeadTickets from './pages/teamlead/Tickets';
import TeamLeadTeam from './pages/teamlead/Team';
import TeamLeadAssign from './pages/teamlead/Assign';
import TeamLeadTicketDetails from './pages/teamlead/TicketDetails';
import PerformanceAnalytics from './pages/teamlead/PerformanceAnalytics';

// Agent Pages
import AgentDashboard from './pages/agent/Dashboard';
import AgentTickets from './pages/agent/Tickets';
import AgentTicketDetails from './pages/agent/AgentTicketDetails';

// Common
import Settings from './pages/common/Settings';
import ChangePassword from './pages/common/ChangePassword';

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
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

        {/* ── Employee ── */}
        <Route path="/employee" element={<ProtectedRoute role="EMPLOYEE"><EmployeeLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<EmployeeDashboard />} />
          <Route path="create-ticket" element={<CreateTicket />} />
          <Route path="my-tickets" element={<MyTickets />} />
          <Route path="ticket/:id" element={<TicketDetails />} />
          <Route path="waiting" element={<TicketWaiting />} />
          <Route path="success" element={<TicketSuccess />} />
          <Route path="settings" element={<Settings />} />
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
          <Route path="users" element={<AdminUsers />} />
          <Route path="activity" element={<AdminActivity />} />
          <Route path="escalations" element={<AdminEscalations />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="risk" element={<SLAPolicies />} />
          <Route path="create-staff" element={<CreateStaff />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ── Team Lead ── */}
        <Route path="/team-lead" element={<ProtectedRoute role="TEAM_LEAD"><TeamLeadLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeamLeadDashboard />} />
          <Route path="tickets" element={<TeamLeadTickets />} />
          <Route path="tickets/:id" element={<TeamLeadTicketDetails />} />
          <Route path="team" element={<TeamLeadTeam />} />
          <Route path="performance" element={<PerformanceAnalytics />} />
          <Route path="assign" element={<TeamLeadAssign />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ── Agent ── */}
        <Route path="/agent" element={<ProtectedRoute role="AGENT"><AgentLayout /></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AgentDashboard />} />
          <Route path="queue" element={<AgentTickets />} />
          <Route path="resolved" element={<AgentTickets />} />
          <Route path="tickets/:id" element={<AgentTicketDetails />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* ── Default ── */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
