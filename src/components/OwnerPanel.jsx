import { useState } from 'react'
import { P } from '../constants.js'
import { btn } from '../styles.js'
import OwnerDash    from './OwnerDash.jsx'
import OwnerStock   from './OwnerStock.jsx'
import OwnerOrders  from './OwnerOrders.jsx'
import OwnerHistory from './OwnerHistory.jsx'

export default function OwnerPanel({ products, orders, saveProds, updateOrderStatus, deleteOrder, onLogout }) {
  const [tab, setTab] = useState('dash')
  const pending = orders.filter(o => o.status === 'pending').length

  const TABS = [
    { id:'dash',    label:'📊 Dashboard' },
    { id:'stock',   label:'📦 Inventory' },
    { id:'orders',  label:'🔔 Orders',   badge: pending },
    { id:'history', label:'📋 History' },
  ]

  return (
    <div style={{ background:'#FFF8F0', minHeight:'100vh',
      fontFamily:"'Trebuchet MS','Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,${P.coral},${P.orange})`,
        padding:'16px 24px', color:'white',
        display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ fontSize:'32px' }}>🏪</span>
          <div>
            <div style={{ fontWeight:'900', fontSize:'22px', fontFamily:'Georgia,serif' }}>HostelMart</div>
            <div style={{ fontSize:'12px', opacity:0.85 }}>Owner Dashboard</div>
          </div>
        </div>
        <button onClick={onLogout} style={btn('rgba(255,255,255,0.25)','white',true)}>
          🔒 Logout
        </button>
      </div>

      {/* Tab Bar */}
      <div style={{ display:'flex', overflowX:'auto', background:'#fff',
        borderBottom:'2px solid #F3F4F6', padding:'0 16px' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            border:'none', background:'none', padding:'16px 22px', cursor:'pointer',
            fontWeight:'700', fontSize:'14px', fontFamily:'inherit', whiteSpace:'nowrap',
            borderBottom: tab===t.id ? `3px solid ${P.coral}` : '3px solid transparent',
            color: tab===t.id ? P.coral : P.gray, position:'relative',
          }}>
            {t.label}
            {t.badge > 0 && (
              <span style={{ background:P.coral, color:'white', borderRadius:'50%',
                width:'18px', height:'18px', fontSize:'10px', marginLeft:'6px',
                display:'inline-flex', alignItems:'center', justifyContent:'center', fontWeight:'900' }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div style={{ padding:'24px', maxWidth:'960px', margin:'0 auto' }}>
        {tab === 'dash'    && <OwnerDash    products={products} orders={orders} />}
        {tab === 'stock'   && <OwnerStock   products={products} saveProds={saveProds} />}
        {tab === 'orders'  && <OwnerOrders  orders={orders} updateOrderStatus={updateOrderStatus} deleteOrder={deleteOrder} products={products} saveProds={saveProds} />}
        {tab === 'history' && <OwnerHistory orders={orders} />}
      </div>
    </div>
  )
}