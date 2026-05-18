import Badge from '../common/Badge.jsx'
import LevelBadge from '../common/LevelBadge.jsx'

export default function FabricTable({ alerts }) {
  const rows = alerts
    .filter(a => a.style && a.shipDate)
    .sort((a, b) => {
      const order = { CRITICAL: 0, RISK: 1, WATCH: 2, OK: 3 }
      return (order[a.level] ?? 9) - (order[b.level] ?? 9)
    })
    .slice(0, 25)

  return (
    <div style={S.card}>
      <div style={S.title}>🧵 Tình trạng vải — Rủi ro hàng đầu</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Style / Màu', 'Khách hàng', 'Ngày xuất', 'Còn lại', 'Trạng thái WH', 'Trạng thái MER', 'Mức độ', 'Vấn đề'].map(h => (
                <th key={h} style={S.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0
              ? <tr><td colSpan={8} style={{ ...S.td, textAlign: 'center', color: 'var(--text3)' }}>Không có dữ liệu</td></tr>
              : rows.map((a, i) => {
                const wh = a.issue?.includes('chưa về xưởng') || a.issue?.includes('not received') ? 'Not Received' : 'Received'
                const mer = a.issue?.includes('QA') || a.issue?.includes('chưa được release') ? 'Not Released' : 'Released'
                return (
                  <tr key={i} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                    <td style={S.td}>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 600 }}>{a.style}</div>
                      <div style={{ fontSize: 11, color: 'var(--text3)' }}>{a.color}</div>
                    </td>
                    <td style={{ ...S.td, fontSize: 12 }}>{a.customer}</td>
                    <td style={{ ...S.td, fontFamily: 'var(--mono)', fontSize: 11 }}>{a.shipDate}</td>
                    <td style={{ ...S.td, fontWeight: 700, color: a.daysToShip < 0 ? '#ef4444' : a.daysToShip < 14 ? '#f97316' : 'var(--text)' }}>
                      {a.daysToShip < 0 ? `Trễ ${Math.abs(a.daysToShip)}n` : `${a.daysToShip}n`}
                    </td>
                    <td style={S.td}><Badge status={wh} /></td>
                    <td style={S.td}><Badge status={mer} /></td>
                    <td style={S.td}><LevelBadge level={a.level} /></td>
                    <td style={{ ...S.td, fontSize: 11, color: 'var(--text2)', maxWidth: 200 }}>{a.issue}</td>
                  </tr>
                )
              })}
          </tbody>
        </table>
      </div>
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