
// Skip backend tests in frontend environment
import { describe, it, expect } from 'vitest';

describe.skip('Backend Product Routes', () => {
  it('should be tested in backend environment', () => {
    expect(true).toBe(true);
  });
});
