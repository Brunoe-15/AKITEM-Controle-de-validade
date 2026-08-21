import React, { useState, useMemo } from 'react';
import {
  Search,
  PlusCircle,
  FileSpreadsheet,
  Edit,
  Trash2,
  Filter,
  ArrowUpDown,
  Calendar,
  Tag,
  Barcode,
  Package,
  X,
  RefreshCw,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { Product, ProductCategory, PRODUCT_CATEGORIES, ActivePage } from '../types/product';
import {
  formatDateBR,
  getExpirationCalculation,
  getDaysRemainingLabel,
} from '../utils/dateUtils';
import { exportProductsToExcel, exportProductsToStyledXLS } from '../utils/exportExcel';

interface ProductListProps {
  products: Product[];
  onNavigate: (page: ActivePage) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onShowToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

type SortField = 'expirationDate' | 'name' | 'code' | 'category' | 'diffDays';
type SortOrder = 'asc' | 'desc';

export const ProductList: React.FC<ProductListProps> = ({
  products,
  onNavigate,
  onEditProduct,
  onDeleteProduct,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('diffDays');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Filter & Search Logic
  const filteredAndSortedProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return products
      .map((product) => {
        const calc = getExpirationCalculation(product.expirationDate);
        const formattedDate = formatDateBR(product.expirationDate);
        return { product, calc, formattedDate };
      })
      .filter(({ product, calc, formattedDate }) => {
        // Search filter (name, code, date)
        if (term) {
          const nameMatch = product.name.toLowerCase().includes(term);
          const codeMatch = product.code.toLowerCase().includes(term);
          const rawDateMatch = product.expirationDate.toLowerCase().includes(term);
          const formattedDateMatch = formattedDate.toLowerCase().includes(term);
          if (!nameMatch && !codeMatch && !rawDateMatch && !formattedDateMatch) {
            return false;
          }
        }

        // Category filter
        if (selectedCategory !== 'all' && product.category !== selectedCategory) {
          return false;
        }

        // Status filter
        if (selectedStatus !== 'all') {
          if (selectedStatus === 'expired' && calc.statusType !== 'expired') return false;
          if (selectedStatus === 'today' && calc.statusType !== 'today') return false;
          if (selectedStatus === 'week' && calc.statusType !== 'week') return false;
          if (selectedStatus === 'month' && calc.statusType !== 'month') return false;
          if (selectedStatus === 'ok' && calc.statusType !== 'ok') return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comp = 0;
        if (sortField === 'name') {
          comp = a.product.name.localeCompare(b.product.name, 'pt-BR');
        } else if (sortField === 'code') {
          comp = a.product.code.localeCompare(b.product.code);
        } else if (sortField === 'category') {
          comp = a.product.category.localeCompare(b.product.category, 'pt-BR');
        } else if (sortField === 'expirationDate' || sortField === 'diffDays') {
          comp = a.calc.diffDays - b.calc.diffDays;
        }

        return sortOrder === 'asc' ? comp : -comp;
      });
  }, [products, searchTerm, selectedCategory, selectedStatus, sortField, sortOrder]);

  const handleExport = () => {
    if (products.length === 0) {
      onShowToast('Não há produtos para exportar.', 'info');
      return;
    }
    const exportData = filteredAndSortedProducts.map((i) => i.product);
    exportProductsToStyledXLS(exportData);
    onShowToast('Planilha Excel exportada com sucesso!', 'success');
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSortField('diffDays');
    setSortOrder('asc');
  };

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'all' || selectedStatus !== 'all';

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ============================================================ */}
      {/* TOP HEADER & ACTIONS                                         */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Lista de Produtos
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Gerencie, busque e filtre todos os itens cadastrados no comércio.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Excel Export Button */}
          <button
            type="button"
            onClick={handleExport}
            disabled={products.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl shadow-xs transition active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
            title="Exportar para arquivo compatível com Microsoft Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="whitespace-nowrap">Exportar para Excel</span>
          </button>

          {/* Cadastrar Produto */}
          <button
            type="button"
            onClick={() => onNavigate('create')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#F21D44] hover:bg-[#d91438] rounded-xl shadow-md shadow-red-500/20 transition active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span className="whitespace-nowrap">Cadastrar Produto</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SEARCH AND FILTERS BAR                                       */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input (Dynamic filter) */}
          <div className="md:col-span-5 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, código ou data..."
              className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#F21D44] transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#F21D44] transition text-slate-700"
            >
              <option value="all">Todas as Categorias</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#F21D44] transition text-slate-700"
            >
              <option value="all">Todos os Status de Validade</option>
              <option value="expired">Vermelho - Vencidos</option>
              <option value="today">Vermelho - Vencem Hoje</option>
              <option value="week">Laranja - Vencem em 1 Semana</option>
              <option value="month">Amarelo - Vencem em 1 Mês</option>
              <option value="ok">Verde - Em Dia (&gt; 31 dias)</option>
            </select>
          </div>
        </div>

        {/* Filter Summary & View Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Total filtrado:{' '}
              <strong className="text-slate-800 font-bold">{filteredAndSortedProducts.length}</strong> de{' '}
              <strong className="text-slate-800 font-bold">{products.length}</strong>
            </span>

            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 font-bold text-[#F21D44] hover:underline cursor-pointer ml-2"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>

          {/* Responsive Layout Toggle */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">Modo:</span>
            <div className="inline-flex bg-slate-100 p-0.5 rounded-lg">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Tabela
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cards
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* PRODUCTS DISPLAY (TABLE / CARDS)                             */}
      {/* ============================================================ */}
      {products.length === 0 ? (
        /* Empty Database State */
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Nenhum produto cadastrado.
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
            Adicione o primeiro produto para iniciar o monitoramento de validade da loja.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('create')}
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-[#F21D44] hover:bg-[#d91438] rounded-xl shadow-md shadow-red-500/20 transition cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Primeiro Produto</span>
          </button>
        </div>
      ) : filteredAndSortedProducts.length === 0 ? (
        /* Search / Filter Empty State */
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            Nenhum produto encontrado com os filtros atuais.
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tente buscar com outros termos ou limpe os filtros de categoria e status.
          </p>
          <button
            type="button"
            onClick={handleClearFilters}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Limpar Busca e Filtros</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* SPREADSHEET TABLE VIEW */
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 select-none">
                  {/* Column: Nome do Produto */}
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3.5 px-4 sm:px-6 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Nome do Produto</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Column: Código */}
                  <th
                    onClick={() => handleSort('code')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Código</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Column: Categoria */}
                  <th
                    onClick={() => handleSort('category')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Categoria</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Column: Data de Validade */}
                  <th
                    onClick={() => handleSort('expirationDate')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Data de Validade</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Column: Status */}
                  <th className="py-3.5 px-4">
                    <span>Status</span>
                  </th>

                  {/* Column: Dias Restantes */}
                  <th
                    onClick={() => handleSort('diffDays')}
                    className="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors text-center"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Dias Restantes</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>

                  {/* Column: Ações */}
                  <th className="py-3.5 px-4 text-right">
                    <span>Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAndSortedProducts.map(({ product, calc, formattedDate }) => {
                  const daysRemainingText = getDaysRemainingLabel(calc.diffDays);
                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Nome do Produto */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-bold text-slate-900 group-hover:text-[#F21D44] transition-colors">
                          {product.name}
                        </div>
                      </td>

                      {/* Código */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-semibold border border-slate-200 whitespace-nowrap">
                          {product.code}
                        </span>
                      </td>

                      {/* Categoria */}
                      <td className="py-3.5 px-4">
                        <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {product.category}
                        </span>
                      </td>

                      {/* Data de Validade */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-semibold text-slate-800 whitespace-nowrap">
                          {formattedDate}
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${calc.badgeColorClass}`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: calc.statusColor }}
                          />
                          <span className="whitespace-nowrap">{calc.statusText}</span>
                        </span>
                      </td>

                      {/* Dias Restantes */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`text-xs font-bold ${
                            calc.diffDays < 0
                              ? 'text-[#D93611]'
                              : calc.diffDays === 0
                              ? 'text-[#F21D44]'
                              : calc.diffDays <= 7
                              ? 'text-[#F27F1B]'
                              : calc.diffDays <= 31
                              ? 'text-amber-700'
                              : 'text-emerald-700'
                          }`}
                        >
                          {daysRemainingText}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onEditProduct(product)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 rounded-lg transition cursor-pointer active:scale-95"
                            title="Editar produto"
                            aria-label={`Editar ${product.name}`}
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Editar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(product)}
                            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-[#D93611] bg-red-50 hover:bg-red-100 rounded-lg transition cursor-pointer active:scale-95"
                            title="Excluir produto"
                            aria-label={`Excluir ${product.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Excluir</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* RESPONSIVE CARDS VIEW (Ideal for small phone screens) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedProducts.map(({ product, calc, formattedDate }) => {
            const daysRemainingText = getDaysRemainingLabel(calc.diffDays);
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {product.category}
                    </span>
                    <span className="font-mono text-xs bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {product.code}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">
                    {product.name}
                  </h3>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Validade: <strong>{formattedDate}</strong></span>
                    </span>
                    <span className="font-bold text-slate-800">
                      {daysRemainingText}
                    </span>
                  </div>

                  <div className="mt-3">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${calc.badgeColorClass} w-full justify-center`}
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: calc.statusColor }}
                      />
                      <span>{calc.statusText}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => onEditProduct(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteProduct(product)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-[#D93611] bg-red-50 hover:bg-red-100 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
