
/**
 * COMPOSANT GRID DE BOUTONS MODERNE
 * =================================
 * 
 * Composant de mise en page qui organise les boutons en grille responsive.
 * Utilise CSS Grid pour créer des layouts adaptatifs selon la taille d'écran.
 * 
 * Fonctionnalités principales :
 * - Grille responsive (1-4 colonnes)
 * - Configuration du nombre de colonnes
 * - Classes CSS personnalisables
 * - Adaptation automatique mobile/desktop
 * 
 * Utilisation :
 * - Organiser des boutons d'action
 * - Créer des interfaces de navigation
 * - Structurer des formulaires
 */

import React from 'react';
import { cn } from '@/lib/utils';

/**
 * Interface des propriétés du composant ModernButtonGrid
 * Définit les options de configuration disponibles
 */
interface ModernButtonGridProps {
  children: React.ReactNode; // Contenu à afficher dans la grille
  columns?: 2 | 3 | 4; // Nombre de colonnes (défaut: 3)
  className?: string; // Classes CSS additionnelles
}

/**
 * Composant ModernButtonGrid
 * Organise les éléments enfants en grille responsive
 * 
 * @param children - Éléments à placer dans la grille
 * @param columns - Nombre de colonnes souhaité (2, 3 ou 4)
 * @param className - Classes CSS personnalisées
 */
const ModernButtonGrid: React.FC<ModernButtonGridProps> = ({ 
  children, 
  columns = 3,
  className 
}) => {
  // Ici on attend la définition des classes de grille selon le nombre de colonnes
  const gridClasses = {
    2: 'grid-cols-1 sm:grid-cols-2', // 2 colonnes: 1 sur mobile, 2 sur small+
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3', // 3 colonnes: 1 mobile, 2 small, 3 large+
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' // 4 colonnes: 1 mobile, 2 small, 4 large+
  };

  return (
    <div className={cn(
      'grid gap-4 mb-6', // Classes de base: grille avec espacement et marge
      gridClasses[columns], // Classes responsive selon le nombre de colonnes
      className // Classes personnalisées optionnelles
    )}>
      {/* Ici on attend le rendu des éléments enfants dans la grille */}
      {children}
    </div>
  );
};

// Ici on a ajouté l'export par défaut du composant
export default ModernButtonGrid;
