/**
 * VAPID Key Generation Script
 *
 * Generates a VAPID public/private key pair for secure push notification delivery.
 * VAPID (Voluntary Application Server Identification) provides authenticated
 * push message delivery from application server to push services.
 *
 * Usage:
 *   node scripts/generate-vapid-keys.js
 *
 * Output:
 *   Prints VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY to console
 *   Copy these values to your .env.local file for development
 *
 * Security:
 *   - Keep private key secure and never commit to version control
 *   - Use separate keys for development and production environments
 *   - Public key is safe to expose via API endpoint
 */

const webpush = require('web-push');

console.log('🔑 Generating VAPID Keys for Push Notifications...\n');

try {
  // Generate VAPID key pair
  const vapidKeys = webpush.generateVAPIDKeys();

  console.log('✅ VAPID Keys Generated Successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Add these environment variables to your .env.local file:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
  console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
  console.log('VAPID_SUBJECT=mailto:admin@otms.com');

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('⚠️  SECURITY NOTES:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('• NEVER commit private key to version control');
  console.log('• Use separate keys for development and production');
  console.log('• Public key is safe to expose via API endpoint');
  console.log('• Configure VAPID_SUBJECT with monitored email address');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Demonstrate VAPID details configuration
  webpush.setVapidDetails(
    'mailto:admin@otms.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );

  console.log('✅ VAPID details validated successfully!');
  console.log('📝 Keys are ready for use in push notification system.\n');

} catch (error) {
  console.error('❌ Error generating VAPID keys:', error);
  process.exit(1);
}
