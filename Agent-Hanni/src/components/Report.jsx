import * as XLSX from 'xlsx'
import KpiCards from './dashboard/KpiCards.jsx'
import UpcomingShipments from './dashboard/UpcomingShipments.jsx'
import EarlyWarnings from './dashboard/EarlyWarnings.jsx'
import FabricTable from './fabric/FabricTable.jsx'
import AlertsTable from './alerts/AlertsTable.jsx'
import { useState } from 'react'
import { LEVEL_CONFIG } from './common/LevelBadge.jsx'

export default function Report({ data, activeTab, setActiveTab, isEmpty }) {
  const [levelFilter, setLevelFilter] = useState('ALL')
  const { summary = {}, alerts = [], departmentStatus = [], recommendations = [], globalSummary = '' } = data

  const downloadExcel = () => {
    const now = new Date()
    const date = `${now.getDate().toString().padStart(2,'0')}/${(now.getMonth()+1).toString().padStart(2,'0')}/${now.getFullYear()}`
    const wb = XLSX.utils.book_new()
    const ws1 = XLSX.utils.aoa_to_sheet([
      ['TRUNG TÂM KIỂM SOÁT CHUỖI CUNG ỨNG THỜI TRANG'],
      ['Ngày:', date],
      [''],
      ['🔴 Khẩn cấp:', summary.critical || 0],
      ['🟠 Rủi ro:', summary.risk || 0],
      ['🟡 Cảnh báo:', summary.watch || 0],
      ['🟢 Ổn định:', summary.onTrack || 0],
      [''],
      ['Tóm tắt:', globalSummary],
    ])
    XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan')
    const headers = [
      'LEVEL', 'DEPT', 'Shipment Date', 'Customer', 'Season', 'Drop', 'Style', 'Color',
      'Còn (Ngày)', 'QTY Master (pcs)',
      'ERP: Actual Qty', 'ERP: Confirm Date', 'ERP: Revised Date', 'ERP: % Arrived', 'ERP Status',
      'Delivery: Ready Date', 'Delivery: QTY', 'Delivery: %',
      'QA: Date', 'QA: QTY (mét)', 'QA: %',
      'WH: Date', 'WH: QTY', 'WH: %',
      'Merch: Release Date', 'Merch: QTY', 'Merch Status',
      'Status', 'Action'
    ]
    const rows = [headers]
    alerts.forEach(a => {
      rows.push([
        LEVEL_CONFIG[a.level]?.label || a.level,
        a.department, a.shipDate, a.customer,
        a.season || '', a.drop || '', a.style, a.color,
        a.daysToShip, a.qtyPcs || '',
        a.erp_actual_qty || '', a.erp_confirm_date || '', a.erp_revised_date || '',
        a.erp_pct_arrived ? `${a.erp_pct_arrived}%` : '', a.erp_status || '',
        a.delivery_ready_date || '', a.delivery_qty || '',
        a.delivery_pct ? `${a.delivery_pct}%` : '',
        a.qa_date || '', a.qa_qty || '', a.qa_pct ? `${a.qa_pct}%` : '',
        a.wh_date || '', a.wh_qty || '', a.wh_pct ? `${a.wh_pct}%` : '',
        a.merch_release_date || '', a.merch_qty || '', a.merch_status || '',
        a.issue, a.action
      ])
    })
    const ws2 = XLSX.utils.aoa_to_sheet(rows)
    ws2['!cols'] = [10,14,13,12,8,14,16,20,8,12,10,13,13,10,14,13,10,8,12,10,8,12,10,8,13,10,10,40,35].map(w=>({wch:w}))
    XLSX.utils.book_append_sheet(wb, ws2, 'REPORT HANNI WANT')
    XLSX.writeFile(wb, `BaoCao_ChuoiCungUng_${date.replace(/\//g,'-')}.xlsx`)
  }

  return (
    <div style={S.wrap}>
      <div style={S.header}>
        <div>
          <div className="dashboard-title" style={S.title}>🏭 Trung tâm kiểm soát chuỗi cung ứng thời trang</div>
          <div style={S.subtitle}>Cảnh báo sớm · Hiển thị · Đồng bộ · Giao hàng đúng hạn</div>
        </div>
        <button style={S.dlBtn} onClick={downloadExcel}>⬇ Tải xuống Excel</button>
      </div>

      {globalSummary && (
        <div style={S.summaryBox}>📋 {globalSummary}</div>
      )}

      {isEmpty && (
        <div style={S.emptyBox}>
          📂 Tải lên các báo cáo Excel từ thanh bên trái để bắt đầu phân tích
        </div>
      )}

      <KpiCards
        summary={summary}
        setActiveTab={setActiveTab}
        levelFilter={levelFilter}
        setLevelFilter={setLevelFilter}
      />

      {activeTab === 'dashboard' && (
        <div className="two-col" style={S.twoCol}>
          <UpcomingShipments alerts={alerts} />
          <EarlyWarnings alerts={alerts} recommendations={recommendations} />
        </div>
      )}

      {activeTab === 'fabric' && (
        <FabricTable alerts={alerts} />
      )}

      {activeTab === 'alerts' && (
        <AlertsTable alerts={alerts} />
      )}

      {activeTab === 'depts' && (
        <div style={S.deptGrid}>
          {departmentStatus.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>Không có dữ liệu bộ phận</div>
            : departmentStatus.map((d, i) => {
              const cfg = d.status === 'CRITICAL'
                ? { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)' }
                : d.status === 'WARNING'
                ? { color: '#f97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.3)' }
                : { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' }
              return (
                <div key={i} style={{ ...S.deptCard, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: cfg.color, marginBottom: 6 }}>{d.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{d.summary}</div>
                </div>
              )
            })
          }
        </div>
      )}
    </div>
  )
}

const S = {
  wrap: { width: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 12 },
  title: { fontSize: 18, fontWeight: 700, color: 'var(--text)' },
  subtitle: { fontSize: 12, color: 'var(--text3)', marginTop: 4 },
  dlBtn: { padding: '8px 14px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#22c55e', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  summaryBox: { background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--text)', lineHeight: 1.6 },
  emptyBox: { background: 'var(--bg2)', border: '1px dashed var(--border2)', borderRadius: 10, padding: '32px', marginBottom: 20, fontSize: 14, color: 'var(--text3)', textAlign: 'center' },
  twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  deptGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 12 },
  deptCard: { borderRadius: 10, padding: '14px 16px' },
}