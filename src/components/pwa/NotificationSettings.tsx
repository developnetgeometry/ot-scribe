// src/components/pwa/NotificationSettings.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { ENABLE_PUSH_NOTIFICATIONS } from '@/config/features';
import { Bell, BellOff, Check } from 'lucide-react';

export const NotificationSettings = () => {
  const { permission, requestPermission, isSupported } = useNotificationPermission();

  // Feature flag check: hide component if push notifications not enabled
  if (!ENABLE_PUSH_NOTIFICATIONS) return null;

  const handleEnableNotifications = async () => {
    const result = await requestPermission();
    if (result === 'granted') {
      console.log('Notification permission granted (no subscription action in MVP)');
      // Future: Call Story 2.3 API to subscribe
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Push notifications are not supported in this browser.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
        </CardTitle>
        <CardDescription>
          Enable push notifications to receive updates about OT requests, approvals, and important alerts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {permission === 'granted' ? (
          <div className="flex items-center gap-2 text-green-600">
            <Check className="h-5 w-5" />
            <span>Notifications Enabled</span>
          </div>
        ) : permission === 'denied' ? (
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Notifications Blocked</p>
            <p className="mt-1">
              You've blocked notifications for this site. To enable, update your browser settings:
            </p>
            <ol className="list-decimal ml-4 mt-2">
              <li>Open browser settings</li>
              <li>Find "Site Settings" or "Permissions"</li>
              <li>Locate notifications for this site</li>
              <li>Change permission to "Allow"</li>
            </ol>
          </div>
        ) : (
          <div>
            <Button onClick={handleEnableNotifications}>
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Get notified when your OT requests are approved, rejected, or require action.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
