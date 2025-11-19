import React, { useEffect, useState } from 'react';
import { expenseService } from '@/services/expenses';
import { Expense, Subscription } from '@shared/types';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { Plus, Download, Filter, Loader2, CreditCard, Server } from 'lucide-react';
import { toast } from 'sonner';
import { ExpenseForm } from '@/components/forms/ExpenseForm';
import { SubscriptionForm } from '@/components/forms/SubscriptionForm';
import { addDays, addMonths, addYears } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
export function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [isSubmittingSub, setIsSubmittingSub] = useState(false);
  useEffect(() => {
    loadData();
  }, []);
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [expensesData, subsData] = await Promise.all([
        expenseService.getExpenses(),
        expenseService.getSubscriptions()
      ]);
      setExpenses(expensesData.items);
      setSubscriptions(subsData.items);
    } catch (error) {
      toast.error('Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddExpense = async (data: any) => {
    setIsSubmittingExpense(true);
    try {
      await expenseService.createExpense(data);
      toast.success('Expense added successfully!');
      setIsExpenseModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to add expense.');
      console.error(error);
    } finally {
      setIsSubmittingExpense(false);
    }
  };
  const handleAddSubscription = async (data: any) => {
    setIsSubmittingSub(true);
    try {
      await expenseService.createSubscription(data);
      toast.success('Subscription added successfully!');
      setIsSubModalOpen(false);
      loadData();
    } catch (error) {
      toast.error('Failed to add subscription.');
      console.error(error);
    } finally {
      setIsSubmittingSub(false);
    }
  };
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.cost, 0);
  const monthlyRecurring = subscriptions
    .filter(s => s.status === 'active')
    .reduce((acc, curr) => acc + (curr.billingCycle === 'monthly' ? curr.price : curr.price / 12), 0);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="space-y-6 animate-fade-in">
        <PageHeader
          title="Expenses & Infrastructure"
          description="Track office spending and recurring software subscriptions."
        >
          <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Expense
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Expense</DialogTitle>
                <DialogDescription>
                  Log a new one-time purchase or expense.
                </DialogDescription>
              </DialogHeader>
              <ExpenseForm onSubmit={handleAddExpense} isSubmitting={isSubmittingExpense} />
            </DialogContent>
          </Dialog>
        </PageHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total One-Time Spend</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-32" /> : <div className="text-2xl font-bold">${totalExpenses.toLocaleString()}</div>}
              <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
            </CardContent>
          </Card>
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Recurring</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-24" /> : <div className="text-2xl font-bold">${monthlyRecurring.toFixed(2)}</div>}
              <p className="text-xs text-muted-foreground mt-1">Estimated for next month</p>
            </CardContent>
          </Card>
          <Card className="border-gray-100 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-8 w-12" /> : <div className="text-2xl font-bold">{subscriptions.filter(s => s.status === 'active').length}</div>}
              <p className="text-xs text-muted-foreground mt-1">Across all departments</p>
            </CardContent>
          </Card>
        </div>
        <Tabs defaultValue="infrastructure" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-gray-100 p-1">
              <TabsTrigger value="infrastructure" className="gap-2">
                <Server className="h-4 w-4" />
                Infrastructure
              </TabsTrigger>
              <TabsTrigger value="subscriptions" className="gap-2">
                <CreditCard className="h-4 w-4" />
                Subscriptions
              </TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              <Dialog open={isSubModalOpen} onOpenChange={setIsSubModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add Subscription
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Subscription</DialogTitle>
                    <DialogDescription>
                      Log a new recurring software subscription.
                    </DialogDescription>
                  </DialogHeader>
                  <SubscriptionForm onSubmit={handleAddSubscription} isSubmitting={isSubmittingSub} />
                </DialogContent>
              </Dialog>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          <TabsContent value="infrastructure" className="mt-0">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle>Purchase History</CardTitle>
                <CardDescription>One-time purchases for office and equipment.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Cost</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell className="font-medium">{expense.item}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize font-normal">
                            {expense.category}
                          </Badge>
                        </TableCell>
                        <TableCell>{expense.assignedTo}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(expense.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${expense.cost.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="subscriptions" className="mt-0">
            <Card className="border-gray-100 shadow-sm">
              <CardHeader>
                <CardTitle>Recurring Software</CardTitle>
                <CardDescription>Monthly and yearly software licenses.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Service</TableHead>
                      <TableHead>Cycle</TableHead>
                      <TableHead>Next Billing</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                          <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                          <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                        </TableRow>
                      ))
                    ) : subscriptions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {sub.icon && <img src={sub.icon} alt={sub.name} className="h-6 w-6 object-contain" />}
                            <span className="font-medium">{sub.name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize text-muted-foreground">{sub.billingCycle}</TableCell>
                        <TableCell>{new Date(sub.nextBillingDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            sub.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500'
                          }>
                            {sub.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${sub.price.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}