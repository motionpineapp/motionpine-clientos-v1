import React, { useState, useCallback } from 'react';
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
const expenseFormSchema = z.object({
  item: z.string().min(2, 'Item name must be at least 2 characters'),
  cost: z.coerce.number().min(0.01, 'Cost must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  assignedTo: z.string().min(2, 'Assigned person is required'),
  category: z.enum(['infrastructure', 'software', 'office', 'other']),
});
type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
interface ExpenseFormProps {
  onSuccess: () => void;
}
export function ExpenseForm({ onSuccess }: ExpenseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      item: '',
      cost: 0,
      date: new Date().toISOString().split('T')[0],
      assignedTo: '',
      category: 'office',
    },
  });
  const onSubmit = useCallback(async (values: ExpenseFormValues) => {
    setIsSubmitting(true);
    try {
      await expenseService.addExpense({
        item: values.item,
        cost: values.cost,
        date: new Date(values.date).toISOString(),
        assignedTo: values.assignedTo,
        category: values.category,
      });
      toast.success('Expense added successfully');
      form.reset();
      onSuccess();
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast.error('Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [form, onSuccess]);
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="item"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Item Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Office Chairs" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="cost"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost ($)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(value as ExpenseFormValues['category'])} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assignedTo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assigned To</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Alice Freeman" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Expense
          </Button>
        </div>
      </form>
    </Form>
  );
}