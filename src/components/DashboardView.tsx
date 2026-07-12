import React from 'react';
import { TrendingUp, Award, DollarSign, Calendar } from 'lucide-react';

export interface DashboardYearSummary {
  year: number;
  salarioBruto: number;
  retencionIrpf: number;
  retencionCapital: number;
  ssEmpleado: number;
  ssEmpresa: number;
}

interface DashboardViewProps {
  summaries: DashboardYearSummary[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({ summaries }) => {
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
  // Scale should accommodate Salario Bruto as it is the highest value
  const maxBruto = Math.max(...summaries.map((s) => s.salarioBruto), 100);
  const yMax = maxBruto * 1.15; // 15% margin for visual breathing room

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
  const barWidth = 10;
  const barGap = 2;
  const numSeries = 4;
  const groupInnerWidth = numSeries * barWidth + (numSeries - 1) * barGap;

  // Series colors matches guidelines
  const colors = {
    irpf: '#ef4444',     // Red-500
    capital: '#8b5cf6',  // Purple-500 (Retención Capital)
    ssEmpleado: '#f59e0b', // Amber-500
    ssEmpresa: '#3b82f6',  // Blue-500
    line: '#334155',     // Slate-700
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

  // Generate line path coordinates for Salario Bruto
  const linePoints = summaries.map((s, idx) => {
    const x = getXCoord(idx);
    const y = getYCoord(s.salarioBruto);
    return `${x},${y}`;
  });
  const linePathD = linePoints.length > 0 ? `M ${linePoints.join(' L ')}` : '';

  // Calculate quick cards
  const latestSummary = summaries[summaries.length - 1];
  const totalHistoricallyBruto = summaries.reduce((acc, curr) => acc + curr.salarioBruto, 0);
  const totalHistoricallyIrpf = summaries.reduce((acc, curr) => acc + curr.retencionIrpf, 0);

  return (
    <div className="space-y-6" id="dashboard-view-wrapper">
      
      {/* 1. Quick Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="dashboard-stats-row">
        {/* Stat 1: Total bruto */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 border border-emerald-100">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Total Histórico Bruto
            </span>
            <span className="text-base font-extrabold font-mono text-slate-800">
              {totalHistoricallyBruto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
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

        {/* Stat 3: Last active year info */}
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
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm" id="card-dashboard-chart">
        <div className="mb-6 space-y-1">
          <h3 className="font-sans font-bold text-slate-800 text-sm uppercase tracking-wider flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-500" />
            Evolución de Impuestos y Salario Bruto por Ejercicio
          </h3>
          <p className="font-sans text-xs text-slate-400 font-medium">
            Comparativa interanual de retenciones y cotizaciones (barras) frente al bruto acumulado (línea)
          </p>
        </div>

        {/* SVG Container */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[550px] max-w-[800px] mx-auto">
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
                const startX = groupCenterX - groupInnerWidth / 2;

                // Values &Heights
                const irpfHeight = Math.max(0, getYCoord(0) - getYCoord(s.retencionIrpf));
                const capitalHeight = Math.max(0, getYCoord(0) - getYCoord(s.retencionCapital));
                const ssEmpHeight = Math.max(0, getYCoord(0) - getYCoord(s.ssEmpleado));
                const ssComHeight = Math.max(0, getYCoord(0) - getYCoord(s.ssEmpresa));

                return (
                  <g key={s.year}>
                    {/* Tick label under column */}
                    <text
                      x={groupCenterX}
                      y={svgHeight - marginBottom + 18}
                      textAnchor="middle"
                      className="font-mono text-[10px] font-bold fill-slate-500"
                    >
                      Año {s.year}
                    </text>

                    {/* Bar 1: IRPF */}
                    <rect
                      x={startX}
                      y={getYCoord(s.retencionIrpf)}
                      width={barWidth}
                      height={irpfHeight}
                      fill={colors.irpf}
                      rx="2"
                      className="transition-all hover:brightness-95 cursor-pointer"
                    >
                      <title>{`Retención IRPF: ${s.retencionIrpf.toLocaleString('es-ES')} €`}</title>
                    </rect>

                    {/* Bar 2: Retención Capital */}
                    <rect
                      x={startX + barWidth + barGap}
                      y={getYCoord(s.retencionCapital)}
                      width={barWidth}
                      height={capitalHeight}
                      fill={colors.capital}
                      rx="2"
                      className="transition-all hover:brightness-95 cursor-pointer"
                    >
                      <title>{`Retención Capital: ${s.retencionCapital.toLocaleString('es-ES')} €`}</title>
                    </rect>

                    {/* Bar 3: SS Empleado */}
                    <rect
                      x={startX + (barWidth + barGap) * 2}
                      y={getYCoord(s.ssEmpleado)}
                      width={barWidth}
                      height={ssEmpHeight}
                      fill={colors.ssEmpleado}
                      rx="2"
                      className="transition-all hover:brightness-95 cursor-pointer"
                    >
                      <title>{`SS Empleado: ${s.ssEmpleado.toLocaleString('es-ES')} €`}</title>
                    </rect>

                    {/* Bar 4: SS Empresa */}
                    <rect
                      x={startX + (barWidth + barGap) * 3}
                      y={getYCoord(s.ssEmpresa)}
                      width={barWidth}
                      height={ssComHeight}
                      fill={colors.ssEmpresa}
                      rx="2"
                      className="transition-all hover:brightness-95 cursor-pointer"
                    >
                      <title>{`SS Empresa: ${s.ssEmpresa.toLocaleString('es-ES')} €`}</title>
                    </rect>
                  </g>
                );
              })}

              {/* Line chart: Salario Bruto */}
              {numYears > 0 && (
                <>
                  <path
                    d={linePathD}
                    fill="none"
                    stroke={colors.line}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-90 shadow-xs"
                  />
                  {summaries.map((s, idx) => {
                    const x = getXCoord(idx);
                    const y = getYCoord(s.salarioBruto);
                    return (
                      <g key={s.year} className="group cursor-pointer">
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="white"
                          stroke={colors.line}
                          strokeWidth="3"
                          className="transition-all transform hover:scale-125"
                        />
                        {/* Interactive Tooltip bubble */}
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                          <rect
                            x={x - 60}
                            y={y - 32}
                            width="120"
                            height="22"
                            rx="4"
                            fill="#0f172a"
                            className="shadow-md"
                          />
                          <text
                            x={x}
                            y={y - 18}
                            textAnchor="middle"
                            className="font-mono text-[9px] fill-white font-bold"
                          >
                            Bruto: {Math.round(s.salarioBruto).toLocaleString('es-ES')}€
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </>
              )}

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
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 mt-4 border-t border-slate-100 pt-4 text-xs" id="dashboard-chart-legend">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: colors.irpf }} />
            <span className="font-sans font-medium text-slate-600">Retención IRPF</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: colors.capital }} />
            <span className="font-sans font-medium text-slate-600">Retención Capital (0)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: colors.ssEmpleado }} />
            <span className="font-sans font-medium text-slate-600">SS Empleado</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs shrink-0" style={{ backgroundColor: colors.ssEmpresa }} />
            <span className="font-sans font-medium text-slate-600">SS Empresa</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <span className="w-5 h-0.75 shrink-0" style={{ backgroundColor: colors.line }} />
              <span className="w-1.5 h-1.5 rounded-full border border-slate-700 bg-white shrink-0 -ml-3" />
            </div>
            <span className="font-sans font-bold text-slate-700">Salario Bruto Total</span>
          </div>
        </div>
      </div>
    </div>
  );
};
