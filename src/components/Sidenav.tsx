import React from 'react';
import { LayoutDashboard, Calculator, PiggyBank, X } from 'lucide-react';
import { ActiveView } from '../types';

interface SidenavProps {
  isOpen: boolean;
  onClose: () => void;
  activeView: ActiveView;
  onViewChange: (view: ActiveView) => void;
}

export const Sidenav: React.FC<SidenavProps> = ({
  isOpen,
  onClose,
  activeView,
  onViewChange,
}) => {
  const handleItemClick = (view: ActiveView) => {
    onViewChange(view);
    onClose();
  };

  return (
    <>
      {/* Dark overlay backdrop */}
      {isOpen && (
        <div
          id="sidenav-backdrop"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity duration-300"
        />
      )}

      {/* Sidenav sliding drawer */}
      <aside
        id="sidenav-menu"
        className={`fixed top-0 left-0 bottom-0 w-64 bg-slate-900 text-slate-300 z-50 transform transition-transform duration-300 ease-in-out shadow-2xl flex flex-col border-r border-slate-800 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header inside Sidenav */}
        <div className="h-16 bg-slate-950 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center font-black text-white text-xs">
              GN
            </div>
            <span className="font-sans font-black text-slate-100 tracking-wider text-xs uppercase">
              MENÚ PRINCIPAL
            </span>
          </div>
          <button
            id="btn-close-sidenav"
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors cursor-pointer focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 py-4 px-2 space-y-1.5" id="sidenav-links">
          <button
            id="sidenav-item-dashboard"
            onClick={() => handleItemClick('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all text-left cursor-pointer focus:outline-none ${
              activeView === 'dashboard'
                ? 'bg-slate-800 text-white border-l-4 border-l-blue-600 rounded-r-lg'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 rounded-lg'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard Principal</span>
          </button>

          <button
            id="sidenav-item-cuenta"
            onClick={() => handleItemClick('cuenta-anual')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all text-left cursor-pointer focus:outline-none ${
              activeView === 'cuenta-anual'
                ? 'bg-slate-800 text-white border-l-4 border-l-blue-600 rounded-r-lg'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 rounded-lg'
            }`}
          >
            <Calculator className="w-5 h-5" />
            <span>Declaración de Renta</span>
          </button>

          <button
            id="sidenav-item-ahorros"
            onClick={() => handleItemClick('ahorros-gastos')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-bold transition-all text-left cursor-pointer focus:outline-none ${
              activeView === 'ahorros-gastos'
                ? 'bg-slate-800 text-white border-l-4 border-l-blue-600 rounded-r-lg'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100 rounded-lg'
            }`}
          >
            <PiggyBank className="w-5 h-5" />
            <span>Ahorros y Gastos</span>
          </button>
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-slate-500 text-[10px] text-center font-mono bg-slate-950/40">
          © 2026 Impuestos e IRPF España
        </div>
      </aside>
    </>
  );
};
