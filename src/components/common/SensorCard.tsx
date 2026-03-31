import React, { useMemo } from 'react';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
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

  // 1. LIMITAR NÚMERO DE PONTOS (A única lógica mantida)
  const chartData = useMemo(() => {
    const envString =
        (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAX_CHART_POINTS) ||
        (typeof process !== 'undefined' && process.env?.REACT_APP_MAX_CHART_POINTS);
    const MAX_POINTS = envString ? Number(envString) : 1000;

    // Pega os últimos X pontos do que vier no "data"
    return data.slice(-MAX_POINTS);
  }, [data]);

  // 2. Cálculos básicos de estatísticas (direto do array bruto)
  const stats = useMemo(() => {
    if (data.length === 0) return { max: 0, min: 0, avg: 0 };
    const values = data.map(d => Number(d[dataKey as keyof DataPoint]) || 0);
    return {
      max: Math.round(Math.max(...values)),
      min: Math.round(Math.min(...values)),
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length)
    };
  }, [data, dataKey]);

  // Cores
  const getColorConfig = (c: string) => {
    const configs: any = {
      green: { hex: '#10b981', text: 'text-emerald-600', bg: 'bg-emerald-100' },
      blue: { hex: '#06b6d4', text: 'text-cyan-600', bg: 'bg-cyan-100' },
      orange: { hex: '#f97316', text: 'text-orange-600', bg: 'bg-orange-100' },
      yellow: { hex: '#eab308', text: 'text-yellow-600', bg: 'bg-yellow-100' },
    };
    return configs[c] || configs.green;
  };

  const colors = getColorConfig(color);
  const lastPoint = data[data.length - 1];
  const displayValue = lastPoint ? Number(lastPoint[dataKey as keyof DataPoint]).toFixed(1) : '--';

  // Configuração do Gráfico
  const series = [{
    name: title,
    data: chartData.map(d => [Number(d.time), Number(d[dataKey as keyof DataPoint])])
  }];

  const options: ApexOptions = {
    chart: {
      type: 'area',
      fontFamily: 'inherit',
      animations: { enabled: false },
      toolbar: {
        show: true,
        autoSelected: 'pan',
        tools: {
          download: false,
          selection: false,
          zoom: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78716c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>',
          zoomin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78716c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>',
          zoomout: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78716c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>',
          pan: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78716c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M19 9l3 3-3 3M9 19l3 3 3-3M2 12h20M12 2v20"/></svg>',
          reset: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#78716c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>'
        }
      },
      zoom: { enabled: true, type: 'x', autoScaleYaxis: true }
    },
    colors: [colors.hex],
    fill: { type: 'gradient', gradient: { opacityFrom: 0.4, opacityTo: 0 } },
    dataLabels: { enabled: false },
    stroke: { curve: 'straight', width: 2 },
    xaxis: {
      type: 'datetime',
      labels: { datetimeUTC: false, style: { colors: '#a8a29e', fontSize: '10px' } },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      min: 0,
      max: 50,
      tickAmount: 5,
      labels: {
        formatter: (val) => val.toFixed(1),
        style: { colors: '#78716c', fontSize: '10px' }
      }
    },
    grid: { borderColor: '#f5f5f4', strokeDashArray: 3 },
    tooltip: { theme: 'light', x: { format: 'HH:mm:ss' } }
  };

  return (
      <div className="w-full bg-white rounded-3xl overflow-hidden shadow-lg border border-stone-100 flex flex-col">
        <div className="p-6 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl ${colors.bg}`}>
              <Icon className={`w-6 h-6 ${colors.text}`} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800 leading-tight">{title}</h3>
              <p className="text-xs text-stone-500 font-medium">Tempo Real</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-stone-800">
              {displayValue}
              <span className={`text-lg ${colors.text} ml-1`}>{unit}</span>
            </p>
          </div>
        </div>

        <div className="h-72 w-full mt-4 px-2">
          {data.length > 0 ? (
              <Chart options={options} series={series} type="area" height="100%" width="100%" />
          ) : (
              <div className="h-full w-full flex items-center justify-center text-stone-400 text-sm">
                Aguardando dados brutos...
              </div>
          )}
        </div>

        <div className="p-6 bg-stone-50 mt-auto border-t border-stone-100">
          <div className="flex gap-2 justify-between">
            <StatBox label="Pico" value={stats.max} unit={unit} type="max" colorClass={colors.text} />
            <StatBox label="Méd" value={stats.avg} unit={unit} type="avg" colorClass={colors.text} />
            <StatBox label="Mín" value={stats.min} unit={unit} type="min" colorClass={colors.text} />
          </div>
        </div>
      </div>
  );
};