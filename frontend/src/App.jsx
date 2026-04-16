/**
 * App - root component with AuthProvider and routing.
 *
 * Routes:
 * - /login        - Login page (redirects to dashboard if already authenticated)
 * - /             - Employee dashboard (Employee role)
 * - /tickets      - My Tickets (Employee role)
 * - /tickets/new  - Create Ticket (Employee role)
 * - /it           - IT dashboard (IT role)
 * - /admin        - Admin dashboard (Admin role)
 * - /unauthorized - Access denied (403)
 *
 * All dashboards use Layout (Sidebar + Topbar) and are protected.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout from './components/layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginRedirect from './components/LoginRedirect'
import Login from './pages/Login'
import Register from './pages/Register'
import EmployeeDashboard from './pages/employee/EmployeeDashboard'
import MyTickets from './pages/employee/MyTickets'
import CreateTicket from './pages/employee/CreateTicket'
import ITDashboard from './pages/it/ITDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import KnowledgeBase from './pages/knowledge/KnowledgeBase'
import AddArticle from './pages/knowledge/AddArticle'
import Unauthorized from './pages/Unauthorized'
import TicketDetail from './pages/TicketDetail'
import MyLeaves from './pages/leave/MyLeaves'
import ApplyLeave from './pages/leave/ApplyLeave'
import LeaveApprovals from './pages/leave/LeaveApprovals'
import Announcements from './pages/announcements/Announcements'
import CreateAnnouncement from './pages/announcements/CreateAnnouncement'
import EmployeeDirectory from './pages/directory/EmployeeDirectory'
import Calendar from './pages/calendar/Calendar'
import AddEvent from './pages/calendar/AddEvent'
import Policies from './pages/policies/Policies'
import PolicyDetail from './pages/policies/PolicyDetail'
import AddPolicy from './pages/policies/AddPolicy'
import About from './pages/about/About'
import Upcoming from './pages/upcoming/Upcoming'
import AddUpcoming from './pages/upcoming/AddUpcoming'
import MeetingRooms from './pages/meeting-rooms/MeetingRooms'
import BookRoom from './pages/meeting-rooms/BookRoom'
import AddRoom from './pages/meeting-rooms/AddRoom'
import Cafeteria from './pages/cafeteria/Cafeteria'
import ManageMenu from './pages/cafeteria/ManageMenu'
import EmergencyContacts from './pages/emergency/EmergencyContacts'
import Transport from './pages/transport/Transport'
import Analytics from './pages/admin/Analytics'
import Chat from './pages/chat/Chat'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Login - redirect to dashboard if already authenticated */}
          <Route
            path="/login"
            element={
              <LoginRedirect>
                <Login />
              </LoginRedirect>
            }
          />

          {/* Register - redirect to dashboard if already authenticated */}
          <Route
            path="/register"
            element={
              <LoginRedirect>
                <Register />
              </LoginRedirect>
            }
          />

          {/* Unauthorized (403) - no auth required */}
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Employee routes - /, /tickets, /tickets/new */}
          <Route
            path="/"
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <Layout>
                  <EmployeeDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <Layout>
                  <MyTickets />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/new"
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <Layout>
                  <CreateTicket />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <TicketDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Leave - Employee: My Leaves + Apply; IT/Admin: Approvals */}
          <Route
            path="/leaves"
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <Layout>
                  <MyLeaves />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaves/apply"
            element={
              <ProtectedRoute allowedRoles={['Employee']}>
                <Layout>
                  <ApplyLeave />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaves/approvals"
            element={
              <ProtectedRoute allowedRoles={['IT', 'Admin']}>
                <Layout>
                  <LeaveApprovals />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Announcements - all roles; Create for Admin/IT */}
          <Route
            path="/announcements"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <Announcements />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/announcements/new"
            element={
              <ProtectedRoute allowedRoles={['IT', 'Admin']}>
                <Layout>
                  <CreateAnnouncement />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Meeting Rooms - all roles */}
          <Route
            path="/meeting-rooms"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <MeetingRooms />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meeting-rooms/book"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <BookRoom />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meeting-rooms/new"
            element={
              <ProtectedRoute allowedRoles={['IT', 'Admin']}>
                <Layout>
                  <AddRoom />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Transport - all roles */}
          <Route
            path="/transport"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <Transport />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Emergency Contacts - all roles */}
          <Route
            path="/emergency"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <EmergencyContacts />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Cafeteria - all roles */}
          <Route
            path="/cafeteria"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <Cafeteria />
                </Layout>
              </ProtectedRoute>
            }
          />
          {/* Cafeteria Menu - Admin/IT only */}
          <Route
            path="/cafeteria/menu"
            element={
              <ProtectedRoute allowedRoles={['IT', 'Admin']}>
                <Layout>
                  <ManageMenu />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Chat - all roles */}
          <Route
            path="/chat"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <Chat />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Employee Directory - all roles */}
          <Route
            path="/directory"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <EmployeeDirectory />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Calendar - all roles */}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <Calendar />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/calendar/new"
            element={
              <ProtectedRoute allowedRoles={['IT', 'Admin']}>
                <Layout>
                  <AddEvent />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Policies - all roles */}
          <Route
            path="/policies"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <Policies />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/policies/new"
            element={
              <ProtectedRoute allowedRoles={['IT', 'Admin']}>
                <Layout>
                  <AddPolicy />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/policies/:id"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <PolicyDetail />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* About - all roles */}
          <Route
            path="/about"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <About />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Upcoming / What's New - all roles */}
          <Route
            path="/upcoming"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <Upcoming />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/upcoming/new"
            element={
              <ProtectedRoute allowedRoles={['IT', 'Admin']}>
                <Layout>
                  <AddUpcoming />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* IT dashboard - /it */}
          <Route
            path="/it"
            element={
              <ProtectedRoute allowedRoles={['IT']}>
                <Layout>
                  <ITDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin - Analytics */}
          <Route
            path="/analytics"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Admin dashboard - /admin */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Layout>
                  <AdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Knowledge Base - all roles */}
          <Route
            path="/knowledge-base/add"
            element={
              <ProtectedRoute allowedRoles={['IT', 'Admin']}>
                <Layout>
                  <AddArticle />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge-base"
            element={
              <ProtectedRoute allowedRoles={['Employee', 'IT', 'Admin']}>
                <Layout>
                  <KnowledgeBase />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Catch-all: redirect unknown routes to login or dashboard */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
