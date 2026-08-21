import React, { useState, useEffect } from 'react';
import { Edit3, X, Check, Calendar, Tag, Barcode, Package2 } from 'lucide-react';
import { Product, PRODUCT_CATEGORIES, ProductCategory } from '../types/product';

interface EditProductModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedProduct: Product) => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  product,
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Salgadinho');
  const [expirationDate, setExpirationDate] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setCode(product.code || '');
      setCategory(product.category || 'Salgadinho');
      setExpirationDate(product.expirationDate || '');
      setErrors({});
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const validate = (): boolean => {
    const errs: { [key: string]: string } = {};
    if (!name.trim()) {
      errs.name = 'Informe o nome do produto.';
    }
    if (!code.trim()) {
      errs.code = 'Informe o código do produto.';
    }
    if (!category) {
      errs.category = 'Selecione uma categoria.';
    }
    if (!expirationDate) {
      errs.expirationDate = 'Informe a data de validade.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...product,
      name: name.trim(),
      code: code.trim(),
      category,
      expirationDate,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-edit-title"
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-[#F21D44]">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-edit-title" className="text-base font-bold text-slate-900">
                Editar Produto
              </h2>
              <p className="text-xs text-slate-500">Altere os dados do produto abaixo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            {/* Nome do Produto */}
            <div>
              <label htmlFor="edit-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Package2 className="w-3.5 h-3.5 text-[#F21D44]" />
                <span>Nome do Produto</span>
              </label>
              <input
                id="edit-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Salgadinho Fandangos Queijo 140g"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition ${
                  errors.name
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                    : 'border-slate-300 focus:border-[#F21D44] focus:ring-red-100'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs font-semibold text-[#D93611]">{errors.name}</p>
              )}
            </div>

            {/* Código */}
            <div>
              <label htmlFor="edit-code" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Barcode className="w-3.5 h-3.5 text-[#F27F1B]" />
                <span>Código</span>
              </label>
              <input
                id="edit-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: 7892840223019 ou 001"
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium font-mono focus:outline-none focus:ring-2 transition ${
                  errors.code
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                    : 'border-slate-300 focus:border-[#F21D44] focus:ring-red-100'
                }`}
              />
              {errors.code && (
                <p className="mt-1 text-xs font-semibold text-[#D93611]">{errors.code}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label htmlFor="edit-category" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#F2CE1B]" />
                <span>Categoria</span>
              </label>
              <select
                id="edit-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium bg-white focus:outline-none focus:ring-2 transition ${
                  errors.category
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                    : 'border-slate-300 focus:border-[#F21D44] focus:ring-red-100'
                }`}
              >
                {PRODUCT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-xs font-semibold text-[#D93611]">{errors.category}</p>
              )}
            </div>

            {/* Data de Validade */}
            <div>
              <label htmlFor="edit-expiration" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#F21D44]" />
                <span>Data de Validade</span>
              </label>
              <input
                id="edit-expiration"
                type="date"
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition ${
                  errors.expirationDate
                    ? 'border-red-400 bg-red-50/30 focus:ring-red-300'
                    : 'border-slate-300 focus:border-[#F21D44] focus:ring-red-100'
                }`}
              />
              {errors.expirationDate && (
                <p className="mt-1 text-xs font-semibold text-[#D93611]">{errors.expirationDate}</p>
              )}
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200/80 bg-slate-100 rounded-xl transition cursor-pointer active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-[#F21D44] hover:bg-[#d91438] rounded-xl shadow-md shadow-red-500/20 transition cursor-pointer active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Alterações</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
