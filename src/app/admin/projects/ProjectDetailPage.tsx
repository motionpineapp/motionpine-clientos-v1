import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '@/services/projects';
import { clientService } from '@/services/clients';
import { Project, Client } from '@shared/types';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Edit, Trash, Calendar, User, Tag, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (!id) {
      toast.error("Project ID is missing.");
      setIsLoading(false);
      return;
    }
    const loadProjectDetails = async () => {
      try {
        setIsLoading(true);
        const projectData = await projectService.getProjectById(id);
        setProject(projectData);
        // Fetch client details
        const clientData = await clientService.getClients(); // In a real app, this would be getClientById
        const projectClient = clientData.items.find(c => c.id === projectData.clientId);
        setClient(projectClient || null);
      } catch (error) {
        toast.error("Failed to load project details.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProjectDetails();
  }, [id]);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!project) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Project not found.</p>
        <Button asChild variant="link">
          <Link to="/admin/projects">Go back to projects</Link>
        </Button>
      </div>
    );
  }
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title={project.title}>
        <Button variant="outline" asChild>
          <Link to="/admin/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Board
          </Link>
        </Button>
        <Button variant="outline">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
        <Button variant="destructive">
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </Button>
      </PageHeader>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{project.description || "No description provided."}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
            </CardHeader>
            <CardContent className="text-center text-muted-foreground py-12">
              <MessageSquare className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              Activity feed and comments coming soon.
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Status</span>
                <Badge variant="outline" className="capitalize">{project.status.replace('-', ' ')}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Priority</span>
                <Badge variant={project.priority === 'high' ? 'destructive' : 'secondary'} className="capitalize">{project.priority || 'Normal'}</Badge>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Dates</p>
                  <p className="text-xs text-muted-foreground">
                    Created: {format(new Date(project.createdAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due: {project.dueDate ? format(new Date(project.dueDate), 'MMM d, yyyy') : 'N/A'}
                  </p>
                </div>
              </div>
              {client && (
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm font-medium">Client</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={client.avatar} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{client.name}</span>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <p className="text-sm font-medium">Tags</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="secondary">Website</Badge>
                    <Badge variant="secondary">Q4</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}