import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircuitBoard,
  Droplets,
  Loader2,
  Minus,
  Pencil,
  Plus,
  Server,
  Thermometer,
  Trash2,
  Wind,
  Wifi,
} from 'lucide-react';
import type { Hardware, Sensor } from '../../types';
import { AddHardwareForm } from './AddHardwareForm';
import { AddSensorModal, EditSensorModal } from './SensorFormModal';
import { useSensors } from '../../hooks/useSensors';
import type { UpdateSensorRequest } from '../../services/sensorService';

// ─── Props ────────────────────────────────────────────────────────────────────

interface SettingsViewProps {
  hardwareList: Hardware[];
  loadingDevices: boolean;
  devicesError: boolean;
  onClaimDevice: (uuid: string, name: string, hostname: string) => Promise<void>;
  isClaiming: boolean;
  claimError: string | null;
}

// ─── Helpers visuais ──────────────────────────────────────────────────────────

const CAP_COLORS: Record<string, string> = {
  TEMPERATURE:   'bg-orange-100 text-orange-600',
  SOIL_MOISTURE: 'bg-blue-100 text-blue-600',
  AIR_QUALITY:   'bg-emerald-100 text-emerald-600',
  DISTANCE:      'bg-purple-100 text-purple-600',
  HUMIDITY:      'bg-sky-100 text-sky-600',
  LIGHT:         'bg-yellow-100 text-yellow-600',
  MOCK:          'bg-stone-100 text-stone-400',
};

