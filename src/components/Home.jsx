import { useNavigate } from 'react-router-dom'
import { ApiKeyButton } from './ApiKeyModal'

const styles = {
  container: {
    minHeight: '100vh',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: '#1B4FD8',
    padding: '20px 32px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: 36,
    height: 36,
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
  },
  logoText: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '700',
    letterSpacing: '-0.3px',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6B7280',
    marginBottom: '48px',
    textAlign: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '24px',
    maxWidth: '720px',
    width: '100%',
  },
  card: {
    background: '#ffffff',
    border: '1px solid #E5E7EB',
    borderRadius: '16px',
    padding: '36px 32px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '10px',
    lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: '14px',
    color: '#6B7280',
    lineHeight: 1.6,
    marginBottom: '24px',
  },
  cardBadge: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '5px 12px',
    borderRadius: '20px',
  },
  footer: {
    padding: '20px',
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: '12px',
    borderTop: '1px solid #F3F4F6',
  },
}

const cards = [
  {
    path: '/ai-support',
    icon: '🤖',
    iconBg: '#EEF2FF',
    title: 'AI 지원센터',
    desc: '상품·업무 매뉴얼, 구비서류, 공지사항 등 AI가 실시간으로 답변해드립니다.',
    badge: 'AI 채팅',
    badgeBg: '#EEF2FF',
    badgeColor: '#4338CA',
    hoverBorder: '#818CF8',
  },
  {
    path: '/calculator',
    icon: '🧮',
    iconBg: '#ECFDF5',
    title: '유선 간편 요금계산기',
    desc: '인터넷, 전화, TV 결합 상품의 월 요금을 간편하게 계산해보세요.',
    badge: '요금 계산',
    badgeBg: '#ECFDF5',
    badgeColor: '#065F46',
    hoverBorder: '#6EE7B7',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logoIcon}>⚡</div>
        <span style={styles.logoText}>Sales Desk AI Agent</span>
        <div style={{ marginLeft: 'auto' }}>
          <ApiKeyButton light />
        </div>
      </header>

      <main style={styles.main}>
        <h1 style={styles.title}>무엇을 도와드릴까요?</h1>
        <p style={styles.subtitle}>원하는 서비스를 선택하세요</p>

        <div style={styles.grid}>
          {cards.map((card) => (
            <div
              key={card.path}
              style={styles.card}
              onClick={() => navigate(card.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = card.hoverBorder
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'
                e.currentTarget.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB'
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              <div style={{ ...styles.cardIcon, background: card.iconBg }}>
                {card.icon}
              </div>
              <h2 style={styles.cardTitle}>{card.title}</h2>
              <p style={styles.cardDesc}>{card.desc}</p>
              <span style={{
                ...styles.cardBadge,
                background: card.badgeBg,
                color: card.badgeColor,
              }}>
                {card.badge}
              </span>
            </div>
          ))}
        </div>
      </main>

      <footer style={styles.footer}>
        Sales Desk AI Agent &copy; 2025 — Powered by Claude AI
      </footer>
    </div>
  )
}
