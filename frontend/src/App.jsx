import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DataProvider } from './context/DataContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PublicLayout } from './components/layout/PublicLayout'
import { AuthLayout } from './components/layout/AuthLayout'
import { AppLayout } from './components/layout/AppLayout'
import { LandingPage } from './pages/public/LandingPage'
import { HowItWorksPage } from './pages/public/HowItWorksPage'
import { AuthPage } from './pages/auth/AuthPage'
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage'
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage'
import { UnauthorizedPage } from './pages/auth/UnauthorizedPage'
import { DashboardPage } from './pages/app/DashboardPage'
import { AdminPage } from './pages/app/AdminPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { NewScanPage } from './pages/app/NewScanPage'
import { ScanProgressPage } from './pages/app/ScanProgressPage'
import { SettingsPage } from './pages/app/SettingsPage'
import './styles/app.css'

// Scroll to top on navigation, or to the #anchor when the URL has one
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(hash.slice(1))
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' })
        return
      }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public marketing site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
      </Route>

      {/* Auth: split layout */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/forgot-password" element={<AuthPage mode="forgot" />} />
        {/* Opened from the reset email link */}
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* Signed in, but email not confirmed yet */}
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* Signed-in app: login + verified email required */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/scans/new" element={<NewScanPage />} />
        <Route path="/scans/:scanId/progress" element={<ScanProgressPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <DataProvider>
          <ScrollManager />
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
