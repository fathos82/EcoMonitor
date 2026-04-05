// ─── Sensor & Hardware (contrato real da API) ────────────────────────────────

export type DeviceStatus = 'online' | 'offline' | 'error';
export type PlantStatus  = 'healthy' | 'warning' | 'critical';

/** Template de sensor vindo de GET /sensors/templates/ */
export interface SensorTemplate {
  id: number;
  name: string;
  model: string;
  capabilities: string[];
  defaultParameters: Record<string, string>;
}

/** Sensor como vindo da API (GET /sensors/?deviceId=) */
export interface ApiSensor {
  id: number;
  deviceId: number;
  sensorName: string;
  model: string;
  capabilities: string[];
  isWorking: boolean;
  parameters: Record<string, string>;
}

/** Sensor no formato interno do frontend */
export interface Sensor {
  id: number;
  deviceId: number;
  name: string;
  model: string;
  capabilities: string[];
  isWorking: boolean;
  parameters: Record<string, string>;
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

export type MeasurementType = 'TEMPERATURE' | 'SOIL_MOISTURE' | 'AIR_QUALITY' | 'MOCK';

export interface PlantSettings {
  humidity: { min: number; max: number; alert: boolean };
  temp:     { min: number; max: number; alert: boolean };
  air:      { min: number; max: number; alert: boolean };
  light:    { min: number; max: number; alert: boolean };
  mock:    { min: number; max: number; alert: boolean };
}

export interface MeasurementEntry {
  measurementId: number;
  sensorId:      number;
}

export type MeasurementsMapping = Partial<Record<MeasurementType, MeasurementEntry | null>>;

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
  time:  number;
  value: number;
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