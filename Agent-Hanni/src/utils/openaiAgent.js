const BACKEND_URL = 'https://agent-hanni-backend-production.up.railway.app'
 
export async function analyzeWithAI(files, apiKey) {
  const formData = new FormData()
  for (const file of files) {
    formData.append('files', file, file.name)
  }
  const response = await fetch(`${BACKEND_URL}/analyze`, {
    method: 'POST',
    body: formData
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || `Erreur serveur: ${response.status}`)
  }
  return await response.json()
}
  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })
 
  // Build context from all files
  const context = filesData.map(f => {
    const sheetsInfo = f.summary.map(s => {
      const headers = s.headers.filter(h => h !== '').join(', ')
      const sampleStr = s.sample.slice(0, 8).map(row =>
        row.filter(c => c !== '').slice(0, 10).join(' | ')
      ).filter(r => r.trim()).join('\n')
      return `  Sheet "${s.sheet}" (${s.rowCount} lignes):\n  Colonnes: ${headers}\n  Données:\n${sampleStr}`
    }).join('\n\n')
    return `=== ${f.department.toUpperCase()} (${f.fileName}) ===\n${sheetsInfo}`
  }).join('\n\n')
 
  const prompt = `Bạn là một chuyên gia phân tích chuỗi cung ứng cho một xưởng may tại Việt Nam, chuyên sản xuất cho các thương hiệu lớn như Nike, Adidas, Palace, Stussy, OVO...
 
Hôm nay là ${today}.
 
Bạn nhận được ${filesData.length} báo cáo Excel từ các bộ phận khác nhau. Hãy phân tích toàn bộ dữ liệu, so sánh chéo giữa các bộ phận và tạo ra một báo cáo cảnh báo chi tiết.
 
DỮ LIỆU TỪ CÁC BỘ PHẬN:
${context}
 
Hãy phân tích và trả lời theo đúng định dạng JSON sau (KHÔNG có markdown, KHÔNG có backtick, CHỈ JSON thuần):
 
{
  "summary": {
    "totalOrders": <số đơn hàng>,
    "critical": <số lượng>,
    "risk": <số lượng>,
    "watch": <số lượng>,
    "onTrack": <số lượng>,
    "depsReceived": ${filesData.length}
  },
  "alerts": [
    {
      "level": "CRITICAL|RISK|WATCH|OK",
      "department": "<tên bộ phận>",
      "customer": "<tên khách hàng>",
      "style": "<mã style>",
      "color": "<màu>",
      "shipDate": "<ngày xuất hàng>",
      "daysToShip": <số ngày>,
      "issue": "<mô tả vấn đề bằng tiếng Việt, chi tiết>",
      "action": "<hành động cần thực hiện ngay>"
    }
  ],
  "departmentStatus": [
    {
      "name": "<tên bộ phận>",
      "status": "OK|WARNING|CRITICAL",
      "summary": "<tóm tắt tình trạng bằng tiếng Việt>"
    }
  ],
  "recommendations": [
    "<hành động ưu tiên 1>",
    "<hành động ưu tiên 2>",
    "<hành động ưu tiên 3>"
  ],
  "globalSummary": "<tóm tắt tổng quan tình hình hôm nay bằng tiếng Việt, 3-4 câu>"
}`
 
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4000,
      temperature: 0.1
    })
  })
 
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.error?.message || 'OpenAI API error')
  }
 
  const data = await response.json()
  const content = data.choices[0].message.content.trim()
 
  // Clean and parse JSON
  const clean = content.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim()
  return JSON.parse(clean)
}
 