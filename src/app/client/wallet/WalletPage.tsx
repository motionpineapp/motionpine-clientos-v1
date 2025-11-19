import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/services/auth';
import { pineService } from '@/services/pines';
import { PineTransaction } from '@shared/types';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowUpRight, ArrowDownLeft, Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
export function WalletPage() {
  const user = useAuthStore((s) => s.user);
  const [transactions, setTransactions] = useState<PineTransaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (user?.id) {
      loadWalletData(user.id);
    }
  }, [user?.id]);
  const loadWalletData = async (clientId: string) => {
    try {
      setIsLoading(true);
      const [txs, bal] = await Promise.all([
      pineService.getTransactions(clientId),
      pineService.getBalance(clientId)]
      );
      setTransactions(txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setBalance(bal);
    } catch (error) {
      toast.error('Failed to load wallet data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading wallet...</p>
        </div>
      </div>);

  }
  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader
        title="My Wallet"
        description="Manage your Pines credits and view transaction history." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {}
        <Card className="md:col-span-2 border-none shadow-lg bg-gradient-to-br from-gray-900 to-gray-800 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <CardContent className="p-8 flex flex-col justify-between h-full relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 font-medium mb-1">Available Balance</p>
                <h2 className="text-5xl font-bold tracking-tight">{balance.toLocaleString()} <span className="text-2xl text-gray-400 font-normal">Pines</span></h2>
              </div>
              <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Wallet className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <Button className="bg-white text-gray-900 hover:bg-gray-100 border-none">
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Top Up Balance
              </Button>
              <Button variant="outline" className="bg-transparent text-white border-white/20 hover:bg-white/10 hover:text-white">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Payment Methods
              </Button>
            </div>
          </CardContent>
        </Card>
        {}
        <Card className="border-gray-100 shadow-sm flex flex-col justify-center">
          <CardContent className="p-6 space-y-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Spent (All Time)</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.abs(transactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + t.amount, 0)).toLocaleString()} Pines
              </p>
            </div>
            <Separator />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Last Transaction</p>
              <p className="text-lg font-medium text-gray-900">
                {transactions.length > 0 ? new Date(transactions[0].date).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      {}
      <Card className="border-gray-100 shadow-sm">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent activity on your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ?
              <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow> :

              transactions.map((tx) =>
              <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-medium">{tx.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(
                    "capitalize",
                    tx.type === 'purchase' ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-600 border-gray-200"
                  )}>
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className={cn("text-right font-bold", tx.amount > 0 ? "text-green-600" : "text-gray-900")}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
              )
              }
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>);

}