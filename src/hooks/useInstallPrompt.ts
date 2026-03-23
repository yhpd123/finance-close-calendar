import { useEffect, useState } from 'react';

export function useInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallEvent(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt as EventListener,
      );
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installEvent) {
      return false;
    }

    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallEvent(null);
      return true;
    }

    return false;
  };

  return {
    canInstall: Boolean(installEvent) && !isInstalled,
    isInstalled,
    promptInstall,
  };
}
