import React, { useState } from 'react';
import { useAuthStore } from '@/services/auth';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Lock, Bell, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/FileUpload';

export function SettingsPage() {
    const user = useAuthStore(s => s.user);
    const updateProfile = useAuthStore(s => s.updateProfile);
    const [isLoading, setIsLoading] = useState(false);

    // Local state for form fields
    const [name, setName] = useState(user?.name || '');
    const [company, setCompany] = useState(user?.company || '');

    // Update local state when user changes (e.g. on initial load or re-fetch)
    React.useEffect(() => {
        if (user) {
            setName(user.name);
            setCompany(user.company || '');
        }
    }, [user]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await updateProfile({ name, company });
            toast.success('Settings saved successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
            <div className="space-y-8 animate-fade-in max-w-4xl">
                <PageHeader
                    title="Settings"
                    description="Manage your account preferences and security settings."
                />
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:w-[400px] mb-8">
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Lock className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="h-4 w-4" />
                            Notifications
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="profile" className="space-y-6">
                        <Card className="border-gray-100 shadow-sm">
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal details and public profile.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <Avatar className="h-20 w-20 border-4 border-gray-50">
                                        <AvatarImage src={user?.avatar} />
                                        <AvatarFallback className="text-xl">{user?.name?.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2">
                                        <FileUpload
                                            accept="image/*"
                                            maxSize={2}
                                            showPreview={false}
                                            onUploadComplete={(url) => {
                                                updateProfile({ avatar: url });
                                                toast.success('Avatar updated successfully');
                                            }}
                                            className="w-full max-w-xs"
                                        />
                                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. Max size of 2MB</p>
                                    </div>
                                </div>
                                <Separator />
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input id="email" defaultValue={user?.email} disabled className="bg-gray-50" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Input id="role" defaultValue={user?.role} disabled className="bg-gray-50 capitalize" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="company">Company</Label>
                                        <Input
                                            id="company"
                                            value={company}
                                            onChange={(e) => setCompany(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-gray-50/50 border-t border-gray-100 flex justify-end p-4">
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>
                    <TabsContent value="security" className="space-y-6">
                        <Card className="border-gray-100 shadow-sm">
                            <CardHeader>
                                <CardTitle>Password & Security</CardTitle>
                                <CardDescription>Manage your password and security preferences.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="current-password">Current Password</Label>
                                    <Input id="current-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">New Password</Label>
                                    <Input id="new-password" type="password" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                                    <Input id="confirm-password" type="password" />
                                </div>
                            </CardContent>
                            <CardFooter className="bg-gray-50/50 border-t border-gray-100 flex justify-end p-4">
                                <Button onClick={handleSave} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Password
                                </Button>
                            </CardFooter>
                        </Card>
                        <Card className="border-red-100 shadow-sm bg-red-50/10">
                            <CardHeader>
                                <CardTitle className="text-red-600 flex items-center gap-2">
                                    <Shield className="h-5 w-5" />
                                    Danger Zone
                                </CardTitle>
                                <CardDescription>Irreversible actions for your account.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                                    Deactivate Account
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="notifications">
                        <Card className="border-gray-100 shadow-sm">
                            <CardHeader>
                                <CardTitle>Notification Preferences</CardTitle>
                                <CardDescription>Choose what you want to be notified about.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center py-8 text-muted-foreground">
                                Notification settings coming soon...
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}