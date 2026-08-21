import React, { useState } from 'react';
import {
  PlusCircle,
  ArrowLeft,
  List,
  CheckCircle2,
  Barcode,
  Tag,
  Calendar,
  Package2,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { ActivePage, ProductCategory, PRODUCT_CATEGORIES, Product } from '../types/product';

interface ProductFormProps {
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onNavigate: (page: ActivePage) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onAddProduct,
  onNavigate,
  onShowToast,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Salgadinho');
  const [expirationDate, setExpirationDate] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastSavedName, setLastSavedName] = useState('');

  const generateRandomCode = () => {
    // Generates a Brazilian standard 13-digit EAN style prefix
    const randomSuffix = Math.floor(1000000000 + Math.random() * 9000000000);
    const newCode = `789${randomSuffix}`;
    setCode(newCode);
    if (errors.code) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.code;
        return next;
      });
    }
  };

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

    if (!validate()) {
      return;
    }

    const savedName = name.trim();
    onAddProduct({
      name: savedName,
      code: code.trim(),
      category,
      expirationDate,
    });

    onShowToast('Produto cadastrado com sucesso!', 'success');
    setLastSavedName(savedName);
    setIsSuccess(true);

    // Reset form fields for rapid next product entry
    setName('');
    setCode('');
    setExpirationDate('');
    setErrors({});
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in pb-12">
      {/* Top Header & Navigation Shortcuts */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Cadastrar Produto
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Preencha os dados do item para monitorar a validade no estoque.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500" />
            <span className="whitespace-nowrap">Voltar ao Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
          >
            <List className="w-4 h-4 text-slate-500" />
            <span className="whitespace-nowrap">Lista de Produtos</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert if just saved */}
      {isSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-900">
                Produto cadastrado com sucesso!
              </p>
              <p className="text-xs text-emerald-700 mt-0.5">
                &ldquo;{lastSavedName}&rdquo; foi adicionado à lista de monitoramento. Você pode cadastrar outro produto abaixo.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSuccess(false)}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Main Registration Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-red-50/40 via-white to-transparent flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#F21D44] flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <PlusCircle className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Formulário de Cadastro</h2>
          </div>
          <span className="text-xs font-semibold text-slate-400">Campos obrigatórios</span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Nome do Produto */}
          <div>
            <label
              htmlFor="product-name"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5"
            >
              <Package2 className="w-4 h-4 text-[#F21D44]" />
              <span>Nome do Produto *</span>
            </label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: '' }));
                }
              }}
              placeholder="Ex: Salgadinho Fandangos Queijo 140g, Suco Del Valle 1L..."
              className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition ${
                errors.name
                  ? 'border-red-400 bg-red-50/20 focus:ring-red-300'
                  : 'border-slate-300 focus:border-[#F21D44] focus:ring-red-100'
              }`}
            />
            {errors.name ? (
              <p className="mt-1.5 text-xs font-bold text-[#D93611]">{errors.name}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">
                Digite a descrição completa do produto para fácil identificação na gôndola.
              </p>
            )}
          </div>

          {/* Código */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="product-code"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5"
              >
                <Barcode className="w-4 h-4 text-[#F27F1B]" />
                <span>Código / Código de Barras *</span>
              </label>
              <button
                type="button"
                onClick={generateRandomCode}
                className="text-xs font-bold text-[#F27F1B] hover:text-[#d46a10] flex items-center gap-1 hover:underline cursor-pointer"
                title="Gerar código EAN automático"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Gerar Código</span>
              </button>
            </div>
            <div className="relative">
              <input
                id="product-code"
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (errors.code) {
                    setErrors((prev) => ({ ...prev, code: '' }));
                  }
                }}
                placeholder="Ex: 7892840223019 ou 0045"
                className={`w-full px-4 py-3 rounded-xl border text-sm font-mono font-medium focus:outline-none focus:ring-2 transition ${
                  errors.code
                    ? 'border-red-400 bg-red-50/20 focus:ring-red-300'
                    : 'border-slate-300 focus:border-[#F21D44] focus:ring-red-100'
                }`}
              />
            </div>
            {errors.code ? (
              <p className="mt-1.5 text-xs font-bold text-[#D93611]">{errors.code}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">
                Pode ser o código de barras (EAN-13), SKU interno ou código da prateleira.
              </p>
            )}
          </div>

          {/* Categoria and Data de Validade in Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Categoria */}
            <div>
              <label
                htmlFor="product-category"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5"
              >
                <Tag className="w-4 h-4 text-[#F2CE1B]" />
                <span>Categoria *</span>
              </label>
              <select
                id="product-category"
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as ProductCategory);
                  if (errors.category) {
                    setErrors((prev) => ({ ...prev, category: '' }));
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-semibold bg-white focus:outline-none focus:ring-2 transition ${
                  errors.category
                    ? 'border-red-400 bg-red-50/20 focus:ring-red-300'
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
                <p className="mt-1.5 text-xs font-bold text-[#D93611]">{errors.category}</p>
              )}
            </div>

            {/* Data de Validade */}
            <div>
              <label
                htmlFor="product-expiration"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-[#F21D44]" />
                <span>Data de Validade *</span>
              </label>
              <input
                id="product-expiration"
                type="date"
                value={expirationDate}
                onChange={(e) => {
                  setExpirationDate(e.target.value);
                  if (errors.expirationDate) {
                    setErrors((prev) => ({ ...prev, expirationDate: '' }));
                  }
                }}
                className={`w-full px-4 py-3 rounded-xl border text-sm font-medium focus:outline-none focus:ring-2 transition ${
                  errors.expirationDate
                    ? 'border-red-400 bg-red-50/20 focus:ring-red-300'
                    : 'border-slate-300 focus:border-[#F21D44] focus:ring-red-100'
                }`}
              />
              {errors.expirationDate && (
                <p className="mt-1.5 text-xs font-bold text-[#D93611]">{errors.expirationDate}</p>
              )}
            </div>
          </div>

          {/* Quick preset buttons for common dates */}
          <div className="pt-2">
            <p className="text-xs font-bold text-slate-500 mb-2 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-slate-400" />
              <span>Atalhos de data de validade rápida:</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Hoje', days: 0 },
                { label: '+3 Dias', days: 3 },
                { label: '+7 Dias (1 Semana)', days: 7 },
                { label: '+15 Dias', days: 15 },
                { label: '+30 Dias (1 Mês)', days: 30 },
                { label: '+60 Dias (2 Meses)', days: 60 },
                { label: '+90 Dias (3 Meses)', days: 90 },
              ].map((preset) => {
                const calcDate = () => {
                  const d = new Date();
                  d.setDate(d.getDate() + preset.days);
                  const yyyy = d.getFullYear();
                  const mm = String(d.getMonth() + 1).padStart(2, '0');
                  const dd = String(d.getDate()).padStart(2, '0');
                  setExpirationDate(`${yyyy}-${mm}-${dd}`);
                  if (errors.expirationDate) {
                    setErrors((prev) => ({ ...prev, expirationDate: '' }));
                  }
                };
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={calcDate}
                    className="px-2.5 py-1 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition active:scale-95 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="w-full sm:w-auto px-5 py-3 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer active:scale-95"
            >
              Voltar ao Dashboard
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 text-sm font-bold text-white bg-[#F21D44] hover:bg-[#d91438] rounded-xl shadow-lg shadow-red-500/25 transition cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Cadastrar Produto</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
