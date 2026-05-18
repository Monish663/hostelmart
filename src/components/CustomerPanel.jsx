import { useState } from 'react'
import { P, CAT, uid } from '../constants.js'
import { btn, card, inp } from '../styles.js'
import Badge from './Badge.jsx'
import { dbAppendOrder } from '../firebase.js'

export default function CustomerPanel({ products, orders, onBack }) {
  const [tab, setTab]           = useState('shop')
  const [catFilter, setCatFilter] = useState('All')
  const [search, setSearch]     = useState('')
  const [cart, setCart]         = useState([])
  const [room, setRoom]         = useState('')
  const [name, setName]         = useState('')
  const [note, setNote]         = useState('')
  const [myRoom, setMyRoom]     = useState('')
  const [selfPickup, setSelfPickup] = useState(false)
  const [custPhone, setCustPhone]   = useState('')
  const [success, setSuccess]   = useState(false)

  const inStock  = products.filter(p => p.stock > 0)
  const cats     = ['All', ...Object.keys(CAT)]
  const shown    = inStock.filter(p =>
    (catFilter === 'All' || p.cat === catFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  const subtotal      = cart.reduce((s, c) => s + c.price * c.qty, 0)
  const DELIVERY_CHARGE = selfPickup ? 0 : (['1','2','3'].includes(room.trim().charAt(0)) ? 2 : 5)
  const total         = subtotal + DELIVERY_CHARGE
  const cartCount     = cart.reduce((s, c) => s + c.qty, 0)
  const myOrders      = orders.filter(o => o.roomNumber === myRoom && myRoom.trim())

  const addToCart = (p) => setCart(prev => {
    const ex = prev.find(c => c.id === p.id)
    if (ex) return prev.map(c => c.id === p.id ? { ...c, qty: c.qty + 1 } : c)
    return [...prev, { ...p, qty: 1 }]
  })

  const adjCart = (id, d) =>
    setCart(prev => prev.map(c => c.id===id ? { ...c, qty:Math.max(0,c.qty+d) } : c).filter(c => c.qty > 0))

  const placeOrder = async () => {
    if (!selfPickup && !room.trim()) return alert('Please enter your room number')
    if (!name.trim()) return alert('Please enter your name')
    if (custPhone.replace(/\D/g,'').length !== 10) return alert('Please enter a valid 10-digit mobile number')
    if (cart.length===0) return alert('Your cart is empty')

    // Security: verify every item exists in inventory with correct price and stock
    for (const item of cart) {
      const realProduct = products.find(p => p.id === item.id)
      if (!realProduct) return alert(`${item.name} is no longer available. Please refresh and try again.`)
      if (item.price !== realProduct.price) return alert('Price mismatch detected. Please refresh and try again.')
      if (item.qty > realProduct.stock) return alert(`Only ${realProduct.stock} units of ${item.name} available.`)
      if (item.qty <= 0) return alert('Invalid quantity detected.')
    }
    const ord = {
      id: uid(),
      roomNumber: selfPickup ? 'SELF PICKUP' : room.trim(),
      customerName: name.trim(),
      phone: custPhone.replace(/\D/g,''),
      note: note.trim(),
      selfPickup,
      deliveryCharge: DELIVERY_CHARGE,
      items: cart.map(c => ({
        productId:c.id, name:c.name, price:c.price, qty:c.qty, unit:c.unit, emoji:c.emoji,
      })),
      total,
      status: 'pending',
      timestamp: Date.now(),
    }
    await dbAppendOrder(ord)
    setCart([])
    setMyRoom(room.trim())
    setRoom(''); setName(''); setNote('')
    setSuccess(true)
    setTimeout(() => setSuccess(false), 5000)
    setTab('myorders')
  }

  const TABS = [
    { id:'shop',     label:'🛍️ Shop' },
    { id:'cart',     label: cartCount > 0 ? `🛒 Cart (${cartCount})` : '🛒 Cart' },
    { id:'myorders', label:'📋 My Orders' },
  ]

  return (
    <div style={{ background:'#FFF8F0', minHeight:'100vh',
      fontFamily:"'Trebuchet MS','Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${P.teal},${P.blue})`,
        padding:'16px 24px', color:'white',
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ fontSize:'32px' }}>🏪</span>
          <div>
            <div style={{ fontWeight:'900', fontSize:'22px', fontFamily:'Georgia,serif' }}>HostelMart</div>
            <div style={{ fontSize:'12px', opacity:0.85 }}>Order groceries to your room</div>
          </div>
        </div>
        <button onClick={onBack} style={btn('rgba(255,255,255,0.25)','white',true)}>← Home</button>
      </div>

      {/* Tab Bar */}
      <div style={{ display:'flex', background:'#fff', borderBottom:'2px solid #F3F4F6', padding:'0 16px' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            border:'none', background:'none', padding:'16px 22px', cursor:'pointer',
            fontWeight:'700', fontSize:'14px', fontFamily:'inherit', whiteSpace:'nowrap',
            borderBottom: tab===t.id ? `3px solid ${P.teal}` : '3px solid transparent',
            color: tab===t.id ? P.teal : P.gray,
          }}>{t.label}</button>
        ))}
      </div>

      <div style={{ padding:'24px', maxWidth:'960px', margin:'0 auto' }}>

        {/* Success Banner */}
        {success && (
          <div style={{ background:'#D1FAE5', border:`2px solid ${P.green}`, borderRadius:'14px',
            padding:'16px 20px', marginBottom:'20px', color:'#065F46',
            fontWeight:'700', display:'flex', alignItems:'center', gap:'12px', fontSize:'16px' }}>
            🎉 Order placed! The shopkeeper will deliver to Room {myRoom} soon.
          </div>
        )}

        {/* ── SHOP TAB ── */}
        {tab === 'shop' && (
          <div>
            <div style={{ marginBottom:'16px' }}>
              <input placeholder="🔍 Search groceries…" value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ ...inp(), fontSize:'15px', padding:'13px 16px' }} />
            </div>

            {/* Category Filter */}
            <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'12px', marginBottom:'24px' }}>
              {cats.map(c => {
                const meta = CAT[c]
                return (
                  <button key={c} onClick={() => setCatFilter(c)} style={{
                    ...btn(catFilter===c?(meta?.color||P.teal):'#EEE', catFilter===c?'white':P.gray, true),
                    borderRadius:'20px', whiteSpace:'nowrap',
                  }}>{meta?.emoji||'🌟'} {c}</button>
                )
              })}
            </div>

            {shown.length === 0
              ? <div style={{ textAlign:'center', padding:'60px', color:P.gray }}>
                  <div style={{ fontSize:'52px', marginBottom:'12px' }}>🔍</div>
                  <div>No products found</div>
                </div>
              : <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:'16px' }}>
                  {shown.map(p => {
                    const meta   = CAT[p.cat] || { color:'#888', emoji:'📦' }
                    const inCart = cart.find(c => c.id === p.id)
                    return (
                      <div key={p.id} style={{ background:'#fff', borderRadius:'18px',
                        boxShadow:'0 3px 14px rgba(0,0,0,0.07)', overflow:'hidden' }}>
                        <div style={{ background:`linear-gradient(135deg,${meta.color},${meta.color}BB)`,
                          padding:'24px 20px', textAlign:'center' }}>
                          <div style={{ fontSize:'52px', lineHeight:1 }}>{p.emoji}</div>
                        </div>
                        <div style={{ padding:'14px' }}>
                          <div style={{ fontWeight:'800', fontSize:'15px', color:P.dark, marginBottom:'6px' }}>
                            {p.name}
                          </div>
                          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                            <div style={{ fontWeight:'900', fontSize:'19px', color:P.green }}>
                              ₹{p.price}
                              <span style={{ fontSize:'12px', fontWeight:'400', color:P.gray }}>/{p.unit}</span>
                            </div>
                            <span style={{ background:meta.color+'20', color:meta.color,
                              borderRadius:'6px', padding:'2px 8px', fontSize:'11px', fontWeight:'700' }}>
                              {p.stock} left
                            </span>
                          </div>
                          {!inCart
                            ? <button onClick={() => addToCart(p)} style={{
                                ...btn(meta.color), width:'100%', justifyContent:'center', borderRadius:'10px' }}>
                                ＋ Add to Cart
                              </button>
                            : <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                                <button onClick={() => adjCart(p.id,-1)} style={{
                                  ...btn(P.coral,'white',true), width:'36px',height:'36px',
                                  padding:0,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'20px' }}>−</button>
                                <span style={{ flex:1,textAlign:'center',fontWeight:'900',fontSize:'18px' }}>{inCart.qty}</span>
                                <button onClick={() => adjCart(p.id,+1)} style={{
                                  ...btn(P.teal,'white',true), width:'36px',height:'36px',
                                  padding:0,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'20px' }}>＋</button>
                              </div>
                          }
                        </div>
                      </div>
                    )
                  })}
                </div>
            }

            {/* Floating Cart Button */}
            {cart.length > 0 && (
              <div style={{ position:'sticky', bottom:'20px', marginTop:'28px' }}>
                <button onClick={() => setTab('cart')} style={{
                  ...btn(`linear-gradient(135deg,${P.teal},${P.blue})`),
                  width:'100%', justifyContent:'center', padding:'18px',
                  fontSize:'17px', borderRadius:'16px',
                  boxShadow:`0 10px 28px ${P.teal}55`,
                }}>
                  🛒 View Cart — {cartCount} items &nbsp;·&nbsp; ₹{total}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── CART TAB ── */}
        {tab === 'cart' && (
          <div>
            <h2 style={{ color:P.dark, margin:'0 0 20px', fontFamily:'Georgia,serif', fontSize:'26px' }}>Your Cart</h2>
            {cart.length === 0
              ? <div style={{ ...card({ textAlign:'center', padding:'60px' }), color:P.gray }}>
                  <div style={{ fontSize:'56px', marginBottom:'14px' }}>🛒</div>
                  <div style={{ fontSize:'18px', marginBottom:'20px' }}>Your cart is empty</div>
                  <button onClick={() => setTab('shop')} style={btn(P.teal)}>🛍️ Start Shopping</button>
                </div>
              : <>
                  <div style={card({ marginBottom:'16px' })}>
                    <h3 style={{ margin:'0 0 16px', color:P.dark }}>Items ({cartCount})</h3>
                    {cart.map((c, i) => (
                      <div key={c.id} style={{ display:'flex', alignItems:'center', gap:'14px',
                        padding:'14px 0', borderBottom: i<cart.length-1?'1px solid #F3F4F6':'none' }}>
                        <div style={{ fontSize:'36px', width:'44px', textAlign:'center', flexShrink:0 }}>{c.emoji}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontWeight:'700', fontSize:'15px' }}>{c.name}</div>
                          <div style={{ color:P.gray, fontSize:'12px' }}>₹{c.price}/{c.unit}</div>
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                          <button onClick={() => adjCart(c.id,-1)} style={{
                            ...btn(P.coral,'white',true), width:'30px',height:'30px',
                            padding:0,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>−</button>
                          <span style={{ fontWeight:'900', width:'24px', textAlign:'center', fontSize:'16px' }}>{c.qty}</span>
                          <button onClick={() => adjCart(c.id,+1)} style={{
                            ...btn(P.teal,'white',true), width:'30px',height:'30px',
                            padding:0,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>＋</button>
                        </div>
                        <div style={{ fontWeight:'900', fontSize:'17px', color:P.green, minWidth:'60px', textAlign:'right' }}>
                          ₹{c.price * c.qty}
                        </div>
                      </div>
                    ))}
                    {/* Subtotal + Delivery + Total */}
                    <div style={{ borderTop:'2px solid #F3F4F6', paddingTop:'16px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between',
                        fontSize:'15px', color:P.gray, marginBottom:'8px' }}>
                        <span>Subtotal</span><span>₹{subtotal}</span>
                      </div>
                      <div style={{ display:'flex', justifyContent:'space-between',
                        fontSize:'15px', fontWeight:'700', marginBottom:'10px',
                        color: selfPickup ? P.green : P.orange }}>
                        <span>🛵 Delivery Charge</span>
                        <span>{selfPickup ? '🆓 FREE' : `₹${DELIVERY_CHARGE}`}</span>
                      </div>
                      {!selfPickup && (
                        <div style={{ background:'#FFF3CD', border:'1px solid #FFC107',
                          borderRadius:'8px', padding:'7px 12px', fontSize:'12px',
                          color:'#856404', marginBottom:'10px', textAlign:'center', fontWeight:'600' }}>
                          🏠 Rooms 1xx/2xx/3xx = ₹2 &nbsp;·&nbsp; Other rooms = ₹5
                        </div>
                      )}
                      {selfPickup && (
                        <div style={{ background:'#D1FAE5', border:`1px solid ${P.green}`,
                          borderRadius:'8px', padding:'7px 12px', fontSize:'12px',
                          color:'#065F46', marginBottom:'10px', textAlign:'center', fontWeight:'700' }}>
                          🏃 Self Pickup — No delivery charge!
                        </div>
                      )}
                      <div style={{ display:'flex', justifyContent:'space-between',
                        fontWeight:'900', fontSize:'22px', borderTop:'1px solid #F3F4F6', paddingTop:'10px' }}>
                        <span>Total</span>
                        <span style={{ color:P.green }}>₹{total}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pickup / Delivery Toggle */}
                  <div style={{ ...card({ marginBottom:'16px' }) }}>
                    <h3 style={{ margin:'0 0 14px', fontSize:'16px', color:P.dark, fontWeight:'800' }}>
                      🚚 Delivery Method
                    </h3>
                    <div style={{ display:'flex', gap:'12px' }}>
                      <div onClick={() => setSelfPickup(false)} style={{
                        flex:1, border:`2px solid ${!selfPickup ? P.teal : '#E5E7EB'}`,
                        borderRadius:'14px', padding:'14px', cursor:'pointer', textAlign:'center',
                        background: !selfPickup ? P.teal+'18' : '#fff', transition:'all 0.2s',
                      }}>
                        <div style={{ fontSize:'28px', marginBottom:'6px' }}>🏠</div>
                        <div style={{ fontWeight:'800', color: !selfPickup ? P.teal : P.gray, fontSize:'14px' }}>Room Delivery</div>
                        <div style={{ fontSize:'12px', color: !selfPickup ? P.teal : P.gray, marginTop:'3px' }}>₹2 – ₹5 charge</div>
                      </div>
                      <div onClick={() => setSelfPickup(true)} style={{
                        flex:1, border:`2px solid ${selfPickup ? P.green : '#E5E7EB'}`,
                        borderRadius:'14px', padding:'14px', cursor:'pointer', textAlign:'center',
                        background: selfPickup ? P.green+'18' : '#fff', transition:'all 0.2s',
                      }}>
                        <div style={{ fontSize:'28px', marginBottom:'6px' }}>🏃</div>
                        <div style={{ fontWeight:'800', color: selfPickup ? P.green : P.gray, fontSize:'14px' }}>Self Pickup</div>
                        <div style={{ fontSize:'12px', color: P.green, fontWeight:'700', marginTop:'3px' }}>FREE</div>
                      </div>
                    </div>
                  </div>

                  {/* Order Details Form */}
                  <div style={{ ...card({ border:`2px solid ${selfPickup ? P.green : P.teal}` }) }}>
                    <h3 style={{ color: selfPickup ? P.green : P.teal, margin:'0 0 18px', fontSize:'18px' }}>
                      {selfPickup ? '🏃 Pickup Details' : '📍 Delivery Details'}
                    </h3>
                    <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
                      {!selfPickup && (
                        <div>
                          <label style={{ fontSize:'13px', fontWeight:'800', color:P.gray, display:'block', marginBottom:'8px' }}>
                            🏠 Room Number *
                          </label>
                          <input type="text" placeholder="Enter your room number (e.g. 201)"
                            value={room} onChange={e => setRoom(e.target.value)}
                            style={{ ...inp(P.teal), fontSize:'16px', fontWeight:'700', padding:'14px 16px' }} />
                        </div>
                      )}
                      <div>
                        <label style={{ fontSize:'13px', fontWeight:'800', color:P.gray, display:'block', marginBottom:'8px' }}>
                          👤 Your Name *
                        </label>
                        <input type="text" placeholder="Enter your name (required)"
                          value={name} onChange={e => setName(e.target.value)}
                          style={{ ...inp(selfPickup ? P.green : P.teal) }} required />
                      </div>
                      <div>
                        <label style={{ fontSize:'13px', fontWeight:'800', color:P.gray, display:'block', marginBottom:'8px' }}>
                          📱 Mobile Number *
                        </label>
                        <div style={{ display:'flex', gap:'10px' }}>
                          <div style={{ background:P.lgray, border:`2px solid ${selfPickup ? P.green : P.teal}`,
                            borderRadius:'12px', padding:'11px 14px', fontWeight:'800',
                            fontSize:'14px', color:P.dark, flexShrink:0 }}>+91</div>
                          <input type="tel" placeholder="9876543210 (required)"
                            value={custPhone}
                            onChange={e => setCustPhone(e.target.value.replace(/\D/g,'').slice(0,10))}
                            style={{ ...inp(selfPickup ? P.green : P.teal), fontSize:'16px',
                              fontWeight:'700', letterSpacing:'2px', flex:1 }}
                            maxLength={10} required />
                        </div>
                      </div>
                      <div>
                        <label style={{ fontSize:'13px', fontWeight:'800', color:P.gray, display:'block', marginBottom:'8px' }}>
                          📝 Special Instructions (optional)
                        </label>
                        <input type="text" placeholder="Any special requests?"
                          value={note} onChange={e => setNote(e.target.value)} style={inp()} />
                      </div>
                    </div>

                    {selfPickup && (
                      <div style={{ background:'#D1FAE5', border:`1.5px solid ${P.green}`,
                        borderRadius:'10px', padding:'12px 16px', marginTop:'16px',
                        color:'#065F46', fontWeight:'700', fontSize:'13px', textAlign:'center' }}>
                        🏃 Come to the shop to collect your order. No delivery charge!
                      </div>
                    )}

                    <button onClick={placeOrder} style={{
                      ...btn(selfPickup
                        ? `linear-gradient(135deg,${P.green},${P.teal})`
                        : `linear-gradient(135deg,${P.coral},${P.orange})`),
                      width:'100%', justifyContent:'center', padding:'18px',
                      fontSize:'17px', borderRadius:'14px', marginTop:'20px',
                      boxShadow:`0 8px 24px ${selfPickup ? P.green : P.coral}55`,
                    }}>
                      {selfPickup ? '🏃 Place Pickup Order' : '🚀 Place Order'} &nbsp;·&nbsp; ₹{total}
                    </button>
                    <p style={{ color:P.gray, fontSize:'13px', textAlign:'center', marginTop:'12px' }}>
                      💳 Pay on {selfPickup ? 'pickup at shop' : 'delivery'}
                    </p>
                  </div>
                </>
            }
          </div>
        )}

        {/* ── MY ORDERS TAB ── */}
        {tab === 'myorders' && (
          <div>
            <h2 style={{ color:P.dark, margin:'0 0 20px', fontFamily:'Georgia,serif', fontSize:'26px' }}>My Orders</h2>

            <div style={{ ...card({ border:`2px solid ${P.purple}`, marginBottom:'24px' }) }}>
              <label style={{ fontSize:'13px', fontWeight:'800', color:P.gray, display:'block', marginBottom:'10px' }}>
                🏠 Enter your room number to track orders
              </label>
              <input type="text" placeholder="Room number (e.g. 201)"
                value={myRoom} onChange={e => setMyRoom(e.target.value)}
                style={{ ...inp(P.purple), fontSize:'16px', fontWeight:'700', padding:'14px 16px' }} />
            </div>

            {myRoom.trim() && myOrders.length === 0 && (
              <div style={{ ...card({ textAlign:'center', padding:'52px' }), color:P.gray }}>
                <div style={{ fontSize:'52px', marginBottom:'12px' }}>📭</div>
                <div style={{ fontSize:'16px' }}>No orders found for Room {myRoom}</div>
                <button onClick={() => setTab('shop')} style={{ ...btn(P.teal), marginTop:'20px' }}>
                  🛍️ Start Shopping
                </button>
              </div>
            )}

            {myOrders.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                {[...myOrders].reverse().map(o => {
                  const statusColor = o.status==='delivered'?P.green:o.status==='confirmed'?P.blue:P.amber
                  return (
                    <div key={o.id} style={{ ...card({ borderLeft:`5px solid ${statusColor}` }) }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                        marginBottom:'14px', flexWrap:'wrap', gap:'8px' }}>
                        <div>
                          <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap' }}>
                            <span style={{ fontWeight:'800', fontSize:'17px' }}>Order #{o.id.slice(-6)}</span>
                            <Badge status={o.status} />
                          </div>
                          <div style={{ color:P.gray, fontSize:'12px', marginTop:'4px' }}>
                            {new Date(o.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div style={{ fontWeight:'900', fontSize:'24px', color:P.green }}>₹{o.total}</div>
                      </div>

                      <div style={{ background:'#F3F4F6', borderRadius:'12px', padding:'14px', marginBottom:'14px' }}>
                        {o.items.map((it, i) => (
                          <div key={i} style={{ display:'flex', justifyContent:'space-between',
                            fontSize:'14px', padding:'5px 0',
                            borderBottom: i<o.items.length-1?'1px solid #E5E7EB':'none' }}>
                            <span>{it.emoji||'📦'} {it.name} × {it.qty}</span>
                            <span style={{ fontWeight:'700' }}>₹{it.price * it.qty}</span>
                          </div>
                        ))}
                      </div>

                      <div style={{ background:statusColor+'15', borderRadius:'10px', padding:'12px 16px',
                        color:statusColor, fontWeight:'700', fontSize:'14px' }}>
                        {o.status==='pending'   && '⏳ Order received! The shopkeeper is reviewing your order.'}
                        {o.status==='confirmed' && '🚚 Order confirmed! On its way to your room soon.'}
                        {o.status==='delivered' && '✅ Delivered! Enjoy your groceries! 🎉'}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {!myRoom.trim() && (
              <div style={{ textAlign:'center', padding:'40px', color:P.gray }}>
                <div style={{ fontSize:'48px', marginBottom:'12px' }}>🏠</div>
                <div>Enter your room number above to view your orders</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
