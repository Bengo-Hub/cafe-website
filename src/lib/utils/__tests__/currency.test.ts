import { formatCurrency, formatPrice } from '../currency';

describe('Currency Utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1000)).toBe('KES 1,000');
      expect(formatCurrency(1500)).toBe('KES 1,500');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('KES 0');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1000000)).toBe('KES 1,000,000');
    });
  });

  describe('formatPrice', () => {
    it('should format price with KES prefix', () => {
      expect(formatPrice(850)).toBe('KES 850');
      expect(formatPrice(1200)).toBe('KES 1,200');
    });
  });
});
