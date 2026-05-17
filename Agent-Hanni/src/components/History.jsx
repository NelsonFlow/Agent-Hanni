export default function History({ history, onLoad }) {
  if (history.length === 0) return null

  return (
    <div style={styles.wrap}>
      <div style={styles.title}>🕐 Lịch sử phân tích</div>
      <div style={styles.list}>
        {history.map((item, i) => (
          <div key={i} style={styles.item} onClick={() => onLoad(item)}>
            <div style={styles.itemLeft}>
              <div style={styles.itemDate}>{item.date}</div>
              <div style={styles.itemMeta}>{item.fileCount} file · {item.data.summary?.totalOrders ?? 0} đơn hàng</div>
            </div>
            <div style={styles.itemRight}>
              {item.data.summary?.critical > 0 && (
                <span style={{ ...styles.badge, background: 'var(--red-bg)', color: 'var(--red)' }}>
                  {item.data.summary.critical} khẩn cấp
                </span>
              )}
              {item.data.summary?.risk > 0 && (
                <span style={{ ...styles.badge, background: 'var(--orange-bg)', color: 'var(--orange)' }}>
                  {item.data.summary.risk} rủi ro
                </span>
              )}
              <span style={styles.arrow}>→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  wrap: { maxWidth: 680, margin: '0 auto 40px', padding: '0 20px' },
  title: { fontSize: 13, fontWeight: 600, color: 'var(--text3)', marginBottom: 10, letterSpacing: '0.05em' },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  item: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 8, padding: '12px 16px', cursor: 'pointer', transition: 'border-color 0.2s'
  },
  itemLeft: {},
  itemDate: { fontSize: 14, fontWeight: 500 },
  itemMeta: { fontSize: 12, color: 'var(--text3)', marginTop: 2 },
  itemRight: { display: 'flex', alignItems: 'center', gap: 8 },
  badge: { fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 10 },
  arrow: { color: 'var(--text3)', fontSize: 16 }
}
