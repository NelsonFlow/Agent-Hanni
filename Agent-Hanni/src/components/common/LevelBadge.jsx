export const LEVEL_CONFIG = {
  CRITICAL: { label: '🔴 Khẩn cấp', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', order: 0 },
  RISK:     { label: '🟠 Rủi ro',   bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', color: '#f97316', order: 1 },
  WATCH:    { label: '🟡 Cảnh báo', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.3)',  color: '#eab308', order: 2 },
  OK:       { label: '🟢 Ổn định',  bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  color: '#22c55e', order: 3 },
}

export default function LevelBadge({ level }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.WATCH
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10, color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  )
}