import React from 'react';

interface PartitionsChartProps {
  bruto: number;
  retencionesIrpf: number;
  ssEmpleado: number;
  ssEmpresa: number;
  neto: number;
}

export const PartitionsChart: React.FC<PartitionsChartProps> = ({
  bruto,
  retencionesIrpf,
  ssEmpleado,
  ssEmpresa,
  neto,
}) => {
  if (bruto <= 0) {
    return (
      <div className="flex flex-col items-center justify-center p-6 h-48 bg-slate-50 rounded-lg border border-dashed border-slate-200">
        <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">
          Sin detalles disponibles
        </span>
        <span className="text-slate-400 text-xxs mt-1 text-center max-w-[200px]">
          Introduce ingresos en el salario base o beneficios para generar la partición.
        </span>
      </div>
    );
  }

  // Segment values (guaranteed positive or zero)
  const vIrpf = Math.max(0, retencionesIrpf);
  const vSsEmp = Math.max(0, ssEmpleado);
  const vSsCom = Math.max(0, ssEmpresa);
  const vNeto = Math.max(0, neto);

  const total = vIrpf + vSsEmp + vSsCom + vNeto;
  if (total <= 0) {
    return (
      <div className="flex items-center justify-center h-48 text-slate-400 text-xs font-mono">
        No hay datos detallados
      </div>
    );
  }

  // Calculate percentages
  const pctIrpf = (vIrpf / bruto) * 100;
  const pctSsEmp = (vSsEmp / bruto) * 100;
  const pctSsCom = (vSsCom / bruto) * 100;
  const pctNeto = (vNeto / bruto) * 100;

  // State for hover interactive tooltip
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = React.useState<{ x: number; y: number } | null>(null);

  // Render variables for donut chart (Radius = 70, Circumference = 2 * PI * R = 439.82)
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.822

  const segments = [
    { label: 'Recibido (Neto)', value: vNeto, pct: pctNeto, color: '#2563eb' }, // blue-600
    { label: 'Retenciones IRPF', value: vIrpf, pct: pctIrpf, color: '#f43f5e' }, // rose-500
    { label: 'SS Empleado', value: vSsEmp, pct: pctSsEmp, color: '#f59e0b' }, // amber-500
    { label: 'SS Empresa', value: vSsCom, pct: pctSsCom, color: '#475569' }, // slate-600
  ];

  let accumulatedPercentage = 0;

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

  return (
    <div className="flex flex-col md:flex-row items-center gap-6 justify-center p-4 relative">
      {/* SVG Donut */}
      <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
          <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="16" />
          {segments.map((seg, idx) => {
            if (seg.value <= 0) return null;
            const segmentPercentage = seg.value / total;
            const strokeDasharray = `${segmentPercentage * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedPercentage) * circumference);
            accumulatedPercentage += segmentPercentage;

            const isHovered = hoveredIdx === idx;

            return (
              <circle
                key={idx}
                cx="80"
                cy="80"
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={isHovered ? "20" : "16"}
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
          })}
        </svg>

        {/* Center label */}
        <div className="absolute text-center px-4 pointer-events-none select-none max-w-full">
          {hoveredIdx !== null ? (
            <>
              <span 
                className="block text-[9px] font-bold uppercase tracking-wider transition-colors duration-150"
                style={{ color: segments[hoveredIdx].color }}
              >
                {segments[hoveredIdx].label === 'Recibido (Neto)' ? 'Neto Recibido' : segments[hoveredIdx].label}
              </span>
              <span className="block text-xs font-bold font-mono text-slate-800 mt-0.5">
                {segments[hoveredIdx].value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </span>
              <span className="block text-[10px] font-bold text-slate-500 font-mono mt-0.5">
                {segments[hoveredIdx].pct.toFixed(1)}%
              </span>
            </>
          ) : (
            <>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Total Bruto
              </span>
              <span className="block text-xs font-bold font-mono text-slate-800 mt-0.5">
                {bruto.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Simplified Compact Legend */}
      <div className="flex-1 flex flex-row md:flex-col flex-wrap md:flex-nowrap justify-center gap-x-4 gap-y-2 text-[11px] w-full max-w-xs md:max-w-[160px]">
        {segments.map((seg, idx) => {
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
        })}
      </div>

      {/* Floating Tooltip */}
      {hoveredIdx !== null && tooltipPos && (
        <div
          className="absolute z-10 bg-slate-900/95 text-white text-[11px] font-sans rounded-lg py-1.5 px-2.5 shadow-md pointer-events-none space-y-0.5 border border-slate-800/50 backdrop-blur-xs font-medium"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <div className="font-bold text-slate-300">{segments[hoveredIdx].label}</div>
          <div className="font-mono text-white flex items-center gap-1.5">
            <span>{segments[hoveredIdx].value.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
            <span style={{ color: segments[hoveredIdx].color }} className="font-bold">({segments[hoveredIdx].pct.toFixed(1)}%)</span>
          </div>
        </div>
      )}
    </div>
  );
};
