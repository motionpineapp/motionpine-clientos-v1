import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
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
  // Hooks are now at the top-level, called unconditionally.
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const isLoading = useAuthStore(s => s.isLoading);



  useEffect(() => {
    // Ensure session check runs on mount (useful for deep-link refreshes)
    const s = useAuthStore.getState();
    if (typeof s?.checkSession === 'function') {
      s.checkSession();
    }
    // Fallback: if isLoading gets stuck, attempt to clear it after 5s
    const timeout = setTimeout(() => {
      const cur = useAuthStore.getState();
      if (cur?.isLoading) {
        // useAuthStore.setState ensures we don't rely on possibly-undefined helper methods
        useAuthStore.setState({ isLoading: false } as any);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, []);
  if (isLoading) {
    return <LoadingFallback />;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role && user?.role !== role) {
    const correctDashboard = user?.role === 'admin' ? '/admin/dashboard' : '/client/dashboard';
    return <Navigate to={correctDashboard} replace />;
  }
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}