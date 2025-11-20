import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/services/auth';

export function HomePage() {
  const navigate = useNavigate();
  const { checkSession, isAuthenticated, user } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await checkSession();
      } catch (error) {
        console.error("Session check failed, redirecting to login.", error);
      } finally {
        setIsChecking(false);
      }
    };
    init();
  }, [checkSession]);

  useEffect(() => {
    if (isChecking) {
      return; // Wait for the session check to complete
    }

    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/client/dashboard', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, [isChecking, isAuthenticated, user, navigate]);

  // Render a loading indicator while the session is being checked.
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 bg-primary rounded-xl" />
        <p className="text-muted-foreground text-sm">Loading MotionPine OS...</p>
      </div>
    </div>
  );
}