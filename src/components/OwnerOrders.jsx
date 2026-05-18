import { useState } from 'react'
import { P } from '../constants.js'
import { btn, card } from '../styles.js'
import Badge from './Badge.jsx'

export default function OwnerOrders({ orders, updateOrderStatus, deleteOrder, products, saveProds }) {
  const [filter, setFilter] = useState('all')

  const visible = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const setStatus = (id, newStatus) => {
    // Deduct stock when confirmed
    if (newStatus === 'confirmed') {
      const order = orders.find(o => o.id === id)
      if (order) {
        const updatedProducts = products.map(p => {
          const orderedItem = order.items.find(it => it.productId === p.id)
          if (orderedItem) return { ...p, stock: Math.max(0, p.stock - orderedItem.qty) }
          return p
        })
        updateOrderStatus(id, newStatus, updatedProducts)
        return
      }
    }
    updateOrderStatus(id, newStatus, null)
  }

  const del = (id) => {
    if (window.confirm('Delete this order?')) {
      console.log('Deleting order:', id)
      deleteOrder(id)
        .then(() => console.log('Deleted successfully'))
        .catch(e => console.error('Delete failed:', e))
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
        <h2 style={{ color:P.dark, margin:0, fontFamily:'Georgia,serif', fontSize:'26px' }}>Live Orders</h2>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          {[
            { id:'all',       label:'All' },
            { id:'pending',   label:'⏳ Pending' },
            { id:'confirmed', label:'✅ Confirmed' },
            { id:'delivered', label:'🚀 Delivered' },
          ].map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              ...btn(filter===f.id?P.coral:'#EEE', filter===f.id?'white':P.gray, true), borderRadius:'20px',
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {visible.length === 0
        ? <div style={{ ...card({ textAlign:'center', padding:'52px' }), color:P.gray }}>
            <div style={{ fontSize:'52px', marginBottom:'12px' }}>📭</div>
            <div style={{ fontSize:'16px' }}>No {filter === 'all' ? '' : filter} orders</div>
          </div>
        : <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {[...visible].reverse().map(o => (
              <div key={o.id} style={{ ...card({
                borderLeft:`5px solid ${o.status==='delivered'?P.green:o.status==='confirmed'?P.blue:P.amber}`,
              }) }}>
                {/* Order Header */}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start',
                  flexWrap:'wrap', gap:'12px', marginBottom:'14px' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
                      <span style={{ fontWeight:'900', fontSize:'22px', color:P.dark }}>
                        {o.selfPickup ? '🏃 Self Pickup' : `🏠 Room ${o.roomNumber}`}
                      </span>
                      <Badge status={o.status} />
                    </div>
                    <div style={{ display:'flex', gap:'14px', flexWrap:'wrap', marginTop:'6px' }}>
                      {o.customerName && (
                        <span style={{ color:P.dark, fontSize:'14px', fontWeight:'700' }}>
                          👤 {o.customerName}
                        </span>
                      )}
                      {o.phone && (
                        <span style={{ color:P.blue, fontSize:'14px', fontWeight:'700' }}>
                          📱 +91 {o.phone}
                        </span>
                      )}
                    </div>
                    <div style={{ color:P.gray, fontSize:'12px', marginTop:'4px' }}>
                      {new Date(o.timestamp).toLocaleString()} · Order #{o.id.slice(-5)}
                    </div>
                    {o.note && (
                      <div style={{ color:P.purple, fontSize:'13px', fontWeight:'600', marginTop:'6px',
                        background:P.purple+'10', borderRadius:'8px', padding:'6px 12px', display:'inline-block' }}>
                        📝 {o.note}
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight:'900', fontSize:'28px', color:P.green }}>₹{o.total}</div>
                </div>

                {/* Items */}
                <div style={{ background:P.lgray, borderRadius:'12px', padding:'14px', marginBottom:'14px' }}>
                  {o.items.map((it, i) => (
                    <div key={i} style={{ display:'flex', justifyContent:'space-between',
                      fontSize:'14px', padding:'5px 0',
                      borderBottom: i < o.items.length-1 ? '1px solid #E5E7EB' : 'none' }}>
                      <span>{it.emoji || '📦'} {it.name} × {it.qty} {it.unit}</span>
                      <span style={{ fontWeight:'700', color:P.dark }}>₹{it.price * it.qty}</span>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', alignItems:'center' }}>
                  {o.status === 'pending' && (
                    <button onClick={() => setStatus(o.id, 'confirmed')} style={btn(P.blue)}>
                      ✅ Confirm & Deduct Stock
                    </button>
                  )}
                  {o.status !== 'delivered' && (
                    <button onClick={() => setStatus(o.id, 'delivered')} style={btn(P.green)}>
                      🚀 Mark Delivered
                    </button>
                  )}
                  {o.status === 'delivered' && (
                    <span style={{ color:P.green, fontWeight:'700' }}>✅ Delivered successfully</span>
                  )}
                  <button onClick={() => { if(window.confirm('Delete this order?')) deleteOrder(o.id) }}
                    style={{ ...btn('#FEE2E2','#DC2626',true), marginLeft:'auto' }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
