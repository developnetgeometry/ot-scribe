import { useEffect, useState } from 'react';

type NotificationPermissionState = 'default' | 'granted' | 'denied';

interface UseNotificationPermissionReturn {
  permission: NotificationPermissionState;
  requestPermission: () => Promise<NotificationPermissionState>;
  isSupported: boolean;
}

export const useNotificationPermission = (): UseNotificationPermissionReturn => {
  const isSupported = 'Notification' in window;
  const [permission, setPermission] = useState<NotificationPermissionState>(
    isSupported ? Notification.permission : 'denied'
  );

  useEffect(() => {
    if (!isSupported) return;

    // Update permission state if changed externally
    const checkPermission = () => {
      setPermission(Notification.permission);
    };

    let permissionStatus: PermissionStatus | null = null;

    // Some browsers support permission change event (not widely supported)
    navigator.permissions?.query({ name: 'notifications' as PermissionName })
      .then((status) => {
        permissionStatus = status;
        permissionStatus.onchange = checkPermission;
      })
      .catch(() => {
        // Permission API not supported, fallback to manual checks
      });

    // Cleanup: Remove event listener on unmount
    return () => {
      if (permissionStatus) {
        permissionStatus.onchange = null;
      }
    };
  }, [isSupported]);

  const requestPermission = async (): Promise<NotificationPermissionState> => {
    if (!isSupported) return 'denied';

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return permission;
    }
  };

  return {
    permission,
    requestPermission,
    isSupported
  };
};
