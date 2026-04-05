import React, { useEffect, useRef, useState } from 'react';
import { X, Clock, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import type { DataPoint } from '../../types';
import type { HistoryFilter, QuickRange } from '../../hooks/useHistory';
import { useHistory } from '../../hooks/useHistory';
import { HistoryChart } from './HistoryChart';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface HistoryModalProps {
    measurementId: number;
    title:         string;
    unit:          string;
    color:         string;
    onClose:       () => void;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const QUICK_RANGES: { label: string; value: QuickRange }[] = [
    { label: '1 Hora',  value: '1H'  },
    { label: '24 Horas', value: '24H' },
    { label: '7 Dias',  value: '7D'  },
];

const COLOR_TEXT: Record<string, string> = {
    green:  'text-emerald-600',
    blue:   'text-cyan-600',
    orange: 'text-orange-600',
    yellow: 'text-yellow-600',
};

const COLOR_BG: Record<string, string> = {
    green:  'bg-emerald-600',
    blue:   'bg-cyan-600',
    orange: 'bg-orange-600',
    yellow: 'bg-yellow-600',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toLocalInput(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(local: string): string {
    return new Date(local).toISOString();
}

function computeStats(data: DataPoint[]) {
    if (data.length === 0) return { max: 0, min: 0, avg: 0, count: 0 };
    let max = -Infinity, min = Infinity, sum = 0;
    for (const d of data) {
        if (d.value > max) max = d.value;
        if (d.value < min) min = d.value;
        sum += d.value;
    }
    return { max, min, avg: sum / data.length, count: data.length };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export const HistoryModal: React.FC<HistoryModalProps> = ({
    measurementId, title, unit, color, onClose,
}) => {
    const { data, loading, error, filter, setFilter, fetch } = useHistory();
    const [customStart, setCustomStart] = useState(() => toLocalInput(filter.startDate));
    const [customEnd,   setCustomEnd]   = useState(() => toLocalInput(filter.endDate));
    const overlayRef = useRef<HTMLDivElement>(null);

    // Carrega ao abrir com filtro padrão
    useEffect(() => { fetch(measurementId); }, []);

    // Fecha ao clicar fora do modal
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    const applyRange = (range: QuickRange) => {
        const next: HistoryFilter = { ...filter, range };
        setFilter(next);
        fetch(measurementId, next);
    };

    const applyCustom = () => {
        const next: HistoryFilter = {
            range:     'custom',
            startDate: fromLocalInput(customStart),
            endDate:   fromLocalInput(customEnd),
        };
        setFilter(next);
        fetch(measurementId, next);
    };

    const stats  = computeStats(data);
    const cText  = COLOR_TEXT[color]  ?? COLOR_TEXT.green;
    const cBg    = COLOR_BG[color]    ?? COLOR_BG.green;

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200"
        >
            <div className="bg-white w-full md:max-w-3xl md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh] animate-in slide-in-from-bottom duration-300">

                {/* ── Header ──────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-stone-100">
                    <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Histórico</p>
                        <h2 className={`text-lg font-extrabold ${cText}`}>{title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* ── Filtros ──────────────────────────────────────────────── */}
                <div className="px-5 py-4 space-y-3 border-b border-stone-100">

                    {/* Ranges rápidos */}
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-stone-400 shrink-0" />
                        <div className="flex gap-2">
                            {QUICK_RANGES.map(({ label, value }) => (
                                <button
                                    key={value}
                                    onClick={() => applyRange(value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                        filter.range === value
                                            ? `${cBg} text-white shadow-sm`
                                            : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Período personalizado */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <Calendar size={14} className="text-stone-400 shrink-0" />
                        <div className="flex items-center gap-2 flex-wrap">
                            <input
                                type="datetime-local"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                                className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 outline-none focus:border-stone-400 bg-stone-50 text-stone-700"
                            />
                            <span className="text-stone-300 text-sm">→</span>
                            <input
                                type="datetime-local"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                                className="text-xs border border-stone-200 rounded-lg px-2 py-1.5 outline-none focus:border-stone-400 bg-stone-50 text-stone-700"
                            />
                            <button
                                onClick={applyCustom}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all ${cBg} ${
                                    filter.range === 'custom' ? 'ring-2 ring-offset-1 ring-stone-400' : ''
                                }`}
                            >
                                Aplicar
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── Stats ────────────────────────────────────────────────── */}
                {data.length > 0 && (
                    <div className="px-5 py-3 grid grid-cols-4 gap-2 border-b border-stone-100">
                        {[
                            { label: 'Pico',    value: stats.max },
                            { label: 'Mínimo',  value: stats.min },
                            { label: 'Média',   value: stats.avg },
                            { label: 'Leituras', value: stats.count, noUnit: true },
                        ].map(({ label, value, noUnit }) => (
                            <div key={label} className="text-center">
                                <p className="text-[10px] font-bold text-stone-400 uppercase">{label}</p>
                                <p className={`text-base font-extrabold ${cText}`}>
                                    {noUnit ? value : value.toFixed(1)}
                                    {!noUnit && <span className="text-xs font-normal ml-0.5">{unit}</span>}
                                </p>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Gráfico ──────────────────────────────────────────────── */}
                <div className="flex-1 min-h-0 px-2 py-4">
                    {loading && (
                        <div className="h-full flex items-center justify-center gap-2 text-stone-400 text-sm">
                            <Loader2 size={18} className="animate-spin" /> Carregando...
                        </div>
                    )}
                    {error && !loading && (
                        <div className="h-full flex items-center justify-center gap-2 text-red-500 text-sm">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}
                    {!loading && !error && (
                        <HistoryChart data={data} color={color} unit={unit} />
                    )}
                </div>

            </div>
        </div>
    );
};
