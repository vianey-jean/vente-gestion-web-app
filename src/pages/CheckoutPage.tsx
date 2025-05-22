import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CreditCard, 
  Check, 
  ChevronRight, 
  MapPin, 
  Truck, 
  Package, 
  Tag,
} from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import { toast } from '@/components/ui/sonner';

interface Address {
  nom: string;
  prenom?: string;
  adresse: string;
  ville: string;
  codePostal: string;
  pays: string;
  telephone?: string;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { selectedCartItems, getCartTotal, createOrder } = useStore();
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    nom: '',
    adresse: '',
    ville: '',
    codePostal: '',
    pays: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedCartItems.length === 0) {
      navigate('/cart');
    }
  }, [selectedCartItems, navigate]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value);
  };

  const handleNext = () => {
    if (step === 1) {
      // Validate address
      if (!shippingAddress.nom || !shippingAddress.adresse || !shippingAddress.ville || !shippingAddress.codePostal || !shippingAddress.pays) {
        toast.error('Veuillez remplir tous les champs d\'adresse.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const order = await createOrder(shippingAddress, paymentMethod);
      if (order) {
        toast.success('Commande créée avec succès!');
        navigate('/commandes');
      } else {
        toast.error('Impossible de créer la commande.');
      }
    } catch (error) {
      console.error("Erreur lors de la soumission de la commande:", error);
      toast.error('Erreur lors de la soumission de la commande.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrice = getCartTotal();

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">Paiement</h1>

        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 1 ? 'bg-brand-blue text-white' : 'bg-gray-300 text-gray-700'}`}>
              {step > 1 ? <Check className="h-4 w-4" /> : '1'}
            </div>
            <span className={`ml-2 ${step > 1 ? 'text-brand-blue font-medium' : 'text-gray-700'}`}>Adresse</span>
            {step > 1 && <ChevronRight className="h-4 w-4 ml-2 text-gray-500" />}
          </div>

          <div className="flex items-center">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 2 ? 'bg-brand-blue text-white' : 'bg-gray-300 text-gray-700'}`}>
              {step > 2 ? <Check className="h-4 w-4" /> : '2'}
            </div>
            <span className={`ml-2 ${step > 2 ? 'text-brand-blue font-medium' : 'text-gray-700'}`}>Paiement</span>
            {step > 2 && <ChevronRight className="h-4 w-4 ml-2 text-gray-500" />}
          </div>

          <div className="flex items-center">
            <div className={`rounded-full h-8 w-8 flex items-center justify-center ${step >= 3 ? 'bg-brand-blue text-white' : 'bg-gray-300 text-gray-700'}`}>
              {step > 3 ? <Check className="h-4 w-4" /> : '3'}
            </div>
            <span className={`ml-2 ${step >= 3 ? 'text-brand-blue font-medium' : 'text-gray-700'}`}>Confirmation</span>
          </div>
        </div>

        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Adresse de livraison</CardTitle>
              <CardDescription>Entrez votre adresse de livraison.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="nom">Nom complet</Label>
                  <Input type="text" id="nom" name="nom" value={shippingAddress.nom} onChange={handleAddressChange} />
                </div>
                <div>
                  <Label htmlFor="telephone">Téléphone (optionnel)</Label>
                  <Input type="tel" id="telephone" name="telephone" value={shippingAddress.telephone || ''} onChange={handleAddressChange} />
                </div>
              </div>
              <div>
                <Label htmlFor="adresse">Adresse</Label>
                <Input type="text" id="adresse" name="adresse" value={shippingAddress.adresse} onChange={handleAddressChange} />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="ville">Ville</Label>
                  <Input type="text" id="ville" name="ville" value={shippingAddress.ville} onChange={handleAddressChange} />
                </div>
                <div>
                  <Label htmlFor="codePostal">Code Postal</Label>
                  <Input type="text" id="codePostal" name="codePostal" value={shippingAddress.codePostal} onChange={handleAddressChange} />
                </div>
                <div>
                  <Label htmlFor="pays">Pays</Label>
                  <Input type="text" id="pays" name="pays" value={shippingAddress.pays} onChange={handleAddressChange} />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleNext}>Suivant</Button>
            </CardFooter>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Paiement</CardTitle>
              <CardDescription>Choisissez votre méthode de paiement.</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handlePaymentMethodChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionner une méthode de paiement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="creditCard">Carte de crédit</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>Précédent</Button>
              <Button onClick={handleNext}>Suivant</Button>
            </CardFooter>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Confirmation</CardTitle>
              <CardDescription>Vérifiez votre commande avant de confirmer.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <h3 className="text-xl font-medium mb-2">Adresse de livraison</h3>
                <p>{shippingAddress.nom}</p>
                <p>{shippingAddress.adresse}</p>
                <p>{shippingAddress.ville}, {shippingAddress.codePostal} {shippingAddress.pays}</p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Méthode de paiement</h3>
                <p>{paymentMethod === 'creditCard' ? 'Carte de crédit' : 'PayPal'}</p>
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Récapitulatif de la commande</h3>
                {selectedCartItems.map(item => (
                  <div key={item.product.id} className="flex justify-between py-2 border-b">
                    <span>{item.product.name} x {item.quantity}</span>
                    <span>{(item.product.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold py-2">
                  <span>Total</span>
                  <span>{totalPrice.toFixed(2)} €</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleBack}>Précédent</Button>
              <Button disabled={isSubmitting} onClick={handleSubmit}>
                {isSubmitting ? 'Soumission...' : 'Confirmer la commande'}
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default CheckoutPage;
