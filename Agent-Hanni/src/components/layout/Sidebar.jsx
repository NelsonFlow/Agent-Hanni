import { useState } from 'react'
import Upload from '../Upload.jsx'

export default function Sidebar({ onAnalyze, isLoading, error, history, activeTab, setActiveTab, report, reportDate, onLoadHistory }) {
  const [open, setOpen] = useState(false)

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Bảng điều khiển' },
    { id: 'fabric',    icon: '🧵', label: 'Tình trạng vải' },
    { id: 'alerts',    icon: '🚨', label: `Cảnh báo (${report?.alerts?.length || 0})` },
    { id: 'depts',     icon: '🏢', label: 'Bộ phận' },
  ]

  const handleNav = (id) => {
    setActiveTab(id)
    setOpen(false)
  }

  return (
    <>
      {/* Bouton hamburger mobile */}
      <button className="hamburger-btn" onClick={() => setOpen(!open)}>
        {open ? '✕' : '☰'}
      </button>

      {/* Overlay mobile */}
      {open && <div style={S.overlay} onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <div style={{ ...S.sidebar, ...(open ? S.sidebarOpen : {}) }}>

        <div style={S.section}>
          <div style={S.sectionTitle}>📤 Phân tích mới</div>
          <Upload onAnalyze={onAnalyze} isLoading={isLoading} compact={true} />
          {error && <div style={S.error}>❌ {error}</div>}
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>Điều hướng</div>
          {navItems.map(item => (
            <button
              key={item.id}
              style={{ ...S.navBtn, ...(activeTab === item.id ? S.navBtnActive : {}) }}
              onClick={() => handleNav(item.id)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>🕐 Lịch sử</div>
          {history.length === 0
            ? <div style={S.empty}>Chưa có phân tích</div>
            : history.map((h, i) => (
              <button
                key={i}
                style={{ ...S.histBtn, ...(reportDate === h.date && report ? S.histBtnActive : {}) }}
                onClick={() => { onLoadHistory(h); setOpen(false) }}
              >
                <div style={S.histDate}>{h.date}</div>
                <div style={S.histMeta}>{h.fileCount} file</div>
                {h.data?.summary?.critical > 0 && (
                  <span style={S.histCritical}>🔴 {h.data.summary.critical} khẩn cấp</span>
                )}
              </button>
            ))
          }
        </div>

        <div style={S.footer}>
          <div style={S.statusRow}>
            <div style={S.statusDot} />
            <span>Hệ thống hoạt động</span>
          </div>
        </div>

      </div>
    </>
  )
}

const S = {
  hamburger: {
    display: 'none',
    position: 'fixed',
    top: 12,
    left: 12,
    zIndex: 200,
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text)',
    fontSize: 18,
    width: 38,
    height: 38,
    cursor: 'pointer',
    '@media (max-width: 768px)': { display: 'flex' }
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 150,
  },
  sidebar: {
    width: 240,
    flexShrink: 0,
    background: 'var(--bg2)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 12px',
    gap: 4,
    position: 'sticky',
    top: 45,
    height: 'calc(100vh - 45px)',
    overflowY: 'auto',
    transition: 'transform 0.25s ease',
  },
  sidebarOpen: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100vh',
    zIndex: 160,
    transform: 'translateX(0)',
  },
  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 10, fontWeight: 700, color: 'var(--text3)',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    marginBottom: 8, padding: '0 4px'
  },
  navBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    width: '100%', padding: '8px 10px',
    background: 'none', border: 'none', borderRadius: 8,
    color: 'var(--text2)', fontSize: 13, cursor: 'pointer',
    textAlign: 'left', transition: 'all 0.15s'
  },
  navBtnActive: {
    background: 'rgba(59,130,246,0.15)',
    color: 'var(--accent2)', fontWeight: 600
  },
  histBtn: {
    display: 'flex', flexDirection: 'column',
    width: '100%', padding: '8px 10px',
    background: 'none', border: 'none', borderRadius: 8,
    cursor: 'pointer', textAlign: 'left',
    marginBottom: 2, transition: 'all 0.15s'
  },
  histBtnActive: { background: 'rgba(255,255,255,0.05)' },
  histDate: { fontSize: 11, fontWeight: 600, color: 'var(--text2)' },
  histMeta: { fontSize: 10, color: 'var(--text3)', marginTop: 2 },
  histCritical: { fontSize: 10, color: 'var(--red)', marginTop: 2 },
  empty: { fontSize: 12, color: 'var(--text3)', padding: '4px 10px' },
  footer: { marginTop: 'auto', padding: '12px 4px', borderTop: '1px solid var(--border)' },
  statusRow: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text3)' },
  statusDot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' },
  error: {
    padding: '8px 10px', marginTop: 8,
    background: 'var(--red-bg)', border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 6, fontSize: 12, color: 'var(--red)'
  }
}