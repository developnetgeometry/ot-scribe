import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.77.0'

// TypeScript interfaces
interface PushSubscriptionRequest {
  action: 'subscribe' | 'unsubscribe';
  subscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  endpoint?: string; // For unsubscribe
}

interface PushSubscriptionResponse {
  success: boolean;
  message: string;
  subscriptionId?: string;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: { headers: { Authorization: authHeader } },
        auth: {
          persistSession: false,
        }
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ success: false, message: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const requestData: PushSubscriptionRequest = await req.json()

    if (requestData.action === 'subscribe') {
      // Subscribe action
      if (!requestData.subscription) {
        return new Response(
          JSON.stringify({ success: false, message: 'Missing subscription object' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { endpoint, keys } = requestData.subscription

      // Validate subscription structure
      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        return new Response(
          JSON.stringify({ success: false, message: 'Invalid subscription object structure' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Upsert subscription (insert or update if exists)
      const { data, error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: user.id,
          endpoint,
          p256dh_key: keys.p256dh,
          auth_key: keys.auth,
          is_active: true
        }, {
          onConflict: 'user_id,endpoint'
        })
        .select('id')
        .single()

      if (error) {
        console.error('Subscription insert error:', error)
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to save subscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Subscription saved',
          subscriptionId: data.id
        } as PushSubscriptionResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else if (requestData.action === 'unsubscribe') {
      // Unsubscribe action
      if (!requestData.endpoint) {
        return new Response(
          JSON.stringify({ success: false, message: 'Missing endpoint' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id)
        .eq('endpoint', requestData.endpoint)

      if (error) {
        console.error('Subscription delete error:', error)
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to delete subscription' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Subscription removed' } as PushSubscriptionResponse),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid action (must be subscribe or unsubscribe)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
