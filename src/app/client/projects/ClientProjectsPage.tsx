import React, { useEffect, useState } from 'react';
import { projectService } from '@/services/projects';
import { useAuthStore } from '@/services/auth';
import { Project } from '@shared/types';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
export function ClientProjectsPage() {
  const user = useAuthStore(s => s.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (user?.id) {
      loadProjects(user.id);
    }
  }, [user?.id]);
  const loadProjects = async (clientId: string) => {
    try {
      setIsLoading(true);
      const data = await projectService.getProjectsByClient(clientId);
      setProjects(data);
    } catch (error) {
      toast.error('Failed to load projects');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-100 text-green-700 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'todo': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  const getStatusLabel = (status: string) => {
    if (status === 'in-progress') return 'In Progress';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading your projects...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="My Projects"
          description="Track the status and progress of your active campaigns."
        />
        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-center">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">No Active Projects</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-6">
              You don't have any active projects at the moment. Ready to start something new?
            </p>
            <Button onClick={() => window.location.href = '/client/intake'}>
              Start New Project
            </Button>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            initial="hidden"
            animate="show"
          >
            {projects.map((project) => (
              <motion.div
                key={project.id}
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
              >
                <Card className="border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all group flex flex-col h-full">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className={cn("font-medium", getStatusColor(project.status))}>
                        {getStatusLabel(project.status)}
                      </Badge>
                      {project.priority === 'high' && (
                        <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-100 hover:bg-red-100">
                          High Priority
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-xl group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 mt-1">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium text-muted-foreground">
                        <span>Progress</span>
                        <span>
                          {project.status === 'done' ? '100%' : project.status === 'in-progress' ? '65%' : '0%'}
                        </span>
                      </div>
                      <Progress
                        value={project.status === 'done' ? 100 : project.status === 'in-progress' ? 65 : 0}
                        className="h-2"
                      />
                    </div>
                    <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {project.dueDate
                            ? new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                            : 'No due date'}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1 text-primary hover:text-primary hover:bg-primary/5">
                        Details <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}