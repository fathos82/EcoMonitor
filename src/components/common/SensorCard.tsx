import React, { useMemo, useState } from 'react';
import {
  Area, AreaChart, CartesianGrid,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Expand, History, WifiOff, X } from 'lucide-react';
import type { DataPoint } from '../../types';
import { StatBox } from './StatBox';
import { HistoryModal } from './HistoryModal';
import { TELEMETRY_CONFIG } from '../../config/telemetry';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SensorCardProps {
  title:         string;
  icon:          React.ElementType;
  data:          DataPoint[];
  color:         string;
  unit:          string;
  measurementId: number;
  connected?:    boolean;
}

// ─── Paleta ───────────────────────────────────────────────────────────────────

const COLOR_CONFIG: Record<string, {
  stroke: string; fill: string;
  text: string;  bg: string; btnBg: string;
}> = {
  green:  { stroke: '#059669', fill: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-100', btnBg: 'hover:bg-emerald-50 text-emerald-500'  },
  blue:   { stroke: '#0891b2', fill: '#06b6d4', text: 'text-cyan-600',    bg: 'bg-cyan-100',    btnBg: 'hover:bg-cyan-50 text-cyan-500'          },
  orange: { stroke: '#ea580c', fill: '#f97316', text: 'text-orange-600',  bg: 'bg-orange-100',  btnBg: 'hover:bg-orange-50 text-orange-500'      },
  yellow: { stroke: '#ca8a04', fill: '#eab308', text: 'text-yellow-600',  bg: 'bg-yellow-100',  btnBg: 'hover:bg-yellow-50 text-yellow-500'      },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtTime = (ts: number) =>
    new Date(ts).toLocaleTimeString('pt-BR', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    });

function computeStats(data: DataPoint[]) {
  if (!data || data.length === 0) return { max: 0, min: 0, avg: 0 };

  let max = -Infinity, min = Infinity, sum = 0;

  for (const d of data) {
    if (d.value > max) max = d.value;
    if (d.value < min) min = d.value;
    sum += d.value;
  }

  return {
    max: Number(max.toFixed(2)),
    min: Number(min.toFixed(2)),
    avg: Number((sum / data.length).toFixed(2))
  };
}

// ─── Gráfico reutilizável ────────────────────────────────────────────────────

interface ChartProps {
  data:       DataPoint[];
  colors:     typeof COLOR_CONFIG[string];
  unit:       string;
  gradientId: string;
  /** Quantos ticks no eixo X (mais ticks no modal expandido) */
  tickGap?:   number;
  /** Altura do container — controlada pelo pai */
  height?:    number;
}

const LiveChart: React.FC<ChartProps> = ({
                                           data, colors, unit, gradientId, tickGap = 60, height = 192,
                                         }) => {
  const xDomain = useMemo<[number | string, number | string]>(() => {
    if (data.length < 2) return ['dataMin', 'dataMax'];
    return [data[0].time, data[data.length - 1].time];
  }, [data]);

  return (
      <div style={{ height, width: '100%', transform: 'translateZ(0)', willChange: 'opacity' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
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
                domain={xDomain}
                tickFormatter={fmtTime}
                tick={{ fill: '#78716c', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                minTickGap={tickGap}
            />
            <YAxis
                tick={{ fill: '#78716c', fontSize: 9 }}
                axisLine={false}
                tickLine={false}

                tickFormatter={(v) => Number(v.toFixed(1)).toString()}
                domain={['auto', 'auto']}
                padding={{ top: 8, bottom: 4 }}
            />
            <Tooltip
                contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', fontSize: '11px' }}
                itemStyle={{ color: '#44403c', fontWeight: 'bold' }}
                labelFormatter={(l) => fmtTime(l as number)}
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
  );
};

// ─── Modal de expansão (tempo real — janela completa) ─────────────────────────

interface ExpandModalProps {
  title:  string;
  unit:   string;
  color:  string;
  data:   DataPoint[];
  onClose: () => void;
}

const ExpandModal: React.FC<ExpandModalProps> = ({ title, unit, color, data, onClose }) => {
  const colors     = COLOR_CONFIG[color] ?? COLOR_CONFIG.green;
  const gradientId = `expand_${title.replace(/\s/g, '')}`;
  const stats      = computeStats(data);

  return (
      <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white w-full md:max-w-5xl md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300">

          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-stone-100">
            <div>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Tempo Real — Janela Completa</p>
              <h2 className={`text-lg font-extrabold ${colors.text}`}>{title}</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Stats */}
          {data.length > 0 && (
              <div className="px-5 py-3 grid grid-cols-4 gap-2 border-b border-stone-100">
                {[
                  { label: 'Pico',     value: stats.max },
                  { label: 'Mínimo',  value: stats.min },
                  { label: 'Média',   value: stats.avg },
                  { label: 'Pontos',  value: data.length, noUnit: true },
                ].map(({ label, value, noUnit }) => (
                    <div key={label} className="text-center">
                      <p className="text-[10px] font-bold text-stone-400 uppercase">{label}</p>
                      <p className={`text-base font-extrabold ${colors.text}`}>
                        {noUnit ? value : (value as number).toFixed(1)}
                        {!noUnit && <span className="text-xs font-normal ml-0.5">{unit}</span>}
                      </p>
                    </div>
                ))}
              </div>
          )}

          {/* Gráfico expandido */}
          <div className="flex-1 min-h-0 px-4 py-4">
            {data.length === 0 ? (
                <div className="h-full flex items-center justify-center text-stone-400 text-sm italic">
                  Aguardando dados em tempo real…
                </div>
            ) : (
                <LiveChart
                    data={data}
                    colors={colors}
                    unit={unit}
                    gradientId={gradientId}
                    tickGap={30}
                    height={360}
                />
            )}
          </div>
        </div>
      </div>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────

export const SensorCard: React.FC<SensorCardProps> = ({
                                                        title, icon: Icon, data, color, unit, measurementId, connected,
                                                      }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showExpand,  setShowExpand]  = useState(false);

  const colors     = COLOR_CONFIG[color] ?? COLOR_CONFIG.green;
  const gradientId = `rt_${title.replace(/\s/g, '')}`;

  const { compactPoints } = TELEMETRY_CONFIG;

  const cardData     = useMemo(() => data.slice(-compactPoints), [data, compactPoints]);
  const expandedData = data;
  const stats    = useMemo(() => computeStats(cardData), [cardData]);
  const lastValue = data.at(-1)?.value;
  const isEmpty   = data.length === 0;

  const xDomain = useMemo<[number | string, number | string]>(() => {
    if (cardData.length < 2) return ['dataMin', 'dataMax'];
    return [cardData[0].time, cardData[cardData.length - 1].time];
  }, [cardData]);

  return (
      <>
        <div className="w-full bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-lg shadow-stone-200/50 border border-stone-100 flex flex-col">

          {/* ── Header ───────────────────────────────────────────── */}
          <div className="p-4 md:p-6 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${colors.bg}`}>
                <Icon className={`w-5 h-5 md:w-6 md:h-6 ${colors.text}`} />
              </div>
              <div>
                <h3 className="text-sm md:text-lg font-bold text-stone-800 leading-tight">{title}</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {connected === true && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Ao Vivo
                  </span>
                  )}
                  {connected === false && (
                      <span className="flex items-center gap-1 text-[9px] font-bold text-stone-400 uppercase tracking-wider">
                    <WifiOff size={10} /> Offline
                  </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-xl md:text-3xl font-bold text-stone-800" style={{ transition: 'all 200ms ease-out' }}>
                {lastValue != null ? lastValue.toFixed(1) : '—'}
                <span className={`text-xs md:text-lg ${colors.text} ml-1`}>{unit}</span>
              </p>

              {/* Expandir janela de tempo real */}
              <button
                  onClick={() => setShowExpand(true)}
                  title="Expandir gráfico"
                  className={`p-2 rounded-xl transition-colors ${colors.btnBg}`}
              >
                <Expand size={16} />
              </button>

              {/* Histórico */}
              {measurementId > 0 && (
                  <button
                      onClick={() => setShowHistory(true)}
                      title="Ver histórico"
                      className={`p-2 rounded-xl transition-colors ${colors.btnBg}`}
                  >
                    <History size={17} />
                  </button>
              )}
            </div>
          </div>

          {/* ── Gráfico compacto (últimos 60 pts) ───────────────── */}
          <div
              className="h-36 md:h-48 w-full mt-1 md:mt-3 px-2 md:px-4 pb-2"
              style={{ transition: 'opacity 150ms ease-out', transform: 'translateZ(0)', willChange: 'opacity' }}
          >
            {isEmpty ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-xs text-stone-300 italic">Aguardando dados…</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={cardData} margin={{ top: 8, right: 0, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={colors.fill} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={colors.fill} stopOpacity={0}   />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis
                        dataKey="time" type="number" scale="time" domain={xDomain}
                        tickFormatter={fmtTime} tick={{ fill: '#78716c', fontSize: 9 }}
                        axisLine={false} tickLine={false} minTickGap={60}
                    />
                    <YAxis
                        tick={{ fill: '#78716c', fontSize: 9 }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => Number(v.toFixed(1)).toString()}
                        domain={['auto', 'auto']} padding={{ top: 8, bottom: 4 }}
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', fontSize: '11px' }}
                        itemStyle={{ color: '#44403c', fontWeight: 'bold' }}
                        labelFormatter={(l) => fmtTime(l as number)}
                        formatter={(v: number) => [`${v.toFixed(1)}${unit}`, 'Valor']}
                    />
                    <Area
                        type="monotone" dataKey="value"
                        stroke={colors.stroke} strokeWidth={2}
                        fillOpacity={1} fill={`url(#${gradientId})`}
                        isAnimationActive={false} dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
            )}
          </div>

          {/* ── Stats ────────────────────────────────────────────── */}
          <div className="p-3 md:p-6 pt-2 md:pt-4 bg-stone-50 mt-auto border-t border-stone-100">
            <div className="flex gap-2 justify-between">
              <StatBox label="Pico" value={stats.max} unit={unit} type="max" colorClass={colors.text} />
              <StatBox label="Méd"  value={stats.avg} unit={unit} type="avg" colorClass={colors.text} />
              <StatBox label="Mín"  value={stats.min} unit={unit} type="min" colorClass={colors.text} />
            </div>
          </div>
        </div>

        {/* Modal: janela completa de tempo real */}
        {showExpand && (
            <ExpandModal
                title={title}
                unit={unit}
                color={color}
                data={expandedData}
                onClose={() => setShowExpand(false)}
            />
        )}

        {/* Modal: histórico */}
        {showHistory && measurementId > 0 && (
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