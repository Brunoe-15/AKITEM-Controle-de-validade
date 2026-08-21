import React, { useState, useMemo } from 'react';
import {
  Package,
  CalendarDays,
  AlertTriangle,
  Clock,
  AlertOctagon,
  PlusCircle,
  List,
  Edit,
  Trash2,
  Filter,
  CheckCircle2,
  CalendarCheck,
  ChevronRight,
  TrendingDown,
} from 'lucide-react';
import { Product, ActivePage } from '../types/product';
import {
  formatDateBR,
  getExpirationCalculation,
  getFormattedToday,
  getDaysRemainingLabel,
} from '../utils/dateUtils';

interface DashboardProps {
  products: Product[];
  onNavigate: (page: ActivePage) => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onFilterByStatus?: (statusFilter: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  products,
  onNavigate,
  onEditProduct,
  onDeleteProduct,
}) => {
  const [alertFilter, setAlertFilter] = useState<'all_alerts' | 'expired' | 'today' | 'week' | 'month' | 'all'>('all_alerts');

  // Compute calculated metrics
  const {
    totalCount,
    expiredCount,
    todayCount,
    weekCount,
    monthCount,
    okCount,
    expiredProducts,
    todayProducts,
    weekProducts,
    monthProducts,
    allCalculatedProducts,
  } = useMemo(() => {
    let expired = 0;
    let today = 0;
    let week = 0;
    let month = 0;
    let ok = 0;

    const listWithCalc = products.map((prod) => {
      const calc = getExpirationCalculation(prod.expirationDate);
      return { product: prod, calc };
    });

    // Sort by expiration ascending (most urgent first)
    listWithCalc.sort((a, b) => a.calc.diffDays - b.calc.diffDays);

    const expiredList: Product[] = [];
    const todayList: Product[] = [];
    const weekList: Product[] = [];
    const monthList: Product[] = [];

    listWithCalc.forEach(({ product, calc }) => {
      if (calc.statusType === 'expired') {
        expired++;
        expiredList.push(product);
      } else if (calc.statusType === 'today') {
        today++;
        todayList.push(product);
      } else if (calc.statusType === 'week') {
        week++;
        weekList.push(product);
      } else if (calc.statusType === 'month') {
        month++;
        monthList.push(product);
      } else {
        ok++;
      }
    });

    return {
      totalCount: products.length,
      expiredCount: expired,
      todayCount: today,
      weekCount: week,
      monthCount: month,
      okCount: ok,
      expiredProducts: expiredList,
      todayProducts: todayList,
      weekProducts: weekList,
      monthProducts: monthList,
      allCalculatedProducts: listWithCalc,
    };
  }, [products]);

  // Filter alert list
  const filteredAlerts = useMemo(() => {
    if (alertFilter === 'expired') {
      return allCalculatedProducts.filter((item) => item.calc.statusType === 'expired');
    }
    if (alertFilter === 'today') {
      return allCalculatedProducts.filter((item) => item.calc.statusType === 'today');
    }
    if (alertFilter === 'week') {
      return allCalculatedProducts.filter((item) => item.calc.statusType === 'week');
    }
    if (alertFilter === 'month') {
      return allCalculatedProducts.filter((item) => item.calc.statusType === 'month');
    }
    if (alertFilter === 'all') {
      return allCalculatedProducts;
    }
    // Default: 'all_alerts' shows all products needing attention (expired, today, week, month)
    return allCalculatedProducts.filter((item) => item.calc.statusType !== 'ok');
  }, [allCalculatedProducts, alertFilter]);

  const urgentTotal = expiredCount + todayCount + weekCount;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ============================================================ */}
      {/* TOP HEADER & ACTION BUTTONS                                  */}
      {/* ============================================================ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {getFormattedToday()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Visão geral em tempo real das validades de produtos na loja.
          </p>
        </div>

        {/* Dashboard Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate('create')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-[#F21D44] hover:bg-[#d91438] rounded-xl shadow-md shadow-red-500/20 transition cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cadastrar Produto</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('products')}
            className="flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition cursor-pointer active:scale-95 whitespace-nowrap shrink-0"
          >
            <List className="w-4 h-4 text-slate-500" />
            <span>Lista de Produtos</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* URGENT NOTIFICATION BANNER (If items are expired or today)   */}
      {/* ============================================================ */}
      {urgentTotal > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-50 via-amber-50 to-white border border-red-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F21D44] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Atenção: {urgentTotal} {urgentTotal === 1 ? 'produto requer' : 'produtos requerem'} ação imediata
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {expiredCount > 0 && (
                  <strong className="text-[#D93611] font-bold">
                    {expiredCount} {expiredCount === 1 ? 'vencido' : 'vencidos'}{' '}
                  </strong>
                )}
                {todayCount > 0 && (
                  <strong className="text-[#F21D44] font-bold">
                    • {todayCount} {todayCount === 1 ? 'vence hoje' : 'vencem hoje'}{' '}
                  </strong>
                )}
                {weekCount > 0 && (
                  <strong className="text-[#F27F1B] font-bold">
                    • {weekCount} {weekCount === 1 ? 'vence nesta semana' : 'vencem nesta semana'}
                  </strong>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => setAlertFilter('all_alerts')}
            className="text-xs font-bold text-[#F21D44] hover:text-[#b82d0d] flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-lg bg-white border border-red-200 shadow-xs hover:bg-red-50 transition cursor-pointer"
          >
            <span>Ver Alertas Abaixo</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5 SUMMARY CARDS (Specified colors and titles)                */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* CARD 1: Quantidade de Itens (Color: Black) */}
        <div
          onClick={() => {
            setAlertFilter('all');
          }}
          className="bg-[#0f172a] text-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">
              Quantidade de Itens
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black tracking-tight">{totalCount}</div>
            <div className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-1">
              <span>{okCount} produtos em dia</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Vencem em 1 Mês (Color: #F2CE1B) */}
        <div
          onClick={() => setAlertFilter('month')}
          className="bg-white border-2 border-[#F2CE1B] p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-amber-800 uppercase">
              Vencem em 1 Mês
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F2CE1B]/20 text-amber-800 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black tracking-tight text-slate-900">{monthCount}</div>
            <div className="text-xs text-amber-700 mt-1 font-bold">
              8 a 31 dias restantes
            </div>
          </div>
        </div>

        {/* CARD 3: Vencem em 1 Semana (Color: #F27F1B) */}
        <div
          onClick={() => setAlertFilter('week')}
          className="bg-white border-2 border-[#F27F1B] p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-[#F27F1B] uppercase">
              Vencem em 1 Semana
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F27F1B]/15 text-[#F27F1B] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black tracking-tight text-slate-900">{weekCount}</div>
            <div className="text-xs text-[#F27F1B] mt-1 font-bold">
              1 a 7 dias restantes
            </div>
          </div>
        </div>

        {/* CARD 4: Vencem Hoje (Color: #F21D44) */}
        <div
          onClick={() => setAlertFilter('today')}
          className="bg-white border-2 border-[#F21D44] p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-[#F21D44] uppercase">
              Vencem Hoje
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#F21D44]/15 text-[#F21D44] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black tracking-tight text-[#F21D44]">{todayCount}</div>
            <div className="text-xs text-[#F21D44] mt-1 font-bold">
              Expira na data de hoje
            </div>
          </div>
        </div>

        {/* CARD 5: Produtos Vencidos (Color: #D93611) */}
        <div
          onClick={() => setAlertFilter('expired')}
          className="bg-white border-2 border-[#D93611] p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold tracking-wider text-[#D93611] uppercase">
              Produtos Vencidos
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#D93611]/15 text-[#D93611] flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black tracking-tight text-[#D93611]">{expiredCount}</div>
            <div className="text-xs text-[#D93611] mt-1 font-bold">
              Retirar da prateleira
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* EXPIRATION ALERT SECTION ("Alertas de Validade")              */}
      {/* ============================================================ */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Section Header with Tabs */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#F21D44]" />
              <span>Alertas de Validade</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lista prioritária de produtos ordenados pela urgência de vencimento.
            </p>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => setAlertFilter('all_alerts')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                alertFilter === 'all_alerts'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Prioritários ({expiredCount + todayCount + weekCount + monthCount})
            </button>
            <button
              onClick={() => setAlertFilter('expired')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                alertFilter === 'expired'
                  ? 'bg-[#D93611] text-white shadow-xs'
                  : 'bg-red-50 text-[#D93611] hover:bg-red-100'
              }`}
            >
              Vencidos ({expiredCount})
            </button>
            <button
              onClick={() => setAlertFilter('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                alertFilter === 'today'
                  ? 'bg-[#F21D44] text-white shadow-xs'
                  : 'bg-red-50 text-[#F21D44] hover:bg-red-100'
              }`}
            >
              Vencem Hoje ({todayCount})
            </button>
            <button
              onClick={() => setAlertFilter('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                alertFilter === 'week'
                  ? 'bg-[#F27F1B] text-white shadow-xs'
                  : 'bg-amber-50 text-[#F27F1B] hover:bg-amber-100'
              }`}
            >
              1 Semana ({weekCount})
            </button>
            <button
              onClick={() => setAlertFilter('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                alertFilter === 'month'
                  ? 'bg-amber-300 text-amber-950 shadow-xs'
                  : 'bg-yellow-50 text-amber-800 hover:bg-yellow-100'
              }`}
            >
              1 Mês ({monthCount})
            </button>
            <button
              onClick={() => setAlertFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                alertFilter === 'all'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({totalCount})
            </button>
          </div>
        </div>

        {/* Table Content */}
        {products.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">
              Nenhum produto cadastrado.
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              Comece adicionando seus itens de estoque para acompanhar as datas de validade automaticamente.
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
        ) : filteredAlerts.length === 0 ? (
          /* Filter Empty State */
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">
              Nenhum produto neste filtro no momento.
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Excelente! Todos os itens estão com as validades sob controle.
            </p>
          </div>
        ) : (
          /* Alert Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <th className="py-3.5 px-4 sm:px-6">Nome do Produto</th>
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Data de Validade</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAlerts.map(({ product, calc }) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Nome do Produto */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div className="font-bold text-slate-900 group-hover:text-[#F21D44] transition-colors">
                        {product.name}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">
                        {product.category}
                      </div>
                    </td>

                    {/* Código */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-md font-semibold border border-slate-200">
                        {product.code}
                      </span>
                    </td>

                    {/* Data de Validade */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">
                        {formatDateBR(product.expirationDate)}
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

                    {/* Ações */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditProduct(product)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Editar"
                          aria-label={`Editar ${product.name}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteProduct(product)}
                          className="p-1.5 text-slate-400 hover:text-[#D93611] hover:bg-red-50 rounded-lg transition"
                          title="Excluir"
                          aria-label={`Excluir ${product.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer Link */}
        {products.length > 0 && (
          <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Exibindo <strong>{filteredAlerts.length}</strong> de <strong>{products.length}</strong> produtos
            </span>
            <button
              onClick={() => onNavigate('products')}
              className="font-bold text-[#F21D44] hover:underline flex items-center gap-1"
            >
              <span>Ver Lista Completa</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
