import { useState, useEffect, useRef } from 'react'
import { P } from '../constants.js'
import { btn, card, inp } from '../styles.js'
import { auth } from '../firebase.js'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'

export default function CustomerLogin({ onSuccess, onBack }) {
  const [step, setStep]         = useState('phone')
  const [phone, setPhone]       = useState('')
  const [otp, setOtp]           = useState('')
  const [confirm, setConfirm]   = useState(null)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const recaptchaRef            = useRef(null)
  const verifierRef             = useRef(null)

  /* Setup visible reCAPTCHA when component mounts */
  useEffect(() => {
    setupVerifier()
    return () => {
      if (verifierRef.current) {
        try { verifierRef.current.clear() } catch(e) {}
        verifierRef.current = null
      }
    }
  }, [])

  const setupVerifier = () => {
    try {
      if (verifierRef.current) {
        try { verifierRef.current.clear() } catch(e) {}
        verifierRef.current = null
      }
      verifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-box', {
        size: 'normal',
        callback: () => {
          // reCAPTCHA solved — user can now send OTP
        },
        'expired-callback': () => {
          setError('reCAPTCHA expired. Please tick the checkbox again.')
        }
      })
      verifierRef.current.render()
    } catch(e) {
      console.error('Recaptcha setup error:', e)
    }
  }

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '')
    if (digits.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.')
      return
    }
    if (!verifierRef.current) {
      setError('Please complete the reCAPTCHA checkbox first.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const fullNumber = '+91' + digits
      const result = await signInWithPhoneNumber(auth, fullNumber, verifierRef.current)
      setConfirm(result)
      setStep('otp')
    } catch (e) {
      console.error('OTP error:', e)
      // Show helpful message based on Firebase error code
      if (e.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Make sure it is a valid Indian mobile number.')
      } else if (e.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please wait a few minutes and try again.')
      } else if (e.code === 'auth/captcha-check-failed') {
        setError('reCAPTCHA failed. Please tick the checkbox again.')
        setupVerifier()
      } else if (e.code === 'auth/operation-not-allowed') {
        setError('Phone login is not enabled. Please enable Phone Auth in Firebase Console.')
      } else {
        setError('Failed to send OTP: ' + (e.message || 'Unknown error'))
      }
      // Reset recaptcha on error
      try { verifierRef.current.clear() } catch(e2) {}
      verifierRef.current = null
      setTimeout(() => setupVerifier(), 500)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP sent to your phone.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await confirm.confirm(otp)
      onSuccess({
        uid: result.user.uid,
        phone: result.user.phoneNumber,
        displayPhone: phone.replace(/\D/g, ''),
      })
    } catch (e) {
      console.error('Verify error:', e)
      if (e.code === 'auth/invalid-verification-code') {
        setError('Incorrect OTP. Please check and try again.')
      } else if (e.code === 'auth/code-expired') {
        setError('OTP expired. Please go back and request a new one.')
      } else {
        setError('Verification failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    setStep('phone')
    setOtp('')
    setConfirm(null)
    setError('')
    setTimeout(() => setupVerifier(), 300)
  }

  return (
    <div style={{ background: P.bg, minHeight: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: '24px',
      fontFamily: "'Trebuchet MS','Segoe UI',sans-serif" }}>

      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Header */}
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
              : `OTP sent to +91 ${phone} — check your SMS`}
          </p>
        </div>

        <div style={{ ...card({ border: `2px solid ${step==='phone'?P.teal:P.purple}` }) }}>

          {/* ── PHONE STEP ── */}
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
                  style={{ ...inp(P.teal), fontSize: '20px', fontWeight: '700',
                    letterSpacing: '3px', flex: 1 }}
                  autoFocus
                  maxLength={10}
                />
              </div>

              {/* reCAPTCHA renders here */}
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                <div id="recaptcha-box" ref={recaptchaRef} />
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

          {/* ── OTP STEP ── */}
          {step === 'otp' && (
            <>
              <div style={{ background: '#EFF6FF', borderRadius: '12px',
                padding: '12px 16px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '13px', color: P.blue, fontWeight: '700' }}>
                  📲 OTP sent to +91 {phone}
                </div>
              </div>

              <label style={{ display: 'block', fontWeight: '800', fontSize: '13px',
                color: P.gray, marginBottom: '8px' }}>🔑 Enter 6-digit OTP</label>
              <input
                type="number"
                placeholder="_ _ _ _ _ _"
                value={otp}
                onChange={e => setOtp(e.target.value.slice(0, 6))}
                onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
                style={{ ...inp(P.purple), fontSize: '28px', fontWeight: '900',
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
                ...btn(`linear-gradient(135deg,${P.purple},${P.blue})`),
                width: '100%', justifyContent: 'center',
                padding: '16px', fontSize: '16px', borderRadius: '12px',
                opacity: loading ? 0.7 : 1, marginBottom: '12px',
              }}>
                {loading ? '⏳ Verifying…' : '✅ Verify & Login'}
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
