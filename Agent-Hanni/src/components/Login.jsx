import { useState } from 'react'

export default function Login({ onLogin }) {
  const [pw, setPw] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (pw === 'KemHanni') {
      onLogin()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => setShake(false), 500)
      setPw('')
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.bg} />
      <div style={{ ...styles.card, animation: shake ? 'shake 0.4s ease' : 'none' }}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>🏭</span>
          <div>
            <div style={styles.logoTitle}>Agent Hanni</div>
            <div style={styles.logoSub}>Supply Chain Intelligence</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputWrap}>
            <input
              type="password"
              value={pw}
              onChange={e => { setPw(e.target.value); setError(false) }}
              placeholder="Nhập mật khẩu..."
              style={{ ...styles.input, borderColor: error ? 'var(--red)' : 'var(--border2)' }}
              autoFocus
            />
          </div>
          {error && <div style={styles.error}>❌ Mật khẩu không đúng</div>}
          <button type="submit" style={styles.btn}>
            Đăng nhập →
          </button>
        </form>
        <div style={styles.footer}>Nelson Flow · AI Automation</div>
      </div>
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-8px)}
          40%{transform:translateX(8px)}
          60%{transform:translateX(-6px)}
          80%{transform:translateX(6px)}
        }
        @keyframes fadeIn {
          from{opacity:0;transform:translateY(20px)}
          to{opacity:1;transform:translateY(0)}
        }
      `}</style>
    </div>
  )
}

const styles = {
  wrap: {
    minHeight: '100vh', display: 'flex', alignItems: 'center',
    justifyContent: 'center', position: 'relative', overflow: 'hidden'
  },
  bg: {
    position: 'fixed', inset: 0, zIndex: 0,
    background: 'radial-gradient(ellipse at 30% 50%, rgba(59,130,246,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(139,92,246,0.06) 0%, transparent 50%)'
  },
  card: {
    position: 'relative', zIndex: 1, width: 380,
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 16, padding: '40px 36px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
    animation: 'fadeIn 0.5s ease'
  },
  logo: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 32 },
  logoIcon: { fontSize: 36 },
  logoTitle: { fontSize: 20, fontWeight: 700, color: 'var(--text)' },
  logoSub: { fontSize: 12, color: 'var(--text3)', letterSpacing: '0.05em' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  inputWrap: {},
  input: {
    width: '100%', padding: '12px 16px', background: 'var(--bg3)',
    border: '1px solid', borderRadius: 8, color: 'var(--text)',
    fontSize: 15, outline: 'none', transition: 'border-color 0.2s'
  },
  error: { fontSize: 13, color: 'var(--red)', padding: '2px 0' },
  btn: {
    padding: '13px', background: 'var(--accent)', border: 'none',
    borderRadius: 8, color: 'white', fontSize: 15, fontWeight: 600,
    transition: 'opacity 0.2s', marginTop: 4
  },
  footer: { marginTop: 28, textAlign: 'center', fontSize: 12, color: 'var(--text3)' }
}
