import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings, BarChart3, Plus, Trash2, Edit2, TrendingUp, Sparkles } from 'lucide-react';
import { YearState, SocialSecurityConfigRow, TaxBracket, TaxExemptions, InvestmentRow } from '../types';
import { ComputedYearResult } from '../utils/calculations';
import { AnnualResultsChart } from './AnnualResultsChart';
import { SavingsBaseSection } from './SavingsBaseSection';

interface AnnualSummaryViewProps {
  yearState: YearState;
  computedYear: ComputedYearResult;
  onUpdateSocialSecurityRow: (rowId: string, field: 'pctEmpleado' | 'pctEmpresa', val: number) => void;
  onUpdateStateBracket: (idx: number, field: 'fin' | 'pct', val: number | null) => void;
  onUpdateRegionalBracket: (idx: number, field: 'fin' | 'pct', val: number | null) => void;
  onUpdateStateBracketInicio: (val: number) => void;
  onUpdateRegionalBracketInicio: (val: number) => void;
  onUpdateOtrosBeneficios: (val: number) => void;
  onUpdateRendimientoTrabajo: (val: number) => void;
  onUpdateExemptions: (field: keyof Omit<TaxExemptions, 'dynamicExemptions'>, val: number) => void;
  onAddDynamicExemption: () => void;
  onDeleteDynamicExemption: (id: string) => void;
  onUpdateDynamicExemption: (id: string, field: 'name' | 'estatal' | 'autonomico', val: string | number) => void;
  onTriggerEditCell: (params: {
    type: 'ss_config' | 'bracket_state' | 'bracket_regional' | 'otros_beneficios' | 'rendimiento_trabajo' | 'exemption' | 'exemption_dynamic';
    rowId: string;
    field: string;
    label: string;
    val: string | number;
    isText?: boolean;
    bracketIdx?: number;
  }) => void;
  onUpdateInversiones: (inversiones: InvestmentRow[]) => void;
}

