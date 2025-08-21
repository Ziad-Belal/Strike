// supabase/functions/create-order-and-notify/index.ts

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This is the main function that runs when it's called
serve(async (req) => {
  // This part is needed to allow your website to call the function
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    // Creates a special Supabase client that acts on behalf of the user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Gets the data for the user who is currently logged in
    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error("User not found.")

    // Gets the cart items that your website will send
    const { cartItems } = await req.json()
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty.")
    }

    // --- Database Logic ---
    // Calculates the total price
    const total_price = cartItems.reduce((total, item) => total + item.price * item.qty, 0)
    
    // Creates the new order and links it to the logged-in user's ID
    const { data: orderData } = await supabaseClient
      .from('orders')
      .insert({ total_price: total_price, user_id: user.id })
      .select()
      .single()
    
    const order_id = orderData.id
    const orderItemsToInsert = cartItems.map(item => ({
      order_id: order_id,
      product_id: item.id,
      quantity: item.qty,
      price: item.price
    }))

    // Creates the order items
    await supabaseClient.from('order_items').insert(orderItemsToInsert)
    
    // --- Email Logic ---
    // We will use a free email service called Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
            from: 'onboarding@resend.dev', // This is required by Resend's free plan
            to: 'Strikeathletics1@gmail.com',
            subject: 'New User Checkout!',
            html: `
              <h1>New Order Placed</h1>
              <p>An order was placed by a registered user.</p>
              <h3>User Details:</h3>
              <ul>
                <li><strong>User ID:</strong> ${user.id}</li>
                <li><strong>Email:</strong> ${user.email}</li>
              </ul>
              <h3>Order Details:</h3>
              <ul>
                <li><strong>Order ID:</strong> ${order_id}</li>
                <li><strong>Total Price:</strong> $${total_price.toFixed(2)}</li>
              </ul>
            `
        })
    })

    // --- Success ---
    // Send a success message back to your website
    return new Response(JSON.stringify({ orderId: order_id }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })

  } catch (error) {
    // --- Error ---
    // If anything goes wrong, send an error message back
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})