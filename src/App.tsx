import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/admin/AdminDashboard';
import UserDashboard from './components/user/UserDashboard';
import ResultDetail from './components/user/ResultDetail';
import PosterView from './components/user/PosterView';
import Leaderboard from './components/user/Leaderboard';

function PrivateRoute({ children, adminOnly = false }: { children: React.ReactNode, adminOnly?: boolean }) {
  const { user, profile, loading, isAdmin } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" />;
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          <Route path="/admin/*" element={
            <PrivateRoute adminOnly>
              <AdminDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          } />
          
          <Route path="/result/:id" element={
            <PrivateRoute>
              <ResultDetail />
            </PrivateRoute>
          } />

          <Route path="/poster/:id" element={
            <PrivateRoute>
              <PosterView />
            </PrivateRoute>
          } />

          <Route path="/leaderboard" element={
            <PrivateRoute>
              <Leaderboard />
            </PrivateRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
