import React from 'react';
import { useAppStore } from '../stores/AppContext';
import { SettingsView } from '../components/hardware/SettingsView';

export const Settings: React.FC = () => {
  const { hardwareList, addHardware, updateHardware } = useAppStore();

  return (
    <SettingsView
      hardwareList={hardwareList}
      onAddHardware={addHardware}
      onEditHardware={updateHardware}
    />
  );
};