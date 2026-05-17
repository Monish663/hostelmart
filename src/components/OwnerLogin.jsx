import { useState } from 'react'
import { P } from '../constants.js'
import { btn, card, inp } from '../styles.js'
import { ownerLogin } from '../firebase.js'

export default function OwnerLogin({ onSuccess, onBack }) {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const [shake, setShake]       = useState(false)

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await ownerLogin(email.trim(), password)
      onSuccess()
    } catch (e) {
      setError('Invalid email or password. Please try again.')
      setShake(true)
      setTimeout(() => setShake(false), 600)
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleLogin() }

  return (
    <div style={{ background: P.bg, minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      fontFamily: "'Trebuchet MS','Segoe UI',sans-serif" }}>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-10px)} 40%{transform:translateX(10px)}
          60%{transform:translateX(-8px)}  80%{transform:translateX(8px)}
        }
        .shake { animation: shake 0.5s ease; }
      `}</style>

      <div className={shake ? 'shake' : ''} style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', lineHeight: 1, marginBottom: '12px' }}>🔐</div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: P.dark,
            margin: '0 0 6px', fontFamily: 'Georgia,serif' }}>Owner Login</h1>
          <p style={{ color: P.gray, margin: 0, fontSize: '14px' }}>
            Restricted access — authorised personnel only
          </p>
        </div>

        <div style={{ ...card({ border: `2px solid ${P.coral}` }) }}>
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: '800', fontSize: '13px',
              color: P.gray, marginBottom: '8px' }}>📧 Owner Email</label>
            <input
              type="email"
              placeholder="Enter owner email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={handleKey}
              style={{ ...inp(P.coral), fontSize: '15px', padding: '13px 16px' }}
              autoFocus
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '800', fontSize: '13px',
              color: P.gray, marginBottom: '8px' }}>🔒 Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={handleKey}
                style={{ ...inp(P.coral), fontSize: '15px', padding: '13px 48px 13px 16px' }}
              />
              <button onClick={() => setShowPwd(!showPwd)} style={{
                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px',
              }}>
                {showPwd ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', border: `1.5px solid ${P.coral}`,
              borderRadius: '10px', padding: '10px 14px', color: '#DC2626',
              fontSize: '13px', fontWeight: '700', marginBottom: '18px' }}>
              ❌ {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading} style={{
            ...btn(`linear-gradient(135deg,${P.coral},${P.orange})`),
            width: '100%', justifyContent: 'center',
            padding: '16px', fontSize: '16px', borderRadius: '12px',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? '⏳ Logging in…' : '🚀 Login to Dashboard'}
          </button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={onBack} style={{ ...btn('#EEE', P.gray, true), borderRadius: '20px' }}>
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
