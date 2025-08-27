// supabase/functions/create-order-and-notify/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    // --- Setup ---
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const { cartItems } = await req.json()
    
    // --- Get User & Profile Data ---
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("User not found.")
    
    const { data: profileData } = await supabaseClient.from('profiles').select('*').eq('id', user.id).single()
    if (!profileData) throw new Error("Profile not found.")

    // --- Create Order in Database ---
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
            to: 'Strikeathletics1@gmail.com',
            subject: `New Order Received! (#${order_id})`,
            html: `
              <h1>New Order Received!</h1>
              <h2>Customer Details:</h2>
              <ul>
                <li><strong>Name:</strong> ${profileData.full_name || 'Not provided'}</li>
                <li><strong>Email:</strong> ${user.email}</li>
                <li><strong>Phone:</strong> ${profileData.phone_number || 'Not provided'}</li>
                <li><strong>Address:</strong> ${profileData.address_line1 || 'Not provided'}</li>
              </ul>
              <h2>Order Details:</h2>
              <p>Total Price: $${total_price.toFixed(2)}</p>
              <!-- You could add a list of items here too -->
            `
        })
    })

    // --- EMAIL 2: Send "Thank You" to CUSTOMER ---
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({
            from: 'Strike Admins <onboarding@resend.dev>', // Sender name appears in inbox
            to: user.email,
            subject: 'Thank you for your order from Strike!',
            html: `
              <h1>Thank You For Your Order!</h1>
              <p>Hi ${profileData.full_name || 'Valued Customer'},</p>
              <p>We've received your order and will contact you shortly to arrange payment and delivery.</p>
              <p>Your Order ID is: <strong>#${order_id}</strong></p>
              <p>Thank you for shopping with Strike!</p>
            `
        })
    })

    // --- Success ---
    return new Response(JSON.stringify({ orderId: order_id }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }, status: 400,
    })
  }
})