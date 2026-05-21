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
        <p style={{ color:'#6B7280', marginBottom:'20px' }}>{this.state.error.message}</p>
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

  // Refs so callbacks always see latest values without stale closures
  const modeRef      = useRef('home')
  const unsubProds   = useRef(() => {})
  const unsubOrds    = useRef(() => {})

  const setModeSync = (m) => { modeRef.current = m; setMode(m) }

  // Start DB listeners — called once after any auth session is established
  const startListeners = () => {
    // Tear down any existing listeners first
    unsubProds.current()
    unsubOrds.current()

    unsubProds.current = dbListen('products', (data) => {
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data)
        setProducts(arr.filter(Boolean))
      } else {
        dbSet('products', INIT_PRODUCTS)
        setProducts(INIT_PRODUCTS)
      }
      setReady(true)
    })

    unsubOrds.current = dbListen('orders', (data) => {
      if (data) {
        const arr = Array.isArray(data) ? data : Object.values(data)
        setOrders(arr.filter(Boolean))
      } else {
        setOrders([])
      }
    })
  }

  useEffect(() => {
    // Watch auth state — this fires immediately with the current user on mount,
    // and again whenever auth changes (anonymous → owner login → logout etc.)
    const unsubAuth = onOwnerAuthChange((user) => {
      if (user) {
        // Always restart listeners when auth changes so they use the new token
        startListeners()

        if (user.email) {
          // Owner is logged in — go to owner dashboard
          // Only redirect if coming from ownerLogin page (not on page refresh)
          if (modeRef.current === 'ownerLogin') {
            setModeSync('owner')
          }
        }
        // anonymous user: listeners started above, stay on current mode
      } else {
        // Signed out — sign in anonymously so customers can browse
        signInCustomer().catch(console.error)
      }
    })

    return () => {
      unsubAuth()
      unsubProds.current()
      unsubOrds.current()
    }
  }, [])

  const saveProds = (p) => dbSet('products', p)

  // Read full order then re-save with new status — never use nested path writes
  // because Firebase rules block them with $other: false
  const updateOrderStatus = async (id, status, updatedProds) => {
    try {
      const existing = await dbGet(`orders/${id}`)
      if (!existing) throw new Error('Order not found')
      await dbSet(`orders/${id}`, { ...existing, status })
      if (updatedProds) await saveProds(updatedProds)
    } catch (e) {
      console.error('Failed to update order:', e)
      alert('Failed to update order: ' + e.message)
    }
  }

  const deleteOrder = async (id) => {
    try {
      await dbDeleteOrder(id)
    } catch (e) {
      console.error('Delete failed:', e)
      alert('Delete failed: ' + e.message)
    }
  }

  const handleOwnerLogout = async () => {
    setModeSync('home')
    await ownerLogout()
    // ownerLogout triggers onOwnerAuthChange(null) → signInCustomer() → startListeners()
  }

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (!ready) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', height:'100vh', background:'#FFF8F0', gap:'16px',
      fontFamily:"'Trebuchet MS','Segoe UI',sans-serif" }}>
      <div style={{ fontSize:'56px', animation:'spin 1.5s linear infinite' }}>🛒</div>
      <div style={{ fontSize:'20px', fontWeight:'700', color:P.gray }}>Loading HostelMart…</div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  // ── Owner login ─────────────────────────────────────────────────────────────
  if (mode === 'ownerLogin') return (
    <OwnerLogin
      onSuccess={() => setModeSync('owner')}
      onBack={() => setModeSync('home')}
    />
  )

  // ── Owner dashboard ─────────────────────────────────────────────────────────
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

  // ── Customer panel ──────────────────────────────────────────────────────────
  if (mode === 'customer') return (
    <CustomerPanel
      products={products}
      orders={orders}
      onBack={() => setModeSync('home')}
    />
  )

  // ── Home screen ─────────────────────────────────────────────────────────────
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
            action: () => setModeSync('ownerLogin') },
          { label:'Customer',   sub:'Browse & order to your room',      emoji:'🛍️',
            grad:`linear-gradient(135deg,${P.teal},${P.blue})`,
            action: () => setModeSync('customer') },
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
