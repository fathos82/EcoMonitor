import React from 'react';
import {
    X, AlertTriangle, CheckCircle2, Clock,
    Loader2, WifiOff, RefreshCw,
} from 'lucide-react';
import { useSensorErrors } from '../../hooks/useSensorErrors';
import type { Sensor } from '../../types';

interface SensorErrorModalProps {
    sensor:    Sensor;
    onClose:   () => void;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit',
    });
}

export const SensorErrorModal: React.FC<SensorErrorModalProps> = ({
    sensor, onClose,
}) => {
    const { data: errors = [], isLoading, isError, refetch, isFetching } =
        useSensorErrors(sensor.id, true);

    const unresolvedCount = errors.filter(e => !e.resolved).length;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white w-full md:max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in slide-in-from-bottom duration-300">

                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 rounded-xl">
                            <AlertTriangle size={20} className="text-red-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                                Erros do Sensor
                            </p>
                            <h2 className="text-base font-extrabold text-stone-800 leading-tight">
                                {sensor.name}
                            </h2>
                            <p className="text-[10px] text-stone-400 font-mono mt-0.5">{sensor.model}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => refetch()}
                            disabled={isFetching}
                            className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 transition-colors disabled:opacity-50"
                            title="Atualizar"
                        >
                            <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* ── Resumo ─────────────────────────────────────────────── */}
                {!isLoading && !isError && errors.length > 0 && (
                    <div className="px-5 py-3 flex gap-4 border-b border-stone-100">
                        <div className="flex-1 text-center">
                            <p className="text-[10px] font-bold text-stone-400 uppercase">Total</p>
                            <p className="text-xl font-extrabold text-stone-700">{errors.length}</p>
                        </div>
                        <div className="w-px bg-stone-100" />
                        <div className="flex-1 text-center">
                            <p className="text-[10px] font-bold text-stone-400 uppercase">Ativos</p>
                            <p className={`text-xl font-extrabold ${unresolvedCount > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                {unresolvedCount}
                            </p>
                        </div>
                        <div className="w-px bg-stone-100" />
                        <div className="flex-1 text-center">
                            <p className="text-[10px] font-bold text-stone-400 uppercase">Resolvidos</p>
                            <p className="text-xl font-extrabold text-emerald-500">
                                {errors.length - unresolvedCount}
                            </p>
                        </div>
                    </div>
                )}

                {/* ── Conteúdo ───────────────────────────────────────────── */}
                <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-2">

                    {isLoading && (
                        <div className="flex items-center justify-center gap-2 py-16 text-stone-400 text-sm">
                            <Loader2 size={18} className="animate-spin" /> Carregando erros...
                        </div>
                    )}

                    {isError && (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-stone-400">
                            <WifiOff size={32} strokeWidth={1.5} />
                            <p className="text-sm font-medium">Não foi possível carregar os erros</p>
                            <button
                                onClick={() => refetch()}
                                className="text-xs text-emerald-600 font-bold hover:underline mt-1"
                            >
                                Tentar novamente
                            </button>
                        </div>
                    )}

                    {!isLoading && !isError && errors.length === 0 && (
                        <div className="flex flex-col items-center justify-center gap-2 py-16 text-stone-300">
                            <CheckCircle2 size={36} strokeWidth={1.5} className="text-emerald-400" />
                            <p className="text-sm font-medium text-stone-400">Nenhum erro registrado</p>
                        </div>
                    )}

                    {!isLoading && !isError && errors.map((err) => (
                        <div
                            key={err.id}
                            className={`rounded-xl border p-3 transition-all ${
                                err.resolved
                                    ? 'bg-stone-50 border-stone-100'
                                    : 'bg-red-50 border-red-100'
                            }`}
                        >
                            <div className="flex items-start gap-2.5">
                                {/* Ícone status */}
                                <div className="mt-0.5 shrink-0">
                                    {err.resolved
                                        ? <CheckCircle2 size={15} className="text-emerald-400" />
                                        : <AlertTriangle size={15} className="text-red-400" />
                                    }
                                </div>

                                <div className="flex-1 min-w-0">
                                    {/* Código do erro */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                                            err.resolved
                                                ? 'bg-stone-100 text-stone-500'
                                                : 'bg-red-100 text-red-600'
                                        }`}>
                                            {err.errorCode}
                                        </span>
                                        {err.resolved && (
                                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                                                Resolvido
                                            </span>
                                        )}
                                    </div>

                                    {/* Mensagem */}
                                    <p className={`text-xs mt-1 leading-relaxed ${
                                        err.resolved ? 'text-stone-400' : 'text-stone-700'
                                    }`}>
                                        {err.message}
                                    </p>

                                    {/* Timestamp */}
                                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-stone-400">
                                        <Clock size={10} />
                                        {formatDate(err.occurredAt)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
