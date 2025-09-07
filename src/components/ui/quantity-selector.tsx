import React from 'react';
import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  maxStock?: number;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

const QuantitySelector = ({ 
  quantity, 
  onQuantityChange, 
  maxStock, 
  disabled = false,
  size = 'default'
}: QuantitySelectorProps) => {
  const handleDecrease = () => {
    if (quantity > 1 && !disabled) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (!disabled && (maxStock === undefined || quantity < maxStock)) {
      onQuantityChange(quantity + 1);
    }
  };

  const buttonSizeClasses = {
    sm: 'h-6 w-6',
    default: 'h-8 w-8', 
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-sm px-2',
    default: 'text-base px-3',
    lg: 'text-lg px-4'
  };

  return (
    <div className="flex items-center space-x-1 bg-background border rounded-lg">
      <Button
        variant="ghost"
        size="icon"
        className={`${buttonSizeClasses[size]} hover:bg-accent`}
        onClick={handleDecrease}
        disabled={disabled || quantity <= 1}
      >
        <Minus className="h-3 w-3" />
      </Button>
      
      <div className={`${textSizeClasses[size]} font-medium text-center min-w-[2rem] flex items-center justify-center`}>
        {quantity}
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className={`${buttonSizeClasses[size]} hover:bg-accent`}
        onClick={handleIncrease}
        disabled={disabled || (maxStock !== undefined && quantity >= maxStock)}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default QuantitySelector;