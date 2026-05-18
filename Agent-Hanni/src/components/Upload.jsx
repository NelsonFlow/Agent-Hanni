import { useState, useRef } from 'react'

export default function Upload({ onAnalyze, isLoading, compact }) {
  const [files, setFiles] = useState([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const addFiles = (newFiles) => {
    const excel = Array.from(newFiles).filter(f => f.name.match(/\.(xlsx|xlsb|xls)$/i))
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

  const handleAnalyze = () => {
    onAnalyze(files)
    setFiles([])
  }

  if (compact) {
    return (
      <div style={S.compactWrap}>
        <div
          style={{ ...S.compactDrop, borderColor: dragging ? 'var(--accent)' : 'var(--border2)', background: dragging ? 'rgba(59,130,246,0.06)' : 'transparent' }}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current.click()}
        >
          <span style={S.compactIcon}>📁</span>
          <span style={S.compactText}>
            {files.length > 0 ? `${files.length} file đã chọn` : 'Kéo & thả file Excel vào đây'}
          </span>
          {files.length > 0 && (
            <button
              style={S.compactBtn}
              disabled={isLoading}
              onClick={e => { e.stopPropagation(); handleAnalyze() }}
            >
              {isLoading ? '⏳ Đang phân tích...' : '🔍 Phân tích'}
            </button>
          )}
          <input ref={inputRef} type="file" multiple accept=".xlsx,.xlsb,.xls" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
        </div>
        {files.length > 0 && (
          <div style={S.fileTagsWrap}>
            {files.map(f => (
              <div key={f.name} style={S.fileTag}>
                <span style={S.fileTagName}>{f.name}</span>
                <button style={S.fileTagRemove} onClick={() => removeFile(f.name)}>✕</button>
              </div>
            ))}
          </div>
        )}
        {isLoading && <div style={S.loadingBar}><div style={S.loadingFill} /></div>}
        <style>{`@keyframes slide{from{width:0}to{width:90%}}`}</style>
      </div>
    )
  }

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <h1 style={S.title}>🏭 Trung tâm kiểm soát chuỗi cung ứng thời trang</h1>
        <p style={S.sub}>Tải lên các báo cáo Excel từ các bộ phận để bắt đầu phân tích</p>
      </div>
      <div
        style={{ ...S.dropzone, borderColor: dragging ? 'var(--accent)' : 'var(--border2)', background: dragging ? 'rgba(59,130,246,0.06)' : 'var(--bg2)' }}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current.click()}
      >
        <div style={S.dropIcon}>{dragging ? '📂' : '📁'}</div>
        <div style={S.dropText}>{dragging ? 'Thả file vào đây...' : 'Kéo & thả các file Excel vào đây'}</div>
        <div style={S.dropSub}>hoặc nhấn để chọn file (.xlsx, .xlsb, .xls)</div>
        <input ref={inputRef} type="file" multiple accept=".xlsx,.xlsb,.xls" style={{ display: 'none' }} onChange={e => addFiles(e.target.files)} />
      </div>
      {files.length > 0 && (
        <div style={S.fileList}>
          <div style={S.fileListHeader}>
            <span style={S.fileCount}>{files.length} file đã chọn</span>
            <button style={S.clearBtn} onClick={() => setFiles([])}>Xóa tất cả</button>
          </div>
          {files.map(f => (
            <div key={f.name} style={S.fileItem}>
              <div style={S.fileInfo}>
                <div style={S.fileName}>{f.name}</div>
                <div style={S.fileSize}>{(f.size / 1024).toFixed(0)} KB</div>
              </div>
              <button style={S.removeBtn} onClick={() => removeFile(f.name)}>✕</button>
            </div>
          ))}
        </div>
      )}
      <button
        style={{ ...S.analyzeBtn, opacity: files.length === 0 || isLoading ? 0.5 : 1, cursor: files.length === 0 || isLoading ? 'not-allowed' : 'pointer' }}
        disabled={files.length === 0 || isLoading}
        onClick={handleAnalyze}
      >
        {isLoading ? '⏳ Đang phân tích... Vui lòng chờ' : `🔍 Phân tích ${files.length > 0 ? `${files.length} file` : ''}`}
      </button>
      {isLoading && <div style={S.loadingBar}><div style={S.loadingFill} /></div>}
      <style>{`@keyframes slide{from{width:0}to{width:90%}}`}</style>
    </div>
  )
}

const S = {
  wrap: { maxWidth: 680, margin: '0 auto', padding: '40px 0' },
  header: { marginBottom: 32, textAlign: 'center' },
  title: { fontSize: 24, fontWeight: 700, marginBottom: 8 },
  sub: { color: 'var(--text2)', fontSize: 14 },
  dropzone: { border: '2px dashed', borderRadius: 12, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 20 },
  dropIcon: { fontSize: 36, marginBottom: 10 },
  dropText: { fontSize: 15, fontWeight: 500, marginBottom: 6 },
  dropSub: { fontSize: 12, color: 'var(--text3)' },
  fileList: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 },
  fileListHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderBottom: '1px solid var(--border)' },
  fileCount: { fontSize: 12, fontWeight: 600, color: 'var(--text2)' },
  clearBtn: { background: 'none', border: 'none', color: 'var(--red)', fontSize: 12, cursor: 'pointer' },
  fileItem: { display: 'flex', alignItems: 'center', padding: '9px 14px', borderBottom: '1px solid var(--border)' },
  fileInfo: { flex: 1 },
  fileName: { fontSize: 12, fontWeight: 500, fontFamily: 'var(--mono)' },
  fileSize: { fontSize: 11, color: 'var(--text3)', marginTop: 2 },
  removeBtn: { background: 'none', border: 'none', color: 'var(--text3)', fontSize: 13, cursor: 'pointer' },
  analyzeBtn: { width: '100%', padding: '15px', background: 'var(--accent)', border: 'none', borderRadius: 10, color: 'white', fontSize: 15, fontWeight: 700, transition: 'opacity 0.2s', marginBottom: 12 },
  loadingBar: { height: 3, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' },
  loadingFill: { height: '100%', background: 'var(--accent)', animation: 'slide 8s ease forwards' },
  compactWrap: { marginBottom: 8 },
  compactDrop: { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', border: '1px dashed', borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s', flexWrap: 'wrap' },
  compactIcon: { fontSize: 18 },
  compactText: { fontSize: 13, color: 'var(--text2)', flex: 1 },
  compactBtn: { padding: '6px 14px', background: 'var(--accent)', border: 'none', borderRadius: 6, color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer' },
  fileTagsWrap: { display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  fileTag: { display: 'flex', alignItems: 'center', gap: 6, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px' },
  fileTagName: { fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--text2)' },
  fileTagRemove: { background: 'none', border: 'none', color: 'var(--text3)', fontSize: 11, cursor: 'pointer' },
}