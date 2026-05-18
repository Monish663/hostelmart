import { useState, useEffect } from 'react'
import { dbSet, dbGet, dbListen, dbDeleteOrder, ownerLogout, onOwnerAuthChange, signInCustomer } from './firebase.js'
import { P, INIT_PRODUCTS } from './constants.js'
import OwnerLogin    from './components/OwnerLogin.jsx'
import OwnerPanel    from './components/OwnerPanel.jsx'
import CustomerPanel from './components/CustomerPanel.jsx'

export default function App() {
  const [mode, setMode]         = useState('home')
  const [products, setProducts] = useState([])
  const [orders, setOrders]     = useState([])
  const [ready, setReady]       = useState(false)

  useEffect(() => {
    let unsubProds = () => {}
    let unsubOrds  = () => {}
    let unsubAuth  = () => {}

    const startListeners = () => {
      unsubProds = dbListen('products', (data) => {
        if (data) {
          const arr = Array.isArray(data) ? data : Object.values(data)
          setProducts(arr.filter(Boolean))
        } else {
          dbSet('products', INIT_PRODUCTS)
          setProducts(INIT_PRODUCTS)
        }
        setReady(true)
      })

      unsubOrds = dbListen('orders', (data) => {
        if (data) {
          const arr = Array.isArray(data) ? data : Object.values(data)
          setOrders(arr.filter(Boolean))
        } else {
          setOrders([])
        }
      })
    }

    signInCustomer().catch(() => {}).finally(() => startListeners())

    unsubAuth = onOwnerAuthChange((user) => {
      if (user?.email && mode === 'ownerLogin') setMode('owner')
    })

    return () => { unsubProds(); unsubOrds(); unsubAuth() }
  }, [])

  const saveProds = (p) => dbSet('products', p)

  /* FIXED: fetch the full order object, update status, then re-save the whole order.
     This avoids nested-path write issues with Firebase Realtime Database. */
  const updateOrderStatus = async (id, status, updatedProds) => {
    try {
      const existing = await dbGet(`orders/${id}`)
      if (existing) {
        await dbSet(`orders/${id}`, { ...existing, status })
      }
      if (updatedProds) await saveProds(updatedProds)
    } catch (e) {
      console.error('Failed to update order status:', e)
      alert('Failed to update order: ' + e.message)
    }
  }

  const deleteOrder = async (id) => {
    try {
      await dbDeleteOrder(id)
    } catch(e) {
      console.error('Delete failed:', e)
      alert('Delete failed: ' + e.message)
    }
  }

  const handleOwnerLogout = async () => {
    await ownerLogout()
    setMode('home')
    signInCustomer().catch(() => {})
  }

  if (!ready) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', height:'100vh', background:'#FFF8F0', gap:'16px',
      fontFamily:"'Trebuchet MS','Segoe UI',sans-serif" }}>
      <div style={{ fontSize:'56px', animation:'spin 1.5s linear infinite' }}>🛒</div>
      <div style={{ fontSize:'20px', fontWeight:'700', color:P.gray }}>Loading HostelMart…</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (mode === 'ownerLogin') return (
    <OwnerLogin onSuccess={() => setMode('owner')} onBack={() => setMode('home')} />
  )

  if (mode === 'owner') return (
    <OwnerPanel
      products={products}
      orders={orders}
      saveProds={saveProds}
      updateOrderStatus={updateOrderStatus}
      deleteOrder={deleteOrder}
      onLogout={handleOwnerLogout}
    />
  )

  if (mode === 'customer') return (
    <CustomerPanel
      products={products}
      orders={orders}
      onBack={() => setMode('home')}
    />
  )

  return (
    <div style={{ background:'#FFF8F0', minHeight:'100vh', display:'flex',
      flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'24px', fontFamily:"'Trebuchet MS','Segoe UI',sans-serif" }}>

      <div style={{ textAlign:'center', marginBottom:'48px' }}>
        <div style={{ fontSize:'72px', lineHeight:1, marginBottom:'16px' }}>🏪</div>
        <h1 style={{ fontSize:'44px', fontWeight:'900', color:P.dark, margin:'0 0 10px',
          letterSpacing:'-1.5px', fontFamily:'Georgia,serif' }}>HostelMart</h1>
        <p style={{ color:P.gray, fontSize:'17px', margin:0 }}>
          Fresh groceries delivered right to your hostel room
        </p>
        <div style={{ display:'flex', gap:'12px', justifyContent:'center', marginTop:'16px', flexWrap:'wrap' }}>
          {['🚀 Fast Delivery','💳 Pay on Delivery','🏠 Room Service','🛍️ Wide Selection'].map(t => (
            <span key={t} style={{ background:'#fff', border:'1.5px solid #E5E7EB',
              borderRadius:'20px', padding:'6px 14px', fontSize:'13px',
              color:P.gray, fontWeight:'600' }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:'24px', flexWrap:'wrap', justifyContent:'center' }}>
        {[
          { label:'Shop Owner', sub:'Manage inventory & fulfil orders', emoji:'👨‍💼',
            grad:`linear-gradient(135deg,${P.coral},${P.orange})`,
            action: () => setMode('ownerLogin') },
          { label:'Customer', sub:'Browse & order to your room', emoji:'🛍️',
            grad:`linear-gradient(135deg,${P.teal},${P.blue})`,
            action: () => setMode('customer') },
        ].map(({ label, sub, emoji, grad, action }) => (
          <div key={label} onClick={action} style={{
            background:grad, color:'white', borderRadius:'24px',
            padding:'44px 52px', cursor:'pointer', textAlign:'center',
            minWidth:'250px', boxShadow:'0 10px 32px rgba(0,0,0,0.18)',
            transition:'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-8px)'; e.currentTarget.style.boxShadow='0 20px 48px rgba(0,0,0,0.24)' }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; e.currentTarget.style.boxShadow='0 10px 32px rgba(0,0,0,0.18)' }}>
            <div style={{ fontSize:'56px', marginBottom:'14px' }}>{emoji}</div>
            <div style={{ fontSize:'24px', fontWeight:'900', marginBottom:'6px',
              fontFamily:'Georgia,serif' }}>{label}</div>
            <div style={{ fontSize:'13px', opacity:0.88, lineHeight:1.5 }}>{sub}</div>
          </div>
        ))}
      </div>

      <p style={{ marginTop:'48px', color:'#B0B0B0', fontSize:'13px', textAlign:'center' }}>
        🏠 Hostel Grocery Service &nbsp;·&nbsp; Pay on Delivery &nbsp;·&nbsp; HostelMart v4.0
      </p>
    </div>
  )
}
