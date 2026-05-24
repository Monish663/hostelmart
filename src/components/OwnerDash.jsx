import { useState, useEffect } from 'react'
import { P } from '../constants.js'
import { dbSetStoreStatus } from '../firebase.js'
import { card } from '../styles.js'
import Badge from './Badge.jsx'

export default function OwnerDash({ products, orders, storeStatus = { open: true, note: '' } }) {
  const pending   = orders.filter(o => o.status === 'pending')
  const confirmed = orders.filter(o => o.status === 'confirmed')
  const delivered = orders.filter(o => o.status === 'delivered')
  const revenue   = delivered.reduce((s, o) => s + o.total, 0)
  const lowStock  = products.filter(p => p.stock > 0 && p.stock <= 5)
  const outStock  = products.filter(p => p.stock === 0)

  const [localNote, setLocalNote] = useState(storeStatus.note || '')
  useEffect(() => {
    setLocalNote(storeStatus.note || '')
  }, [storeStatus.note])

  const toggleStore = () => {
    dbSetStoreStatus({ open: !storeStatus.open, note: localNote })
  }
  const saveNote = () => {
    dbSetStoreStatus({ open: storeStatus.open, note: localNote })
  }

  const STATS = [
    { label:'Total Products',    val: products.length,  color: P.blue,   emoji:'📦' },
    { label:'Pending Orders',    val: pending.length,   color: P.coral,  emoji:'🔔' },
    { label:'Total Revenue',     val: `₹${revenue}`,   color: P.green,  emoji:'💰' },
    { label:'Low Stock Items',   val: lowStock.length,  color: P.amber,  emoji:'⚠️' },
  ]

  return (
    <div>
      {/* ── Store Open/Close Control ── */}
      <div style={{
        background: storeStatus.open ? '#F0FDF4' : '#FFF1F0',
        border: `2px solid ${storeStatus.open ? P.green : P.coral}`,
        borderRadius: '18px', padding: '20px', marginBottom: '24px'
      }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
          <div>
            <div style={{ fontWeight:'900', fontSize:'20px', color: storeStatus.open ? P.green : P.coral }}>
              {storeStatus.open ? '🟢 Store is OPEN' : '🔴 Store is CLOSED'}
            </div>
            <div style={{ color: P.gray, fontSize:'13px', marginTop:'4px' }}>
              Customers {storeStatus.open ? 'can' : 'cannot'} place orders right now
            </div>
          </div>
          <button onClick={toggleStore} style={{
            background: storeStatus.open ? P.coral : P.green,
            color: 'white', border: 'none', borderRadius: '14px',
            padding: '14px 28px', cursor: 'pointer', fontWeight: '800',
            fontSize: '15px', fontFamily: 'inherit'
          }}>
            {storeStatus.open ? '🔴 Close Store' : '🟢 Open Store'}
          </button>
        </div>
        <div style={{ marginTop:'16px' }}>
          <label style={{ fontSize:'13px', fontWeight:'700', color: P.gray, display:'block', marginBottom:'8px' }}>
            📋 Customer Notice
          </label>
          <textarea
            value={localNote}
            onChange={e => setLocalNote(e.target.value)}
            onBlur={saveNote}
            placeholder="e.g. Store opens at 8 AM and closes at 10 PM. Closed on Sundays."
            rows={3}
            style={{
              border: `2px solid #E5E7EB`, borderRadius: '12px',
              padding: '11px 14px', fontSize: '14px', fontFamily: 'inherit',
              outline: 'none', width: '100%', boxSizing: 'border-box',
              background: '#fff', resize: 'vertical', lineHeight: '1.5'
            }}
          />
          <div style={{ fontSize:'11px', color: P.gray, marginTop:'4px' }}>
            Click away to save · Shown to all customers
          </div>
        </div>
      </div>
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