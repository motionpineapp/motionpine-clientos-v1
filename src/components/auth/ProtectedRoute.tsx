import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/services/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
interface ProtectedRouteProps {
  role?: 'admin' | 'client';
}
export function ProtectedRoute({ role }: ProtectedRouteProps) {
  // Hooks are called unconditionally at the top level.
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);
  // Conditional rendering logic happens after hooks.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
            <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-primary rounded-xl" />
            <p className="text-muted-foreground text-sm">Loading...</p>
            </div>
        </div>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role && user?.role !== role) {
    // Redirect to the correct dashboard if the role doesn't match.
    const correctDashboard = user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
    return <Navigate to={correctDashboard} replace />;
  }
  // Only render the protected layout and its children (Outlet) if authentication is successful.
  // This ensures any child component (like ClientDashboard) and its hooks (like useNavigate)
  // are rendered within the necessary Router context.
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}