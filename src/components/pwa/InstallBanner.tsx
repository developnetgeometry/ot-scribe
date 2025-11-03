import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Download, X } from 'lucide-react';

const DISMISS_KEY = 'otms-pwa-banner-dismissed';

/**
 * InstallBanner Component
 *
 * Displays a dismissible banner prompting users to install the OTMS PWA.
 *
 * Features:
 * - Shows only when app is installable and not already installed
 * - Respects user's dismiss preference stored in localStorage
 * - Triggers native install prompt on "Install" button click
 * - Fully responsive and accessible
 *
 * @returns {JSX.Element | null} Banner component or null if hidden
 */
export const InstallBanner = () => {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check localStorage for previous dismiss preference on mount
  useEffect(() => {
    const dismissed = localStorage.getItem(DISMISS_KEY);
    if (dismissed) {
      setIsDismissed(true);
    }
  }, []);

  /**
   * Handle Install button click
   * Triggers native PWA install prompt and stores dismiss preference
   */
  const handleInstall = async () => {
    await promptInstall();
    // Store preference to prevent re-showing banner after install attempt
    localStorage.setItem(DISMISS_KEY, 'true');
    setIsDismissed(true);
  };

  /**
   * Handle Dismiss button click
   * Hides banner and stores user's dismiss preference
   */
  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, 'true');
    setIsDismissed(true);
  };

  // Hide banner if:
  // - App is not installable
  // - App is already installed
  // - User has dismissed the banner
  if (!isInstallable || isInstalled || isDismissed) {
    return null;
  }

  return (
    <Alert className="mb-4">
      <Download className="h-4 w-4" />
      <AlertTitle>Install OTMS App</AlertTitle>
      <AlertDescription>
        Add OTMS to your home screen for quick access and a better experience.
      </AlertDescription>
      <div className="flex gap-2 mt-2">
        <Button onClick={handleInstall} size="sm">
          Install
        </Button>
        <Button onClick={handleDismiss} variant="outline" size="sm">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
};
