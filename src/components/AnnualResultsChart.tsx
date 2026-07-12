import React from 'react';

interface AnnualResultsChartProps {
  salarioBruto: number;
  retencionIrpfPagado: number;
  ssEmpleadoPagado: number;
  ssEmpresaPagado: number;
  totalPagado: number;
}

export const AnnualResultsChart: React.FC<AnnualResultsChartProps> = ({
  salarioBruto,
  retencionIrpfPagado,
  ssEmpleadoPagado,
  ssEmpresaPagado,
  totalPagado,
}) => {
  const baseGrafico = salarioBruto + ssEmpleadoPagado + ssEmpresaPagado;

  if (baseGrafico <= 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-48 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          Sin datos suficientes
        </span>
        <span className="text-slate-400 text-xxs mt-1 text-center max-w-[220px]">
          Registra nóminas o añade ingresos anuales para ver la distribución de la renta.
        </span>
      </div>
    );
  }

  // Calculate RESTO
  // RESTO = (Salario Bruto + SS Empleado + SS Empresa) - TOTAL (fila 6, Col2 de Borrador Renta)
  const rawResto = baseGrafico - totalPagado;
  const vResto = rawResto < 0 ? 0 : rawResto;

  const vIrpf = Math.max(0, retencionIrpfPagado);
  const vSsEmp = Math.max(0, ssEmpleadoPagado);
  const vSsCom = Math.max(0, ssEmpresaPagado);

  const sumSegments = vIrpf + vSsEmp + vSsCom + vResto;
  if (sumSegments <= 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-xs font-mono">
        No hay datos de distribución
      </div>
    );
  }

  // Percentages relative to BaseGrafico
  const pctIrpf = (vIrpf / baseGrafico) * 100;
  const pctSsEmp = (vSsEmp / baseGrafico) * 100;
  const pctSsCom = (vSsCom / baseGrafico) * 100;
  const pctResto = (vResto / baseGrafico) * 100;

  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.822

  const segments = [
    { label: 'Salario Neto Recibido (Resto)', value: vResto, pct: pctResto, color: '#2563eb' }, // blue-600
    { label: 'Retención IRPF', value: vIrpf, pct: pctIrpf, color: '#f43f5e' }, // rose-500
    { label: 'SS Empleado', value: vSsEmp, pct: pctSsEmp, color: '#f59e0b' }, // amber-500
    { label: 'SS Empresa', value: vSsCom, pct: pctSsCom, color: '#475569' }, // slate-600
  ];

  let accumulatedPercentage = 0;

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 justify-center p-4">
      {/* Donut SVG */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
          {segments.map((seg, idx) => {
            if (seg.value <= 0) return null;
            const segmentPercentage = seg.value / sumSegments;
            const strokeDasharray = `${segmentPercentage * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercentage) * circumference);
            accumulatedPercentage += segmentPercentage;

            return (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="16"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-300 hover:stroke-[18px] cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Center Text */}
        <div className="absolute text-center">
          <span className="block text-[9px] font-semibold uppercase tracking-wider text-slate-400">
            Base Gráfico
          </span>
          <span className="block text-xs font-bold font-mono text-slate-800">
            {baseGrafico.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>

      {/* Legend list */}
      <div className="flex-1 space-y-2 w-full max-w-xs">
        {segments.map((seg, idx) => {
          if (seg.value <= 0) return null;
          return (
            <div key={idx} className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                <span className="font-sans font-medium text-slate-600 leading-tight">{seg.label}</span>
              </div>
              <div className="text-right font-mono font-semibold text-slate-800 shrink-0">
                <span>{seg.value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                <span className="text-[10px] text-slate-400 ml-1.5">({seg.pct.toFixed(1)}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
