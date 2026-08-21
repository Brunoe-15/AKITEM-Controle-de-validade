import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Menu,
  X,
  AlertCircle,
  Store,
  Sparkles,
  Barcode,
} from 'lucide-react';
import { ActivePage } from '../types/product';

interface SidebarProps {
  activePage: ActivePage;
  onNavigate: (page: ActivePage) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  urgentCount: number;
  onOpenBarcodeScan?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  urgentCount,
  onOpenBarcodeScan,
}) => {
  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen, setIsMobileMenuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navItems: { id: ActivePage; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      badge: urgentCount > 0 ? urgentCount : undefined,
    },
    {
      id: 'products',
      label: 'Produtos',
      icon: <Package className="w-5 h-5" />,
    },
    {
      id: 'create',
      label: 'Cadastrar Produto',
      icon: <PlusCircle className="w-5 h-5" />,
    },
  ];

  const handleNavClick = (page: ActivePage) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* ============================================================ */}
      {/* MOBILE TOP BAR (Visible on screens < lg)                     */}
      {/* ============================================================ */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-1 text-slate-700 hover:text-[#F21D44] hover:bg-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F21D44] active:scale-95 transition-all"
            aria-label={isMobileMenuOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-[#F21D44] flex items-center justify-center text-white shadow-sm font-bold text-base">
              AK
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 leading-none block">
                AKI-TEM
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-[#F21D44] uppercase block">
                Validade
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {urgentCount > 0 && (
            <button
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-white bg-[#D93611] rounded-full shadow-sm animate-pulse hover:bg-[#b82d0d] transition"
              title={`${urgentCount} produtos requerem atenção urgente`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{urgentCount}</span>
            </button>
          )}

          {onOpenBarcodeScan && (
            <button
              onClick={onOpenBarcodeScan}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
              title="Scanner de Código de Barras"
              aria-label="Scanner de Código"
            >
              <Barcode className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* MOBILE DRAWER OVERLAY & MENU (Smooth sliding mobile drawer)   */}
      {/* ============================================================ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300 ease-out"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer container */}
          <nav
            className="fixed top-0 bottom-0 left-0 w-4/5 max-w-xs bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out animate-fade-in"
            aria-label="Navegação móvel"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F21D44] to-[#D93611] flex items-center justify-center text-white font-black text-lg shadow-sm">
                  AK
                </div>
                <div>
                  <h1 className="font-extrabold text-slate-900 text-sm tracking-tight leading-tight">
                    AKI-TEM
                  </h1>
                  <p className="text-[11px] font-semibold text-[#F21D44]">
                    Controle de Validade
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation links */}
            <div className="p-4 flex-1 overflow-y-auto space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
                Menu Principal
              </p>
              {navItems.map((item) => {
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-semibold text-sm transition-all ${
                      isActive
                        ? 'bg-[#F21D44] text-white shadow-md shadow-red-500/20'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          isActive
                            ? 'bg-white text-[#F21D44]'
                            : 'bg-[#F21D44] text-white'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}

              <div className="pt-4 mt-4 border-t border-slate-100">
                <div className="p-3 bg-red-50/70 rounded-xl border border-red-100">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#D93611] mb-1">
                    <Store className="w-4 h-4" />
                    <span>Gestão de Estoque</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Evite perdas no seu comércio mantendo as datas sempre atualizadas.
                  </p>
                </div>
              </div>
            </div>

            {/* Drawer Footer with subtle branding */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <p className="text-xs font-medium text-slate-500 text-center leading-relaxed">
                Criado por <strong className="text-slate-700 font-semibold">Bruno Alberto</strong>
                <br />
                <span className="text-[11px] text-slate-400 font-medium">BN Creative Digital</span>
              </p>
            </div>
          </nav>
        </div>
      )}

      {/* ============================================================ */}
      {/* DESKTOP SIDEBAR (Visible on screens >= lg)                   */}
      {/* ============================================================ */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 bg-white border-r border-slate-200 shrink-0 select-none shadow-sm min-h-screen sticky top-0 h-screen">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100">
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F21D44] to-[#D93611] flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-red-500/20 group-hover:scale-105 transition-transform">
              AK
            </div>
            <div>
              <div className="font-extrabold text-xl tracking-tight text-slate-900 leading-tight">
                AKI-TEM
              </div>
              <div className="text-xs font-bold text-[#F21D44] tracking-wide uppercase">
                Controle de Validade
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto" aria-label="Navegação principal">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Navegação
          </div>
          {navItems.map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                  isActive
                    ? 'bg-[#F21D44] text-white shadow-md shadow-red-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span className="whitespace-nowrap">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isActive
                        ? 'bg-white text-[#F21D44]'
                        : 'bg-[#D93611] text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick status card in sidebar */}
          <div className="mt-8 p-4 rounded-2xl bg-gradient-to-b from-slate-50 to-red-50/30 border border-slate-200/80">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-1.5">
              <Sparkles className="w-4 h-4 text-[#F27F1B]" />
              <span>Controle Ativo</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              O sistema monitora automaticamente os prazos para evitar descartes e prejuízos.
            </p>
          </div>
        </nav>

        {/* Desktop Footer with creator credits */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="text-center">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Criado por <strong className="text-slate-800 font-semibold">Bruno Alberto</strong>
            </p>
            <p className="text-[11px] text-slate-400 font-medium">
              BN Creative Digital
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
