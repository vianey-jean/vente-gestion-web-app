describe('Complete Shopping Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete full purchase flow with quantity selection', () => {
    // Navigate to product
    cy.get('[data-testid="product-card"]').first().click();
    
    // Select quantity
    cy.get('[data-testid="quantity-plus"]').click();
    cy.get('[data-testid="quantity-display"]').should('contain', '2');
    
    // Add to cart
    cy.get('[data-testid="add-to-cart"]').click();
    
    // Verify cart notification
    cy.contains('ajouté au panier').should('be.visible');
    
    // Go to cart
    cy.get('[data-testid="cart-icon"]').click();
    
    // Verify cart contents
    cy.get('[data-testid="cart-item"]').should('exist');
    cy.get('[data-testid="cart-item-quantity"]').should('contain', '2');
    
    // Proceed to checkout
    cy.get('[data-testid="checkout-button"]').click();
    
    // Login if needed
    cy.url().then((url) => {
      if (url.includes('/login')) {
        cy.get('[data-testid="email-input"]').type('test@example.com');
        cy.get('[data-testid="password-input"]').type('password123');
        cy.get('[data-testid="login-button"]').click();
      }
    });
    
    // Fill shipping information
    cy.get('[data-testid="shipping-form"]').within(() => {
      cy.get('input[name="firstName"]').type('John');
      cy.get('input[name="lastName"]').type('Doe');
      cy.get('input[name="email"]').type('john@example.com');
      cy.get('input[name="phone"]').type('+33123456789');
      cy.get('input[name="street"]').type('123 Test Street');
      cy.get('input[name="city"]').type('Paris');
      cy.get('input[name="postalCode"]').type('75001');
    });
    
    // Continue to payment
    cy.get('[data-testid="continue-to-payment"]').click();
    
    // Select payment method
    cy.get('[data-testid="payment-method-card"]').click();
    
    // Place order
    cy.get('[data-testid="place-order"]').click();
    
    // Verify order confirmation
    cy.url().should('include', '/order');
    cy.contains('Commande confirmée').should('be.visible');
  });

  it('should handle stock validation', () => {
    // Visit product with limited stock
    cy.visit('/product/limited-stock-product');
    
    // Try to add more than available stock
    cy.get('[data-testid="quantity-plus"]').click().click().click();
    
    // Plus button should be disabled when stock limit reached
    cy.get('[data-testid="quantity-plus"]').should('be.disabled');
    
    // Quantity should not exceed stock
    cy.get('[data-testid="quantity-display"]').should('not.contain', '99');
  });
});