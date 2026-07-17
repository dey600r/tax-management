import React from 'react';
import { 
  TrendingUp, 
  Award, 
  DollarSign, 
  Calendar, 
  Shield,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Percent,
  Coins,
  ChevronUp,
  ChevronDown
} from 'lucide-react';

export interface DashboardYearSummary {
  year: number;
  salarioBruto: number;
  retencionIrpf: number;
  retencionCapital: number;
  ssEmpleado: number;
  ssEmpresa: number;
  totalNetoNomina?: number;
  totalGastado?: number;
  expensesByCategory?: Record<string, number>;
}

interface DashboardViewProps {
  summaries: DashboardYearSummary[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ summaries }) => {
  const [hoveredYearIdx, setHoveredYearIdx] = React.useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null);
  const [hoveredExpIdx, setHoveredExpIdx] = React.useState<number | null>(null);
  const [expTooltipPos, setExpTooltipPos] = React.useState<{ x: number; y: number } | null>(null);
  const [tableShowPercentage, setTableShowPercentage] = React.useState<boolean>(false);

  const hasData = summaries.length > 0 && summaries.some((s) => s.salarioBruto > 0);

  if (!hasData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[400px] bg-white rounded-2xl border border-slate-200 text-center space-y-4 shadow-sm" id="dashboard-empty-state">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center border border-dashed border-slate-200">
          <TrendingUp className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-sans font-bold text-slate-800 text-base">No hay datos registrados</h3>
          <p className="font-sans text-sm text-slate-400 max-w-sm">
            Introduce nóminas en la sección de "Cuenta anual" para generar el histórico interanual.
          </p>
        </div>
      </div>
    );
  }

  // Find the maximum value to scale the Y axis
  // Scale should accommodate Salario Bruto + SS Empresa (Total employment cost) as it is the highest value
  const maxTotal = Math.max(...summaries.map((s) => s.salarioBruto + s.ssEmpresa), 100);
  const yMax = maxTotal * 1.15; // 15% margin for visual breathing room

  // Chart Dimensions
  const svgWidth = 600;
  const svgHeight = 320;
  const marginTop = 30;
  const marginBottom = 50;
  const marginLeft = 60;
  const marginRight = 30;

  const chartWidth = svgWidth - marginLeft - marginRight;
  const chartHeight = svgHeight - marginTop - marginBottom;

  // Calculate coordinates
  const numYears = summaries.length;
  const groupWidth = chartWidth / numYears;

  // Bar sizes
  const barWidth = 36;

  // Series colors matches guidelines
  const colors = {
    neto: '#10b981',       // Emerald-500 (Neto - Poder adquisitivo)
    ssEmpleado: '#f59e0b',  // Amber-500 (SS Empleado)
    capital: '#8b5cf6',     // Violet-500 (Retención Capital)
    irpf: '#ef4444',        // Red-500 (Retención IRPF)
    ssEmpresa: '#64748b',   // Slate-500 (SS Empresa)
  };

  const getXCoord = (yearIdx: number) => {
    return marginLeft + yearIdx * groupWidth + groupWidth / 2;
  };

  const getYCoord = (val: number) => {
    return svgHeight - marginBottom - (val / yMax) * chartHeight;
  };

  // Generate ticks for Y axis
  const numTicks = 5;
  const ticks = Array.from({ length: numTicks }, (_, i) => (yMax / (numTicks - 1)) * i);

  // Calculate quick cards
  const latestSummary = summaries[summaries.length - 1];
  const totalHistoricallyNeto = summaries.reduce((acc, curr) => {
    const neto = Math.max(0, curr.salarioBruto - curr.retencionIrpf - curr.ssEmpleado - curr.retencionCapital);
    return acc + neto;
  }, 0);
  const totalHistoricallyIrpf = summaries.reduce((acc, curr) => acc + curr.retencionIrpf, 0);
  const totalHistoricallySS = summaries.reduce((acc, curr) => acc + curr.ssEmpleado + curr.ssEmpresa, 0);

  return (
    <div className="space-y-3.5" id="dashboard-view-wrapper">
      
      {/* 1. Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-stats-row">
        {/* Stat 1: Total neto */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total Histórico Neto
            </span>
            <span className="text-base font-extrabold font-mono text-slate-800">
              {totalHistoricallyNeto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Stat 2: Total IRPF paid */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-50 rounded-lg flex items-center justify-center text-rose-600 border border-rose-100">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total IRPF Pagado
            </span>
            <span className="text-base font-extrabold font-mono text-slate-800">
              {totalHistoricallyIrpf.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Stat 3: Total Seguridad Social paid */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 border border-amber-100">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total Seguridad Social
            </span>
            <span className="text-base font-extrabold font-mono text-slate-800">
              {totalHistoricallySS.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>

        {/* Stat 4: Last active year info */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 border border-slate-200">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Último Ejercicio Activo
            </span>
            <span className="text-base font-extrabold font-mono text-slate-800">
              {latestSummary?.year || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Combo Chart Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm relative" id="card-dashboard-chart">
        <div className="mb-2.5 space-y-1">
          <h3 className="font-sans font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" />
            Evolución de Poder Adquisitivo e Impuestos
          </h3>
          <p className="font-sans text-xs text-slate-400 font-medium">
            Distribución del coste total de empleo: Salario Neto (poder adquisitivo) frente a retenciones y seguridad social
          </p>
        </div>

        {/* SVG Container */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[550px] max-w-[800px] mx-auto relative">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} width="100%" className="overflow-visible">
              {/* Horizontal gridlines */}
              {ticks.map((tick, i) => {
                const y = getYCoord(tick);
                return (
                  <g key={i} className="opacity-40">
                    <line
                      x1={marginLeft}
                      y1={y}
                      x2={svgWidth - marginRight}
                      y2={y}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={marginLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      className="font-mono text-[9px] fill-slate-400 font-semibold"
                    >
                      {Math.round(tick).toLocaleString('es-ES')}€
                    </text>
                  </g>
                );
              })}

              {/* Vertical Year groups */}
              {summaries.map((s, idx) => {
                const groupCenterX = getXCoord(idx);
                const yearNeto = Math.max(0, s.salarioBruto - s.retencionIrpf - s.ssEmpleado - s.retencionCapital);

                // Define segments to stack from bottom to top (matches the requested order)
                const segments = [
                  { label: 'Salario Neto', value: yearNeto, color: colors.neto },
                  { label: 'Retención IRPF', value: s.retencionIrpf, color: colors.irpf },
                  { label: 'Retención Capital', value: s.retencionCapital, color: colors.capital },
                  { label: 'SS Empleado', value: s.ssEmpleado, color: colors.ssEmpleado },
                  { label: 'SS Empresa', value: s.ssEmpresa, color: colors.ssEmpresa },
                ].filter(seg => seg.value > 0);

                let accumulatedVal = 0;
                const isCurrentHovered = hoveredYearIdx === idx;

                return (
                  <g 
                    key={s.year} 
                    className="transition-opacity duration-200"
                    style={{ opacity: hoveredYearIdx !== null && !isCurrentHovered ? 0.45 : 1 }}
                  >
                    {/* Tick label under column */}
                    <text
                      x={groupCenterX}
                      y={svgHeight - marginBottom + 18}
                      textAnchor="middle"
                      className={`font-mono text-[10px] font-bold ${isCurrentHovered ? 'fill-slate-900 font-extrabold' : 'fill-slate-500'}`}
                    >
                      Año {s.year}
                    </text>

                    {/* Stacked Bars */}
                    {segments.map((seg, sIdx) => {
                      const yStart = getYCoord(accumulatedVal);
                      const yEnd = getYCoord(accumulatedVal + seg.value);
                      const height = Math.max(0, yStart - yEnd);
                      accumulatedVal += seg.value;

                      return (
                        <rect
                          key={sIdx}
                          x={groupCenterX - barWidth / 2}
                          y={yEnd}
                          width={barWidth}
                          height={height}
                          fill={seg.color}
                          className="transition-all hover:brightness-95"
                        />
                      );
                    })}

                    {/* Invisible Overlay capture mouse to make hover super easy */}
                    <rect
                      x={groupCenterX - groupWidth / 2}
                      y={marginTop}
                      width={groupWidth}
                      height={chartHeight}
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                        if (rect) {
                          setTooltipPos({
                            x: e.clientX - rect.left + 15,
                            y: e.clientY - rect.top - 15,
                          });
                        }
                        setHoveredYearIdx(idx);
                      }}
                      onMouseEnter={() => setHoveredYearIdx(idx)}
                      onMouseLeave={() => {
                        setHoveredYearIdx(null);
                        setTooltipPos(null);
                      }}
                    />
                  </g>
                );
              })}

              {/* Axis lines */}
              <line
                x1={marginLeft}
                y1={svgHeight - marginBottom}
                x2={svgWidth - marginRight}
                y2={svgHeight - marginBottom}
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
              <line
                x1={marginLeft}
                y1={marginTop}
                x2={marginLeft}
                y2={svgHeight - marginBottom}
                stroke="#94a3b8"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {/* Custom Legend underneath */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-2 border-t border-slate-100 pt-2 text-xs" id="dashboard-chart-legend">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: colors.neto }} />
            <span className="font-sans font-semibold text-emerald-600">Salario Neto (Poder Adquisitivo)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: colors.irpf }} />
            <span className="font-sans font-medium text-slate-600">Retención IRPF</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: colors.capital }} />
            <span className="font-sans font-medium text-slate-600">Retención Capital</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: colors.ssEmpleado }} />
            <span className="font-sans font-medium text-slate-600">SS Empleado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: colors.ssEmpresa }} />
            <span className="font-sans font-medium text-slate-600">SS Empresa (Coste indirecto)</span>
          </div>
        </div>

        {/* Interactive Tooltip Card */}
        {hoveredYearIdx !== null && tooltipPos && (() => {
          const s = summaries[hoveredYearIdx];
          const neto = Math.max(0, s.salarioBruto - s.retencionIrpf - s.ssEmpleado - s.retencionCapital);
          const totalCoste = s.salarioBruto + s.ssEmpresa;

          const pctNeto = totalCoste > 0 ? (neto / totalCoste) * 100 : 0;
          const pctIrpf = totalCoste > 0 ? (s.retencionIrpf / totalCoste) * 100 : 0;
          const pctCapital = totalCoste > 0 ? (s.retencionCapital / totalCoste) * 100 : 0;
          const pctSsEmpleado = totalCoste > 0 ? (s.ssEmpleado / totalCoste) * 100 : 0;
          const pctSsEmpresa = totalCoste > 0 ? (s.ssEmpresa / totalCoste) * 100 : 0;

          return (
            <div
              className="absolute z-10 bg-slate-900/95 text-white text-xs font-sans rounded-xl p-3 shadow-xl pointer-events-none border border-slate-800/60 backdrop-blur-md space-y-2 min-w-[240px]"
              style={{ left: tooltipPos.x, top: tooltipPos.y }}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="font-bold text-sm text-white">Año {s.year}</span>
                <span className="font-mono text-xxs font-bold text-slate-400">Desglose Total</span>
              </div>

              <div className="space-y-1.5">
                {/* Salario Neto */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.neto }} />
                    <span className="text-slate-300 font-medium">Salario Neto:</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-300">
                    {neto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} ({pctNeto.toFixed(1)}%)
                  </span>
                </div>

                {/* Retención IRPF */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.irpf }} />
                    <span className="text-slate-300 font-medium">Retención IRPF:</span>
                  </div>
                  <span className="font-mono font-bold text-rose-300">
                    {s.retencionIrpf.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} ({pctIrpf.toFixed(1)}%)
                  </span>
                </div>

                {/* Retención Capital (only show if it is greater than 0) */}
                {s.retencionCapital > 0 && (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.capital }} />
                      <span className="text-slate-300 font-medium">Retención Capital:</span>
                    </div>
                    <span className="font-mono font-bold text-purple-300">
                      {s.retencionCapital.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} ({pctCapital.toFixed(1)}%)
                    </span>
                  </div>
                )}

                {/* SS Empleado */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.ssEmpleado }} />
                    <span className="text-slate-300 font-medium">SS Empleado:</span>
                  </div>
                  <span className="font-mono font-bold text-amber-300">
                    {s.ssEmpleado.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} ({pctSsEmpleado.toFixed(1)}%)
                  </span>
                </div>

                {/* SS Empresa */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.ssEmpresa }} />
                    <span className="text-slate-300 font-medium">SS Empresa:</span>
                  </div>
                  <span className="font-mono font-bold text-slate-300">
                    {s.ssEmpresa.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })} ({pctSsEmpresa.toFixed(1)}%)
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-1.5 mt-1 flex justify-between text-xxs text-slate-400 font-medium">
                <span>Coste Total Empresa:</span>
                <span className="font-mono text-slate-200 font-bold">
                  {totalCoste.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ====================================================================== */}
      {/* 2. RELACIÓN DE GASTOS Y AHORRO INTERANUAL */}
      {/* ====================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm relative" id="card-dashboard-expenses-savings">
        <div className="mb-2.5 space-y-1">
          <h3 className="font-sans font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-rose-500" />
            2. Relación de Gastos y Ahorro Interanual
          </h3>
          <p className="font-sans text-xs text-slate-400 font-medium">
            Comparativa entre la nómina neta percibida (ingresos), los gastos totales registrados y el ahorro o nómina sobrante (gris clarito)
          </p>
        </div>

        {/* SVG Container for Expenses vs Savings */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[550px] max-w-[800px] mx-auto relative">
            {(() => {
              const expenseSvgWidth = 600;
              const expenseSvgHeight = 320;
              const expenseMarginLeft = 60;
              const expenseMarginRight = 30;
              const expenseMarginTop = 30;
              const expenseMarginBottom = 50;
              const expenseChartWidth = expenseSvgWidth - expenseMarginLeft - expenseMarginRight;
              const expenseChartHeight = expenseSvgHeight - expenseMarginTop - expenseMarginBottom;

              const maxExpenseVal = Math.max(...summaries.map((s) => Math.max(s.totalNetoNomina ?? 0, s.totalGastado ?? 0)), 100);
              const expenseYMax = maxExpenseVal * 1.15;

              const getExpenseY = (val: number) => {
                return expenseSvgHeight - expenseMarginBottom - (val / expenseYMax) * expenseChartHeight;
              };

              const expenseGroupWidth = expenseChartWidth / numYears;
              const expenseBarWidth = 36;
              const expenseTicks = Array.from({ length: 5 }, (_, i) => (expenseYMax / 4) * i);

              return (
                <>
                  <svg viewBox={`0 0 ${expenseSvgWidth} ${expenseSvgHeight}`} width="100%" className="overflow-visible">
                    {/* Horizontal gridlines */}
                    {expenseTicks.map((tick, i) => {
                      const y = getExpenseY(tick);
                      return (
                        <g key={i} className="opacity-40">
                          <line
                            x1={expenseMarginLeft}
                            y1={y}
                            x2={expenseSvgWidth - expenseMarginRight}
                            y2={y}
                            stroke="#cbd5e1"
                            strokeWidth="1"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={expenseMarginLeft - 8}
                            y={y + 4}
                            textAnchor="end"
                            className="font-mono text-[9px] fill-slate-400 font-semibold"
                          >
                            {Math.round(tick).toLocaleString('es-ES')}€
                          </text>
                        </g>
                      );
                    })}

                    {/* Vertical bars representing each year */}
                    {summaries.map((s, idx) => {
                      const groupCenterX = expenseMarginLeft + idx * expenseGroupWidth + expenseGroupWidth / 2;
                      const netoVal = s.totalNetoNomina ?? Math.max(0, s.salarioBruto - s.retencionIrpf - s.ssEmpleado - s.retencionCapital);
                      const gastadoVal = s.totalGastado ?? 0;
                      const sobranteVal = Math.max(0, netoVal - gastadoVal);
                      const deficitVal = Math.max(0, gastadoVal - netoVal);

                      const isCurrentHovered = hoveredExpIdx === idx;

                      // Coordinates for bars
                      const barX = groupCenterX - expenseBarWidth / 2;

                      // Stacked Segment heights and offsets
                      const y0 = getExpenseY(0);

                      // If we are in surplus or balance
                      const gastosHeight = Math.max(0, y0 - getExpenseY(Math.min(gastadoVal, netoVal)));
                      const yGastosTop = y0 - gastosHeight;

                      const sobranteHeight = Math.max(0, getExpenseY(Math.min(gastadoVal, netoVal)) - getExpenseY(netoVal));
                      const ySobranteTop = yGastosTop - sobranteHeight;

                      // If we are in deficit (overspending)
                      const deficitHeight = Math.max(0, getExpenseY(netoVal) - getExpenseY(gastadoVal));
                      const yDeficitTop = ySobranteTop - deficitHeight; // beyond netoVal

                      return (
                        <g
                          key={s.year}
                          className="transition-opacity duration-200"
                          style={{ opacity: hoveredExpIdx !== null && !isCurrentHovered ? 0.45 : 1 }}
                        >
                          {/* Year label */}
                          <text
                            x={groupCenterX}
                            y={expenseSvgHeight - expenseMarginBottom + 18}
                            textAnchor="middle"
                            className={`font-mono text-[10px] font-bold ${isCurrentHovered ? 'fill-slate-900 font-extrabold' : 'fill-slate-500'}`}
                          >
                            Año {s.year}
                          </text>

                          {/* 1. GASTOS REGISTRADOS BAR */}
                          {gastosHeight > 0 && (
                            <rect
                              x={barX}
                              y={yGastosTop}
                              width={expenseBarWidth}
                              height={gastosHeight}
                              fill="#fca5a5" // rose-300 / soft light red
                              className="transition-all hover:brightness-95"
                            />
                          )}

                          {/* 2. NÓMINA SOBRANTE BAR (GRIS CLARITO) */}
                          {sobranteHeight > 0 && (
                            <rect
                              x={barX}
                              y={ySobranteTop}
                              width={expenseBarWidth}
                              height={sobranteHeight}
                              fill="#cbd5e1" // gris clarito
                              className="transition-all hover:brightness-95"
                            />
                          )}

                          {/* 3. DÉFICIT / SOBRECONSUMO BAR */}
                          {deficitHeight > 0 && (
                            <rect
                              x={barX}
                              y={yDeficitTop}
                              width={expenseBarWidth}
                              height={deficitHeight}
                              fill="#ef4444" // red-500
                              className="transition-all hover:brightness-95"
                            />
                          )}

                          {/* Invisible overlay for hover mouse capture */}
                          <rect
                            x={groupCenterX - expenseGroupWidth / 2}
                            y={expenseMarginTop}
                            width={expenseGroupWidth}
                            height={expenseChartHeight}
                            fill="transparent"
                            className="cursor-pointer"
                            onMouseMove={(e) => {
                              const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
                              if (rect) {
                                setExpTooltipPos({
                                  x: e.clientX - rect.left + 15,
                                  y: e.clientY - rect.top - 15,
                                });
                              }
                              setHoveredExpIdx(idx);
                            }}
                            onMouseEnter={() => setHoveredExpIdx(idx)}
                            onMouseLeave={() => {
                              setHoveredExpIdx(null);
                              setExpTooltipPos(null);
                            }}
                          />
                        </g>
                      );
                    })}

                    {/* Axis Lines */}
                    <line
                      x1={expenseMarginLeft}
                      y1={expenseSvgHeight - expenseMarginBottom}
                      x2={expenseSvgWidth - expenseMarginRight}
                      y2={expenseSvgHeight - expenseMarginBottom}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />
                    <line
                      x1={expenseMarginLeft}
                      y1={expenseMarginTop}
                      x2={expenseMarginLeft}
                      y2={expenseSvgHeight - expenseMarginBottom}
                      stroke="#94a3b8"
                      strokeWidth="1.5"
                    />
                  </svg>
                </>
              );
            })()}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mt-2 border-t border-slate-100 pt-2 text-xs" id="dashboard-expenses-savings-legend">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#fca5a5] shrink-0" />
            <span className="font-sans font-medium text-slate-600">Gastos Registrados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#cbd5e1] shrink-0" />
            <span className="font-sans font-semibold text-slate-700">Nómina Sobrante (Ahorro)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#ef4444] shrink-0" />
            <span className="font-sans font-medium text-red-600">Déficit (Consumo excedente)</span>
          </div>
        </div>

        {/* Hover Tooltip for Point 2 */}
        {hoveredExpIdx !== null && expTooltipPos && (() => {
          const s = summaries[hoveredExpIdx];
          const netoVal = s.totalNetoNomina ?? Math.max(0, s.salarioBruto - s.retencionIrpf - s.ssEmpleado - s.retencionCapital);
          const gastadoVal = s.totalGastado ?? 0;
          const sobranteVal = Math.max(0, netoVal - gastadoVal);
          const deficitVal = Math.max(0, gastadoVal - netoVal);
          
          const pctGastado = netoVal > 0 ? (gastadoVal / netoVal) * 100 : 0;
          const pctSobrante = netoVal > 0 ? (sobranteVal / netoVal) * 100 : 0;
          const pctDeficit = netoVal > 0 ? (deficitVal / netoVal) * 100 : 0;

          return (
            <div
              className="absolute z-10 bg-slate-900/95 text-white text-xs font-sans rounded-xl p-3 shadow-xl pointer-events-none border border-slate-800/60 backdrop-blur-md space-y-2 min-w-[240px]"
              style={{ left: expTooltipPos.x, top: expTooltipPos.y }}
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                <span className="font-bold text-sm text-white">Año {s.year}</span>
                <span className="font-mono text-xxs font-bold text-slate-400">Balance del Año</span>
              </div>

              <div className="space-y-1.5">
                {/* Ingresos Netos */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-300 font-medium">Nómina Neta Anual:</span>
                  <span className="font-mono font-bold text-emerald-300">
                    {netoVal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                  </span>
                </div>

                {/* Gastos Totales */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#fca5a5]" />
                    <span className="text-slate-300 font-medium">Gastos Totales:</span>
                  </div>
                  <span className="font-mono font-bold text-rose-300">
                    {gastadoVal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} ({pctGastado.toFixed(1)}%)
                  </span>
                </div>

                {/* Sobrante vs Deficit */}
                {deficitVal > 0 ? (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
                      <span className="text-red-300 font-medium">Déficit de nómina:</span>
                    </div>
                    <span className="font-mono font-bold text-red-400">
                      {deficitVal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} (+{pctDeficit.toFixed(1)}%)
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#cbd5e1]" />
                      <span className="text-slate-300 font-medium">Nómina Sobrante:</span>
                    </div>
                    <span className="font-mono font-bold text-slate-200">
                      {sobranteVal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} ({pctSobrante.toFixed(1)}%)
                    </span>
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800/80 pt-1.5 mt-1 flex justify-between text-xxs text-slate-400 font-medium">
                <span>Tasa de Ahorro:</span>
                <span className={`font-mono font-bold ${deficitVal > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {deficitVal > 0 ? '0.00%' : `${pctSobrante.toFixed(2)}%`}
                </span>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ====================================================================== */}
      {/* 3. DISTRIBUCIÓN HISTÓRICA DE GASTOS POR CATEGORÍAS */}
      {/* ====================================================================== */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4" id="card-dashboard-categories-distribution">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <h3 className="font-sans font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-purple-500" />
              3. Distribución Histórica de Gastos por Categoría
            </h3>
            <p className="font-sans text-xs text-slate-400 font-medium">
              Evolución detallada de las partidas del presupuesto familiar. Compara importes absolutos o peso relativo sobre ingresos netos.
            </p>
          </div>

          {/* Value / Percentage Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setTableShowPercentage(false)}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${!tableShowPercentage ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Euros (€)</span>
            </button>
            <button
              type="button"
              onClick={() => setTableShowPercentage(true)}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${tableShowPercentage ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>Porcentaje (%)</span>
            </button>
          </div>
        </div>

        {/* Categories Comparative Matrix Grid */}
        <div className="overflow-x-auto border border-slate-200/60 rounded-xl">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="p-3.5 pl-4">Categoría de Gasto</th>
                {summaries.map((s) => (
                  <th key={s.year} className="p-3.5 text-right font-mono font-bold text-slate-600 w-32">
                    Año {s.year}
                  </th>
                ))}
                {summaries.length >= 2 && (
                  <th className="p-3.5 text-center w-28">Tendencia</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {(() => {
                const CLASSIFICATIONS = ['Vivienda', 'Alimentacion', 'Ocio', 'Trabajo', 'Vehiculos', 'Inversion', 'Regalos', 'Ropa', 'Ahorro'];
                const CATEGORY_LABELS: Record<string, string> = {
                  Vivienda: '🏠 Vivienda',
                  Alimentacion: '🛒 Alimentación',
                  Ocio: '🎉 Ocio / Bienestar',
                  Trabajo: '💼 Trabajo / Negocios',
                  Vehiculos: '🚗 Vehículos / Transporte',
                  Inversion: '📈 Inversión / Ahorro activo',
                  Regalos: '🎁 Regalos / Donaciones',
                  Ropa: '👕 Ropa / Calzado',
                  Ahorro: '🛡️ Ahorro Directo / Reservas',
                };

                return CLASSIFICATIONS.map((cat) => {
                  const hasAnyValue = summaries.some((s) => (s.expensesByCategory?.[cat] ?? 0) > 0);
                  if (!hasAnyValue) return null; // Only show categories with actual records to avoid cluttering

                  return (
                    <tr key={cat} className="hover:bg-slate-50/50 transition-colors relative">
                      {/* Name */}
                      <td className="p-3.5 pl-4 font-semibold text-slate-700 font-sans">
                        {CATEGORY_LABELS[cat] || cat}
                      </td>

                      {/* Values per year */}
                      {summaries.map((s) => {
                        const yearNeto = s.totalNetoNomina ?? Math.max(0, s.salarioBruto - s.retencionIrpf - s.ssEmpleado - s.retencionCapital);
                        const value = s.expensesByCategory?.[cat] ?? 0;
                        const pct = yearNeto > 0 ? (value / yearNeto) * 100 : 0;

                        return (
                          <td key={s.year} className="p-3.5 text-right font-mono font-bold text-slate-800 relative min-w-[120px]">
                            {/* Visual background proportion bar */}
                            <div 
                              className="absolute right-0.5 top-1 bottom-1 bg-blue-500/5 rounded-l border-r-2 border-blue-500/20 pointer-events-none" 
                              style={{ width: `${Math.min(95, pct)}%` }}
                            />
                            
                            <span className="relative z-1">
                              {tableShowPercentage ? (
                                `${pct.toFixed(1)}%`
                              ) : (
                                `${value.toLocaleString('es-ES', { maximumFractionDigits: 0 })} €`
                              )}
                            </span>
                          </td>
                        );
                      })}

                      {/* Tendencia (Only if there are at least 2 years of data) */}
                      {summaries.length >= 2 && (() => {
                        const prevYearObj = summaries[summaries.length - 2];
                        const currYearObj = summaries[summaries.length - 1];

                        const prevNeto = prevYearObj.totalNetoNomina ?? Math.max(0, prevYearObj.salarioBruto - prevYearObj.retencionIrpf - prevYearObj.ssEmpleado - prevYearObj.retencionCapital);
                        const currNeto = currYearObj.totalNetoNomina ?? Math.max(0, currYearObj.salarioBruto - currYearObj.retencionIrpf - currYearObj.ssEmpleado - currYearObj.retencionCapital);

                        const prevVal = prevYearObj.expensesByCategory?.[cat] ?? 0;
                        const currVal = currYearObj.expensesByCategory?.[cat] ?? 0;

                        const prevPct = prevNeto > 0 ? (prevVal / prevNeto) * 100 : 0;
                        const currPct = currNeto > 0 ? (currVal / currNeto) * 100 : 0;

                        const changeVal = currVal - prevVal;
                        const changePct = currPct - prevPct;

                        const isDecreased = tableShowPercentage ? changePct < -0.1 : changeVal < -1;
                        const isIncreased = tableShowPercentage ? changePct > 0.1 : changeVal > 1;

                        if (isDecreased) {
                          return (
                            <td className="p-3.5 text-center shrink-0">
                              <span className="inline-flex items-center gap-1 font-sans font-bold text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-full px-2 py-0.5">
                                <ArrowDownRight className="w-3 h-3" />
                                <span>-{tableShowPercentage ? `${Math.abs(changePct).toFixed(1)}%` : `${Math.abs(changeVal).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€`}</span>
                              </span>
                            </td>
                          );
                        } else if (isIncreased) {
                          return (
                            <td className="p-3.5 text-center shrink-0">
                              <span className="inline-flex items-center gap-1 font-sans font-bold text-[10px] text-rose-600 bg-rose-50 border border-rose-100 rounded-full px-2 py-0.5">
                                <ArrowUpRight className="w-3 h-3" />
                                <span>+{tableShowPercentage ? `${Math.abs(changePct).toFixed(1)}%` : `${Math.abs(changeVal).toLocaleString('es-ES', { maximumFractionDigits: 0 })}€`}</span>
                              </span>
                            </td>
                          );
                        } else {
                          return (
                            <td className="p-3.5 text-center text-slate-400 font-mono text-[10px] shrink-0">
                              <span className="inline-flex items-center gap-1 bg-slate-100 rounded-full px-2 py-0.5 font-bold">
                                <ArrowRight className="w-3 h-3" />
                                <span>Estable</span>
                              </span>
                            </td>
                          );
                        }
                      })()}
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
