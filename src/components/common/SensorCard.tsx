import React, { useMemo } from 'react';
import { Area, AreaChart, Brush, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DataPoint } from '../../types';
import { StatBox } from './StatBox';

interface SensorCardProps {
  title: string;
  icon: React.ElementType;
  data: DataPoint[];
  color: string;
  unit: string;
  dataKey: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({ title, icon: Icon, data, color, unit, dataKey }) => {
  const stats = useMemo(() => {
    if (!data || data.length === 0) return { max: 0, min: 0, avg: 0 };
    const values = data.map(d => d[dataKey as keyof DataPoint] as number);
    const max = Math.max(...values);
    const min = Math.min(...values);
    const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    return { max, min, avg };
  }, [data, dataKey]);

  const getColorConfig = (c: string) => {
    switch (c) {
      case 'green': return { stroke: '#059669', fill: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-100' };
      case 'blue': return { stroke: '#0891b2', fill: '#06b6d4', text: 'text-cyan-600', bg: 'bg-cyan-100' };
      case 'orange': return { stroke: '#ea580c', fill: '#f97316', text: 'text-orange-600', bg: 'bg-orange-100' };
      case 'yellow': return { stroke: '#ca8a04', fill: '#eab308', text: 'text-yellow-600', bg: 'bg-yellow-100' };
      default: return { stroke: '#059669', fill: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-100' };
    }
  };

  const colors = getColorConfig(color);
  const gradientId = `color${title.replace(/\s/g, '')}`;

  return (
    <div className="w-full bg-white rounded-2xl md:rounded-3xl overflow-hidden shadow-lg shadow-stone-200/50 border border-stone-100 flex flex-col">
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
        <div className="text-right">
          <p className="text-xl md:text-3xl font-bold text-stone-800">
            {data[data.length - 1]?.[dataKey as keyof DataPoint]}
            <span className={`text-xs md:text-lg ${colors.text} ml-1`}>{unit}</span>
          </p>
        </div>
      </div>

      <div className="h-40 md:h-56 w-full mt-2 md:mt-4 px-2 md:px-4 pb-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.fill} stopOpacity={0.2} />
                <stop offset="95%" stopColor={colors.fill} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="time" hide />
            <YAxis tick={{ fill: '#78716c', fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#44403c', fontWeight: 'bold' }}
              labelFormatter={(label) => `Tempo: ${label}h`}
            />
            <Area type="monotone" dataKey={dataKey} stroke={colors.stroke} strokeWidth={2} fillOpacity={1} fill={`url(#${gradientId})`} animationDuration={1000} />
            <Brush dataKey="time" height={12} stroke={colors.stroke} fill="#f5f5f4" tickFormatter={() => ""} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="p-3 md:p-6 pt-2 md:pt-4 bg-stone-50 mt-auto border-t border-stone-100">
        <div className="flex gap-2 justify-between">
          <StatBox label="Pico" value={stats.max} unit={unit} type="max" colorClass={colors.text} />
          <StatBox label="Méd" value={stats.avg} unit={unit} type="avg" colorClass={colors.text} />
          <StatBox label="Mín" value={stats.min} unit={unit} type="min" colorClass={colors.text} />
        </div>
      </div>
    </div>
  );
};