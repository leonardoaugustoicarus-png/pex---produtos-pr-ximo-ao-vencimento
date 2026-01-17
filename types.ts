
export enum ProductStatus {
  EXPIRED = 'Vencido',
  CRITICAL = 'Crítico (<= 35 dias)',
  SAFE = 'Seguro (> 35 dias)'
}

export interface Product {
  id: string;
  barcode: string;
  batch?: string;
  name: string;
  quantity: number;
  expiryDate: string;
  observations: string;
  section?: string;
  transfer?: string;
  daysToExpiry: number;
  status: ProductStatus;
  registeredBy?: string;
}

export interface SoldProduct {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  sellerId: string;
  saleDate: string;
  batch?: string;
}

export interface InventoryStats {
  total: number;
  expired: number;
  critical: number;
  safe: number;
}
