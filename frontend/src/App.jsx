import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Import actual components
const HomePage = React.lazy(() => import('./pages/HomePage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const VendorListingPage = React.lazy(() => import('./pages/VendorListingPage'));
const VendorProfilePage = React.lazy(() => import('./pages/VendorProfilePage'));
const FeedbackPage = React.lazy(() => import('./pages/FeedbackPage'));
const AdminPage = React.lazy(() => import('./pages/AdminPage'));
const EditProfilePage = React.lazy(() => import('./pages/EditProfilePage'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    <span className="ml-3">Loading...</span>
  </div>
);

function App() {
  const location = useLocation();
  
  useEffect(() => {
    console.log(`🔗 Route changed to: ${location.pathname}`);
  }, [location]);

  return (
    <React.Suspense fallback={<LoadingFallback />}>
      <Layout>
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/vendors" element={<VendorListingPage />} />
          <Route path="/vendor/:id" element={<VendorProfilePage />} />
          <Route path="/vendor/:id/feedback" element={<FeedbackPage />} />
          <Route path="/admin" element={<AdminPage />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          
          <Route path="/profile/edit" element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          } />
          
          {/* Redirect unknown routes to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </React.Suspense>
  );
}

export default App;