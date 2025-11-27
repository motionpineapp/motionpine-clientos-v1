import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuthStore } from '@/services/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(1, { message: "Password is required." }),
});

const setupSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    company: z.string().min(2, { message: "Company name must be at least 2 characters." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type SetupFormValues = z.infer<typeof setupSchema>;

export function LoginPage() {
    const navigate = useNavigate();
    const login = useAuthStore(s => s.login);
    const [checkingSetup, setCheckingSetup] = useState(true);
    const [needsSetup, setNeedsSetup] = useState(false);

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    });

    const setupForm = useForm<SetupFormValues>({
        resolver: zodResolver(setupSchema),
        defaultValues: { name: "", company: "", email: "", password: "" },
    });

    useEffect(() => {
        const checkSetup = async () => {
            try {
                const res = await fetch('/api/auth/setup-status', {
                    cache: 'no-store',
                    headers: {
                        'Cache-Control': 'no-cache, no-store, must-revalidate',
                        'Pragma': 'no-cache',
                        'Expires': '0'
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    console.log('Setup status:', data); // Debug log
                    setNeedsSetup(!data.isSetup);
                }
            } catch (error) {
                console.error('Failed to check setup status:', error);
            } finally {
                setCheckingSetup(false);
            }
        };
        checkSetup();
    }, []);

    const onLoginSubmit = async (data: LoginFormValues) => {
        try {
            await login(data.email, data.password);
            toast.success('Login successful! Redirecting...');
            navigate('/');
        } catch (error: any) {
            console.warn('Login attempt failed:', { email: data.email, error: error.message });
            if (error instanceof Error && (error.message.includes('Invalid credentials') || error.message.includes('not found'))) {
                toast.error('Invalid email or password.');
            } else {
                toast.error('Login failed. Please try again later.');
            }
        }
    };

    const onSetupSubmit = async (data: SetupFormValues) => {
        try {
            const res = await fetch('/api/auth/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Setup failed');
            }

            // Auto login after setup
            await login(data.email, data.password);
            toast.success('Setup complete! Welcome to MotionPine.');
            navigate('/');
        } catch (error: any) {
            toast.error(error.message || 'Setup failed. Please try again.');
        }
    };

    if (checkingSetup) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
            <div className="w-full max-w-md space-y-8">
                <motion.div
                    className="text-center space-y-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="h-12 w-12 bg-primary rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/20">
                        <span className="text-white font-bold text-2xl">M</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">MotionPine OS</h1>
                    <p className="text-muted-foreground">
                        {needsSetup ? 'Create your admin account' : 'Sign in to your workspace'}
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card className="border-gray-100 shadow-xl shadow-gray-200/50">
                        <CardHeader>
                            <CardTitle>{needsSetup ? 'First-Run Setup' : 'Welcome Back'}</CardTitle>
                            <CardDescription>
                                {needsSetup
                                    ? 'Set up your admin credentials to get started.'
                                    : 'Enter your credentials to access your dashboard.'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {needsSetup ? (
                                <Form {...setupForm}>
                                    <form onSubmit={setupForm.handleSubmit(onSetupSubmit)} className="space-y-4">
                                        <FormField
                                            control={setupForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="John Doe" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={setupForm.control}
                                            name="company"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Company Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Acme Inc." {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={setupForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="name@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={setupForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full h-11 text-base" disabled={setupForm.formState.isSubmitting}>
                                            {setupForm.formState.isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Creating Account...
                                                </>
                                            ) : (
                                                'Create Admin Account'
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            ) : (
                                <Form {...loginForm}>
                                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                                        <FormField
                                            control={loginForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email Address</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="name@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={loginForm.control}
                                            name="password"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="submit" className="w-full h-11 text-base" disabled={loginForm.formState.isSubmitting}>
                                            {loginForm.formState.isSubmitting ? (
                                                <>
                                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                                    Signing in...
                                                </>
                                            ) : (
                                                'Sign In'
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}