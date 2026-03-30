import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../stores/AppContext';
import { ProfileView } from '../components/profile/ProfileView';

export const Profile: React.FC = () => {
  const { user, setUser } = useAppStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return <ProfileView user={user} onLogout={handleLogout} />;
};