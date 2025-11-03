import { useState, useEffect } from 'react';

/**
 * Browser API for PWA install prompt event
 * Extends standard Event with PWA-specific methods
 */
interface BeforeInstallPromptEvent extends Event {
  /**
   * Programmatically trigger the native install prompt
   */
  prompt: () => Promise<void>;
  /**
   * Promise that resolves with user's choice (accepted or dismissed)
   */
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * Return type for usePWAInstall hook
 */
export interface UsePWAInstallReturn {
  /**
   * True if app can be installed (beforeinstallprompt received and app not already installed)
   */
  isInstallable: boolean;
  /**
   * True if app is already installed (running in standalone mode)
   */
  isInstalled: boolean;
  /**
   * True if browser supports PWA installation
   */
  isSupported: boolean;
  /**
   * Trigger native install prompt (only works if isInstallable is true)
   */
  promptInstall: () => Promise<void>;
}

/**
 * Custom React hook to detect PWA install state and browser support
 *
 * Detects:
 * - Whether app is already installed (standalone mode)
 * - Whether browser supports PWA installation
 * - Whether app is installable (beforeinstallprompt event received)
 *
 * Provides method to programmatically trigger install prompt
 *
 * Browser Support:
 * - Chrome/Edge: Full support (beforeinstallprompt, appinstalled events)
 * - Safari iOS 16.4+: Standalone detection only (no programmatic prompt)
 * - Firefox: Limited support (may not fire beforeinstallprompt)
 *
 * @returns {UsePWAInstallReturn} Install state and control methods
 */
export const usePWAInstall = (): UsePWAInstallReturn => {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    // Supports both standard display-mode media query and iOS-specific navigator.standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsInstalled(isStandalone);

    // Listen for beforeinstallprompt event (Chrome, Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser's default install prompt from showing automatically
      e.preventDefault();
      // Store event reference for later use (when user clicks install button)
      setPromptEvent(e as BeforeInstallPromptEvent);
    };

    // Listen for appinstalled event (fires after successful installation)
    const handleAppInstalled = () => {
      setIsInstalled(true);
      // Clear prompt event since app is now installed
      setPromptEvent(null);
    };

    // Register event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Cleanup: Remove event listeners on component unmount to prevent memory leaks
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []); // Empty dependency array: run once on mount

  /**
   * Trigger the browser's native install prompt
   * Only works if beforeinstallprompt event was received and stored
   */
  const promptInstall = async () => {
    if (!promptEvent) {
      console.warn('usePWAInstall: Cannot trigger install prompt - event not available');
      return;
    }

    try {
      // Show native install prompt
      await promptEvent.prompt();

      // Wait for user's choice
      const choice = await promptEvent.userChoice;

      if (choice.outcome === 'accepted') {
        console.log('usePWAInstall: User accepted install prompt');
        // Clear prompt event since it's been used
        setPromptEvent(null);
      } else {
        console.log('usePWAInstall: User dismissed install prompt');
      }
    } catch (error) {
      console.error('usePWAInstall: Error triggering install prompt', error);
    }
  };

  return {
    // App can be installed if we have the prompt event and app isn't already installed
    isInstallable: !!promptEvent && !isInstalled,
    isInstalled,
    // Browser supports PWA install if BeforeInstallPromptEvent exists or app is already installed
    // Note: Safari doesn't support BeforeInstallPromptEvent but can still install PWAs
    isSupported: 'BeforeInstallPromptEvent' in window || isInstalled,
    promptInstall,
  };
};
