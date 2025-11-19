import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { clientService } from '@/services/clients';
import { projectService } from '@/services/projects';
import { Client, Project } from '@shared/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, MessageSquare, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const loadData = useCallback(async (clientId: string) => {
    try {
      setIsLoading(true);
      const [clientData, projectsData] = await Promise.all([
        clientService.getClient(clientId),
        projectService.getProjectsByClient(clientId)
      ]);
      if (!clientData) {
        toast.error('Client not found');
        navigate('/admin/clients');
        return;
      }
      setClient(clientData);
      setProjects(projectsData);
    } catch (error) {
      toast.error('Failed to load client details');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);
  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id, loadData]);
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading client profile...</p>
        </div>
      </div>
    );
  }
  if (!client) return null;
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/clients')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{client.name}</h1>
          <p className="text-muted-foreground">{client.company}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/admin/chat?clientId=${client.id}`)}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Message
          </Button>
          <Button>Edit Profile</Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Client Info */}
        <div className="space-y-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-center pb-4">
                <Avatar className="h-24 w-24 border-4 border-gray-50">
                  <AvatarImage src={client.avatar} />
                  <AvatarFallback className="text-2xl">{client.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="text-center space-y-1">
                <CardTitle>{client.name}</CardTitle>
                <Badge variant="secondary" className="mt-2">
                  {client.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Separator />
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="text-foreground">{client.email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span className="text-foreground">{client.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-foreground">{client.address || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-foreground">Joined {new Date(client.joinedAt).toLocaleDateString()}</span>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Revenue</p>
                  <p className="text-lg font-bold text-gray-900">${client.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Projects</p>
                  <p className="text-lg font-bold text-gray-900">{client.totalProjects}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        {/* Right Column: Projects & Activity */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-gray-100 shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Projects</CardTitle>
              <Button variant="ghost" size="sm" className="text-primary">View All</Button>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p>No projects found for this client.</p>
                  <Button variant="link" className="mt-2">Create first project</Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map(project => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50/50 transition-all cursor-pointer group"
                      onClick={() => toast.info(`Project ${project.title} clicked`)}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                            {project.title}
                          </h3>
                          {project.priority === 'high' && (
                            <span className="h-2 w-2 rounded-full bg-red-500" title="High Priority" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{project.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline" className={
                          project.status === 'done' ? 'bg-green-50 text-green-700 border-green-200' :
                          project.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {project.status === 'in-progress' ? 'In Progress' :
                           project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                        </Badge>
                        <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-primary" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}