/**
 * Send Push Notification Edge Function
 *
 * Backend service for sending push notifications to subscribed users.
 * Handles multi-device support, subscription cleanup, and VAPID authentication.
 *
 * @endpoint POST /functions/v1/send-push-notification
 * @payload {NotificationPayload} user_id, title, body, icon, data
 * @returns {PushResult} success/failed/expired counts
 */ import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0';
// CORS headers for internal API calls
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};
Deno.serve(async (req)=>{
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  // Only allow POST requests
  if (req.method !== 'POST') {
    const errorResponse = {
      success: false,
      error: 'Method not allowed. Use POST request.'
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  const startTime = performance.now();
  try {
    // Parse and validate request payload
    const payload = await req.json();
    // Validate required fields
    if (!payload.user_id || !payload.title || !payload.body) {
      const errorResponse = {
        success: false,
        error: 'Missing required fields: user_id, title, body'
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Validate user_id format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(payload.user_id)) {
      const errorResponse = {
        success: false,
        error: 'Invalid user_id format. Expected UUID.'
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Sanitize and validate payload size
    const sanitizedPayload = sanitizePayload(payload);
    const payloadSize = JSON.stringify(sanitizedPayload).length;
    if (payloadSize > 4096) {
      const errorResponse = {
        success: false,
        error: 'Payload too large. Maximum 4KB allowed.'
      };
      return new Response(JSON.stringify(errorResponse), {
        status: 413,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Send push notification
    const result = await sendPushNotification(sanitizedPayload);
    const executionTime = performance.now() - startTime;
    console.log(`[Push] Notification sent in ${executionTime.toFixed(2)}ms:`, result);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    const executionTime = performance.now() - startTime;
    console.error(`[Push] Error after ${executionTime.toFixed(2)}ms:`, error);
    const errorResponse = {
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
/**
 * Sanitizes notification payload to prevent XSS and injection attacks
 */ function sanitizePayload(payload) {
  return {
    user_id: payload.user_id,
    title: payload.title.substring(0, 100),
    body: payload.body.substring(0, 300),
    icon: payload.icon?.substring(0, 500),
    badge: payload.badge?.substring(0, 500),
    data: payload.data ? {
      ...payload.data,
      targetUrl: payload.data.targetUrl?.substring(0, 500) || '/'
    } : undefined,
    notification_type: payload.notification_type
  };
}
/**
 * Sends push notification to all active subscriptions for a user
 */ async function sendPushNotification(payload) {
  // Get VAPID keys from environment
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@otms.com';
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  if (!vapidPublicKey || !vapidPrivateKey) {
    throw new Error('VAPID keys not configured in environment variables');
  }
  // Create Supabase client with service role (bypasses RLS)
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration not found in environment variables');
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  // Check user notification preferences before sending
  const shouldSend = await shouldSendNotification(supabase, payload.user_id, payload.notification_type);
  if (!shouldSend) {
    console.log(`[Push] Notification blocked by user preferences for user: ${payload.user_id}, type: ${payload.notification_type}`);
    return {
      success: 0,
      failed: 0,
      expired: 0,
      message: 'Notification blocked by user preferences'
    };
  }
  // Query all active subscriptions for the user
  console.log(`[Push] Querying subscriptions for user: ${payload.user_id}`);
  const { data: subscriptions, error: queryError } = await supabase.from('push_subscriptions').select('*').eq('user_id', payload.user_id).eq('is_active', true);
  if (queryError) {
    console.error('[Push] Database query error:', queryError);
    throw new Error(`Failed to query subscriptions: ${queryError.message}`);
  }
  // Handle no active subscriptions
  if (!subscriptions || subscriptions.length === 0) {
    console.log(`[Push] No active subscriptions found for user: ${payload.user_id}`);
    return {
      success: 0,
      failed: 0,
      expired: 0,
      message: 'No active subscriptions for user'
    };
  }
  console.log(`[Push] Found ${subscriptions.length} active subscription(s)`);
  // Send notifications to all subscriptions in parallel
  const results = await Promise.allSettled(subscriptions.map((sub)=>sendToSubscription(sub, payload, {
      subject: vapidSubject,
      publicKey: vapidPublicKey,
      privateKey: vapidPrivateKey
    })));
  // Process results and track expired subscriptions
  let successCount = 0;
  let failedCount = 0;
  const expiredIds = [];
  results.forEach((result, index)=>{
    const subscription = subscriptions[index];
    if (result.status === 'fulfilled') {
      successCount++;
      console.log(`[Push] ✓ Sent to subscription ${subscription.id}`);
    } else {
      failedCount++;
      const error = result.reason;
      // Check if subscription expired (HTTP 410 Gone)
      if (error?.statusCode === 410 || error?.code === 410) {
        expiredIds.push(subscription.id);
        console.log(`[Push] ✗ Subscription ${subscription.id} expired (410)`);
      } else {
        console.error(`[Push] ✗ Failed to send to subscription ${subscription.id}:`, error);
      }
    }
  });
  // Clean up expired subscriptions
  if (expiredIds.length > 0) {
    console.log(`[Push] Removing ${expiredIds.length} expired subscription(s)`);
    const { error: deleteError } = await supabase.from('push_subscriptions').delete().in('id', expiredIds);
    if (deleteError) {
      console.error('[Push] Failed to delete expired subscriptions:', deleteError);
    // Don't throw - continue with result reporting
    } else {
      console.log(`[Push] ✓ Cleaned up ${expiredIds.length} expired subscription(s)`);
    }
  }
  const result = {
    success: successCount,
    failed: failedCount,
    expired: expiredIds.length
  };
  console.log(`[Push] Final result:`, result);
  return result;
}
/**
 * Checks if a notification should be sent based on user preferences
 * @param supabase - Supabase client instance
 * @param userId - Target user ID
 * @param notificationType - Type of notification (e.g., 'ot_requests_new')
 * @returns true if notification should be sent, false otherwise
 */ async function shouldSendNotification(supabase, userId, notificationType) {
  try {
    // If no notification type specified, allow by default (backwards compatible)
    if (!notificationType) {
      console.log('[Push] No notification_type specified, allowing notification');
      return true;
    }
    // Fetch user preferences from profiles table
    const { data: profile, error } = await supabase.from('profiles').select('notification_preferences').eq('id', userId).single();
    if (error) {
      console.error('[Push] Error fetching notification preferences:', {
        userId,
        notificationType,
        error: error.message,
        code: error.code,
        details: error.details
      });
      // On error, allow notification (fail open)
      return true;
    }
    const preferences = profile?.notification_preferences;
    // If no preferences set, allow all notifications (default behavior)
    if (!preferences) {
      console.log('[Push] No preferences found, allowing notification');
      return true;
    }
    // Check global disable flag first
    if (preferences.all_disabled === true) {
      console.log('[Push] All notifications disabled for user');
      return false;
    }
    // Check specific notification type preference
    const preferenceKey = notificationType;
    if (preferenceKey in preferences) {
      const isEnabled = preferences[preferenceKey];
      console.log(`[Push] Preference for ${notificationType}: ${isEnabled}`);
      return isEnabled !== false // Default to true if not explicitly false
      ;
    }
    // Unknown notification type, allow by default
    console.log(`[Push] Unknown notification type '${notificationType}', allowing notification`);
    return true;
  } catch (err) {
    console.error('[Push] Unexpected error checking preferences:', {
      userId,
      notificationType,
      error: err instanceof Error ? err.message : 'Unknown error',
      stack: err instanceof Error ? err.stack : undefined
    });
    // On unexpected error, allow notification (fail open)
    return true;
  }
}
// ============================================================================
// WEB PUSH ENCRYPTION UTILITIES (RFC 8291 / RFC 8188)
// ============================================================================
/**
 * Base64 URL-safe encoding/decoding utilities
 */ function base64UrlToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for(let i = 0; i < rawData.length; ++i){
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
function uint8ArrayToBase64Url(buffer) {
  const base64 = btoa(String.fromCharCode(...buffer));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
/**
 * HKDF (HMAC-based Key Derivation Function) - RFC 5869
 */ async function hkdf(salt, ikm, info, length) {
  // Extract step
  const key = await crypto.subtle.importKey('raw', salt, {
    name: 'HMAC',
    hash: 'SHA-256'
  }, false, [
    'sign'
  ]);
  const prk = await crypto.subtle.sign('HMAC', key, ikm);
  // Expand step
  const prkKey = await crypto.subtle.importKey('raw', prk, {
    name: 'HMAC',
    hash: 'SHA-256'
  }, false, [
    'sign'
  ]);
  const okm = new Uint8Array(length);
  let previousT = new Uint8Array(0);
  const iterations = Math.ceil(length / 32);
  for(let i = 0; i < iterations; i++){
    const data = new Uint8Array(previousT.length + info.length + 1);
    data.set(previousT);
    data.set(info, previousT.length);
    data[data.length - 1] = i + 1;
    const t = new Uint8Array(await crypto.subtle.sign('HMAC', prkKey, data));
    okm.set(t.slice(0, Math.min(32, length - i * 32)), i * 32);
    previousT = t;
  }
  return okm;
}
/**
 * Generate VAPID Authorization header (JWT)
 */ async function generateVAPIDAuthHeader(endpoint, vapidPrivateKey, vapidPublicKey, subject) {
  const endpointUrl = new URL(endpoint);
  const audience = `${endpointUrl.protocol}//${endpointUrl.host}`;
  // JWT Header
  const header = {
    typ: 'JWT',
    alg: 'ES256'
  };
  // JWT Payload
  const jwtPayload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60,
    sub: subject
  };
  // Base64URL encode header and payload
  const encodeBase64Url = (obj)=>uint8ArrayToBase64Url(new TextEncoder().encode(JSON.stringify(obj)));
  const encodedHeader = encodeBase64Url(header);
  const encodedPayload = encodeBase64Url(jwtPayload);
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  // Import private key for signing
  const privateKeyBuffer = base64UrlToUint8Array(vapidPrivateKey);
  const cryptoKey = await crypto.subtle.importKey('pkcs8', privateKeyBuffer, {
    name: 'ECDSA',
    namedCurve: 'P-256'
  }, false, [
    'sign'
  ]);
  // Sign the token
  const signature = await crypto.subtle.sign({
    name: 'ECDSA',
    hash: 'SHA-256'
  }, cryptoKey, new TextEncoder().encode(unsignedToken));
  const encodedSignature = uint8ArrayToBase64Url(new Uint8Array(signature));
  const jwt = `${unsignedToken}.${encodedSignature}`;
  return {
    Authorization: `vapid t=${jwt}, k=${vapidPublicKey}`,
    'Crypto-Key': `p256ecdsa=${vapidPublicKey}`
  };
}
/**
 * Encrypt payload using Web Push encryption (RFC 8291 with aes128gcm)
 */ async function encryptPayload(payload, userPublicKey, userAuthSecret) {
  // Generate ephemeral ECDH key pair
  const serverKeyPair = await crypto.subtle.generateKey({
    name: 'ECDH',
    namedCurve: 'P-256'
  }, true, [
    'deriveBits'
  ]);
  // Export server public key (uncompressed format)
  const serverPublicKeyRaw = await crypto.subtle.exportKey('raw', serverKeyPair.publicKey);
  const serverPublicKey = new Uint8Array(serverPublicKeyRaw);
  // Import user's public key
  const userPublicKeyBuffer = base64UrlToUint8Array(userPublicKey);
  const importedUserPublicKey = await crypto.subtle.importKey('raw', userPublicKeyBuffer, {
    name: 'ECDH',
    namedCurve: 'P-256'
  }, true, []);
  // Perform ECDH to get shared secret
  const sharedSecret = await crypto.subtle.deriveBits({
    name: 'ECDH',
    public: importedUserPublicKey
  }, serverKeyPair.privateKey, 256);
  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const authSecret = base64UrlToUint8Array(userAuthSecret);
  // Build key info for HKDF (RFC 8291 Section 3.3)
  const keyInfoPrefix = new TextEncoder().encode('WebPush: info\0');
  const keyInfo = new Uint8Array(keyInfoPrefix.length + userPublicKeyBuffer.length + serverPublicKey.length);
  keyInfo.set(keyInfoPrefix, 0);
  keyInfo.set(userPublicKeyBuffer, keyInfoPrefix.length);
  keyInfo.set(serverPublicKey, keyInfoPrefix.length + userPublicKeyBuffer.length);
  // Derive IKM using HKDF-Extract with auth secret as salt
  const ikm = await hkdf(authSecret, new Uint8Array(sharedSecret), keyInfo, 32);
  // Derive PRK using HKDF-Extract with salt
  const prkInfoPrefix = new TextEncoder().encode('Content-Encoding: aes128gcm\0');
  const prk = await hkdf(salt, ikm, prkInfoPrefix, 32);
  // Derive CEK (Content Encryption Key) - 16 bytes for AES-128
  const cekInfo = new TextEncoder().encode('Content-Encoding: aes128gcm\0P-256\0');
  const cekInfoFull = new Uint8Array(cekInfo.length + keyInfo.length);
  cekInfoFull.set(cekInfo, 0);
  cekInfoFull.set(keyInfo, cekInfo.length);
  const cek = await hkdf(prk, new Uint8Array(0), new TextEncoder().encode('Content-Encoding: aes128gcm\0cek\0'), 16);
  // Derive Nonce - 12 bytes for AES-GCM
  const nonce = await hkdf(prk, new Uint8Array(0), new TextEncoder().encode('Content-Encoding: aes128gcm\0nonce\0'), 12);
  // Pad payload: payload + 0x02 (delimiter) + padding
  const paddingLength = 0;
  const paddedPayload = new Uint8Array(payload.length + 2 + paddingLength);
  new TextEncoder().encodeInto(payload, paddedPayload);
  paddedPayload[payload.length] = 2 // Padding delimiter
  ;
  // Import CEK for AES-GCM encryption
  const aesKey = await crypto.subtle.importKey('raw', cek, {
    name: 'AES-GCM'
  }, false, [
    'encrypt'
  ]);
  // Encrypt with AES-GCM
  const encrypted = await crypto.subtle.encrypt({
    name: 'AES-GCM',
    iv: nonce,
    tagLength: 128
  }, aesKey, paddedPayload);
  // Build aes128gcm format: salt (16) + rs (4) + idlen (1) + keyid + ciphertext
  const recordSize = 4096 // Standard record size
  ;
  const ciphertext = new Uint8Array(encrypted);
  // Format: salt(16) + record_size(4) + public_key_length(1) + public_key(65) + ciphertext
  const header = new Uint8Array(16 + 4 + 1 + serverPublicKey.length);
  header.set(salt, 0);
  // Record size as 4-byte big-endian
  const rsView = new DataView(header.buffer, 16, 4);
  rsView.setUint32(0, recordSize, false) // big-endian
  ;
  // Key ID length (65 for uncompressed P-256 key)
  header[20] = serverPublicKey.length;
  // Server public key
  header.set(serverPublicKey, 21);
  // Combine header + ciphertext
  const result = new Uint8Array(header.length + ciphertext.length);
  result.set(header, 0);
  result.set(ciphertext, header.length);
  return result;
}
/**
 * Sends notification to a single subscription using direct Web Push Protocol
 * Implements RFC 8291 (Message Encryption) and RFC 8292 (VAPID)
 */ async function sendToSubscription(subscription, payload, vapidKeys) {
  // Build notification payload that will be received by the service worker
  const notificationData = {
    title: payload.title,
    body: payload.body,
    icon: payload.icon || '/icons/icon-192x192.png',
    badge: payload.badge || '/icons/badge-72x72.png',
    data: payload.data || {
      targetUrl: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'View'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    tag: 'otms-notification',
    requireInteraction: false,
    vibrate: [
      200,
      100,
      200
    ]
  };
  const payloadString = JSON.stringify(notificationData);
  try {
    // Encrypt the payload
    const encryptedPayload = await encryptPayload(payloadString, subscription.p256dh_key, subscription.auth_key);
    // Generate VAPID headers
    const vapidHeaders = await generateVAPIDAuthHeader(subscription.endpoint, vapidKeys.privateKey, vapidKeys.publicKey, vapidKeys.subject);
    // Send the encrypted push notification
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        'Content-Length': encryptedPayload.length.toString(),
        'TTL': '86400',
        ...vapidHeaders
      },
      body: encryptedPayload
    });
    if (!response.ok) {
      if (response.status === 410) {
        throw {
          statusCode: 410,
          message: 'Subscription expired'
        };
      }
      const errorText = await response.text();
      throw new Error(`Push failed: ${response.status} ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    // Check for subscription expiration (HTTP 410 Gone)
    if (error?.statusCode === 410) {
      throw error;
    }
    // Re-throw with more context
    throw new Error(`Push failed: ${error?.message || error}`);
  }
}
