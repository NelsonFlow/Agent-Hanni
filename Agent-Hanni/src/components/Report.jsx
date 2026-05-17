import { useState } from 'react'
import * as XLSX from 'xlsx'

const LEVEL_CONFIG = {
  CRITICAL: { label: '🔴 Khẩn cấp', bg: 'var(--red-bg)', border: 'rgba(239,68,68,0.3)', color: 'var(--red)', order: 0 },
  RISK:     { label: '🟠 Rủi ro',   bg: 'var(--orange-bg)', border: 'rgba(249,115,22,0.3)', color: 'var(--orange)', order: 1 },
  WATCH:    { label: '🟡 Theo dõi', bg: 'var(--yellow-bg)', border: 'rgba(234,179,8,0.3)', color: 'var(--yellow)', order: 2 },
  OK:       { label: '🟢 Ổn định',  bg: 'var(--green-bg)', border: 'rgba(34,197,94,0.3)', color: 'var(--green)', order: 3 },
}

export default function Report({ data, onReset, date }) {
  const [filter, setFilter] = useState('ALL')
  const [deptFilter, setDeptFilter] = useState('ALL')

  const { summary, alerts = [], departmentStatus = [], recommendations = [], globalSummary } = data

  const depts = ['ALL', ...new Set(alerts.map(a => a.department).filter(Boolean))]
  const levels = ['ALL', 'CRITICAL', 'RISK', 'WATCH', 'OK']

  const filtered = alerts
    .filter(a => filter === 'ALL' || a.level === filter)
    .filter(a => deptFilter === 'ALL' || a.department === deptFilter)
    .sort((a, b) => (LEVEL_CONFIG[a.level]?.order ?? 9) - (LEVEL_CONFIG[b.level]?.order ?? 9))

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new()
    // Summary sheet
    const summaryData = [
      ['BÁO CÁO CẢNH BÁO CHUỖI CUNG ỨNG', '', '', ''],
      ['Ngày:', date, '', ''],
      ['', '', '', ''],
      ['Tổng đơn hàng:', summary.totalOrders, '', ''],
      ['🔴 Khẩn cấp:', summary.critical, '', ''],
      ['🟠 Rủi ro:', summary.risk, '', ''],
      ['🟡 Theo dõi:', summary.watch, '', ''],
      ['🟢 Ổn định:', summary.onTrack, '', ''],
      ['', '', '', ''],
      ['Tóm tắt:', globalSummary, '', ''],
    ]
    const ws1 = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan')

    // Alerts sheet
    const alertRows = [
      ['Mức độ', 'Bộ phận', 'Khách hàng', 'Style', 'Màu', 'Ngày xuất', 'Còn lại (ngày)', 'Vấn đề', 'Hành động']
    ]
    alerts.forEach(a => {
      alertRows.push([
        LEVEL_CONFIG[a.level]?.label || a.level,
        a.department, a.customer, a.style, a.color,
        a.shipDate, a.daysToShip, a.issue, a.action
      ])
    })
    const ws2 = XLSX.utils.aoa_to_sheet(alertRows)
    ws2['!cols'] = [10,16,14,16,14,12,12,40,30].map(w => ({ wch: w }))
    XLSX.utils.book_append_sheet(wb, ws2, 'Chi tiết cảnh báo')

    XLSX.writeFile(wb, `BaoCao_${date.replace(/\//g,'-')}.xlsx`)
  }

  return (
    <div style={styles.wrap}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>📋 Báo cáo hôm nay</h1>
          <div style={styles.date}>{date}</div>
        </div>
        <div style={styles.headerBtns}>
          <button style={styles.downloadBtn} onClick={downloadExcel}>⬇ Tải xuống Excel</button>
          <button style={styles.resetBtn} onClick={onReset}>+ Phân tích mới</button>
        </div>
      </div>

      {/* Global summary */}
      {globalSummary && (
        <div style={styles.summaryBox}>
          <div style={styles.summaryLabel}>📝 Tóm tắt tổng quan</div>
          <div style={styles.summaryText}>{globalSummary}</div>
        </div>
      )}

      {/* Stats */}
      <div style={styles.stats}>
        {[
          { key: 'CRITICAL', label: '🔴 Khẩn cấp', val: summary.critical, color: 'var(--red)' },
          { key: 'RISK',     label: '🟠 Rủi ro',   val: summary.risk,     color: 'var(--orange)' },
          { key: 'WATCH',    label: '🟡 Theo dõi', val: summary.watch,    color: 'var(--yellow)' },
          { key: 'OK',       label: '🟢 Ổn định',  val: summary.onTrack,  color: 'var(--green)' },
        ].map(s => (
          <div
            key={s.key}
            style={{ ...styles.statCard, cursor: 'pointer', outline: filter === s.key ? `2px solid ${s.color}` : 'none' }}
            onClick={() => setFilter(filter === s.key ? 'ALL' : s.key)}
          >
            <div style={{ ...styles.statNum, color: s.color }}>{s.val ?? 0}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div style={styles.recoBox}>
          <div style={styles.recoTitle}>⚡ Hành động ưu tiên hôm nay</div>
          {recommendations.map((r, i) => (
            <div key={i} style={styles.recoItem}>
              <span style={styles.recoNum}>{i + 1}</span>
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}

      {/* Department status */}
      {departmentStatus.length > 0 && (
        <div style={styles.deptSection}>
          <div style={styles.sectionTitle}>🏢 Tình trạng theo bộ phận</div>
          <div style={styles.deptGrid}>
            {departmentStatus.map((d, i) => {
              const cfg = d.status === 'CRITICAL' ? LEVEL_CONFIG.CRITICAL : d.status === 'WARNING' ? LEVEL_CONFIG.RISK : LEVEL_CONFIG.OK
              return (
                <div key={i} style={{ ...styles.deptCard, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <div style={{ ...styles.deptName, color: cfg.color }}>{d.name}</div>
                  <div style={styles.deptSummary}>{d.summary}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Mức độ:</span>
          {levels.map(l => (
            <button
              key={l}
              style={{ ...styles.filterBtn, background: filter === l ? 'var(--accent)' : 'var(--bg3)', color: filter === l ? 'white' : 'var(--text2)' }}
              onClick={() => setFilter(l)}
            >
              {l === 'ALL' ? 'Tất cả' : LEVEL_CONFIG[l]?.label || l}
            </button>
          ))}
        </div>
        <div style={styles.filterGroup}>
          <span style={styles.filterLabel}>Bộ phận:</span>
          {depts.map(d => (
            <button
              key={d}
              style={{ ...styles.filterBtn, background: deptFilter === d ? 'var(--accent)' : 'var(--bg3)', color: deptFilter === d ? 'white' : 'var(--text2)' }}
              onClick={() => setDeptFilter(d)}
            >
              {d === 'ALL' ? 'Tất cả' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      <div style={styles.sectionTitle}>
        🚨 Chi tiết cảnh báo ({filtered.length})
      </div>
      <div style={styles.alertList}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>Không có cảnh báo nào phù hợp với bộ lọc</div>
        ) : (
          filtered.map((a, i) => {
            const cfg = LEVEL_CONFIG[a.level] || LEVEL_CONFIG.WATCH
            return (
              <div key={i} style={{ ...styles.alertCard, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                <div style={styles.alertTop}>
                  <span style={{ ...styles.alertBadge, color: cfg.color }}>{cfg.label}</span>
                  <span style={styles.alertDept}>{a.department}</span>
                  {a.daysToShip !== undefined && (
                    <span style={{ ...styles.alertDays, color: a.daysToShip < 14 ? 'var(--red)' : a.daysToShip < 28 ? 'var(--orange)' : 'var(--text2)' }}>
                      {a.daysToShip < 0 ? `Trễ ${Math.abs(a.daysToShip)} ngày` : `Còn ${a.daysToShip} ngày`}
                    </span>
                  )}
                </div>
                <div style={styles.alertMeta}>
                  {[a.customer, a.style, a.color, a.shipDate].filter(Boolean).map((v, j) => (
                    <span key={j} style={styles.alertTag}>{v}</span>
                  ))}
                </div>
                <div style={styles.alertIssue}>{a.issue}</div>
                {a.action && (
                  <div style={styles.alertAction}>
                    <span style={styles.actionLabel}>→ Hành động:</span> {a.action}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

const styles = {
  wrap: { maxWidth: 900, margin: '0 auto', padding: '32px 20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 24, fontWeight: 700 },
  date: { fontSize: 13, color: 'var(--text3)', marginTop: 4 },
  headerBtns: { display: 'flex', gap: 10 },
  downloadBtn: { padding: '9px 16px', background: 'var(--green-bg)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: 'var(--green)', fontSize: 13, fontWeight: 600 },
  resetBtn: { padding: '9px 16px', background: 'var(--bg3)', border: '1px solid var(--border2)', borderRadius: 8, color: 'var(--text2)', fontSize: 13 },
  summaryBox: { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '16px 20px', marginBottom: 24 },
  summaryLabel: { fontSize: 12, color: 'var(--accent2)', fontWeight: 600, marginBottom: 6, letterSpacing: '0.05em' },
  summaryText: { fontSize: 14, color: 'var(--text)', lineHeight: 1.7 },
  stats: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 },
  statCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px', textAlign: 'center', transition: 'outline 0.15s' },
  statNum: { fontSize: 32, fontWeight: 700, lineHeight: 1 },
  statLabel: { fontSize: 12, color: 'var(--text2)', marginTop: 6 },
  recoBox: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', marginBottom: 24 },
  recoTitle: { fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 12, letterSpacing: '0.02em' },
  recoItem: { display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8, fontSize: 14, color: 'var(--text2)' },
  recoNum: { background: 'var(--accent)', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 2 },
  deptSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text2)', marginBottom: 12, letterSpacing: '0.05em' },
  deptGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 },
  deptCard: { borderRadius: 8, padding: '12px 14px' },
  deptName: { fontSize: 13, fontWeight: 700, marginBottom: 4 },
  deptSummary: { fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 },
  filters: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20, padding: '14px', background: 'var(--bg2)', borderRadius: 10, border: '1px solid var(--border)' },
  filterGroup: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  filterLabel: { fontSize: 12, color: 'var(--text3)', minWidth: 70 },
  filterBtn: { padding: '5px 12px', border: 'none', borderRadius: 20, fontSize: 12, fontWeight: 500, transition: 'all 0.15s' },
  alertList: { display: 'flex', flexDirection: 'column', gap: 10 },
  alertCard: { borderRadius: 10, padding: '14px 16px' },
  alertTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  alertBadge: { fontSize: 12, fontWeight: 700 },
  alertDept: { fontSize: 11, color: 'var(--text3)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 10 },
  alertDays: { fontSize: 12, fontWeight: 600, marginLeft: 'auto' },
  alertMeta: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 },
  alertTag: { fontSize: 11, fontFamily: 'var(--mono)', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4, color: 'var(--text2)' },
  alertIssue: { fontSize: 13, color: 'var(--text)', lineHeight: 1.6, marginBottom: 6 },
  alertAction: { fontSize: 12, color: 'var(--text2)', fontStyle: 'italic' },
  actionLabel: { fontWeight: 600, fontStyle: 'normal', color: 'var(--accent2)' },
  empty: { textAlign: 'center', padding: 40, color: 'var(--text3)', fontSize: 14 }
}
