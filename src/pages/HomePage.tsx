import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/services/auth';
import { Loader2 } from 'lucide-react';
export function HomePage() {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);
  useEffect(() => {
    const init = async () => {
      try {
        // This checkSession now happens after the component has mounted,
        // ensuring all contexts (like Router) are available.
        await useAuthStore.getState().checkSession();
      } catch (error) {
        console.error("Session check failed, redirecting to login.", error);
      } finally {
        // Now we can safely access the store state and navigate.
        const { isAuthenticated, user } = useAuthStore.getState();
        if (isAuthenticated && user) {
          if (user.role === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/client/dashboard', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
        setIsChecking(false); // This state is mostly for showing a loader, navigation is immediate.
      }
    };
    init();
  }, [navigate]);
  // Render a loading indicator while the session is being checked.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading MotionPine OS...</p>
        </div>
      </div>
    </div>
  );
}