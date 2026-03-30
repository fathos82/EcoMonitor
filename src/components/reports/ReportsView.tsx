import React, { useMemo } from 'react';
import { Activity, AlertTriangle, BarChart, Calendar, CheckCircle2, Droplets, Leaf } from 'lucide-react';
import { Bar, BarChart as RechartsBar, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Plant } from '../../types';

interface ReportsViewProps {
  plants: Plant[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ plants }) => {
  const safePlants = plants || [];

  const comparativeData = useMemo(() => {
    return safePlants.map(p => ({
      name: p.name,
      umidade: p.lastHumidity || 0,
      luz: Math.floor(Math.random() * 50) + 50
    }));
  }, [safePlants]);

  if (safePlants.length === 0) {
    return (
      <div className="max-w-6xl mx-auto p-8 text-center animate-in fade-in duration-500">
        <div className="bg-stone-100 rounded-3xl p-12 flex flex-col items-center border border-stone-200">
          <Leaf size={48} className="text-stone-300 mb-4" />
          <h2 className="text-xl font-bold text-stone-600">Sem dados para relatório</h2>
          <p className="text-stone-400 mt-2">Adicione plantas para visualizar as métricas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="mb-4 md:mb-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-stone-800">Relatórios</h1>
        <p className="text-xs md:text-base text-stone-500 mt-1">Visão geral e alertas</p>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-stone-100 shadow-lg shadow-stone-200/50 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <div className="p-2 md:p-4 bg-emerald-100 text-emerald-600 rounded-xl md:rounded-2xl">
            <CheckCircle2 size={20} className="md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-stone-500 text-[10px] md:text-sm font-bold uppercase">Saúde Geral</p>
            <p className="text-xl md:text-3xl font-bold text-stone-800">92%</p>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-stone-100 shadow-lg shadow-stone-200/50 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <div className="p-2 md:p-4 bg-blue-100 text-blue-600 rounded-xl md:rounded-2xl">
            <Droplets size={20} className="md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-stone-500 text-[10px] md:text-sm font-bold uppercase">Econ. Água</p>
            <p className="text-xl md:text-3xl font-bold text-stone-800">12.5L</p>
          </div>
        </div>

        <div className="col-span-2 md:col-span-1 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-stone-100 shadow-lg shadow-stone-200/50 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
          <div className="p-2 md:p-4 bg-amber-100 text-amber-600 rounded-xl md:rounded-2xl">
            <AlertTriangle size={20} className="md:w-8 md:h-8" />
          </div>
          <div>
            <p className="text-stone-500 text-[10px] md:text-sm font-bold uppercase">Alertas Hoje</p>
            <p className="text-xl md:text-3xl font-bold text-stone-800">1</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl border border-stone-100 shadow-xl shadow-stone-200/50">
        <h3 className="text-base md:text-lg font-bold text-stone-800 mb-4 md:mb-6 flex items-center gap-2">
          <Activity size={18} className="text-emerald-600" />
          Comparativo de Umidade (%)
        </h3>
        <div className="h-48 md:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBar data={comparativeData} layout="vertical" margin={{ left: 0, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#57534e', fontSize: 10, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f5f5f4' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
              />
              <Bar dataKey="umidade" radius={[0, 4, 4, 0]} barSize={24}>
                {comparativeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.umidade < 40 ? '#f59e0b' : '#10b981'} />
                ))}
              </Bar>
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-stone-50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-stone-200">
        <h3 className="text-base md:text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-stone-500" />
          Eventos Recentes
        </h3>
        <div className="space-y-2 md:space-y-3">
          {[
            { time: '10:30', msg: 'Irrigação auto (Manjericão)', type: 'info' },
            { time: '08:15', msg: 'Umidade baixa (Jiboia)', type: 'warning' },
            { time: 'Ontem', msg: 'Sistema reiniciado', type: 'success' },
          ].map((log, i) => (
            <div key={i} className="flex gap-3 items-center p-3 bg-white rounded-xl border border-stone-100 shadow-sm">
              <span className="text-[10px] md:text-xs font-bold text-stone-400 min-w-[40px]">{log.time}</span>
              <p className={`text-xs md:text-sm font-medium leading-tight ${log.type === 'warning' ? 'text-amber-700' : 'text-stone-700'}`}>
                {log.msg}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};