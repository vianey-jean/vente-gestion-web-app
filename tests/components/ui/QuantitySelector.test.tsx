import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuantitySelector } from '@/components/ui/quantity-selector';

describe('QuantitySelector', () => {
  it('should render with initial quantity', () => {
    render(<QuantitySelector onQuantityChange={vi.fn()} initialQuantity={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('should increase quantity when plus button is clicked', () => {
    const onQuantityChange = vi.fn();
    render(<QuantitySelector onQuantityChange={onQuantityChange} />);
    
    const plusButton = screen.getByRole('button', { name: /plus/i });
    fireEvent.click(plusButton);
    
    expect(onQuantityChange).toHaveBeenCalledWith(2);
  });

  it('should decrease quantity when minus button is clicked', () => {
    const onQuantityChange = vi.fn();
    render(<QuantitySelector onQuantityChange={onQuantityChange} initialQuantity={3} />);
    
    const minusButton = screen.getByRole('button', { name: /minus/i });
    fireEvent.click(minusButton);
    
    expect(onQuantityChange).toHaveBeenCalledWith(2);
  });

  it('should disable plus button when max stock reached', () => {
    render(<QuantitySelector maxStock={1} initialQuantity={1} onQuantityChange={vi.fn()} />);
    
    const plusButton = screen.getByRole('button', { name: /plus/i });
    expect(plusButton).toBeDisabled();
  });

  it('should disable minus button at minimum quantity', () => {
    render(<QuantitySelector initialQuantity={1} onQuantityChange={vi.fn()} />);
    
    const minusButton = screen.getByRole('button', { name: /minus/i });
    expect(minusButton).toBeDisabled();
  });
});