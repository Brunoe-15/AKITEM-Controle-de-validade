import { Product } from '../types/product';

const STORAGE_KEY = 'akitem_produtos_v2';

/**
 * Loads products from localStorage or returns empty array
 */
export function loadProducts(): Product[] {
  try {
    // Clear legacy demo storage if present
    if (localStorage.getItem('akitem_produtos_v1')) {
      localStorage.removeItem('akitem_produtos_v1');
    }

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveProducts([]);
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Erro ao ler produtos do localStorage:', err);
    return [];
  }
}

/**
 * Saves products to localStorage
 */
export function saveProducts(products: Product[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.error('Erro ao salvar produtos no localStorage:', err);
  }
}

/**
 * Clears all products from localStorage
 */
export function clearAllProducts(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('akitem_produtos_v1');
  } catch (err) {
    console.error('Erro ao limpar produtos:', err);
  }
}
