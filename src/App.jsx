import { useState, useEffect, useRef, Component } from 'react'
import { dbSet, dbGet, dbListen, dbDeleteOrder, ownerLogout, onOwnerAuthChange, signInCustomer } from './firebase.js'
import { P, INIT_PRODUCTS } from './constants.js'
import OwnerLogin    from './components/OwnerLogin.jsx'
import OwnerPanel    from './components/OwnerPanel.jsx'
import CustomerPanel from './components/CustomerPanel.jsx'

export class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(e) { return { error: e } }
  render() {
    if (this.state.error) return (
      <div style={{ padding:'40px', textAlign:'center', fontFamily:'sans-serif' }}>
        <div style={{ fontSize:'48px', marginBottom:'16px' }}>⚠️</div>
        <h2 style={{ color:'#E8503A', marginBottom:'12px' }}>Something went wrong</h2>
        <pre style={{ color:'#6B7280', marginBottom:'20px', textAlign:'left',
          background:'#f5f5f5', padding:'16px', borderRadius:'8px', overflow:'auto' }}>
          {this.state.error.stack || this.state.error.message}
        </pre>
        <button onClick={() => window.location.reload()}
          style={{ background:'#E8503A', color:'white', border:'none', borderRadius:'10px',
            padding:'12px 24px', cursor:'pointer', fontSize:'16px', fontWeight:'700' }}>
          🔄 Reload App
        </button>
      </div>
    )
    return this.props.children
  }
}

export default function App() {
  const [mode, setMode]         = useState('home')
  const [products, setProducts] = useState([])
  const [orders, setOrders]     = useState([])
  const [ready, setReady]       = useState(false)
  const [debugLog, setDebugLog] = useState([])

  const modeRef    = useRef('home')
  const unsubProds = useRef(() => {})
  const unsubOrds  = useRef(() => {})

  const log = (msg) => {
    console.log('[HM]', msg)
    setDebugLog(prev => [...prev.slice(-12), `${new Date().toLocaleTimeString()} — ${msg}`])
  }

  const setModeSync = (m) => {
    log(`setMode: ${modeRef.current} → ${m}`)
    modeRef.current = m
    setMode(m)
  }

  const startListeners = () => {
    log('startListeners called')
    unsubProds.current()
    unsubOrds.current()

    unsubProds.current = dbListen('products', (data) => {
      log(`products listener fired, data=${data ? 'yes' : 'null'}`)
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data)
        setOrders(arr.filter(o => o && o.id && Array.isArray(o.items)))
      } else {
        dbSet('products', INIT_PRODUCTS)
        setProducts(INIT_PRODUCTS)
      }
      if (modeRef.current !== 'ownerLogin') setReady(true)
    })

    unsubOrds.current = dbListen('orders', (data) => {
      log(`orders listener fired, data=${data ? 'yes' : 'null'}`)
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data)
        setOrders(arr.filter(o => o && o.id && Array.isArray(o.items)))
      } else {
        setOrders([])
      }
    })
  }

  useEffect(() => {
    log('useEffect mount')
    const unsubAuth = onOwnerAuthChange((user) => {
      if (user) {
        log(`auth: user=${user.uid} email=${user.email || 'anon'} mode=${modeRef.current}`)
        startListeners()
        if (user.email) {
          log('→ setMode owner')
          setModeSync('owner')
        }
      } else {
        log('auth: no user → signInCustomer')
        signInCustomer().catch(e => log('signInCustomer error: ' + e.message))
      }
    })
    return () => {
      unsubAuth()
      unsubProds.current()
      unsubOrds.current()
    }
  }, [])

  const saveProds = (p) => dbSet('products', p)

  const updateOrderStatus = async (id, status, updatedProds) => {
    try {
      const existing = await dbGet(`orders/${id}`)
      if (!existing) throw new Error('Order not found')
      await dbSet(`orders/${id}`, { ...existing, status })
      if (updatedProds) await saveProds(updatedProds)
    } catch (e) {
      console.error('updateOrderStatus failed:', e)
      alert('Failed to update order: ' + e.message)
    }
  }

  const deleteOrder = async (id) => {
    try {
      await dbDeleteOrder(id)
    } catch (e) {
      console.error('deleteOrder failed:', e)
      alert('Delete failed: ' + e.message)
    }
  }

  const handleOwnerLogout = async () => {
    setModeSync('home')
    await ownerLogout()
  }

  // ── DEBUG OVERLAY (shown on every screen) ──────────────────────────────────
  const DebugOverlay = () => (
    <div style={{ position:'fixed', bottom:0, left:0, right:0, zIndex:9999,
      background:'rgba(0,0,0,0.85)', color:'#00ff00', fontSize:'11px',
      fontFamily:'monospace', padding:'8px 12px', maxHeight:'160px', overflowY:'auto' }}>
      <strong style={{ color:'#ffff00' }}>mode={mode} ready={String(ready)} prods={products.length} orders={orders.length}</strong>
      {debugLog.map((l, i) => <div key={i}>{l}</div>)}
    </div>
  )

  // ── Loading ────────────────────────────────────────────────────────────────
  if (!ready && mode !== 'owner') return (
    <>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', height:'100vh', background:'#FFF8F0', gap:'16px',
        fontFamily:"'Trebuchet MS','Segoe UI',sans-serif" }}>
        <div style={{ fontSize:'56px', animation:'spin 1.5s linear infinite' }}>🛒</div>
        <div style={{ fontSize:'20px', fontWeight:'700', color:P.gray }}>Loading HostelMart…</div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
      <DebugOverlay />
    </>
  )

  if (mode === 'ownerLogin') return (
    <>
      <OwnerLogin onSuccess={() => setModeSync('owner')} onBack={() => setModeSync('home')} />
      <DebugOverlay />
    </>
  )

  if (mode === 'owner') return (
    <>
      <OwnerPanel
        products={products} orders={orders}
        saveProds={saveProds} updateOrderStatus={updateOrderStatus}
        deleteOrder={deleteOrder} onLogout={handleOwnerLogout}
      />
      <DebugOverlay />
    </>
  )

  if (mode === 'customer') return (
    <>
      <CustomerPanel products={products} orders={orders} onBack={() => setModeSync('home')} />
      <DebugOverlay />
    </>
  )

  return (
    <>
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
        </div>
        <div style={{ display:'flex', gap:'24px', flexWrap:'wrap', justifyContent:'center' }}>
          {[
            { label:'Shop Owner', sub:'Manage inventory & fulfil orders', emoji:'👨‍💼',
              grad:`linear-gradient(135deg,${P.coral},${P.orange})`, action: () => setModeSync('ownerLogin') },
            { label:'Customer',   sub:'Browse & order to your room',      emoji:'🛍️',
              grad:`linear-gradient(135deg,${P.teal},${P.blue})`,   action: () => setModeSync('customer') },
          ].map(({ label, sub, emoji, grad, action }) => (
            <div key={label} onClick={action} style={{
              background:grad, color:'white', borderRadius:'24px', padding:'44px 52px',
              cursor:'pointer', textAlign:'center', minWidth:'250px',
              boxShadow:'0 10px 32px rgba(0,0,0,0.18)' }}>
              <div style={{ fontSize:'56px', marginBottom:'14px' }}>{emoji}</div>
              <div style={{ fontSize:'24px', fontWeight:'900', marginBottom:'6px', fontFamily:'Georgia,serif' }}>{label}</div>
              <div style={{ fontSize:'13px', opacity:0.88, lineHeight:1.5 }}>{sub}</div>
            </div>
          ))}
        </div>
      </div>
      <DebugOverlay />
    </>
  )
}
