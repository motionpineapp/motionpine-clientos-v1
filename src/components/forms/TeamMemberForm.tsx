import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { teamService } from '@/services/teams';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
const teamMemberFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  role: z.string().min(2, 'Role is required'),
  phone: z.string().optional(),
});
type TeamMemberFormValues = z.infer<typeof teamMemberFormSchema>;
interface TeamMemberFormProps {
  onSuccess: () => void;
}
export function TeamMemberForm({ onSuccess }: TeamMemberFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<TeamMemberFormValues>({
    resolver: zodResolver(teamMemberFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: '',
      phone: '',
    },
  });
  async function onSubmit(values: TeamMemberFormValues) {
    setIsSubmitting(true);
    try {
      await teamService.createTeamMember({
        name: values.name,
        email: values.email,
        role: values.role,
        phone: values.phone || undefined,
        status: 'active',
      });
      toast.success('Team member invited successfully');
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to invite team member:', error);
      toast.error('Failed to invite team member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Jane Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="jane@company.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Senior Designer">Senior Designer</SelectItem>
                    <SelectItem value="Frontend Developer">Frontend Developer</SelectItem>
                    <SelectItem value="Project Manager">Project Manager</SelectItem>
                    <SelectItem value="Creative Director">Creative Director</SelectItem>
                    <SelectItem value="Finance Manager">Finance Manager</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 000-0000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Invite
          </Button>
        </div>
      </form>
    </Form>
  );
}