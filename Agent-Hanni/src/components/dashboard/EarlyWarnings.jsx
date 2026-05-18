export default function EarlyWarnings({ alerts, recommendations }) {
  const warnings = [
    {
      icon: '🔴', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',
      label: 'Vải chưa nhận tại kho',
      count: alerts.filter(a => a.issue?.includes('chưa về xưởng') || a.issue?.includes('not received')).length,
      sub: 'trong vòng 30 ngày trước xuất hàng'
    },
    {
      icon: '🟠', color: '#f97316', bg: 'rgba(249,115,22,0.1)',
      label: 'MER chưa được release sản xuất',
      count: alerts.filter(a => a.issue?.includes('QA') || a.issue?.includes('not released')).length,
      sub: 'sản xuất trong 14 ngày'
    },
    {
      icon: '🟡', color: '#eab308', bg: 'rgba(234,179,8,0.1)',
      label: 'Chưa có trong kế hoạch sản xuất',
      count: alerts.filter(a => a.issue?.includes('Master Plan') || a.issue?.includes('production')).length,
      sub: 'chưa lên lịch'
    },
    {
      icon: '🔵', color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',
      label: 'Không đồng bộ vải giữa bộ phận',
      count: alerts.filter(a => a.issue?.includes('tracking') || a.issue?.includes('Tracking')).length,
      sub: 'giữa các bộ phận'
    },
  ]

  return (
    <div style={S.card}>
      <div style={S.title}>⚡ Cảnh báo sớm</div>

      <div style={S.list}>
        {warnings.map((w, i) => (
          <div key={i} style={{ ...S.item, background: w.bg, borderLeft: `3px solid ${w.color}` }}>
            <div style={S.itemRow}>
              <span style={S.itemLabel}>{w.icon} {w.label}</span>
              <span style={{ ...S.itemCount, color: w.color }}>{w.count}</span>
            </div>
            <div style={S.itemSub}>{w.sub}</div>
          </div>
        ))}
      </div>

      {recommendations.length > 0 && (
        <div style={S.recoWrap}>
          <div style={S.recoTitle}>⚡ Hành động ưu tiên</div>
          {recommendations.map((r, i) => (
            <div key={i} style={S.recoItem}>
              <span style={S.recoNum}>{i + 1}</span>
              <span style={S.recoText}>{r}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const S = {
  card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' },
  title: { fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14 },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  item: { borderRadius: 8, padding: '10px 12px' },
  itemRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemLabel: { fontSize: 12, fontWeight: 600, color: 'var(--text)' },
  itemCount: { fontSize: 20, fontWeight: 700 },
  itemSub: { fontSize: 11, color: 'var(--text3)', marginTop: 2 },
  recoWrap: { marginTop: 16 },
  recoTitle: { fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 },
  recoItem: { display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  recoNum: { background: 'var(--accent)', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 2 },
  recoText: { fontSize: 12, color: 'var(--text2)' },
}