function CapBadge({ cap }: { cap: string }) {
  const cls = CAP_COLORS[cap] ?? 'bg-stone-100 text-stone-500';
  return (
      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${cls}`}>
            {cap}
        </span>
  );
}

function sensorIcon(capabilities: string[]) {
  if (capabilities.includes('SOIL_MOISTURE')) return Droplets;
  if (capabilities.includes('TEMPERATURE'))   return Thermometer;
  if (capabilities.includes('AIR_QUALITY'))   return Wind;
  return CircuitBoard;
}

// ─── Painel de sensores (montado lazily ao expandir o device) ─────────────────

type ModalState =
    | { type: 'closed' }
    | { type: 'add' }
    | { type: 'edit'; sensor: Sensor };

interface SensorsPanelProps {
  deviceId: number;
}

const SensorsPanel: React.FC<SensorsPanelProps> = ({ deviceId }) => {
  const {
    sensors, loading, error,
    createSensor, isCreating, createError,
    updateSensor, isUpdating, updateError,
    deleteSensor, isDeleting,
  } = useSensors(deviceId);

  const [modal, setModal]           = useState<ModalState>({ type: 'closed' });
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [formError, setFormError]   = useState<string | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAdd = async (templateId: number, parameters: Record<string, string>) => {
    setFormError(null);
    try {
      await createSensor({ deviceId: deviceId, sensorTemplateId: templateId, parameters });
      setModal({ type: 'closed' });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Erro ao registrar sensor.';
      setFormError(msg);
      throw err;
    }
  };

  const handleEdit = async (data: UpdateSensorRequest) => {
    if (modal.type !== 'edit') return;
    setFormError(null);
    try {
      await updateSensor({ id: modal.sensor.id, data });
      setModal({ type: 'closed' });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Erro ao atualizar parâmetros.';
      setFormError(msg);
      throw err;
    }
  };

  const handleDelete = async (sensorId: number) => {
    if (!window.confirm('Remover este sensor? Esta ação não pode ser desfeita.')) return;
    setDeletingId(sensorId);
    try {
      await deleteSensor(sensorId);
    } finally {
      setDeletingId(null);
    }
  };

  const closeModal = () => { setModal({ type: 'closed' }); setFormError(null); };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
      <>
        {/* Modais */}
        {modal.type === 'add' && (
            <AddSensorModal
                deviceId={deviceId}
                onSave={handleAdd}
                onCancel={closeModal}
                loading={isCreating}
                error={formError}
            />
        )}
        {modal.type === 'edit' && (
            <EditSensorModal
                sensor={modal.sensor}
                onSave={handleEdit}
                onCancel={closeModal}
                loading={isUpdating}
                error={formError}
            />
        )}

        <div className="bg-stone-50 border-t border-stone-100 p-2 md:p-4 space-y-2 animate-in slide-in-from-top-2 duration-200">

          {/* Cabeçalho */}
          <div className="px-2 pb-2 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
                        Sensores
                    </span>
            <button
                onClick={() => { setFormError(null); setModal({ type: 'add' }); }}
                className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
            >
              <Plus size={13} /> Adicionar Sensor
            </button>
          </div>

          {/* Erro de listagem */}
          {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl px-3 py-2">
                <AlertCircle size={13} className="shrink-0" />
                Não foi possível carregar os sensores.
              </div>
          )}

          {/* Skeleton */}
          {loading && (
              <div className="space-y-2">
                {[1, 2].map(i => (
                    <div key={i} className="h-14 bg-stone-100 rounded-xl animate-pulse" />
                ))}
              </div>
          )}

          {/* Lista */}
          {!loading && sensors.map(sensor => {
            const Icon = sensorIcon(sensor.capabilities);
            const isThisDeleting = isDeleting && deletingId === sensor.id;

            return (
                <div key={sensor.id} className="bg-white rounded-xl border border-stone-100 shadow-sm">
                  <div className="p-3 flex items-center gap-3">
                    {/* Ícone */}
                    <div className={`p-2 rounded-lg shrink-0 ${sensor.isWorking ? 'bg-stone-100 text-stone-600' : 'bg-red-50 text-red-400'}`}>
                      <Icon size={16} />
                    </div>

                    {/* Nome + modelo */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs md:text-sm font-bold text-stone-700 truncate">{sensor.name}</p>
                      <p className="text-[10px] text-stone-400 font-mono">{sensor.model}</p>
                    </div>

                    {/* Capabilities (desktop) */}
                    <div className="hidden md:flex flex-wrap gap-1">
                      {sensor.capabilities.map(cap => <CapBadge key={cap} cap={cap} />)}
                    </div>

                    {/* Status */}
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold uppercase shrink-0 ${
                        sensor.isWorking ? 'text-emerald-600 bg-emerald-50' : 'text-red-500 bg-red-50'
                    }`}>
                      {sensor.isWorking
                          ? <><CheckCircle2 size={11} /> OK</>
                          : <><Minus size={11} /> Falha</>
                      }
                    </div>

                    {/* Ações */}
                    <button
                        onClick={() => { setFormError(null); setModal({ type: 'edit', sensor }); }}
                        className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors shrink-0"
                        title="Editar parâmetros"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                        onClick={() => handleDelete(sensor.id)}
                        disabled={isThisDeleting}
                        className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 shrink-0"
                        title="Remover sensor"
                    >
                      {isThisDeleting
                          ? <Loader2 size={14} className="animate-spin" />
                          : <Trash2 size={14} />
                      }
                    </button>
                  </div>

                  {/* Parâmetros */}
                  {Object.keys(sensor.parameters).length > 0 && (
                      <div className="border-t border-stone-50 px-3 py-2 flex flex-wrap gap-1.5">
                        {Object.entries(sensor.parameters).map(([k, v]) => (
                            <span key={k} className="font-mono text-[10px] bg-stone-50 border border-stone-100 rounded px-1.5 py-0.5 text-stone-400">
                                            {k}={v}
                                        </span>
                        ))}
                      </div>
                  )}
                </div>
            );
          })}

          {/* Vazio */}
          {!loading && sensors.length === 0 && !error && (
              <div className="text-center py-8 text-stone-400 text-sm italic">
                Nenhum sensor cadastrado. Clique em "Adicionar Sensor" para começar.
              </div>
          )}
        </div>
      </>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

