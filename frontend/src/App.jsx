import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Nav from './components/Nav'
import HomePage        from './pages/HomePage'
import LoginPage       from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import DashboardPage   from './pages/DashboardPage'
import CreateCommunityPage from './pages/CreateCommunityPage'
import CommunityPage   from './pages/CommunityPage'
import ManagePage      from './pages/ManagePage'
import CustomsPage     from './pages/CustomsPage'
import CreateSessionPage from './pages/CreateSessionPage'
import SessionPage     from './pages/SessionPage'
import ControlPage     from './pages/ControlPage'
import NotFoundPage    from './pages/NotFoundPage'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="spinner" style={{ marginTop: '80px' }} />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

function AppRoutes() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/"                                       element={<HomePage />} />
        <Route path="/login"                                  element={<LoginPage />} />
        <Route path="/auth/callback"                          element={<AuthCallbackPage />} />
        <Route path="/dashboard"                              element={<RequireAuth><DashboardPage /></RequireAuth>} />
        <Route path="/create"                                 element={<RequireAuth><CreateCommunityPage /></RequireAuth>} />
        <Route path="/c/:slug"                                element={<CommunityPage />} />
        <Route path="/c/:slug/manage"                         element={<RequireAuth><ManagePage /></RequireAuth>} />
        <Route path="/c/:slug/customs"                        element={<CustomsPage />} />
        <Route path="/c/:slug/sessions/new"                   element={<RequireAuth><CreateSessionPage /></RequireAuth>} />
        <Route path="/c/:slug/sessions/:sessionId"            element={<RequireAuth><SessionPage /></RequireAuth>} />
        <Route path="/c/:slug/sessions/:sessionId/control"    element={<RequireAuth><ControlPage /></RequireAuth>} />
        <Route path="*"                                       element={<NotFoundPage />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
