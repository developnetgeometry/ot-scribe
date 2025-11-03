import { AppLayout } from '@/components/AppLayout';
import { PWAInstallSection } from '@/components/pwa/PWAInstallSection';

/**
 * General Settings Page
 *
 * Accessible to all authenticated users regardless of role.
 * Currently includes:
 * - PWA Installation settings
 *
 * Future sections could include:
 * - User preferences
 * - Notification settings
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

        {/* Future settings sections can be added here */}
      </div>
    </AppLayout>
  );
}
