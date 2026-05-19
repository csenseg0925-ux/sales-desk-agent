import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

const INTERNET_PLANS = [
  { id: 'i100', name: '인터넷 100Mbps', price: 26400 },
  { id: 'i500', name: '인터넷 500Mbps', price: 33000 },
  { id: 'i1g', name: '인터넷 1Gbps', price: 38500 },
  { id: 'i2g', name: '인터넷 2.5Gbps', price: 44000 },
]

const PHONE_PLANS = [
  { id: 'p_basic', name: '집전화 기본형', price: 5500 },
  { id: 'p_unlimited', name: '집전화 무제한형', price: 11000 },
]

const TV_PLANS = [
  { id: 'tv_basic', name: 'IPTV 베이직', price: 13750 },
  { id: 'tv_standard', name: 'IPTV 스탠다드', price: 16500 },
  { id: 'tv_premium', name: 'IPTV 프리미엄', price: 22000 },
]

const CONTRACT_OPTIONS = [
  { id: 'none', label: '약정 없음', discount: 0 },
  { id: '1y', label: '1년 약정', discount: 10 },
  { id: '2y', label: '2년 약정', discount: 20 },
  { id: '3y', label: '3년 약정', discount: 30 },
]

function getBundleDiscount(hasInternet, hasPhone, hasTV) {
  const count = [hasInternet, hasPhone, hasTV].filter(Boolean).length
  if (count < 2) return { rate: 0, label: '' }
  if (hasInternet && hasPhone && hasTV) return { rate: 25, label: '3중 결합 할인' }
  if (hasInternet && hasTV) return { rate: 15, label: '인터넷+TV 결합 할인' }
  if (hasInternet && hasPhone) return { rate: 10, label: '인터넷+전화 결합 할인' }
  return { rate: 0, label: '' }
}

