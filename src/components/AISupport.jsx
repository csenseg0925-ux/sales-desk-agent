import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApiKey } from '../App'
import { ApiKeyButton } from './ApiKeyModal'
import { getContextChunks } from '../utils/ragLoader'

const CATEGORIES = ['상품매뉴얼', '업무매뉴얼', '구비서류', '공지사항', '세일즈콘텐츠', 'FAQ']

const CATEGORY_CONTEXTS = {
  '상품매뉴얼': '유선통신 상품(인터넷, 전화, TV) 상품매뉴얼에 명시된 내용만 안내하는 역할입니다.',
  '업무매뉴얼': '영업 업무매뉴얼에 명시된 절차와 내용만 안내하는 역할입니다.',
  '구비서류': '구비서류 관련 문서에 명시된 서류 목록과 조건만 안내하는 역할입니다.',
  '공지사항': '공지사항 문서에 명시된 내용만 안내하는 역할입니다.',
  '세일즈콘텐츠': '세일즈콘텐츠 문서에 명시된 내용만 안내하는 역할입니다.',
  'FAQ': 'FAQ 문서에 명시된 질문과 답변만 안내하는 역할입니다.',
}

const PLACEHOLDER = {
  '상품매뉴얼': '상품 스펙, 요금제, 기능에 대해 질문해보세요.',
  '업무매뉴얼': '업무 절차, 시스템 사용법에 대해 질문해보세요.',
  '구비서류': '개통, 해지, 명의변경 서류에 대해 질문해보세요.',
  '공지사항': '최신 정책이나 공지 내용을 질문해보세요.',
  '세일즈콘텐츠': '세일즈 스크립트, 영업 팁을 질문해보세요.',
  'FAQ': '고객 응대 관련 질문을 해보세요.',
}

async function callClaudeApi(apiKey, category, message, history) {
  const contextChunks = getContextChunks(message)

  const contextSection = contextChunks
    ? `[참고 문서]\n${contextChunks}\n\n`
    : `[참고 문서]\n현재 등록된 문서가 없습니다.\n\n`

  const systemPrompt =
    `당신은 Sales Desk AI Agent입니다. ${CATEGORY_CONTEXTS[category]}\n\n` +
    contextSection +
    `[답변 원칙]\n` +
    `1. 반드시 위 [참고 문서]에 명시된 내용만 근거로 답변하세요.\n` +
    `2. 참고 문서에 없는 내용은 추론하거나 일반적인 업무 지식으로 답변하지 마세요.\n` +
    `3. 참고 문서에서 찾을 수 없는 질문에는 "해당 내용은 현재 등록된 문서에서 확인되지 않습니다."라고 안내하세요.\n` +
    `4. 답변 시 근거가 된 출처(문서명 > 항목)를 함께 표기하세요.\n` +
    `5. 답변은 항상 한국어로 하세요.`

  const messages = [
    ...history.map(({ role, content }) => ({ role, content })),
    { role: 'user', content: message },
  ]

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages,
    }),
  })

  const data = await res.json()
  if (!res.ok) {
    const msg = data?.error?.message || `API 오류 (${res.status})`
    throw new Error(msg)
  }
  return data.content[0].text
}

const s = {
  container: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#ffffff',
  },
  header: {
    background: '#1B4FD8',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
  },
  backBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: 'none',
    borderRadius: '8px',
    color: '#ffffff',
    padding: '6px 12px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
  },
  tabBar: {
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    overflowX: 'auto',
    background: '#ffffff',
    flexShrink: 0,
    scrollbarWidth: 'none',
  },
  tab: (active) => ({
    padding: '14px 20px',
    fontSize: '14px',
    fontWeight: active ? '700' : '500',
    color: active ? '#1B4FD8' : '#6B7280',
    borderBottom: active ? '2px solid #1B4FD8' : '2px solid transparent',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid #1B4FD8' : '2px solid transparent',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.15s ease',
    flexShrink: 0,
  }),
  noKeyBanner: {
    background: '#FEF2F2',
    borderBottom: '1px solid #FECACA',
    padding: '10px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#991B1B',
    flexShrink: 0,
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: '#F9FAFB',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#9CA3AF',
    gap: '12px',
  },
  messageRow: (isUser) => ({
    display: 'flex',
    justifyContent: isUser ? 'flex-end' : 'flex-start',
    gap: '8px',
    alignItems: 'flex-end',
  }),
  avatar: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: '#1B4FD8',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    flexShrink: 0,
  },
  bubble: (isUser) => ({
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
    background: isUser ? '#1B4FD8' : '#ffffff',
    color: isUser ? '#ffffff' : '#111827',
    fontSize: '14px',
    lineHeight: 1.6,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: isUser ? 'none' : '1px solid #E5E7EB',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  }),
  timestamp: {
    fontSize: '11px',
    color: '#9CA3AF',
    marginTop: '4px',
  },
  loadingBubble: {
    display: 'flex',
    gap: '4px',
    padding: '14px 18px',
    background: '#ffffff',
    borderRadius: '18px 18px 18px 4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #E5E7EB',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#9CA3AF',
  },
  inputBar: {
    borderTop: '1px solid #E5E7EB',
    padding: '16px 20px',
    background: '#ffffff',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    padding: '10px 16px',
    fontSize: '14px',
    resize: 'none',
    maxHeight: '120px',
    lineHeight: 1.5,
    color: '#111827',
    background: '#F9FAFB',
    transition: 'border-color 0.15s',
  },
  sendBtn: (disabled) => ({
    width: 42,
    height: 42,
    borderRadius: '12px',
    background: disabled ? '#E5E7EB' : '#1B4FD8',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    flexShrink: 0,
    transition: 'background 0.15s',
  }),
}

