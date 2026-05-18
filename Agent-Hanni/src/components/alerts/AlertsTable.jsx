import { useState } from 'react'
import LevelBadge, { LEVEL_CONFIG } from '../common/LevelBadge.jsx'

export default function AlertsTable({ alerts }) {
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [deptFilter, setDeptFilter] = useState('ALL')

  const depts = ['ALL', ...new Set(alerts.map(a => a.department).filter(Boolean))]

  const filtered = alerts
    .filter(a => levelFilter === 'ALL' || a.level === levelFilter)
    .filter(a => deptFilter === 'ALL' || a.department === deptFilter)
    .sort((a, b) => (LEVEL_CONFIG[a.level]?.order ?? 9) - (LEVEL_CONFIG[b.level]?.order ?? 9))

  return (
    <div>
      {/* Filtres */}
      <div style={S.filterBar}>
        <div style={S.filterGroup}>
          <span style={S.filterLabel}>Mức độ:</span>
          {['ALL', 'CRITICAL', 'RISK', 'WATCH', 'OK'].map(l => (
            <button
              key={l}
              style={{ ...S.filterBtn, background: levelFilter === l ? 'var(--accent)' : 'var(--bg3)', color: levelFilter === l ? 'white' : 'var(--text2)' }}
              onClick={() => setLevelFilter(l)}
            >
              {l === 'ALL' ? 'Tất cả' : LEVEL_CONFIG[l]?.label || l}
            </button>
          ))}
        </div>
        <div style={S.filterGroup}>
          <span style={S.filterLabel}>Bộ phận:</span>
          {depts.map(d => (
            <button
              key={d}
              style={{ ...S.filterBtn, background: deptFilter === d ? 'var(--accent)' : 'var(--bg3)', color: deptFilter === d ? 'white' : 'var(--text2)' }}
              onClick={() => setDeptFilter(d)}
            >
              {d === 'ALL' ? 'Tất cả' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={S.card}>
        <div style={S.title}>🚨 Chi tiết cảnh báo ({filtered.length})</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                {['Mức độ', 'Khách hàng', 'Style', 'Màu', 'Ngày xuất', 'Còn lại', 'Vấn đề', 'Hành động'].map(h => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0
                ? <tr><td colSpan={8} style={{ ...S.td, textAlign: 'center', color: 'var(--text3)', padding: 32 }}>Không có cảnh báo phù hợp</td></tr>
                : filtered.map((a, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td style={S.td}><LevelBadge level={a.level} /></td>
                    <td style={{ ...S.td, fontWeight: 600, fontSize: 12 }}>{a.customer}</td>
                    <td style={{ ...S.td, fontFamily: 'var(--mono)', fontSize: 11 }}>{a.style}</td>
                    <td style={{ ...S.td, fontSize: 11 }}>{a.color}</td>
                    <td style={{ ...S.td, fontFamily: 'var(--mono)', fontSize: 11 }}>{a.shipDate}</td>
                    <td style={{ ...S.td, fontWeight: 700, color: a.daysToShip < 0 ? '#ef4444' : a.daysToShip < 14 ? '#f97316' : 'var(--text)' }}>
                      {a.daysToShip < 0 ? `Trễ ${Math.abs(a.daysToShip)}n` : `${a.daysToShip}n`}
                    </td>
                    <td style={{ ...S.td, fontSize: 11, color: 'var(--text2)', maxWidth: 220 }}>{a.issue}</td>
                    <td style={{ ...S.td, fontSize: 11, color: '#60a5fa', maxWidth: 180, fontStyle: 'italic' }}>{a.action}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const S = {
  card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px', marginBottom: 16 },
  title: { fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: { padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text3)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' },
  td: { padding: '9px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' },
  filterBar: { display: 'flex', flexDirection: 'column', gap: 8, padding: 14, background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 },
  filterGroup: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  filterLabel: { fontSize: 11, color: 'var(--text3)', minWidth: 65 },
  filterBtn: { padding: '4px 10px', border: 'none', borderRadius: 16, fontSize: 11, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' },
}