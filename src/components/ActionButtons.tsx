
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

interface ActionButtonsProps {
  onAdd: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSearch: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAdd,
  onEdit,
  onDelete,
  onSearch
}) => {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <Button onClick={onAdd} className="flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Ajouter
      </Button>
      
      <Button onClick={onEdit} variant="outline" className="flex items-center gap-2">
        <Edit className="h-4 w-4" />
        Modifier
      </Button>
      
      <Button onClick={onDelete} variant="destructive" className="flex items-center gap-2">
        <Trash2 className="h-4 w-4" />
        Supprimer
      </Button>
      
      <Button onClick={onSearch} variant="outline" className="flex items-center gap-2">
        <Search className="h-4 w-4" />
        Rechercher
      </Button>
    </div>
  );
};

export default ActionButtons;
