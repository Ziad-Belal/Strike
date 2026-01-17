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
    
    console.log('Auth header present:', !!req.headers.get('Authorization'))
    
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('User auth error:', userError)
      throw new Error(`Authentication error: ${userError.message}`)
    }
    
    if (!user) {
      console.error('No user found')
      throw new Error("User not found.")
    }
    
    console.log('User authenticated:', user.id)

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )
    
    console.log('Supabase admin client created')

    // Get data from frontend (NEW - includes userInfo and shippingCost)
    const requestData = await req.json()
    console.log('Raw request data keys:', Object.keys(requestData))
    console.log('Raw request data:', JSON.stringify(requestData, null, 2))
    
    const { cartItems, userInfo, shippingCost = 60, discount = 0, promoCode = null, subtotal: providedSubtotal, total: providedTotal } = requestData
    
    console.log('Parsed data:', {
      cartItemsCount: cartItems?.length,
      hasUserInfo: !!userInfo,
      shippingCost,
      discount,
      hasPromoCode: !!promoCode,
      subtotal: providedSubtotal,
      total: providedTotal
    })
    
    if (!cartItems || cartItems.length === 0) {
      throw new Error("No cart items provided")
    }
    
    if (!userInfo) {
      throw new Error("No user info provided")
    }
    
    // Log cart items structure
    if (cartItems && cartItems.length > 0) {
      console.log('First cart item structure:', Object.keys(cartItems[0]))
      console.log('First cart item:', cartItems[0])
    }
    
    // For now, just create the order and return success
    // We'll handle the rest later
    console.log('Creating order with minimal data...')
    
    const orderInsertData: any = { 
      total_price: providedTotal || (subtotal + shippingCost - discount), 
      user_id: user.id
    }
    
    console.log('Order insert data:', orderInsertData)
    
    const { data: orderData, error: orderError } = await supabaseAdmin.from('orders').insert(orderInsertData).select().single()
    
    if (orderError) {
      console.error('Order insert error:', orderError)
      throw new Error(`Failed to create order: ${orderError.message}`)
    }
    
    const order_id = orderData.id
    console.log('Order created successfully with ID:', order_id)
    
    // Skip order items and stock updates for now
    console.log('Skipping order items and stock updates for debugging')
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    // Create detailed order items list
    const orderItemsList = cartItems.map((item: any) => 
      `${item.name} ${item.size ? `(Size: ${item.size})` : ''} x${item.qty} - EGP ${(item.price * item.qty).toFixed(2)}`
    ).join('<br>')
    
    // Send emails (don't fail the order if emails fail)
    try {
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
                
                <p><strong>Subtotal:</strong> EGP ${subtotal.toFixed(2)}</p>
                ${discount > 0 ? `<p><strong>Discount${promoCode ? ` (${promoCode.code})` : ''}:</strong> -EGP ${discount.toFixed(2)}</p>` : ''}
                <p><strong>Shipping:</strong> EGP ${shippingCost.toFixed(2)}</p>
                <p><strong>Order Total:</strong> EGP ${total_price.toFixed(2)}</p>
                
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
                    <p><strong>Subtotal:</strong> EGP ${subtotal.toFixed(2)}</p>
                    ${discount > 0 ? `<p><strong>Discount${promoCode ? ` (${promoCode.code})` : ''}:</strong> -EGP ${discount.toFixed(2)}</p>` : ''}
                    <p><strong>Shipping:</strong> EGP ${shippingCost.toFixed(2)}</p>
                    <p style="font-size: 18px;"><strong>Total:</strong> EGP ${total_price.toFixed(2)}</p>
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
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the order if emails fail
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