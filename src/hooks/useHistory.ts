import { useState, useCallback } from 'react';
import type { DataPoint } from '../types';
import { API_URL } from '../config/api';
import { decodeRestHistory } from '../services/telemetryService';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type QuickRange = '1H' | '24H' | '7D';

export interface HistoryFilter {
    range:     QuickRange | 'custom';
    startDate: string;
    endDate:   string;
}

interface UseHistoryResult {
    data:      DataPoint[];
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
    const [data,    setData]    = useState<DataPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error,   setError]   = useState<string | null>(null);
    const [filter,  setFilter]  = useState<HistoryFilter>(defaultFilter);

    const fetch = useCallback(async (measurementId: number, f?: HistoryFilter) => {
        const active = f ?? filter;
        const { start, end } = buildDates(active.range, active.startDate, active.endDate);

        setLoading(true);
        setError(null);

        try {
            const url = `${API_URL}measurements/${measurementId}/history/newprotobuf/`
                + `?start=${encodeURIComponent(start)}`
                + `&end=${encodeURIComponent(end)}`;

            const res = await window.fetch(url, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    Accept: 'application/x-protobuf',
                },
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const buffer = await res.arrayBuffer();
            const points = await decodeRestHistory(buffer);
            setData(points);
        } catch (e: any) {
            setError(e.message ?? 'Erro ao carregar histórico');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, [filter]);

    return { data, loading, error, filter, setFilter, fetch };
}
