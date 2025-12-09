import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { pineService } from '@/services/pines';
import { useAuthStore } from '@/services/auth';
import { PineTransaction, PinePackage } from '@shared/types';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TreePine, Download, Loader2, ArrowUp, ArrowDown, Sparkles, Check, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export function WalletPage() {
  const user = useAuthStore(s => s.user);
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<PineTransaction[]>([]);
  const [packages, setPackages] = useState<PinePackage[]>([]);
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);

  // Check for success/cancel from Stripe
  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      toast.success('Payment successful! Your pines are being added.');
    } else if (searchParams.get('canceled') === 'true') {
      toast.info('Payment canceled.');
    }
  }, [searchParams]);

  useEffect(() => {
    const loadWalletData = async () => {
      if (!user) return;
      try {
        setIsLoading(true);
        const [balanceData, transactionsData, packagesData] = await Promise.all([
          pineService.getBalance(user.id),
          pineService.getTransactions(user.id),
          pineService.getPackages(),
        ]);
        setBalance(balanceData);
        setTransactions(transactionsData);
        setPackages(packagesData);
      } catch (error) {
        toast.error('Failed to load wallet details.');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadWalletData();
  }, [user]);

  const handleCheckout = async (pkg: PinePackage) => {
    if (!user) return;

    setCheckingOut(pkg.id);
    try {
      const result = await pineService.createCheckout(pkg.id, user.id, user.email);
      // Redirect to Stripe checkout
      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout');
      setCheckingOut(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 lg:py-12">
      <div className="space-y-8 animate-fade-in">
        <PageHeader
          title="My Wallet"
          description="Top up your Pines and view transaction history."
        />

        {/* Balance Card */}
        <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 shadow-lg">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 bg-white/20 rounded-full flex items-center justify-center">
                  <TreePine className="h-7 w-7" />
                </div>
                <div>
                  <p className="text-sm opacity-90">Current Balance</p>
                  {isLoading ? (
                    <Loader2 className="h-8 w-8 animate-spin mt-1" />
                  ) : (
                    <p className="text-4xl font-bold">{balance.toLocaleString()} Pines</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pine Packages */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Top Up Pines</h2>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <Card
                  key={pkg.id}
                  className={cn(
                    "relative overflow-hidden transition-all hover:shadow-lg",
                    pkg.isFeatured && "border-2 border-primary ring-2 ring-primary/20"
                  )}
                >
                  {pkg.isFeatured && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-xs font-medium px-3 py-1 rounded-bl-lg">
                      <Sparkles className="h-3 w-3 inline mr-1" />
                      Popular
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2">
                      <TreePine className="h-5 w-5 text-emerald-600" />
                      {pkg.pineCount} Pines
                    </CardTitle>
                    <CardDescription>{pkg.name} Package</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-3xl font-bold">${pkg.totalPrice.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        (${pkg.pricePerPine.toFixed(2)}/pine)
                      </span>
                    </div>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        {pkg.pineCount} project credits
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        Never expires
                      </li>
                      {pkg.pricePerPine < 30 && (
                        <li className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-green-500" />
                          {Math.round((1 - pkg.pricePerPine / 30) * 100)}% savings
                        </li>
                      )}
                    </ul>
                    <Button
                      className="w-full"
                      variant={pkg.isFeatured ? "default" : "outline"}
                      onClick={() => handleCheckout(pkg)}
                      disabled={checkingOut !== null}
                    >
                      {checkingOut === pkg.id ? (
                        <>
                          <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                          Redirecting...
                        </>
                      ) : (
                        'Buy Now'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Transaction History */}
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
                    <TableRow key={tx.id} className="hover:bg-accent/50">
                      <TableCell className="text-muted-foreground">
                        {format(new Date(tx.date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            tx.type === 'purchase'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : tx.type === 'refund'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            {tx.type === 'purchase' || tx.type === 'refund' ? (
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
                          tx.amount > 0 ? 'text-green-600' : 'text-gray-800'
                        )}
                      >
                        {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}