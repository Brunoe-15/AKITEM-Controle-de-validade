import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Product } from '../types/product';
import { formatDateBR } from '../utils/dateUtils';

interface DeleteConfirmModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  product,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-delete-title"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-[#D93611]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 id="modal-delete-title" className="text-base font-bold text-slate-900">
                Confirmar Exclusão
              </h2>
              <p className="text-xs text-slate-500">Esta ação não poderá ser desfeita</p>
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

        {/* Content */}
        <div className="p-6">
          <p className="text-sm font-medium text-slate-700 leading-relaxed">
            Tem certeza que deseja excluir este produto?
          </p>

          <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="text-sm font-bold text-slate-900">{product.name}</div>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span>Código: <strong className="font-mono text-slate-800">{product.code}</strong></span>
              <span>•</span>
              <span>Categoria: <strong className="text-slate-800">{product.category}</strong></span>
            </div>
            <div className="text-xs text-slate-600">
              Validade: <strong className="text-slate-800">{formatDateBR(product.expirationDate)}</strong>
            </div>
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
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#D93611] hover:bg-[#b82d0d] rounded-xl shadow-md shadow-red-700/20 transition cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Excluir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
