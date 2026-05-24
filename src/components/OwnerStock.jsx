import { useState } from 'react'
import { P, CAT, uid } from '../constants.js'
import { uploadProductImage } from '../firebase.js'
import { btn, card, inp } from '../styles.js'

export default function OwnerStock({ products, saveProds }) {
  const [showAdd, setShowAdd]   = useState(false)
  const [catFilter, setCatFilter] = useState('All')
  const [search, setSearch]     = useState('')
  const [editStock, setEditStock] = useState({})
  const [form, setForm] = useState({ name:'', cat:'Beverages', price:'', stock:'', unit:'piece', emoji:'🛒' })
  const [uploading, setUploading] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return alert('Image must be under 5MB')
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const addProduct = async () => {
    if (!form.name || !form.price || form.stock === '') return alert('Please fill all required fields')
    setUploading(true)
    try {
      const newId = uid()
      let imageUrl = null
      if (imageFile) {
        // 15 second timeout for upload
        const uploadPromise = uploadProductImage(imageFile, newId)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Upload timed out. Check your internet and try again.')), 15000)
        )
        imageUrl = await Promise.race([uploadPromise, timeoutPromise])
      }
      saveProds([...products, {
        id: newId, name:form.name, cat:form.cat,
        price:Number(form.price), stock:Number(form.stock),
        unit:form.unit, emoji:form.emoji,
        imageUrl: imageUrl || null,
      }])
      setForm({ name:'', cat:'Beverages', price:'', stock:'', unit:'piece', emoji:'🛒' })
      setImageFile(null)
      setImagePreview(null)
      setShowAdd(false)
    } catch(e) {
      alert('❌ ' + e.message)
    } finally {
      setUploading(false)
    }
  }

  const del = (id) => { if (window.confirm('Delete this product?')) saveProds(products.filter(p => p.id !== id)) }

  const adj = (id, d) =>
    saveProds(products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + d) } : p))

  const setDirectStock = (id) => {
    const v = parseInt(editStock[id])
    if (isNaN(v) || v < 0) return
    saveProds(products.map(p => p.id === id ? { ...p, stock: v } : p))
    setEditStock(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  const cats = ['All', ...Object.keys(CAT)]
  const visible = products.filter(p =>
    (catFilter === 'All' || p.cat === catFilter) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        marginBottom:'20px', flexWrap:'wrap', gap:'12px' }}>
        <h2 style={{ color:P.dark, margin:0, fontFamily:'Georgia,serif', fontSize:'26px' }}>Inventory</h2>
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
          <input placeholder="🔍 Search…" value={search}
            onChange={e => setSearch(e.target.value)} style={{ ...inp(), width:'200px' }} />
          <button onClick={() => {
            setShowAdd(!showAdd)
            setUploading(false)
            setImageFile(null)
            setImagePreview(null)
            setForm({ name:'', cat:'Beverages', price:'', stock:'', unit:'piece', emoji:'🛒' })
          }} style={btn(P.teal)}>＋ Add Product</button>
        </div>
      </div>

      {/* Category Pills */}
      <div style={{ display:'flex', gap:'8px', overflowX:'auto', paddingBottom:'12px', marginBottom:'20px' }}>
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

      {/* Add Form */}
      {showAdd && (
        <div style={{ ...card({ border:`2px solid ${P.teal}`, marginBottom:'24px' }) }}>
          <h3 style={{ color:P.teal, margin:'0 0 16px', fontSize:'18px' }}>➕ Add New Product</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:'14px' }}>
            {[
              { label:'Product Name *', key:'name',  type:'text',   ph:'e.g. Mineral Water' },
              { label:'Price (₹) *',    key:'price', type:'number', ph:'e.g. 20' },
              { label:'Stock *',        key:'stock', type:'number', ph:'e.g. 50' },
              { label:'Unit',           key:'unit',  type:'text',   ph:'bottle / pack…' },
              { label:'Emoji',          key:'emoji', type:'text',   ph:'e.g. 💧' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize:'12px', fontWeight:'700', color:P.gray, display:'block', marginBottom:'6px' }}>{f.label}</label>
                <input type={f.type} placeholder={f.ph} value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={inp(P.teal)} />
              </div>
            ))}
            <div>
              <label style={{ fontSize:'12px', fontWeight:'700', color:P.gray, display:'block', marginBottom:'6px' }}>Category</label>
              <select value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })}
                style={{ ...inp(P.teal), background:'white' }}>
                {Object.keys(CAT).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          {/* Image Upload */}
          <div style={{ marginTop:'14px' }}>
            <label style={{ fontSize:'12px', fontWeight:'700', color:P.gray, display:'block', marginBottom:'6px' }}>
              📷 Product Photo (optional)
            </label>
            <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
              <label style={{ cursor:'pointer', background:P.teal+'18', border:`2px dashed ${P.teal}`,
                borderRadius:'12px', padding:'10px 18px', fontSize:'13px', fontWeight:'700',
                color:P.teal, display:'inline-flex', alignItems:'center', gap:'8px' }}>
                📁 Choose Photo
                <input type="file" accept="image/*" onChange={handleImageSelect}
                  style={{ display:'none' }} />
              </label>
              {imagePreview && (
                <div style={{ position:'relative' }}>
                  <img src={imagePreview} alt="preview"
                    style={{ width:'64px', height:'64px', objectFit:'cover',
                      borderRadius:'10px', border:`2px solid ${P.teal}` }} />
                  <button onClick={() => { setImageFile(null); setImagePreview(null) }}
                    style={{ position:'absolute', top:'-8px', right:'-8px', background:P.coral,
                      border:'none', borderRadius:'50%', width:'20px', height:'20px',
                      cursor:'pointer', color:'white', fontSize:'12px', fontWeight:'900',
                      display:'flex', alignItems:'center', justifyContent:'center' }}>×</button>
                </div>
              )}
              {!imagePreview && (
                <span style={{ color:P.gray, fontSize:'12px' }}>No photo selected — emoji will be used</span>
              )}
            </div>
          </div>

          <div style={{ marginTop:'16px', display:'flex', gap:'12px' }}>
            <button onClick={addProduct} disabled={uploading} style={{ ...btn(P.teal), opacity: uploading?0.7:1 }}>
              {uploading ? '⏳ Uploading…' : '✅ Add to Inventory'}
            </button>
            <button onClick={() => {
              setShowAdd(false)
              setUploading(false)
              setImageFile(null)
              setImagePreview(null)
              setForm({ name:'', cat:'Beverages', price:'', stock:'', unit:'piece', emoji:'🛒' })
            }} style={btn('#E5E7EB', P.gray)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:'16px' }}>
        {visible.map(p => {
          const meta   = CAT[p.cat] || { color:'#888', emoji:'📦' }
          const isOut  = p.stock === 0
          const isLow  = !isOut && p.stock <= 5
          const editing = editStock[p.id] !== undefined
          return (
            <div key={p.id} style={{ ...card({
              border: isOut ? `2px solid ${P.coral}` : isLow ? `2px solid ${P.amber}` : '2px solid transparent',
              overflow:'hidden', padding:0,
            }) }}>
              <div style={{ background:meta.color, padding:'16px 20px',
                display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  {p.imageUrl
                    ? <img src={p.imageUrl} alt={p.name}
                        style={{ width:'48px', height:'48px', objectFit:'cover',
                          borderRadius:'10px', border:'2px solid rgba(255,255,255,0.4)', flexShrink:0 }} />
                    : <span style={{ fontSize:'36px', lineHeight:1 }}>{p.emoji}</span>
                  }
                  <div>
                    <div style={{ color:'white', fontWeight:'800', fontSize:'15px' }}>{p.name}</div>
                    <span style={{ background:'rgba(255,255,255,0.25)', color:'white',
                      borderRadius:'6px', padding:'2px 8px', fontSize:'11px', fontWeight:'700' }}>
                      {meta.emoji} {p.cat}
                    </span>
                  </div>
                </div>
                <button onClick={() => del(p.id)} style={{ background:'rgba(255,255,255,0.2)',
                  border:'none', borderRadius:'8px', width:'32px', height:'32px',
                  cursor:'pointer', fontSize:'16px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  🗑️
                </button>
              </div>

              <div style={{ padding:'16px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'14px' }}>
                  <div style={{ fontWeight:'900', fontSize:'22px', color:P.green }}>
                    ₹{p.price}
                    <span style={{ fontSize:'13px', fontWeight:'400', color:P.gray }}>/{p.unit}</span>
                  </div>
                  {isOut && <span style={{ background:'#FEE2E2', color:'#DC2626',
                    borderRadius:'6px', padding:'3px 10px', fontSize:'11px', fontWeight:'800' }}>OUT OF STOCK</span>}
                  {isLow && <span style={{ background:'#FEF3C7', color:'#92400E',
                    borderRadius:'6px', padding:'3px 10px', fontSize:'11px', fontWeight:'800' }}>LOW STOCK</span>}
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                  <button onClick={() => adj(p.id, -1)} style={{
                    ...btn(P.coral,'white',true), width:'36px', height:'36px', padding:0,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0,
                  }}>−</button>

                  {editing
                    ? <input type="number" value={editStock[p.id]}
                        onChange={e => setEditStock({ ...editStock, [p.id]: e.target.value })}
                        onBlur={() => setDirectStock(p.id)}
                        onKeyDown={e => e.key === 'Enter' && setDirectStock(p.id)}
                        style={{ ...inp(P.teal), textAlign:'center', fontWeight:'900', fontSize:'18px', flex:1 }}
                        autoFocus />
                    : <div onClick={() => setEditStock({ ...editStock, [p.id]: String(p.stock) })}
                        style={{ flex:1, textAlign:'center', fontWeight:'900', fontSize:'20px',
                          background:P.lgray, borderRadius:'10px', padding:'8px', cursor:'text',
                          color: isOut?P.coral:isLow?P.amber:P.dark }}>
                        {p.stock}
                      </div>
                  }

                  <button onClick={() => adj(p.id, +1)} style={{
                    ...btn(P.teal,'white',true), width:'36px', height:'36px', padding:0,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'20px', flexShrink:0,
                  }}>＋</button>
                  <span style={{ color:P.gray, fontSize:'12px', whiteSpace:'nowrap' }}>{p.unit}s</span>
                </div>
                <p style={{ color:P.gray, fontSize:'11px', margin:'6px 0 0', textAlign:'center' }}>
                  Click count to type a value directly
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
