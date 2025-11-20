import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<UserRole>('admin');
  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login(activeTab);
      toast.success('Login successful! Redirecting...');
      navigate('/');
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
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
            <CardTitle>Select Your Role</CardTitle>
            <CardDescription>Choose your role to access the appropriate dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="admin"
              className="w-full"
              onValueChange={(value) => setActiveTab(value as UserRole)}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="client">Client</TabsTrigger>
              </TabsList>
              <TabsContent value="admin" className="pt-6">
                <Button
                  onClick={handleLogin}
                  className="w-full h-11 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    `Sign In as Admin`
                  )}
                </Button>
              </TabsContent>
              <TabsContent value="client" className="pt-6">
                <Button
                  onClick={handleLogin}
                  className="w-full h-11 text-base"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    `Sign In as Client`
                  )}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}