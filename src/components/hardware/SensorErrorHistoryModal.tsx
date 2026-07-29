import React, { useRef } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { useSensorErrors } from '../../hooks/useSensorErrors';

interface SensorErrorHistoryModalProps {
    sensorId:   number;
    sensorName: string;
    onClose:    () => void;
}

export const SensorErrorHistoryModal: React.FC<SensorErrorHistoryModalProps> = ({
    sensorId, sensorName, onClose,
}) => {
    const { errors, loading } = useSensorErrors(sensorId);
    const overlayRef = useRef<HTMLDivElement>(null);

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    };

    return (
        <div
            ref={overlayRef}
            onClick={handleOverlayClick}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200"
        >
            <div className="bg-white w-full md:max-w-lg md:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[80vh] animate-in slide-in-from-bottom duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-stone-100">
                    <div>
                        <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-0.5">Histórico de Erros</p>
                        <h2 className="text-lg font-extrabold text-red-500">{sensorName}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Lista */}
                <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-2">
                    {loading && (
                        <div className="h-32 flex items-center justify-center gap-2 text-stone-400 text-sm">
                            <Loader2 size={18} className="animate-spin" /> Carregando...
                        </div>
                    )}

                    {!loading && errors.length === 0 && (
                        <div className="h-32 flex items-center justify-center text-stone-400 text-sm italic">
                            Nenhum erro registrado para este sensor.
                        </div>
                    )}

                    {!loading && errors.map((err, i) => (
                        <div
                            key={`${err.sensorId}-${err.dateTime}-${i}`}
                            className="flex items-start gap-2 bg-red-50/60 border border-red-100 rounded-xl px-3 py-2.5"
                        >
                            <AlertCircle size={14} className="shrink-0 text-red-400 mt-0.5" />
                            <div className="min-w-0">
                                <p className="text-xs text-red-600 leading-snug">{err.message}</p>
                                <p className="text-[10px] text-red-300 mt-0.5">
                                    {new Date(err.dateTime).toLocaleString('pt-BR')}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
