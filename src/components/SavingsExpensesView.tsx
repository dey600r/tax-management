import React, { useState } from 'react';
import { MonthId, YearState, TransferRow } from '../types';
import { ComputedYearResult } from '../utils/calculations';
import { Plus, Trash2, Copy, AlertTriangle, CheckCircle2, Wallet, TrendingUp, ArrowRight, PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

interface SavingsExpensesViewProps {
  yearState: YearState;
  computedYear: ComputedYearResult;
  onUpdateTransfers: (transfers: Record<string, TransferRow[]>) => void;
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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 border border-slate-800 text-white p-2.5 rounded-xl shadow-lg text-[10px] font-medium font-sans">
        <p className="font-bold text-slate-200 mb-1">{data.name}</p>
        <p className="font-mono text-slate-100">
          Suma: <span className="font-extrabold">{data.value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</span>
        </p>
        <p className="font-mono text-slate-300">
          Porcentaje: <span className="font-extrabold">{data.pct.toFixed(2)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export const SavingsExpensesView: React.FC<SavingsExpensesViewProps> = ({
  yearState,
  computedYear,
  onUpdateTransfers,
  showToast,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<MonthId>('enero');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Active month data
  const monthTransfers = yearState.transfers?.[selectedMonth] || [];
  const netoNomina = computedYear.months[selectedMonth]?.neto || 0;

  // Calculate totals
  const totalImporte = monthTransfers.reduce((sum, r) => sum + r.importe, 0);

  // TotalPorcentajeNeto = Σ(%NetoFila)
  const totalPorcentajeNeto = monthTransfers.reduce((sum, r) => {
    const pct = netoNomina > 0 ? (r.importe / netoNomina) * 100 : 0;
    return sum + pct;
  }, 0);

  const saldoLibre = netoNomina - totalImporte;

  // Calculate Summary Bank Transfer Rows
  const summaryRows = TIPO_OPTIONS.map((tipo) => {
    const transfersOfTipo = monthTransfers.filter((r) => r.tipo === tipo);
    const sumaEuros = transfersOfTipo.reduce((sum, r) => sum + r.importe, 0);
    
    let sumaPct = 0;
    let restoPct = 0;
    
    if (netoNomina > 0 && monthTransfers.length > 0) {
      sumaPct = (sumaEuros / netoNomina) * 100;
      restoPct = 100 - sumaPct;
    }
    
    const restoEuros = netoNomina - sumaEuros;
    
    return {
      tipo,
      sumaEuros,
      sumaPct,
      restoEuros,
      restoPct,
    };
  });

  const summaryTotalSumaEuros = summaryRows.reduce((sum, r) => sum + r.sumaEuros, 0);
  let summaryTotalSumaPct = 0;
  let summaryTotalRestoPct = 0;
  
  if (netoNomina > 0 && monthTransfers.length > 0) {
    summaryTotalSumaPct = (summaryTotalSumaEuros / netoNomina) * 100;
    summaryTotalRestoPct = 100 - summaryTotalSumaPct;
  }
  
  const summaryTotalRestoEuros = netoNomina - summaryTotalSumaEuros;

  const handleMouseMove = (e: React.MouseEvent<SVGCircleElement>, idx: number) => {
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 12,
      });
    }
    setHoveredIdx(idx);
  };

  // Visual status rules for Total % NETO
  let statusColor = 'text-emerald-600 bg-emerald-500/10 border-emerald-200';
  let progressColor = 'bg-emerald-500';
  let badgeLabel = 'Seguro';
  let badgeIcon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;

  if (totalPorcentajeNeto >= 90 && totalPorcentajeNeto < 100) {
    statusColor = 'text-amber-600 bg-amber-500/10 border-amber-200';
    progressColor = 'bg-amber-500';
    badgeLabel = 'Límite cercano';
    badgeIcon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
  } else if (totalPorcentajeNeto >= 100) {
    statusColor = 'text-rose-600 bg-rose-500/10 border-rose-200';
    progressColor = 'bg-rose-500';
    badgeLabel = 'Supera nómina';
    badgeIcon = <AlertTriangle className="w-4 h-4 text-rose-500" />;
  }

  // Row update handlers
  const handleUpdateRowField = (index: number, field: keyof TransferRow, value: any) => {
    const updatedList = [...monthTransfers];
    updatedList[index] = {
      ...updatedList[index],
      [field]: value,
    };
    
    const newTransfers = {
      ...(yearState.transfers || {}),
      [selectedMonth]: updatedList,
    };
    onUpdateTransfers(newTransfers);
  };

  const handleDeleteRow = (index: number) => {
    const updatedList = monthTransfers.filter((_, i) => i !== index);
    const newTransfers = {
      ...(yearState.transfers || {}),
      [selectedMonth]: updatedList,
    };
    onUpdateTransfers(newTransfers);
    showToast('Transferencia eliminada', 'success');
  };

  const handleAddRow = () => {
    const newRow: TransferRow = {
      id: 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      cuentaOrigen: '',
      cuentaDestino: '',
      concepto: '',
      tipo: 'Gasto Fijo',
      importe: 0,
    };
    const updatedList = [...monthTransfers, newRow];
    const newTransfers = {
      ...(yearState.transfers || {}),
      [selectedMonth]: updatedList,
    };
    onUpdateTransfers(newTransfers);
  };

  // Find previous month for copy feature
  const selectedIndex = CALENDAR_MONTHS.findIndex((m) => m.id === selectedMonth);
  const prevMonthId = selectedIndex > 0 ? CALENDAR_MONTHS[selectedIndex - 1].id : null;
  const prevMonthLabel = selectedIndex > 0 ? CALENDAR_MONTHS[selectedIndex - 1].label : '';

  const handleCopyFromPrevious = () => {
    if (!prevMonthId) return;
    const prevTransfers = yearState.transfers?.[prevMonthId] || [];
    if (prevTransfers.length === 0) {
      showToast(`El mes de ${prevMonthLabel} no tiene transferencias registradas.`, 'error');
      return;
    }

    // Deep copy and generate new unique IDs
    const cloned = prevTransfers.map((r) => ({
      ...r,
      id: 'trans_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    }));

    const newTransfers = {
      ...(yearState.transfers || {}),
      [selectedMonth]: cloned,
    };
    onUpdateTransfers(newTransfers);
    showToast(`Copiadas ${cloned.length} transferencias desde ${prevMonthLabel}`, 'success');
  };

  const parseInputValue = (val: string): number => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  return (
    <div className="space-y-6" id="savings-expenses-view-root">
      
      {/* Horizontal Month Selector Tabs */}
      <div className="overflow-x-auto border-b border-slate-200 pb-px" id="savings-month-tabs-container">
        <div className="flex gap-1.5 min-w-max pb-2">
          {CALENDAR_MONTHS.map((m) => {
            const isActive = selectedMonth === m.id;
            const hasData = (yearState.transfers?.[m.id] || []).length > 0;
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

        {/* Card 2: Total Transfers */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs flex items-center gap-4" id="card-savings-total-importe">
          <div className="p-3 rounded-lg bg-amber-500/5 text-amber-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Total Transferido
            </span>
            <span className="block font-mono text-lg font-extrabold text-slate-800">
              {totalImporte.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              {monthTransfers.length} {monthTransfers.length === 1 ? 'operación registrada' : 'operaciones registradas'}
            </span>
          </div>
        </div>

        {/* Card 3: Free Balance */}
        <div className="bg-white border border-slate-200 rounded-xl p-4.5 shadow-2xs flex items-center gap-4" id="card-savings-saldo-libre">
          <div className={`p-3 rounded-lg ${saldoLibre >= 0 ? 'bg-emerald-500/5 text-emerald-600' : 'bg-rose-500/5 text-rose-600'}`}>
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="block font-sans text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Saldo Libre / Restante
            </span>
            <span className={`block font-mono text-lg font-extrabold ${saldoLibre >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {saldoLibre.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
            <span className="block text-[10px] text-slate-400 font-medium">
              Sobrante para gastos diarios
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
                {totalPorcentajeNeto.toFixed(2)}%
              </span>
              <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-full border bg-slate-50 text-slate-600 border-slate-200">
                {badgeLabel}
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${progressColor}`}
                style={{ width: `${Math.min(100, totalPorcentajeNeto)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs" id="transfers-table-container">
        {/* Table Title Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div>
            <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Transferencias automáticas del mes de {CALENDAR_MONTHS[selectedIndex].label}
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Controla las salidas a cuentas de ahorro, fondos, depósitos o cuentas secundarias.
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {/* Copy button */}
            {prevMonthId && (
              <button
                type="button"
                id="btn-copy-prev-month"
                onClick={handleCopyFromPrevious}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-lg transition-colors cursor-pointer border border-slate-200"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar de {prevMonthLabel}</span>
              </button>
            )}

            {/* Add Row Button */}
            <button
              type="button"
              id="btn-add-transfer"
              onClick={handleAddRow}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Añadir Operación</span>
            </button>
          </div>
        </div>

        {/* The table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs" id="transfers-data-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3 pl-4">Cuenta Origen</th>
                <th className="p-3 text-center">
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
                  <td colSpan={8} className="p-10 text-center text-slate-400 font-medium">
                    No hay transferencias automáticas registradas en este mes. 
                    Haz clic en <span className="font-semibold text-blue-600">"Añadir Operación"</span> para empezar.
                  </td>
                </tr>
              ) : (
                monthTransfers.map((row, index) => {
                  const rowPct = netoNomina > 0 ? (row.importe / netoNomina) * 100 : 0;
                  return (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Cuenta Origen */}
                      <td className="p-2 pl-4">
                        <input
                          type="text"
                          id={`input-origen-${row.id}`}
                          value={row.cuentaOrigen}
                          placeholder="p. ej. BBVA Nómina"
                          onChange={(e) => handleUpdateRowField(index, 'cuentaOrigen', e.target.value)}
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2.5 py-1.5 text-slate-800 transition-all font-sans"
                        />
                      </td>

                      {/* Arrow Spacer */}
                      <td className="p-2 text-center text-slate-300 font-bold">
                        <ArrowRight className="w-4 h-4 mx-auto" />
                      </td>

                      {/* Cuenta Destino */}
                      <td className="p-2">
                        <input
                          type="text"
                          id={`input-destino-${row.id}`}
                          value={row.cuentaDestino}
                          placeholder="p. ej. Trade Republic"
                          onChange={(e) => handleUpdateRowField(index, 'cuentaDestino', e.target.value)}
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2.5 py-1.5 text-slate-800 transition-all font-sans"
                        />
                      </td>

                      {/* Concepto */}
                      <td className="p-2">
                        <input
                          type="text"
                          id={`input-concepto-${row.id}`}
                          value={row.concepto}
                          placeholder="p. ej. Ahorro Remunerado"
                          onChange={(e) => handleUpdateRowField(index, 'concepto', e.target.value)}
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2.5 py-1.5 text-slate-800 transition-all font-sans"
                        />
                      </td>

                      {/* Tipo */}
                      <td className="p-2">
                        <select
                          id={`select-tipo-${row.id}`}
                          value={row.tipo}
                          onChange={(e) => handleUpdateRowField(index, 'tipo', e.target.value as any)}
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 text-slate-800 font-bold transition-all font-sans cursor-pointer"
                        >
                          {TIPO_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Importe */}
                      <td className="p-2">
                        <input
                          type="number"
                          step="any"
                          id={`input-importe-${row.id}`}
                          value={row.importe === 0 ? '' : row.importe}
                          placeholder="0.00"
                          onChange={(e) => handleUpdateRowField(index, 'importe', parseInputValue(e.target.value))}
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-2 py-1.5 text-slate-800 font-bold font-mono text-right transition-all"
                        />
                      </td>

                      {/* % Neto */}
                      <td className="p-2 text-right font-mono font-bold text-slate-500 select-none">
                        <span id={`pct-row-${row.id}`} className="px-2.5">
                          {rowPct.toFixed(2)}%
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          id={`btn-delete-row-${row.id}`}
                          onClick={() => handleDeleteRow(index)}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar operación"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Footer with sums */}
            {monthTransfers.length > 0 && (
              <tfoot>
                <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800 font-mono">
                  <td colSpan={5} className="py-3 pl-[17px] text-left font-sans text-[10px] text-slate-500 uppercase tracking-wider">
                    Totales
                  </td>
                  <td className="py-3 pr-2 text-right text-slate-900">
                    <span id="savings-total-importe">
                      {totalImporte.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  </td>
                  <td className={`py-3 pr-[17px] text-right font-mono font-black ${
                    totalPorcentajeNeto < 90
                      ? 'text-emerald-600'
                      : totalPorcentajeNeto < 100
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}>
                    <span id="savings-total-pct">
                      {totalPorcentajeNeto.toFixed(2)}%
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Table & Chart Side-by-Side Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="summary-and-chart-row-container">
        
        {/* Summary Bank Transfer Table */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs flex flex-col justify-between" id="summary-bank-transfer-container">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70" id="summary-bank-transfer-header">
            <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Resumen de transferencias bancarias mensuales (Summary Bank Transfer)
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Agregación por tipo de transferencia para visualizar el saldo comprometido y el remanente disponible.
            </p>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-xs" id="summary-bank-transfer-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3 pl-4" id="th-summary-tipo">Tipo</th>
                  <th className="p-3 text-right w-32" id="th-summary-suma-euros">Suma (€)</th>
                  <th className="p-3 text-right w-24" id="th-summary-suma-pct">Suma (%)</th>
                  <th className="p-3 text-right w-32" id="th-summary-resto-euros">Resto (€)</th>
                  <th className="p-3 text-right w-24" id="th-summary-resto-pct">Resto (%)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {summaryRows.map((row) => (
                  <tr key={row.tipo} id={`summary-row-${row.tipo.toLowerCase().replace(/\s+/g, '-')}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 pl-4 font-bold text-slate-700 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CATEGORY_COLORS[row.tipo] }} />
                      <span>{row.tipo}</span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">
                      <span id={`summary-suma-euros-${row.tipo.toLowerCase().replace(/\s+/g, '-')}`}>
                        {row.sumaEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-bold text-slate-600">
                      <span id={`summary-suma-pct-${row.tipo.toLowerCase().replace(/\s+/g, '-')}`}>
                        {row.sumaPct.toFixed(2)}%
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-slate-500">
                      <span id={`summary-resto-euros-${row.tipo.toLowerCase().replace(/\s+/g, '-')}`}>
                        {row.restoEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono font-medium text-slate-500">
                      <span id={`summary-resto-pct-${row.tipo.toLowerCase().replace(/\s+/g, '-')}`}>
                        {row.restoPct.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot>
                <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800 font-mono" id="summary-row-total">
                  <td className="py-3 pl-4 text-left font-sans text-[10px] text-slate-500 uppercase tracking-wider">
                    Total
                  </td>
                  <td className="p-3 text-right text-slate-950 font-extrabold">
                    <span id="summary-total-suma-euros">
                      {summaryTotalSumaEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  </td>
                  <td className={`p-3 text-right font-black ${
                    summaryTotalSumaPct < 90
                      ? 'text-emerald-600'
                      : summaryTotalSumaPct < 100
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}>
                    <span id="summary-total-suma-pct">
                      {summaryTotalSumaPct.toFixed(2)}%
                    </span>
                  </td>
                  <td className={`p-3 text-right font-medium ${summaryTotalRestoEuros >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    <span id="summary-total-resto-euros">
                      {summaryTotalRestoEuros.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                    </span>
                  </td>
                  <td className={`p-3 text-right font-bold ${summaryTotalRestoPct >= 0 ? 'text-slate-600' : 'text-rose-600'}`}>
                    <span id="summary-total-resto-pct">
                      {summaryTotalRestoPct.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs p-5 flex flex-col justify-between" id="summary-chart-container">
          <div className="border-b border-slate-100 pb-3 mb-2" id="summary-chart-header">
            <h3 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-600" />
              Distribución por Categorías
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">
              Representación visual del destino de tus transferencias del mes.
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center mt-2 relative" id="pie-chart-wrapper">
            {summaryTotalSumaEuros <= 0 ? (
              <div className="text-center p-6 text-slate-400 font-medium text-xs flex flex-col items-center justify-center space-y-2 h-48 w-full">
                <div className="w-10 h-10 rounded-full border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                  <PieIcon className="w-5 h-5" />
                </div>
                <span>Sin transferencias para graficar en este mes.</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6 justify-center p-2 relative w-full h-full min-h-[220px]">
                {/* SVG Donut */}
                <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
                    <circle cx="80" cy="80" r={70} fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
                    {(() => {
                      let accumulatedPercentage = 0;
                      const chartSegments = summaryRows.map((row) => {
                        const value = Math.max(0, row.sumaEuros);
                        const pct = summaryTotalSumaEuros > 0 ? (value / summaryTotalSumaEuros) * 100 : 0;
                        return {
                          label: row.tipo,
                          value,
                          pct,
                          color: CATEGORY_COLORS[row.tipo] || '#94a3b8',
                        };
                      });

                      return chartSegments.map((seg, idx) => {
                        if (seg.value <= 0) return null;
                        const segmentPercentage = seg.value / summaryTotalSumaEuros;
                        const strokeDasharray = `${segmentPercentage * 439.82} 439.82`;
                        const strokeDashoffset = -((accumulatedPercentage) * 439.82);
                        accumulatedPercentage += segmentPercentage;

                        const isHovered = hoveredIdx === idx;

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
                            onMouseMove={(e) => handleMouseMove(e, idx)}
                            onMouseEnter={() => setHoveredIdx(idx)}
                            onMouseLeave={() => {
                              setHoveredIdx(null);
                              setTooltipPos(null);
                            }}
                          />
                        );
                      });
                    })()}
                  </svg>

                  {/* Center label */}
                  <div className="absolute text-center px-4 pointer-events-none select-none max-w-full">
                    {(() => {
                      const chartSegments = summaryRows.map((row) => {
                        const value = Math.max(0, row.sumaEuros);
                        const pct = summaryTotalSumaEuros > 0 ? (value / summaryTotalSumaEuros) * 100 : 0;
                        return {
                          label: row.tipo,
                          value,
                          pct,
                          color: CATEGORY_COLORS[row.tipo] || '#94a3b8',
                        };
                      });

                      if (hoveredIdx !== null && chartSegments[hoveredIdx]) {
                        return (
                          <>
                            <span 
                              className="block text-[9px] font-bold uppercase tracking-wider transition-colors duration-150"
                              style={{ color: chartSegments[hoveredIdx].color }}
                            >
                              {chartSegments[hoveredIdx].label}
                            </span>
                            <span className="block text-xs font-bold font-mono text-slate-800 mt-0.5 whitespace-nowrap">
                              {chartSegments[hoveredIdx].value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                            </span>
                            <span className="block text-[10px] font-bold text-slate-500 font-mono mt-0.5">
                              {chartSegments[hoveredIdx].pct.toFixed(1)}%
                            </span>
                          </>
                        );
                      }

                      return (
                        <>
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Total
                          </span>
                          <span className="block text-xs font-extrabold font-mono text-slate-800 mt-0.5 whitespace-nowrap">
                            {summaryTotalSumaEuros.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Simplified Compact Legend to the right */}
                <div className="flex-none flex flex-row sm:flex-col flex-wrap sm:flex-nowrap justify-center gap-x-4 gap-y-2 text-[11px] w-full max-w-xs sm:max-w-[160px]">
                  {(() => {
                    const chartSegments = summaryRows.map((row) => {
                      const value = Math.max(0, row.sumaEuros);
                      const pct = summaryTotalSumaEuros > 0 ? (value / summaryTotalSumaEuros) * 100 : 0;
                      return {
                        label: row.tipo,
                        value,
                        pct,
                        color: CATEGORY_COLORS[row.tipo] || '#94a3b8',
                      };
                    });

                    return chartSegments.map((seg, idx) => {
                      if (seg.value <= 0) return null;
                      const isHovered = hoveredIdx === idx;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                            hoveredIdx !== null && !isHovered ? 'opacity-40 scale-95' : 'opacity-100 scale-100'
                          }`}
                          onMouseEnter={() => setHoveredIdx(idx)}
                          onMouseLeave={() => setHoveredIdx(null)}
                        >
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                          <span className={`font-sans font-medium text-slate-600 transition-colors ${isHovered ? 'text-slate-900 font-bold' : ''}`}>
                            {seg.label}
                          </span>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Floating Tooltip */}
                {hoveredIdx !== null && tooltipPos && (() => {
                  const chartSegments = summaryRows.map((row) => {
                    const value = Math.max(0, row.sumaEuros);
                    const pct = summaryTotalSumaEuros > 0 ? (value / summaryTotalSumaEuros) * 100 : 0;
                    return {
                      label: row.tipo,
                      value,
                      pct,
                      color: CATEGORY_COLORS[row.tipo] || '#94a3b8',
                    };
                  });

                  const activeSeg = chartSegments[hoveredIdx];
                  if (!activeSeg) return null;

                  return (
                    <div
                      className="absolute z-10 bg-slate-900/95 text-white text-[11px] font-sans rounded-lg py-1.5 px-2.5 shadow-md pointer-events-none space-y-0.5 border border-slate-800/50 backdrop-blur-xs font-medium"
                      style={{ left: tooltipPos.x, top: tooltipPos.y }}
                    >
                      <div className="font-bold text-slate-300">{activeSeg.label}</div>
                      <div className="font-mono text-white flex items-center gap-1.5">
                        <span>{activeSeg.value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                        <span style={{ color: activeSeg.color }} className="font-bold">({activeSeg.pct.toFixed(1)}%)</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

      </div>



    </div>
  );
};
