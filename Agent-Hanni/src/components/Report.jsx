import { useState } from 'react'
import * as XLSX from 'xlsx'

const LEVEL_CONFIG = {
  CRITICAL: { label: '🔴 Khẩn cấp', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', color: '#ef4444', order: 0 },
  RISK:     { label: '🟠 Rủi ro',   bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)', color: '#f97316', order: 1 },
  WATCH:    { label: '🟡 Cảnh báo', bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.3)',  color: '#eab308', order: 2 },
  OK:       { label: '🟢 Ổn định',  bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.3)',  color: '#22c55e', order: 3 },
}

const STATUS_BADGE = {
  'Received':     { color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   label: 'Đã nhận' },
  'Not Received': { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   label: 'Chưa nhận' },
  'Released':     { color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   label: 'Đã release' },
  'Not Released': { color: '#ef4444', bg: 'rgba(239,68,68,0.15)',   label: 'Chưa release' },
}

function Badge({ status }) {
  const cfg = STATUS_BADGE[status] || { color: '#8b9ab5', bg: 'rgba(139,154,181,0.15)', label: status || 'N/A' }
  return <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 10, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
}

function LevelBadge({ level }) {
  const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.WATCH
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 10, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
}

export default function Report({ data, onReset, date }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [levelFilter, setLevelFilter] = useState('ALL')
  const [deptFilter, setDeptFilter] = useState('ALL')
  const { summary = {}, alerts = [], departmentStatus = [], recommendations = [], globalSummary = '' } = data

  const upcoming = {}
  alerts.forEach(a => {
    if (!a.shipDate) return
    if (!upcoming[a.shipDate]) upcoming[a.shipDate] = { shipDate: a.shipDate, daysToShip: a.daysToShip, customers: new Set(), critical: 0, risk: 0, watch: 0, ok: 0, total: 0 }
    upcoming[a.shipDate].customers.add(a.customer)
    upcoming[a.shipDate].total++
    if (a.level === 'CRITICAL') upcoming[a.shipDate].critical++
    else if (a.level === 'RISK') upcoming[a.shipDate].risk++
    else if (a.level === 'WATCH') upcoming[a.shipDate].watch++
    else upcoming[a.shipDate].ok++
  })
  const upcomingRows = Object.values(upcoming).sort((a, b) => (a.daysToShip ?? 999) - (b.daysToShip ?? 999)).slice(0, 10)
  const fabricRows = alerts.filter(a => a.style && a.shipDate).sort((a, b) => (LEVEL_CONFIG[a.level]?.order ?? 9) - (LEVEL_CONFIG[b.level]?.order ?? 9)).slice(0, 25)
  const depts = ['ALL', ...new Set(alerts.map(a => a.department).filter(Boolean))]
  const filtered = alerts.filter(a => levelFilter === 'ALL' || a.level === levelFilter).filter(a => deptFilter === 'ALL' || a.department === deptFilter).sort((a, b) => (LEVEL_CONFIG[a.level]?.order ?? 9) - (LEVEL_CONFIG[b.level]?.order ?? 9))

  const downloadExcel = () => {
    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.aoa_to_sheet([['FASHION SUPPLY CHAIN CONTROL TOWER','','',''],['Ngày:',date,'',''],['','','',''],['🔴 Khẩn cấp:',summary.critical||0,'',''],['🟠 Rủi ro:',summary.risk||0,'',''],['🟡 Cảnh báo:',summary.watch||0,'',''],['🟢 Ổn định:',summary.onTrack||0,'',''],['','','',''],['Tóm tắt:',globalSummary,'','']])
    XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan')
    const alertRows = [['Mức độ','Bộ phận','Khách hàng','Style','Màu','Ngày xuất','Còn (ngày)','Vấn đề','Hành động']]
    alerts.forEach(a => alertRows.push([LEVEL_CONFIG[a.level]?.label||a.level,a.department,a.customer,a.style,a.color,a.shipDate,a.daysToShip,a.issue,a.action]))
    const ws2 = XLSX.utils.aoa_to_sheet(alertRows)
    ws2['!cols'] = [12,16,14,18,14,12,12,45,35].map(w=>({wch:w}))
    XLSX.utils.book_append_sheet(wb, ws2, 'Chi tiết cảnh báo')
    XLSX.writeFile(wb, `ControlTower_${date.replace(/\//g,'-')}.xlsx`)
  }

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <div>
          <div style={S.headerTitle}>🏭 Fashion Supply Chain Control Tower</div>
          <div style={S.headerDate}>{date} · Early Warning · Visibility · On Time Delivery</div>
        </div>
        <div style={S.headerBtns}>
          <button style={S.dlBtn} onClick={downloadExcel}>⬇ Excel</button>
          <button style={S.resetBtn} onClick={onReset}>+ Phân tích mới</button>
        </div>
      </div>

      {globalSummary && (
        <div style={S.summaryBox}>📋 {globalSummary}</div>
      )}

      <div style={S.kpiRow}>
        {[
          { key:'CRITICAL', label:'Critical',  val:summary.critical||0, color:'#ef4444', bg:'rgba(239,68,68,0.1)',  icon:'🔴' },
          { key:'RISK',     label:'Risk',      val:summary.risk||0,     color:'#f97316', bg:'rgba(249,115,22,0.1)', icon:'🟠' },
          { key:'WATCH',    label:'Warning',   val:summary.watch||0,    color:'#eab308', bg:'rgba(234,179,8,0.1)',  icon:'🟡' },
          { key:'OK',       label:'On Track',  val:summary.onTrack||0,  color:'#22c55e', bg:'rgba(34,197,94,0.1)', icon:'🟢' },
        ].map(k => (
          <div key={k.key} style={{...S.kpiCard, background:k.bg, outline: levelFilter===k.key ? `2px solid ${k.color}` : 'none'}} onClick={() => setLevelFilter(levelFilter===k.key?'ALL':k.key)}>
            <div style={{...S.kpiNum, color:k.color}}>{k.val}</div>
            <div style={S.kpiLabel}>{k.icon} {k.label}</div>
            <div style={S.kpiSub}>Orders</div>
          </div>
        ))}
      </div>

      <div style={S.tabs}>
        {[{id:'overview',label:"📊 Vue d'ensemble"},{id:'fabric',label:'🧵 Fabric Readiness'},{id:'alerts',label:`🚨 Alertes (${alerts.length})`},{id:'depts',label:'🏢 Départements'}].map(t => (
          <button key={t.id} style={{...S.tab,...(activeTab===t.id?S.tabActive:{})}} onClick={()=>setActiveTab(t.id)}>{t.label}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={S.twoCol}>
          <div style={S.card}>
            <div style={S.cardTitle}>📅 Expéditions à venir — 30 jours</div>
            <table style={S.table}>
              <thead><tr>{['Ship Date','Clients','Total','🔴','🟠','🟡','🟢'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {upcomingRows.length===0 ? <tr><td colSpan={7} style={{...S.td,textAlign:'center',color:'var(--text3)'}}>Aucune donnée</td></tr> :
                upcomingRows.map((r,i)=>(
                  <tr key={i} style={{background:i%2===0?'rgba(255,255,255,0.02)':'transparent'}}>
                    <td style={S.td}><span style={{fontFamily:'var(--mono)',fontSize:11}}>{r.shipDate}</span></td>
                    <td style={S.td}>{r.customers.size}</td>
                    <td style={{...S.td,fontWeight:700}}>{r.total}</td>
                    <td style={{...S.td,color:'#ef4444',fontWeight:700}}>{r.critical||'-'}</td>
                    <td style={{...S.td,color:'#f97316',fontWeight:700}}>{r.risk||'-'}</td>
                    <td style={{...S.td,color:'#eab308',fontWeight:700}}>{r.watch||'-'}</td>
                    <td style={{...S.td,color:'#22c55e',fontWeight:700}}>{r.ok||'-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>⚡ Early Warning Alerts</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[
                {icon:'🔴',color:'#ef4444',bg:'rgba(239,68,68,0.1)',label:'Fabric not received at WH',count:alerts.filter(a=>a.issue?.includes('chưa về xưởng')||a.issue?.includes('not received')).length,sub:'within 30 days of ship date'},
                {icon:'🟠',color:'#f97316',bg:'rgba(249,115,22,0.1)',label:'MER not released to production',count:alerts.filter(a=>a.issue?.includes('QA')||a.issue?.includes('not released')).length,sub:'production within 14 days'},
                {icon:'🟡',color:'#eab308',bg:'rgba(234,179,8,0.1)',label:'Not in production plan',count:alerts.filter(a=>a.issue?.includes('Master Plan')||a.issue?.includes('production')).length,sub:'not scheduled yet'},
                {icon:'🔵',color:'#3b82f6',bg:'rgba(59,130,246,0.1)',label:'Fabric tracking mismatch',count:alerts.filter(a=>a.issue?.includes('tracking')||a.issue?.includes('Tracking')).length,sub:'between departments'},
              ].map((w,i)=>(
                <div key={i} style={{borderRadius:8,padding:'10px 12px',background:w.bg,borderLeft:`3px solid ${w.color}`}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:12,fontWeight:600,color:'var(--text)'}}>{w.icon} {w.label}</span>
                    <span style={{fontSize:20,fontWeight:700,color:w.color}}>{w.count}</span>
                  </div>
                  <div style={{fontSize:11,color:'var(--text3)',marginTop:2}}>{w.sub}</div>
                </div>
              ))}
            </div>
            {recommendations.length>0 && (
              <div style={{marginTop:16}}>
                <div style={{fontSize:12,fontWeight:600,color:'var(--text2)',marginBottom:8}}>⚡ Hành động ưu tiên</div>
                {recommendations.map((r,i)=>(
                  <div key={i} style={{display:'flex',alignItems:'flex-start',gap:8,marginBottom:6}}>
                    <span style={{background:'var(--accent)',color:'white',borderRadius:'50%',width:18,height:18,display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,flexShrink:0,marginTop:2}}>{i+1}</span>
                    <span style={{fontSize:12,color:'var(--text2)'}}>{r}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fabric' && (
        <div style={S.card}>
          <div style={S.cardTitle}>🧵 Fabric Readiness — Top Risks</div>
          <div style={{overflowX:'auto'}}>
            <table style={S.table}>
              <thead><tr>{['Style / Color','Customer','Ship Date','Days Left','WH Status','MER Status','Niveau','Problème'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
              <tbody>
                {fabricRows.length===0 ? <tr><td colSpan={8} style={{...S.td,textAlign:'center',color:'var(--text3)'}}>Aucune donnée</td></tr> :
                fabricRows.map((a,i)=>{
                  const wh = a.issue?.includes('chưa về xưởng')||a.issue?.includes('not received') ? 'Not Received' : 'Received'
                  const mer = a.issue?.includes('QA')||a.issue?.includes('chưa được release') ? 'Not Released' : 'Released'
                  return (
                    <tr key={i} style={{background:i%2===0?'rgba(255,255,255,0.02)':'transparent'}}>
                      <td style={S.td}><div style={{fontFamily:'var(--mono)',fontSize:12,fontWeight:600}}>{a.style}</div><div style={{fontSize:11,color:'var(--text3)'}}>{a.color}</div></td>
                      <td style={{...S.td,fontSize:12}}>{a.customer}</td>
                      <td style={{...S.td,fontFamily:'var(--mono)',fontSize:11}}>{a.shipDate}</td>
                      <td style={{...S.td,fontWeight:700,color:a.daysToShip<0?'#ef4444':a.daysToShip<14?'#f97316':'var(--text)'}}>{a.daysToShip<0?`−${Math.abs(a.daysToShip)}j`:`${a.daysToShip}j`}</td>
                      <td style={S.td}><Badge status={wh}/></td>
                      <td style={S.td}><Badge status={mer}/></td>
                      <td style={S.td}><LevelBadge level={a.level}/></td>
                      <td style={{...S.td,fontSize:11,color:'var(--text2)',maxWidth:200}}>{a.issue}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div>
          <div style={S.filterBar}>
            <div style={S.filterGroup}>
              <span style={S.filterLabel}>Mức độ:</span>
              {['ALL','CRITICAL','RISK','WATCH','OK'].map(l=><button key={l} style={{...S.filterBtn,background:levelFilter===l?'var(--accent)':'var(--bg3)',color:levelFilter===l?'white':'var(--text2)'}} onClick={()=>setLevelFilter(l)}>{l==='ALL'?'Tất cả':LEVEL_CONFIG[l]?.label||l}</button>)}
            </div>
            <div style={S.filterGroup}>
              <span style={S.filterLabel}>Bộ phận:</span>
              {depts.map(d=><button key={d} style={{...S.filterBtn,background:deptFilter===d?'var(--accent)':'var(--bg3)',color:deptFilter===d?'white':'var(--text2)'}} onClick={()=>setDeptFilter(d)}>{d==='ALL'?'Tất cả':d}</button>)}
            </div>
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>🚨 Chi tiết cảnh báo ({filtered.length})</div>
            <div style={{overflowX:'auto'}}>
              <table style={S.table}>
                <thead><tr>{['Mức độ','Khách hàng','Style','Màu','Ship Date','Còn lại','Vấn đề','Hành động'].map(h=><th key={h} style={S.th}>{h}</th>)}</tr></thead>
                <tbody>
                  {filtered.length===0?<tr><td colSpan={8} style={{...S.td,textAlign:'center',color:'var(--text3)',padding:32}}>Không có cảnh báo phù hợp</td></tr>:
                  filtered.map((a,i)=>(
                    <tr key={i} style={{background:i%2===0?'rgba(255,255,255,0.02)':'transparent'}}>
                      <td style={S.td}><LevelBadge level={a.level}/></td>
                      <td style={{...S.td,fontWeight:600,fontSize:12}}>{a.customer}</td>
                      <td style={{...S.td,fontFamily:'var(--mono)',fontSize:11}}>{a.style}</td>
                      <td style={{...S.td,fontSize:11}}>{a.color}</td>
                      <td style={{...S.td,fontFamily:'var(--mono)',fontSize:11}}>{a.shipDate}</td>
                      <td style={{...S.td,fontWeight:700,color:a.daysToShip<0?'#ef4444':a.daysToShip<14?'#f97316':'var(--text)'}}>{a.daysToShip<0?`Trễ ${Math.abs(a.daysToShip)}j`:`${a.daysToShip}j`}</td>
                      <td style={{...S.td,fontSize:11,color:'var(--text2)',maxWidth:220}}>{a.issue}</td>
                      <td style={{...S.td,fontSize:11,color:'#60a5fa',maxWidth:180,fontStyle:'italic'}}>{a.action}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'depts' && (
        <div style={S.deptGrid}>
          {departmentStatus.map((d,i)=>{
            const cfg = d.status==='CRITICAL'?LEVEL_CONFIG.CRITICAL:d.status==='WARNING'?LEVEL_CONFIG.RISK:LEVEL_CONFIG.OK
            return <div key={i} style={{...S.deptCard,background:cfg.bg,border:`1px solid ${cfg.border}`}}><div style={{fontSize:14,fontWeight:700,color:cfg.color,marginBottom:6}}>{d.name}</div><div style={{fontSize:12,color:'var(--text2)',lineHeight:1.5}}>{d.summary}</div></div>
          })}
        </div>
      )}
    </div>
  )
}

const S = {
  wrap:{maxWidth:1100,margin:'0 auto',padding:'28px 20px'},
  header:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12},
  headerTitle:{fontSize:20,fontWeight:700,color:'var(--text)'},
  headerDate:{fontSize:12,color:'var(--text3)',marginTop:4},
  headerBtns:{display:'flex',gap:10},
  dlBtn:{padding:'8px 14px',background:'rgba(34,197,94,0.15)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:8,color:'#22c55e',fontSize:13,fontWeight:600,cursor:'pointer'},
  resetBtn:{padding:'8px 14px',background:'var(--bg3)',border:'1px solid var(--border2)',borderRadius:8,color:'var(--text2)',fontSize:13,cursor:'pointer'},
  summaryBox:{background:'rgba(59,130,246,0.08)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:10,padding:'12px 16px',marginBottom:20,fontSize:13,color:'var(--text)',lineHeight:1.6},
  kpiRow:{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24},
  kpiCard:{borderRadius:12,padding:'20px 16px',textAlign:'center',border:'1px solid rgba(255,255,255,0.06)',transition:'outline 0.15s',cursor:'pointer'},
  kpiNum:{fontSize:36,fontWeight:800,lineHeight:1},
  kpiLabel:{fontSize:13,fontWeight:600,color:'var(--text)',marginTop:6},
  kpiSub:{fontSize:11,color:'var(--text3)',marginTop:2},
  tabs:{display:'flex',gap:4,marginBottom:20,borderBottom:'1px solid var(--border)'},
  tab:{padding:'10px 16px',background:'none',border:'none',color:'var(--text3)',fontSize:13,fontWeight:500,cursor:'pointer',borderBottom:'2px solid transparent',marginBottom:-1},
  tabActive:{color:'var(--accent2)',borderBottomColor:'var(--accent)',fontWeight:700},
  twoCol:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16},
  card:{background:'var(--bg2)',border:'1px solid var(--border)',borderRadius:12,padding:'16px 18px',marginBottom:16},
  cardTitle:{fontSize:13,fontWeight:700,color:'var(--text)',marginBottom:14},
  table:{width:'100%',borderCollapse:'collapse',fontSize:12},
  th:{padding:'8px 10px',textAlign:'left',fontSize:11,fontWeight:600,color:'var(--text3)',borderBottom:'1px solid var(--border)',whiteSpace:'nowrap'},
  td:{padding:'9px 10px',borderBottom:'1px solid rgba(255,255,255,0.04)',verticalAlign:'middle'},
  filterBar:{display:'flex',flexDirection:'column',gap:8,padding:14,background:'var(--bg2)',borderRadius:10,border:'1px solid var(--border)',marginBottom:16},
  filterGroup:{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'},
  filterLabel:{fontSize:11,color:'var(--text3)',minWidth:65},
  filterBtn:{padding:'4px 10px',border:'none',borderRadius:16,fontSize:11,fontWeight:500,cursor:'pointer',transition:'all 0.15s'},
  deptGrid:{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12},
  deptCard:{borderRadius:10,padding:'14px 16px'},
}
