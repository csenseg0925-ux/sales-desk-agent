import { useState } from 'react'
import { useApiKey } from '../App'

const s = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modal: {
    background: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    overflow: 'hidden',
  },
  header: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid #E5E7EB',
  },
  title: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#6B7280',
    marginTop: '4px',
  },
  body: {
    padding: '20px 24px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px',
    display: 'block',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    border: '1.5px solid #E5E7EB',
    borderRadius: '10px',
    padding: '11px 44px 11px 14px',
    fontSize: '14px',
    color: '#111827',
    background: '#F9FAFB',
    outline: 'none',
    fontFamily: 'monospace',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#9CA3AF',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  infoBox: {
    marginTop: '12px',
    padding: '10px 12px',
    background: '#FFF7ED',
    borderRadius: '8px',
    border: '1px solid #FED7AA',
    fontSize: '12px',
    color: '#92400E',
    lineHeight: 1.5,
  },
  statusBox: (set) => ({
    marginTop: '12px',
    padding: '10px 12px',
    background: set ? '#F0FDF4' : '#FEF2F2',
    borderRadius: '8px',
    border: `1px solid ${set ? '#BBF7D0' : '#FECACA'}`,
    fontSize: '12px',
    color: set ? '#166534' : '#991B1B',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  }),
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #E5E7EB',
    display: 'flex',
    gap: '10px',
    justifyContent: 'flex-end',
  },
  cancelBtn: {
    padding: '9px 18px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    background: '#ffffff',
    color: '#374151',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  clearBtn: {
    padding: '9px 18px',
    borderRadius: '8px',
    border: '1px solid #FECACA',
    background: '#FEF2F2',
    color: '#DC2626',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  saveBtn: (disabled) => ({
    padding: '9px 22px',
    borderRadius: '8px',
    border: 'none',
    background: disabled ? '#E5E7EB' : '#1B4FD8',
    color: disabled ? '#9CA3AF' : '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
  }),
}

export default function ApiKeyModal({ onClose }) {
  const { apiKey, setApiKey } = useApiKey()
  const [input, setInput] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)

  const isValid = input.trim().startsWith('sk-ant-')
  const hasKey = !!apiKey

  const handleSave = () => {
    setApiKey(input.trim())
    onClose()
  }

  const handleClear = () => {
    setInput('')
    setApiKey('')
    onClose()
  }

  return (
    <div style={s.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={s.header}>
          <div style={s.title}>
            <span>🔑</span> Claude API 키 설정
          </div>
          <p style={s.subtitle}>Anthropic Console에서 발급받은 API 키를 입력하세요.</p>
        </div>

        <div style={s.body}>
          <label style={s.label}>API 키</label>
          <div style={s.inputWrap}>
            <input
              style={s.input}
              type={showKey ? 'text' : 'password'}
              placeholder="sk-ant-api03-..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={(e) => (e.target.style.borderColor = '#1B4FD8')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && isValid && handleSave()}
            />
            <button style={s.eyeBtn} onClick={() => setShowKey((v) => !v)} tabIndex={-1}>
              {showKey ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          <div style={s.statusBox(hasKey)}>
            {hasKey ? '✅ API 키가 설정되어 있습니다.' : '❌ API 키가 설정되지 않았습니다.'}
          </div>

          <div style={s.infoBox}>
            ⚠️ API 키는 이 기기의 <strong>localStorage</strong>에만 저장됩니다. 서버로 전송되지 않으며, 브라우저를 통해 Anthropic API에 직접 요청됩니다.
          </div>
        </div>

        <div style={s.footer}>
          <button style={s.cancelBtn} onClick={onClose}>취소</button>
          {hasKey && (
            <button style={s.clearBtn} onClick={handleClear}>삭제</button>
          )}
          <button style={s.saveBtn(!isValid)} onClick={handleSave} disabled={!isValid}>
            저장
          </button>
        </div>
      </div>
    </div>
  )
}

export function ApiKeyButton({ light = false }) {
  const { apiKey } = useApiKey()
  const [open, setOpen] = useState(false)
  const isSet = !!apiKey

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '8px',
          border: 'none',
          background: light
            ? (isSet ? 'rgba(255,255,255,0.15)' : 'rgba(239,68,68,0.25)')
            : (isSet ? '#F0FDF4' : '#FEF2F2'),
          color: light ? '#ffffff' : (isSet ? '#166534' : '#DC2626'),
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
        }}
      >
        <span>{isSet ? '🔑' : '⚠️'}</span>
        <span>{isSet ? 'API 키 설정됨' : 'API 키 필요'}</span>
      </button>
      {open && <ApiKeyModal onClose={() => setOpen(false)} />}
    </>
  )
}
