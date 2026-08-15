import { useState, useCallback } from 'react';
import type { DataPoint } from '../types';
import { measurementService, type HistoryResult } from '../services/measurementService';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type QuickRange = '1H' | '24H' | '7D';

export interface HistoryFilter {
    range:     QuickRange | 'custom';
    startDate: string;
    endDate:   string;
}

export interface UseHistoryResult {
    points:    DataPoint[];
    stats:     { min: number | null; max: number | null; avg: number | null } | null;
    loading:   boolean;
    error:     string | null;
    filter:    HistoryFilter;
    setFilter: (f: HistoryFilter) => void;
    fetch:     (measurementId: number, f?: HistoryFilter) => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildDates(range: QuickRange | 'custom', startDate: string, endDate: string) {
    if (range === 'custom') return { start: startDate, end: endDate };
    const end   = new Date();
    const start = new Date(end);
    if (range === '1H')  start.setHours(end.getHours() - 1);
    if (range === '24H') start.setDate(end.getDate() - 1);
    if (range === '7D')  start.setDate(end.getDate() - 7);
    return { start: start.toISOString(), end: end.toISOString() };
}

function defaultFilter(): HistoryFilter {
    const end   = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 1);
    return { range: '24H', startDate: start.toISOString(), endDate: end.toISOString() };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useHistory(): UseHistoryResult {
    const [points,  setPoints]  = useState<DataPoint[]>([]);
    const [stats,   setStats]   = useState<{ min: number | null; max: number | null; avg: number | null } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState<string | null>(null);
    const [filter,  setFilter]  = useState<HistoryFilter>(defaultFilter);

    const fetch = useCallback(async (measurementId: number, f?: HistoryFilter) => {
        const active = f ?? filter;
        const { start, end } = buildDates(active.range, active.startDate, active.endDate);

        setLoading(true);
        setError(null);

        try {
            const result: HistoryResult = await measurementService.getHistory(measurementId, start, end);
            setPoints(result.points);
            setStats({ min: result.min, max: result.max, avg: result.avg });
        } catch (e: any) {
            setError(e.response?.data?.message ?? e.message ?? 'Erro ao carregar histórico');
            setPoints([]);
            setStats(null);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    return { points, stats, loading, error, filter, setFilter, fetch };
}