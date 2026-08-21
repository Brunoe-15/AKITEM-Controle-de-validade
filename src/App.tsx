import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Product, ActivePage } from './types/product';
import { loadProducts, saveProducts } from './utils/storage';
import { getExpirationCalculation } from './utils/dateUtils';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProductList } from './components/ProductList';
import { ProductForm } from './components/ProductForm';
import { EditProductModal } from './components/EditProductModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { BarcodeScannerModal } from './components/BarcodeScannerModal';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ShieldCheck } from 'lucide-react';

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Initial Load from localStorage (clean database)
  useEffect(() => {
    const initialData = loadProducts();
    setProducts(initialData);
  }, []);

  // Compute urgent alert count for navigation badges (expired + expiring today + expiring in 7 days)
  const urgentCount = useMemo(() => {
    return products.reduce((count, p) => {
      const calc = getExpirationCalculation(p.expirationDate);
      if (calc.statusType === 'expired' || calc.statusType === 'today' || calc.statusType === 'week') {
        return count + 1;
      }
      return count;
    }, 0);
  }, [products]);

  // Product Actions
  const handleAddProduct = (productData: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    const updated = [newProduct, ...products];
    setProducts(updated);
    saveProducts(updated);
  };

  const handleSaveEditedProduct = (updatedProduct: Product) => {
    const updated = products.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
    setProducts(updated);
    saveProducts(updated);
    setEditingProduct(null);
    showToast('Produto atualizado com sucesso!', 'success');
  };

  const handleConfirmDelete = () => {
    if (!deletingProduct) return;
    const updated = products.filter((p) => p.id !== deletingProduct.id);
    setProducts(updated);
    saveProducts(updated);
    const deletedName = deletingProduct.name;
    setDeletingProduct(null);
    showToast(`Produto "${deletedName}" foi excluído.`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#F7FBFA] flex flex-col antialiased">
      {/* Toast Notifications Overlay */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {/* Modals */}
      <EditProductModal
        product={editingProduct}
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        onSave={handleSaveEditedProduct}
      />

      <DeleteConfirmModal
        product={deletingProduct}
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={handleConfirmDelete}
      />

      <BarcodeScannerModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        products={products}
        onSelectProduct={(p) => setEditingProduct(p)}
        onNavigateToRegister={() => {
          setActivePage('create');
        }}
      />

      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Navigation Sidebar & Mobile Header */}
        <Sidebar
          activePage={activePage}
          onNavigate={(page) => {
            setActivePage(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          urgentCount={urgentCount}
          onOpenBarcodeScan={() => setIsBarcodeModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activePage === 'dashboard' && (
            <Dashboard
              products={products}
              onNavigate={(page) => {
                setActivePage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onEditProduct={(p) => setEditingProduct(p)}
              onDeleteProduct={(p) => setDeletingProduct(p)}
            />
          )}

          {activePage === 'products' && (
            <ProductList
              products={products}
              onNavigate={(page) => {
                setActivePage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onEditProduct={(p) => setEditingProduct(p)}
              onDeleteProduct={(p) => setDeletingProduct(p)}
              onShowToast={showToast}
            />
          )}

          {activePage === 'create' && (
            <ProductForm
              onAddProduct={handleAddProduct}
              onNavigate={(page) => {
                setActivePage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onShowToast={showToast}
            />
          )}
        </main>
      </div>

      {/* Global Application Footer */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800 tracking-tight">
              AKI-TEM Controle de Validade
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">
              Criado por <strong className="text-slate-700 font-semibold">Bruno Alberto</strong>
            </span>
            <span className="text-slate-300 hidden md:inline">•</span>
            <span className="text-slate-400 hidden md:inline">BN Creative Digital</span>
          </div>

          <div className="flex items-center gap-1 text-emerald-600 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Armazenamento Seguro Local</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
