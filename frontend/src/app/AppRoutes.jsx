import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spinner } from '../shared/components/common/Spinner';

const LandingPage = lazy(() => import('../features/landing/pages/LandingPage'));
const DashboardPage = lazy(() => import('../features/dashboard/pages/DashboardPage'));
const DocumentsPage = lazy(() => import('../features/documents/pages/DocumentsPage'));
const CollectionsPage = lazy(() => import('../features/collections/pages/CollectionsPage'));
const ProfilePage = lazy(() => import('../features/profile/pages/ProfilePage'));
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage'));
const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('../features/auth/pages/RegisterPage'));
const CollectionDetailPage = lazy(() => import('../features/collections/pages/CollectionDetailPage'));


function AppRoutes() {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/collections/:collectionId" element={<CollectionDetailPage />} />
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;