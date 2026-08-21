export type ProductCategory =
  | 'Salgadinho'
  | 'Amendoim'
  | 'Doce'
  | 'Bala'
  | 'Chocolate'
  | 'Bebidas'
  | 'Outros';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'Salgadinho',
  'Amendoim',
  'Doce',
  'Bala',
  'Chocolate',
  'Bebidas',
  'Outros',
];

export interface Product {
  id: string;
  name: string;
  code: string;
  category: ProductCategory;
  expirationDate: string; // YYYY-MM-DD
  createdAt?: string;
  notes?: string;
}

export type ExpirationStatusType = 'expired' | 'today' | 'week' | 'month' | 'ok';

export interface ExpirationCalculation {
  diffDays: number;
  statusType: ExpirationStatusType;
  statusText: string;
  statusColor: string; // Hex or tailwind class
  badgeColorClass: string;
  badgeBorderClass: string;
  badgeTextClass: string;
  isUrgent: boolean;
}

export type ActivePage = 'dashboard' | 'products' | 'create';
