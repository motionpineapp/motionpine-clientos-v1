import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/PageHeader';
import { clientService } from '@/services/clients';
import { Client } from '@shared/types';
import { Search, MoreHorizontal, Plus, Filter, Loader2, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { ClientForm } from '@/components/forms/ClientForm';
export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  useEffect(() => {
    loadClients();
  }, []);
  const loadClients = async () => {
    try {
      setIsLoading(true);
      const data = await clientService.getClients();
      setClients(data.items);
    } catch (error) {
      toast.error('Failed to load clients');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      if (selectedClient) {
        // Update existing client
        await clientService.updateClient(selectedClient.id, data);
        toast.success('Client updated successfully!');
      } else {
        // Create new client
        const newClientData = {
          ...data,
          joinedAt: new Date().toISOString(),
          totalProjects: 0,
          totalRevenue: 0,
        };
        await clientService.createClient(newClientData);
        toast.success('Client created successfully!');
      }
      setIsModalOpen(false);
      setSelectedClient(null);
      loadClients();
    } catch (error) {
      toast.error(`Failed to ${selectedClient ? 'update' : 'create'} client.`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };
  const openModalForEdit = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };
  const openModalForCreate = () => {
    setSelectedClient(null);
    setIsModalOpen(true);
  };
  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200';
      case 'paused': return 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200';
      case 'inactive': return 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Clients"
        description="Manage your client relationships and accounts."
      >
        <Button onClick={openModalForCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Client
        </Button>
      </PageHeader>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedClient ? 'Edit Client' : 'Add New Client'}</DialogTitle>
            <DialogDescription>
              {selectedClient ? 'Update the details for this client account.' : 'Enter the details for the new client account.'}
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
            defaultValues={selectedClient || undefined}
          />
        </DialogContent>
      </Dialog>
      {/* Filters & Search */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            className="pl-10 bg-gray-50 border-gray-200 focus-visible:ring-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>
      {/* Data Table */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[300px]">Client</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center">
                  <div className="flex items-center justify-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading clients...
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No clients found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
                <TableRow
                  key={client.id}
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border border-gray-100">
                        <AvatarImage src={client.avatar} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.company}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getStatusColor(client.status)}>
                      {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{client.totalProjects} Active</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      ${client.totalRevenue.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground text-sm">
                      {new Date(client.joinedAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openModalForEdit(client)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Message Client
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Deactivate Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}