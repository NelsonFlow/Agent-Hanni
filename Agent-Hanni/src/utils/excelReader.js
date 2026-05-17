import * as XLSX from 'xlsx'
 
export async function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array', cellDates: true })
        const sheets = {}
        workbook.SheetNames.forEach(name => {
          const ws = workbook.Sheets[name]
          const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })
          // Take first 200 rows max to avoid token overflow
          sheets[name] = json.slice(0, 200)
        })
        resolve({
          fileName: file.name,
          fileSize: file.size,
          sheets,
          sheetNames: workbook.SheetNames,
          _rawFile: e.target.result
        })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
 
export function extractKeyData(parsedFile) {
  const { fileName, sheets, sheetNames } = parsedFile
  const dept = detectDepartment(fileName)
  const summary = []
 
  sheetNames.slice(0, 5).forEach(sheetName => {
    const rows = sheets[sheetName]
    if (!rows || rows.length < 2) return
    // Find header row (first non-empty row)
    const headerRow = rows.find(r => r.some(c => c !== ''))
    const dataRows = rows.filter(r => r !== headerRow && r.some(c => c !== ''))
    summary.push({
      sheet: sheetName,
      headers: headerRow ? headerRow.slice(0, 20) : [],
      rowCount: dataRows.length,
      sample: dataRows.slice(0, 15)
    })
  })
 
  return { fileName, department: dept, summary }
}
 
function detectDepartment(fileName) {
  const f = fileName.toLowerCase()
  if (f.includes('fabric')) return 'Fabric / QA Tissu'
  if (f.includes('merchandise') || f.includes('merch')) return 'Merchandising'
  if (f.includes('delivery') || f.includes('inspection')) return 'Delivery & QA'
  if (f.includes('master') || f.includes('master_plan')) return 'Master Plan / Production'
  if (f.includes('shipment') || f.includes('tracking')) return 'Shipment Tracking'
  if (f.includes('daily_report') || f.includes('daily report')) return 'Daily Report'
  if (f.includes('qa') || f.includes('quality')) return 'Quality Control'
  if (f.includes('cutting')) return 'Cutting'
  if (f.includes('trim')) return 'Trim'
  return 'Département inconnu'
}