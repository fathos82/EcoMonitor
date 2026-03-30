import React, { useState } from 'react';
import { SettingsView } from '../components/hardware/SettingsView';
import { useDevices } from '../hooks/useDevices';

export const Settings: React.FC = () => {
  const { devices, loading, error, claimDevice, isClaiming, claimError } = useDevices();
  const [claimApiError, setClaimApiError] = useState<string | null>(null);

  const handleClaim = async (uuid: string, name: string, hostname: string) => {
    setClaimApiError(null);
    try {
      await claimDevice({ uuid, name, hostname });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'UUID inválido ou device não encontrado.';
      setClaimApiError(msg);
      throw err; // propaga para o form não mostrar tela de sucesso
    }
  };

  return (
      <SettingsView
          hardwareList={devices}
          loadingDevices={loading}
          devicesError={!!error}
          onClaimDevice={handleClaim}
          isClaiming={isClaiming}
          claimError={claimApiError ?? (claimError ? 'Erro ao vincular device.' : null)}
      />
  );
};