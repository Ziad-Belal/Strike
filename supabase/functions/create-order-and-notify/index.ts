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

    // Get data from frontend (NEW - includes userInfo and shippingCost)
    const { cartItems, userInfo, shippingCost = 60 } = await req.json()
    
    const subtotal = cartItems.reduce((total: number, item: any) => total + item.price * item.qty, 0)
    const total_price = subtotal + shippingCost
    
    const { data: orderData } = await supabaseAdmin.from('orders').insert({ total_price, user_id: user.id }).select().single()
    const order_id = orderData.id
    const orderItemsToInsert = cartItems.map((item: any) => ({ order_id, product_id: item.id, quantity: item.qty, price: item.price }))
    await supabaseAdmin.from('order_items').insert(orderItemsToInsert)
    
    // Decrease stock for each product
    for (const item of cartItems) {
      await supabaseAdmin
        .from('products')
        .update({ stock: supabaseAdmin.raw('stock - ?', [item.qty]) })
        .eq('id', item.id)
    }
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    // Create detailed order items list
    const orderItemsList = cartItems.map((item: any) => 
      `${item.name} ${item.size ? `(Size: ${item.size})` : ''} x${item.qty} - £${(item.price * item.qty).toFixed(2)}`
    ).join('<br>')
    
    // Email to Admin (using userInfo from frontend)
    const adminEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: 'ziadbelal82@gmail.com',
            subject: `Order from ${userInfo.full_name || userInfo.email || 'Unknown Customer'}`,
            html: `
              <h2>New Order Received!</h2>
              <p><strong>Customer:</strong> ${userInfo.full_name || userInfo.email || 'Unknown'}</p>
              <p><strong>Email:</strong> ${userInfo.email || 'Not provided'}</p>
              <p><strong>Phone:</strong> ${userInfo.phone || 'Not provided'}</p>
              <p><strong>Address:</strong> ${userInfo.address || 'Not provided'}</p>
              
              <p><strong>Subtotal:</strong> £${subtotal.toFixed(2)}</p>
              <p><strong>Shipping:</strong> £${shippingCost.toFixed(2)}</p>
              <p><strong>Order Total:</strong> £${total_price.toFixed(2)}</p>
              
              <h3>Items Ordered:</h3>
              <div>${orderItemsList}</div>
              
              <hr>
              <p><em>Order ID: ${order_id}</em></p>
            `
        })
    });
    
    if (!adminEmailResponse.ok) {
      console.error('Failed to send admin email:', await adminEmailResponse.text());
    }

    // Email to Customer
    const customerEmailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({
            from: 'Strike Team <onboarding@resend.dev>',
            to: userInfo.email,
            subject: 'Thank you for your order from Strike!',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333; border-bottom: 2px solid #000; padding-bottom: 10px;">Thank You for Your Order!</h1>
                
                <p>Dear ${userInfo.full_name || 'Valued Customer'},</p>
                
                <p>Thank you for your purchase from <strong>Strike</strong>! Your order has been received and is being processed.</p>
                
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #333;">Order Summary</h3>
                  
                  <h4>Items Ordered:</h4>
                  <div>${orderItemsList}</div>
                  
                  <hr style="margin: 10px 0; border: none; border-top: 1px solid #ddd;">
                  <p><strong>Subtotal:</strong> £${subtotal.toFixed(2)}</p>
                  <p><strong>Shipping:</strong> £${shippingCost.toFixed(2)}</p>
                  <p style="font-size: 18px;"><strong>Total:</strong> £${total_price.toFixed(2)}</p>
                </div>
                
                <p>We'll send you a shipping confirmation email with tracking information once your order is on its way.</p>
                
                <p>If you have any questions about your order, please don't hesitate to contact us.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #666; font-size: 12px;">Order ID: ${order_id}</p>
                <p style="color: #666; font-size: 12px;">This email was sent to ${userInfo.email}</p>
              </div>
            `
        })
    });
    
    if (!customerEmailResponse.ok) {
      console.error('Failed to send customer email:', await customerEmailResponse.text());
    }

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