import React from 'react';
import { Download, Tablet } from 'lucide-react';
import { usePWAInstall } from './usePWAInstall.ts';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  if (!isInstallable || isInstalled) return null;

  return (
    <button
      onClick={promptInstall}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
      title="Install as Kiosk App"
    >
      <Tablet className="w-3.5 h-3.5" />
      <span>Install Kiosk App</span>
    </button>
  );
};
