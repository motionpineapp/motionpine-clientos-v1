import React, { useEffect, useState } from 'react';
import { projectService } from '@/services/projects';
import { clientService } from '@/services/clients';
import { Project, ProjectStatus, Client } from '@shared/types';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Plus, Calendar, MoreHorizontal, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ProjectForm } from '@/components/forms/ProjectForm';
export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [projectsData, clientsData] = await Promise.all([
        projectService.getProjects(),
        clientService.getClients()
      ]);
      setProjects(projectsData.items);
      setClients(clientsData.items);
    } catch (error) {
      toast.error('Failed to load projects or clients');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddProject = async (data: any) => {
    setIsSubmitting(true);
    try {
      const selectedClient = clients.find(c => c.id === data.clientId);
      if (!selectedClient) {
        throw new Error("Client not found");
      }
      const newProjectData = {
        ...data,
        clientName: selectedClient.name,
        createdAt: new Date().toISOString(),
        dueDate: data.dueDate?.toISOString(),
      };
      await projectService.createProject(newProjectData);
      toast.success('Project created successfully!');
      setIsModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to create project.');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const columns: { id: ProjectStatus; label: string; color: string }[] = [
    { id: 'todo', label: 'To Do', color: 'bg-gray-100 text-gray-600' },
    { id: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-600' },
    { id: 'done', label: 'Done', color: 'bg-green-100 text-green-600' }
  ];
  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-140px)] flex flex-col">
      <PageHeader
        title="Projects Board"
        description="Track active projects and tasks."
        className="mb-6 flex-none"
      >
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the details to start a new project.
              </DialogDescription>
            </DialogHeader>
            <ProjectForm
              clients={clients}
              onSubmit={handleAddProject}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading board...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden min-h-0">
          {columns.map(col => (
            <div key={col.id} className="flex flex-col h-full bg-gray-50/50 rounded-2xl border border-gray-100 overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white/50 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className={cn("px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider", col.color)}>
                    {col.label}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {projects.filter(p => p.status === col.id).length}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {projects.filter(p => p.status === col.id).map(project => (
                  <Card
                    key={project.id}
                    className="border-gray-200 shadow-sm hover:shadow-md transition-all group"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-gray-50 text-muted-foreground border-gray-200">
                          {project.clientName}
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2 -mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 leading-tight mb-1">{project.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{project.description}</p>
                      </div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6 border border-white shadow-sm">
                            <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                              {project.clientName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {project.priority === 'high' && (
                            <span className="text-[10px] font-medium text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                              High
                            </span>
                          )}
                        </div>
                        {project.dueDate && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}