
import React, { useState, useEffect } from 'react';
import AdminLayout from './AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { paiementRemboursementAPI } from '@/services/paiementRemboursementAPI';
import { PaiementRemboursement } from '@/types/paiementRemboursement';
import { 
  CreditCard, 
  Truck, 
  CheckCircle, 
  Clock, 
  Package,
  MapPin,
  Phone,
  Receipt,
  User,
  Mail,
  RefreshCw
} from 'lucide-react';
import { io } from 'socket.io-client';

const AdminPaiementRemboursementPage: React.FC = () => {
  const [paiements, setPaiements] = useState<PaiementRemboursement[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadPaiements();
    
    // Socket connection for real-time updates
    const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:10000');
    
    socket.on('paiement-remboursement-created', (newPaiement: PaiementRemboursement) => {
      if (newPaiement.decision === 'accepté') {
        setPaiements(prev => [...prev, newPaiement]);
      }
    });
    
    socket.on('paiement-remboursement-updated', (updatedPaiement: PaiementRemboursement) => {
      setPaiements(prev => prev.map(p => 
        p.id === updatedPaiement.id ? updatedPaiement : p
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const loadPaiements = async () => {
    try {
      setLoading(true);
      const response = await paiementRemboursementAPI.getAll();
      setPaiements(response.data);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
      toast.error('Erreur lors du chargement des paiements');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      await paiementRemboursementAPI.updateStatus(id, newStatus);
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur mise à jour statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'debut':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">Début</Badge>;
      case 'en cours':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">En cours</Badge>;
      case 'payé':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">Payé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'cash':
        return 'Paiement à la livraison';
      case 'card':
        return 'Carte bancaire';
      case 'paypal':
        return 'PayPal';
      case 'apple_pay':
        return 'Apple Pay';
      default:
        return method;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Truck className="h-5 w-5 text-orange-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-blue-500" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Paiement Remboursement</h1>
            <p className="text-muted-foreground">
              Gérez les remboursements acceptés ({paiements.length} en attente)
            </p>
          </div>
          <Button onClick={loadPaiements} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Actualiser
          </Button>
        </div>

        {paiements.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Receipt className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Aucun remboursement en attente</h2>
              <p className="text-muted-foreground">
                Tous les remboursements ont été traités.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {paiements.map((paiement) => (
              <Card key={paiement.id} className="overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-lg">
                        Remboursement #{paiement.id}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Commande: {paiement.orderId}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      {getStatusBadge(paiement.status)}
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Changer statut:</span>
                        <Select
                          value={paiement.status}
                          onValueChange={(value) => handleStatusChange(paiement.id, value)}
                          disabled={updatingId === paiement.id}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="debut">Début</SelectItem>
                            <SelectItem value="en cours">En cours</SelectItem>
                            <SelectItem value="payé">Payé</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {paiement.clientValidated && (
                        <Badge className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Validé par client
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-6">
                  {/* Client Info */}
                  <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      Informations client
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{paiement.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{paiement.userEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Progress */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Progression du remboursement</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex-1 h-2 rounded-full ${
                        paiement.status === 'debut' || paiement.status === 'en cours' || paiement.status === 'payé' 
                          ? 'bg-green-500' : 'bg-muted'
                      }`} />
                      <div className={`flex-1 h-2 rounded-full ${
                        paiement.status === 'en cours' || paiement.status === 'payé' 
                          ? 'bg-green-500' : 'bg-muted'
                      }`} />
                      <div className={`flex-1 h-2 rounded-full ${
                        paiement.status === 'payé' ? 'bg-green-500' : 'bg-muted'
                      }`} />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Début</span>
                      <span>En cours</span>
                      <span>Payé</span>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Payment Method */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      {getPaymentMethodIcon(paiement.order.paymentMethod)}
                      Mode de remboursement
                    </h3>
                    <p className="text-muted-foreground">
                      {getPaymentMethodLabel(paiement.order.paymentMethod)}
                    </p>
                  </div>

                  <Separator className="my-4" />

                  {/* Order Details */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Package className="h-5 w-5 text-purple-500" />
                      Détails de la commande
                    </h3>
                    
                    <div className="space-y-3">
                      {paiement.order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                          {item.image && (
                            <img 
                              src={`${import.meta.env.VITE_API_BASE_URL}${item.image}`}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-lg"
                            />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Quantité: {item.quantity} × {formatCurrency(item.price)}
                            </p>
                          </div>
                          <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Shipping Address */}
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-red-500" />
                      Adresse de livraison
                    </h3>
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <p>{paiement.order.shippingAddress.prenom} {paiement.order.shippingAddress.nom}</p>
                      <p>{paiement.order.shippingAddress.adresse}</p>
                      <p>{paiement.order.shippingAddress.codePostal} {paiement.order.shippingAddress.ville}</p>
                      <p>{paiement.order.shippingAddress.pays}</p>
                      <p className="flex items-center gap-2 mt-2">
                        <Phone className="h-4 w-4" />
                        {paiement.order.shippingAddress.telephone}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  {/* Total */}
                  <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Montant à rembourser</span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(paiement.order.totalAmount)}
                      </span>
                    </div>
                    {paiement.order.discount > 0 && (
                      <p className="text-sm text-muted-foreground mt-1">
                        (Remise appliquée: {formatCurrency(paiement.order.discount)})
                      </p>
                    )}
                  </div>

                  {/* Reason */}
                  <div className="mt-4 p-4 bg-yellow-500/10 rounded-lg">
                    <h4 className="font-medium mb-1">Raison du remboursement</h4>
                    <p className="text-muted-foreground">{paiement.reason}</p>
                    {paiement.customReason && (
                      <p className="text-muted-foreground mt-1 text-sm">{paiement.customReason}</p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="mt-4 flex flex-col md:flex-row gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Créé le: {formatDate(paiement.createdAt)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Mis à jour: {formatDate(paiement.updatedAt)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPaiementRemboursementPage;
