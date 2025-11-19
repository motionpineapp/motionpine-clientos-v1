import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/services/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
interface ProtectedRouteProps {
  role?: 'admin' | 'client';
}
export function ProtectedRoute({ role }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary rounded-xl" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role && user?.role !== role) {
    // Redirect to correct dashboard if wrong role
    return <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard'} replace />;
  }
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}