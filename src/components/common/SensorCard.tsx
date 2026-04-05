import React, { useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { History } from 'lucide-react';
import type { DataPoint } from '../../types';
import { StatBox } from './StatBox';
import { HistoryModal } from './HistoryModal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface SensorCardProps {
  title:         string;
  icon:          React.ElementType;
  data:          DataPoint[];
  color:         string;
  unit:          string;
  measurementId: number;   // necessário para buscar histórico
}

// ─── Cores ────────────────────────────────────────────────────────────────────

const COLOR_CONFIG: Record<string, { stroke: string; fill: string; text: string; bg: string; btnBg: string }> = {
  green:  { stroke: '#059669', fill: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-100', btnBg: 'hover:bg-emerald-50 text-emerald-500' },
  blue:   { stroke: '#0891b2', fill: '#06b6d4', text: 'text-cyan-600',    bg: 'bg-cyan-100',    btnBg: 'hover:bg-cyan-50 text-cyan-500'       },
  orange: { stroke: '#ea580c', fill: '#f97316', text: 'text-orange-600',  bg: 'bg-orange-100',  btnBg: 'hover:bg-orange-50 text-orange-500'   },
  yellow: { stroke: '#ca8a04', fill: '#eab308', text: 'text-yellow-600',  bg: 'bg-yellow-100',  btnBg: 'hover:bg-yellow-50 text-yellow-500'   },
};

// ─── Componente ───────────────────────────────────────────────────────────────

export const SensorCard: React.FC<SensorCardProps> = ({
                                                        title, icon: Icon, data, color, unit, measurementId,
                                                      }) => {
  const [showHistory, setShowHistory] = useState(false);

  const colors = COLOR_CONFIG[color] ?? COLOR_CONFIG.green;
  const gradientId = `rt_${title.replace(/\s/g, '')}`;

  const stats = useMemo(() => {
    if (!data || data.length === 0) return { max: 0, min: 0, avg: 0 };
    let max = -Infinity, min = Infinity, sum = 0;
    for (const d of data) {
      if (d.value > max) max = d.value;
      if (d.value < min) min = d.value;
      sum += d.value;
    }
    return { max, min, avg: Math.round(sum / data.length) };
  }, [data]);

  const lastValue = data[data.length - 1]?.value;
  const fmtTime   = (ts: number) =>
      new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
      <>
        <div className="w-full bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-lg shadow-stone-200/50 border border-stone-100 flex flex-col">

          {/* ── Header ──────────────────────────────────────────────── */}
          <div className="p-4 md:p-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${colors.bg}`}>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${colors.text}`} />
              </div>
              <div>
                <h3 className="text-sm md:text-lg font-bold text-stone-800 leading-tight">{title}</h3>
                <p className="text-[10px] md:text-xs text-stone-500 font-medium">Tempo Real</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Valor atual */}
              <p className="text-xl md:text-3xl font-bold text-stone-800">
                {lastValue != null ? lastValue.toFixed(1) : '—'}
                <span className={`text-xs md:text-lg ${colors.text} ml-1`}>{unit}</span>
              </p>
              {/* Botão histórico */}
              <button
                  onClick={() => setShowHistory(true)}
                  title="Ver histórico"
                  className={`p-2 rounded-xl transition-colors ${colors.btnBg}`}
              >
                <History size={17} />
              </button>
            </div>
          </div>

          {/* ── Gráfico tempo real ───────────────────────────────────── */}
          <div className="h-36 md:h-48 w-full mt-1 md:mt-3 px-2 md:px-4 pb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 8, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={colors.fill} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={colors.fill} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                    dataKey="time"
                    type="number"
                    scale="time"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={fmtTime}
                    tick={{ fill: '#78716c', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={50}
                />
                <YAxis
                    tick={{ fill: '#78716c', fontSize: 9 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => Number(v.toFixed(1)).toString()}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', fontSize: '11px' }}
                    itemStyle={{ color: '#44403c', fontWeight: 'bold' }}
                    labelFormatter={(l) => fmtTime(l)}
                    formatter={(v: number) => [`${v.toFixed(1)}${unit}`, 'Valor']}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={colors.stroke}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#${gradientId})`}
                    isAnimationActive={false}
                    dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* ── Stats ───────────────────────────────────────────────── */}
          <div className="p-3 md:p-6 pt-2 md:pt-4 bg-stone-50 mt-auto border-t border-stone-100">
            <div className="flex gap-2 justify-between">
              <StatBox label="Pico" value={stats.max} unit={unit} type="max" colorClass={colors.text} />
              <StatBox label="Méd"  value={stats.avg} unit={unit} type="avg" colorClass={colors.text} />
              <StatBox label="Mín"  value={stats.min} unit={unit} type="min" colorClass={colors.text} />
            </div>
          </div>
        </div>

        {/* ── Modal de histórico ───────────────────────────────────────── */}
        {showHistory && (
            <HistoryModal
                measurementId={measurementId}
                title={title}
                unit={unit}
                color={color}
                onClose={() => setShowHistory(false)}
            />
        )}
      </>
  );
};