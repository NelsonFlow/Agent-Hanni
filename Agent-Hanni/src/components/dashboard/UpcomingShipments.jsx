export default function UpcomingShipments({ alerts }) {
  const upcoming = {}
  alerts.forEach(a => {
    if (!a.shipDate) return
    if (!upcoming[a.shipDate]) upcoming[a.shipDate] = {
      shipDate: a.shipDate, daysToShip: a.daysToShip,
      customers: new Set(), critical: 0, risk: 0, watch: 0, ok: 0, total: 0
    }
    upcoming[a.shipDate].customers.add(a.customer)
    upcoming[a.shipDate].total++
    if (a.level === 'CRITICAL') upcoming[a.shipDate].critical++
    else if (a.level === 'RISK') upcoming[a.shipDate].risk++
    else if (a.level === 'WATCH') upcoming[a.shipDate].watch++
    else upcoming[a.shipDate].ok++
  })

  const rows = Object.values(upcoming)
    .sort((a, b) => (a.daysToShip ?? 999) - (b.daysToShip ?? 999))
    .slice(0, 10)

  return (
    <div style={S.card}>
      <div style={S.title}>📅 Lô hàng sắp tới — 30 ngày</div>
      <table style={S.table}>
        <thead>
          <tr>
            {['Ngày xuất', 'Khách hàng', 'Tổng', '🔴', '🟠', '🟡', '🟢'].map(h => (
              <th key={h} style={S.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0
            ? <tr><td colSpan={7} style={{ ...S.td, textAlign: 'center', color: 'var(--text3)' }}>Không có dữ liệu</td></tr>
            : rows.map((r, i) => (
              <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                <td style={S.td}><span style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>{r.shipDate}</span></td>
                <td style={S.td}>{r.customers.size}</td>
                <td style={{ ...S.td, fontWeight: 700 }}>{r.total}</td>
                <td style={{ ...S.td, color: '#ef4444', fontWeight: 700 }}>{r.critical || '-'}</td>
                <td style={{ ...S.td, color: '#f97316', fontWeight: 700 }}>{r.risk || '-'}</td>
                <td style={{ ...S.td, color: '#eab308', fontWeight: 700 }}>{r.watch || '-'}</td>
                <td style={{ ...S.td, color: '#22c55e', fontWeight: 700 }}>{r.ok || '-'}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  )
}

const S = {
  card: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' },
  title: { fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 14 },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 12 },
  th: { padding: '8px 10px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text3)', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' },
  td: { padding: '9px 10px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' },
}