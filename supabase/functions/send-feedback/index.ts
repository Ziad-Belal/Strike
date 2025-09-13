// supabase/functions/send-feedback/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // --- THIS IS THE CRITICAL FIX ---
  // These headers are essential for security and to allow your website to call the function.
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  // This handles the "preflight" request from the browser. It must be here.
  if (req.method === 'OPTIONS') { 
    return new Response('ok', { headers: corsHeaders }) 
  }
 

  try {
    const { email, message } = await req.json()
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'strikeathletics1@gmail.com',
        subject: `New Message from ${email}`,
        html: `<p>From: ${email}</p><p>Message: ${message}</p>`
      })
    })
    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})