export const SettingsView: React.FC<SettingsViewProps> = ({
                                                            hardwareList, loadingDevices, devicesError,
                                                            onClaimDevice, isClaiming, claimError,
                                                          }) => {
  const [expandedHubId, setExpandedHubId] = useState<number | null>(null);
  const [isAdding, setIsAdding]           = useState(false);

  if (isAdding) {
    return (
        <AddHardwareForm
            loading={isClaiming}
            error={claimError}
            onSave={async (uuid, name, hostname) => {
              await onClaimDevice(uuid, name, hostname);
              setIsAdding(false);
            }}
            onCancel={() => setIsAdding(false)}
        />
    );
  }

  return (
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 pb-24">
        <header className="mb-4 flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-stone-800">Hardware</h1>
            <p className="text-xs md:text-base text-stone-500 mt-1">
              {loadingDevices ? 'Carregando...' : `${hardwareList.length} device(s) vinculado(s)`}
            </p>
          </div>
          <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-stone-800 text-white rounded-xl text-xs md:text-sm font-bold shadow-lg hover:bg-stone-700 transition-colors"
          >
            <Plus size={16} />
            <span className="hidden md:inline">Adicionar Device</span>
            <span className="md:hidden">Add</span>
          </button>
        </header>

        {devicesError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={16} className="shrink-0" />
              Não foi possível carregar os devices. Verifique sua conexão.
            </div>
        )}

        {loadingDevices && (
            <div className="space-y-4">
              {[1, 2].map(i => (
                  <div key={i} className="h-20 bg-stone-100 rounded-2xl animate-pulse" />
              ))}
            </div>
        )}

        {!loadingDevices && hardwareList.length === 0 && !devicesError && (
            <div className="flex flex-col items-center justify-center py-24 text-stone-400 gap-3">
              <Server size={40} strokeWidth={1.5} />
              <p className="font-bold text-lg">Nenhum device vinculado</p>
              <p className="text-sm">Clique em "Adicionar Device" e insira o UUID do seu Raspberry Pi</p>
            </div>
        )}

        {!loadingDevices && (
            <div className="space-y-4">
              {hardwareList.map(hub => (
                  <div
                      key={hub.id}
                      className={`rounded-2xl border transition-all overflow-hidden ${
                          expandedHubId === hub.id
                              ? 'bg-white border-stone-300 shadow-lg'
                              : 'bg-white border-stone-200 shadow-sm hover:border-emerald-300'
                      }`}
                  >
                    <div
                        onClick={() => setExpandedHubId(expandedHubId === hub.id ? null : hub.id)}
                        className="p-4 md:p-5 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${hub.status === 'online' ? 'bg-stone-800 text-emerald-400' : 'bg-stone-100 text-stone-400'}`}>
                          <Server size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-stone-800 text-sm md:text-lg leading-tight">{hub.name}</h3>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-stone-500 font-medium">{hub.model}</span>
                            <span className="hidden md:flex items-center gap-1 text-xs font-mono text-stone-400 bg-stone-50 px-1.5 rounded border border-stone-100">
                                                <Wifi size={10} /> {hub.ip}
                                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                            hub.status === 'online' ? 'text-emerald-500 bg-emerald-500/10' : 'text-stone-400 bg-stone-100'
                        }`}>
                          <div className={`w-2 h-2 rounded-full bg-current ${hub.status === 'online' ? 'animate-pulse' : ''}`} />
                          {hub.status}
                        </div>
                        <div className={`md:hidden w-3 h-3 rounded-full ${hub.status === 'online' ? 'bg-emerald-500' : 'bg-stone-300'}`} />
                        {expandedHubId === hub.id
                            ? <ChevronUp size={20} className="text-stone-400" />
                            : <ChevronDown size={20} className="text-stone-400" />
                        }
                      </div>
                    </div>

                    {expandedHubId === hub.id && <SensorsPanel deviceId={hub.id} />}
                  </div>
              ))}
            </div>
        )}
      </div>
  );
};