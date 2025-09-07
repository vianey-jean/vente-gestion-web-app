# 🧪 Guide des Tests - Riziky-Boutic

## 📋 Vue d'Ensemble des Tests

Ce guide détaille la stratégie de test complète pour la plateforme Riziky-Boutic, incluant les tests unitaires, d'intégration et end-to-end.

---

## 🔧 Configuration des Tests

### Tests Unitaires (Vitest + React Testing Library)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    css: true,
  },
});
```

### Tests E2E (Cypress)

```javascript
// cypress.config.js
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:8080',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}'
  },
});
```

---

## ✅ Tests Composants Essentiels

### QuantitySelector Tests

```typescript
// tests/components/ui/QuantitySelector.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuantitySelector } from '@/components/ui/quantity-selector';

describe('QuantitySelector', () => {
  it('should increase quantity when plus button is clicked', () => {
    const onQuantityChange = vi.fn();
    render(<QuantitySelector onQuantityChange={onQuantityChange} />);
    
    const plusButton = screen.getByRole('button', { name: /plus/i });
    fireEvent.click(plusButton);
    
    expect(onQuantityChange).toHaveBeenCalledWith(2);
  });

  it('should disable plus button when max stock reached', () => {
    render(<QuantitySelector maxStock={1} initialQuantity={1} />);
    
    const plusButton = screen.getByRole('button', { name: /plus/i });
    expect(plusButton).toBeDisabled();
  });
});
```

### ProductCard Tests

```typescript
// tests/components/products/ProductCard.test.tsx
describe('ProductCard', () => {
  const mockProduct = {
    id: 'prod123',
    name: 'Test Product',
    price: 99.99,
    stock: 10,
    images: ['/test-image.jpg']
  };

  it('should add product to cart with selected quantity', async () => {
    const mockAddToCart = vi.fn();
    render(<ProductCard product={mockProduct} />);
    
    // Increase quantity to 2
    const plusButton = screen.getByTestId('quantity-plus');
    fireEvent.click(plusButton);
    
    // Add to cart
    const addButton = screen.getByText(/ajouter au panier/i);
    fireEvent.click(addButton);
    
    expect(mockAddToCart).toHaveBeenCalledWith('prod123', 2);
  });
});
```

---

## 🚀 Tests E2E Cypress

### Shopping Flow Complete

```typescript
// cypress/e2e/shopping-flow.cy.ts
describe('Complete Shopping Flow', () => {
  it('should complete full purchase flow with quantity selection', () => {
    cy.visit('/');
    
    // Navigate to product
    cy.get('[data-testid="product-card"]').first().click();
    
    // Select quantity
    cy.get('[data-testid="quantity-plus"]').click();
    cy.get('[data-testid="quantity-display"]').should('contain', '2');
    
    // Add to cart
    cy.get('[data-testid="add-to-cart"]').click();
    
    // Verify cart
    cy.get('[data-testid="cart-icon"]').click();
    cy.get('[data-testid="cart-item-quantity"]').should('contain', '2');
    
    // Proceed to checkout
    cy.get('[data-testid="checkout-button"]').click();
    
    // Fill shipping form
    cy.fillShippingForm();
    
    // Complete order
    cy.get('[data-testid="place-order"]').click();
    cy.url().should('include', '/order-confirmation');
  });
});
```

### Chat Functionality

```typescript
// cypress/e2e/chat.cy.ts
describe('Real-time Chat', () => {
  beforeEach(() => {
    cy.login('client@test.com', 'password');
  });

  it('should send and receive messages', () => {
    cy.visit('/');
    
    // Open chat widget
    cy.get('[data-testid="chat-widget"]').click();
    
    // Send message
    cy.get('[data-testid="chat-input"]').type('Hello, I need help');
    cy.get('[data-testid="send-message"]').click();
    
    // Verify message sent
    cy.get('[data-testid="chat-messages"]')
      .should('contain', 'Hello, I need help');
  });
});
```

---

Cette documentation des tests assure une couverture complète des fonctionnalités critiques de la plateforme, garantissant la qualité et la fiabilité du code.