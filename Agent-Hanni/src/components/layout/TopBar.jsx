export default function TopBar() {
  return (
    <div style={S.topbar}>
      <div style={S.inner}>
        <div style={S.brand}>
          <span>🏭</span>
          <span style={S.brandName}>Agent Hanni</span>
          <span style={S.brandSub}>Trung tâm kiểm soát chuỗi cung ứng</span>
        </div>
        <div style={S.right}>
          <div style={S.dot} />
          <span style={S.live}>Trực tiếp</span>
        </div>
      </div>
    </div>
  )
}

const S = {
  topbar: {
    borderBottom: '1px solid var(--border)',
    background: 'rgba(10,14,26,0.95)',
    backdropFilter: 'blur(10px)',
    position: 'sticky', top: 0, zIndex: 100
  },
  inner: {
    padding: '11px 24px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10 },
  brandName: { fontWeight: 700, fontSize: 15, color: 'var(--text)' },
  brandSub: { fontSize: 12, color: 'var(--text3)', padding: '2px 8px', background: 'var(--bg3)', borderRadius: 10 },
  right: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' },
  live: { fontSize: 12, color: 'var(--text3)' }
}