import React, { useState } from 'react';
import { MonthId, YearState, TransferRow, ExpenseRow } from '../types';
import { ComputedYearResult } from '../utils/calculations';
import { 
  Plus, 
  Trash2, 
  Copy, 
  AlertTriangle, 
  CheckCircle2, 
  Wallet, 
  TrendingUp, 
  ArrowRight, 
  PieChart as PieIcon, 
  ChevronDown, 
  ChevronUp, 
  Coins, 
  Tag, 
  Percent, 
  Gauge 
} from 'lucide-react';

interface SavingsExpensesViewProps {
  yearState: YearState;
  computedYear: ComputedYearResult;
  onUpdateTransfers: (transfers: Record<string, TransferRow[]>) => void;
  onUpdateExpenses: (expenses: Record<string, ExpenseRow[]>) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
}

const CALENDAR_MONTHS: { id: MonthId; label: string }[] = [
  { id: 'enero', label: 'Enero' },
  { id: 'febrero', label: 'Febrero' },
  { id: 'marzo', label: 'Marzo' },
  { id: 'abril', label: 'Abril' },
  { id: 'mayo', label: 'Mayo' },
  { id: 'junio', label: 'Junio' },
  { id: 'julio', label: 'Julio' },
  { id: 'agosto', label: 'Agosto' },
  { id: 'septiembre', label: 'Septiembre' },
  { id: 'octubre', label: 'Octubre' },
  { id: 'noviembre', label: 'Noviembre' },
  { id: 'diciembre', label: 'Diciembre' },
];

const TIPO_OPTIONS = [
  'Gasto Fijo',
  'Gasto Estimado',
  'Inversion Fija',
  'Inversion Estimada',
  'Ahorro',
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  'Gasto Fijo': '#f43f5e',       // Rose 500
  'Gasto Estimado': '#fb923c',   // Orange 400
  'Inversion Fija': '#6366f1',   // Indigo 500
  'Inversion Estimada': '#38bdf8', // Sky 400
  'Ahorro': '#10b981',           // Emerald 500
};

// MASTER OPTIONS FOR EXPENSES
const EXPENSE_TIPO_OPTIONS = [
  'Gasto Fijo',
  'Gasto Estimado',
  'Inversion Fija',
  'Inversion estimada',
  'Ahorro',
] as const;

const EXPENSE_CLASIFICACION_OPTIONS = [
  'Vivienda',
  'Alimentacion',
  'Ocio',
  'Trabajo',
  'Vehiculos',
  'Inversion',
  'Regalos',
  'Ahorro',
  'Ropa',
] as const;

const EXPENSE_CLASIFICACION_COLORS: Record<string, string> = {
  'Vivienda': '#3b82f6',     // Blue 500
  'Alimentacion': '#f97316', // Orange 500
  'Ocio': '#ec4899',         // Pink 500
  'Trabajo': '#6366f1',      // Indigo 500
  'Vehiculos': '#8b5cf6',    // Violet 500
  'Inversion': '#14b8a6',    // Teal 500
  'Regalos': '#eab308',      // Yellow 500
  'Ahorro': '#10b981',       // Emerald 500
  'Ropa': '#f43f5e',         // Rose 500
};

