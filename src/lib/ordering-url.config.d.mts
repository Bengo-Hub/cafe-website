export interface OrderingTarget {
  store: string;
  pwa: string;
  slug: string;
}

export function orderingTarget(env?: Record<string, string | undefined>): OrderingTarget;
export function buildOrderingUrl(target: OrderingTarget, path: string): string;
