import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '@/services/projects';
import { Project } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Calendar, Clock, AlertCircle, Loader2, CheckCircle2, User } from 'lucide-react';
import { toast } from 'sonner';
import { ProjectForm } from '@/components/forms/ProjectForm';
import { cn } from '@/lib/utils';
export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const loadProject = useCallback(async (projectId: string) => {
    try {
      setIsLoading(true);
      const data = await projectService.getProject(projectId);
      if (!data) {
        toast.error('Project not found');
        navigate('/admin/projects');
        return;
      }
      setProject(data);
    } catch (error) {
      toast.error('Failed to load project details');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  useEffect(() => {
    if (id) {
      loadProject(id);
    }
  }, [id, loadProject]);
  const handleEditSuccess = () => {
    setIsEditOpen(false);
    if (id) loadProject(id);
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'todo': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading project details...</p>
        </div>
      </div>
    );
  }
  if (!project) return null;
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/projects')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">{project.title}</h1>
            <Badge variant="outline" className={cn("capitalize", getStatusColor(project.status))}>
              {project.status.replace('-', ' ')}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground mt-1">
            <User className="h-3 w-3" />
            <span className="text-sm">{project.clientName}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button>Edit Project</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>
                  Update project details and status.
                </DialogDescription>
              </DialogHeader>
              <ProjectForm project={project} onSuccess={handleEditSuccess} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {project.description || 'No description provided.'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle>Activity & Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <CheckCircle2 className="h-10 w-10 text-gray-300 mb-3" />
                <p>Task management coming soon.</p>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Priority</p>
                <Badge variant={project.priority === 'high' ? 'destructive' : 'secondary'} className="capitalize">
                  {project.priority}
                </Badge>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Created</p>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Due Date</p>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span>{project.dueDate ? new Date(project.dueDate).toLocaleDateString() : 'No due date'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-gray-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer border border-transparent hover:border-gray-100"
                onClick={() => navigate(`/admin/clients/${project.clientId}`)}
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {project.clientName.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-sm">{project.clientName}</p>
                  <p className="text-xs text-muted-foreground">View Profile</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}