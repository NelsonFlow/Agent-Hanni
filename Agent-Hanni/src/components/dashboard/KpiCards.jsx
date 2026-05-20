import { LEVEL_CONFIG } from '../common/LevelBadge.jsx'

export default function KpiCards({ summary, setActiveTab, levelFilter, setLevelFilter }) {
  const cards = [
    { key: 'CRITICAL', label: 'Khẩn cấp', val: summary.critical || 0, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    { key: 'RISK',     label: 'Rủi ro',    val: summary.risk || 0,     color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { key: 'WATCH',    label: 'Cảnh báo',  val: summary.watch || 0,    color: '#eab308', bg: 'rgba(234,179,8,0.1)' },
    { key: 'OK',       label: 'Ổn định',   val: summary.onTrack || 0,  color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  ]

  return (
    <div style={S.row}>
      {cards.map(k => (
        <div
          key={k.key}
          style={{ ...S.card, background: k.bg, outline: levelFilter === k.key ? `2px solid ${k.color}` : 'none' }}
          onClick={() => setLevelFilter(levelFilter === k.key ? 'ALL' : k.key)}
        >
          <div style={{ ...S.num, color: k.color }}>{k.val}</div>
          <div style={S.label}>{k.label}</div>
          <div style={S.sub}>Đơn hàng</div>
        </div>
      ))}
    </div>
  )
}

const S = {
  row: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 },
  card: { borderRadius: 12, padding: '18px 16px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', transition: 'outline 0.15s' },
  num: { fontSize: 34, fontWeight: 800, lineHeight: 1 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text)', marginTop: 6 },
  sub: { fontSize: 11, color: 'var(--text3)', marginTop: 2 },
}