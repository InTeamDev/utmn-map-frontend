import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/Error/ErrorBoundary'
import HomePage from './pages/HomePage/HomePage'
import AdminPage from './pages/AdminPage/AdminPage'
import LoginPage from './pages/LoginPage/LoginPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import { useAuth, AuthProvider } from './services/auth/AuthContext'
import BuildingDetails from './pages/BuildingPage/BuildingPage'

const ProtectedRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? element : <Navigate to="/login" replace />
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<ProtectedRoute element={<AdminPage />} />} />
            <Route path="/admin/:buildingId" element={<ProtectedRoute element={<BuildingDetails />} />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  )
}

export default App
