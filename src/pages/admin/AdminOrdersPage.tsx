
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/sonner';
import { Search, ArrowDown, ArrowUp } from 'lucide-react';
import { Order, ordersAPI } from '@/services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Order>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAllOrders();
      setOrders(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      toast.error('Impossible de charger les commandes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await ordersAPI.updateStatus(orderId, status);
      toast.success('Statut de la commande mis à jour');
      loadOrders();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Impossible de mettre à jour le statut');
    }
  };

  const handleSort = (field: keyof Order) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmée':
        return 'bg-blue-100 text-blue-800';
      case 'en préparation':
        return 'bg-yellow-100 text-yellow-800';
      case 'en livraison':
        return 'bg-purple-100 text-purple-800';
      case 'livrée':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    return order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortField === 'totalAmount') {
      return sortDirection === 'asc' ? a.totalAmount - b.totalAmount : b.totalAmount - a.totalAmount;
    }
    
    if (sortField === 'createdAt') {
      return sortDirection === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    
    return 0;
  });

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gestion des commandes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Rechercher par ID ou produit..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-800"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('id')}>
                      ID {sortField === 'id' && (sortDirection === 'asc' ? <ArrowUp size={14} className="inline" /> : <ArrowDown size={14} className="inline" />)}
                    </TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('createdAt')}>
                      Date {sortField === 'createdAt' && (sortDirection === 'asc' ? <ArrowUp size={14} className="inline" /> : <ArrowDown size={14} className="inline" />)}
                    </TableHead>
                    <TableHead className="cursor-pointer" onClick={() => handleSort('totalAmount')}>
                      Montant {sortField === 'totalAmount' && (sortDirection === 'asc' ? <ArrowUp size={14} className="inline" /> : <ArrowDown size={14} className="inline" />)}
                    </TableHead>
                    <TableHead>Produits</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.userId}</TableCell>
                      <TableCell>{format(new Date(order.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}</TableCell>
                      <TableCell>{order.totalAmount.toFixed(2)} €</TableCell>
                      <TableCell>{order.items.length} article(s)</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                          defaultValue={order.status}
                        >
                          <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Changer le statut" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="confirmée">Confirmée</SelectItem>
                            <SelectItem value="en préparation">En préparation</SelectItem>
                            <SelectItem value="en livraison">En livraison</SelectItem>
                            <SelectItem value="livrée">Livrée</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                  
                  {sortedOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                        Aucune commande trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrdersPage;
