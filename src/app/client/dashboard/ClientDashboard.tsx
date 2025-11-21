import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BentoTile } from '@/components/tiles/BentoTile';
import {
  FileText,
  Wallet,
  MessageSquare,
  File,
  Clock,
  CheckCircle2,
  HardDrive,
  Image as ImageIcon,
  Send,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuthStore } from '@/services/auth';
import { projectService } from '@/services/projects';
import { pineService } from '@/services/pines';
import { Project } from '@shared/types';
import { toast } from 'sonner';
export function ClientDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore(s => s.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [pinesBalance, setPinesBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadData = async () => {
      if (!user?.id) return;
      try {
        const [projectsData, balanceData] = await Promise.all([
          projectService.getProjectsByClient(user.id),
          pineService.getBalance(user.id)
        ]);
        setProjects(projectsData);
        setPinesBalance(balanceData);
      } catch (error) {
        console.error('Failed to load client dashboard', error);
        toast.error("Failed to load your dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [user?.id]);
  const activeProject = projects.find(p => p.status === 'in-progress') || projects[0];
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="space-y-8 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
            <p className="text-muted-foreground mt-1">Here's what's happening with your projects.</p>
          </div>
        </div>
        {/* --- TOP ROW REFACTORED --- */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Pines / Credit Counter Tile */}
          <BentoTile
            className="flex-1 min-h-[220px] group-hover:scale-105 transition-transform"
            title="Wallet"
            icon={<Wallet className="size-5" />}
          >
            <div className="flex flex-col justify-between h-full py-2">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Available Pines</p>
                <h2 className="text-5xl font-bold tracking-tighter text-primary">{pinesBalance.toLocaleString()}</h2>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last purchase</span>
                  <span className="font-medium">Oct 24, 2023</span>
                </div>
                <Button variant="outline" className="w-full" onClick={() => navigate('/client/wallet')}>
                  View History
                </Button>
              </div>
            </div>
          </BentoTile>
          {/* Project Intake Tile */}
          <BentoTile
            className="flex-1 min-h-[220px] bg-gradient-to-r from-white to-gray-50 text-foreground group-hover:scale-105 transition-transform"
            title="Start a New Project"
            icon={<FileText className="size-5 text-gray-700" />}
          >
            <div className="flex flex-col md:flex-row items-center justify-between h-full gap-6">
              <div className="space-y-4 max-w-lg">
                <p className="text-gray-700 text-lg">
                  Ready to launch your next campaign? Fill out the intake form to get started immediately.
                </p>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold" onClick={() => navigate('/client/intake')}>
                  Create Request
                </Button>
              </div>
            </div>
          </BentoTile>
        </div>
        <div className="bento-grid">
          {/* --- MIDDLE ROW --- */}
          {/* Instant Chat Tile (Large Vertical) */}
          <BentoTile
            className="col-span-1 md:col-span-4 lg:col-span-4 row-span-2 min-h-[500px]"
            title="Support Chat"
            icon={<MessageSquare className="size-5" />}
            noPadding
          >
            <div className="flex h-full flex-col">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-white shadow-sm">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" />
                  <AvatarFallback>AD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">Admin Support</p>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="block h-2 w-2 rounded-full bg-green-500" />
                    Online
                  </p>
                </div>
              </div>
              <ScrollArea className="flex-1 p-4 bg-white">
                <div className="space-y-4">
                  <div className="flex gap-3 flex-row-reverse">
                    <div className="bg-primary text-white p-3 rounded-2xl rounded-tr-none text-sm max-w-[85%]">
                      Hi, I have a question about the latest invoice.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>AD</AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-sm max-w-[85%]">
                      Sure thing! What specifically would you like to know?
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <div className="p-3 border-t border-gray-100 bg-gray-50/30">
                <div className="relative">
                  <Input placeholder="Message admin..." className="pr-10 bg-white border-gray-200" />
                  <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-8 w-8 text-primary hover:bg-primary/10">
                    <Send className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </BentoTile>
          {/* Docs Tile (Small) */}
          <BentoTile
            className="col-span-1 md:col-span-2 lg:col-span-2 min-h-[240px]"
            title="Documents"
            icon={<File className="size-5" />}
          >
            <div className="space-y-4 mt-2">
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <FileText className="size-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">Contract_v2.pdf</p>
                  <p className="text-xs text-muted-foreground">2.4 MB</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                <div className="h-10 w-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-600">
                  <ImageIcon className="size-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">Brand_Assets.zip</p>
                  <p className="text-xs text-muted-foreground">156 MB</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="w-full text-muted-foreground">View All</Button>
            </div>
          </BentoTile>
          {/* Current Project Status Tile (Large) */}
          <BentoTile
            className="col-span-1 md:col-span-2 lg:col-span-6 min-h-[240px]"
            title={activeProject ? `Active: ${activeProject.title}` : "No Active Projects"}
            icon={<Clock className="size-5" />}
          >
            {activeProject ? (
              <div className="flex flex-col justify-between h-full gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium">Progress</span>
                    <span className="text-muted-foreground">
                      {activeProject.status === 'done' ? '100%' : activeProject.status === 'in-progress' ? '65%' : '10%'}
                    </span>
                  </div>
                  <Progress
                    value={activeProject.status === 'done' ? 100 : activeProject.status === 'in-progress' ? 65 : 10}
                    className="h-3"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <span className="text-xs font-medium">Discovery</span>
                  </div>
                  <div className="flex flex-col items-center text-center gap-2">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activeProject.status === 'todo' ? 'bg-gray-100 text-gray-400' : 'bg-green-100 text-green-600'}`}>
                      <CheckCircle2 className="size-4" />
                    </div>
                    <span className="text-xs font-medium">Design</span>
                  </div>
                  <div className={`flex flex-col items-center text-center gap-2`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${activeProject.status === 'in-progress' ? 'bg-blue-100 text-blue-600 animate-pulse' : activeProject.status === 'done' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      <Clock className="size-4" />
                    </div>
                    <span className="text-xs font-medium text-blue-600">Development</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>Start a new project to see status here.</p>
              </div>
            )}
          </BentoTile>
          {/* --- LOWER ROW --- */}
          <BentoTile
            className="col-span-1 md:col-span-2 lg:col-span-2 min-h-[160px]"
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
            className="col-span-1 md:col-span-2 lg:col-span-3 min-h-[160px]"
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
            className="col-span-1 md:col-span-2 lg:col-span-3 min-h-[160px]"
            noPadding
          >
            <div className="h-full flex flex-col items-center justify-center p-6 hover:bg-gray-50 transition-colors cursor-pointer gap-3">
              <div className="h-12 w-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                <FileText className="size-6" />
              </div>
              <span className="font-medium text-sm">Dropbox</span>
            </div>
          </BentoTile>
        </div>
      </div>
    </div>
  );
}