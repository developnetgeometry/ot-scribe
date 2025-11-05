import { AppLayout } from '@/components/AppLayout';
import { PWAInstallSection } from '@/components/pwa/PWAInstallSection';
import { NotificationSettings } from '@/components/pwa/NotificationSettings';
import { HRSettingsSection } from '@/components/settings/HRSettingsSection';

/**
 * General Settings Page
 *
 * Accessible to all authenticated users regardless of role.
 * Currently includes:
 * - PWA Installation settings
 * - Notification settings (hidden by feature flag)
 *
 * Future sections could include:
 * - User preferences
 * - Display settings (theme, language, etc.)
 *
 * @returns {JSX.Element} Settings page component
 */
export default function Settings() {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your app preferences and settings</p>
        </div>

        <PWAInstallSection />

        <HRSettingsSection />

        <NotificationSettings />

        {/* Future settings sections can be added here */}
      </div>
    </AppLayout>
  );
}
