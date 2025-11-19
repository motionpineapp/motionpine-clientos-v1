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
import { expenseService } from '@/services/expenses';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
const subscriptionFormSchema = z.object({
  name: z.string().min(2, 'Service name must be at least 2 characters'),
  price: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  billingCycle: z.enum(['monthly', 'yearly']),
  nextBillingDate: z.string().min(1, 'Start date is required'),
});
type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;
interface SubscriptionFormProps {
  onSuccess: () => void;
}
export function SubscriptionForm({ onSuccess }: SubscriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      name: '',
      price: 0,
      billingCycle: 'monthly',
      nextBillingDate: new Date().toISOString().split('T')[0],
    },
  });
  async function onSubmit(values: SubscriptionFormValues) {
    setIsSubmitting(true);
    try {
      await expenseService.addSubscription({
        name: values.name,
        price: values.price,
        billingCycle: values.billingCycle,
        nextBillingDate: new Date(values.nextBillingDate).toISOString(),
        status: 'active',
      });
      toast.success('Subscription added successfully');
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to add subscription:', error);
      toast.error('Failed to add subscription. Please try again.');
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
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Adobe Creative Cloud" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="0.00" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="billingCycle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Billing Cycle</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select cycle" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="nextBillingDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Start Date / Next Billing</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Subscription
          </Button>
        </div>
      </form>
    </Form>
  );
}