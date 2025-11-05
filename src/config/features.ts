// src/config/features.ts

/**
 * Feature Flags for OTMS
 * Control visibility of experimental or upcoming features
 */

/**
 * ENABLE_PUSH_NOTIFICATIONS
 *
 * Controls visibility of push notification UI (Settings page section)
 *
 * MVP: Set to FALSE (infrastructure only, not active)
 * Future: Set to TRUE when ready to activate push notifications
 *
 * Dependencies:
 * - Service worker push handlers (Story 2.2)
 * - Push subscription API (Story 2.3)
 * - Backend push sending infrastructure (future)
 */
export const ENABLE_PUSH_NOTIFICATIONS = false;

// Future feature flags can be added here
// export const ENABLE_OFFLINE_MODE = false;
// export const ENABLE_BACKGROUND_SYNC = false;
