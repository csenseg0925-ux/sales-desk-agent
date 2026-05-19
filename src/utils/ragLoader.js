import csvText from '../data/support-form.csv?raw'

function parseRow(line) {
  const fields = []
  let current = ''
  let inQuote = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuote = !inQuote
      }
    } else if (ch === ',' && !inQuote) {
      fields.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current.trim())
  return fields
}

function parseCSV(text) {
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = []
  let current = ''
  let inQuote = false

  for (let i = 0; i < normalizedText.length; i++) {
    const ch = normalizedText[i]
    if (ch === '"') {
      inQuote = !inQuote
      current += ch
    } else if (ch === '\n' && !inQuote) {
      lines.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  if (current.trim()) lines.push(current)

  if (lines.length < 2) return []

  const headers = parseRow(lines[0])
  const rows = []

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue
    const values = parseRow(lines[i])
    const obj = {}
    headers.forEach((h, idx) => {
      obj[h] = (values[idx] || '').replace(/^"|"$/g, '')
    })
    rows.push(obj)
  }

  return rows
}

let _docs = null

function getDocs() {
  if (!_docs) {
    _docs = parseCSV(csvText).filter(row => row['입력완료'] === 'Y')
  }
  return _docs
}

export function getContextChunks(query) {
  const docs = getDocs()

  if (docs.length === 0) return null

  const queryWords = query.toLowerCase().split(/\s+/).filter(w => w.length > 1)

  const scored = docs.map(doc => {
    const searchTarget = [doc['청크내용'], doc['키워드'], doc['청크제목']]
      .join(' ')
      .toLowerCase()
    const score = queryWords.reduce(
      (acc, word) => acc + (searchTarget.includes(word) ? 1 : 0),
      0
    )
    return { doc, score }
  })

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(({ doc }) =>
      `[출처: ${doc['문서제목']} > ${doc['청크제목']}]\n${doc['청크내용']}`
    )

  return top.join('\n\n---\n\n')
}
