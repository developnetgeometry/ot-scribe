import { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useAuth } from '@/hooks/useAuth';

export function PWAInstallBanner() {
  const { user } = useAuth();
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(() => {
    // Check if user has dismissed the banner before
    return localStorage.getItem('pwa-banner-dismissed') === 'true';
  });

  // Reset dismissal after 7 days to remind users again
  useEffect(() => {
    const dismissedDate = localStorage.getItem('pwa-banner-dismissed-date');
    if (dismissedDate) {
      const daysSince = (Date.now() - parseInt(dismissedDate)) / (1000 * 60 * 60 * 24);
      if (daysSince > 7) {
        localStorage.removeItem('pwa-banner-dismissed');
        localStorage.removeItem('pwa-banner-dismissed-date');
        setIsDismissed(false);
      }
    }
  }, []);

  // Only show banner if:
  // - User is authenticated
  // - App is not already installed
  // - User hasn't dismissed it
  // - Installation is actually possible
  if (!user || isInstalled || isDismissed || !isInstallable) {
    return null;
  }

  const handleInstall = async () => {
    try {
      await promptInstall();
      // Banner will automatically hide when app is installed due to isInstalled check
    } catch (error) {
      console.error('Failed to install PWA:', error);
      // Auto-dismiss if installation fails
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Remember user's choice with timestamp
    localStorage.setItem('pwa-banner-dismissed', 'true');
    localStorage.setItem('pwa-banner-dismissed-date', Date.now().toString());
  };

  return (
    <Card className="fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-96 z-50 p-4 shadow-lg border-primary/20 bg-background/95 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Smartphone className="h-5 w-5 text-primary" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground">
            Install OTMS App
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            Get quick access and work offline. Install our app for the best experience.
          </p>
        </div>
        
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            size="sm"
            onClick={handleInstall}
            className="h-8 text-xs whitespace-nowrap"
          >
            <Download className="h-3 w-3 mr-1" />
            Install
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}