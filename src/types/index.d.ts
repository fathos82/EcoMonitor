export type SensorType = 'dht' | 'soil_analog' | 'soil_digital' | 'relay' | 'ultrasonic' | 'i2c_env' | 'generic' | 'camera';
export type PinType = 'digital' | 'analog' | 'i2c' | 'string';
export type DeviceStatus = 'online' | 'offline' | 'error';
export type SensorStatus = 'ok' | 'error' | 'unknown';
export type PlantStatus = 'healthy' | 'warning' | 'critical';

export interface Pin {
  key: string;
  label: string;
  type: PinType;
}

export interface SensorTemplate {
  label: string;
  defaultUnit: string;
  pins: Pin[];
}

export interface SensorConfig {
  [key: string]: string;
}

export interface Sensor {
  id: number;
  name: string;
  type: SensorType;
  config: SensorConfig;
  status: SensorStatus;
  lastRead: string;
  errorMessage?: string;
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

export interface PlantSettings {
  humidity: { min: number; max: number; alert: boolean };
  temp: { min: number; max: number; alert: boolean };
  air: { min: number; max: number; alert: boolean };
  light: { min: number; max: number; alert: boolean };
}

export interface Plant {
  id: number;
  name: string;
  species: string;
  image: string;
  status: PlantStatus;
  lastHumidity: number;
  location: string;
  hardwareId: number;
  sensorsMapping: {
    soil: number | null;
    env: number | null;
    light: number | null;
  };
  settings: PlantSettings;
}

export interface DataPoint {
  time: number;
  [key: string]: number;
}

export interface User {
  name: string;
  email: string;
}

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
  onEdit: (plant: Plant) => void;
  onDelete: (id: number) => void;
}

export interface ActionButtonProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  color: string;
}

export interface SensorConfigCardProps {
  sensor: Sensor;
  onChange: (sensor: Sensor) => void;
  onDelete: () => void;
}

export interface AddHardwareFormProps {
  onSave: (data: Hardware) => void;
  onCancel: () => void;
  initialData?: Hardware | null;
}

export interface SettingsViewProps {
  hardwareList: Hardware[];
  onAddHardware: (hardware: Hardware) => void;
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