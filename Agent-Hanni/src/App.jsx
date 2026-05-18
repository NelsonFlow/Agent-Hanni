import { useState, useEffect } from 'react'
import Login from './components/Login.jsx'
import Upload from './components/Upload.jsx'
import Report from './components/Report.jsx'
import History from './components/History.jsx'
import { analyzeWithAI } from './utils/openaiAgent.js'

const STORAGE_KEY = 'hanni_history'
const API_KEY = import.meta.env.VITE_OPENAI_KEY

export default function App() {
  const [screen, setScreen] = useState('login')
  const [isLoading, setIsLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [reportDate, setReportDate] = useState('')
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { setHistory(JSON.parse(saved)) } catch {}
    }
  }, [])

  const saveToHistory = (date, fileCount, data) => {
    const entry = { date, fileCount, data, id: Date.now() }
    const updated = [entry, ...history].slice(0, 10)
    setHistory(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const handleAnalyze = async (files) => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await analyzeWithAI(files, API_KEY)
      const date = new Date().toLocaleDateString('vi-VN', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
      saveToHistory(date, files.length, result)
      setReport(result)
      setReportDate(date)
      setScreen('report')
    } catch (err) {
      console.error(err)
      setError(err.message || 'Đã xảy ra lỗi. Vui lòng thử lại.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoadHistory = (item) => {
    setReport(item.data)
    setReportDate(item.date)
    setScreen('report')
  }

  if (screen === 'login') {
    return <Login onLogin={() => setScreen('home')} />
  }

  if (screen === 'report' && report) {
    return (
      <div style={styles.app}>
        <TopBar onHome={() => setScreen('home')} />
        <Report data={report} date={reportDate} onReset={() => setScreen('home')} />
      </div>
    )
  }

  return (
    <div style={styles.app}>
      <TopBar onHome={() => setScreen('home')} />
      <Upload onAnalyze={handleAnalyze} isLoading={isLoading} />
      {error && <div style={styles.error}>❌ {error}</div>}
      <History history={history} onLoad={handleLoadHistory} />
    </div>
  )
}

function TopBar({ onHome }) {
  return (
    <div style={styles.topbar}>
      <div style={styles.topbarInner}>
        <div style={styles.brand} onClick={onHome}>
          <span>🏭</span>
          <span style={styles.brandName}>Agent Hanni</span>
          <span style={styles.brandSub}>Supply Chain</span>
        </div>
        <div style={styles.topbarRight}>
          <div style={styles.dot} />
          <span style={styles.liveText}>Live</span>
        </div>
      </div>
    </div>
  )
}

const styles = {
  app: { minHeight: '100vh' },
  topbar: {
    borderBottom: '1px solid var(--border)',
    background: 'rgba(10,14,26,0.8)',
    backdropFilter: 'blur(10px)',
    position: 'sticky', top: 0, zIndex: 100
  },
  topbarInner: {
    maxWidth: 900, margin: '0 auto', padding: '12px 20px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' },
  brandName: { fontWeight: 700, fontSize: 15 },
  brandSub: { fontSize: 12, color: 'var(--text3)', padding: '2px 8px', background: 'var(--bg3)', borderRadius: 10 },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--green)', animation: 'pulse 2s infinite' },
  liveText: { fontSize: 12, color: 'var(--text3)' },
  error: {
    maxWidth: 680, margin: '0 auto 20px', padding: '14px 20px',
    background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8, fontSize: 14, color: 'var(--red)'
  }
}