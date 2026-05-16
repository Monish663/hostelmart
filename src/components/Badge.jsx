export default function Badge({ status }) {
  const m = {
    pending:   { bg:'#FEF3C7', fg:'#92400E', label:'⏳ Pending' },
    confirmed: { bg:'#DBEAFE', fg:'#1E40AF', label:'✅ Confirmed' },
    delivered: { bg:'#D1FAE5', fg:'#065F46', label:'🚀 Delivered' },
  }
  const s = m[status] || m.pending
  return (
    <span style={{ background:s.bg, color:s.fg, borderRadius:'20px',
      padding:'4px 12px', fontWeight:'700', fontSize:'12px', whiteSpace:'nowrap' }}>
      {s.label}
    </span>
  )
}
