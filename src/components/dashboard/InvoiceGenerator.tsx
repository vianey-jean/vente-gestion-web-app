
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FileText, Search, Calendar, User, Receipt, Download, Sparkles, CreditCard } from 'lucide-react';
import { Sale } from '@/types';
import { generateInvoicePDF } from './utils/invoiceGenerator';
import useCurrencyFormatter from '@/hooks/use-currency-formatter';

interface InvoiceGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'year' | 'customer' | 'invoice'>('year');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [yearSales, setYearSales] = useState<Sale[]>([]);
  const [customerSales, setCustomerSales] = useState<Sale[]>([]);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { formatEuro } = useCurrencyFormatter();

  // Rechercher les ventes par année
  const searchByYear = async () => {
    if (!selectedYear) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une année valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/sales/by-year/${selectedYear}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des ventes');
      }

      const sales = await response.json();
      setYearSales(sales);
      setStep('customer');
      
      toast({
        title: "Succès",
        description: `${sales.length} vente(s) trouvée(s) pour l'année ${selectedYear}`,
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les ventes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Rechercher les ventes par nom de client
  const searchByCustomer = async () => {
    if (!customerSearch || customerSearch.length < 3) {
      toast({
        title: "Erreur",
        description: "Le nom du client doit contenir au moins 3 caractères",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `/api/sales/search-customer?customerName=${encodeURIComponent(customerSearch)}&year=${selectedYear}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche client');
      }

      const sales = await response.json();
      setCustomerSales(sales);
      
      if (sales.length === 0) {
        toast({
          title: "Aucun résultat",
          description: `Aucune vente trouvée pour "${customerSearch}" en ${selectedYear}`,
          variant: "default",
        });
      } else {
        toast({
          title: "Succès",
          description: `${sales.length} vente(s) trouvée(s) pour "${customerSearch}"`,
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de rechercher les ventes du client",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Sélectionner une vente pour la facture
  const selectSaleForInvoice = (sale: Sale) => {
    setSelectedSale(sale);
    setStep('invoice');
  };

  // Générer la facture PDF
  const generateInvoice = async () => {
    if (!selectedSale) return;

    setIsLoading(true);
    try {
      await generateInvoicePDF(selectedSale);
      
      toast({
        title: "Succès",
        description: "Facture générée avec succès",
        variant: "default",
        className: "notification-success",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération de la facture",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setStep('year');
    setSelectedYear(new Date().getFullYear().toString());
    setCustomerSearch('');
    setYearSales([]);
    setCustomerSales([]);
    setSelectedSale(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            <Sparkles className="h-6 w-6 mr-3 text-purple-600" />
            Générateur de Factures Premium
          </DialogTitle>
        </DialogHeader>

        {/* Étape 1: Sélection de l'année */}
        {step === 'year' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-xl border border-blue-200">
              <div className="flex items-center mb-4">
                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-xl font-semibold text-blue-800">Sélectionner l'année</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="year" className="text-sm font-medium text-gray-700">
                    Année de paiement
                  </Label>
                  <Input
                    id="year"
                    type="number"
                    min="2020"
                    max="2030"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full mt-1 text-center text-lg font-semibold"
                    placeholder="2024"
                  />
                </div>
                
                <Button
                  onClick={searchByYear}
                  disabled={isLoading || !selectedYear}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transform transition hover:scale-105"
                >
                  <Search className="h-5 w-5 mr-2" />
                  {isLoading ? 'Recherche...' : 'Rechercher les ventes'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Étape 2: Recherche par client */}
        {step === 'customer' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-xl border border-green-200">
              <div className="flex items-center mb-4">
                <User className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-xl font-semibold text-green-800">
                  Rechercher un client ({yearSales.length} ventes en {selectedYear})
                </h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customerSearch" className="text-sm font-medium text-gray-700">
                    Nom du client (minimum 3 caractères)
                  </Label>
                  <Input
                    id="customerSearch"
                    type="text"
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full mt-1"
                    placeholder="Saisir le nom du client..."
                    onKeyPress={(e) => e.key === 'Enter' && searchByCustomer()}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={searchByCustomer}
                    disabled={isLoading || customerSearch.length < 3}
                    className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold py-3 rounded-xl shadow-lg transform transition hover:scale-105"
                  >
                    <Search className="h-5 w-5 mr-2" />
                    {isLoading ? 'Recherche...' : 'Rechercher'}
                  </Button>
                  
                  <Button
                    onClick={() => setStep('year')}
                    variant="outline"
                    className="px-6 py-3 rounded-xl border-2 hover:bg-gray-50"
                  >
                    Retour
                  </Button>
                </div>
              </div>
            </div>

            {/* Résultats de recherche client */}
            {customerSales.length > 0 && (
              <div className="bg-white rounded-xl border shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                  <h4 className="text-lg font-semibold text-white flex items-center">
                    <Receipt className="h-5 w-5 mr-2" />
                    Ventes trouvées ({customerSales.length})
                  </h4>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {customerSales.map((sale) => (
                    <div
                      key={sale.id}
                      className="p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => selectSaleForInvoice(sale)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {new Date(sale.date).toLocaleDateString('fr-FR')}
                            </Badge>
                            <span className="font-semibold text-gray-800">{sale.customerName}</span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mb-1">{sale.description}</p>
                          
                          {sale.customerAddress && (
                            <p className="text-xs text-gray-500">{sale.customerAddress}</p>
                          )}
                          
                          {sale.customerPhone && (
                            <p className="text-xs text-gray-500">📞 {sale.customerPhone}</p>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {formatEuro(sale.sellingPrice)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Qté: {sale.quantitySold}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Étape 3: Détails de la facture */}
        {step === 'invoice' && selectedSale && (
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-6 rounded-xl border border-amber-200">
              <div className="flex items-center mb-4">
                <CreditCard className="h-8 w-8 text-amber-600 mr-3" />
                <h3 className="text-xl font-semibold text-amber-800">Détails de la facture</h3>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-inner space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Informations Client</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Nom:</strong> {selectedSale.customerName}</p>
                      {selectedSale.customerAddress && (
                        <p><strong>Adresse:</strong> {selectedSale.customerAddress}</p>
                      )}
                      {selectedSale.customerPhone && (
                        <p><strong>Téléphone:</strong> {selectedSale.customerPhone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Détails du Produit</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Date:</strong> {new Date(selectedSale.date).toLocaleDateString('fr-FR')}</p>
                      <p><strong>Produit:</strong> {selectedSale.description}</p>
                      <p><strong>Quantité:</strong> {selectedSale.quantitySold}</p>
                      <p><strong>Prix unitaire:</strong> {formatEuro(selectedSale.sellingPrice / (selectedSale.quantitySold || 1))}</p>
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Total à payer:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatEuro(selectedSale.sellingPrice)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <Button
                  onClick={generateInvoice}
                  disabled={isLoading}
                  className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-3 rounded-xl shadow-lg transform transition hover:scale-105"
                >
                  <Download className="h-5 w-5 mr-2" />
                  {isLoading ? 'Génération...' : 'Générer la Facture PDF'}
                </Button>
                
                <Button
                  onClick={() => setStep('customer')}
                  variant="outline"
                  className="px-6 py-3 rounded-xl border-2 hover:bg-gray-50"
                >
                  Retour
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceGenerator;
