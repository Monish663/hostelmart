import { useState } from 'react'
import { P } from '../constants.js'
import { btn, card, inp } from '../styles.js'
import { sendOtp } from '../firebase.js'

export default function CustomerLogin({ onSuccess, onBack }) {
  const [step, setStep]       = useState('phone')   // 'phone' | 'otp'
  const [phone, setPhone]     = useState('')
  const [otp, setOtp]         = useState('')
  const [confirm, setConfirm] = useState(null)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const fullNumber = '+91' + digits
      const result = await sendOtp(fullNumber)
      setConfirm(result)
      setStep('otp')
    } catch (e) {
      setError('Failed to send OTP. Please check your number and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await confirm.confirm(otp)
      onSuccess({
        uid: result.user.uid,
        phone: result.user.phoneNumber,
        displayPhone: phone,
      })
    } catch (e) {
      setError('Incorrect OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    setStep('phone')
    setOtp('')
    setConfirm(null)
    setError('')
  }

  return (
    <div style={{ background: P.bg, minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      fontFamily: "'Trebuchet MS','Segoe UI',sans-serif" }}>

      {/* Invisible recaptcha container */}
      <div id="recaptcha-container" />

      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '64px', lineHeight: 1, marginBottom: '12px' }}>
            {step === 'phone' ? '📱' : '🔑'}
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: P.dark,
            margin: '0 0 6px', fontFamily: 'Georgia,serif' }}>
            {step === 'phone' ? 'Customer Login' : 'Enter OTP'}
          </h1>
          <p style={{ color: P.gray, margin: 0, fontSize: '14px' }}>
            {step === 'phone'
              ? 'Enter your mobile number to receive an OTP'
              : `OTP sent to +91 ${phone}`}
          </p>
        </div>

        <div style={{ ...card({ border: `2px solid ${P.teal}` }) }}>

          {step === 'phone' && (
            <>
              <label style={{ display: 'block', fontWeight: '800', fontSize: '13px',
                color: P.gray, marginBottom: '8px' }}>📱 Mobile Number</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <div style={{ background: P.lgray, border: `2px solid ${P.teal}`,
                  borderRadius: '12px', padding: '11px 14px', fontWeight: '800',
                  fontSize: '15px', color: P.dark, flexShrink: 0 }}>+91</div>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  style={{ ...inp(P.teal), fontSize: '18px', fontWeight: '700',
                    letterSpacing: '2px', flex: 1 }}
                  autoFocus
                  maxLength={10}
                />
              </div>

              {error && (
                <div style={{ background: '#FEE2E2', border: `1.5px solid ${P.coral}`,
                  borderRadius: '10px', padding: '10px 14px', color: '#DC2626',
                  fontSize: '13px', fontWeight: '700', marginBottom: '16px' }}>
                  ❌ {error}
                </div>
              )}

              <button onClick={handleSendOtp} disabled={loading} style={{
                ...btn(`linear-gradient(135deg,${P.teal},${P.blue})`),
                width: '100%', justifyContent: 'center',
                padding: '16px', fontSize: '16px', borderRadius: '12px',
                opacity: loading ? 0.7 : 1,
              }}>
                {loading ? '⏳ Sending OTP…' : '📨 Send OTP'}
              </button>
            </>
          )}

          {step === 'otp' && (
            <>
              <label style={{ display: 'block', fontWeight: '800', fontSize: '13px',
                color: P.gray, marginBottom: '8px' }}>🔑 Enter 6-digit OTP</label>
              <input
                type="number"
                placeholder="_ _ _ _ _ _"
                value={otp}
                onChange={e => setOtp(e.target.value.slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                style={{ ...inp(P.teal), fontSize: '28px', fontWeight: '900',
                  textAlign: 'center', letterSpacing: '8px', marginBottom: '20px' }}
                autoFocus
                maxLength={6}
              />

              {error && (
                <div style={{ background: '#FEE2E2', border: `1.5px solid ${P.coral}`,
                  borderRadius: '10px', padding: '10px 14px', color: '#DC2626',
                  fontSize: '13px', fontWeight: '700', marginBottom: '16px' }}>
                  ❌ {error}
                </div>
              )}

              <button onClick={handleVerifyOtp} disabled={loading} style={{
                ...btn(`linear-gradient(135deg,${P.teal},${P.blue})`),
                width: '100%', justifyContent: 'center',
                padding: '16px', fontSize: '16px', borderRadius: '12px',
                opacity: loading ? 0.7 : 1, marginBottom: '12px',
              }}>
                {loading ? '⏳ Verifying…' : '✅ Verify OTP'}
              </button>

              <button onClick={handleResend} style={{
                ...btn('#EEE', P.gray, true),
                width: '100%', justifyContent: 'center', borderRadius: '10px',
              }}>
                🔄 Resend OTP
              </button>
            </>
          )}
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
