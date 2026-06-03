import { useState, useEffect } from 'react'
import Login from './components/Login.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import TopBar from './components/layout/TopBar.jsx'
import Report from './components/Report.jsx'
import { analyzeWithAI } from './utils/openaiAgent.js'

const STORAGE_KEY = 'hanni_history'
const API_KEY = import.meta.env.VITE_OPENAI_KEY

const EMPTY_REPORT = {
  summary: { totalOrders: 0, critical: 0, risk: 0, watch: 0, onTrack: 0, depsReceived: 0 },
  alerts: [], departmentStatus: [], recommendations: [], globalSummary: ''
}

export default function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('hanni_auth') === 'true')
  const [isLoading, setIsLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [reportDate, setReportDate] = useState('')
  const [error, setError] = useState(null)
  const [history, setHistory] = useState([])
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setHistory(parsed)
        if (parsed.length > 0) {
          setReport(parsed[0].data)
          setReportDate(parsed[0].date)
        }
      } catch {}
    }
  }, [])

  const saveToHistory = (date, fileCount, data) => {
    const entry = { date, fileCount, data, id: Date.now() }
    const updated = [entry, ...history].slice(0, 10)
    setHistory(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  const handleLogin = () => {
    localStorage.setItem('hanni_auth', 'true')
    setLoggedIn(true)
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
      setActiveTab('dashboard')
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
    setActiveTab('dashboard')
  }

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  if (!loggedIn) return <Login onLogin={handleLogin} />

  return (
    <div style={S.app}>
      <TopBar />

      {/* Bouton hamburger mobile */}
      <button
        className="hamburger-btn"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          style={S.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="main-layout" style={S.layout}>
        <div className={`sidebar-wrap${sidebarOpen ? ' open' : ''}`}>
          <Sidebar
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            error={error}
            history={history}
            activeTab={activeTab}
            setActiveTab={(tab) => { setActiveTab(tab); setSidebarOpen(false) }}
            report={report}
            reportDate={reportDate}
            onLoadHistory={(item) => { handleLoadHistory(item); setSidebarOpen(false) }}
          />
        </div>
        <div className="main-content" style={S.main}>
          <Report
            data={report || EMPTY_REPORT}
            date={reportDate || today}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isEmpty={!report}
          />
        </div>
      </div>
    </div>
  )
}

const S = {
  app: { minHeight: '100vh', display: 'flex', flexDirection: 'column' },
  layout: { display: 'flex', flex: 1, minHeight: 'calc(100vh - 45px)' },
  main: { flex: 1, padding: '24px', overflowY: 'auto' },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 150
  }
}