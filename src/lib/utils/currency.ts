/** "KES 1,000". Built by hand: Intl's currency symbol for KES differs by browser and Node version
 *  ("Ksh", "KES", "KSh"), so the same amount would print differently on different devices. */
export function formatCurrency(amount: number, currency: string = 'KES'): string {
  return `${currency} ${Math.round(amount).toLocaleString('en-KE')}`;
}

export function formatPrice(amount: number): string {
  return `KES ${amount.toLocaleString()}`;
}