export const SavingsExpensesView: React.FC<SavingsExpensesViewProps> = ({
  yearState,
  computedYear,
  onUpdateTransfers,
  onUpdateExpenses,
  showToast,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<MonthId>('enero');
  
  // Collapsible toggle states
  const [isTransfersOpen, setIsTransfersOpen] = useState(true);
  const [isExpensesOpen, setIsExpensesOpen] = useState(true);

  // Hover states for Donut SVG Charts
  const [hoveredTransferIdx, setHoveredTransferIdx] = useState<number | null>(null);
  const [hoveredExpenseIdx, setHoveredExpenseIdx] = useState<number | null>(null);
  
  const [transferTooltipPos, setTransferTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [expenseTooltipPos, setExpenseTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Active month data
  const monthTransfers = yearState.transfers?.[selectedMonth] || [];
  const monthExpenses = yearState.expenses?.[selectedMonth] || [];
  const netoNomina = computedYear.months[selectedMonth]?.neto || 0;

  // -------------------------------------------------------------
  // CALCULATIONS: TRANSFERS
  // -------------------------------------------------------------
  const totalTransfersImporte = monthTransfers.reduce((sum, r) => sum + r.importe, 0);
  
  const totalTransfersPorcentajeNeto = monthTransfers.reduce((sum, r) => {
    const pct = netoNomina > 0 ? (r.importe / netoNomina) * 100 : 0;
    return sum + pct;
  }, 0);

  // Summary Transfers grouped by TIPO
  const transfersSummaryRows = TIPO_OPTIONS.map((tipo) => {
    const items = monthTransfers.filter((r) => r.tipo === tipo);
    const sumaEuros = items.reduce((sum, r) => sum + r.importe, 0);
    const sumaPct = netoNomina > 0 ? (sumaEuros / netoNomina) * 100 : 0;
    const restoEuros = netoNomina - sumaEuros;
    const restoPct = Math.max(0, 100 - sumaPct);

    return {
      tipo,
      sumaEuros,
      sumaPct,
      restoEuros,
      restoPct,
    };
  });

  const transfersSummaryTotalSumaEuros = transfersSummaryRows.reduce((sum, r) => sum + r.sumaEuros, 0);
  const transfersSummaryTotalSumaPct = netoNomina > 0 ? (transfersSummaryTotalSumaEuros / netoNomina) * 100 : 0;
  const transfersSummaryTotalRestoEuros = netoNomina - transfersSummaryTotalSumaEuros;
  const transfersSummaryTotalRestoPct = Math.max(0, 100 - transfersSummaryTotalSumaPct);

  // -------------------------------------------------------------
  // CALCULATIONS: EXPENSES
  // -------------------------------------------------------------
  const totalExpensesImporte = monthExpenses.reduce((sum, r) => sum + r.importe, 0);
  
  const totalExpensesPorcentajeNeto = monthExpenses.reduce((sum, r) => {
    const pct = netoNomina > 0 ? (r.importe / netoNomina) * 100 : 0;
    return sum + pct;
  }, 0);

  // Average reaction cap
  const validCapReacciones = monthExpenses
    .map((r) => r.capReaccion)
    .filter((v): v is number => v !== null && !isNaN(v));
  
  const promedioCapReaccion = validCapReacciones.length > 0
    ? validCapReacciones.reduce((sum, v) => sum + v, 0) / validCapReacciones.length
    : null;

  // Summary Expenses grouped by CLASIFICACION (Category)
  const expensesSummaryRows = EXPENSE_CLASIFICACION_OPTIONS.map((clasificacion) => {
    const items = monthExpenses.filter((r) => r.clasificacion === clasificacion);
    const sumaEuros = items.reduce((sum, r) => sum + r.importe, 0);
    const sumaPct = netoNomina > 0 ? (sumaEuros / netoNomina) * 100 : 0;
    const restoEuros = netoNomina - sumaEuros;
    const restoPct = Math.max(0, 100 - sumaPct);

    return {
      clasificacion,
      sumaEuros,
      sumaPct,
      restoEuros,
      restoPct,
    };
  });

  const expensesSummaryTotalSumaEuros = expensesSummaryRows.reduce((sum, r) => sum + r.sumaEuros, 0);
  const expensesSummaryTotalSumaPct = netoNomina > 0 ? (expensesSummaryTotalSumaEuros / netoNomina) * 100 : 0;
  const expensesSummaryTotalRestoEuros = netoNomina - expensesSummaryTotalSumaEuros;
  const expensesSummaryTotalRestoPct = Math.max(0, 100 - expensesSummaryTotalSumaPct);

  // -------------------------------------------------------------
  // AGGREGATED METRICS (KPI ROW)
  // -------------------------------------------------------------
  const totalCombinedCommitted = totalTransfersImporte + totalExpensesImporte;
  const totalCombinedPercent = netoNomina > 0 ? (totalCombinedCommitted / netoNomina) * 100 : 0;
  const saldoLibreFinal = netoNomina - totalCombinedCommitted;

  // Colors based on consumption threshold rules
  let statusColor = 'text-emerald-600 bg-emerald-500/10 border-emerald-200';
  let progressColor = 'bg-emerald-500';
  let badgeLabel = 'Saludable';
  let badgeIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;

  if (totalCombinedPercent >= 90 && totalCombinedPercent < 100) {
    statusColor = 'text-amber-600 bg-amber-500/10 border-amber-200';
    progressColor = 'bg-amber-500';
    badgeLabel = 'Límite cercano';
    badgeIcon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
  } else if (totalCombinedPercent >= 100) {
    statusColor = 'text-rose-600 bg-rose-500/10 border-rose-200';
    progressColor = 'bg-rose-500';
    badgeLabel = 'Supera nómina';
    badgeIcon = <AlertTriangle className="w-4 h-4 text-rose-500" />;
  }

  // -------------------------------------------------------------
  // HANDLERS: TRANSFERS
  // -------------------------------------------------------------
  const handleUpdateTransferField = (index: number, field: keyof TransferRow, value: any) => {
    const updatedList = [...monthTransfers];
    updatedList[index] = {
      ...updatedList[index],
      [field]: value,
    };
    onUpdateTransfers({
      ...(yearState.transfers || {}),
      [selectedMonth]: updatedList,
    });
  };

  const handleDeleteTransferRow = (index: number) => {
    const updatedList = monthTransfers.filter((_, i) => i !== index);
    onUpdateTransfers({
      ...(yearState.transfers || {}),
      [selectedMonth]: updatedList,
    });
    showToast('Transferencia eliminada', 'success');
  };

  const handleAddTransferRow = () => {
    const newRow: TransferRow = {
      id: 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      cuentaOrigen: '',
      cuentaDestino: '',
      concepto: '',
      tipo: 'Gasto Fijo',
      importe: 0,
    };
    onUpdateTransfers({
      ...(yearState.transfers || {}),
      [selectedMonth]: [...monthTransfers, newRow],
    });
  };

  // Find previous month for copies
  const selectedIndex = CALENDAR_MONTHS.findIndex((m) => m.id === selectedMonth);
  const prevMonthId = selectedIndex > 0 ? CALENDAR_MONTHS[selectedIndex - 1].id : null;
  const prevMonthLabel = selectedIndex > 0 ? CALENDAR_MONTHS[selectedIndex - 1].label : '';

  const handleCopyTransfersFromPrevious = () => {
    if (!prevMonthId) return;
    const prevTransfers = yearState.transfers?.[prevMonthId] || [];
    if (prevTransfers.length === 0) {
      showToast(`El mes de ${prevMonthLabel} no tiene transferencias registradas.`, 'error');
      return;
    }
    const cloned = prevTransfers.map((r) => ({
      ...r,
      id: 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    }));
    onUpdateTransfers({
      ...(yearState.transfers || {}),
      [selectedMonth]: cloned,
    });
    showToast(`Copiadas ${cloned.length} transferencias desde ${prevMonthLabel}`, 'success');
  };

  // -------------------------------------------------------------
  // HANDLERS: EXPENSES
  // -------------------------------------------------------------
  const handleUpdateExpenseField = (index: number, field: keyof ExpenseRow, value: any) => {
    const updatedList = [...monthExpenses];
    updatedList[index] = {
      ...updatedList[index],
      [field]: value,
    };
    onUpdateExpenses({
      ...(yearState.expenses || {}),
      [selectedMonth]: updatedList,
    });
  };

  const handleDeleteExpenseRow = (index: number) => {
    const updatedList = monthExpenses.filter((_, i) => i !== index);
    onUpdateExpenses({
      ...(yearState.expenses || {}),
      [selectedMonth]: updatedList,
    });
    showToast('Gasto eliminado', 'success');
  };

  const handleAddExpenseRow = () => {
    const newRow: ExpenseRow = {
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      cuentaOrigen: '',
      tipo: 'Gasto Fijo',
      clasificacion: 'Vivienda',
      importe: 0,
      capReaccion: null,
    };
    onUpdateExpenses({
      ...(yearState.expenses || {}),
      [selectedMonth]: [...monthExpenses, newRow],
    });
  };

  const handleCopyExpensesFromPrevious = () => {
    if (!prevMonthId) return;
    const prevExpenses = yearState.expenses?.[prevMonthId] || [];
    if (prevExpenses.length === 0) {
      showToast(`El mes de ${prevMonthLabel} no tiene gastos registrados.`, 'error');
      return;
    }
    const cloned = prevExpenses.map((r) => ({
      ...r,
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    }));
    onUpdateExpenses({
      ...(yearState.expenses || {}),
      [selectedMonth]: cloned,
    });
    showToast(`Copiados ${cloned.length} gastos desde ${prevMonthLabel}`, 'success');
  };

  const parseInputValue = (val: string): number => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const parseCapReaccionValue = (val: string): number | null => {
    if (val === '') return null;
    const num = parseFloat(val);
    if (isNaN(num)) return null;
    // clamp between 0 and 100
    return Math.max(0, Math.min(100, num));
  };

  // SVG Mouse Move Helpers
  const handleTransferMouseMove = (e: React.MouseEvent<SVGCircleElement>, idx: number) => {
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (rect) {
      setTransferTooltipPos({
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 12,
      });
    }
    setHoveredTransferIdx(idx);
  };

  const handleExpenseMouseMove = (e: React.MouseEvent<SVGCircleElement>, idx: number) => {
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (rect) {
      setExpenseTooltipPos({
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 12,
      });
    }
    setHoveredExpenseIdx(idx);
  };

  return (
    <div className="space-y-6" id="savings-expenses-view-root">
      
      {/* Horizontal Month Selector Tabs */}
      <div className="overflow-x-auto border-b border-slate-200 pb-px" id="savings-month-tabs-container">
        <div className="flex gap-1.5 min-w-max pb-2">
          {CALENDAR_MONTHS.map((m) => {
            const isActive = selectedMonth === m.id;
            const hasTransfers = (yearState.transfers?.[m.id] || []).length > 0;
            const hasExpenses = (yearState.expenses?.[m.id] || []).length > 0;
            const hasData = hasTransfers || hasExpenses;
            
            return (
              <button
                key={m.id}
                id={`month-tab-${m.id}`}
                onClick={() => setSelectedMonth(m.id)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 focus:outline-none ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs border border-blue-600'
                    : 'bg-white border border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <span>{m.label}</span>
                {hasData && (
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-white' : 'bg-blue-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="savings-stats-row">
        {/* Card 1: Payroll Net */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs flex items-center gap-4" id="card-savings-neto">
          <div className="p-3 rounded-lg bg-blue-500/5 text-blue-600">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Nómina Neta Mes
            </span>
            <span className="block font-mono text-lg font-extrabold text-slate-800">
              {netoNomina.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              Calculada en la sección de nómina
            </span>
          </div>
        </div>

        {/* Card 2: Total Committed */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs flex items-center gap-4" id="card-savings-total-importe">
          <div className="p-3 rounded-lg bg-amber-500/5 text-amber-500">
            <Coins className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Comprometido
            </span>
            <span className="block font-mono text-lg font-extrabold text-slate-800">
              {totalCombinedCommitted.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
            <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400 font-medium">
              <span className="truncate">Tf: {totalTransfersImporte.toLocaleString('es-ES')} €</span>
              <span>•</span>
              <span className="truncate">Gs: {totalExpensesImporte.toLocaleString('es-ES')} €</span>
            </div>
          </div>
        </div>

        {/* Card 3: Free Balance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs flex items-center gap-4" id="card-savings-saldo-libre">
          <div className={`p-3 rounded-lg ${saldoLibreFinal >= 0 ? 'bg-emerald-500/5 text-emerald-600' : 'bg-rose-500/5 text-rose-600'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Saldo Libre Final
            </span>
            <span className={`block font-mono text-lg font-extrabold ${saldoLibreFinal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {saldoLibreFinal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              Sobrante real tras transferencias y gastos
            </span>
          </div>
        </div>

        {/* Card 4: Percent Consumed */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs flex items-center gap-4" id="card-savings-pct">
          <div className={`p-3 rounded-lg ${statusColor}`}>
            {badgeIcon}
          </div>
          <div className="flex-1 min-w-0">
            <span className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              % Consumo de Nómina
            </span>
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-lg font-extrabold text-slate-800">
                {totalCombinedPercent.toFixed(2)}%
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                {badgeLabel}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                style={{ width: `${Math.min(100, totalCombinedPercent)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* COLLAPSIBLE 1: TRANSFERENCIAS AUTOMÁTICAS Y RESUMEN */}
      {/* ====================================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" id="collapsible-transfers-section">
        {/* Clickable Header */}
        <div 
          onClick={() => setIsTransfersOpen(!isTransfersOpen)}
          className="flex justify-between items-center px-5 py-4 bg-slate-50 border-b border-slate-100 cursor-pointer select-none hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-blue-500/10 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                1. Transferencias Automáticas Mensuales
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Suma: <span className="font-bold text-slate-700">{totalTransfersImporte.toLocaleString('es-ES')} €</span> ({totalTransfersPorcentajeNeto.toFixed(1)}% del neto) • {monthTransfers.length} operaciones
              </p>
            </div>
          </div>
          <div className="text-slate-400 p-1 hover:text-slate-600 rounded transition-colors">
            {isTransfersOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {isTransfersOpen && (
          <div className="p-5 space-y-6 bg-white animate-fade-in">
            {/* Action buttons and Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-100">
              <p className="text-xs text-slate-400 font-medium">
                Controla las salidas automatizadas del mes de {CALENDAR_MONTHS[selectedIndex].label} a cuentas de ahorro, depósitos o brokers.
              </p>
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                {prevMonthId && (
                  <button
                    type="button"
                    onClick={handleCopyTransfersFromPrevious}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer border border-slate-200"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar de {prevMonthLabel}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddTransferRow}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Operación</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-slate-200/60 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3 pl-4">Cuenta Origen</th>
                    <th className="p-3 text-center w-12">
                      <ArrowRight className="w-4.5 h-4.5 text-slate-300 mx-auto" />
                    </th>
                    <th className="p-3">Cuenta Destino</th>
                    <th className="p-3">Concepto</th>
                    <th className="p-3 w-44">Tipo</th>
                    <th className="p-3 text-right w-36">Importe (€)</th>
                    <th className="p-3 text-right w-32">% Neto</th>
                    <th className="p-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthTransfers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-medium">
                        No hay transferencias automáticas registradas en este mes. Haz clic en "Añadir Operación" para empezar.
                      </td>
                    </tr>
                  ) : (
                    monthTransfers.map((row, index) => {
                      const rowPct = netoNomina > 0 ? (row.importe / netoNomina) * 100 : 0;
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-1.5 pl-4">
                            <input
                              type="text"
                              value={row.cuentaOrigen}
                              placeholder="p. ej. BBVA Nómina"
                              onChange={(e) => handleUpdateTransferField(index, 'cuentaOrigen', e.target.value)}
                              className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2.5 py-1.5 text-slate-800 transition-all font-sans"
                            />
                          </td>
                          <td className="p-1.5 text-center text-slate-300 font-bold">
                            <ArrowRight className="w-4 h-4 mx-auto" />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.cuentaDestino}
                              placeholder="p. ej. Trade Republic"
                              onChange={(e) => handleUpdateTransferField(index, 'cuentaDestino', e.target.value)}
                              className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2.5 py-1.5 text-slate-800 transition-all font-sans"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={row.concepto}
                              placeholder="p. ej. Ahorro Remunerado"
                              onChange={(e) => handleUpdateTransferField(index, 'concepto', e.target.value)}
                              className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2.5 py-1.5 text-slate-800 transition-all font-sans"
                            />
                          </td>
                          <td className="p-1.5">
                            <select
                              value={row.tipo}
                              onChange={(e) => handleUpdateTransferField(index, 'tipo', e.target.value as any)}
                              className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 text-slate-800 font-bold transition-all font-sans cursor-pointer"
                            >
                              {TIPO_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="p-1.5">
                            <input
                              type="number"
                              step="any"
                              value={row.importe === 0 ? '' : row.importe}
                              placeholder="0.00"
                              onChange={(e) => handleUpdateTransferField(index, 'importe', parseInputValue(e.target.value))}
                              className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 text-slate-800 font-bold font-mono text-right transition-all"
                            />
                          </td>
                          <td className="p-1.5 text-right font-mono font-bold text-slate-500 select-none">
                            <span className="px-2.5">
                              {rowPct.toFixed(2)}%
                            </span>
                          </td>
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteTransferRow(index)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {monthTransfers.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800 font-mono">
                      <td colSpan={5} className="py-2.5 pl-[17px] text-left font-sans text-[10px] text-slate-500 uppercase tracking-wider">
                        Totales
                      </td>
                      <td className="py-2.5 pr-2 text-right text-slate-900">
                        {totalTransfersImporte.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </td>
                      <td className={`py-2.5 pr-[17px] text-right font-mono font-black ${
                        totalTransfersPorcentajeNeto < 90
                          ? 'text-emerald-600'
                          : totalTransfersPorcentajeNeto < 100
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}>
                        {totalTransfersPorcentajeNeto.toFixed(2)}%
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Side by Side Summaries */}
            {monthTransfers.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Summary Table */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
                    <h3 className="font-sans font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      Resumen Agregado por Tipo de Transferencia
                    </h3>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3 pl-4">Tipo</th>
                          <th className="p-3 text-right w-32">Suma (€)</th>
                          <th className="p-3 text-right w-24">Suma (%)</th>
                          <th className="p-3 text-right w-32">Resto (€)</th>
                          <th className="p-3 text-right w-24">Resto (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {transfersSummaryRows.map((row) => (
                          <tr key={row.tipo} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 pl-4 font-bold text-slate-700 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[row.tipo] }} />
                              <span>{row.tipo}</span>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-800">
                              {row.sumaEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-600">
                              {row.sumaPct.toFixed(2)}%
                            </td>
                            <td className="p-3 text-right font-mono font-medium text-slate-500">
                              {row.restoEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                            </td>
                            <td className="p-3 text-right font-mono font-medium text-slate-500">
                              {row.restoPct.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800 font-mono">
                          <td className="py-3 pl-4 text-left font-sans text-[10px] text-slate-500 uppercase tracking-wider">
                            Total
                          </td>
                          <td className="p-3 text-right text-slate-950 font-extrabold">
                            {transfersSummaryTotalSumaEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className={`p-3 text-right font-black ${
                            transfersSummaryTotalSumaPct < 90 ? 'text-emerald-600' : transfersSummaryTotalSumaPct < 100 ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {transfersSummaryTotalSumaPct.toFixed(2)}%
                          </td>
                          <td className={`p-3 text-right font-medium ${transfersSummaryTotalRestoEuros >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {transfersSummaryTotalRestoEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className={`p-3 text-right font-bold ${transfersSummaryTotalRestoPct >= 0 ? 'text-slate-600' : 'text-rose-600'}`}>
                            {transfersSummaryTotalRestoPct.toFixed(2)}%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs p-5 flex flex-col justify-between">
                  <div className="border-b border-slate-100 pb-3 mb-2">
                    <h3 className="font-sans font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-2">
                      <PieIcon className="w-3.5 h-3.5 text-indigo-600" />
                      Distribución Visual de Transferencias
                    </h3>
                  </div>

                  <div className="flex-1 flex items-center justify-center mt-2 relative">
                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center p-2 relative w-full h-full min-h-[220px]">
                      
                      {/* SVG Donut */}
                      <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                          <circle cx="80" cy="80" r={70} fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                          {(() => {
                            let accumulatedPercentage = 0;
                            const segments = transfersSummaryRows.map((row) => {
                              const value = Math.max(0, row.sumaEuros);
                              const pct = transfersSummaryTotalSumaEuros > 0 ? (value / transfersSummaryTotalSumaEuros) * 100 : 0;
                              return {
                                label: row.tipo,
                                value,
                                pct,
                                color: CATEGORY_COLORS[row.tipo] || '#94a3b8',
                              };
                            });

                            return segments.map((seg, idx) => {
                              if (seg.value <= 0) return null;
                              const segmentPercentage = seg.value / transfersSummaryTotalSumaEuros;
                              const strokeDasharray = `${segmentPercentage * 439.82} 439.82`;
                              const strokeDashoffset = -((accumulatedPercentage) * 439.82);
                              accumulatedPercentage += segmentPercentage;

                              const isHovered = hoveredTransferIdx === idx;

                              return (
                                <circle
                                  key={idx}
                                  cx="80"
                                  cy="80"
                                  r={70}
                                  fill="transparent"
                                  stroke={seg.color}
                                  strokeWidth={isHovered ? 20 : 16}
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  strokeLinecap="round"
                                  className="transition-all duration-200 cursor-pointer"
                                  onMouseMove={(e) => handleTransferMouseMove(e, idx)}
                                  onMouseEnter={() => setHoveredTransferIdx(idx)}
                                  onMouseLeave={() => {
                                    setHoveredTransferIdx(null);
                                    setTransferTooltipPos(null);
                                  }}
                                />
                              );
                            });
                          })()}
                        </svg>

                        {/* Center Text */}
                        <div className="absolute text-center px-4 pointer-events-none select-none max-w-full">
                          {(() => {
                            const segments = transfersSummaryRows.map((row) => {
                              const value = Math.max(0, row.sumaEuros);
                              const pct = transfersSummaryTotalSumaEuros > 0 ? (value / transfersSummaryTotalSumaEuros) * 100 : 0;
                              return {
                                label: row.tipo,
                                value,
                                pct,
                                color: CATEGORY_COLORS[row.tipo] || '#94a3b8',
                              };
                            });

                            if (hoveredTransferIdx !== null && segments[hoveredTransferIdx]) {
                              const activeSeg = segments[hoveredTransferIdx];
                              return (
                                <>
                                  <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 truncate" style={{ color: activeSeg.color }}>
                                    {activeSeg.label}
                                  </span>
                                  <span className="block text-xs font-extrabold text-slate-800 mt-0.5 whitespace-nowrap">
                                    {activeSeg.value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                  </span>
                                  <span className="block text-[10px] font-bold text-slate-500 font-mono">
                                    {activeSeg.pct.toFixed(1)}%
                                  </span>
                                </>
                              );
                            }

                            return (
                              <>
                                <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                  Total Tf.
                                </span>
                                <span className="block text-xs font-extrabold text-slate-800 mt-0.5 whitespace-nowrap">
                                  {transfersSummaryTotalSumaEuros.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex-none flex flex-row sm:flex-col flex-wrap sm:flex-nowrap justify-center gap-x-4 gap-y-1.5 text-[11px] w-full max-w-xs sm:max-w-[150px]">
                        {transfersSummaryRows.map((row, idx) => {
                          if (row.sumaEuros <= 0) return null;
                          const isHovered = hoveredTransferIdx === idx;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                                hoveredTransferIdx !== null && !isHovered ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
                              }`}
                              onMouseEnter={() => setHoveredTransferIdx(idx)}
                              onMouseLeave={() => setHoveredTransferIdx(null)}
                            >
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[row.tipo] }} />
                              <span className={`font-sans font-medium text-slate-600 truncate transition-colors ${isHovered ? 'text-slate-900 font-bold' : ''}`}>
                                {row.tipo}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Floating Tooltip */}
                      {hoveredTransferIdx !== null && transferTooltipPos && (() => {
                        const segments = transfersSummaryRows.map((row) => {
                          const value = Math.max(0, row.sumaEuros);
                          const pct = transfersSummaryTotalSumaEuros > 0 ? (value / transfersSummaryTotalSumaEuros) * 100 : 0;
                          return {
                            label: row.tipo,
                            value,
                            pct,
                            color: CATEGORY_COLORS[row.tipo] || '#94a3b8',
                          };
                        });
                        const seg = segments[hoveredTransferIdx];
                        if (!seg) return null;
                        return (
                          <div
                            className="absolute z-10 bg-slate-900/95 text-white text-[11px] font-sans rounded-lg py-1.5 px-2.5 shadow-md pointer-events-none space-y-0.5 border border-slate-800/50 backdrop-blur-xs font-medium"
                            style={{ left: transferTooltipPos.x, top: transferTooltipPos.y }}
                          >
                            <div className="font-bold text-slate-300">{seg.label}</div>
                            <div className="font-mono text-white flex items-center gap-1.5">
                              <span>{seg.value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                              <span style={{ color: seg.color }} className="font-bold">({seg.pct.toFixed(1)}%)</span>
                            </div>
                          </div>
                        );
                      })()}

                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

      {/* ====================================================================== */}
      {/* COLLAPSIBLE 2: GASTOS MENSUALES, TABLA Y RESUMEN */}
      {/* ====================================================================== */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden" id="collapsible-expenses-section">
        {/* Clickable Header */}
        <div 
          onClick={() => setIsExpensesOpen(!isExpensesOpen)}
          className="flex justify-between items-center px-5 py-4 bg-slate-50 border-b border-slate-100 cursor-pointer select-none hover:bg-slate-100/70 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded bg-rose-500/10 text-rose-600">
              <Coins className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-sans font-extrabold text-slate-800 text-sm tracking-tight flex items-center gap-2">
                2. Registro y Control de Gastos Mensuales
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Suma: <span className="font-bold text-slate-700">{totalExpensesImporte.toLocaleString('es-ES')} €</span> ({totalExpensesPorcentajeNeto.toFixed(1)}% del neto) • Reacción media: <span className="font-bold text-slate-700">{promedioCapReaccion !== null ? `${promedioCapReaccion.toFixed(1)}%` : 'N/A'}</span> • {monthExpenses.length} partidas
              </p>
            </div>
          </div>
          <div className="text-slate-400 p-1 hover:text-slate-600 rounded transition-colors">
            {isExpensesOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {isExpensesOpen && (
          <div className="p-5 space-y-6 bg-white animate-fade-in">
            {/* Action buttons and Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-100">
              <p className="text-xs text-slate-400 font-medium">
                Registra los consumos, suministros, ocio y ahorros directos para estimar tu margen de ajuste (capacidad de reacción) por partida.
              </p>
              <div className="flex gap-2 w-full sm:w-auto shrink-0">
                {prevMonthId && (
                  <button
                    type="button"
                    onClick={handleCopyExpensesFromPrevious}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer border border-slate-200"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar de {prevMonthLabel}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleAddExpenseRow}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Añadir Gasto</span>
                </button>
              </div>
            </div>

            {/* Expenses Table */}
            <div className="overflow-x-auto border border-slate-200/60 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3 pl-4">Cuenta Origen</th>
                    <th className="p-3 w-40">Tipo</th>
                    <th className="p-3 w-44">Clasificación</th>
                    <th className="p-3 text-right w-36">Importe (€)</th>
                    <th className="p-3 text-right w-32">% Neto</th>
                    <th className="p-3 text-right w-40">Cap. Reacción %</th>
                    <th className="p-3 text-center w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                        No hay gastos mensuales registrados en este mes. Haz clic en "Añadir Gasto" para empezar.
                      </td>
                    </tr>
                  ) : (
                    monthExpenses.map((row, index) => {
                      const rowPct = netoNomina > 0 ? (row.importe / netoNomina) * 100 : 0;
                      return (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          {/* Cuenta Origen */}
                          <td className="p-1.5 pl-4">
                            <input
                              type="text"
                              value={row.cuentaOrigen}
                              placeholder="p. ej. Cuenta Corriente"
                              onChange={(e) => handleUpdateExpenseField(index, 'cuentaOrigen', e.target.value)}
                              className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2.5 py-1.5 text-slate-800 transition-all font-sans"
                            />
                          </td>

                          {/* Tipo */}
                          <td className="p-1.5">
                            <select
                              value={row.tipo}
                              onChange={(e) => handleUpdateExpenseField(index, 'tipo', e.target.value as any)}
                              className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 text-slate-800 font-bold transition-all font-sans cursor-pointer"
                            >
                              {EXPENSE_TIPO_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Clasificación */}
                          <td className="p-1.5">
                            <select
                              value={row.clasificacion}
                              onChange={(e) => handleUpdateExpenseField(index, 'clasificacion', e.target.value as any)}
                              className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 text-slate-800 font-bold transition-all font-sans cursor-pointer"
                            >
                              {EXPENSE_CLASIFICACION_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Importe */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              step="any"
                              value={row.importe === 0 ? '' : row.importe}
                              placeholder="0.00"
                              onChange={(e) => handleUpdateExpenseField(index, 'importe', parseInputValue(e.target.value))}
                              className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 text-slate-800 font-bold font-mono text-right transition-all"
                            />
                          </td>

                          {/* % Neto */}
                          <td className="p-1.5 text-right font-mono font-bold text-slate-500 select-none">
                            <span className="px-2.5">
                              {rowPct.toFixed(2)}%
                            </span>
                          </td>

                          {/* Cap. Reacción % */}
                          <td className="p-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="p. ej. 50"
                              value={row.capReaccion === null ? '' : row.capReaccion}
                              onChange={(e) => handleUpdateExpenseField(index, 'capReaccion', parseCapReaccionValue(e.target.value))}
                              className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 text-slate-800 font-bold font-mono text-right transition-all"
                            />
                          </td>

                          {/* Delete button */}
                          <td className="p-1.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteExpenseRow(index)}
                              className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {monthExpenses.length > 0 && (
                  <tfoot>
                    <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800 font-mono">
                      <td colSpan={3} className="py-2.5 pl-[17px] text-left font-sans text-[10px] text-slate-500 uppercase tracking-wider">
                        Totales
                      </td>
                      <td className="py-2.5 pr-2 text-right text-slate-900">
                        {totalExpensesImporte.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </td>
                      <td className={`py-2.5 pr-[17px] text-right font-mono font-black ${
                        totalExpensesPorcentajeNeto < 90
                          ? 'text-emerald-600'
                          : totalExpensesPorcentajeNeto < 100
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}>
                        {totalExpensesPorcentajeNeto.toFixed(2)}%
                      </td>
                      <td className="py-2.5 pr-4 text-right font-mono text-slate-700 text-[11px]">
                        Media: <span className="font-extrabold text-slate-900">{promedioCapReaccion !== null ? `${promedioCapReaccion.toFixed(2)}%` : 'N/A'}</span>
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>

            {/* Side-by-side Summaries for Expenses */}
            {monthExpenses.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Expenses Summary Table */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between">
                  <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
                    <h3 className="font-sans font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-rose-500" />
                      Resumen de Gastos por Categoría (Clasificación)
                    </h3>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="p-3 pl-4">Categoría</th>
                          <th className="p-3 text-right w-32">Suma (€)</th>
                          <th className="p-3 text-right w-24">Suma (%)</th>
                          <th className="p-3 text-right w-32">Resto (€)</th>
                          <th className="p-3 text-right w-24">Resto (%)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {expensesSummaryRows.map((row) => (
                          <tr key={row.clasificacion} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 pl-4 font-bold text-slate-700 flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_CLASIFICACION_COLORS[row.clasificacion] }} />
                              <span>{row.clasificacion}</span>
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-800">
                              {row.sumaEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-slate-600">
                              {row.sumaPct.toFixed(2)}%
                            </td>
                            <td className="p-3 text-right font-mono font-medium text-slate-500">
                              {row.restoEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                            </td>
                            <td className="p-3 text-right font-mono font-medium text-slate-500">
                              {row.restoPct.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800 font-mono">
                          <td className="py-3 pl-4 text-left font-sans text-[10px] text-slate-500 uppercase tracking-wider">
                            Total
                          </td>
                          <td className="p-3 text-right text-slate-950 font-extrabold">
                            {expensesSummaryTotalSumaEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className={`p-3 text-right font-black ${
                            expensesSummaryTotalSumaPct < 90 ? 'text-emerald-600' : expensesSummaryTotalSumaPct < 100 ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {expensesSummaryTotalSumaPct.toFixed(2)}%
                          </td>
                          <td className={`p-3 text-right font-medium ${expensesSummaryTotalRestoEuros >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {expensesSummaryTotalRestoEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                          </td>
                          <td className={`p-3 text-right font-bold ${expensesSummaryTotalRestoPct >= 0 ? 'text-slate-600' : 'text-rose-600'}`}>
                            {expensesSummaryTotalRestoPct.toFixed(2)}%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Donut Chart */}
                <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs p-5 flex flex-col justify-between">
                  <div className="border-b border-slate-100 pb-3 mb-2">
                    <h3 className="font-sans font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-2">
                      <PieIcon className="w-3.5 h-3.5 text-rose-500" />
                      Distribución Visual de Gastos
                    </h3>
                  </div>

                  <div className="flex-1 flex items-center justify-center mt-2 relative">
                    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center p-2 relative w-full h-full min-h-[220px]">
                      
                      {/* SVG Donut */}
                      <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                        <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                          <circle cx="80" cy="80" r={70} fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                          {(() => {
                            let accumulatedPercentage = 0;
                            const segments = expensesSummaryRows.map((row) => {
                              const value = Math.max(0, row.sumaEuros);
                              const pct = expensesSummaryTotalSumaEuros > 0 ? (value / expensesSummaryTotalSumaEuros) * 100 : 0;
                              return {
                                label: row.clasificacion,
                                value,
                                pct,
                                color: EXPENSE_CLASIFICACION_COLORS[row.clasificacion] || '#94a3b8',
                              };
                            });

                            return segments.map((seg, idx) => {
                              if (seg.value <= 0) return null;
                              const segmentPercentage = seg.value / expensesSummaryTotalSumaEuros;
                              const strokeDasharray = `${segmentPercentage * 439.82} 439.82`;
                              const strokeDashoffset = -((accumulatedPercentage) * 439.82);
                              accumulatedPercentage += segmentPercentage;

                              const isHovered = hoveredExpenseIdx === idx;

                              return (
                                <circle
                                  key={idx}
                                  cx="80"
                                  cy="80"
                                  r={70}
                                  fill="transparent"
                                  stroke={seg.color}
                                  strokeWidth={isHovered ? 20 : 16}
                                  strokeDasharray={strokeDasharray}
                                  strokeDashoffset={strokeDashoffset}
                                  strokeLinecap="round"
                                  className="transition-all duration-200 cursor-pointer"
                                  onMouseMove={(e) => handleExpenseMouseMove(e, idx)}
                                  onMouseEnter={() => setHoveredExpenseIdx(idx)}
                                  onMouseLeave={() => {
                                    setHoveredExpenseIdx(null);
                                    setExpenseTooltipPos(null);
                                  }}
                                />
                              );
                            });
                          })()}
                        </svg>

                        {/* Center Text */}
                        <div className="absolute text-center px-4 pointer-events-none select-none max-w-full">
                          {(() => {
                            const segments = expensesSummaryRows.map((row) => {
                              const value = Math.max(0, row.sumaEuros);
                              const pct = expensesSummaryTotalSumaEuros > 0 ? (value / expensesSummaryTotalSumaEuros) * 100 : 0;
                              return {
                                label: row.clasificacion,
                                value,
                                pct,
                                color: EXPENSE_CLASIFICACION_COLORS[row.clasificacion] || '#94a3b8',
                              };
                            });

                            if (hoveredExpenseIdx !== null && segments[hoveredExpenseIdx]) {
                              const activeSeg = segments[hoveredExpenseIdx];
                              return (
                                <>
                                  <span className="block text-[8px] font-bold uppercase tracking-wider text-slate-400 truncate" style={{ color: activeSeg.color }}>
                                    {activeSeg.label}
                                  </span>
                                  <span className="block text-xs font-extrabold text-slate-800 mt-0.5 whitespace-nowrap">
                                    {activeSeg.value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                  </span>
                                  <span className="block text-[10px] font-bold text-slate-500 font-mono">
                                    {activeSeg.pct.toFixed(1)}%
                                  </span>
                                </>
                              );
                            }

                            return (
                              <>
                                <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400">
                                  Total Gs.
                                </span>
                                <span className="block text-xs font-extrabold text-slate-800 mt-0.5 whitespace-nowrap">
                                  {expensesSummaryTotalSumaEuros.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex-none flex flex-row sm:flex-col flex-wrap sm:flex-nowrap justify-center gap-x-4 gap-y-1.5 text-[11px] w-full max-w-xs sm:max-w-[150px]">
                        {expensesSummaryRows.map((row, idx) => {
                          if (row.sumaEuros <= 0) return null;
                          const isHovered = hoveredExpenseIdx === idx;
                          return (
                            <div
                              key={idx}
                              className={`flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                                hoveredExpenseIdx !== null && !isHovered ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
                              }`}
                              onMouseEnter={() => setHoveredExpenseIdx(idx)}
                              onMouseLeave={() => setHoveredExpenseIdx(null)}
                            >
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: EXPENSE_CLASIFICACION_COLORS[row.clasificacion] }} />
                              <span className={`font-sans font-medium text-slate-600 truncate transition-colors ${isHovered ? 'text-slate-900 font-bold' : ''}`}>
                                {row.clasificacion}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Floating Tooltip */}
                      {hoveredExpenseIdx !== null && expenseTooltipPos && (() => {
                        const segments = expensesSummaryRows.map((row) => {
                          const value = Math.max(0, row.sumaEuros);
                          const pct = expensesSummaryTotalSumaEuros > 0 ? (value / expensesSummaryTotalSumaEuros) * 100 : 0;
                          return {
                            label: row.clasificacion,
                            value,
                            pct,
                            color: EXPENSE_CLASIFICACION_COLORS[row.clasificacion] || '#94a3b8',
                          };
                        });
                        const seg = segments[hoveredExpenseIdx];
                        if (!seg) return null;
                        return (
                          <div
                            className="absolute z-10 bg-slate-900/95 text-white text-[11px] font-sans rounded-lg py-1.5 px-2.5 shadow-md pointer-events-none space-y-0.5 border border-slate-800/50 backdrop-blur-xs font-medium"
                            style={{ left: expenseTooltipPos.x, top: expenseTooltipPos.y }}
                          >
                            <div className="font-bold text-slate-300">{seg.label}</div>
                            <div className="font-mono text-white flex items-center gap-1.5">
                              <span>{seg.value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                              <span style={{ color: seg.color }} className="font-bold">({seg.pct.toFixed(1)}%)</span>
                            </div>
                          </div>
                        );
                      })()}

                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
