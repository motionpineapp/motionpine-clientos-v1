import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { projectService } from '@/services/projects';
import { clientService } from '@/services/clients';
import { Client, Project } from '@shared/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
const projectFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  clientId: z.string().min(1, 'Please select a client'),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string().optional(),
});
type ProjectFormValues = z.infer<typeof projectFormSchema>;
interface ProjectFormProps {
  project?: Project;
  onSuccess: () => void;
}
export function ProjectForm({ project, onSuccess }: ProjectFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      title: project?.title || '',
      clientId: project?.clientId || '',
      description: project?.description || '',
      priority: project?.priority || 'medium',
      dueDate: project?.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
    },
  });
  useEffect(() => {
    const loadClients = async () => {
      try {
        const data = await clientService.getClients();
        setClients(data);
      } catch (error) {
        console.error('Failed to load clients:', error);
        toast.error('Failed to load clients list');
      } finally {
        setIsLoadingClients(false);
      }
    };
    loadClients();
  }, []);
  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title,
        clientId: project.clientId,
        description: project.description || '',
        priority: project.priority || 'medium',
        dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
      });
    }
  }, [project, form]);
  async function onSubmit(values: ProjectFormValues) {
    setIsSubmitting(true);
    try {
      const selectedClient = clients.find(c => c.id === values.clientId);
      if (!selectedClient) {
        toast.error('Selected client not found');
        return;
      }
      if (project) {
        await projectService.updateProject(project.id, {
          title: values.title,
          clientId: values.clientId,
          clientName: selectedClient.name,
          description: values.description || undefined,
          priority: values.priority,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
        });
        toast.success('Project updated successfully');
      } else {
        await projectService.createProject({
          title: values.title,
          clientId: values.clientId,
          clientName: selectedClient.name,
          description: values.description || undefined,
          priority: values.priority,
          dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
          status: 'todo',
        });
        toast.success('Project created successfully');
      }
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Website Redesign" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="clientId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingClients || !!project}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Select a client"} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name} ({client.company})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date (Optional)</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the project..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting || isLoadingClients}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {project ? 'Save Changes' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
}