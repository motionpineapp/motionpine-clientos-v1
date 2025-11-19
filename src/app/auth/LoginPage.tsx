import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const isLoading = useAuthStore(s => s.isLoading);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    try {
      await login(email, role);
      toast.success(`Welcome back, ${role === 'admin' ? 'Admin' : 'Client'}!`);
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };
  // Demo helper
  const fillDemo = (demoRole: UserRole) => {
    setRole(demoRole);
    setEmail(demoRole === 'admin' ? 'admin@motionpine.com' : 'client@motionpine.com');
    setPassword('password123');
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="w-full max-w-md space-y-8 animate-scale-in">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-2xl">M</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">MotionPine OS</h1>
          <p className="text-muted-foreground">Sign in to your workspace</p>
        </div>
        <Card className="border-gray-100 shadow-xl shadow-gray-200/50">
          <CardHeader>
            <CardTitle>Authentication</CardTitle>
            <CardDescription>Enter your credentials to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(v) => setRole(v as UserRole)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="client">Client</TabsTrigger>
              </TabsList>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="name@company.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="bg-gray-50/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="bg-gray-50/50"
                  />
                </div>
                <Button type="submit" className="w-full h-11 text-base" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </Tabs>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 border-t bg-gray-50/50 p-6">
            <p className="text-xs text-center text-muted-foreground mb-2">
              For demonstration purposes:
            </p>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" size="sm" onClick={() => fillDemo('admin')}>
                Fill Admin
              </Button>
              <Button variant="outline" size="sm" onClick={() => fillDemo('client')}>
                Fill Client
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}