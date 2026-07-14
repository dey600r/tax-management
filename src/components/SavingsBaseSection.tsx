import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Coins, TrendingUp } from 'lucide-react';
import { InvestmentRow } from '../types';

interface SavingsBaseSectionProps {
  inversiones: InvestmentRow[];
  onUpdateInversiones: (inversiones: InvestmentRow[]) => void;
}

export const SavingsBaseSection: React.FC<SavingsBaseSectionProps> = ({
  inversiones = [],
  onUpdateInversiones,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Add new dynamic row
  const handleAddRow = () => {
    const newRow: InvestmentRow = {
      id: 'inv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      banco: '',
      venta: 0,
      compra: 0,
      interesBruto: 0,
      impuestosEspana: 0,
      impuestosExtranjero: 0,
      comisiones: 0,
      comisionDeducible: false,
    };
    onUpdateInversiones([...inversiones, newRow]);
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    const updated = inversiones.filter((r) => r.id !== id);
    onUpdateInversiones(updated);
  };

  // Update specific field in a row
  const handleUpdateField = (
    index: number,
    field: keyof InvestmentRow,
    value: string | number | boolean
  ) => {
    const updated = [...inversiones];
    const currentRow = {
      ...updated[index],
      [field]: value,
    } as InvestmentRow;

    if (currentRow.venta !== 0 && currentRow.compra !== 0) {
      currentRow.interesBruto = Math.round((currentRow.venta - currentRow.compra) * 100) / 100;
    }

    updated[index] = currentRow;
    onUpdateInversiones(updated);
  };

  // Helper to safely parse float inputs
  const parseInputValue = (val: string): number => {
    if (val === '') return 0;
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Row and footer calculations
  const computedRows = inversiones.map((row) => {
    const hasVentaYCompra = row.venta !== 0 && row.compra !== 0;
    const interesBruto = hasVentaYCompra ? Math.round((row.venta - row.compra) * 100) / 100 : row.interesBruto;
    const impuestos = interesBruto * 0.19;
    const comisionesNoDeducibles = row.comisionDeducible ? 0 : row.comisiones;
    const total = interesBruto - impuestos - comisionesNoDeducibles;
    return {
      ...row,
      interesBruto,
      impuestos,
      comisionesNoDeducibles,
      total,
    };
  });

  // Footer 1 Totals
  const totalVenta = computedRows.reduce((sum, r) => sum + r.venta, 0);
  const totalCompra = computedRows.reduce((sum, r) => sum + r.compra, 0);
  const totalInteresBruto = computedRows.reduce((sum, r) => sum + r.interesBruto, 0);
  const totalImpuestos = computedRows.reduce((sum, r) => sum + r.impuestos, 0);
  const totalImpuestosEspana = computedRows.reduce((sum, r) => sum + r.impuestosEspana, 0);
  const totalImpuestosExtranjero = computedRows.reduce((sum, r) => sum + r.impuestosExtranjero, 0);
  const totalComisiones = computedRows.reduce((sum, r) => sum + r.comisiones, 0);
  const totalGeneral = computedRows.reduce((sum, r) => sum + r.total, 0);

  // Footer 2 Additional Summary
  const totalComisionesDeducibles = computedRows.reduce(
    (sum, r) => sum + (r.comisionDeducible ? r.comisiones : 0),
    0
  );
  const totalGastosDeducibles = totalInteresBruto - totalComisionesDeducibles;
  const impuestosResumen = totalGastosDeducibles * 0.19 - totalImpuestosExtranjero;

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
      {/* Header Button (Accordion) */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-slate-900 text-white select-none focus:outline-none cursor-pointer"
        id="savings-base-accordion-btn"
      >
        <div className="flex items-center gap-2.5">
          <Coins className="w-5 h-5 text-amber-400" />
          <span className="font-sans font-bold text-sm uppercase tracking-wider">
            Base del ahorro e inversiones
          </span>
        </div>
        <div className="flex items-center gap-2">
          {inversiones.length > 0 && (
            <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-bold font-mono">
              Int. Bruto: {totalInteresBruto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-amber-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-5 bg-white border-t border-slate-100 space-y-4 animate-slide-down">
          {/* Introductory notes */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <p className="text-xs text-slate-500 font-medium max-w-2xl">
              Registra aquí tus operaciones de inversión y cuentas bancarias. Se calculará automáticamente la retención fiscal teórica de la base del ahorro del 19%, restando las comisiones deducibles de los rendimientos brutos.
            </p>
            <button
              type="button"
              onClick={handleAddRow}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer shadow-sm"
              id="btn-add-investment"
            >
              <Plus className="w-4 h-4" />
              Añadir Inversión
            </button>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="p-3">Banco</th>
                  <th className="p-3 text-right">Venta (€)</th>
                  <th className="p-3 text-right">Compra (€)</th>
                  <th className="p-3 text-right">Interés Bruto (€)</th>
                  <th className="p-3 text-right">Impuestos (19%)</th>
                  <th className="p-3 text-right">Imp. España (€)</th>
                  <th className="p-3 text-right">Imp. Extranjero (€)</th>
                  <th className="p-3 text-center">Comisiones (€)</th>
                  <th className="p-3 text-right">Total (€)</th>
                  <th className="p-3 text-center w-12"></th>
                </tr>
              </thead>
              <tbody>
                {computedRows.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-slate-400 font-mono text-xs">
                      No hay inversiones registradas. Pulsa en "Añadir Inversión" para comenzar.
                    </td>
                  </tr>
                ) : (
                  computedRows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                    >
                      {/* BANCO */}
                      <td className="p-2 min-w-[130px]">
                        <input
                          type="text"
                          value={row.banco}
                          placeholder="Entidad bancaria"
                          onChange={(e) =>
                            handleUpdateField(index, 'banco', e.target.value)
                          }
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-amber-500 focus:bg-white rounded px-2 py-1 text-slate-700 font-sans focus:outline-none transition-all text-left font-medium"
                        />
                      </td>

                      {/* VENTA */}
                      <td className="p-2 min-w-[110px]">
                        <input
                          type="number"
                          step="any"
                          value={row.venta === 0 ? '' : row.venta}
                          placeholder="0.00"
                          onChange={(e) =>
                            handleUpdateField(index, 'venta', parseInputValue(e.target.value))
                          }
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-amber-500 focus:bg-white rounded px-2 py-1 text-slate-700 font-mono focus:outline-none transition-all text-right"
                        />
                      </td>

                      {/* COMPRA */}
                      <td className="p-2 min-w-[110px]">
                        <input
                          type="number"
                          step="any"
                          value={row.compra === 0 ? '' : row.compra}
                          placeholder="0.00"
                          onChange={(e) =>
                            handleUpdateField(index, 'compra', parseInputValue(e.target.value))
                          }
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-amber-500 focus:bg-white rounded px-2 py-1 text-slate-700 font-mono focus:outline-none transition-all text-right"
                        />
                      </td>

                      {/* INTERES BRUTO */}
                      <td className="p-2 min-w-[120px]">
                        <input
                          type="number"
                          step="any"
                          value={row.interesBruto === 0 ? '' : row.interesBruto}
                          placeholder="0.00"
                          readOnly={row.venta !== 0 && row.compra !== 0}
                          onChange={(e) =>
                            handleUpdateField(index, 'interesBruto', parseInputValue(e.target.value))
                          }
                          className={`w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-amber-500 focus:bg-white rounded px-2 py-1 font-mono focus:outline-none transition-all text-right ${
                            row.venta !== 0 && row.compra !== 0
                              ? 'bg-slate-50/70 text-slate-500 cursor-not-allowed font-semibold'
                              : 'text-slate-800 font-bold'
                          }`}
                        />
                      </td>

                      {/* IMPUESTOS (19% Auto) */}
                      <td className="p-2 text-right font-mono text-slate-500 font-medium select-none">
                        {row.impuestos.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* IMPUESTOS ESPAÑA */}
                      <td className="p-2 min-w-[110px]">
                        <input
                          type="number"
                          step="any"
                          value={row.impuestosEspana === 0 ? '' : row.impuestosEspana}
                          placeholder="0.00"
                          onChange={(e) =>
                            handleUpdateField(index, 'impuestosEspana', parseInputValue(e.target.value))
                          }
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-amber-500 focus:bg-white rounded px-2 py-1 text-slate-700 font-mono focus:outline-none transition-all text-right"
                        />
                      </td>

                      {/* IMPUESTOS EXTRANJERO */}
                      <td className="p-2 min-w-[110px]">
                        <input
                          type="number"
                          step="any"
                          value={row.impuestosExtranjero === 0 ? '' : row.impuestosExtranjero}
                          placeholder="0.00"
                          onChange={(e) =>
                            handleUpdateField(index, 'impuestosExtranjero', parseInputValue(e.target.value))
                          }
                          className="w-full bg-transparent border border-transparent hover:border-slate-200 focus:border-amber-500 focus:bg-white rounded px-2 py-1 text-slate-700 font-mono focus:outline-none transition-all text-right"
                        />
                      </td>

                      {/* COMISIONES (+ CHECK DEDUCIBLE) */}
                      <td className="p-2 min-w-[170px]">
                        <div className="flex items-center gap-2 bg-slate-50 hover:bg-white border border-slate-100 rounded px-1.5 py-0.5 transition-all">
                          <input
                            type="number"
                            step="any"
                            value={row.comisiones === 0 ? '' : row.comisiones}
                            placeholder="0.00"
                            onChange={(e) =>
                              handleUpdateField(index, 'comisiones', parseInputValue(e.target.value))
                            }
                            className="w-20 bg-transparent border-none text-slate-700 font-mono focus:outline-none text-right"
                          />
                          <div className="h-4 w-[1px] bg-slate-200"></div>
                          <label className="flex items-center gap-1 text-[10px] text-slate-500 select-none font-sans font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={row.comisionDeducible}
                              onChange={(e) =>
                                handleUpdateField(index, 'comisionDeducible', e.target.checked)
                              }
                              className="rounded text-amber-500 focus:ring-amber-500 cursor-pointer w-3.5 h-3.5"
                            />
                            Ded.
                          </label>
                        </div>
                      </td>

                      {/* TOTAL */}
                      <td className="p-2 text-right font-mono font-bold text-slate-800">
                        {row.total.toLocaleString('es-ES', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* DELETE ACTION */}
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(row.id)}
                          className="text-slate-400 hover:text-red-500 focus:outline-none p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                          title="Eliminar fila"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

              {/* FOOTER 1: TOTALES POR COLUMNA */}
              {computedRows.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800 font-mono">
                    <td className="py-3 pl-[17px] pr-2 text-left font-sans text-[10px] text-slate-500 uppercase tracking-wider">
                      Totales
                    </td>
                    <td className="py-3 pl-2 pr-[17px] text-right">
                      {totalVenta.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 pl-2 pr-[17px] text-right">
                      {totalCompra.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 pl-2 pr-[17px] text-right text-amber-700">
                      {totalInteresBruto.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 pl-2 pr-2 text-right text-slate-600">
                      {totalImpuestos.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 pl-2 pr-[17px] text-right text-slate-600">
                      {totalImpuestosEspana.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 pl-2 pr-[17px] text-right text-slate-600">
                      {totalImpuestosExtranjero.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-2 py-3">
                      <div className="ml-[7px] w-20 text-right text-slate-600">
                        {totalComisiones.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </td>
                    <td className="py-3 pl-2 pr-2 text-right text-slate-900 bg-amber-500/5">
                      {totalGeneral.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>

          {/* FOOTER 2: RESUMEN ADICIONAL */}
          {computedRows.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50/50 border border-slate-200/80 rounded-xl p-4 shadow-3xs">
              {/* Total Gastos Deducibles */}
              <div className="flex justify-between items-center bg-white border border-slate-150 rounded-lg p-3 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Total Gastos Deducibles (Intereses - Comisiones Ded.)
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Fórmula: Σ(Interés Bruto) - Σ(Comisiones Deducibles)
                  </span>
                </div>
                <span className="font-mono font-bold text-slate-800 text-sm bg-slate-50 border border-slate-100 px-3 py-1.5 rounded shadow-3xs">
                  {totalGastosDeducibles.toLocaleString('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </span>
              </div>

              {/* Impuestos Resumen */}
              <div className="flex justify-between items-center bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 shadow-2xs">
                <div className="space-y-0.5">
                  <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                    Impuestos Resumen Ahorro
                  </span>
                  <span className="text-xs text-amber-600/80 font-medium">
                    Fórmula: (Gastos Deducibles × 19%) - Imp. Extranjero
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-mono font-extrabold text-amber-700 text-sm bg-white border border-amber-200 px-3 py-1.5 rounded shadow-3xs flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    {impuestosResumen.toLocaleString('es-ES', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
