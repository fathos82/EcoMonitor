// ─── Sensor & Hardware (contrato real da API) ────────────────────────────────

/** Tipos de medida suportados pelo backend */
export type MeasurementType = 'TEMPERATURE' | 'SOIL_MOISTURE' | 'AIR_QUALITY';

export type DeviceStatus = 'online' | 'offline' | 'error';
export type PlantStatus  = 'healthy' | 'warning' | 'critical';

/** Sensor como vindo da API */
export interface ApiSensor {
  id: number;
  deviceId: number;
  sensorName: string;
  model: string;
  capabilities: string[];   // ex: ["TEMPERATURE", "AIR_QUALITY"]
  isWorking: boolean;
  parameters: Record<string, string>;
}

/** Sensor no formato interno do frontend */
export interface Sensor {
  id: number;
  name: string;
  model: string;
  capabilities: MeasurementType[];
  isWorking: boolean;
}

export interface Hardware {
  id: number;
  name: string;
  model: string;
  ip: string;
  status: DeviceStatus;
  uptime: string;
  sensors: Sensor[];
}

// ─── Plant ───────────────────────────────────────────────────────────────────

export interface PlantSettings {
  humidity: { min: number; max: number; alert: boolean };
  temp:     { min: number; max: number; alert: boolean };
  air:      { min: number; max: number; alert: boolean };
  light:    { min: number; max: number; alert: boolean };
}

/**
 * Mapeamento de medidas → sensor escolhido.
 * Chave = MeasurementType, valor = sensorId ou null (não monitorado).
 */
export type MeasurementsMapping = Partial<Record<MeasurementType, number | null>>;

export interface Plant {
  id: number;
  name: string;
  species: string;
  image: string;
  status: PlantStatus;
  lastHumidity: number;
  location: string;
  hardwareId: number;
  /** @deprecated substituído por measurementsMapping */
  sensorsMapping: { soil: number | null; env: number | null; light: number | null };
  measurementsMapping: MeasurementsMapping;
  settings: PlantSettings;
}

// ─── Charts ──────────────────────────────────────────────────────────────────

export interface DataPoint {
  time: number;
  [key: string]: number;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  name: string;
  email: string;
}

// ─── Component props ─────────────────────────────────────────────────────────

export interface StatBoxProps {
  label: string;
  value: number;
  unit: string;
  type?: 'max' | 'min' | 'avg';
  colorClass: string;
}

export interface SensorCardProps {
  title: string;
  icon: React.ElementType;
  data: DataPoint[];
  color: string;
  unit: string;
  dataKey: string;
}

export interface PlantSummaryCardProps {
  plant: Plant;
  onClick: (plant: Plant) => void;
  onEdit:  (plant: Plant) => void;
  onDelete: (id: number) => void;
}

export interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  color: string;
}

export interface AddHardwareFormProps {
  onSave: (data: Hardware) => void;
  onCancel: () => void;
  initialData?: Hardware | null;
}

export interface SettingsViewProps {
  hardwareList: Hardware[];
  onAddHardware:  (hardware: Hardware) => void;
  onEditHardware: (hardware: Hardware) => void;
}

export interface ReportsViewProps {
  plants: Plant[];
}

export interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export interface ProfileViewProps {
  user: User;
  onLogout: () => void;
}