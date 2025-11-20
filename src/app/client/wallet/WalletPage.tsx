import React, { useEffect, useState } from 'react';
import { pineService } from '@/services/pines';
import { useAuthStore } from '@/services/auth';
import { PineTransaction } from '@shared/types';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Download, Loader2, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
export function WalletPage() {
  const user = useAuthStore(s => s.user);
  const [transactions, setTransactions] = useState<PineTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const loadWalletData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const [balanceData, transactionsData] = await Promise.all([
          pineService.getBalance(user.id),
          pineService.getTransactions(user.id),
        ]);
        setBalance(balanceData);
        setTransactions(transactionsData);
      } catch (error) {
        toast.error('Failed to load wallet details.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadWalletData();
  }, [user]);
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="My Wallet"
        description="View your Pine balance and transaction history."
      >
        <Button onClick={() => toast.info('This feature is coming soon!')}>
          <Plus className="mr-2 h-4 w-4" />
          Top Up Pines
        </Button>
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-gray-100 shadow-sm">
          <CardHeader>
            <CardTitle>Current Balance</CardTitle>
            <CardDescription>Your available Pines for project requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-12 flex items-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="text-5xl font-bold tracking-tighter text-primary">
                {balance.toLocaleString()}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">1 Pine = $1 USD</p>
          </CardContent>
        </Card>
      </div>
      <Card className="border-gray-100 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>A record of all your Pine purchases and usage.</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading transactions...
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(tx.date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          tx.type === 'purchase'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-orange-50 text-orange-700 border-orange-200'
                        )}
                      >
                        <div className="flex items-center gap-1.5">
                          {tx.type === 'purchase' ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : (
                            <ArrowDown className="h-3 w-3" />
                          )}
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-semibold',
                        tx.type === 'purchase' ? 'text-green-600' : 'text-gray-800'
                      )}
                    >
                      {tx.type === 'purchase' ? '+' : ''}
                      {tx.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}