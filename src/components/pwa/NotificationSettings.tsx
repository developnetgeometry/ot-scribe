// src/components/pwa/NotificationSettings.tsx
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useNotificationPermission } from '@/hooks/useNotificationPermission';
import { usePushSubscription } from '@/hooks/usePushSubscription';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useAuth } from '@/hooks/useAuth';
import { ENABLE_PUSH_NOTIFICATIONS } from '@/config/features';
import { Bell, BellOff, Check, Loader2, AlertCircle, Settings2, TestTube } from 'lucide-react';
import { toast } from 'sonner';
import { NOTIFICATION_TYPES } from '@/types/notifications';
import { Separator } from '@/components/ui/separator';
// import { supabase } from '@/integrations/supabase/client';

export const NotificationSettings = () => {
  const { permission, requestPermission, isSupported } = useNotificationPermission();
  const { isSubscribed, isLoading, error, subscribe, unsubscribe } = usePushSubscription();
  const { preferences, isLoading: isLoadingPreferences, updatePreference } = useNotificationPreferences();
  const { roles, user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  // const [isSendingTest, setIsSendingTest] = useState(false);
  // const [isCheckingDB, setIsCheckingDB] = useState(false);

  // Feature flag check: hide component if push notifications not enabled
  if (!ENABLE_PUSH_NOTIFICATIONS) return null;

  const handleEnableNotifications = async () => {
    setIsProcessing(true);
    try {
      // Step 1: Request permission
      const permissionResult = await requestPermission();

      if (permissionResult === 'granted') {
        // Step 2: Subscribe to push notifications
        const subscribeResult = await subscribe();

        if (subscribeResult) {
          toast.success('Notifications enabled successfully', {
            description: 'You will now receive updates about OT requests and approvals.'
          });
        } else {
          toast.error('Failed to enable notifications', {
            description: error || 'Please try again later.'
          });
        }
      } else if (permissionResult === 'denied') {
        toast.error('Notification permission denied', {
          description: 'Please enable notifications in your browser settings.'
        });
      }
    } catch (err) {
      console.error('Error enabling notifications:', err);
      toast.error('Failed to enable notifications', {
        description: 'An unexpected error occurred.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleNotifications = async (enabled: boolean) => {
    if (enabled) {
      // Re-subscribe (should rarely happen, but handle it)
      await handleEnableNotifications();
    } else {
      // Unsubscribe
      setIsProcessing(true);
      try {
        const result = await unsubscribe();

        if (result) {
          toast.success('Notifications disabled', {
            description: 'You will no longer receive push notifications.'
          });
        } else {
          toast.error('Failed to disable notifications', {
            description: error || 'Please try again later.'
          });
        }
      } catch (err) {
        console.error('Error disabling notifications:', err);
        toast.error('Failed to disable notifications', {
          description: 'An unexpected error occurred.'
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  // Handler for global disable all notifications
  const handleDisableAllNotifications = async (disabled: boolean) => {
    setIsProcessing(true);
    try {
      // Update preference first
      const preferenceUpdated = await updatePreference('all_disabled', disabled);

      if (!preferenceUpdated) {
        setIsProcessing(false);
        return;
      }

      if (disabled) {
        // Unsubscribe from push notifications
        const unsubscribeResult = await unsubscribe();

        if (unsubscribeResult) {
          toast.success('All notifications disabled', {
            description: 'You will not receive any push notifications.'
          });
        }
      } else {
        // Re-subscribe using existing permission
        if (permission === 'granted') {
          const subscribeResult = await subscribe();

          if (subscribeResult) {
            toast.success('Notifications re-enabled', {
              description: 'Your notification preferences have been restored.'
            });
          }
        } else {
          // Permission not granted, just update preference
          toast.success('Notifications re-enabled', {
            description: 'Enable push notifications to start receiving alerts.'
          });
        }
      }
    } catch (err) {
      console.error('Error toggling all notifications:', err);
      toast.error('Failed to update notification settings', {
        description: 'An unexpected error occurred.'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler for individual preference toggles
  const handlePreferenceToggle = async (key: keyof typeof preferences, value: boolean) => {
    const success = await updatePreference(key, value);

    if (success) {
      toast.success('Preference updated', {
        description: 'Your notification settings have been saved.'
      });
    }
  };

  // ============================================================================
  // TESTING & DIAGNOSTICS (COMMENTED OUT FOR PRODUCTION)
  // ============================================================================
  // Uncomment these functions for testing push notifications in development

  // // Handler for checking database subscriptions
  // const handleCheckDatabaseSubscriptions = async () => {
  //   if (!user?.id) {
  //     toast.error('User not authenticated');
  //     return;
  //   }
  //
  //   setIsCheckingDB(true);
  //   try {
  //     const { data, error } = await supabase
  //       .from('push_subscriptions')
  //       .select('*')
  //       .eq('user_id', user.id)
  //       .eq('is_active', true);
  //
  //     if (error) {
  //       console.error('Database check error:', error);
  //       toast.error('Failed to check database', {
  //         description: error.message
  //       });
  //     } else {
  //       console.log('Active subscriptions in database:', data);
  //       toast.info(`Found ${data?.length || 0} subscription(s)`, {
  //         description: data?.length === 0
  //           ? 'Try toggling notifications off and on to re-subscribe'
  //           : 'Subscriptions found and active'
  //       });
  //     }
  //   } catch (err) {
  //     console.error('Unexpected error checking database:', err);
  //     toast.error('Failed to check database');
  //   } finally {
  //     setIsCheckingDB(false);
  //   }
  // };
  //
  // // Handler for sending test notification
  // const handleSendTestNotification = async () => {
  //   if (!user?.id) {
  //     toast.error('User not authenticated');
  //     return;
  //   }
  //
  //   setIsSendingTest(true);
  //   try {
  //     console.log('Sending test notification for user:', user.id);
  //
  //     const { data, error } = await supabase.functions.invoke('send-push-notification', {
  //       body: {
  //         user_id: user.id,
  //         title: 'Test Notification',
  //         body: 'This is a test push notification from OTMS. If you see this, push notifications are working correctly!',
  //         icon: '/icons/icon-192x192.png',
  //         data: {
  //           targetUrl: '/employee/dashboard',
  //           type: 'test_notification'
  //         }
  //         // Note: notification_type intentionally omitted for test - bypasses preference checks
  //       }
  //     });
  //
  //     if (error) {
  //       console.error('Test notification error:', error);
  //       toast.error('Failed to send test notification', {
  //         description: error.message || 'Please check the console for details.'
  //       });
  //     } else {
  //       console.log('Test notification result:', data);
  //
  //       if (data.success === 0) {
  //         toast.warning('No active subscriptions found', {
  //           description: 'You may need to re-subscribe to push notifications. Try toggling notifications off and on again.'
  //         });
  //       } else {
  //         toast.success('Test notification sent!', {
  //           description: `Sent to ${data.success} device(s). Check your device for the notification.`
  //         });
  //       }
  //     }
  //   } catch (err) {
  //     console.error('Unexpected error sending test notification:', err);
  //     toast.error('Failed to send test notification', {
  //       description: 'An unexpected error occurred.'
  //     });
  //   } finally {
  //     setIsSendingTest(false);
  //   }
  // };
  // ============================================================================
  // END TESTING & DIAGNOSTICS
  // ============================================================================

  // Filter notification types based on user roles
  const availableNotificationTypes = NOTIFICATION_TYPES.filter(type =>
    type.roles.some(role => roles.includes(role as any))
  );

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

  // Determine current permission state display
  const getPermissionStateText = () => {
    if (permission === 'granted') return 'Granted';
    if (permission === 'denied') return 'Denied';
    return 'Not Asked';
  };

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
      <CardContent className="space-y-4">
        {/* Permission State Display */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Permission Status</p>
            <p className="text-xs text-muted-foreground">
              Current browser permission: <span className="font-medium">{getPermissionStateText()}</span>
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Main Content Based on State */}
        {permission === 'granted' && isSubscribed ? (
          // Subscribed State - Show Toggle
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              <span className="font-medium">Notifications Enabled</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Push Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive real-time updates
                </p>
              </div>
              <Switch
                checked={isSubscribed}
                onCheckedChange={handleToggleNotifications}
                disabled={isProcessing || isLoading}
              />
            </div>
          </div>
        ) : permission === 'granted' && !isSubscribed ? (
          // Permission granted but not subscribed - Offer subscription
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Permission granted. Complete setup to receive notifications.
            </p>
            <Button
              onClick={handleEnableNotifications}
              disabled={isProcessing || isLoading}
            >
              {isProcessing || isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Complete Setup
                </>
              )}
            </Button>
          </div>
        ) : permission === 'denied' ? (
          // Permission Denied State
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <BellOff className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Notifications Blocked</p>
                <p className="mt-1">
                  You've blocked notifications for this site. To enable, update your browser settings:
                </p>
              </div>
            </div>
            <ol className="list-decimal ml-7 space-y-1">
              <li>Open browser settings</li>
              <li>Find "Site Settings" or "Permissions"</li>
              <li>Locate notifications for this site</li>
              <li>Change permission to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        ) : (
          // Default State - Offer to Enable
          <div className="space-y-3">
            <Button
              onClick={handleEnableNotifications}
              disabled={isProcessing || isLoading}
            >
              {isProcessing || isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Bell className="h-4 w-4 mr-2" />
                  Enable Notifications
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              Get notified when your OT requests are approved, rejected, or require action.
            </p>
          </div>
        )}

        {/* ===== TESTING UI (COMMENTED OUT FOR PRODUCTION) ===== */}
        {/* Uncomment this section for testing push notifications in development */}
        {/* {permission === 'granted' && isSubscribed && (
          <>
            <Separator className="my-4" />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TestTube className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Test Notifications</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Send a test notification to verify that push notifications are working correctly
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleSendTestNotification}
                  disabled={isSendingTest || isProcessing}
                  variant="outline"
                  className="flex-1"
                >
                  {isSendingTest ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4 mr-2" />
                      Send Test
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleCheckDatabaseSubscriptions}
                  disabled={isCheckingDB || isProcessing}
                  variant="outline"
                  className="flex-1"
                >
                  {isCheckingDB ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 mr-2" />
                      Check DB
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        )} */}
        {/* ===== END TESTING UI ===== */}

        {/* Notification Preferences Section - Only show when subscribed */}
        {permission === 'granted' && isSubscribed && !preferences.all_disabled && (
          <>
            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-sm font-semibold">Notification Preferences</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Choose which types of notifications you want to receive
              </p>

              {/* Individual Notification Type Toggles */}
              <div className="space-y-3">
                {availableNotificationTypes.map((notificationType) => (
                  <div
                    key={notificationType.key}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-0.5 flex-1 mr-4">
                      <p className="text-sm font-medium">{notificationType.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {notificationType.description}
                      </p>
                    </div>
                    <Switch
                      checked={preferences[notificationType.key]}
                      onCheckedChange={(checked) =>
                        handlePreferenceToggle(notificationType.key, checked)
                      }
                      disabled={isProcessing || isLoadingPreferences}
                    />
                  </div>
                ))}
              </div>

              {/* Global Disable All Toggle */}
              <Separator className="my-3" />

              <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-3">
                <div className="space-y-0.5 flex-1 mr-4">
                  <p className="text-sm font-medium text-destructive">Disable All Notifications</p>
                  <p className="text-xs text-muted-foreground">
                    Completely unsubscribe from all push notifications
                  </p>
                </div>
                <Switch
                  checked={preferences.all_disabled}
                  onCheckedChange={handleDisableAllNotifications}
                  disabled={isProcessing || isLoadingPreferences}
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
