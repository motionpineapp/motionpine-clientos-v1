import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/services/auth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Loader2 } from 'lucide-react';
interface ProtectedRouteProps {
  role?: 'admin' | 'client';
}
function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary rounded-xl flex items-center justify-center animate-pulse">
             <span className="text-white font-bold text-2xl">M</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Checking session...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
export function ProtectedRoute({ role }: ProtectedRouteProps) {
  // A check to ensure Router context is available. This is a bit of a workaround for edge cases.
  if (typeof window !== 'undefined' && !(window as any).__REACT_ROUTER_CONTEXT__) {
    return <LoadingFallback />;
  }
  // Hooks are now at the top-level, called unconditionally.
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);
  useEffect(() => {
    // Logic is deferred to useEffect.
    if (isLoading) {
      return;
    }
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    if (role && user?.role !== role) {
      const correctDashboard = user.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
      navigate(correctDashboard, { replace: true });
    }
  }, [isAuthenticated, user, isLoading, role, navigate]);
  if (isLoading) {
    return <LoadingFallback />;
  }
  if (!isAuthenticated) {
    // Use Navigate component for declarative redirect instead of returning null
    return <Navigate to="/login" replace />;
  }
  if (role && user?.role !== role) {
    // While useEffect handles navigation, returning null prevents rendering children prematurely.
    return null;
  }
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}