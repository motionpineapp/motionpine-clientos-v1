import React, { useState } from 'react';
import { useAuthStore } from '@/services/auth';
import { useSettingsStore } from '@/services/settings';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Lock, Bell, Shield, Loader2, Palette, Globe, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { FileUpload } from '@/components/FileUpload';

export function SettingsPage() {
    const user = useAuthStore(s => s.user);
    const updateProfile = useAuthStore(s => s.updateProfile);

    const { settings, updateSettings, isLoading: isSettingsLoading } = useSettingsStore();

    const [isLoading, setIsLoading] = useState(false);

    // Local state for profile form
    const [name, setName] = useState(user?.name || '');
    const [company, setCompany] = useState(user?.company || '');

    // Local state for branding form
    const [brandingCompany, setBrandingCompany] = useState(settings.company_name);
    const [metaTitle, setMetaTitle] = useState(settings.meta_title);
    const [metaDesc, setMetaDesc] = useState(settings.meta_description);

    // Update local state when user/settings change
    React.useEffect(() => {
        if (user) {
            setName(user.name);
            setCompany(user.company || '');
        }
    }, [user]);

    React.useEffect(() => {
        setBrandingCompany(settings.company_name);
        setMetaTitle(settings.meta_title);
        setMetaDesc(settings.meta_description);
    }, [settings]);

    const handleSaveProfile = async () => {
        setIsLoading(true);
        try {
            await updateProfile({ name, company });
            toast.success('Profile saved successfully');
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error('Failed to save profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveBranding = async () => {
        setIsLoading(true);
        try {
            await updateSettings({
                company_name: brandingCompany,
                meta_title: metaTitle,
                meta_description: metaDesc
            });
            toast.success('Branding settings saved');
        } catch (error) {
            console.error('Failed to update branding:', error);
            toast.error('Failed to save branding settings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!confirm('Are you sure you want to remove your avatar?')) return;
        setIsLoading(true);
        try {
            await updateProfile({ avatar: null });
            toast.success('Avatar removed');
        } catch (error) {
            console.error('Failed to remove avatar:', error);
            toast.error('Failed to remove avatar');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveLogo = async () => {
        if (!confirm('Are you sure you want to remove the logo?')) return;
        setIsLoading(true);
        try {
            await updateSettings({ logo_url: null });
            toast.success('Logo removed');
        } catch (error) {
            console.error('Failed to remove logo:', error);
            toast.error('Failed to remove logo');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveFavicon = async () => {
        if (!confirm('Are you sure you want to remove the favicon?')) return;
        setIsLoading(true);
        try {
            await updateSettings({ favicon_url: null });
            toast.success('Favicon removed');
        } catch (error) {
            console.error('Failed to remove favicon:', error);
            toast.error('Failed to remove favicon');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
            <div className="space-y-8 animate-fade-in max-w-4xl">
                <PageHeader
                    title="Settings"
                    description="Manage your account preferences and application branding."
                />
                <Tabs defaultValue="profile" className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:w-[500px] mb-8">
                        <TabsTrigger value="profile" className="gap-2">
                            <User className="h-4 w-4" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="branding" className="gap-2">
                            <Palette className="h-4 w-4" />
                            Branding
                        </TabsTrigger>
                        <TabsTrigger value="security" className="gap-2">
                            <Lock className="h-4 w-4" />
                            Security
                        </TabsTrigger>
                        <TabsTrigger value="notifications" className="gap-2">
                            <Bell className="h-4 w-4" />
                            Notify
                        </TabsTrigger>
                    </TabsList>

                    {/* PROFILE TAB */}
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
                                        <div className="flex items-center gap-2">
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
                                            {user?.avatar && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={handleRemoveAvatar}
                                                    disabled={isLoading}
                                                    title="Remove Avatar"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
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
                                <Button onClick={handleSaveProfile} disabled={isLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* BRANDING TAB */}
                    <TabsContent value="branding" className="space-y-6">
                        <Card className="border-gray-100 shadow-sm">
                            <CardHeader>
                                <CardTitle>Application Branding</CardTitle>
                                <CardDescription>Customize the look and feel of your application.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-8">
                                {/* Logo Section */}
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-4">
                                        <Label className="text-base">Application Logo</Label>
                                        <div className="flex items-start gap-4">
                                            <div className="h-16 w-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                                                {settings.logo_url ? (
                                                    <img src={settings.logo_url} alt="Logo" className="h-full w-full object-contain" />
                                                ) : (
                                                    <span className="text-xs text-gray-400">No Logo</span>
                                                )}
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <FileUpload
                                                        accept="image/*"
                                                        maxSize={2}
                                                        showPreview={false}
                                                        onUploadComplete={(url) => {
                                                            updateSettings({ logo_url: url });
                                                            toast.success('Logo updated');
                                                        }}
                                                    />
                                                    {settings.logo_url && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={handleRemoveLogo}
                                                            disabled={isLoading}
                                                            title="Remove Logo"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">Displayed in sidebar and emails. Max 2MB.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="text-base">Favicon</Label>
                                        <div className="flex items-start gap-4">
                                            <div className="h-16 w-16 rounded-lg border border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
                                                {settings.favicon_url ? (
                                                    <img src={settings.favicon_url} alt="Favicon" className="h-8 w-8 object-contain" />
                                                ) : (
                                                    <Globe className="h-8 w-8 text-gray-300" />
                                                )}
                                            </div>
                                            <div className="space-y-2 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <FileUpload
                                                        accept="image/*"
                                                        maxSize={1}
                                                        showPreview={false}
                                                        onUploadComplete={(url) => {
                                                            updateSettings({ favicon_url: url });
                                                            toast.success('Favicon updated');
                                                        }}
                                                    />
                                                    {settings.favicon_url && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                                            onClick={handleRemoveFavicon}
                                                            disabled={isLoading}
                                                            title="Remove Favicon"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">Browser tab icon. Recommended 32x32px.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                {/* General Settings */}
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="branding-company">Company Name</Label>
                                        <Input
                                            id="branding-company"
                                            value={brandingCompany}
                                            onChange={(e) => setBrandingCompany(e.target.value)}
                                            placeholder="e.g. Acme Corp"
                                        />
                                        <p className="text-xs text-muted-foreground">Used in page titles and footer.</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* SEO Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-medium">SEO & Meta Data</h3>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="meta-title">Meta Title</Label>
                                            <Input
                                                id="meta-title"
                                                value={metaTitle}
                                                onChange={(e) => setMetaTitle(e.target.value)}
                                                placeholder="App Name - Slogan"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="meta-desc">Meta Description</Label>
                                            <Input
                                                id="meta-desc"
                                                value={metaDesc}
                                                onChange={(e) => setMetaDesc(e.target.value)}
                                                placeholder="Brief description of your app..."
                                            />
                                        </div>
                                    </div>
                                </div>

                            </CardContent>
                            <CardFooter className="bg-gray-50/50 border-t border-gray-100 flex justify-end p-4">
                                <Button onClick={handleSaveBranding} disabled={isLoading || isSettingsLoading}>
                                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Branding
                                </Button>
                            </CardFooter>
                        </Card>
                    </TabsContent>

                    {/* SECURITY TAB */}
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
                                <Button onClick={handleSaveProfile} disabled={isLoading}>
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

                    {/* NOTIFICATIONS TAB */}
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