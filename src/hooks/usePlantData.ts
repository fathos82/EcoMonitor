import { useState } from 'react';
import type { DataPoint } from '../types';

export function usePlantData() {
  const [soilData, setSoilData] = useState<DataPoint[]>([]);
  const [airData, setAirData] = useState<DataPoint[]>([]);
  const [tempData, setTempData] = useState<DataPoint[]>([]);
  const [lightData, setLightData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPlantData = (plantId: number) => {
    setLoading(true);
    setTimeout(() => {
      const baseHumidity = 60;
      const points = 48;

      const newSoil: DataPoint[] = Array.from({ length: points }, (_, i) => ({
        time: i,
        humidity: Math.floor(Math.random() * (20) + baseHumidity)
      }));

      const newAir: DataPoint[] = Array.from({ length: points }, (_, i) => ({
        time: i,
        aqi: Math.floor(Math.random() * (80) + 20)
      }));

      const newTemp: DataPoint[] = Array.from({ length: points }, (_, i) => ({
        time: i,
        temp: Math.floor(Math.random() * (10) + 20)
      }));

      const newLight: DataPoint[] = Array.from({ length: points }, (_, i) => ({
        time: i,
        lux: Math.floor(Math.random() * (500) + 200)
      }));

      setSoilData(newSoil);
      setAirData(newAir);
      setTempData(newTemp);
      setLightData(newLight);
      setLoading(false);
    }, 600);
  };

  return {
    soilData,
    airData,
    tempData,
    lightData,
    loading,
    loadPlantData
  };
}