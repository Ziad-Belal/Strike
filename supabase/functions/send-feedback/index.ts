// supabase/functions/send-feedback/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  // These headers are correct and allow your website to call the function.
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') { 
    return new Response('ok', { headers: corsHeaders }) 
  }

  try {
    const { email, message } = await req.json()
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    // --- THIS IS THE ONLY CHANGED PART ---
    // We will now check the response from Resend to see if it was successful.
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: 'ziadbelal82@gmail.com',
        subject: `New Message from ${email}`,
        html: `<p>From: ${email}</p><p>Message: ${message}</p>`
      })
    })

    // If the response is not "ok" (e.g., a 4xx or 5xx error), we throw an error.
    if (!res.ok) {
      const errorBody = await res.json();
      console.error("Resend API Error:", errorBody); // This will show in your Supabase logs
      throw new Error(errorBody.message || 'Failed to send email.');
    }
    // --- END OF CHANGE ---

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})