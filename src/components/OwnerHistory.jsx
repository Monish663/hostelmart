import { P } from '../constants.js'
import { card } from '../styles.js'

export default function OwnerHistory({ orders }) {
  const done    = orders.filter(o => o.status === 'delivered')
  const total   = done.reduce((s, o) => s + o.total, 0)
  const byRoom  = done.reduce((acc, o) => {
    acc[o.roomNumber] = (acc[o.roomNumber] || 0) + o.total
    return acc
  }, {})
  const topRooms = Object.entries(byRoom).sort((a, b) => b[1] - a[1]).slice(0, 5)
  const medals   = ['🥇','🥈','🥉','🏅','🏅']
  const colors   = [P.amber, P.gray, '#A78BFA', '#60A5FA', '#34D399']

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
        marginBottom:'24px', flexWrap:'wrap', gap:'12px' }}>
        <h2 style={{ color:P.dark, margin:0, fontFamily:'Georgia,serif', fontSize:'26px' }}>Order History</h2>
        <div style={{ background:`linear-gradient(135deg,${P.green},${P.teal})`, color:'white',
          borderRadius:'14px', padding:'12px 24px', fontWeight:'800', fontSize:'18px' }}>
          💰 Total Revenue: ₹{total}
        </div>
      </div>

      {topRooms.length > 0 && (
        <div style={{ ...card({ marginBottom:'24px' }) }}>
          <h3 style={{ margin:'0 0 14px', color:P.dark }}>🏆 Top Customers by Room</h3>
          <div style={{ display:'flex', flexWrap:'wrap', gap:'10px' }}>
            {topRooms.map(([room, amt], i) => (
              <div key={room} style={{ background:colors[i]+'22', border:`2px solid ${colors[i]}`,
                borderRadius:'12px', padding:'10px 18px', fontWeight:'700' }}>
                {medals[i]} Room {room} — ₹{amt}
              </div>
            ))}
          </div>
        </div>
      )}

      <p style={{ color:P.gray, marginBottom:'16px' }}>{done.length} completed orders</p>

      {done.length === 0
        ? <div style={{ ...card({ textAlign:'center', padding:'52px' }), color:P.gray }}>
            <div style={{ fontSize:'52px', marginBottom:'12px' }}>📭</div>
            <div>No delivered orders yet</div>
          </div>
        : <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
            {[...done].reverse().map(o => (
              <div key={o.id} style={{ ...card({ borderLeft:`5px solid ${P.green}` }) }}>
                <div style={{ display:'flex', justifyContent:'space-between',
                  alignItems:'center', flexWrap:'wrap', gap:'8px' }}>
                  <div>
                    <span style={{ fontWeight:'800', fontSize:'16px' }}>🏠 Room {o.roomNumber}</span>
                    {o.customerName && (
                      <span style={{ color:P.gray, fontSize:'13px', marginLeft:'8px' }}>· {o.customerName}</span>
                    )}
                    <div style={{ color:P.gray, fontSize:'12px', marginTop:'2px' }}>
                      {new Date(o.timestamp).toLocaleString()} · {o.items.length} items
                    </div>
                  </div>
                  <div style={{ fontWeight:'900', fontSize:'22px', color:P.green }}>₹{o.total}</div>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  )
}
