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
    
    // Calculate subtotal and total if not provided
    const subtotal = providedSubtotal || cartItems.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0)
    const total = providedTotal || (subtotal - discount + shippingCost)
    
    console.log('Creating order with calculated totals...')
    
    const orderInsertData: any = { 
      total_price: total,
      user_id: user.id,
      discount_amount: discount || 0,
      promo_code: promoCode?.code || null
    }
    
    console.log('Order insert data:', orderInsertData)
    
    const { data: orderData, error: orderError } = await supabaseAdmin.from('orders').insert(orderInsertData).select().single()
    
    if (orderError) {
      console.error('Order insert error:', orderError);
      console.error('Order insert error details:', {
        code: orderError.code,
        message: orderError.message,
        details: orderError.details,
        hint: orderError.hint
      });
      console.error('Order data attempted:', JSON.stringify(orderInsertData, null, 2));
      throw new Error(`Failed to create order: ${orderError.message || 'Unknown database error'}`)
    }
    
    const order_id = orderData.id
    console.log('Order created successfully with ID:', order_id)
    
    // Create order items and update stock
    console.log('Creating order items and updating stock...')
    const orderItems = []
    
    for (const item of cartItems) {
      // Validate item data
      if (!item.id || !item.qty || !item.price) {
        console.error('Invalid cart item:', item)
        continue
      }
      
      // Handle product ID - could be integer or string
      let productId: number;
      if (typeof item.id === 'string') {
        // Try to parse as integer
        const parsed = parseInt(item.id, 10);
        if (isNaN(parsed)) {
          console.error(`Invalid product ID format: ${item.id}`, item);
          continue;
        }
        productId = parsed;
      } else {
        productId = item.id;
      }
      
      // Create order item (note: size is stored in a separate column if your schema supports it, otherwise omit)
      const { error: itemError } = await supabaseAdmin.from('order_items').insert({
        order_id: order_id,
        product_id: productId,
        quantity: parseInt(item.qty),
        price: parseFloat(item.price)
        // Note: If your order_items table has a 'size' column, uncomment the line below:
        // size: item.size || null
      })
      
      if (itemError) {
        console.error('Error creating order item:', itemError);
        console.error('Item that failed:', JSON.stringify(item, null, 2));
        console.error('Error details:', {
          code: itemError.code,
          message: itemError.message,
          details: itemError.details,
          hint: itemError.hint
        });
        // Continue with other items even if one fails, but log the error
      } else {
        orderItems.push(item)
      }
      
      // Update product stock (decrease by quantity ordered)
      if (productId) {
        const { data: productData, error: productError } = await supabaseAdmin
          .from('products')
          .select('stock')
          .eq('id', productId)
          .single()
        
        if (productError) {
          console.error(`Error fetching product ${productId} for stock update:`, productError);
        } else if (productData) {
          const newStock = Math.max(0, (productData.stock || 0) - parseInt(item.qty));
          const { error: updateStockError } = await supabaseAdmin
            .from('products')
            .update({ stock: newStock })
            .eq('id', productId);
          
          if (updateStockError) {
            console.error(`Error updating stock for product ${productId}:`, updateStockError);
          }
        }
      }
    }
    
    console.log(`Created ${orderItems.length} order items`)
    
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      console.warn('RESEND_API_KEY not set - emails will not be sent')
    }
    
    // Create detailed order items list
    const orderItemsList = cartItems.map((item: any) => 
      `${item.name} ${item.size ? `(Size: ${item.size})` : ''} x${item.qty} - EGP ${(item.price * item.qty).toFixed(2)}`
    ).join('<br>')
    
    // Send emails (don't fail the order if emails fail)
    if (resendApiKey) {
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
                <p><strong>Order Total:</strong> EGP ${total.toFixed(2)}</p>
                
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
                    <p style="font-size: 18px;"><strong>Total:</strong> EGP ${total.toFixed(2)}</p>
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
    } else {
      console.warn('RESEND_API_KEY not configured - skipping email notifications')
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 200 
    })
  } catch (error) {
    console.error('Edge Function error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error instanceof Error ? {
        name: error.name,
        message: error.message
      } : null
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    })
  }
})