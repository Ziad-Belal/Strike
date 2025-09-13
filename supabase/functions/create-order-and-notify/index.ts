// supabase/functions/create-order-and-notify/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This creates a special "Admin" client that can bypass database security rules.
function createAdminClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
}

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
  // --- END FIX ---

  try {
    const supabase = createClient( Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '', { global: { headers: { Authorization: req.headers.get('Authorization')! } } } )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not found.")

    const supabaseAdmin = createAdminClient()
    const { data: profileData } = await supabaseAdmin.from('profiles').select('*').eq('id', user.id).single()
    if (!profileData) throw new Error("Profile not found for the user.")
    
    const { cartItems } = await req.json()
    const total_price = cartItems.reduce((total, item) => total + item.price * item.qty, 0)
    
    const { data: orderData } = await supabaseAdmin.from('orders').insert({ total_price, user_id: user.id }).select().single()
    const order_id = orderData.id
    const orderItemsToInsert = cartItems.map(item => ({ order_id, product_id: item.id, quantity: item.qty, price: item.price }))
    await supabaseAdmin.from('order_items').insert(orderItemsToInsert)
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    // Email 1: To the Admin
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: 'strikeathletics1@gmail.com',
            subject: `New Order Received! (#${order_id})`,
            html: `<h1>Order from ${profileData.full_name}</h1><p>Email: ${user.email}</p><p>Phone: ${profileData.phone_number}</p><p>Address: ${profileData.address_line1}</p><p>Total: $${total_price.toFixed(2)}</p>`
        })
    });
    // Email 2: To the Customer
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({
            from: 'Strike Team <onboarding@resend.dev>',
            to: user.email,
            subject: 'Thank you for your order!',
            html: `<h1>Thank You, ${profileData.full_name}!</h1><p>Your order #${order_id} has been submitted.</p>`
        })
    });

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 })
  }
})