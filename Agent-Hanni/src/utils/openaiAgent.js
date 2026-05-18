const BACKEND_URL = 'https://agent-hanni-backend-production.up.railway.app'

export async function analyzeWithAI(files, apiKey) {
  const filesData = await Promise.all(
    Array.from(files).map(file => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const bytes = new Uint8Array(e.target.result)
        let binary = ''
        const chunkSize = 8192
        for (let i = 0; i < bytes.length; i += chunkSize) {
          const chunk = bytes.subarray(i, i + chunkSize)
          binary += String.fromCharCode.apply(null, chunk)
        }
        resolve({ filename: file.name, content_b64: btoa(binary) })
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    }))
  )

  const response = await fetch(`${BACKEND_URL}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: filesData })
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.detail || `Erreur serveur: ${response.status}`)
  }

  return await response.json()
}