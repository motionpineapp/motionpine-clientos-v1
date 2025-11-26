import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  FolderKanban,
  CreditCard,
  Users,
  Settings,
  LogOut,
  FileText,
  Menu,
  Wallet,
  Loader2
} from 'lucide-react';
import { useAuthStore } from '@/services/auth';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
  SidebarRail
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore(s => s.user);
  const logout = useAuthStore(s => s.logout);

  // Guard against rendering the layout without a user, which can cause hook errors.
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user.role === 'admin';

  const adminLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Clients', href: '/admin/clients' },
    { icon: FolderKanban, label: 'Projects', href: '/admin/projects' },
    { icon: MessageSquare, label: 'Chat', href: '/admin/chat' },
    { icon: CreditCard, label: 'Expenses', href: '/admin/expenses' },
    { icon: Users, label: 'Teams', href: '/admin/teams' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ];

  const clientLinks = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/client/dashboard' },
    { icon: FolderKanban, label: 'Projects', href: '/client/projects' },
    { icon: MessageSquare, label: 'Chat', href: '/client/chat' },
    { icon: FileText, label: 'Intake', href: '/client/intake' },
    { icon: Wallet, label: 'Wallet', href: '/client/wallet' },
    { icon: Settings, label: 'Settings', href: '/client/settings' },
  ];

  const links = isAdmin ? adminLinks : clientLinks;

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" className="border-r border-gray-100 bg-sidebar-background">
        <SidebarHeader className="h-16 flex items-center justify-center border-b border-gray-50/50">
          <div className="flex items-center gap-2 px-2 w-full">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="font-bold text-lg tracking-tight group-data-[collapsible=icon]:hidden">
              MotionPine
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            {links.map((link) => {
              const isActive = location.pathname === link.href;
              return (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={link.label}
                    className={cn(
                      "h-10 transition-all duration-200 rounded-xl",
                      isActive
                        ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                        : "text-muted-foreground hover:bg-gray-50 hover:text-foreground hover:shadow-sm"
                    )}
                  >
                    <Link to={link.href} className="flex items-center gap-3">
                      <link.icon className={cn("size-5", isActive ? "text-blue-600" : "text-gray-500")} />
                      <span className="font-medium">{link.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-gray-50/50">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-9 w-9 border border-gray-200">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-start text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
            <span className="group-data-[collapsible=icon]:hidden">Logout</span>
          </Button>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="bg-gray-50/50 min-h-screen">
        <header className="h-16 flex items-center gap-4 px-6 border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
          <SidebarTrigger className="-ml-2" />
          <div className="flex-1" />
          {/* Header Actions could go here */}
        </header>
        <main className="flex-1 p-6 md:p-8 lg:p-10 max-w-[1600px] mx-auto w-full animate-fade-in">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}