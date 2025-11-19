import React, { useState, useEffect, useCallback } from 'react';
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
import { clientService } from '@/services/clients';
import { Client } from '@shared/types';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
const clientFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
});
type ClientFormValues = z.infer<typeof clientFormSchema>;
interface ClientFormProps {
  client?: Client;
  onSuccess: () => void;
}
export function ClientForm({ client, onSuccess }: ClientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: client?.name || '',
      company: client?.company || '',
      email: client?.email || '',
      phone: client?.phone || '',
      address: client?.address || '',
    },
  });
  // Reset form when client prop changes (e.g. when opening edit modal for different client)
  useEffect(() => {
    if (client) {
      form.reset({
        name: client.name,
        company: client.company,
        email: client.email,
        phone: client.phone || '',
        address: client.address || '',
      });
    }
  }, [client, form]);
  const onSubmit = useCallback(async (values: ClientFormValues) => {
    setIsSubmitting(true);
    try {
      if (client) {
        await clientService.updateClient(client.id, {
          name: values.name,
          company: values.company,
          email: values.email,
          phone: values.phone || undefined,
          address: values.address || undefined,
        });
        toast.success('Client updated successfully');
      } else {
        await clientService.createClient({
          name: values.name,
          company: values.company,
          email: values.email,
          phone: values.phone || undefined,
          address: values.address || undefined,
          status: 'active',
        });
        toast.success('Client created successfully');
      }
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to save client:', error);
      toast.error('Failed to save client. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [client, form, onSuccess]);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="company"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="123 Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {client ? 'Save Changes' : 'Create Client'}
          </Button>
        </div>
      </form>
    </Form>
  );
}