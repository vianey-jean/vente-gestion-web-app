
/**
 * COMPOSANT DE SAISIE DE PRIX DE VENTE
 * ====================================
 * 
 * Composant spécialisé pour la saisie du prix de vente dans les formulaires.
 * Intègre une validation visuelle pour alerter sur les prix trop bas
 * qui pourraient générer des pertes.
 * 
 * Fonctionnalités principales :
 * - Champ de saisie numérique pour le prix
 * - Validation visuelle des prix négatifs
 * - Message d'alerte pour les pertes potentielles
 * - Gestion des états disabled
 * - Formatage monétaire (euros)
 * 
 * Utilisation :
 * - Formulaires de vente
 * - Calculs de bénéfices
 * - Validation de prix
 */

import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

/**
 * Interface des propriétés du composant SalePriceInput
 * Définit les paramètres de configuration et callbacks
 */
interface SalePriceInputProps {
  price: string; // Prix actuel sous forme de chaîne
  onChange: (price: string) => void; // Callback de changement de prix
  disabled: boolean; // État désactivé du champ
  isProfitNegative?: boolean; // Indicateur de perte potentielle (optionnel)
}

/**
 * Composant SalePriceInput
 * Champ de saisie spécialisé pour les prix de vente avec validation
 * 
 * @param price - Prix actuel à afficher
 * @param onChange - Fonction appelée lors du changement de prix
 * @param disabled - Si true, désactive le champ
 * @param isProfitNegative - Si true, affiche un warning de perte
 */
const SalePriceInput: React.FC<SalePriceInputProps> = ({
  price,
  onChange,
  disabled,
  isProfitNegative = false, // Valeur par défaut: pas de perte
}) => {
  return (
    <div className="space-y-2">
      {/* Ici on attend le label du champ de prix */}
      <Label htmlFor="sellingPrice">Prix de vente (€)</Label>
      
      {/* Ici on attend le champ de saisie du prix */}
      <Input
        id="sellingPrice"
        name="sellingPrice"
        type="number" // Type numérique pour la saisie
        step="0.01" // Permet les centimes d'euro
        min="0" // Prix minimum à 0
        value={price}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={isProfitNegative ? "border-red-500" : ""} // Style d'erreur si perte
      />
      
      {/* Ici on attend le message d'alerte pour les pertes potentielles */}
      {isProfitNegative && (
        <p className="text-xs text-red-500">
          Le prix de vente est trop bas, vous allez faire une perte !
        </p>
      )}
    </div>
  );
};

// Ici on a ajouté l'export par défaut du composant
export default SalePriceInput;
