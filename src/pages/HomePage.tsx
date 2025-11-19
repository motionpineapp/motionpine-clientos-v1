import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/services/auth';
export function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const user = useAuthStore(s => s.user);
  const checkSession = useAuthStore(s => s.checkSession);
  useEffect(() => {
    const init = async () => {
      await checkSession();
      if (isAuthenticated && user) {
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/client/dashboard', { replace: true });
        }
      } else {
        navigate('/login', { replace: true });
      }
    };
    init();
  }, [isAuthenticated, user, navigate, checkSession]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 bg-primary rounded-xl" />
        <p className="text-muted-foreground text-sm">Loading MotionPine OS...</p>
      </div>
    </div>
  );
}