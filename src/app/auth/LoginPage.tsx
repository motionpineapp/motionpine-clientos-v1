import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, UserRole } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, User, Shield } from 'lucide-react';
import { toast } from 'sonner';
export function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const isLoading = useAuthStore(s => s.isLoading);
  const [role, setRole] = useState<UserRole>('client');
  const handleLogin = async () => {
    try {
      await login(role);
      toast.success('Login successful! Redirecting...');
      navigate('/');
    } catch (error) {
      toast.error('Login failed. Please try again.');
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
            <CardDescription>Choose your role to access the correct dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="client" onValueChange={(value) => setRole(value as UserRole)}>
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 h-12 p-1">
                <TabsTrigger value="client" className="h-full gap-2 text-base">
                  <User className="h-4 w-4" /> Client
                </TabsTrigger>
                <TabsTrigger value="admin" className="h-full gap-2 text-base">
                  <Shield className="h-4 w-4" /> Admin
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button
              onClick={handleLogin}
              className="w-full h-12 text-lg mt-6"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                `Sign In as ${role === 'admin' ? 'Admin' : 'Client'}`
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}