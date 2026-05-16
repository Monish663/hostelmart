/* ─── Button style ────────────────────────────────────────── */
export const btn = (bg, fg = 'white', small = false) => ({
  background: bg, color: fg, border: 'none',
  borderRadius: small ? '8px' : '12px',
  padding: small ? '6px 14px' : '12px 22px',
  cursor: 'pointer', fontWeight: '700',
  fontSize: small ? '13px' : '14px',
  fontFamily: 'inherit',
  display: 'inline-flex', alignItems: 'center', gap: '6px',
  transition: 'opacity 0.15s, transform 0.15s',
})

/* ─── Card container ─────────────────────────────────────── */
export const card = (extra = {}) => ({
  background: '#fff', borderRadius: '18px', padding: '20px',
  boxShadow: '0 3px 14px rgba(0,0,0,0.07)', ...extra,
})

/* ─── Input field ─────────────────────────────────────────── */
export const inp = (accent = '#E5E7EB') => ({
  border: `2px solid ${accent}`, borderRadius: '12px',
  padding: '11px 14px', fontSize: '14px', fontFamily: 'inherit',
  outline: 'none', width: '100%', boxSizing: 'border-box', background: '#fff',
})
