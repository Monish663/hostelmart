import { useState, useEffect } from 'react'
import { dbSet, dbListen, ownerLogout, onOwnerAuthChange, signInCustomer } from './firebase.js'
import { P, INIT_PRODUCTS } from './constants.js'
import OwnerLogin    from './components/OwnerLogin.jsx'
import OwnerPanel    from './components/OwnerPanel.jsx'
import CustomerPanel from './components/CustomerPanel.jsx'

export default function App() {
  const [mode, setMode]           = useState('home')
  const [products, setProducts]   = useState([])
  const [orders, setOrders]       = useState([])
  const [ready, setReady]         = useState(false)

  /* Real-time Firebase listeners */
  useEffect(() => {
    let loadedProds = false
    let loadedOrds  = false
    const checkReady = () => { if (loadedProds && loadedOrds) setReady(true) }

    // Sign in anonymously FIRST, then start listeners
    signInCustomer().catch(() => {}).finally(() => {

    const unsubProds = dbListen('products', (data) => {
      if (data) {
        setProducts(Array.isArray(data) ? data : Object.values(data))
      } else {
        dbSet('products', INIT_PRODUCTS)
        setProducts(INIT_PRODUCTS)
      }
      loadedProds = true; checkReady()
    })

    const unsubOrds = dbListen('orders', (data) => {
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data)
        setOrders(arr.filter(Boolean))
      } else {
        setOrders([])
      }
      loadedOrds = true; checkReady()
    })

    /* Track owner Firebase Auth state */
    const unsubAuth = onOwnerAuthChange((user) => {
      if (user && user.email && mode === 'ownerLogin') setMode('owner')
    })
  })

    return () => { unsubProds(); unsubOrds(); unsubAuth() }
  }, [])

  const saveProds = (p) => dbSet('products', p)

  /* Owner updates order status only — never replaces whole orders array */
  const updateOrderStatus = (id, status, updatedProductsIfAny) => {
    dbSet(`orders/${id}/status`, status)
    if (updatedProductsIfAny) saveProds(updatedProductsIfAny)
  }

  const deleteOrder = (id) => dbSet(`orders/${id}`, null)

  const handleOwnerLogout = async () => {
    await ownerLogout()
    setMode('home')
  }

  const handleCustomerEnter = async () => {
    try {
      await signInCustomer()   // get anonymous auth token
    } catch(e) {
      console.error('Anonymous auth failed', e)
    }
    setMode('customer')
  }

  /* Loading Screen */
  if (!ready) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', height:'100vh', background:'#FFF8F0', gap:'16px',
      fontFamily:"'Trebuchet MS','Segoe UI',sans-serif" }}>
      <div style={{ fontSize:'56px', animation:'spin 1.5s linear infinite' }}>🛒</div>
      <div style={{ fontSize:'20px', fontWeight:'700', color:P.gray }}>Loading HostelMart…</div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
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

  /* Home Screen */
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
              borderRadius:'20px', padding:'6px 14px', fontSize:'13px', color:P.gray, fontWeight:'600' }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:'24px', flexWrap:'wrap', justifyContent:'center' }}>
        {[
          { label:'Shop Owner', sub:'Manage inventory & fulfil orders', emoji:'👨‍💼',
            grad:`linear-gradient(135deg,${P.coral},${P.orange})`, action: () => setMode('ownerLogin') },
          { label:'Customer',   sub:'Browse & order to your room',      emoji:'🛍️',
            grad:`linear-gradient(135deg,${P.teal},${P.blue})`,   action: handleCustomerEnter },
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
            <div style={{ fontSize:'24px', fontWeight:'900', marginBottom:'6px', fontFamily:'Georgia,serif' }}>{label}</div>
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
