import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ErrorBoundary from './components/Error/ErrorBoundary'
import HomePage from './pages/HomePage/HomePage'
import AdminPage from './pages/AdminPage/AdminPage'
import LoginPage from './pages/LoginPage/LoginPage'
import NotFoundPage from './pages/NotFoundPage/NotFoundPage'
import { useAuth, AuthProvider } from './services/auth/AuthContext'
import BuildingDetails from './pages/BuildingPage/AdminBuildingPage'
import BuildingsPage from './pages/BuildingsPage/BuildingsPage'
import GraphPage from './pages/GraphPage'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<BuildingsPage />} />
            <Route path="/building/:buildingId" element={<HomePage />} />
            <Route path="/graph" element={<GraphPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/:buildingId"
              element={
                <ProtectedRoute>
                  <BuildingDetails />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/building/:buildingId/object/:objectId" element={<HomePage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  )
}

export default App
