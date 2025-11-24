import React, { useEffect, useState } from 'react';
import { BentoTile } from '@/components/tiles/BentoTile';
import {
  Users,
  FolderKanban,
  FileText,
  MessageSquare,
  DollarSign,
  ArrowUpRight,
  HardDrive,
  Image as ImageIcon,
  MoreHorizontal,
  Send,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { clientService } from '@/services/clients';
import { projectService } from '@/services/projects';
import { chatService } from '@/services/chat';
import { Client, Project, Chat } from '@shared/types';
import { Skeleton } from '@/components/ui/skeleton';
export function AdminDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadData = async () => {
      try {
        const [clientsData, projectsData, chatsData] = await Promise.all([
          clientService.getClients(),
          projectService.getProjects(),
          chatService.getChats()
        ]);
        setClients(clientsData.items);
        setProjects(projectsData.items);
        setChats(chatsData.items);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);
  // Derived Stats
  const totalClients = clients?.length || 0;
  const activeProjectsCount = projects?.filter(p => p.status === 'in-progress').length || 0;
  const pendingIntakeCount = projects?.filter(p => p.status === 'todo').length || 0;
  const unreadCount = chats?.reduce((acc, c) => acc + (c.unreadCount || 0), 0) || 0;
  const totalRevenue = clients?.reduce((acc, c) => acc + c.totalRevenue, 0) || 0;
  // Lists
  const intakeRequests = projects?.filter(p => p.status === 'todo').slice(0, 2) || [];
  const recentClients = clients?.slice(0, 4) || [];
  const extraClients = Math.max(0, (clients?.length || 0) - 4);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your agency performance.</p>
          </div>
        </div>
        <div className="bento-grid">
          {/* --- TOP ROW --- */}
          <BentoTile
            className="col-span-1 md:col-span-4 lg:col-span-6 min-h-[200px] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            title="Overview"
            icon={<Users className="size-5" />}
          >
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full items-center">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-16" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full items-center">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-3xl font-bold">{totalClients}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Active Projects</p>
                  <p className="text-3xl font-bold text-primary">{activeProjectsCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Pending Intake</p>
                  <p className="text-3xl font-bold text-orange-500">{pendingIntakeCount}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Unread Msgs</p>
                  <p className="text-3xl font-bold text-blue-500">{unreadCount}</p>
                </div>
              </div>
            )}
          </BentoTile>
          <BentoTile
            className="col-span-1 md:col-span-2 lg:col-span-3 min-h-[200px] bg-white text-foreground border-gray-100 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            noPadding
          >
            <div className="p-6 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between">
                <div className="p-2 bg-gray-100 rounded-xl">
                  <DollarSign className="size-5 text-primary" />
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                  +12.5%
                </Badge>
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Revenue</p>
                {isLoading ? <Skeleton className="h-10 w-32 mt-1" /> : <h3 className="text-3xl font-bold mt-1">${totalRevenue.toLocaleString()}</h3>}
              </div>
            </div>
          </BentoTile>
          <BentoTile
            className="col-span-1 md:col-span-2 lg:col-span-3 min-h-[200px] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            title="Intake Requests"
            icon={<FileText className="size-5" />}
            action={<Button variant="ghost" size="icon" className="h-8 w-8"><ArrowUpRight className="size-4" /></Button>}
          >
            <div className="flex flex-col justify-center h-full space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : intakeRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center">No pending requests</p>
              ) : (
                intakeRequests.map(project => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">
                        {project.clientName.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate max-w-[120px]">{project.clientName}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[120px]">{project.title}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">New</Badge>
                  </div>
                ))
              )}
            </div>
          </BentoTile>
          {/* --- MIDDLE ROW --- */}
          <BentoTile
            className="col-span-1 md:col-span-4 lg:col-span-4 row-span-2 min-h-[500px] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            title="Instant Chat"
            icon={<MessageSquare className="size-5" />}
            noPadding
          >
            <div className="flex h-full flex-col">
              <div className="flex-1 flex overflow-hidden">
                <div className="w-20 border-r border-gray-100 flex flex-col items-center py-4 gap-4 bg-gray-50/50">
                  {chats.slice(0, 5).map((chat) => (
                    <div key={chat.id} className="relative group cursor-pointer">
                      <Avatar className="h-10 w-10 border-2 border-white shadow-sm hover:scale-105 transition-transform">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${chat.title}`} />
                        <AvatarFallback>{chat.title.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {chat.unreadCount ? (
                        <span className="absolute top-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full" />
                      ) : null}
                    </div>
                  ))}
                  <div className="mt-auto">
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <MoreHorizontal className="size-5 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
                <div className="flex-1 flex flex-col bg-white">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alice" />
                          <AvatarFallback>AF</AvatarFallback>
                        </Avatar>
                        <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm max-w-[80%]">
                          Hey! Just checking on the status of the homepage design?
                        </div>
                      </div>
                      <div className="flex gap-3 flex-row-reverse">
                        <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-[80%]">
                          Hi! We're wrapping up the final touches. Sending a preview in 10 mins.
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="p-3 border-t border-gray-100 bg-gray-50/30">
                    <div className="relative">
                      <Input placeholder="Type a message..." className="pr-10 bg-white border-gray-200" />
                      <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8 text-primary hover:bg-primary/10">
                        <Send className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </BentoTile>
          <BentoTile
            className="col-span-1 md:col-span-2 lg:col-span-2 min-h-[240px] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            title="Clients"
            icon={<Users className="size-5" />}
          >
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <div className="flex -space-x-4 overflow-hidden py-4">
                {recentClients.map((client) => (
                  <Avatar key={client.id} className="inline-block h-12 w-12 ring-2 ring-white">
                    <AvatarImage src={client.avatar} />
                    <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                ))}
                {extraClients > 0 && (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 ring-2 ring-white text-xs font-medium text-gray-500">
                    +{extraClients}
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full mt-auto" onClick={() => window.location.href = '/admin/clients'}>
                View Directory
              </Button>
            </div>
          </BentoTile>
          <BentoTile
            className="col-span-1 md:col-span-2 lg:col-span-6 min-h-[240px] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            title="Active Projects"
            icon={<FolderKanban className="size-5" />}
          >
            <div className="grid grid-cols-3 gap-4 h-full">
              <div className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-between border border-gray-100">
                <div className="flex items-center gap-2 text-gray-500 mb-2">
                  <div className="h-2 w-2 rounded-full bg-gray-400" />
                  <span className="text-xs font-medium uppercase tracking-wider">To Do</span>
                </div>
                <span className="text-3xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'todo').length}
                </span>
              </div>
              <div className="bg-blue-50 rounded-2xl p-4 flex flex-col justify-between border border-blue-100">
                <div className="flex items-center gap-2 text-blue-600 mb-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-xs font-medium uppercase tracking-wider">In Progress</span>
                </div>
                <span className="text-3xl font-bold text-blue-900">
                  {projects.filter(p => p.status === 'in-progress').length}
                </span>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 flex flex-col justify-between border border-green-100">
                <div className="flex items-center gap-2 text-green-600 mb-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span className="text-xs font-medium uppercase tracking-wider">Done</span>
                </div>
                <span className="text-3xl font-bold text-green-900">
                  {projects.filter(p => p.status === 'done').length}
                </span>
              </div>
            </div>
          </BentoTile>
          {/* --- LOWER ROW --- */}
          <BentoTile
            className="col-span-1 md:col-span-2 lg:col-span-2 min-h-[160px] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            noPadding
          >
            <div className="h-full flex flex-col items-center justify-center p-6 hover:bg-gray-50 transition-colors cursor-pointer gap-3">
              <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <ImageIcon className="size-6" />
              </div>
              <span className="font-medium text-sm">Frame.io</span>
            </div>
          </BentoTile>
          <BentoTile
            className="col-span-1 md:col-span-2 lg:col-span-3 min-h-[160px] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            noPadding
          >
            <div className="h-full flex flex-col items-center justify-center p-6 hover:bg-gray-50 transition-colors cursor-pointer gap-3">
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                <HardDrive className="size-6" />
              </div>
              <span className="font-medium text-sm">Google Drive</span>
            </div>
          </BentoTile>
          <BentoTile
            className="col-span-1 md:col-span-2 lg:col-span-3 min-h-[160px] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            noPadding
          >
            <div className="h-full flex flex-col items-center justify-center p-6 hover:bg-gray-50 transition-colors cursor-pointer gap-3">
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <FolderKanban className="size-6" />
              </div>
              <span className="font-medium text-sm">Dropbox</span>
            </div>
          </BentoTile>
        </div>
      </div>
    </div>
  );
}