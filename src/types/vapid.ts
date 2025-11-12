/**
 * VAPID (Voluntary Application Server Identification) Type Definitions
 *
 * These types define the structure for VAPID configuration and API responses
 * used in the push notification system.
 *
 * VAPID provides authenticated push message delivery from application server
 * to push services (FCM, Mozilla, etc.), ensuring secure identification.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc8292
 */

/**
 * VAPID Configuration Interface
 *
 * Defines the structure for VAPID keys and subject configuration.
 * These values are used server-side for authenticated push message delivery.
 *
 * @property publicKey - VAPID public key (safe to expose to clients)
 * @property privateKey - VAPID private key (MUST be kept secure, server-side only)
 * @property subject - Contact email in mailto: format (required by VAPID spec)
 *
 * @example
 * ```typescript
 * const vapidConfig: VAPIDConfiguration = {
 *   publicKey: 'BHBn86fJFoTMcExqtT1ub836W-mxs...',
 *   privateKey: 'MAwHXOMGTeMHoZlTYwh3wKAAhbRb...',
 *   subject: 'mailto:admin@otms.com'
 * };
 * ```
 */
export interface VAPIDConfiguration {
  publicKey: string;
  privateKey: string;
  subject: string;
}

/**
 * VAPID Public Key API Response
 *
 * Response structure from the VAPID public key endpoint.
 * Frontend uses this to retrieve the public key for push subscription.
 *
 * @property publicKey - VAPID public key for frontend subscription
 * @property success - Indicates if the request was successful
 *
 * @example
 * ```typescript
 * const response: VAPIDPublicKeyResponse = {
 *   publicKey: 'BHBn86fJFoTMcExqtT1ub836W-mxs...',
 *   success: true
 * };
 * ```
 */
export interface VAPIDPublicKeyResponse {
  publicKey: string;
  success: boolean;
}

/**
 * VAPID Error Response
 *
 * Error response structure from VAPID-related API endpoints.
 *
 * @property success - Always false for error responses
 * @property error - Error message describing what went wrong
 *
 * @example
 * ```typescript
 * const errorResponse: VAPIDErrorResponse = {
 *   success: false,
 *   error: 'VAPID configuration not found'
 * };
 * ```
 */
export interface VAPIDErrorResponse {
  success: false;
  error: string;
}

/**
 * Union type for all possible VAPID API responses
 *
 * @example
 * ```typescript
 * async function getVAPIDPublicKey(): Promise<VAPIDAPIResponse> {
 *   const response = await fetch('/api/vapid-public-key');
 *   return response.json();
 * }
 * ```
 */
export type VAPIDAPIResponse = VAPIDPublicKeyResponse | VAPIDErrorResponse;
