import React, { useEffect, useState } from 'react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    CircuitBoard,
    Loader2,
    Settings2,
    X,
} from 'lucide-react';
import type { Sensor, SensorTemplate } from '../../types';
import { useSensorTemplates } from '../../hooks/useSensors';
import type { UpdateSensorRequest } from '../../services/sensorService';

// ─── Tipos internos ───────────────────────────────────────────────────────────

type Step = 'pick-template' | 'configure-params';

// ─── Props ────────────────────────────────────────────────────────────────────

interface AddSensorModalProps {
    deviceId: number;
    onSave: (templateId: number, parameters: Record<string, string>) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    error?: string | null;
}

interface EditSensorModalProps {
    sensor: Sensor;
    onSave: (data: UpdateSensorRequest) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
    error?: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const capabilityColors: Record<string, string> = {
    TEMPERATURE:   'bg-orange-100 text-orange-700',
    SOIL_MOISTURE: 'bg-blue-100 text-blue-700',
    AIR_QUALITY:   'bg-emerald-100 text-emerald-700',
    DISTANCE:      'bg-purple-100 text-purple-700',
    HUMIDITY:      'bg-sky-100 text-sky-700',
    LIGHT:         'bg-yellow-100 text-yellow-700',
    MOCK:          'bg-stone-100 text-stone-500',
};

function capBadge(cap: string) {
    const cls = capabilityColors[cap] ?? 'bg-stone-100 text-stone-500';
    return (
        <span key={cap} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cls}`}>
            {cap}
        </span>
    );
}

function ParametersForm({
    fields,
    values,
    onChange,
}: {
    fields: Record<string, string>;
    values: Record<string, string>;
    onChange: (key: string, val: string) => void;
}) {
    if (Object.keys(fields).length === 0) {
        return (
            <p className="text-sm text-stone-400 italic text-center py-4">
                Este sensor não possui parâmetros configuráveis.
                O backend usará os valores padrão automaticamente.
            </p>
        );
    }

    return (
        <div className="space-y-3">
            {Object.entries(fields).map(([key, defaultVal]) => (
                <div key={key} className="space-y-1">
                    <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center justify-between">
                        <span>{key.replace(/_/g, ' ')}</span>
                        <span className="font-mono font-normal text-stone-300 normal-case">
                            padrão: {defaultVal || '—'}
                        </span>
                    </label>
                    <input
                        type="text"
                        value={values[key] ?? defaultVal}
                        onChange={e => onChange(key, e.target.value)}
                        placeholder={defaultVal || key}
                        className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    />
                </div>
            ))}
        </div>
    );
}

// ─── Modal: Adicionar Sensor (2 etapas) ───────────────────────────────────────

export const AddSensorModal: React.FC<AddSensorModalProps> = ({
    onSave, onCancel, loading = false, error = null,
}) => {
    const { data: templates = [], isLoading: loadingTemplates, error: templatesError } =
        useSensorTemplates();

    const [step, setStep]               = useState<Step>('pick-template');
    const [selected, setSelected]       = useState<SensorTemplate | null>(null);
    const [params, setParams]           = useState<Record<string, string>>({});

    // Ao selecionar template, pre-popula os parâmetros com os defaults
    const handlePickTemplate = (t: SensorTemplate) => {
        setSelected(t);
        setParams({ ...t.defaultParameters });
        setStep('configure-params');
    };

    const handleParamChange = (key: string, val: string) => {
        setParams(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selected) return;
        await onSave(selected.id, params);
    };

    return (
        <Overlay onClose={onCancel}>
            <ModalShell
                title={step === 'pick-template' ? 'Escolha um Sensor' : selected?.name ?? 'Configurar Parâmetros'}
                subtitle={step === 'pick-template' ? 'Selecione o modelo do sensor a registrar' : `Modelo: ${selected?.model}`}
                onClose={onCancel}
                onBack={step === 'configure-params' ? () => setStep('pick-template') : undefined}
            >
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-5">

                        {/* Erro global */}
                        {error && <ErrorBanner message={error} />}

                        {/* ── Etapa 1: Pick template ── */}
                        {step === 'pick-template' && (
                            <>
                                {loadingTemplates && (
                                    <div className="flex flex-col items-center gap-3 py-12 text-stone-400">
                                        <Loader2 size={28} className="animate-spin" />
                                        <p className="text-sm">Carregando sensores disponíveis…</p>
                                    </div>
                                )}

                                {templatesError && (
                                    <ErrorBanner message="Não foi possível carregar os templates. Verifique sua conexão." />
                                )}

                                {!loadingTemplates && !templatesError && (
                                    <div className="space-y-2">
                                        {templates.map(t => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => handlePickTemplate(t)}
                                                className="w-full text-left p-4 bg-stone-50 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 rounded-2xl transition-all group"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2.5 bg-white border border-stone-200 rounded-xl text-stone-400 group-hover:text-emerald-600 group-hover:border-emerald-200 transition-colors shrink-0">
                                                            <CircuitBoard size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-stone-800 text-sm">{t.name}</p>
                                                            <p className="text-[11px] font-mono text-stone-400 mt-0.5">{t.model}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap gap-1 justify-end pt-0.5">
                                                        {t.capabilities.map(capBadge)}
                                                    </div>
                                                </div>

                                                {Object.keys(t.defaultParameters).length > 0 && (
                                                    <div className="mt-2.5 flex flex-wrap gap-1.5 pl-1">
                                                        {Object.entries(t.defaultParameters).map(([k, v]) => (
                                                            <span key={k} className="font-mono text-[10px] bg-white border border-stone-200 rounded px-1.5 py-0.5 text-stone-400">
                                                                {k}={v}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* ── Etapa 2: Configure params ── */}
                        {step === 'configure-params' && selected && (
                            <div className="space-y-5">
                                {/* Resumo do template */}
                                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 shrink-0">
                                        <CircuitBoard size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-emerald-800">{selected.name}</p>
                                        <p className="text-[11px] font-mono text-emerald-600">{selected.model}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {selected.capabilities.map(capBadge)}
                                    </div>
                                </div>

                                {/* Campos de parâmetros */}
                                <div>
                                    <div className="flex items-center gap-2 mb-3">
                                        <Settings2 size={14} className="text-stone-400" />
                                        <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                                            Parâmetros
                                        </span>
                                    </div>
                                    <ParametersForm
                                        fields={selected.defaultParameters}
                                        values={params}
                                        onChange={handleParamChange}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer — só aparece na etapa de configuração */}
                    {step === 'configure-params' && (
                        <ModalFooter
                            onCancel={onCancel}
                            loading={loading}
                            submitLabel="Registrar Sensor"
                            disabled={!selected}
                        />
                    )}
                </form>
            </ModalShell>
        </Overlay>
    );
};

// ─── Modal: Editar Sensor (só parâmetros) ────────────────────────────────────

export const EditSensorModal: React.FC<EditSensorModalProps> = ({
    sensor, onSave, onCancel, loading = false, error = null,
}) => {
    const [params, setParams] = useState<Record<string, string>>({ ...sensor.parameters });

    useEffect(() => {
        setParams({ ...sensor.parameters });
    }, [sensor.id]);

    const handleChange = (key: string, val: string) => {
        setParams(prev => ({ ...prev, [key]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave({ parameters: params });
    };

    return (
        <Overlay onClose={onCancel}>
            <ModalShell
                title="Editar Parâmetros"
                subtitle={`${sensor.name} · ${sensor.model}`}
                onClose={onCancel}
            >
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                        {error && <ErrorBanner message={error} />}

                        <div className="flex flex-wrap gap-1">
                            {sensor.capabilities.map(capBadge)}
                        </div>

                        <ParametersForm
                            fields={params}
                            values={params}
                            onChange={handleChange}
                        />
                    </div>

                    <ModalFooter
                        onCancel={onCancel}
                        loading={loading}
                        submitLabel="Salvar Parâmetros"
                    />
                </form>
            </ModalShell>
        </Overlay>
    );
};

// ─── Componentes internos de layout ──────────────────────────────────────────

function Overlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            {children}
        </div>
    );
}

function ModalShell({
    title, subtitle, onClose, onBack, children,
}: {
    title: string;
    subtitle?: string;
    onClose: () => void;
    onBack?: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[88vh]">
            <div className="flex items-center justify-between px-6 py-5 border-b border-stone-100">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button
                            type="button"
                            onClick={onBack}
                            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 transition-colors"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div className="p-2 bg-stone-100 rounded-xl text-stone-600">
                        <CircuitBoard size={18} />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-stone-800 text-base leading-tight">{title}</h2>
                        {subtitle && <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>}
                    </div>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
            {children}
        </div>
    );
}

function ModalFooter({
    onCancel, loading, submitLabel, disabled = false,
}: {
    onCancel: () => void;
    loading: boolean;
    submitLabel: string;
    disabled?: boolean;
}) {
    return (
        <div className="px-6 py-4 border-t border-stone-100 flex gap-3 bg-stone-50">
            <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 py-2.5 rounded-xl font-bold text-stone-500 hover:bg-stone-200 transition-colors text-sm disabled:opacity-50"
            >
                Cancelar
            </button>
            <button
                type="submit"
                disabled={loading || disabled}
                className="flex-[2] py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-bold shadow-md shadow-emerald-200 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm"
            >
                {loading
                    ? <><Loader2 size={16} className="animate-spin" /> Salvando…</>
                    : <><CheckCircle2 size={16} /> {submitLabel}</>
                }
            </button>
        </div>
    );
}

function ErrorBanner({ message }: { message: string }) {
    return (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4">
            <AlertCircle size={15} className="shrink-0" />
            {message}
        </div>
    );
}
