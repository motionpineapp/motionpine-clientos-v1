import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
const subscriptionSchema = z.object({
  name: z.string().min(2, { message: "Service name is required." }),
  price: z.preprocess(
    (val) => (String(val).trim() === '' ? undefined : Number(String(val).trim())),
    z.number({ invalid_type_error: "Please enter a valid number." }).positive({ message: "Price must be positive." })
  ),
  billingCycle: z.enum(['monthly', 'yearly']),
  startDateOption: z.enum(['yesterday', 'today', 'tomorrow', 'custom']),
  customStartDate: z.date().optional(),
}).refine(data => {
  if (data.startDateOption === 'custom') {
    return !!data.customStartDate;
  }
  return true;
}, {
  message: "Please select a custom start date.",
  path: ["customStartDate"],
});
export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;
interface SubscriptionFormProps {
  onSubmit: (data: SubscriptionFormData) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<SubscriptionFormData>;
}
export function SubscriptionForm({ onSubmit, isSubmitting, defaultValues }: SubscriptionFormProps) {
  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: defaultValues || {
      name: "",
      price: undefined,
      billingCycle: "monthly",
      startDateOption: "today",
    },
  });
  const startDateOption = form.watch('startDateOption');
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 group">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Adobe Creative Cloud" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="54.99"
                    {...field}
                    value={field.value?.toString() ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
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
          name="startDateOption"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>First Billing Date</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="yesterday" />
                    </FormControl>
                    <FormLabel className="font-normal">Yesterday</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="today" />
                    </FormControl>
                    <FormLabel className="font-normal">Today</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="tomorrow" />
                    </FormControl>
                    <FormLabel className="font-normal">Tomorrow</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="custom" />
                    </FormControl>
                    <FormLabel className="font-normal">Custom Date</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {startDateOption === 'custom' && (
          <FormField
            control={form.control}
            name="customStartDate"
            render={({ field }) => (
              <FormItem className="flex flex-col animate-fade-in">
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
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <Button type="submit" className="w-full transition-transform group-hover:scale-[1.02]" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Subscription'
          )}
        </Button>
      </form>
    </Form>
  );
}