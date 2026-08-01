import React, { useState } from 'react';
import {
  Landmark,
  Plus,
  Trash2,
  TrendingUp,
  Percent,
  Clock,
  ShieldAlert,
  Wallet,
  HelpCircle,
  Sparkles,
  Info,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import {
  PatrimonioState,
  PatrimonioItem,
  PatrimonioTipo,
  PatrimonioTipoCuenta,
  PatrimonioTipoActivo,
  YearState
} from '../types';
import { computeYear } from '../utils/calculations';

interface PatrimonioViewProps {
  patrimonioState: PatrimonioState;
  onUpdatePatrimonio: (newState: PatrimonioState) => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  yearStates?: Record<number, YearState>;
}

const TIPO_OPTIONS: PatrimonioTipo[] = ['Activos', 'Pasivos'];
const TIPO_CUENTA_OPTIONS: PatrimonioTipoCuenta[] = ['CUENTAS ES', 'CRIPTO', 'VALORES EXT', 'CUENTAS EXT'];
const TIPO_ACTIVO_OPTIONS: PatrimonioTipoActivo[] = ['Liquidez Rapida', 'Liquidez Lenta', 'Bienes', 'Deuda'];

export const DEFAULT_PATRIMONIO_ITEMS: PatrimonioItem[] = [
  {
    id: 'pat-1',
    cuenta: 'Cuenta Corriente BBVA',
    tipo: 'Activos',
    tipoCuenta: 'CUENTAS ES',
    tipoActivo: 'Liquidez Rapida',
    ahorro: 12500,
    interesEst: 1.5,
  },
  {
    id: 'pat-2',
    cuenta: 'Cartera Fondos MSCI World',
    tipo: 'Activos',
    tipoCuenta: 'VALORES EXT',
    tipoActivo: 'Liquidez Lenta',
    ahorro: 32000,
    interesEst: 6.5,
  },
  {
    id: 'pat-3',
    cuenta: 'Bitcoin / Ethereum Wallet',
    tipo: 'Activos',
    tipoCuenta: 'CRIPTO',
    tipoActivo: 'Liquidez Rapida',
    ahorro: 4500,
    interesEst: 5.0,
  },
  {
    id: 'pat-4',
    cuenta: 'Préstamo Hipotecario Vivienda',
    tipo: 'Pasivos',
    tipoCuenta: 'CUENTAS ES',
    tipoActivo: 'Deuda',
    ahorro: 85000,
    interesEst: 3.2,
  },
];

export const PatrimonioView: React.FC<PatrimonioViewProps> = ({
  patrimonioState,
  onUpdatePatrimonio,
  showToast,
  yearStates,
}) => {
  const tiempo = patrimonioState.tiempo ?? 5;
  const inflacion = patrimonioState.inflacion ?? 2.0;
  const items = patrimonioState.items ?? [];

  const [searchTerm, setSearchTerm] = useState('');

  // Calculate average annual increment (media de las aportaciones anuales) for a account matching cuentaDestino
  const getIncrementoAnual = (cuentaName: string): number => {
    if (!cuentaName || !yearStates) return 0;
    const target = cuentaName.trim().toLowerCase();
    if (!target) return 0;

    const yearKeys = Object.keys(yearStates);
    if (yearKeys.length === 0) return 0;

    let totalAportaciones = 0;
    yearKeys.forEach((yrKey) => {
      const yrState = yearStates[Number(yrKey)];
      if (!yrState?.expenses) return;
      Object.values(yrState.expenses).forEach((monthExpenses) => {
        if (Array.isArray(monthExpenses)) {
          monthExpenses.forEach((row) => {
            if (row.cuentaDestino && row.cuentaDestino.trim().toLowerCase() === target) {
              totalAportaciones += Number(row.importe) || 0;
            }
          });
        }
      });
    });

    return totalAportaciones / yearKeys.length;
  };

  // Utility calculation per row
  const getCalculatedValues = (ahorro: number, interesEst: number, currentTiempo: number) => {
    const safeAhorro = isNaN(ahorro) ? 0 : ahorro;
    const safeInteres = isNaN(interesEst) ? 0 : interesEst;
    const safeTiempo = isNaN(currentTiempo) || currentTiempo < 0 ? 0 : currentTiempo;

    const r = safeInteres / 100;
    const anual = safeAhorro * r;

    let interesCompuesto = 0;
    if (safeTiempo > 0 && safeAhorro !== 0 && safeInteres !== 0) {
      interesCompuesto = safeAhorro * Math.pow(1 + r, safeTiempo) - safeAhorro;
    }

    return {
      anual: isNaN(anual) ? 0 : anual,
      interesCompuesto: isNaN(interesCompuesto) ? 0 : interesCompuesto,
    };
  };

  // Handlers for global header inputs
  const handleTiempoChange = (val: number) => {
    const safeVal = Math.max(0, isNaN(val) ? 0 : val);
    onUpdatePatrimonio({
      ...patrimonioState,
      tiempo: safeVal,
    });
  };

  const handleInflacionChange = (val: number) => {
    const safeVal = Math.max(0, isNaN(val) ? 0 : val);
    onUpdatePatrimonio({
      ...patrimonioState,
      inflacion: safeVal,
    });
  };

  // Row operations
  const handleAddItem = () => {
    const newItem: PatrimonioItem = {
      id: 'pat-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      cuenta: 'Nueva Cuenta / Bien',
      tipo: 'Activos',
      tipoCuenta: 'CUENTAS ES',
      tipoActivo: 'Liquidez Rapida',
      ahorro: 0,
      interesEst: 0,
    };
    onUpdatePatrimonio({
      ...patrimonioState,
      items: [...items, newItem],
    });
    showToast('Fila añadida a patrimonio', 'success');
  };

  const handleUpdateItem = (id: string, field: keyof PatrimonioItem, value: any) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [field]: value,
        };
      }
      return item;
    });
    onUpdatePatrimonio({
      ...patrimonioState,
      items: updated,
    });
  };

  const handleDeleteItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    onUpdatePatrimonio({
      ...patrimonioState,
      items: updated,
    });
    showToast('Fila eliminada de patrimonio', 'success');
  };

  const handleLoadDefaultData = () => {
    onUpdatePatrimonio({
      tiempo: 5,
      inflacion: 2.0,
      items: DEFAULT_PATRIMONIO_ITEMS,
    });
    showToast('Plantilla de ejemplo cargada correctamente', 'success');
  };

  const handleClearAll = () => {
    if (window.confirm('¿Seguro que deseas eliminar todos los elementos de tu patrimonio?')) {
      onUpdatePatrimonio({
        ...patrimonioState,
        items: [],
      });
      showToast('Patrimonio vaciado', 'success');
    }
  };

  // KPI Calculations
  const totalActivos = items
    .filter((it) => it.tipo === 'Activos')
    .reduce((acc, it) => acc + (isNaN(it.ahorro) ? 0 : Number(it.ahorro)), 0);

  const totalPasivos = items
    .filter((it) => it.tipo === 'Pasivos')
    .reduce((acc, it) => acc + (isNaN(it.ahorro) ? 0 : Number(it.ahorro)), 0);

  const patrimonioNeto = totalActivos - totalPasivos;

  const totalAnualRendimiento = items.reduce((acc, it) => {
    const calc = getCalculatedValues(it.ahorro, it.interesEst, tiempo);
    return acc + calc.anual;
  }, 0);

  const totalIncrementoAnual = items.reduce((acc, it) => {
    return acc + getIncrementoAnual(it.cuenta);
  }, 0);

  const totalCrecimientoAnual = totalAnualRendimiento + totalIncrementoAnual;

  const baseCalculo = totalActivos > 0 ? totalActivos : (patrimonioNeto > 0 ? patrimonioNeto : 0);
  const rentabilidadPct = baseCalculo > 0 ? (totalAnualRendimiento / baseCalculo) * 100 : 0;
  const incrementoPct = baseCalculo > 0 ? (totalIncrementoAnual / baseCalculo) * 100 : 0;

  const formatPercent = (pct: number) => {
    return pct.toLocaleString('es-ES', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });
  };

  // Calculation for Meses de Solvencia
  const totalLiquidezRapida = items
    .filter((it) => {
      const normTipoActivo = (it.tipoActivo || '').toLowerCase().trim();
      return normTipoActivo === 'liquidez rapida' || normTipoActivo === 'liquidez rápida';
    })
    .reduce((acc, it) => acc + (isNaN(it.ahorro) ? 0 : Number(it.ahorro)), 0);

  let gastoAnualTotal = 0;
  let capacidadReaccionAnual = 0;

  if (yearStates && Object.keys(yearStates).length > 0) {
    const sortedYears = Object.keys(yearStates).map(Number).sort((a, b) => b - a);
    const latestYearState = yearStates[sortedYears[0]];

    if (latestYearState && latestYearState.expenses) {
      Object.values(latestYearState.expenses).forEach((monthExpenses) => {
        if (Array.isArray(monthExpenses)) {
          monthExpenses.forEach((exp) => {
            const normTipo = (exp.tipo || '').toLowerCase().trim();
            if (normTipo === 'gasto fijo' || normTipo === 'gasto estimado') {
              const imp = isNaN(exp.importe) ? 0 : Number(exp.importe);
              gastoAnualTotal += imp;

              const capPct = (exp.capReaccion !== null && exp.capReaccion !== undefined && !isNaN(exp.capReaccion))
                ? Number(exp.capReaccion)
                : 0;
              capacidadReaccionAnual += (imp * capPct) / 100;
            }
          });
        }
      });
    }
  }

  const gastoMensual = gastoAnualTotal > 0 ? gastoAnualTotal / 12 : 0;
  const mesesSolvencia = gastoMensual > 0 ? totalLiquidezRapida / gastoMensual : 0;

  const gastoAnualCapReaccion = Math.max(0, gastoAnualTotal - capacidadReaccionAnual);
  const gastoMensualCapReaccion = gastoAnualCapReaccion > 0 ? gastoAnualCapReaccion / 12 : 0;
  const mesesSolvenciaCapReaccion = gastoMensualCapReaccion > 0 ? totalLiquidezRapida / gastoMensualCapReaccion : 0;

  let salarioBrutoUltimoAno = 0;
  if (yearStates && Object.keys(yearStates).length > 0) {
    const sortedYears = Object.keys(yearStates).map(Number).sort((a, b) => b - a);
    const latestYearState = yearStates[sortedYears[0]];
    if (latestYearState) {
      const computedYear = computeYear(latestYearState);
      salarioBrutoUltimoAno = computedYear.annualSummary.salarioBruto || 0;
    }
  }

  const patrimonioObjetivoIngresos = (salarioBrutoUltimoAno * 36) / 10;
  const esPatrimonioMayorOIgual = patrimonioNeto >= patrimonioObjetivoIngresos;

  // Calculation for Ratio de Endeudamiento
  const totalDeuda = items
    .filter((it) => (it.tipoActivo || '').toLowerCase().trim() === 'deuda')
    .reduce((acc, it) => acc + (isNaN(it.ahorro) ? 0 : Number(it.ahorro)), 0);

  const totalNoDeuda = items
    .filter((it) => (it.tipoActivo || '').toLowerCase().trim() !== 'deuda')
    .reduce((acc, it) => acc + (isNaN(it.ahorro) ? 0 : Number(it.ahorro)), 0);

  const ratioEndeudamientoPct = totalNoDeuda > 0 ? (totalDeuda / totalNoDeuda) * 100 : 0;

  const formatMonths = (val: number) => {
    return val.toLocaleString('es-ES', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  };

  // Calculation for Patrimonio Estimado from Table 2 (Registro y control de gastos)
  interface EstimadoItemRow {
    cuenta: string;
    clasificacion: string;
    ahorro: number;
    interesPct: number;
    anual: number;
    incrementoAnual: number;
    interesCompuesto: number;
  }

  const getEstimadoRows = (): EstimadoItemRow[] => {
    if (!yearStates) return [];

    const map = new Map<string, { cuenta: string; clasificacion: string; ahorro: number }>();

    (Object.values(yearStates) as YearState[]).forEach((yrState) => {
      if (!yrState?.expenses) return;
      Object.values(yrState.expenses).forEach((monthExpenses) => {
        if (Array.isArray(monthExpenses)) {
          monthExpenses.forEach((row) => {
            const rawCuenta = row.cuentaDestino ? row.cuentaDestino.trim() : '';
            const normClasif = row.clasificacion ? row.clasificacion.trim().toLowerCase() : '';

            if (rawCuenta && (normClasif === 'ahorro' || normClasif === 'inversion')) {
              const normKey = rawCuenta.toLowerCase();
              const imp = isNaN(row.importe) ? 0 : Number(row.importe);
              const current = map.get(normKey);
              if (current) {
                current.ahorro += imp;
              } else {
                map.set(normKey, {
                  cuenta: rawCuenta,
                  clasificacion: row.clasificacion || (normClasif === 'ahorro' ? 'Ahorro' : 'Inversión'),
                  ahorro: imp,
                });
              }
            }
          });
        }
      });
    });

    const rows: EstimadoItemRow[] = [];
    map.forEach((item) => {
      const realItem = items.find(
        (it) => it.cuenta.trim().toLowerCase() === item.cuenta.trim().toLowerCase()
      );
      const interesPct = realItem && !isNaN(realItem.interesEst) ? Number(realItem.interesEst) : 0;

      const r = interesPct / 100;
      const anual = item.ahorro * r;
      const incrementoAnual = getIncrementoAnual(item.cuenta);

      let interesCompuesto = 0;
      const safeTiempo = isNaN(tiempo) || tiempo < 0 ? 0 : tiempo;
      if (safeTiempo > 0 && item.ahorro !== 0 && interesPct !== 0) {
        interesCompuesto = item.ahorro * Math.pow(1 + r, safeTiempo) - item.ahorro;
      }

      rows.push({
        cuenta: item.cuenta,
        clasificacion: item.clasificacion,
        ahorro: item.ahorro,
        interesPct,
        anual: isNaN(anual) ? 0 : anual,
        incrementoAnual: isNaN(incrementoAnual) ? 0 : incrementoAnual,
        interesCompuesto: isNaN(interesCompuesto) ? 0 : interesCompuesto,
      });
    });

    return rows;
  };

  const estimadoRows = getEstimadoRows();
  const totalPatrimonioEstimado = estimadoRows.reduce((acc, row) => acc + row.ahorro, 0);
  const esPatrimonioMayorOIgualEstimado = totalPatrimonioEstimado >= patrimonioObjetivoIngresos;

  const totalLiquidezEstimada = estimadoRows.reduce((acc, row) => {
    const matchingReal = items.find((it) => it.cuenta.trim().toLowerCase() === row.cuenta.trim().toLowerCase());
    if (matchingReal) {
      const norm = (matchingReal.tipoActivo || '').toLowerCase().trim();
      if (norm === 'liquidez rapida' || norm === 'liquidez rápida') {
        return acc + row.ahorro;
      }
      return acc;
    }
    return acc + row.ahorro;
  }, 0);

  const mesesSolvenciaEstimado = gastoMensual > 0 ? totalLiquidezEstimada / gastoMensual : 0;
  const mesesSolvenciaCapReaccionEstimado = gastoMensualCapReaccion > 0 ? totalLiquidezEstimada / gastoMensualCapReaccion : 0;

  // Filtering
  const filteredItems = items.filter((it) => {
    return (
      it.cuenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.tipoCuenta.toLowerCase().includes(searchTerm.toLowerCase()) ||
      it.tipoActivo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="space-y-6" id="patrimonio-view-container">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            Patrimonio Real
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Gestión y estimación de activos, cuentas bancarias, pasivos e interés compuesto.
          </p>
        </div>

        {items.length === 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              id="btn-patrimonio-load-demo"
              onClick={handleLoadDefaultData}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              Cargar Ejemplo
            </button>
          </div>
        )}
      </div>

      {/* KPI Cards Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" id="patrimonio-kpis-grid">
        {/* Patrimonio Neto */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xxs font-bold uppercase tracking-wider text-slate-500">Patrimonio Neto</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div className={`text-lg font-mono font-black ${patrimonioNeto >= 0 ? 'text-slate-900' : 'text-rose-600'}`}>
            {formatCurrency(patrimonioNeto)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>Obj. según ingresos: {formatCurrency(patrimonioObjetivoIngresos)}</span>
            {esPatrimonioMayorOIgual ? (
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <ThumbsDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            )}
          </div>
        </div>

        {/* Total Crecimiento Anual */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xxs font-bold uppercase tracking-wider text-emerald-600">Crecimiento Anual</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-mono font-black text-emerald-600">
            {formatCurrency(totalCrecimientoAnual)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>
              Rentabilidad {formatPercent(rentabilidadPct)}% + Incremento Anual {formatPercent(incrementoPct)}%
            </span>
            {rentabilidadPct >= inflacion ? (
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <ThumbsDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            )}
          </div>
        </div>

        {/* Meses de Solvencia */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xxs font-bold uppercase tracking-wider text-sky-600">Meses de Solvencia</span>
            <Clock className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-lg font-mono font-black text-sky-600">
            {formatMonths(mesesSolvencia)} meses
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>
              Hay un margen aplicando la capacidad de reacción que ampliaría a {formatMonths(mesesSolvenciaCapReaccion)} meses
            </span>
            {mesesSolvencia >= 9 ? (
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            ) : (
              <ThumbsDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            )}
          </div>
        </div>

        {/* Ratio de Endeudamiento */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xxs font-bold uppercase tracking-wider text-amber-600">Ratio de Endeudamiento</span>
            <ShieldAlert className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-mono font-black text-amber-600">
            {formatPercent(ratioEndeudamientoPct)}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span>Valor de la deuda: {formatCurrency(totalDeuda)}</span>
            {ratioEndeudamientoPct > 50 ? (
              <ThumbsDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            ) : (
              <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            )}
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="patrimonio-table-card">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <span className="font-sans font-bold text-xs uppercase tracking-wider text-slate-700 whitespace-nowrap">
              Bienes y Cuentas ({filteredItems.length})
            </span>
          </div>

          {/* Global Parameters: TIEMPO e INFLACIÓN */}
          <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 px-3 py-1.5 rounded-xl shadow-2xs">
            {/* TIEMPO Field */}
            <div className="flex items-center gap-2">
              <label htmlFor="input-global-tiempo" className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>TIEMPO (Años):</span>
              </label>
              <input
                id="input-global-tiempo"
                type="number"
                min="0"
                step="1"
                value={tiempo}
                onChange={(e) => handleTiempoChange(parseFloat(e.target.value))}
                className="w-16 px-2 py-1 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="hidden sm:block h-4 w-px bg-slate-200" />

            {/* INFLACION Field */}
            <div className="flex items-center gap-2">
              <label htmlFor="input-global-inflacion" className="text-xs font-bold text-slate-700">
                <span>INFLACIÓN (%):</span>
              </label>
              <input
                id="input-global-inflacion"
                type="number"
                min="0"
                step="0.1"
                value={inflacion}
                onChange={(e) => handleInflacionChange(parseFloat(e.target.value))}
                className="w-16 px-2 py-1 text-xs font-mono font-bold text-slate-900 bg-white border border-slate-300 rounded-lg shadow-2xs focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Input */}
            <input
              id="input-search-patrimonio"
              type="text"
              placeholder="Buscar por cuenta..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-44 sm:w-56"
            />

            <button
              type="button"
              id="btn-patrimonio-add-top"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              Añadir Elemento
            </button>
          </div>
        </div>

        {/* Scrollable Table Container */}
        <div className="overflow-x-auto" id="patrimonio-table-wrapper">
          <table className="w-full text-left border-collapse min-w-[1000px]" id="patrimonio-table">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <th className="py-3 px-3.5 w-[22%]">CUENTA</th>
                <th className="py-3 px-3 w-[11%]">TIPO</th>
                <th className="py-3 px-3 w-[14%]">TIPO CUENTA</th>
                <th className="py-3 px-3 w-[15%]">TIPO ACTIVO</th>
                <th className="py-3 px-3 text-right w-[12%]">
                  <div className="inline-flex items-center justify-end gap-1 relative group">
                    <span>AHORRO (€)</span>
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors" />
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 w-64 p-2.5 bg-slate-900 text-white text-[11px] font-normal rounded-xl shadow-xl pointer-events-none normal-case tracking-normal text-left">
                      <span className="font-bold text-blue-300 block mb-1">Rentabilidad Anual Simple:</span>
                      <code className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-emerald-300 text-[10px] block">
                        ANUAL = AHORRO * (INTERES_EST / 100)
                      </code>
                    </div>
                  </div>
                </th>
                <th className="py-3 px-3 text-right w-[10%]">INTERÉS EST (%)</th>
                <th className="py-3 px-3 text-right w-[11%]">
                  <div className="inline-flex items-center justify-end gap-1 relative group">
                    <span>ANUAL (€)</span>
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-blue-600 cursor-pointer transition-colors" />
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 w-64 p-2.5 bg-slate-900 text-white text-[11px] font-normal rounded-xl shadow-xl pointer-events-none normal-case tracking-normal text-left">
                      <span className="font-bold text-blue-300 block mb-1">Rentabilidad Anual Simple:</span>
                      <code className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-emerald-300 text-[10px] block">
                        ANUAL = AHORRO * (INTERES_EST / 100)
                      </code>
                    </div>
                  </div>
                </th>
                <th className="py-3 px-3 text-right w-[12%]">
                  <div className="inline-flex items-center justify-end gap-1 relative group">
                    <span>INCREMENTO ANUAL (€)</span>
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-emerald-600 cursor-pointer transition-colors" />
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 w-72 p-2.5 bg-slate-900 text-white text-[11px] font-normal rounded-xl shadow-xl pointer-events-none normal-case tracking-normal text-left">
                      <span className="font-bold text-emerald-300 block mb-1">Aportaciones Anuales Medias:</span>
                      <span className="text-slate-300 block leading-relaxed">
                        Media de las aportaciones anuales (suma de todos los meses) en la tabla de Registro y Control de gastos donde 'Cuenta Destino' coincide con esta cuenta.
                      </span>
                    </div>
                  </div>
                </th>
                <th className="py-3 px-3 text-right w-[13%]">
                  <div className="inline-flex items-center justify-end gap-1 relative group">
                    <span>INT. COMPUESTO (€)</span>
                    <Info className="w-3.5 h-3.5 text-slate-400 hover:text-purple-400 cursor-pointer transition-colors" />
                    <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50 w-72 p-2.5 bg-slate-900 text-white text-[11px] font-normal rounded-xl shadow-xl pointer-events-none normal-case tracking-normal text-left">
                      <span className="font-bold text-purple-300 block mb-1">Estimación Interés Compuesto:</span>
                      <code className="bg-slate-800 px-1.5 py-0.5 rounded font-mono text-emerald-300 text-[10px] block leading-relaxed">
                        INT_COMPUESTO = AHORRO * (1 + INTERES_EST / 100)^TIEMPO - AHORRO
                      </code>
                    </div>
                  </div>
                </th>
                <th className="py-3 px-2 text-center w-[40px]"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs font-sans">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 px-4 text-center">
                    <div className="max-w-md mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                        <Landmark className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-700 text-sm">No hay registros patrimoniales</h4>
                        <p className="text-slate-400 text-xs">
                          {searchTerm
                            ? 'No se encontraron resultados con la búsqueda aplicada.'
                            : 'Añade tu primera cuenta, fondo de inversión, bien o pasivo para iniciar los cálculos.'}
                        </p>
                      </div>
                      {!searchTerm && (
                        <div className="pt-2 flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                          >
                            Añadir Cuenta
                          </button>
                          <button
                            type="button"
                            onClick={handleLoadDefaultData}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer"
                          >
                            Cargar Datos Ejemplo
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const calc = getCalculatedValues(item.ahorro, item.interesEst, tiempo);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                      id={`patrimonio-row-${item.id}`}
                    >
                      {/* Col 1: CUENTA (free text) */}
                      <td className="py-2.5 px-3.5">
                        <input
                          type="text"
                          value={item.cuenta}
                          onChange={(e) => handleUpdateItem(item.id, 'cuenta', e.target.value)}
                          placeholder="Nombre de la cuenta..."
                          className="w-full bg-transparent border border-transparent hover:border-slate-300 focus:border-blue-500 focus:bg-white rounded-lg px-2 py-1 font-semibold text-slate-800 transition-all focus:outline-none"
                        />
                      </td>

                      {/* Col 2: TIPO (Pasivos / Activos) */}
                      <td className="py-2.5 px-3">
                        <select
                          value={item.tipo}
                          onChange={(e) => handleUpdateItem(item.id, 'tipo', e.target.value as PatrimonioTipo)}
                          className={`w-full font-bold rounded-lg px-2 py-1 text-xs border transition-all cursor-pointer focus:outline-none ${
                            item.tipo === 'Activos'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                        >
                          {TIPO_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Col 3: TIPO CUENTA */}
                      <td className="py-2.5 px-3">
                        <select
                          value={item.tipoCuenta}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'tipoCuenta', e.target.value as PatrimonioTipoCuenta)
                          }
                          className="w-full font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:bg-white focus:bg-white focus:border-blue-500 rounded-lg px-2 py-1 text-xs transition-all cursor-pointer focus:outline-none"
                        >
                          {TIPO_CUENTA_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Col 4: TIPO ACTIVO */}
                      <td className="py-2.5 px-3">
                        <select
                          value={item.tipoActivo}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'tipoActivo', e.target.value as PatrimonioTipoActivo)
                          }
                          className="w-full font-medium text-slate-700 bg-slate-50 border border-slate-200 hover:bg-white focus:bg-white focus:border-blue-500 rounded-lg px-2 py-1 text-xs transition-all cursor-pointer focus:outline-none"
                        >
                          {TIPO_ACTIVO_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Col 5: AHORRO (€) */}
                      <td className="py-2.5 px-3 text-right">
                        <input
                          type="number"
                          step="any"
                          value={isNaN(item.ahorro) ? '' : item.ahorro}
                          onChange={(e) => handleUpdateItem(item.id, 'ahorro', parseFloat(e.target.value) || 0)}
                          className="w-full text-right font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 hover:bg-white focus:bg-white focus:border-blue-500 rounded-lg px-2 py-1 transition-all focus:outline-none"
                        />
                      </td>

                      {/* Col 6: INTERES EST (%) */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="relative flex items-center justify-end">
                          <input
                            type="number"
                            step="0.1"
                            value={isNaN(item.interesEst) ? '' : item.interesEst}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'interesEst', parseFloat(e.target.value) || 0)
                            }
                            className="w-full text-right font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 hover:bg-white focus:bg-white focus:border-blue-500 rounded-lg pl-2 pr-5 py-1 transition-all focus:outline-none"
                          />
                          <span className="absolute right-2 text-slate-400 font-bold text-[11px] pointer-events-none">
                            %
                          </span>
                        </div>
                      </td>

                      {/* Col 7: ANUAL (€) (Automatic) */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600 bg-indigo-50/30">
                        {formatCurrency(calc.anual)}
                      </td>

                      {/* Col 8: INCREMENTO ANUAL (€) (Automatic) */}
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 bg-emerald-50/20">
                        {formatCurrency(getIncrementoAnual(item.cuenta))}
                      </td>

                      {/* Col 9: INTERES COMPUESTO (€) (Automatic) */}
                      <td className="py-2.5 px-3 text-right font-mono font-black text-purple-700 bg-purple-50/30">
                        {formatCurrency(calc.interesCompuesto)}
                      </td>

                      {/* Col 9: Delete row */}
                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar elemento"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* Table Footer Totals */}
            {filteredItems.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/90 border-t-2 border-slate-200 font-bold text-slate-800 text-xs">
                  <td colSpan={4} className="py-3 px-3.5 uppercase tracking-wider text-slate-600">
                    Totales ({filteredItems.length} elementos)
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-slate-900">
                    {formatCurrency(
                      filteredItems.reduce((acc, it) => acc + (isNaN(it.ahorro) ? 0 : Number(it.ahorro)), 0)
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">-</td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-indigo-700">
                    {formatCurrency(
                      filteredItems.reduce(
                        (acc, it) => acc + getCalculatedValues(it.ahorro, it.interesEst, tiempo).anual,
                        0
                      )
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-emerald-700">
                    {formatCurrency(
                      filteredItems.reduce((acc, it) => acc + getIncrementoAnual(it.cuenta), 0)
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-sm text-purple-700">
                    {formatCurrency(
                      filteredItems.reduce(
                        (acc, it) =>
                          acc + getCalculatedValues(it.ahorro, it.interesEst, tiempo).interesCompuesto,
                        0
                      )
                    )}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* SECTION: Patrimonio Estimado */}
      <div className="space-y-4 pt-6 border-t-2 border-slate-200/80" id="patrimonio-estimado-section">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <TrendingUp className="w-5 h-5" />
              </div>
              Patrimonio Estimado
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Estimación calculada automáticamente agrupando los registros de ahorro e inversión del control de gastos.
            </p>
          </div>
        </div>

        {/* Cards for Patrimonio Estimado: PATRIMONIO NETO y MESES DE SOLVENCIA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="patrimonio-estimado-kpis-grid">
          {/* Card 1: Patrimonio Neto (Estimado) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xxs font-bold uppercase tracking-wider text-indigo-600">Patrimonio Neto (Estimado)</span>
              <Wallet className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="text-lg font-mono font-black text-slate-900">
              {formatCurrency(totalPatrimonioEstimado)}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Obj. según ingresos: {formatCurrency(patrimonioObjetivoIngresos)}</span>
              {esPatrimonioMayorOIgualEstimado ? (
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <ThumbsDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
            </div>
          </div>

          {/* Card 2: Meses de Solvencia (Estimado) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-xxs font-bold uppercase tracking-wider text-sky-600">Meses de Solvencia (Estimado)</span>
              <Clock className="w-4 h-4 text-sky-500" />
            </div>
            <div className="text-lg font-mono font-black text-sky-600">
              {formatMonths(mesesSolvenciaEstimado)} meses
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>
                Hay un margen aplicando la capacidad de reacción que ampliaría a {formatMonths(mesesSolvenciaCapReaccionEstimado)} meses
              </span>
              {mesesSolvenciaEstimado >= 9 ? (
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              ) : (
                <ThumbsDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              )}
            </div>
          </div>
        </div>

        {/* Table for Patrimonio Estimado */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden" id="patrimonio-estimado-table-card">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="font-sans font-bold text-xs uppercase tracking-wider text-slate-700">
              Detalle de Cuentas de Ahorro e Inversión Estimadas ({estimadoRows.length})
            </span>
          </div>

          <div className="overflow-x-auto" id="patrimonio-estimado-table-wrapper">
            <table className="w-full text-left border-collapse min-w-[900px]" id="patrimonio-estimado-table">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3.5 w-[25%]">CUENTA</th>
                  <th className="py-3 px-3 w-[15%]">CLASIFICACIÓN</th>
                  <th className="py-3 px-3 text-right w-[15%]">AHORRO (€)</th>
                  <th className="py-3 px-3 text-right w-[15%]">ANUAL (€)</th>
                  <th className="py-3 px-3 text-right w-[15%]">INCREMENTO ANUAL (€)</th>
                  <th className="py-3 px-3 text-right w-[15%]">INTERÉS COMPUESTO (€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-sans">
                {estimadoRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 px-4 text-center text-slate-400">
                      No hay registros con clasificación &quot;Ahorro&quot; o &quot;Inversión&quot; en la tabla de control de gastos.
                    </td>
                  </tr>
                ) : (
                  estimadoRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3.5 font-semibold text-slate-800">{row.cuenta}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-2 py-0.5 text-xs font-bold rounded-md ${
                          row.clasificacion.toLowerCase() === 'ahorro'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {row.clasificacion}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {formatCurrency(row.ahorro)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-600 bg-indigo-50/30">
                        {formatCurrency(row.anual)}
                        {row.interesPct > 0 && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            ({formatPercent(row.interesPct)}%)
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600 bg-emerald-50/20">
                        {formatCurrency(row.incrementoAnual)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-black text-purple-700 bg-purple-50/30">
                        {formatCurrency(row.interesCompuesto)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {estimadoRows.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-100/90 border-t-2 border-slate-200 font-bold text-slate-800 text-xs">
                    <td colSpan={2} className="py-3 px-3.5 uppercase tracking-wider text-slate-600">
                      Totales ({estimadoRows.length} cuentas)
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-sm text-slate-900">
                      {formatCurrency(estimadoRows.reduce((a, b) => a + b.ahorro, 0))}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-sm text-indigo-700">
                      {formatCurrency(estimadoRows.reduce((a, b) => a + b.anual, 0))}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-sm text-emerald-700">
                      {formatCurrency(estimadoRows.reduce((a, b) => a + b.incrementoAnual, 0))}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-sm text-purple-700">
                      {formatCurrency(estimadoRows.reduce((a, b) => a + b.interesCompuesto, 0))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
