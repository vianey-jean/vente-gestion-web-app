import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoadingFallback from '@/components/common/LoadingFallback';
import MaintenanceChecker from '@/components/common/MaintenanceChecker';
import SecureRoute from '@/components/common/SecureRoute';
import ProtectedRoute from '@/components/common/ProtectedRoute';

// ... other imports for pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const AboutPage = lazy(() => import('@/pages/AboutPage'));
const ContactPage = lazy(() => import('@/pages/ContactPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const TendancesPage = lazy(() => import('@/pages/TendancesPage'));
const NotFound = lazy(() => import('@/pages/NotFound'));

const AppointmentsPage = lazy(() => import('@/pages/AppointmentsPage'));

// Secure routes map (example)
const secureRoutes = new Map([
  ['/dashboard', '/dashboard'],
  ['/tendances', '/tendances'],
  ['/rendez-vous', '/rendez-vous'],
  // ... other secure routes
]);

const AppRoutes: React.FC = () => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Secure routes */}
        <Route
          path={secureRoutes.get('/dashboard')?.substring(1)}
          element={
            <MaintenanceChecker>
              <SecureRoute>
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              </SecureRoute>
            </MaintenanceChecker>
          }
        />
        <Route
          path={secureRoutes.get('/tendances')?.substring(1)}
          element={
            <MaintenanceChecker>
              <SecureRoute>
                <ProtectedRoute>
                  <TendancesPage />
                </ProtectedRoute>
              </SecureRoute>
            </MaintenanceChecker>
          }
        />

        {/* Route sécurisée pour la gestion des rendez-vous */}
        <Route
          path={secureRoutes.get('/rendez-vous')?.substring(1)}
          element={
            <MaintenanceChecker>
              <SecureRoute>
                <ProtectedRoute>
                  <AppointmentsPage />
                </ProtectedRoute>
              </SecureRoute>
            </MaintenanceChecker>
          }
        />
        <Route path="/rendez-vous" element={<Navigate to={secureRoutes.get('/rendez-vous') || '/'} replace />} />

        {/* Not found */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