const s = {
  container: {
    minHeight: '100vh',
    background: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: '#1B4FD8',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
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
  body: {
    flex: 1,
    display: 'flex',
    gap: '0',
    maxWidth: '900px',
    margin: '0 auto',
    width: '100%',
    padding: '32px 24px',
    gap: '24px',
    alignItems: 'flex-start',
  },
  leftPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  rightPanel: {
    width: '300px',
    flexShrink: 0,
    position: 'sticky',
    top: '32px',
  },
  section: {
    background: '#ffffff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  sectionHeader: {
    padding: '14px 20px',
    background: '#F9FAFB',
    borderBottom: '1px solid #E5E7EB',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionToggle: {
    width: 20,
    height: 20,
    borderRadius: '4px',
    border: '2px solid #D1D5DB',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.15s',
  },
  sectionTitle: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#111827',
  },
  sectionBadge: {
    fontSize: '12px',
    padding: '2px 8px',
    borderRadius: '10px',
    marginLeft: 'auto',
  },
  sectionBody: {
    padding: '16px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  planOption: (selected) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 14px',
    borderRadius: '8px',
    border: `1px solid ${selected ? '#1B4FD8' : '#E5E7EB'}`,
    background: selected ? '#EEF2FF' : '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.15s',
    gap: '10px',
  }),
  radioCircle: (selected) => ({
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: `2px solid ${selected ? '#1B4FD8' : '#D1D5DB'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }),
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#1B4FD8',
  },
  planName: (selected) => ({
    fontSize: '14px',
    fontWeight: selected ? '600' : '400',
    color: selected ? '#1B4FD8' : '#374151',
    flex: 1,
  }),
  planPrice: (selected) => ({
    fontSize: '14px',
    fontWeight: '600',
    color: selected ? '#1B4FD8' : '#6B7280',
  }),
  contractGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  contractOption: (selected) => ({
    padding: '12px',
    borderRadius: '8px',
    border: `1px solid ${selected ? '#1B4FD8' : '#E5E7EB'}`,
    background: selected ? '#EEF2FF' : '#ffffff',
    cursor: 'pointer',
    textAlign: 'center',
    transition: 'all 0.15s',
  }),
  contractLabel: (selected) => ({
    fontSize: '13px',
    fontWeight: selected ? '700' : '500',
    color: selected ? '#1B4FD8' : '#374151',
    display: 'block',
  }),
  contractDiscount: (selected) => ({
    fontSize: '12px',
    color: selected ? '#4338CA' : '#9CA3AF',
    marginTop: '2px',
    display: 'block',
  }),
  summaryCard: {
    background: '#ffffff',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  summaryHeader: {
    padding: '16px 20px',
    background: '#1B4FD8',
  },
  summaryTitle: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
  },
  summaryBody: {
    padding: '20px',
  },
  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#6B7280',
    marginBottom: '8px',
    alignItems: 'center',
  },
  discountRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    color: '#059669',
    marginBottom: '8px',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    background: '#E5E7EB',
    margin: '12px 0',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#111827',
  },
  totalPrice: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1B4FD8',
  },
  totalSub: {
    fontSize: '12px',
    color: '#9CA3AF',
    marginTop: '2px',
    textAlign: 'right',
  },
  emptyMsg: {
    textAlign: 'center',
    color: '#9CA3AF',
    fontSize: '13px',
    padding: '20px 0',
  },
  resetBtn: {
    width: '100%',
    marginTop: '14px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #E5E7EB',
    background: '#F9FAFB',
    color: '#6B7280',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
}

export default function Calculator() {
  const navigate = useNavigate()
  const [internetEnabled, setInternetEnabled] = useState(false)
  const [phoneEnabled, setPhoneEnabled] = useState(false)
  const [tvEnabled, setTvEnabled] = useState(false)
  const [internetPlan, setInternetPlan] = useState(INTERNET_PLANS[0].id)
  const [phonePlan, setPhonePlan] = useState(PHONE_PLANS[0].id)
  const [tvPlan, setTvPlan] = useState(TV_PLANS[0].id)
  const [contract, setContract] = useState('none')

  const result = useMemo(() => {
    const selectedInternet = INTERNET_PLANS.find((p) => p.id === internetPlan)
    const selectedPhone = PHONE_PLANS.find((p) => p.id === phonePlan)
    const selectedTV = TV_PLANS.find((p) => p.id === tvPlan)
    const selectedContract = CONTRACT_OPTIONS.find((c) => c.id === contract)

    const baseTotal =
      (internetEnabled ? selectedInternet.price : 0) +
      (phoneEnabled ? selectedPhone.price : 0) +
      (tvEnabled ? selectedTV.price : 0)

    const bundle = getBundleDiscount(internetEnabled, phoneEnabled, tvEnabled)
    const bundleAmt = Math.round(baseTotal * bundle.rate / 100)
    const afterBundle = baseTotal - bundleAmt

    const contractAmt = Math.round(afterBundle * selectedContract.discount / 100)
    const finalTotal = afterBundle - contractAmt

    const items = []
    if (internetEnabled) items.push({ label: selectedInternet.name, price: selectedInternet.price })
    if (phoneEnabled) items.push({ label: selectedPhone.name, price: selectedPhone.price })
    if (tvEnabled) items.push({ label: selectedTV.name, price: selectedTV.price })

    return { items, baseTotal, bundle, bundleAmt, contractAmt, selectedContract, finalTotal }
  }, [internetEnabled, phoneEnabled, tvEnabled, internetPlan, phonePlan, tvPlan, contract])

  const reset = () => {
    setInternetEnabled(false)
    setPhoneEnabled(false)
    setTvEnabled(false)
    setInternetPlan(INTERNET_PLANS[0].id)
    setPhonePlan(PHONE_PLANS[0].id)
    setTvPlan(TV_PLANS[0].id)
    setContract('none')
  }

  const ToggleBox = ({ active, onToggle, color = '#1B4FD8' }) => (
    <div
      style={{
        ...s.sectionToggle,
        background: active ? color : 'transparent',
        borderColor: active ? color : '#D1D5DB',
      }}
      onClick={onToggle}
    >
      {active && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )

  const ServiceSection = ({ enabled, onToggle, title, emoji, plans, selected, onSelect }) => (
    <div style={s.section}>
      <div style={s.sectionHeader}>
        <ToggleBox active={enabled} onToggle={onToggle} />
        <span style={{ fontSize: '18px' }}>{emoji}</span>
        <span style={s.sectionTitle}>{title}</span>
        {enabled && (
          <span style={{ ...s.sectionBadge, background: '#EEF2FF', color: '#4338CA' }}>선택됨</span>
        )}
      </div>
      {enabled && (
        <div style={s.sectionBody}>
          {plans.map((plan) => (
            <div key={plan.id} style={s.planOption(selected === plan.id)} onClick={() => onSelect(plan.id)}>
              <div style={s.radioCircle(selected === plan.id)}>
                {selected === plan.id && <div style={s.radioDot} />}
              </div>
              <span style={s.planName(selected === plan.id)}>{plan.name}</span>
              <span style={s.planPrice(selected === plan.id)}>
                {plan.price.toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div style={s.container}>
      <style>{`.reset-btn:hover { background: #F3F4F6 !important; color: #374151 !important; }`}</style>
      <header style={s.header}>
        <button style={s.backBtn} onClick={() => navigate('/')}>← 홈</button>
        <span style={s.headerTitle}>유선 간편 요금계산기</span>
      </header>

      <div style={s.body}>
        <div style={s.leftPanel}>
          <ServiceSection
            enabled={internetEnabled}
            onToggle={() => setInternetEnabled((v) => !v)}
            title="인터넷"
            emoji="🌐"
            plans={INTERNET_PLANS}
            selected={internetPlan}
            onSelect={setInternetPlan}
          />
          <ServiceSection
            enabled={phoneEnabled}
            onToggle={() => setPhoneEnabled((v) => !v)}
            title="집전화"
            emoji="📞"
            plans={PHONE_PLANS}
            selected={phonePlan}
            onSelect={setPhonePlan}
          />
          <ServiceSection
            enabled={tvEnabled}
            onToggle={() => setTvEnabled((v) => !v)}
            title="IPTV"
            emoji="📺"
            plans={TV_PLANS}
            selected={tvPlan}
            onSelect={setTvPlan}
          />

          <div style={s.section}>
            <div style={s.sectionHeader}>
              <span style={{ fontSize: '18px' }}>📋</span>
              <span style={s.sectionTitle}>약정 기간</span>
            </div>
            <div style={s.sectionBody}>
              <div style={s.contractGrid}>
                {CONTRACT_OPTIONS.map((opt) => (
                  <div key={opt.id} style={s.contractOption(contract === opt.id)} onClick={() => setContract(opt.id)}>
                    <span style={s.contractLabel(contract === opt.id)}>{opt.label}</span>
                    <span style={s.contractDiscount(contract === opt.id)}>
                      {opt.discount > 0 ? `${opt.discount}% 추가 할인` : '할인 없음'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={s.rightPanel}>
          <div style={s.summaryCard}>
            <div style={s.summaryHeader}>
              <div style={s.summaryTitle}>요금 요약</div>
            </div>
            <div style={s.summaryBody}>
              {result.items.length === 0 ? (
                <div style={s.emptyMsg}>
                  서비스를 선택하면<br />요금이 계산됩니다.
                </div>
              ) : (
                <>
                  {result.items.map((item, idx) => (
                    <div key={idx} style={s.summaryRow}>
                      <span>{item.label}</span>
                      <span>{item.price.toLocaleString()}원</span>
                    </div>
                  ))}

                  {result.bundle.rate > 0 && (
                    <>
                      <div style={s.divider} />
                      <div style={s.summaryRow}>
                        <span>서비스 합계</span>
                        <span>{result.baseTotal.toLocaleString()}원</span>
                      </div>
                      <div style={s.discountRow}>
                        <span>🎁 {result.bundle.label} ({result.bundle.rate}%)</span>
                        <span>-{result.bundleAmt.toLocaleString()}원</span>
                      </div>
                    </>
                  )}

                  {result.selectedContract.discount > 0 && (
                    <div style={s.discountRow}>
                      <span>📋 {result.selectedContract.label} ({result.selectedContract.discount}%)</span>
                      <span>-{result.contractAmt.toLocaleString()}원</span>
                    </div>
                  )}

                  <div style={s.divider} />
                  <div style={s.totalRow}>
                    <span style={s.totalLabel}>월 납부 금액</span>
                    <span style={s.totalPrice}>{result.finalTotal.toLocaleString()}원</span>
                  </div>
                  <div style={s.totalSub}>부가세(VAT) 포함</div>
                </>
              )}

              <button className="reset-btn" style={s.resetBtn} onClick={reset}>
                초기화
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
