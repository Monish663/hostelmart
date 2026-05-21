import { P } from '../constants.js'
import { card } from '../styles.js'
import Badge from './Badge.jsx'

export default function OwnerDash({ products, orders }) {
  const pending   = orders.filter(o => o.status === 'pending')
  const confirmed = orders.filter(o => o.status === 'confirmed')
  const delivered = orders.filter(o => o.status === 'delivered')
  const revenue   = delivered.reduce((s, o) => s + o.total, 0)
  const lowStock  = products.filter(p => p.stock > 0 && p.stock <= 5)
  const outStock  = products.filter(p => p.stock === 0)

  const STATS = [
    { label:'Total Products',    val: products.length,  color: P.blue,   emoji:'📦' },
    { label:'Pending Orders',    val: pending.length,   color: P.coral,  emoji:'🔔' },
    { label:'Total Revenue',     val: `₹${revenue}`,   color: P.green,  emoji:'💰' },
    { label:'Low Stock Items',   val: lowStock.length,  color: P.amber,  emoji:'⚠️' },
  ]

  return (
    <div>
      <h2 style={{ color:P.dark, margin:'0 0 20px', fontFamily:'Georgia,serif', fontSize:'26px' }}>
        Good Day, Owner! 👋
      </h2>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',
        gap:'16px', marginBottom:'24px' }}>
        {STATS.map(s => (
          <div key={s.label} style={{ background:s.color, borderRadius:'18px', padding:'22px', color:'white' }}>
            <div style={{ fontSize:'32px', marginBottom:'8px' }}>{s.emoji}</div>
            <div style={{ fontSize:'32px', fontWeight:'900', lineHeight:1 }}>{s.val}</div>
            <div style={{ fontSize:'13px', opacity:0.88, marginTop:'6px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Out of Stock Alert */}
      {outStock.length > 0 && (
        <div style={{ ...card({ border:`2px solid ${P.coral}`, marginBottom:'16px' }) }}>
          <div style={{ fontWeight:'800', color:P.coral, marginBottom:'12px', fontSize:'16px' }}>
            🚫 Out of Stock — Restock Needed!
          </div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
            {outStock.map(p => (
              <span key={p.id} style={{ background:P.coral+'18', color:P.coral,
                borderRadius:'8px', padding:'6px 14px', fontWeight:'700', fontSize:'13px' }}>
                {p.emoji} {p.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Order Status Summary */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',
        gap:'16px', marginBottom:'24px' }}>
        {[
          { label:'Pending',   count:pending.length,   color:'#FEF3C7', fg:'#92400E', icon:'⏳' },
          { label:'Confirmed', count:confirmed.length, color:'#DBEAFE', fg:'#1E40AF', icon:'✅' },
          { label:'Delivered', count:delivered.length, color:'#D1FAE5', fg:'#065F46', icon:'🚀' },
        ].map(s => (
          <div key={s.label} style={{ background:s.color, borderRadius:'14px', padding:'16px',
            display:'flex', alignItems:'center', gap:'14px' }}>
            <span style={{ fontSize:'28px' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize:'26px', fontWeight:'900', color:s.fg }}>{s.count}</div>
              <div style={{ fontSize:'13px', color:s.fg, fontWeight:'600' }}>{s.label} Orders</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={card()}>
        <h3 style={{ color:P.dark, margin:'0 0 16px', fontSize:'18px' }}>🕐 Recent Orders</h3>
        {orders.length === 0
          ? <p style={{ color:P.gray, textAlign:'center', padding:'20px' }}>No orders yet.</p>
          : <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {[...orders].reverse().slice(0, 6).map(o => (
                <div key={o.id} style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', padding:'12px 16px', background:P.lgray,
                  borderRadius:'12px', flexWrap:'wrap', gap:'8px' }}>
                  <div>
                    <span style={{ fontWeight:'800', fontSize:'15px' }}>
                      {o.selfPickup ? '🏃 Self Pickup' : `🏠 Room ${o.roomNumber}`}
                    </span>
                    {o.customerName && (
                      <span style={{ color:P.gray, fontSize:'13px', marginLeft:'8px' }}>· {o.customerName}</span>
                    )}
                    {o.phone && (
                      <span style={{ color:P.blue, fontSize:'13px', marginLeft:'8px', fontWeight:'700' }}>· 📱 +91 {o.phone}</span>
                    )}
                    <div style={{ color:P.gray, fontSize:'12px', marginTop:'2px' }}>
                      {(o.items||[]).length} items · {new Date(o.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ fontWeight:'900', fontSize:'18px', color:P.green }}>₹{o.total}</span>
                    <Badge status={o.status} />
                  </div>
                </div>
              ))}
            </div>
        }
      </div>
    </div>
  )
}
