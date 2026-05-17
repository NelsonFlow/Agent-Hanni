import { useState, useRef } from 'react'

export default function Upload({ onAnalyze, isLoading }) {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const addFiles = (newFiles) => {
    const excel = Array.from(newFiles).filter(f =>
      f.name.match(/\.(xlsx|xlsb|xls)$/i)
    )
    setFiles(prev => {
      const existing = new Set(prev.map(f => f.name))
      const fresh = excel.filter(f => !existing.has(f.name))
      return [...prev, ...fresh]
    })
  }

  const removeFile = (name) => setFiles(prev => prev.filter(f => f.name !== name))

  const onDrop = (e) => {
    e.preventDefault(); setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const deptColor = (name) => {
    const n = name.toLowerCase()
    if (n.includes('fabric')) return '#3b82f6'
    if (n.includes('merch')) return '#8b5cf6'
    if (n.includes('delivery') || n.includes('inspect')) return '#06b6d4'
    if (n.includes('master') || n.includes('plan')) return '#f59e0b'
    if (n.includes('shipment') || n.includes('track')) return '#10b981'
    if (n.includes('daily')) return '#f97316'
    return '#6b7280'
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Phân tích chuỗi cung ứng</h1>
        <p style={styles.sub}>Tải lên các báo cáo Excel từ các bộ phận để bắt đầu phân tích</p>
      </div>

      {/* Drop zone */}
      <div
        style={{
          ...styles.dropzone,
          borderColor: dragging ? 'var(--accent)' : 'var(--border2)',
          background: dragging ? 'rgba(59,130,246,0.06)' : 'var(--bg2)'
        }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
      >
        <div style={styles.dropIcon}>{dragging ? '📂' : '📁'}</div>
        <div style={styles.dropText}>
          {dragging ? 'Thả file vào đây...' : 'Kéo & thả các file Excel vào đây'}
        </div>
        <div style={styles.dropSub}>hoặc nhấn để chọn file (.xlsx, .xlsb, .xls)</div>
        <input
          ref={inputRef} type="file" multiple accept=".xlsx,.xlsb,.xls"
          style={{ display: 'none' }}
          onChange={e => addFiles(e.target.files)}
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div style={styles.fileList}>
          <div style={styles.fileListHeader}>
            <span style={styles.fileCount}>{files.length} file đã chọn</span>
            <button style={styles.clearBtn} onClick={() => setFiles([])}>Xóa tất cả</button>
          </div>
          {files.map(f => (
            <div key={f.name} style={styles.fileItem}>
              <div style={{ ...styles.fileDot, background: deptColor(f.name) }} />
              <div style={styles.fileInfo}>
                <div style={styles.fileName}>{f.name}</div>
                <div style={styles.fileSize}>{(f.size / 1024).toFixed(0)} KB</div>
              </div>
              <button style={styles.removeBtn} onClick={() => removeFile(f.name)}>✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Analyze button */}
      <button
        style={{
          ...styles.analyzeBtn,
          opacity: files.length === 0 || isLoading ? 0.5 : 1,
          cursor: files.length === 0 || isLoading ? 'not-allowed' : 'pointer'
        }}
        disabled={files.length === 0 || isLoading}
        onClick={() => onAnalyze(files)}
      >
        {isLoading ? (
          <span>⏳ Đang phân tích... Vui lòng chờ</span>
        ) : (
          <span>🔍 Phân tích {files.length > 0 ? `${files.length} file` : ''}</span>
        )}
      </button>

      {isLoading && (
        <div style={styles.loadingBar}>
          <div style={styles.loadingFill} />
        </div>
      )}

      <style>{`
        @keyframes slide { from{width:0} to{width:85%} }
      `}</style>
    </div>
  )
}

const styles = {
  wrap: { maxWidth: 680, margin: '0 auto', padding: '40px 20px' },
  header: { marginBottom: 32, textAlign: 'center' },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 8 },
  sub: { color: 'var(--text2)', fontSize: 15 },
  dropzone: {
    border: '2px dashed', borderRadius: 12, padding: '40px 20px',
    textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 20
  },
  dropIcon: { fontSize: 40, marginBottom: 12 },
  dropText: { fontSize: 16, fontWeight: 500, marginBottom: 6 },
  dropSub: { fontSize: 13, color: 'var(--text3)' },
  fileList: {
    background: 'var(--bg2)', border: '1px solid var(--border)',
    borderRadius: 12, overflow: 'hidden', marginBottom: 20
  },
  fileListHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 16px', borderBottom: '1px solid var(--border)'
  },
  fileCount: { fontSize: 13, fontWeight: 600, color: 'var(--text2)' },
  clearBtn: {
    background: 'none', border: 'none', color: 'var(--red)',
    fontSize: 12, padding: '4px 8px', borderRadius: 4
  },
  fileItem: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '10px 16px', borderBottom: '1px solid var(--border)'
  },
  fileDot: { width: 8, height: 8, borderRadius: '50%', flexShrink: 0 },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 13, fontWeight: 500, fontFamily: 'var(--mono)' },
  fileSize: { fontSize: 11, color: 'var(--text3)', marginTop: 2 },
  removeBtn: {
    background: 'none', border: 'none', color: 'var(--text3)',
    fontSize: 14, padding: '4px 6px', borderRadius: 4
  },
  analyzeBtn: {
    width: '100%', padding: '16px', background: 'var(--accent)',
    border: 'none', borderRadius: 10, color: 'white',
    fontSize: 16, fontWeight: 700, transition: 'opacity 0.2s', marginBottom: 12
  },
  loadingBar: {
    height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden'
  },
  loadingFill: {
    height: '100%', background: 'var(--accent)',
    animation: 'slide 8s ease forwards'
  }
}
