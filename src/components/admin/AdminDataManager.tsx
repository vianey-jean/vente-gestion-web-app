import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ConfirmationCodeModal } from '@/components/auth/ConfirmationCodeModal';
import { useConfirmationCheck } from '@/hooks/useConfirmationCheck';
import axios from 'axios';
import { Trash2, Edit, Plus, Database, Package, ShoppingCart, Users, MessageSquare } from 'lucide-react';

interface Product {
  id: string;
  description: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
}

interface Sale {
  id: string;
  date: string;
  description: string;
  quantitySold: number;
  sellingPrice: number;
  purchasePrice: number;
  profit: number;
  clientName: string;
  products?: Product[];
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  createdAt: string;
}

interface Message {
  id: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

const AdminDataManager: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<string>('');
  const { toast } = useToast();

  const {
    showConfirmationModal,
    checkConfirmationAndExecute,
    handleConfirmationSuccess,
    handleConfirmationClose
  } = useConfirmationCheck();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://server-gestion-ventes.onrender.com';

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const [productsRes, salesRes, clientsRes, messagesRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/products`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/sales`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/clients`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API_BASE_URL}/api/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setProducts(productsRes.data || []);
      setSales(salesRes.data || []);
      setClients(clientsRes.data || []);
      setMessages(messagesRes.data || []);
    } catch (error: any) {
      if (error.response?.data?.requiresConfirmation) {
        checkConfirmationAndExecute(() => fetchData());
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item });
    setEditingType(type);
  };

  const handleSave = async () => {
    if (!editingItem || !editingType) return;

    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch (editingType) {
        case 'product':
          endpoint = `/api/products/${editingItem.id}`;
          break;
        case 'sale':
          endpoint = `/api/sales/${editingItem.id}`;
          break;
        case 'client':
          endpoint = `/api/clients/${editingItem.id}`;
          break;
        case 'message':
          endpoint = `/api/messages/${editingItem.id}`;
          break;
      }

      await axios.put(`${API_BASE_URL}${endpoint}`, editingItem, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Succès",
        description: "Élément mis à jour avec succès",
        className: "bg-green-500 text-white",
      });

      setEditingItem(null);
      setEditingType('');
      fetchData();
    } catch (error: any) {
      if (error.response?.data?.requiresConfirmation) {
        checkConfirmationAndExecute(() => handleSave());
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'élément",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, type: string) => {
    try {
      const token = localStorage.getItem('token');
      let endpoint = '';
      
      switch (type) {
        case 'product':
          endpoint = `/api/products/${id}`;
          break;
        case 'sale':
          endpoint = `/api/sales/${id}`;
          break;
        case 'client':
          endpoint = `/api/clients/${id}`;
          break;
        case 'message':
          endpoint = `/api/messages/${id}`;
          break;
      }

      await axios.delete(`${API_BASE_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast({
        title: "Succès",
        description: "Élément supprimé avec succès",
        className: "bg-green-500 text-white",
      });

      fetchData();
    } catch (error: any) {
      if (error.response?.data?.requiresConfirmation) {
        checkConfirmationAndExecute(() => handleDelete(id, type));
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'élément",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkConfirmationAndExecute(() => fetchData());
  }, []);

  const handleConfirmationSuccessWrapper = () => {
    handleConfirmationSuccess();
    fetchData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Database className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Gestion des Données</h2>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Produits ({products.length})
          </TabsTrigger>
          <TabsTrigger value="sales" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Ventes ({sales.length})
          </TabsTrigger>
          <TabsTrigger value="clients" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Clients ({clients.length})
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages ({messages.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Produits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{product.description}</h4>
                      <p className="text-sm text-muted-foreground">
                        Prix achat: {product.purchasePrice}€ | Prix vente: {product.sellingPrice}€ | Stock: {product.quantity}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product, 'product')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(product.id, 'product')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Ventes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{sale.description || 'Vente multi-produits'}</h4>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(sale.date).toLocaleDateString()} | 
                        Client: {sale.clientName} | 
                        Profit: {sale.profit}€
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(sale, 'sale')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(sale.id, 'sale')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{client.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Email: {client.email} | Téléphone: {client.phone}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(client, 'client')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(client.id, 'client')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{message.subject}</h4>
                        {!message.isRead && <Badge variant="destructive">Non lu</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        De: {message.senderName} ({message.senderEmail})
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Date: {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(message, 'message')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(message.id, 'message')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal d'édition */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier {editingType}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {editingType === 'product' && (
                <>
                  <div>
                    <Label>Description</Label>
                    <Input
                      value={editingItem.description || ''}
                      onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Prix d'achat</Label>
                    <Input
                      type="number"
                      value={editingItem.purchasePrice || ''}
                      onChange={(e) => setEditingItem({...editingItem, purchasePrice: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Prix de vente</Label>
                    <Input
                      type="number"
                      value={editingItem.sellingPrice || ''}
                      onChange={(e) => setEditingItem({...editingItem, sellingPrice: parseFloat(e.target.value)})}
                    />
                  </div>
                  <div>
                    <Label>Quantité</Label>
                    <Input
                      type="number"
                      value={editingItem.quantity || ''}
                      onChange={(e) => setEditingItem({...editingItem, quantity: parseInt(e.target.value)})}
                    />
                  </div>
                </>
              )}

              {editingType === 'client' && (
                <>
                  <div>
                    <Label>Nom</Label>
                    <Input
                      value={editingItem.name || ''}
                      onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={editingItem.email || ''}
                      onChange={(e) => setEditingItem({...editingItem, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Téléphone</Label>
                    <Input
                      value={editingItem.phone || ''}
                      onChange={(e) => setEditingItem({...editingItem, phone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Adresse</Label>
                    <Textarea
                      value={editingItem.address || ''}
                      onChange={(e) => setEditingItem({...editingItem, address: e.target.value})}
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Annuler
                </Button>
                <Button onClick={handleSave}>
                  Sauvegarder
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmationCodeModal
        isOpen={showConfirmationModal}
        onClose={handleConfirmationClose}
        onSuccess={handleConfirmationSuccessWrapper}
      />
    </div>
  );
};

export default AdminDataManager;