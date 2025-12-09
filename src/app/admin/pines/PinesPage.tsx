import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api-client';
import type { ServiceType, PinePackage, Client } from '@shared/types';
import { TreePine, Settings, Users, Loader2, Plus, Edit2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const CATEGORY_LABELS: Record<string, string> = {
    reels: 'Reels & Short-Form',
    ads: 'Ads & Commerce',
    longform: 'Long-Form',
};

export function PinesPage() {
    const [loading, setLoading] = useState(true);
    const [services, setServices] = useState<ServiceType[]>([]);
    const [packages, setPackages] = useState<PinePackage[]>([]);
    const [clients, setClients] = useState<Array<Client & { balance: number }>>([]);

    // Add Pines Dialog
    const [addPinesOpen, setAddPinesOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<string | null>(null);
    const [pineAmount, setPineAmount] = useState('');
    const [pineType, setPineType] = useState<'purchase' | 'usage'>('purchase');
    const [pineNote, setPineNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        setLoading(true);
        try {
            const [servicesData, packagesData, clientsData] = await Promise.all([
                api<ServiceType[]>('/api/admin/services'),
                api<PinePackage[]>('/api/admin/pine-packages'),
                api<{ items: Client[] }>('/api/clients'),
            ]);
            setServices(servicesData);
            setPackages(packagesData);

            // Get balances for each client
            const clientsWithBalances = await Promise.all(
                clientsData.items.map(async (client) => {
                    try {
                        const balance = await api<number>(`/api/pines/balance/${client.id}`);
                        return { ...client, balance };
                    } catch {
                        return { ...client, balance: 0 };
                    }
                })
            );
            setClients(clientsWithBalances);
        } catch (error) {
            console.error('Failed to load data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }

    async function handleAddPines() {
        if (!selectedClient || !pineAmount) return;

        setSubmitting(true);
        try {
            await api(`/api/admin/clients/${selectedClient}/pines`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseInt(pineAmount, 10),
                    type: pineType,
                    description: pineNote || `Admin ${pineType}`,
                    notes: pineNote,
                }),
            });

            toast.success(`Pines ${pineType === 'purchase' ? 'added' : 'deducted'} successfully`);
            setAddPinesOpen(false);
            setPineAmount('');
            setPineNote('');
            loadData(); // Refresh
        } catch (error) {
            console.error('Failed to add pines:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to add pines');
        } finally {
            setSubmitting(false);
        }
    }

    async function toggleServiceActive(id: string, isActive: boolean) {
        try {
            await api(`/api/admin/services/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !isActive }),
            });
            toast.success(`Service ${isActive ? 'deactivated' : 'activated'}`);
            loadData();
        } catch (error) {
            toast.error('Failed to update service');
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="space-y-6 animate-fade-in">
                <PageHeader
                    title="🌲 Pines Management"
                    description="Manage service catalog, packages, and client balances"
                />

                <Tabs defaultValue="services" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="services" className="gap-2">
                            <Settings className="h-4 w-4" />
                            Service Catalog
                        </TabsTrigger>
                        <TabsTrigger value="packages" className="gap-2">
                            <TreePine className="h-4 w-4" />
                            Pine Packages
                        </TabsTrigger>
                        <TabsTrigger value="clients" className="gap-2">
                            <Users className="h-4 w-4" />
                            Client Balances
                        </TabsTrigger>
                    </TabsList>

                    {/* Service Catalog Tab */}
                    <TabsContent value="services">
                        <Card>
                            <CardHeader>
                                <CardTitle>Service Types</CardTitle>
                                <CardDescription>Video editing services with pine costs</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Service</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead className="text-center">Pine Cost</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {services.map((service) => (
                                            <TableRow key={service.id}>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{service.name}</p>
                                                        {service.description && (
                                                            <p className="text-xs text-muted-foreground">{service.description}</p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {CATEGORY_LABELS[service.category] || service.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                                        {service.pineCost} 🌲
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={service.isActive ? 'default' : 'secondary'}>
                                                        {service.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => toggleServiceActive(service.id, service.isActive)}
                                                    >
                                                        {service.isActive ? (
                                                            <X className="h-4 w-4 text-red-500" />
                                                        ) : (
                                                            <Check className="h-4 w-4 text-green-500" />
                                                        )}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Pine Packages Tab */}
                    <TabsContent value="packages">
                        <Card>
                            <CardHeader>
                                <CardTitle>Pine Packages</CardTitle>
                                <CardDescription>Purchase options for clients</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {packages.map((pkg) => (
                                        <Card key={pkg.id} className={cn(pkg.isFeatured && 'border-primary')}>
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between">
                                                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                                                    {pkg.isFeatured && <Badge>Featured</Badge>}
                                                </div>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-2">
                                                    <p className="text-2xl font-bold">{pkg.pineCount} 🌲</p>
                                                    <p className="text-lg">${pkg.totalPrice.toLocaleString()}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        ${pkg.pricePerPine.toFixed(2)} per pine
                                                    </p>
                                                    <Badge variant={pkg.isActive ? 'default' : 'secondary'}>
                                                        {pkg.isActive ? 'Active' : 'Inactive'}
                                                    </Badge>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Client Balances Tab */}
                    <TabsContent value="clients">
                        <Card>
                            <CardHeader>
                                <CardTitle>Client Balances</CardTitle>
                                <CardDescription>View and manage client pine balances</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Client</TableHead>
                                            <TableHead>Company</TableHead>
                                            <TableHead className="text-center">Balance</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {clients.map((client) => (
                                            <TableRow key={client.id}>
                                                <TableCell className="font-medium">{client.name}</TableCell>
                                                <TableCell className="text-muted-foreground">{client.company}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-base px-3 py-1">
                                                        {client.balance} 🌲
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Dialog open={addPinesOpen && selectedClient === client.id} onOpenChange={(open) => {
                                                        setAddPinesOpen(open);
                                                        if (open) setSelectedClient(client.id);
                                                    }}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">
                                                                <Plus className="h-4 w-4 mr-1" />
                                                                Add/Deduct
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Manage Pines for {client.name}</DialogTitle>
                                                                <DialogDescription>
                                                                    Add or deduct pines from this client's balance
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <div className="space-y-4 py-4">
                                                                <div className="space-y-2">
                                                                    <Label>Type</Label>
                                                                    <Select value={pineType} onValueChange={(v) => setPineType(v as 'purchase' | 'usage')}>
                                                                        <SelectTrigger>
                                                                            <SelectValue />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="purchase">Add Pines (+)</SelectItem>
                                                                            <SelectItem value="usage">Deduct Pines (-)</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Amount</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={pineAmount}
                                                                        onChange={(e) => setPineAmount(e.target.value)}
                                                                        placeholder="Enter amount"
                                                                    />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <Label>Note (optional)</Label>
                                                                    <Input
                                                                        value={pineNote}
                                                                        onChange={(e) => setPineNote(e.target.value)}
                                                                        placeholder="Reason for adjustment"
                                                                    />
                                                                </div>
                                                            </div>
                                                            <DialogFooter>
                                                                <Button variant="outline" onClick={() => setAddPinesOpen(false)}>
                                                                    Cancel
                                                                </Button>
                                                                <Button onClick={handleAddPines} disabled={submitting || !pineAmount}>
                                                                    {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                                                    {pineType === 'purchase' ? 'Add Pines' : 'Deduct Pines'}
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
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
