const BACKEND_URL = 'https://agent-hanni-backend-production.up.railway.app'

export async function analyzeWithAI(files, apiKey) {
  // Read each file as base64
  const filesData = await Promise.all(
    Array.from(files).map(file => new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const base64 = btoa(
          new Uint8Array(e.target.result)
            .reduce((data, byte) => data + String.fromCharCode(byte), '')
        )
        resolve({ filename: file.name, content_b64: base64 })
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