function formatTime() {
  return new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
}

export default function AISupport() {
  const navigate = useNavigate()
  const { apiKey } = useApiKey()
  const [activeCategory, setActiveCategory] = useState('상품매뉴얼')
  const [histories, setHistories] = useState({})
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)
  const inputRef = useRef(null)

  const messages = histories[activeCategory] || []
  const canSend = !!apiKey && !!input.trim() && !loading

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setInput('')
  }

  const sendMessage = async () => {
    if (!canSend) return

    const text = input.trim()
    const userMsg = { role: 'user', content: text, time: formatTime() }
    const prevMessages = histories[activeCategory] || []
    const updatedMessages = [...prevMessages, userMsg]

    setHistories((h) => ({ ...h, [activeCategory]: updatedMessages }))
    setInput('')
    setLoading(true)

    try {
      const replyText = await callClaudeApi(apiKey, activeCategory, text, prevMessages)
      const aiMsg = { role: 'assistant', content: replyText, time: formatTime() }
      setHistories((h) => ({ ...h, [activeCategory]: [...updatedMessages, aiMsg] }))
    } catch (err) {
      const errMsg = {
        role: 'assistant',
        content: `오류: ${err.message}`,
        time: formatTime(),
        isError: true,
      }
      setHistories((h) => ({ ...h, [activeCategory]: [...updatedMessages, errMsg] }))
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={s.container}>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .dot1 { animation: bounce 1.4s infinite ease-in-out 0s; }
        .dot2 { animation: bounce 1.4s infinite ease-in-out 0.2s; }
        .dot3 { animation: bounce 1.4s infinite ease-in-out 0.4s; }
        .chat-input:focus { border-color: #1B4FD8 !important; background: #fff !important; }
        .tab-btn:hover { color: #1B4FD8 !important; }
      `}</style>

      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>← 홈</button>
        <span style={s.headerTitle}>AI 지원센터</span>
        <div style={{ marginLeft: 'auto' }}>
          <ApiKeyButton light />
        </div>
      </header>

      <div style={s.tabBar}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className="tab-btn"
            style={s.tab(cat === activeCategory)}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {!apiKey && (
        <div style={s.noKeyBanner}>
          <span>⚠️</span>
          <span>API 키가 설정되지 않았습니다. 우측 상단의 <strong>'API 키 필요'</strong> 버튼을 눌러 설정해주세요.</span>
        </div>
      )}

      <div style={s.chatArea}>
        {messages.length === 0 ? (
          <div style={s.emptyState}>
            <div style={{ fontSize: '48px', opacity: 0.5 }}>💬</div>
            <p style={{ fontSize: '15px', textAlign: 'center', lineHeight: 1.5 }}>
              <strong>{activeCategory}</strong> 관련 질문을 입력해주세요.<br />
              {PLACEHOLDER[activeCategory]}
            </p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} style={s.messageRow(msg.role === 'user')}>
              {msg.role === 'assistant' && <div style={s.avatar}>🤖</div>}
              <div>
                <div style={{
                  ...s.bubble(msg.role === 'user'),
                  ...(msg.isError ? { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' } : {}),
                }}>
                  {msg.content}
                </div>
                <div style={{ ...s.timestamp, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                  {msg.time}
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div style={s.messageRow(false)}>
            <div style={s.avatar}>🤖</div>
            <div style={s.loadingBubble}>
              <div className="dot1" style={s.dot} />
              <div className="dot2" style={s.dot} />
              <div className="dot3" style={s.dot} />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div style={s.inputBar}>
        <textarea
          ref={inputRef}
          className="chat-input"
          style={{ ...s.input, background: apiKey ? '#F9FAFB' : '#F3F4F6' }}
          placeholder={apiKey ? PLACEHOLDER[activeCategory] : 'API 키를 먼저 설정해주세요.'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!apiKey}
          rows={1}
          onInput={(e) => {
            e.target.style.height = 'auto'
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
          }}
        />
        <button
          style={s.sendBtn(!canSend)}
          onClick={sendMessage}
          disabled={!canSend}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
