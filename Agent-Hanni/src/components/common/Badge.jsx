const STATUS_BADGE = {
  'Received':     { color: '#22c55e', bg: 'rgba(34,197,94,0.15)',  label: 'Đã nhận' },
  'Not Received': { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  label: 'Chưa nhận' },
  'Released':     { color: '#22c55e', bg: 'rgba(34,197,94,0.15)',  label: 'Đã release' },
  'Not Released': { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  label: 'Chưa release' },
}

export default function Badge({ status }) {
  const cfg = STATUS_BADGE[status] || { color: '#8b9ab5', bg: 'rgba(139,154,181,0.15)', label: status || 'N/A' }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 10, color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  )
}