export const AnnualSummaryView: React.FC<AnnualSummaryViewProps> = ({
  yearState,
  computedYear,
  onAddDynamicExemption,
  onDeleteDynamicExemption,
  onTriggerEditCell,
  onUpdateInversiones,
}) => {
  const [configExpanded, setConfigExpanded] = useState<boolean>(false);
  const [rentaExpanded, setRentaExpanded] = useState<boolean>(true);

  const { socialSecurityConfig, irpfStateBrackets, irpfRegionalBrackets, taxExemptions } = yearState;
  const { annualSummary } = computedYear;

  // Calculate bracket tax contributions for representation
  const stateBracketTaxes = irpfStateBrackets.map((b) => {
    const base = annualSummary.baseCotizacion.baseIrpfPagado;
    const inicio = b.inicio;
    const fin = b.fin;
    const pct = b.pct;
    if (base <= inicio) return 0;
    const taxableInBracket = fin === null ? base - inicio : Math.min(base, fin) - inicio;
    return parseFloat(((taxableInBracket * pct) / 100).toFixed(2));
  });

  const regionalBracketTaxes = irpfRegionalBrackets.map((b) => {
    const base = annualSummary.baseCotizacion.baseIrpfPagado;
    const inicio = b.inicio;
    const fin = b.fin;
    const pct = b.pct;
    if (base <= inicio) return 0;
    const taxableInBracket = fin === null ? base - inicio : Math.min(base, fin) - inicio;
    return parseFloat(((taxableInBracket * pct) / 100).toFixed(2));
  });

  const totalSSPctEmpleado = socialSecurityConfig.reduce((acc, curr) => acc + curr.pctEmpleado, 0);
  const totalSSPctEmpresa = socialSecurityConfig.reduce((acc, curr) => acc + curr.pctEmpresa, 0);

  return (
    <div className="space-y-6" id="annual-summary-view-wrapper">
      
      {/* 1. COLLAPSIBLE: CONFIGURACIÓN RENTA */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => setConfigExpanded(!configExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 bg-slate-900 text-white select-none focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-blue-400" />
            <span className="font-sans font-bold text-sm uppercase tracking-wider">
              CONFIGURACIÓN RENTA (Porcentajes e Impuestos)
            </span>
          </div>
          {configExpanded ? (
            <ChevronUp className="w-5 h-5 text-blue-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {configExpanded && (
          <div className="p-5 bg-white border-t border-slate-100 space-y-6 animate-slide-down">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              
              {/* Card A: Seguridad Social Config */}
              <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Porcentajes de Cotización a la Seguridad Social (España)
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="p-2.5">Concepto</th>
                        <th className="p-2.5 text-right">% Empleado</th>
                        <th className="p-2.5 text-right">% Empresa</th>
                      </tr>
                    </thead>
                    <tbody>
                      {socialSecurityConfig.map((row) => (
                        <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="p-2.5 font-sans font-medium text-slate-700">{row.name}</td>
                          <td className="p-2.5 text-right font-mono text-slate-700">
                            <button
                              type="button"
                              onClick={() => onTriggerEditCell({
                                type: 'ss_config',
                                rowId: row.id,
                                field: 'pctEmpleado',
                                label: `Seg. Social Empleado (${row.name})`,
                                val: row.pctEmpleado
                              })}
                              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                            >
                              <span>{row.pctEmpleado.toFixed(2)}%</span>
                              <Edit2 className="w-3 h-3 text-slate-400" />
                            </button>
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-700">
                            <button
                              type="button"
                              onClick={() => onTriggerEditCell({
                                type: 'ss_config',
                                rowId: row.id,
                                field: 'pctEmpresa',
                                label: `Seg. Social Empresa (${row.name})`,
                                val: row.pctEmpresa
                              })}
                              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                            >
                              <span>{row.pctEmpresa.toFixed(2)}%</span>
                              <Edit2 className="w-3 h-3 text-slate-400" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                        <td className="p-2.5">TOTAL</td>
                        <td className="p-2.5 text-right font-mono">{totalSSPctEmpleado.toFixed(2)}%</td>
                        <td className="p-2.5 text-right font-mono">{totalSSPctEmpresa.toFixed(2)}%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Card B: IRPF ESTATAL Config */}
              <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Tramos e Impuestos - IRPF ESTATAL (Gobierno Central)
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="p-2.5">Inicio (€)</th>
                        <th className="p-2.5">Fin (€)</th>
                        <th className="p-2.5 text-right">%</th>
                        <th className="p-2.5 text-right">Impuestos Calculados (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {irpfStateBrackets.map((b, idx) => {
                        const isLast = idx === irpfStateBrackets.length - 1;
                        const isFirst = idx === 0;

                        return (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="p-2.5 font-mono text-slate-600">
                              {isFirst ? (
                                <button
                                  type="button"
                                  onClick={() => onTriggerEditCell({
                                    type: 'bracket_state',
                                    rowId: 'bracket_' + idx,
                                    field: 'inicio',
                                    label: 'Inicio del primer tramo',
                                    val: b.inicio,
                                    bracketIdx: idx
                                  })}
                                  className="inline-flex items-center gap-1 font-semibold text-blue-600 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                                >
                                  <span>{b.inicio.toLocaleString('es-ES')}</span>
                                  <Edit2 className="w-3 h-3 text-slate-400" />
                                </button>
                              ) : (
                                <span>{b.inicio.toLocaleString('es-ES')}</span>
                              )}
                            </td>
                            <td className="p-2.5 font-mono text-slate-700">
                              {!isLast ? (
                                <button
                                  type="button"
                                  onClick={() => onTriggerEditCell({
                                    type: 'bracket_state',
                                    rowId: 'bracket_' + idx,
                                    field: 'fin',
                                    label: `Fin del tramo ${idx + 1}`,
                                    val: b.fin ?? 0,
                                    bracketIdx: idx
                                  })}
                                  className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                                >
                                  <span>{(b.fin ?? 0).toLocaleString('es-ES')}</span>
                                  <Edit2 className="w-3 h-3 text-slate-400" />
                                </button>
                              ) : (
                                <span className="text-slate-400 italic">Sin límite</span>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-700">
                              <button
                                type="button"
                                onClick={() => onTriggerEditCell({
                                  type: 'bracket_state',
                                  rowId: 'bracket_' + idx,
                                  field: 'pct',
                                  label: `Porcentaje tramo estatal ${idx + 1}`,
                                  val: b.pct,
                                  bracketIdx: idx
                                })}
                                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                              >
                                <span>{b.pct.toFixed(2)}%</span>
                                <Edit2 className="w-3 h-3 text-slate-400" />
                              </button>
                            </td>
                            <td className="p-2.5 text-right font-mono font-semibold text-slate-800">
                              {stateBracketTaxes[idx].toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                        <td className="p-2.5" colSpan={3}>TOTAL IMPUESTO ESTATAL</td>
                        <td className="p-2.5 text-right font-mono">
                          {stateBracketTaxes.reduce((a, b) => a + b, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Card C: IRPF AUTONOMICO Config */}
              <div className="border border-slate-200/80 rounded-xl p-4 bg-slate-50/50 space-y-3 xl:col-span-2">
                <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Tramos e Impuestos - IRPF AUTONÓMICO
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="p-2.5">Inicio (€)</th>
                        <th className="p-2.5">Fin (€)</th>
                        <th className="p-2.5 text-right">%</th>
                        <th className="p-2.5 text-right">Impuestos Calculados (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {irpfRegionalBrackets.map((b, idx) => {
                        const isLast = idx === irpfRegionalBrackets.length - 1;
                        const isFirst = idx === 0;

                        return (
                          <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                            <td className="p-2.5 font-mono text-slate-600">
                              {isFirst ? (
                                <button
                                  type="button"
                                  onClick={() => onTriggerEditCell({
                                    type: 'bracket_regional',
                                    rowId: 'bracket_' + idx,
                                    field: 'inicio',
                                    label: 'Inicio del primer tramo regional',
                                    val: b.inicio,
                                    bracketIdx: idx
                                  })}
                                  className="inline-flex items-center gap-1 font-semibold text-blue-600 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                                >
                                  <span>{b.inicio.toLocaleString('es-ES')}</span>
                                  <Edit2 className="w-3 h-3 text-slate-400" />
                                </button>
                              ) : (
                                <span>{b.inicio.toLocaleString('es-ES')}</span>
                              )}
                            </td>
                            <td className="p-2.5 font-mono text-slate-700">
                              {!isLast ? (
                                <button
                                  type="button"
                                  onClick={() => onTriggerEditCell({
                                    type: 'bracket_regional',
                                    rowId: 'bracket_' + idx,
                                    field: 'fin',
                                    label: `Fin del tramo regional ${idx + 1}`,
                                    val: b.fin ?? 0,
                                    bracketIdx: idx
                                  })}
                                  className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                                >
                                  <span>{(b.fin ?? 0).toLocaleString('es-ES')}</span>
                                  <Edit2 className="w-3 h-3 text-slate-400" />
                                </button>
                              ) : (
                                <span className="text-slate-400 italic">Sin límite</span>
                              )}
                            </td>
                            <td className="p-2.5 text-right font-mono text-slate-700">
                              <button
                                type="button"
                                onClick={() => onTriggerEditCell({
                                  type: 'bracket_regional',
                                  rowId: 'bracket_' + idx,
                                  field: 'pct',
                                  label: `Porcentaje tramo regional ${idx + 1}`,
                                  val: b.pct,
                                  bracketIdx: idx
                                })}
                                className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                              >
                                <span>{b.pct.toFixed(2)}%</span>
                                <Edit2 className="w-3 h-3 text-slate-400" />
                              </button>
                            </td>
                            <td className="p-2.5 text-right font-mono font-semibold text-slate-800">
                              {regionalBracketTaxes[idx].toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                        <td className="p-2.5" colSpan={3}>TOTAL IMPUESTO AUTONÓMICO</td>
                        <td className="p-2.5 text-right font-mono">
                          {regionalBracketTaxes.reduce((a, b) => a + b, 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* BASE DEL AHORRO E INVERSIONES */}
      <SavingsBaseSection
        inversiones={yearState.inversiones || []}
        onUpdateInversiones={onUpdateInversiones}
      />

      {/* 2. COLLAPSIBLE: RENTA */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <button
          onClick={() => setRentaExpanded(!rentaExpanded)}
          className="w-full flex items-center justify-between px-5 py-4 bg-slate-900 text-white select-none focus:outline-none cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <span className="font-sans font-bold text-sm uppercase tracking-wider">
              DECLARACIÓN ANUAL DE LA RENTA (Consolidados y Borrador)
            </span>
          </div>
          {rentaExpanded ? (
            <ChevronUp className="w-5 h-5 text-blue-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </button>

        {rentaExpanded && (
          <div className="p-5 bg-white border-t border-slate-100 space-y-6 animate-slide-down">
            
            {/* Top Grid of Renta View: Income Summary, Exemptions, Contribution Base */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Card 1: Resumen de Nóminas */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-4 shadow-2xs" id="card-resumen-nominas-anual">
                <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                  1. Resumen de Ingresos Anuales
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-medium text-slate-500">Salario Bruto (Acumulado)</span>
                    <span className="font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-100 shadow-2xs">
                      {annualSummary.salarioBruto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="font-medium text-slate-500">Otros Beneficios (Rendimientos, etc.)</span>
                    <button
                      type="button"
                      onClick={() => onTriggerEditCell({
                        type: 'otros_beneficios',
                        rowId: 'otros',
                        field: 'otrosBeneficios',
                        label: 'Otros Beneficios Anuales',
                        val: yearState.otrosBeneficios
                      })}
                      className="font-mono font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none bg-white px-2 py-1 rounded border border-slate-100 shadow-2xs"
                    >
                      <span>{yearState.otrosBeneficios.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                      <Edit2 className="w-3 h-3 text-slate-400" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 p-2 bg-blue-50/50 rounded-lg ring-1 ring-blue-500/10 font-bold">
                    <span className="text-blue-800">TOTAL INGRESOS BRUTOS</span>
                    <span className="font-mono text-blue-600 text-sm">
                      {annualSummary.totalIngresos.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Exenciones de Impuestos */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 shadow-2xs" id="card-exenciones-anual">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider">
                    2. Exenciones y Mínimos Desgravables
                  </h4>
                  <button
                    onClick={onAddDynamicExemption}
                    className="flex items-center gap-0.5 text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-1.5 py-0.5 rounded transition-colors cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" /> Nueva desgravación
                  </button>
                </div>
                
                <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                        <th className="p-2.5">Concepto</th>
                        <th className="p-2.5 text-right">Estatal (€)</th>
                        <th className="p-2.5 text-right">Autonómico (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* System Row 1: Mínimo Personal */}
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-2.5 font-semibold text-slate-600">Mínimo Personal</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          <button
                            type="button"
                            onClick={() => onTriggerEditCell({ type: 'exemption', rowId: 'minimoPersonalEstatal', field: 'minimoPersonalEstatal', label: 'Mínimo Estatal', val: taxExemptions.minimoPersonalEstatal })}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                          >
                            <span>{taxExemptions.minimoPersonalEstatal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <Edit2 className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          <button
                            type="button"
                            onClick={() => onTriggerEditCell({ type: 'exemption', rowId: 'minimoPersonalAutonomico', field: 'minimoPersonalAutonomico', label: 'Mínimo Autonómico', val: taxExemptions.minimoPersonalAutonomico })}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                          >
                            <span>{taxExemptions.minimoPersonalAutonomico.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <Edit2 className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>
                      </tr>

                      {/* System Row 2: Descendientes */}
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-2.5 font-semibold text-slate-600">Descendientes</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          <button
                            type="button"
                            onClick={() => onTriggerEditCell({ type: 'exemption', rowId: 'descendientesEstatal', field: 'descendientesEstatal', label: 'Descendientes Estatal', val: taxExemptions.descendientesEstatal })}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                          >
                            <span>{taxExemptions.descendientesEstatal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <Edit2 className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          <button
                            type="button"
                            onClick={() => onTriggerEditCell({ type: 'exemption', rowId: 'descendientesAutonomico', field: 'descendientesAutonomico', label: 'Descendientes Autonómico', val: taxExemptions.descendientesAutonomico })}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                          >
                            <span>{taxExemptions.descendientesAutonomico.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <Edit2 className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>
                      </tr>

                      {/* System Row 3: Ascendientes */}
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-2.5 font-semibold text-slate-600">Ascendientes</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          <button
                            type="button"
                            onClick={() => onTriggerEditCell({ type: 'exemption', rowId: 'ascendientesEstatal', field: 'ascendientesEstatal', label: 'Ascendientes Estatal', val: taxExemptions.ascendientesEstatal })}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                          >
                            <span>{taxExemptions.ascendientesEstatal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <Edit2 className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          <button
                            type="button"
                            onClick={() => onTriggerEditCell({ type: 'exemption', rowId: 'ascendientesAutonomico', field: 'ascendientesAutonomico', label: 'Ascendientes Autonómico', val: taxExemptions.ascendientesAutonomico })}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                          >
                            <span>{taxExemptions.ascendientesAutonomico.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <Edit2 className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>
                      </tr>

                      {/* System Row 4: Minusvalías */}
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-2.5 font-semibold text-slate-600">Minusvalías</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          <button
                            type="button"
                            onClick={() => onTriggerEditCell({ type: 'exemption', rowId: 'minusvaliasEstatal', field: 'minusvaliasEstatal', label: 'Minusvalías Estatal', val: taxExemptions.minusvaliasEstatal })}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                          >
                            <span>{taxExemptions.minusvaliasEstatal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <Edit2 className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>
                        <td className="p-2.5 text-right font-mono text-slate-700">
                          <button
                            type="button"
                            onClick={() => onTriggerEditCell({ type: 'exemption', rowId: 'minusvaliasAutonomico', field: 'minusvaliasAutonomico', label: 'Minusvalías Autonómico', val: taxExemptions.minusvaliasAutonomico })}
                            className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                          >
                            <span>{taxExemptions.minusvaliasAutonomico.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            <Edit2 className="w-3 h-3 text-slate-400" />
                          </button>
                        </td>
                      </tr>

                      {/* Dynamic user added exemptions */}
                      {taxExemptions.dynamicExemptions.map((dyn) => (
                        <tr key={dyn.id} className="border-b border-slate-100 hover:bg-slate-50/50 group">
                          <td className="p-2.5 text-slate-600 font-medium">
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onTriggerEditCell({ type: 'exemption_dynamic', rowId: dyn.id, field: 'name', label: 'Nombre desgravación', val: dyn.name, isText: true })}
                                className="font-semibold text-slate-600 flex items-center gap-1 text-left focus:outline-none hover:text-blue-600"
                              >
                                <span className="underline decoration-dotted decoration-slate-400 leading-tight">{dyn.name}</span>
                                <Edit2 className="w-2.5 h-2.5 text-slate-400 opacity-0 group-hover:opacity-100" />
                              </button>
                              <button
                                type="button"
                                onClick={() => onDeleteDynamicExemption(dyn.id)}
                                className="text-slate-400 hover:text-red-500 focus:outline-none opacity-0 group-hover:opacity-100 cursor-pointer"
                                title="Eliminar"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-700">
                            <button
                              type="button"
                              onClick={() => onTriggerEditCell({ type: 'exemption_dynamic', rowId: dyn.id, field: 'estatal', label: `Estatal (${dyn.name})`, val: dyn.estatal })}
                              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                            >
                              <span>{dyn.estatal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              <Edit2 className="w-3 h-3 text-slate-400" />
                            </button>
                          </td>
                          <td className="p-2.5 text-right font-mono text-slate-700">
                            <button
                              type="button"
                              onClick={() => onTriggerEditCell({ type: 'exemption_dynamic', rowId: dyn.id, field: 'autonomico', label: `Autonómico (${dyn.name})`, val: dyn.autonomico })}
                              className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 border-b border-dashed border-blue-500/30 cursor-pointer focus:outline-none"
                            >
                              <span>{dyn.autonomico.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                              <Edit2 className="w-3 h-3 text-slate-400" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-slate-50 font-bold border-t border-slate-200 text-slate-800">
                        <td className="p-2.5">TOTAL EXENTOS</td>
                        <td className="p-2.5 text-right font-mono">
                          {annualSummary.exenciones.totalEstatal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          {annualSummary.exenciones.totalAutonomico.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </td>
                      </tr>
                      <tr className="bg-blue-50/50 font-bold border-t border-slate-200 text-blue-800">
                        <td className="p-2.5">IMPUESTOS EXENTOS (Ahorro)</td>
                        <td className="p-2.5 text-right font-mono">
                          {annualSummary.exenciones.impuestosEstatal.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </td>
                        <td className="p-2.5 text-right font-mono">
                          {annualSummary.exenciones.impuestosAutonomico.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Card 3: Base de Cotización */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2.5 shadow-2xs" id="card-base-cotizacion-anual">
                <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                  3. Cálculo de la Base Imponible IRPF
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold font-sans">
                        <th className="p-1.5">Concepto</th>
                        <th className="p-1.5 text-right">Teórico Anual (€)</th>
                        <th className="p-1.5 text-right">Pagado Real (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100">
                        <td className="p-1.5 text-slate-600 font-sans font-semibold">Rendimiento Trabajo</td>
                        <td className="p-1.5 text-right font-mono text-slate-700">
                          <button
                            type="button"
                            onClick={() => onTriggerEditCell({
                              type: 'rendimiento_trabajo',
                              rowId: 'rend',
                              field: 'rendimientoTrabajo',
                              label: 'Rendimiento Trabajo',
                              val: yearState.rendimientoTrabajo
                            })}
                            className="inline-flex items-center gap-0.5 font-bold text-blue-600 hover:text-blue-700 cursor-pointer focus:outline-none"
                          >
                            <span>{yearState.rendimientoTrabajo}</span>
                            <Edit2 className="w-2.5 h-2.5 text-slate-400" />
                          </button>
                        </td>
                        <td className="p-1.5 text-right font-mono text-slate-500">{yearState.rendimientoTrabajo.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-slate-100">
                        <td className="p-1.5 text-slate-600 font-sans font-medium">Deducción SS Empl.</td>
                        <td className="p-1.5 text-right font-mono text-slate-500">{annualSummary.baseCotizacion.ssEmpleadoTotal.toFixed(2)}</td>
                        <td className="p-1.5 text-right font-mono text-slate-800 font-bold">{annualSummary.baseCotizacion.ssEmpleadoPagado.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-slate-100 text-slate-400 font-medium">
                        <td className="p-1.5 font-sans">Cotización SS Empresa</td>
                        <td className="p-1.5 text-right font-mono">{annualSummary.baseCotizacion.ssEmpresaTotal.toFixed(2)}</td>
                        <td className="p-1.5 text-right font-mono">{annualSummary.baseCotizacion.ssEmpresaPagado.toFixed(2)}</td>
                      </tr>
                      <tr className="border-b border-slate-200 font-bold text-slate-800 bg-slate-50/50">
                        <td className="p-1.5 font-sans">TOTAL GASTOS (SS+Rend.)</td>
                        <td className="p-1.5 text-right font-mono">{annualSummary.baseCotizacion.totalBaseColTotal.toFixed(2)}</td>
                        <td className="p-1.5 text-right font-mono">{annualSummary.baseCotizacion.totalBaseColPagado.toFixed(2)}</td>
                      </tr>
                      <tr className="font-extrabold text-blue-600 bg-blue-50/40">
                        <td className="p-1.5 font-sans uppercase">BASE IMPONIBLE IRPF</td>
                        <td className="p-1.5 text-right font-mono text-xs">{annualSummary.baseCotizacion.baseIrpfTotal.toFixed(2)}</td>
                        <td className="p-1.5 text-right font-mono text-xs">{annualSummary.baseCotizacion.baseIrpfPagado.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Bottom Grid of Renta View: IRPF Necesario table, Borrador Renta, and annual chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
              
              {/* Card 4: IRPF Necesario */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 shadow-2xs" id="card-irpf-necesario-anual">
                <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                  4. Detalle de Retención IRPF Cuotas Líquidas Necesarias
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold font-sans">
                        <th className="p-2.5">Concepto</th>
                        <th className="p-2.5 text-right">Estatal €</th>
                        <th className="p-2.5 text-right">Estatal %</th>
                        <th className="p-2.5 text-right">Autonómico €</th>
                        <th className="p-2.5 text-right">Autonómico %</th>
                        <th className="p-2.5 text-right">Total €</th>
                        <th className="p-2.5 text-right">Total %</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-2.5 text-slate-600 font-medium">Retención IRPF</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">{annualSummary.irpfNecesario.estatalEuro.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">{annualSummary.irpfNecesario.estatalPct.toFixed(1)}%</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">{annualSummary.irpfNecesario.autonomicoEuro.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">{annualSummary.irpfNecesario.autonomicoPct.toFixed(1)}%</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-800">{annualSummary.irpfNecesario.totalEuro.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono font-bold text-slate-800">{annualSummary.irpfNecesario.totalPct.toFixed(1)}%</td>
                      </tr>
                      <tr className="border-b border-slate-100 text-slate-400 hover:bg-slate-50/50">
                        <td className="p-2.5">Retención Capital</td>
                        <td className="p-2.5 text-right font-mono">0.00</td>
                        <td className="p-2.5 text-right font-mono">0.0%</td>
                        <td className="p-2.5 text-right font-mono">0.00</td>
                        <td className="p-2.5 text-right font-mono">0.0%</td>
                        <td className="p-2.5 text-right font-mono">0.00</td>
                        <td className="p-2.5 text-right font-mono">0.0%</td>
                      </tr>
                      <tr className="font-bold text-slate-800 bg-slate-50/50">
                        <td className="p-2.5 font-sans uppercase">CUOTAS LIQUIDAS</td>
                        <td className="p-2.5 text-right font-mono">{annualSummary.irpfNecesario.estatalEuro.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono">{annualSummary.irpfNecesario.estatalPct.toFixed(1)}%</td>
                        <td className="p-2.5 text-right font-mono">{annualSummary.irpfNecesario.autonomicoEuro.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono">{annualSummary.irpfNecesario.autonomicoPct.toFixed(1)}%</td>
                        <td className="p-2.5 text-right font-mono text-slate-900 font-extrabold">{annualSummary.irpfNecesario.totalEuro.toFixed(2)}</td>
                        <td className="p-2.5 text-right font-mono text-slate-900 font-extrabold">{annualSummary.irpfNecesario.totalPct.toFixed(1)}%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Compare needed tax with already retained taxes in months */}
                <div className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-4">
                  <div>
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      Retenciones ya pagadas en nóminas mensuales:
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-700">
                      {annualSummary.borradorRenta.retencionIrpf.pagadoEuro.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                      Diferencia (Resultado de Declaración):
                    </span>
                    <div className="flex items-center gap-1 justify-end mt-0.5">
                      <TrendingUp className={`w-4 h-4 ${annualSummary.irpfNecesario.difference > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
                      <span className={`text-sm font-extrabold font-mono ${
                        annualSummary.irpfNecesario.difference > 0 ? 'text-rose-500' : 'text-emerald-500'
                      }`}>
                        {annualSummary.irpfNecesario.difference > 0 ? '+' : ''}
                        {annualSummary.irpfNecesario.difference.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                    <span className={`text-[10px] font-bold ${
                      annualSummary.irpfNecesario.difference > 0 ? 'text-rose-500/80' : 'text-emerald-600'
                    }`}>
                      {annualSummary.irpfNecesario.difference > 0 ? 'A PAGAR A HACIENDA' : 'A DEVOLVER POR HACIENDA'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 5: BORRADOR RENTA (Detailed outcome table) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 shadow-2xs" id="card-borrador-renta-anual">
                <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  5. BORRADOR RENTA Y CONCILIACIÓN FINAL
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold font-sans">
                        <th className="p-2.5">Concepto</th>
                        <th className="p-2.5 text-right">PAGADO (€)</th>
                        <th className="p-2.5 text-right">PAGADO (%)</th>
                        <th className="p-2.5 text-right">SALDO BORRADOR (€)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Row 1: Retención IRPF */}
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-2.5 text-slate-600 font-medium">Retención IRPF</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">{annualSummary.borradorRenta.retencionIrpf.pagadoEuro.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">{annualSummary.borradorRenta.retencionIrpf.pagadoPct.toFixed(1)}%</td>
                        <td className={`p-2.5 text-right font-mono font-bold ${annualSummary.borradorRenta.retencionIrpf.borradorEuro > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {annualSummary.borradorRenta.retencionIrpf.borradorEuro > 0 ? '+' : ''}
                          {annualSummary.borradorRenta.retencionIrpf.borradorEuro.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      {/* Row 2: Retención Capital */}
                      <tr className="border-b border-slate-100 text-slate-400 hover:bg-slate-50/50">
                        <td className="p-2.5">Retención Capital</td>
                        <td className="p-2.5 text-right font-mono">0.00</td>
                        <td className="p-2.5 text-right font-mono">0.0%</td>
                        <td className="p-2.5 text-right font-mono text-slate-400">0.00</td>
                      </tr>
                      {/* Row 3: CUOTAS LIQUIDAS */}
                      <tr className="border-b border-slate-200 font-semibold text-slate-800 bg-slate-50/20 hover:bg-slate-50/50">
                        <td className="p-2.5 uppercase font-sans">CUOTAS LIQUIDAS</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">{annualSummary.borradorRenta.cuotasLiquidas.pagadoEuro.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">{annualSummary.borradorRenta.cuotasLiquidas.pagadoPct.toFixed(1)}%</td>
                        <td className={`p-2.5 text-right font-mono font-bold ${annualSummary.borradorRenta.cuotasLiquidas.borradorEuro > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {annualSummary.borradorRenta.cuotasLiquidas.borradorEuro > 0 ? '+' : ''}
                          {annualSummary.borradorRenta.cuotasLiquidas.borradorEuro.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      {/* Row 4: SS Empleado */}
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-2.5 text-slate-600 font-medium">SS Empleado</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">{annualSummary.borradorRenta.ssEmpleado.pagadoEuro.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">{annualSummary.borradorRenta.ssEmpleado.pagadoPct.toFixed(1)}%</td>
                        <td className={`p-2.5 text-right font-mono font-bold ${annualSummary.borradorRenta.ssEmpleado.borradorEuro > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {annualSummary.borradorRenta.ssEmpleado.borradorEuro > 0 ? '+' : ''}
                          {annualSummary.borradorRenta.ssEmpleado.borradorEuro.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      {/* Row 5: SS Empresa */}
                      <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="p-2.5 text-slate-600 font-medium">SS Empresa</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">{annualSummary.borradorRenta.ssEmpresa.pagadoEuro.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-mono text-slate-700">{annualSummary.borradorRenta.ssEmpresa.pagadoPct.toFixed(1)}%</td>
                        <td className={`p-2.5 text-right font-mono font-bold ${annualSummary.borradorRenta.ssEmpresa.borradorEuro > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {annualSummary.borradorRenta.ssEmpresa.borradorEuro > 0 ? '+' : ''}
                          {annualSummary.borradorRenta.ssEmpresa.borradorEuro.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                      {/* Row 6: TOTAL */}
                      <tr className="font-extrabold text-slate-900 bg-slate-100 font-sans">
                        <td className="p-2.5 uppercase">TOTAL ACUMULADO</td>
                        <td className="p-2.5 text-right font-mono">{annualSummary.borradorRenta.total.pagadoEuro.toLocaleString('es-ES', { minimumFractionDigits: 2 })}</td>
                        <td className="p-2.5 text-right font-mono">{annualSummary.borradorRenta.total.pagadoPct.toFixed(1)}%</td>
                        <td className={`p-2.5 text-right font-mono font-extrabold ${annualSummary.borradorRenta.total.borradorEuro > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {annualSummary.borradorRenta.total.borradorEuro > 0 ? '+' : ''}
                          {annualSummary.borradorRenta.total.borradorEuro.toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Card 6: Resultados Gráfico (Pie Chart of results) */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 lg:col-span-2 shadow-2xs" id="card-resultados-grafico-anual">
                <h4 className="font-sans font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                  Distribución Gráfica del Gasto Anual Pagado (IRPF + SS + Neto Recibido)
                </h4>
                <AnnualResultsChart
                  salarioBruto={annualSummary.salarioBruto}
                  retencionIrpfPagado={annualSummary.borradorRenta.retencionIrpf.pagadoEuro}
                  ssEmpleadoPagado={annualSummary.borradorRenta.ssEmpleado.pagadoEuro}
                  ssEmpresaPagado={annualSummary.borradorRenta.ssEmpresa.pagadoEuro}
                  totalPagado={annualSummary.borradorRenta.total.pagadoEuro}
                  retencionCapitalPagado={annualSummary.borradorRenta.retencionCapital.pagadoEuro}
                />
              </div>

            </div>

          </div>
        )}
      </div>

    </div>
  );
};
