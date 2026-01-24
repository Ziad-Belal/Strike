import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

serve(async (req) => {
  const origin = req.headers.get('origin') ?? '*'
  const baseCors = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  }
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: baseCors })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    console.log('place-order: auth header present', !!req.headers.get('Authorization'))
    const { data: { user } } = await supabase.auth.getUser()
    const userId = user?.id ?? null
    console.log('place-order: user', userId)
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const writeClient = serviceRole
      ? createClient(Deno.env.get('SUPABASE_URL') ?? '', serviceRole, { auth: { autoRefreshToken: false, persistSession: false } })
      : supabase

    const body = await req.json()
    console.log('place-order: request keys', Object.keys(body))
    const items = body.items ?? body.cartItems ?? []
    const discount = Number(body.discount ?? 0)
    const shippingCost = Number(body.shippingCost ?? 60)
    const subtotal = Number(body.subtotal ?? items.reduce((s: number, i: any) => s + Number(i.price) * Number(i.qty), 0))
    const total = Number(body.total ?? (subtotal - discount + shippingCost))
    const promoCode = body.promoCode ?? null
    console.log('place-order: itemsCount', Array.isArray(items) ? items.length : 0, 'subtotal', subtotal, 'total', total)

    if (!Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'No items provided' }), {
        headers: { ...baseCors, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    const { data: orderRow, error: orderErr } = await writeClient
      .from('orders')
      .insert({
        total_price: total,
        user_id: user?.id ?? null,
        discount_amount: discount,
        promo_code: promoCode
      })
      .select()
      .single()

    if (orderErr) {
      return new Response(JSON.stringify({ error: orderErr.message ?? 'Order insert failed' }), {
        headers: { ...baseCors, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    const orderId = orderRow.id

    for (const item of items) {
      const pid = typeof item.id === 'string' ? parseInt(item.id, 10) : item.id
      if (!pid || !item.qty || !item.price) continue
      const { error: itemErr } = await writeClient.from('order_items').insert({
        order_id: orderId,
        product_id: pid,
        quantity: Number(item.qty),
        price: Number(item.price)
      })
      if (itemErr) {
        console.log('place-order: order_items insert error', itemErr)
      }
      const { data: p } = await writeClient.from('products').select('stock').eq('id', pid).single()
      if (p) {
        const newStock = Math.max(0, (p.stock ?? 0) - Number(item.qty))
        const { error: stockErr } = await writeClient.from('products').update({ stock: newStock }).eq('id', pid)
        if (stockErr) {
          console.log('place-order: stock update error', stockErr)
        }
      }
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    const userInfo = body.userInfo ?? {}
    const orderItemsList = items.map((i: any) => `${i.name || 'Item'}${i.size ? ` (Size: ${i.size})` : ''} x${i.qty} - EGP ${(Number(i.price) * Number(i.qty)).toFixed(2)}`).join('<br>')
    if (resendApiKey) {
      try {
        const adminRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
          body: JSON.stringify({
            from: 'onboarding@resend.dev',
            to: 'ziadbelal82@gmail.com',
            subject: `Order from ${userInfo.full_name || userInfo.email || 'Customer'}`,
            html: `<h2>New Order</h2><p><strong>Customer:</strong> ${userInfo.full_name || ''}</p><p><strong>Email:</strong> ${userInfo.email || ''}</p><p><strong>Phone:</strong> ${userInfo.phone || ''}</p><p><strong>Address:</strong> ${userInfo.address || ''}</p><p><strong>Subtotal:</strong> EGP ${subtotal.toFixed(2)}</p>${discount > 0 ? `<p><strong>Discount${promoCode ? ` (${promoCode})` : ''}:</strong> -EGP ${discount.toFixed(2)}</p>` : ''}<p><strong>Shipping:</strong> EGP ${shippingCost.toFixed(2)}</p><p><strong>Total:</strong> EGP ${total.toFixed(2)}</p><h3>Items</h3><div>${orderItemsList}</div><p>Order ID: ${orderId}</p>`
          })
        })
        if (!adminRes.ok) {
          console.log('place-order: admin email error', await adminRes.text())
        }
        if (userInfo?.email) {
          const customerRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
            body: JSON.stringify({
              from: 'onboarding@resend.dev',
              to: userInfo.email,
              subject: 'Order Confirmation',
              html: `<h2>Thank you for your order</h2><p>Hello ${userInfo.full_name || ''},</p><p>Your order has been received.</p><p><strong>Total:</strong> EGP ${total.toFixed(2)}</p><h3>Items</h3><div>${orderItemsList}</div><p>Order ID: ${orderId}</p>`
            })
          })
          if (!customerRes.ok) {
            console.log('place-order: customer email error', await customerRes.text())
          }
        }
      } catch (err) {
        console.log('place-order: email send error', err)
      }
    } else {
      console.log('place-order: RESEND_API_KEY not set')
    }

    return new Response(JSON.stringify({ success: true, order_id: orderId, total }), {
      headers: { ...baseCors, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...baseCors, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
