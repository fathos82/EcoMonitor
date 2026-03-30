import type { SensorTemplate, SensorType } from "../types/index";

export const SENSOR_TEMPLATES: Record<SensorType, SensorTemplate> = {
  'dht': {
    label: 'Temp/Umid (DHT11/22)',
    defaultUnit: '°C / %',
    pins: [{ key: 'data', label: 'Pino de Dados', type: 'digital' }]
  },
  'soil_analog': {
    label: 'Solo (Capacitivo Analógico)',
    defaultUnit: '%',
    pins: [{ key: 'signal', label: 'Pino Analógico', type: 'analog' }]
  },
  'soil_digital': {
    label: 'Solo (Digital)',
    defaultUnit: 'ON/OFF',
    pins: [{ key: 'signal', label: 'Pino Digital', type: 'digital' }]
  },
  'relay': {
    label: 'Relé / Atuador',
    defaultUnit: 'Estado',
    pins: [{ key: 'control', label: 'Pino de Controle', type: 'digital' }]
  },
  'ultrasonic': {
    label: 'Ultrassônico (Nível)',
    defaultUnit: 'cm',
    pins: [{ key: 'trig', label: 'Trigger', type: 'digital' }, { key: 'echo', label: 'Echo', type: 'digital' }]
  },
  'i2c_env': {
    label: 'Ambiente I2C (BME280)',
    defaultUnit: 'Multi',
    pins: [{ key: 'sda', label: 'SDA', type: 'i2c' }, { key: 'scl', label: 'SCL', type: 'i2c' }]
  },
  'generic': {
    label: 'Sensor Genérico',
    defaultUnit: '-',
    pins: [{ key: 'pin', label: 'Pino Sinal', type: 'digital' }]
  },
  'camera': {
    label: 'Câmera USB/CSI',
    defaultUnit: 'Stream',
    pins: [{ key: 'port', label: 'Caminho (Ex: /dev/video0)', type: 'string' }]
  }
};