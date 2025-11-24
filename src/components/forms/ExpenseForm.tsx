import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
const expenseSchema = z.object({
  item: z.string().min(2, { message: "Item name is required." }),
  cost: z.preprocess(
    (val) => (val === "" || val === null || val === undefined ? undefined : Number(val)),
    z.number().positive({ message: "Cost must be a positive number." })
  ),
  date: z.date({ message: "A purchase date is required." }),
  assignedTo: z.string().optional(),
  category: z.enum(['infrastructure', 'software', 'office', 'other']),
});
export type ExpenseFormData = z.infer<typeof expenseSchema>;
interface ExpenseFormProps {
  onSubmit: (data: Omit<ExpenseFormData, 'date'> & { date: string }) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<ExpenseFormData>;
}
export function ExpenseForm({ onSubmit, isSubmitting, defaultValues }: ExpenseFormProps) {
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: defaultValues || {
      item: "",
      cost: undefined,
      date: new Date(),
      category: "other",
      assignedTo: "",
    },
  });
  const handleFormSubmit = async (data: ExpenseFormData) => {
    const processedData = {
      ...data,
      date: data.date.toISOString(),
    };
    onSubmit(processedData);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 group transition-shadow hover:shadow-md p-4 rounded-lg">
          <FormField
            control={form.control}
            name="item"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Item / Service</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., MacBook Pro M3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-4">
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
                      placeholder="2499.00"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value === '' ? undefined : e.target.valueAsNumber)}
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
                <FormItem className="flex flex-col">
                  <FormLabel>Purchase Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="office">Office Supplies</SelectItem>
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
                <FormLabel>Assigned To (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Sarah Jenkins" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full transition-shadow hover:shadow-lg hover:shadow-primary/20" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Expense'
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}