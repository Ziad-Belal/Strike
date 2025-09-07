// supabase/functions/create-order-and-notify/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // These are the security headers that allow your website to call this function.
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // --- Setup ---
    // This creates a special Supabase client that acts on behalf of the user who made the request.
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    // This gets your secret "password" for the email service.
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const { cartItems } = await req.json()
    
    // --- Get User Data ---
    // This securely gets the data for the user who is currently logged in.
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("User not found. Cannot place order.")

    // --- Create Order in Database ---
    // This part is now simplified. It does not need the profiles table.
    const total_price = cartItems.reduce((total, item) => total + item.price * item.qty, 0)
    const { data: orderData } = await supabaseClient.from('orders').insert({ total_price, user_id: user.id }).select().single()
    const order_id = orderData.id
    const orderItemsToInsert = cartItems.map(item => ({ order_id, product_id: item.id, quantity: item.qty, price: item.price }))
    await supabaseClient.from('order_items').insert(orderItemsToInsert)
    
    // --- EMAIL 1: Send Notification to ADMIN ---
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: 'strikeathletics1@gmail.com', // --- This is your admin email ---
            subject: `New Order Received! (#${order_id})`,
            html: `
              <h1>New Order Received!</h1>
              <p>A new order was just placed by a registered customer.</p>
              <h3>Customer Details:</h3>
              <ul>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>User ID:</strong> ${user.id}</li>
              </ul>
              <h3>Order Details:</h3>
              <p>Total Price: $${total_price.toFixed(2)}</p>
            `
        })
    })

    // --- EMAIL 2: Send "Thank You" to CUSTOMER ---
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({
            from: 'Strike Team <onboarding@resend.dev>',
            to: user.email, // Send it to the customer's email
            subject: 'Thank you for your order from Strike!',
            html: `
              <h1>Thank You For Your Order!</h1>
              <p>Hi there,</p>
              <p>We've received your order and will contact you shortly to arrange payment and delivery.</p>
              <p>Your Order ID is: <strong>#${order_id}</strong></p>
              <p>Thank you for shopping with Strike!</p>
            `
        })
    })

    // --- Success ---
    return new Response(JSON.stringify({ orderId: order_id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
    })
  }
})