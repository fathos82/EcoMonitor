import React from 'react';
import { useAppStore } from '../stores/AppContext';
import { ReportsView } from '../components/reports/ReportsView';

export const Reports: React.FC = () => {
  const { plants } = useAppStore();
  return <ReportsView plants={plants} />;
};