import React, { useState } from 'react';
import { Barcode, Search, X, Check, Package, Calendar, AlertCircle } from 'lucide-react';
import { Product } from '../types/product';
import { formatDateBR, getExpirationCalculation, getDaysRemainingLabel } from '../utils/dateUtils';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onNavigateToRegister: (prefilledCode?: string) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  onNavigateToRegister,
}) => {
  const [scannedCode, setScannedCode] = useState('');
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const foundProduct = products.find(
    (p) => p.code.trim().toLowerCase() === scannedCode.trim().toLowerCase()
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedCode.trim()) return;
    setSearched(true);
  };

  const handleQuickCode = (code: string) => {
    setScannedCode(code);
    setSearched(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-100 text-[#F21D44] flex items-center justify-center">
              <Barcode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Consulta Rápida por Código</h2>
              <p className="text-xs text-slate-500">Digite ou escaneie o código do produto</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search input */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleSearch} className="space-y-3">
            <label className="block text-xs font-bold uppercase text-slate-700">
              Código de Barras / SKU
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                autoFocus
                value={scannedCode}
                onChange={(e) => {
                  setScannedCode(e.target.value);
                  setSearched(false);
                }}
                placeholder="Ex: 7896004001234"
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#F21D44]"
              />
              <button
                type="submit"
                className="px-4 py-2.5 text-sm font-bold text-white bg-[#F21D44] hover:bg-[#d91438] rounded-xl transition cursor-pointer"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Quick barcode chip samples from existing products */}
          {products.length > 0 && (
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Códigos recentes no estoque:
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {products.slice(0, 6).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleQuickCode(p.code)}
                    className="text-xs font-mono px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition"
                  >
                    {p.code} ({p.name.slice(0, 14)}...)
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Result display */}
          {searched && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              {foundProduct ? (
                (() => {
                  const calc = getExpirationCalculation(foundProduct.expirationDate);
                  return (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                            {foundProduct.category}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 mt-1">
                            {foundProduct.name}
                          </h4>
                          <p className="text-xs font-mono text-slate-500">
                            Código: {foundProduct.code}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                        <span>Validade: <strong>{formatDateBR(foundProduct.expirationDate)}</strong></span>
                        <span className="font-bold">{getDaysRemainingLabel(calc.diffDays)}</span>
                      </div>

                      <div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${calc.badgeColorClass} w-full justify-center`}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: calc.statusColor }}
                          />
                          <span>{calc.statusText}</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSelectProduct(foundProduct);
                          onClose();
                        }}
                        className="w-full mt-2 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition"
                      >
                        Abrir Detalhes / Editar
                      </button>
                    </div>
                  );
                })()
              ) : (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-center space-y-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 mx-auto" />
                  <p className="text-xs font-bold text-amber-900">
                    Nenhum produto cadastrado com o código &ldquo;{scannedCode}&rdquo;.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToRegister(scannedCode);
                      onClose();
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-[#F21D44] hover:bg-[#d91438] rounded-xl transition"
                  >
                    Cadastrar com Este Código
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-lg transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
