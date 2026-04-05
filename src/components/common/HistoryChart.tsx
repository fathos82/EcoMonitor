import React from 'react';
import {
    Area, AreaChart, CartesianGrid, ResponsiveContainer,
    Tooltip, XAxis, YAxis,
} from 'recharts';
import type { DataPoint } from '../../types';

interface HistoryChartProps {
    data:   DataPoint[];
    color:  string;
    unit:   string;
}

const COLOR_MAP: Record<string, { stroke: string; fill: string }> = {
    green:  { stroke: '#059669', fill: '#10b981' },
    blue:   { stroke: '#0891b2', fill: '#06b6d4' },
    orange: { stroke: '#ea580c', fill: '#f97316' },
    yellow: { stroke: '#ca8a04', fill: '#eab308' },
};

function fmt(ts: number) {
    return new Date(ts).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(ts: number) {
    return new Date(ts).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit',
        hour: '2-digit', minute: '2-digit',
    });
}

export const HistoryChart: React.FC<HistoryChartProps> = ({ data, color, unit }) => {
    const c = COLOR_MAP[color] ?? COLOR_MAP.green;

    if (data.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">
                Nenhum dado no período selecionado
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
                <defs>
                    <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={c.fill} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={c.fill} stopOpacity={0}    />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis
                    dataKey="time"
                    type="number"
                    scale="time"
                    domain={['dataMin', 'dataMax']}
                    tickFormatter={fmt}
                    tick={{ fill: '#78716c', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    minTickGap={60}
                />
                <YAxis
                    tick={{ fill: '#78716c', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => Number(v.toFixed(1)).toString()}
                    unit={unit}
                />
                <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e5e7eb', borderRadius: '10px', fontSize: '12px' }}
                    itemStyle={{ color: '#44403c', fontWeight: 'bold' }}
                    labelFormatter={(l) => fmtDate(l)}
                    formatter={(v: number) => [`${v.toFixed(1)}${unit}`, 'Valor']}
                />
                <Area
                    type="monotone"
                    dataKey="value"
                    stroke={c.stroke}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#histGradient)"
                    isAnimationActive={false}
                    dot={false}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
