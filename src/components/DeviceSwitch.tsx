import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DeviceMode = 'desktop' | 'mobile';

export const DeviceSwitch: React.FC = () => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
    const saved = localStorage.getItem('device-mode');
    return (saved as DeviceMode) || 'desktop';
  });

  useEffect(() => {
    localStorage.setItem('device-mode', deviceMode);
    document.documentElement.setAttribute('data-device-mode', deviceMode);
  }, [deviceMode]);

  const toggleMode = () => {
    setDeviceMode(prev => prev === 'desktop' ? 'mobile' : 'desktop');
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleMode}
      className="gap-2"
    >
      {deviceMode === 'desktop' ? (
        <>
          <Monitor className="w-4 h-4" />
          <span className="hidden sm:inline">ПК</span>
        </>
      ) : (
        <>
          <Smartphone className="w-4 h-4" />
          <span className="hidden sm:inline">Телефон</span>
        </>
      )}
    </Button>
  );
};

export const useDeviceMode = () => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>(() => {
    const saved = localStorage.getItem('device-mode');
    return (saved as DeviceMode) || 'desktop';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('device-mode');
      setDeviceMode((saved as DeviceMode) || 'desktop');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return { deviceMode, isMobile: deviceMode === 'mobile' };
};