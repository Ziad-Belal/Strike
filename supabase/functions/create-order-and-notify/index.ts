import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') { 
    return new Response('ok', { headers: corsHeaders }) 
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', 
      { 
        global: { 
          headers: { 
            Authorization: req.headers.get('Authorization')! 
          } 
        } 
      }
    )
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("User not found.")

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get data from frontend (NEW - includes userInfo)
    const { cartItems, userInfo } = await req.json()
    
    const total_price = cartItems.reduce((total: number, item: any) => total + item.price * item.qty, 0)
    
    const { data: orderData } = await supabaseAdmin.from('orders').insert({ total_price, user_id: user.id }).select().single()
    const order_id = orderData.id
    const orderItemsToInsert = cartItems.map((item: any) => ({ order_id, product_id: item.id, quantity: item.qty, price: item.price }))
    await supabaseAdmin.from('order_items').insert(orderItemsToInsert)
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    // Create detailed order items list
    const orderItemsList = cartItems.map((item: any) => 
      `${item.name} ${item.size ? `(Size: ${item.size})` : ''} x${item.qty} - $${(item.price * item.qty).toFixed(2)}`
    ).join('<br>')
    
    // Email to Admin (using userInfo from frontend)
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: 'ziadbelal82@gmail.com',
            subject: `Order from ${userInfo.full_name}`,
            html: `
              <h2>Order from ${userInfo.full_name}</h2>
              
              <p><strong>Email:</strong> ${userInfo.email}</p>
              <p><strong>Phone:</strong> ${userInfo.phone}</p>
              <p><strong>Address:</strong> ${userInfo.address}</p>
              
              <p><strong>Total:</strong> $${total_price.toFixed(2)}</p>
              
              <h3>Items:</h3>
              <p>${orderItemsList}</p>
            `
        })
    });

    // Email to Customer
    await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({
            from: 'Strike Team <onboarding@resend.dev>',
            to: userInfo.email,
            subject: 'Thank you for your order!',
            html: `
              <h1>Thank You, ${userInfo.full_name}!</h1>
              <p>Your order has been received and is being processed.</p>
              <p><strong>Total:</strong> $${total_price.toFixed(2)}</p>
              <h3>Items:</h3>
              <p>${orderItemsList}</p>
            `
        })
    });

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    })
  }
})