import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/services/auth';
export function HomePage() {
  const navigate = useNavigate();
  const checkSession = useAuthStore(s => s.checkSession);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await checkSession();
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
      } catch (error) {
        console.error("Session check failed, redirecting to login.", error);
        navigate('/login', { replace: true });
      } finally {
        // This will only be hit if navigation does not happen, but is good practice.
        setIsLoading(false);
      }
    };
    init();
  }, [checkSession, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary rounded-xl" />
          <p className="text-muted-foreground text-sm">Loading MotionPine OS...</p>
        </div>
      </div>
    );
  }

  return null; // Should not be reached as navigation will occur
}