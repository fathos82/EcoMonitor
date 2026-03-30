import type { Hardware, Plant } from '../types';

export const INITIAL_HARDWARE: Hardware[] = [
  {
    id: 1,
    name: 'Estufa Master',
    model: 'Raspberry Pi 4B',
    ip: '192.168.1.105',
    status: 'online',
    uptime: '5d 12h',
    sensors: [
      { id: 101, name: 'Sensor Solo A', type: 'soil_digital', config: { signal: '21' }, status: 'ok', lastRead: 'Agora', errorMessage: '' },
      { id: 103, name: 'Ambiente Interno', type: 'dht', config: { data: '4' }, status: 'ok', lastRead: 'Agora', errorMessage: '' },
      { id: 104, name: 'Luz Solar', type: 'i2c_env', config: { address: '0x44' }, status: 'error', lastRead: 'Falha', errorMessage: 'Timeout na comunicação I2C. Verifique a conexão dos cabos SDA/SCL.' },
    ]
  },
  {
    id: 2,
    name: 'Sensor Varanda',
    model: 'Pi Zero W',
    ip: '192.168.1.106',
    status: 'online',
    uptime: '1d 4h',
    sensors: [
      { id: 201, name: 'Solo Vaso 1', type: 'soil_analog', config: { signal: 'A0' }, status: 'ok', lastRead: '10s', errorMessage: '' }
    ]
  }
];

export const INITIAL_PLANTS: Plant[] = [
  {
    id: 1,
    name: "Manjericão",
    species: "Ocimum basilicum",
    image: "https://images.unsplash.com/photo-1618331835717-801e976710b2?auto=format&fit=crop&q=80&w=400",
    status: "healthy",
    lastHumidity: 65,
    location: "Cozinha",
    hardwareId: 1,
    sensorsMapping: { soil: 101, env: 103, light: 104 },
    settings: {
      humidity: { min: 40, max: 80, alert: true },
      temp: { min: 18, max: 28, alert: false },
      air: { min: 0, max: 50, alert: true },
      light: { min: 200, max: 1000, alert: false },
    }
  },
  {
    id: 2,
    name: "Jiboia",
    species: "Epipremnum aureum",
    image: "https://images.unsplash.com/photo-1596724852960-9f9418508a9d?auto=format&fit=crop&q=80&w=400",
    status: "warning",
    lastHumidity: 32,
    location: "Varanda",
    hardwareId: 2,
    sensorsMapping: { soil: 201, env: null, light: null },
    settings: {
      humidity: { min: 40, max: 80, alert: true },
      temp: { min: 18, max: 28, alert: false },
      air: { min: 0, max: 50, alert: true },
      light: { min: 200, max: 1000, alert: false },
    }
  }
];