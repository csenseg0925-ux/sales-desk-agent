import { useState, useEffect, useRef } from "react";
import { DIFY_API_KEY, DIFY_ENDPOINT } from './config';

// ── 색상 시스템 ────────────────────────────────────────
const C = {
  bg: "#F4F6FB", white: "#FFFFFF", border: "#E4E8F2",
  primary: "#2563EB", primaryDark: "#1A4FCC", primaryLight: "#EFF4FF",
  teal: "#0D9488", tealLight: "#F0FDFA",
  purple: "#7C3AED", purpleLight: "#F5F3FF",
  red: "#DC2626", redLight: "#FEF2F2",
  green: "#16A34A", greenLight: "#F0FDF4",
  yellow: "#D97706", yellowLight: "#FFFBEB",
  text: "#0F172A", textSub: "#475569", textMuted: "#94A3B8",
  orange: "#EA580C", orangeLight: "#FFF7ED",
};

// ── 더미 사용자 DB ─────────────────────────────────────
const USERS = [
  { id: "SKB0001", password: "1234", name: "홍길동", dept: "영업1팀", email: "hong@skb.co.kr" },
  { id: "SKB0002", password: "1234", name: "김영희", dept: "영업2팀", email: "kim@skb.co.kr" },
  { id: "SKB0003", password: "1234", name: "이철수", dept: "대리점지원팀", email: "lee@skb.co.kr" },
];

// ── 더미 히스토리 DB ───────────────────────────────────
const DUMMY_HISTORY = {
  SKB0001: [
    { id: 1, date: "2026-05-18 14:23", category: "상품매뉴얼", question: "VAS통합상품 가입중단 일정이 어떻게 되나요?", answer: "2026년 3월 19일(목) 이후 신규 청약 및 변경이 불가합니다.", session: "S001" },
    { id: 2, date: "2026-05-18 14:25", category: "FAQ", question: "기존 VAS통합상품 가입자는 계속 이용 가능한가요?", answer: "네, 기존 가입자는 해당 서비스 모두 그대로 이용 가능합니다.", session: "S001" },
    { id: 3, date: "2026-05-17 10:11", category: "구비서류", question: "법인 신규 가입 시 필요 서류를 알려주세요.", answer: "사업자등록증, 법인인감증명서, 법인인감도장이 필요합니다.", session: "S002" },
    { id: 4, date: "2026-05-16 16:45", category: "업무매뉴얼", question: "인터넷 신규청약 절차를 알려주세요.", answer: "BizPortal 접속 → 유선청약 → 인터넷신규 → 고객정보입력 순으로 진행합니다.", session: "S003" },
  ],
  SKB0002: [
    { id: 1, date: "2026-05-18 09:30", category: "상품매뉴얼", question: "기가인터넷 요금제 종류를 알려주세요.", answer: "500M, 1G, 2.5G, 10G 4가지 종류가 있습니다.", session: "S004" },
  ],
  SKB0003: [],
};

// ── 보안: 우클릭/드래그/프린트 차단 ───────────────────
function useSecurity(isLoggedIn) {
  useEffect(() => {
    if (!isLoggedIn) return;
    const preventContext = (e) => e.preventDefault();
    const preventSelect = (e) => e.preventDefault();
    const preventPrint = () => window.print = () => {};
    document.addEventListener("contextmenu", preventContext);
    document.addEventListener("selectstart", preventSelect);
    document.addEventListener("dragstart", preventSelect);
    window.addEventListener("beforeprint", preventPrint);
    // 안드로이드 캡처 방지 (PWA 환경)
    if (document.documentElement.style) {
      document.documentElement.style.webkitUserSelect = "none";
      document.documentElement.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("contextmenu", preventContext);
      document.removeEventListener("selectstart", preventSelect);
      document.removeEventListener("dragstart", preventSelect);
      window.removeEventListener("beforeprint", preventPrint);
    };
  }, [isLoggedIn]);
}

// ── 워터마크 컴포넌트 ──────────────────────────────────
function Watermark({ user }) {
  if (!user) return null;
  const now = new Date().toLocaleString("ko-KR");
  const text = `${user.name} (${user.id}) | ${now}`;
  return (
    <div style={{
      position: "fixed", inset: 0, pointerEvents: "none",
      zIndex: 9999, overflow: "hidden",
    }}>
      {Array.from({ length: 8 }).map((_, row) =>
        Array.from({ length: 4 }).map((_, col) => (
          <div key={`${row}-${col}`} style={{
            position: "absolute",
            top: `${row * 130 + 60}px`,
            left: `${col * 280 - 40}px`,
            transform: "rotate(-25deg)",
            fontSize: 11,
            color: "rgba(0,0,0,0.06)",
            whiteSpace: "nowrap",
            fontWeight: 600,
            letterSpacing: "0.5px",
            userSelect: "none",
          }}>{text}</div>
        ))
      )}
    </div>
  );
}

// ── 로그인 화면 ────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [empId, setEmpId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [regId, setRegId] = useState("");
  const [regPw, setRegPw] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    setError("");
    if (!empId || !password) { setError("사번과 비밀번호를 입력해주세요."); return; }
    const user = USERS.find(u => u.id === empId && u.password === password);
    if (!user) { setError("사번 또는 비밀번호가 올바르지 않습니다."); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); onLogin(user); }, 800);
  }

  function handleEmailAuth() {
    if (!email) { setError("이메일을 입력해주세요."); return; }
    setSuccess("인증 메일이 발송되었습니다. 메일함을 확인해주세요.");
    setError("");
  }

  function handleRegister() {
    if (!regId || !regPw || !regName || !regEmail) {
      setError("모든 항목을 입력해주세요."); return;
    }
    setSuccess("회원가입 신청이 완료되었습니다. 관리자 승인 후 사용 가능합니다.");
    setError("");
    setTimeout(() => setTab("login"), 2000);
  }

  return (
    <div style={{
      minHeight: "100vh", background: `linear-gradient(135deg, #2D0059 0%, #6200CC 55%, #9B00FF 100%)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 20, fontFamily: "'Noto Sans KR', sans-serif",
      position: "relative", overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        input:focus { outline: none; }
        @media print { body { display: none; } }
      `}</style>

      {/* 배경 원형 장식 */}
      {[
        { size: 400, top: -100, left: -100, opacity: 0.06 },
        { size: 300, bottom: -80, right: -80, opacity: 0.08 },
        { size: 200, top: "40%", right: "10%", opacity: 0.05 },
      ].map((s, i) => (
        <div key={i} style={{
          position: "absolute", width: s.size, height: s.size,
          borderRadius: "50%", background: "white",
          opacity: s.opacity, top: s.top, left: s.left,
          bottom: s.bottom, right: s.right,
        }} />
      ))}

      <div style={{
        background: "rgba(255,255,255,0.97)", borderRadius: 24,
        padding: 40, width: "100%", maxWidth: 420,
        boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
        position: "relative", zIndex: 1,
      }}>
        {/* 로고 */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: "0 auto 12px",
            background: `linear-gradient(135deg, #6200CC, #9B00FF)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 26, boxShadow: `0 8px 20px #6200CC44`,
          }}>🛰️</div>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text }}>Sales Desk</div>
          <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>유선 영업 통합 지원 플랫폼</div>
        </div>

        {/* 탭 */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
          background: C.bg, borderRadius: 10, padding: 3, marginBottom: 24,
        }}>
          {[["login", "로그인"], ["email", "메일인증"], ["register", "회원가입"]].map(([id, label]) => (
            <button key={id} onClick={() => { setTab(id); setError(""); setSuccess(""); }}
              style={{
                background: tab === id ? C.white : "transparent",
                border: "none", borderRadius: 8, padding: "8px 4px",
                fontSize: 12, fontWeight: 600,
                color: tab === id ? C.primary : C.textMuted,
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: tab === id ? "0 1px 6px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}>{label}</button>
          ))}
        </div>

        {/* 로그인 탭 */}
        {tab === "login" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textSub, marginBottom: 6 }}>사번</div>
              <input value={empId} onChange={e => setEmpId(e.target.value)}
                placeholder="사번 입력 (예: SKB0000)"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{
                  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10,
                  padding: "11px 14px", fontSize: 14, color: C.text,
                  fontFamily: "inherit", background: C.bg,
                }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textSub, marginBottom: 6 }}>비밀번호</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{
                  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10,
                  padding: "11px 14px", fontSize: 14, color: C.text,
                  fontFamily: "inherit", background: C.bg,
                }} />
            </div>
            {error && <div style={{ fontSize: 12, color: C.red, background: C.redLight, borderRadius: 8, padding: "8px 12px" }}>{error}</div>}
            <button onClick={handleLogin} disabled={loading}
              style={{
                background: loading ? C.border : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
                border: "none", borderRadius: 10, padding: "13px",
                fontSize: 14, fontWeight: 700, color: "#fff",
                cursor: loading ? "default" : "pointer", fontFamily: "inherit",
                boxShadow: loading ? "none" : `0 4px 16px ${C.primary}44`,
                transition: "all 0.15s", marginTop: 4,
              }}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
            <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center" }}>
              테스트: SKB0001~SKB0003 / 비번: 1234
            </div>
          </div>
        )}

        {/* 메일 인증 탭 */}
        {tab === "email" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6, background: C.bg, borderRadius: 10, padding: 14 }}>
              SK브로드밴드의 파트너직원리스트에 등록된 인원에 한해 로그인 가능합니다.
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: C.textSub, marginBottom: 6 }}>이메일</div>
              <input value={email} onChange={e => setEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                style={{
                  width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10,
                  padding: "11px 14px", fontSize: 14, color: C.text,
                  fontFamily: "inherit", background: C.bg,
                }} />
            </div>
            {error && <div style={{ fontSize: 12, color: C.red, background: C.redLight, borderRadius: 8, padding: "8px 12px" }}>{error}</div>}
            {success && <div style={{ fontSize: 12, color: C.green, background: C.greenLight, borderRadius: 8, padding: "8px 12px" }}>{success}</div>}
            <button onClick={handleEmailAuth}
              style={{
                background: `linear-gradient(135deg, ${C.teal}, #0891B2)`,
                border: "none", borderRadius: 10, padding: "13px",
                fontSize: 14, fontWeight: 700, color: "#fff",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: `0 4px 16px ${C.teal}44`,
              }}>인증 메일 발송</button>
          </div>
        )}

        {/* 회원가입 탭 */}
        {tab === "register" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "사번", val: regId, set: setRegId, ph: "신규 사번 입력" },
              { label: "이름", val: regName, set: setRegName, ph: "이름 입력" },
              { label: "사내 이메일", val: regEmail, set: setRegEmail, ph: "example@skb.co.kr" },
              { label: "비밀번호", val: regPw, set: setRegPw, ph: "비밀번호 설정", type: "password" },
            ].map(({ label, val, set, ph, type }) => (
              <div key={label}>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.textSub, marginBottom: 5 }}>{label}</div>
                <input type={type || "text"} value={val} onChange={e => set(e.target.value)}
                  placeholder={ph}
                  style={{
                    width: "100%", border: `1.5px solid ${C.border}`, borderRadius: 10,
                    padding: "10px 14px", fontSize: 13, color: C.text,
                    fontFamily: "inherit", background: C.bg,
                  }} />
              </div>
            ))}
            {error && <div style={{ fontSize: 12, color: C.red, background: C.redLight, borderRadius: 8, padding: "8px 12px" }}>{error}</div>}
            {success && <div style={{ fontSize: 12, color: C.green, background: C.greenLight, borderRadius: 8, padding: "8px 12px" }}>{success}</div>}
            <button onClick={handleRegister}
              style={{
                background: `linear-gradient(135deg, ${C.purple}, #6D28D9)`,
                border: "none", borderRadius: 10, padding: "13px",
                fontSize: 14, fontWeight: 700, color: "#fff",
                cursor: "pointer", fontFamily: "inherit",
                boxShadow: `0 4px 16px ${C.purple}44`, marginTop: 4,
              }}>회원가입 신청</button>
            <div style={{ fontSize: 11, color: C.textMuted, textAlign: "center" }}>관리자 승인 후 사용 가능합니다</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── 히스토리 화면 ──────────────────────────────────────
function HistoryPage({ user, onBack }) {
  const history = DUMMY_HISTORY[user.id] || [];
  const [filter, setFilter] = useState("전체");
  const [selectedSession, setSelectedSession] = useState(null);
  const categories = ["전체", "상품매뉴얼", "업무매뉴얼", "구비서류", "공지사항", "세일즈콘텐츠", "FAQ"];

  const filtered = filter === "전체" ? history : history.filter(h => h.category === filter);

  const catColors = {
    "상품매뉴얼": { bg: C.primaryLight, color: C.primary },
    "업무매뉴얼": { bg: C.purpleLight, color: C.purple },
    "구비서류": { bg: C.tealLight, color: C.teal },
    "공지사항": { bg: C.orangeLight, color: C.orange },
    "세일즈콘텐츠": { bg: C.yellowLight, color: C.yellow },
    "FAQ": { bg: C.greenLight, color: C.green },
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 헤더 */}
      <div style={{
        background: C.white, borderBottom: `1px solid ${C.border}`,
        padding: "0 20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{
            background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "6px 12px", fontSize: 12, color: C.textSub,
            cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
          }}>← 홈</button>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>질의 히스토리</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{user.name} ({user.id}) · {user.dept}</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 12, color: C.textMuted }}>
            총 {history.length}건
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: 20 }}>
        {/* 카테고리 필터 */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              background: filter === cat ? C.primary : C.white,
              border: `1.5px solid ${filter === cat ? C.primary : C.border}`,
              borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600,
              color: filter === cat ? "#fff" : C.textSub,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
            }}>{cat}</button>
          ))}
        </div>

        {/* 히스토리 목록 */}
        {filtered.length === 0 ? (
          <div style={{
            background: C.white, borderRadius: 14, padding: 40,
            textAlign: "center", border: `1.5px solid ${C.border}`,
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
            <div style={{ fontSize: 14, color: C.textMuted }}>질의 히스토리가 없습니다</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(item => {
              const cc = catColors[item.category] || { bg: C.bg, color: C.textSub };
              const isOpen = selectedSession === item.id;
              return (
                <div key={item.id} onClick={() => setSelectedSession(isOpen ? null : item.id)}
                  style={{
                    background: C.white, borderRadius: 12, padding: "14px 16px",
                    border: `1.5px solid ${isOpen ? C.primary : C.border}`,
                    cursor: "pointer", transition: "all 0.15s",
                    boxShadow: isOpen ? `0 4px 16px ${C.primary}18` : "0 1px 4px rgba(0,0,0,0.04)",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isOpen ? 12 : 0 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, background: cc.bg, color: cc.color,
                      borderRadius: 6, padding: "2px 8px", flexShrink: 0,
                    }}>{item.category}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: C.text, flex: 1 }}>
                      {item.question}
                    </span>
                    <span style={{ fontSize: 11, color: C.textMuted, flexShrink: 0 }}>
                      {item.date}
                    </span>
                    <span style={{ fontSize: 11, color: C.textMuted }}>{isOpen ? "▲" : "▼"}</span>
                  </div>
                  {isOpen && (
                    <div style={{
                      background: C.bg, borderRadius: 8, padding: "10px 12px",
                      fontSize: 13, color: C.textSub, lineHeight: 1.7,
                      borderLeft: `3px solid ${C.primary}`,
                    }}>
                      {item.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 홈 화면 ───────────────────────────────────────────
function HomePage({ user, onNav, onLogout }) {
  const mvpCards = [
    {
      id: "ai", icon: "🤖", title: "AI 지원센터",
      desc: "AI 기반 상품·프로세스 안내",
      tags: ["상품매뉴얼", "업무매뉴얼", "FAQ"],
      gradient: "linear-gradient(135deg, #6200CC 0%, #9B00FF 100%)",
      shadow: "rgba(98, 0, 204, 0.15)",
      shadowHover: "rgba(98, 0, 204, 0.28)",
    },
    {
      id: "calc", icon: "📊", title: "유통망 손익 시뮬레이터",
      desc: "대리점/판매점 손익 구조 분석 및 시뮬레이션",
      tags: ["매출 분석", "손익 계산", "수수료", "목표 설정"],
      gradient: "linear-gradient(135deg, #0E9A6F 0%, #06B6D4 100%)",
      shadow: "rgba(14, 154, 111, 0.15)",
      shadowHover: "rgba(14, 154, 111, 0.28)",
    },
  ];

  const roadmapCards = [
    {
      id: "performance", icon: "📊", title: "실적 관리",
      desc: "대리점별 목표 및 실적 관리",
      color: "#0D9488", light: "#F0FDFA",
      iconGradient: "linear-gradient(135deg, #0D9488, #06B6D4)",
      tags: ["월별 실적", "목표 달성", "리포트"],
    },
    {
      id: "area", icon: "📍", title: "Area Marketing",
      desc: "지역 및 건물별 영업 정보 현황",
      color: "#EA580C", light: "#FFF7ED",
      iconGradient: "linear-gradient(135deg, #EA580C, #EC4899)",
      tags: ["상권 동향", "소상공인", "건물 정보"],
    },
    {
      id: "mart", icon: "🏪", title: "마트 운영 지원",
      desc: "유무선 마트 정책, 매뉴얼, FAQ",
      color: "#7C3AED", light: "#F5F3FF",
      iconGradient: "linear-gradient(135deg, #7C3AED, #A855F7)",
      tags: ["유무선 정책", "운영 매뉴얼", "FAQ"],
    },
  ];

  const historyCount = (DUMMY_HISTORY[user.id] || []).length;

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF", fontFamily: "'Noto Sans KR', sans-serif" }}>
      {/* 헤더 */}
      <div style={{
        background: C.white, borderBottom: `1px solid ${C.border}`,
        padding: "0 20px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "14px 0", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: `linear-gradient(135deg, ${C.primary}, ${C.teal})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>🛰️</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Sales Desk</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>유선 영업 통합 지원 플랫폼</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={() => onNav("history")} style={{
              background: C.primaryLight, border: `1px solid ${C.primary}33`,
              borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600,
              color: C.primary, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 5,
            }}>
              📋 히스토리 {historyCount > 0 && <span style={{
                background: C.primary, color: "#fff", borderRadius: "50%",
                width: 16, height: 16, fontSize: 10, display: "flex",
                alignItems: "center", justifyContent: "center",
              }}>{historyCount}</span>}
            </button>
            <div style={{
              background: C.bg, border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "6px 12px", fontSize: 12, color: C.textSub,
            }}>
              {user.name} · {user.dept}
            </div>
            <button onClick={onLogout} style={{
              background: "transparent", border: `1px solid ${C.border}`,
              borderRadius: 8, padding: "6px 12px", fontSize: 12,
              color: C.textMuted, cursor: "pointer", fontFamily: "inherit",
            }}>로그아웃</button>
          </div>
        </div>
      </div>

      {/* 메인 */}
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 20px" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 2 }}>
            안녕하세요, {user.name}님 👋
          </div>
          <div style={{ fontSize: 12, color: C.textMuted }}>오늘도 좋은 하루 되세요!</div>
        </div>

        {/* ✨ MVP 출시 기능 */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: "#111827", marginBottom: 20 }}>✨ MVP 출시 기능</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {mvpCards.map(card => (
              <div key={card.id} onClick={() => onNav(card.id === 'ai' ? 'ai' : 'coming-soon')}
                style={{
                  background: card.gradient, borderRadius: 24, padding: 32, minHeight: 280,
                  cursor: "pointer", transition: "all 0.25s ease",
                  boxShadow: `0 12px 40px ${card.shadow}`,
                  display: "flex", flexDirection: "column",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = `0 24px 60px ${card.shadowHover}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = `0 12px 40px ${card.shadow}`; }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: "rgba(255,255,255,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 28, marginBottom: 20,
                }}>{card.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{card.title}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.6, marginBottom: 20 }}>{card.desc}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 24 }}>
                  {card.tags.map(t => (
                    <span key={t} style={{
                      fontSize: 11, fontWeight: 600,
                      background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.95)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: 6, padding: "3px 10px",
                    }}>{t}</span>
                  ))}
                </div>
                <div style={{ marginTop: "auto" }}>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "rgba(255,255,255,0.2)", color: "#fff",
                    border: "1px solid rgba(255,255,255,0.35)",
                    borderRadius: 12, padding: "10px 20px", fontSize: 14, fontWeight: 600,
                  }}>바로가기 →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 🚀 로드맵 (개발 예정) */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: "#9CA3AF", marginBottom: 20 }}>🚀 로드맵 (개발 예정)</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            {roadmapCards.map(card => (
              <div key={card.id} onClick={() => onNav('coming-soon')}
                style={{
                  background: "#fff", borderRadius: 16, padding: 20, minHeight: 160,
                  border: "1px solid #E5E7EB", cursor: "pointer",
                  transition: "all 0.2s ease", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  opacity: 0.9, display: "flex", flexDirection: "column",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}22`; e.currentTarget.style.borderColor = `${card.color}55`; e.currentTarget.style.opacity = "1"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; e.currentTarget.style.borderColor = "#E5E7EB"; e.currentTarget.style.opacity = "0.9"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: card.iconGradient,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0,
                  }}>{card.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#374151" }}>{card.title}</div>
                </div>
                <div style={{ fontSize: 12, color: "#9CA3AF", lineHeight: 1.6 }}>{card.desc}</div>
                <div style={{ marginTop: "auto", paddingTop: 12, textAlign: "right", fontSize: 13, color: "#D1D5DB" }}>→</div>
              </div>
            ))}
          </div>
        </div>

        {/* 공지 배너 */}
        <div style={{
          background: C.yellowLight, border: `1.5px solid ${C.yellow}44`,
          borderRadius: 12, padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 10,
        }}>
          <span style={{ fontSize: 14 }}>📢</span>
          <span style={{ fontSize: 12, color: C.yellow, fontWeight: 700, flexShrink: 0 }}>긴급공지</span>
          <span style={{ fontSize: 12, color: C.text }}>
            기가인터넷 10G 설치비 한시 면제 (5월말까지) · BizPortal 일요일 02~04시 정기점검
          </span>
        </div>
      </div>
    </div>
  );
}

// ── AI 지원센터 ────────────────────────────────────────
const AI_CATS = [
  { id: "all", label: "전체", icon: "💬" },
  { id: "product", label: "상품매뉴얼", icon: "📦" },
  { id: "work", label: "업무매뉴얼", icon: "📋" },
  { id: "doc", label: "구비서류", icon: "📄" },
  { id: "notice", label: "공지사항", icon: "📢" },
  { id: "sales", label: "세일즈콘텐츠", icon: "💡" },
  { id: "faq", label: "FAQ", icon: "❓" },
];

const QUICK = {
  all: [
    { label: "VAS통합상품 가입중단 일정", q: "VAS통합상품 가입중단 일정이 언제인가요?" },
    { label: "인터넷 신규청약 절차", q: "인터넷 신규청약 절차를 알려주세요." },
    { label: "결합 할인 구조", q: "인터넷+전화+IPTV 결합 할인을 알려주세요." },
    { label: "개인 신규 가입 서류", q: "개인 신규 가입 시 필요한 서류를 알려주세요." },
  ],
  product: [
    { label: "VAS통합상품 요금표", q: "VAS통합상품 상품별 요금표를 알려주세요." },
    { label: "기가인터넷 라인업", q: "기가인터넷 상품 종류와 요금을 알려주세요." },
    { label: "IPTV 상품 비교", q: "IPTV 베이직/스탠다드/프리미엄 차이를 알려주세요." },
    { label: "모두안심 인터넷 기능", q: "모두안심 인터넷 기능을 타사와 비교해서 알려주세요." },
  ],
  work: [
    { label: "신규청약 절차", q: "유선 신규청약 전체 프로세스를 알려주세요." },
    { label: "개통 취소 방법", q: "개통 완료 후 취소 처리는 어떻게 하나요?" },
    { label: "명의변경 절차", q: "명의변경 절차와 필요 서류를 알려주세요." },
    { label: "주소이전 처리", q: "고객 이사 시 주소이전 처리 방법을 알려주세요." },
  ],
  doc: [
    { label: "개인 신규 서류", q: "개인 신규 가입 시 필요 서류를 알려주세요." },
    { label: "법인 신규 서류", q: "법인 신규 가입 시 필요 서류를 알려주세요." },
    { label: "명의변경 서류", q: "명의변경에 필요한 서류를 알려주세요." },
    { label: "번호이동 서류", q: "인터넷전화 번호이동 시 필요 서류를 알려주세요." },
  ],
  notice: [
    { label: "현재 프로모션", q: "현재 진행 중인 프로모션을 알려주세요." },
    { label: "BizPortal 점검", q: "BizPortal 정기 점검 일정을 알려주세요." },
    { label: "VAS통합상품 중단", q: "VAS통합상품 가입중단 공지 내용을 알려주세요." },
    { label: "최신 업무 변경", q: "최근 업무 지침 변경사항을 알려주세요." },
  ],
  sales: [
    { label: "인터넷 업셀 멘트", q: "인터넷 업그레이드 권유 세일즈톡을 알려주세요." },
    { label: "IPTV 추가 제안", q: "IPTV 추가 가입 제안 세일즈톡을 알려주세요." },
    { label: "결합 제안 멘트", q: "이동통신 결합 할인 안내 세일즈톡을 알려주세요." },
    { label: "약정 권유 멘트", q: "장기 약정 가입 권유 세일즈톡을 알려주세요." },
  ],
  faq: [
    { label: "기존 VAS 가입자 이용 가능?", q: "VAS통합상품 가입중단 후 기존 가입자는 계속 이용 가능한가요?" },
    { label: "기가와이파이7 VAS 신청?", q: "기가와이파이7 상품도 VAS통합상품 신청 가능한가요?" },
    { label: "WiFi 없는 VAS 출시?", q: "WiFi 기본제공 없는 VAS통합상품은 출시 안 되나요?" },
    { label: "개통 취소 가능 기간?", q: "개통 완료 후 취소 가능한 기간이 얼마나 되나요?" },
  ],
};

// SYSTEM_PROMPT 제거됨 — 프롬프트/지식은 Dify 내부에서 처리

function parseAiResponse(text) {
  const parts = text.split(/\n---\n|\n---$/)
  if (parts.length < 2) return { mainText: text, suggestedQuestions: [] }
  const mainText = parts[0].trim()
  const footer = parts.slice(1).join("\n")
  const questions = []
  for (const line of footer.split("\n")) {
    const match = line.match(/^\s*\d+\.\s+(.+)$/)
    if (match) questions.push(match[1].trim())
  }
  return { mainText, suggestedQuestions: questions }
}

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: 7, height: 7, borderRadius: "50%", background: C.primary,
          animation: `bounce 1.2s ease-in-out ${i*0.2}s infinite`,
        }} />
      ))}
      <style>{`@keyframes bounce{0%,60%,100%{transform:translateY(0);opacity:0.4}30%{transform:translateY(-7px);opacity:1}}`}</style>
    </div>
  );
}

function AICenterPage({ user, onBack }) {
  const [activeCat, setActiveCat] = useState("all");
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: `안녕하세요, ${user.name}님! Sales Desk AI Agent입니다 👋\n\n상품 매뉴얼, 업무 절차, 구비 서류 등 무엇이든 질문해 주세요.`,
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  async function send(text) {
    const q = text || input.trim();
    if (!q || loading) return;
    setInput("");
    const updated = [...messages, { role: "user", content: q }];
    setMessages(updated);
    setLoading(true);
    try {
      const res = await fetch(`${DIFY_ENDPOINT}/chat-messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DIFY_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {},
          query: q,
          user: user.id,
          response_mode: "blocking",
          conversation_id: "",
        }),
      });
      const data = await res.json();
      const raw = data.answer || "응답 오류";
      const { mainText, suggestedQuestions } = parseAiResponse(raw);
      setMessages(prev => [...prev, { role: "assistant", content: mainText, suggestedQuestions }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ 네트워크 오류가 발생했습니다." }]);
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{
        background: C.white, borderBottom: `1px solid ${C.border}`,
        padding: "0 16px", position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 8px rgba(0,0,0,0.05)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "12px 0", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={onBack} style={{
            background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "6px 12px", fontSize: 12, color: C.textSub,
            cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
          }}>← 홈</button>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: `linear-gradient(135deg, ${C.primary}, ${C.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>🤖</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>AI 지원센터</div>
            <div style={{ fontSize: 11, color: C.primary, fontWeight: 600 }}>● 실시간 업무 지원 중</div>
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: C.textMuted }}>{user.name} ({user.id})</div>
        </div>
        <div style={{ maxWidth: 900, margin: "0 auto", paddingBottom: 10, display: "flex", gap: 6, overflowX: "auto" }}>
          {AI_CATS.map(cat => (
            <button key={cat.id} onClick={() => setActiveCat(cat.id)} style={{
              background: activeCat === cat.id ? C.primary : C.bg,
              border: `1.5px solid ${activeCat === cat.id ? C.primary : C.border}`,
              borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600,
              color: activeCat === cat.id ? "#fff" : C.textSub,
              cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
              transition: "all 0.15s",
            }}>{cat.icon} {cat.label}</button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, maxWidth: 900, width: "100%", margin: "0 auto", padding: "16px 16px 0", overflowY: "auto" }}>
        <style>{`
          .sq-card:hover {
            border-color: ${C.primary} !important;
            color: ${C.primary} !important;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(37,99,235,0.12) !important;
          }
          @media (min-width: 600px) {
            .sq-grid { flex-direction: row !important; }
            .sq-grid .sq-card { flex: 1; }
          }
        `}</style>
        {messages.map((m, i) => {
          const isUser = m.role === "user";
          return (
            <div key={i} style={{ display: "flex", flexDirection: isUser ? "row-reverse" : "row", alignItems: "flex-end", gap: 8, marginBottom: 14 }}>
              {!isUser && <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${C.primary}, ${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>🤖</div>}
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{
                  background: isUser ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` : C.white,
                  border: isUser ? "none" : `1px solid ${C.border}`,
                  borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  padding: "10px 14px", color: isUser ? "#fff" : C.text,
                  fontSize: 13.5, lineHeight: 1.75, whiteSpace: "pre-wrap",
                  boxShadow: isUser ? `0 4px 14px ${C.primary}44` : "0 2px 8px rgba(0,0,0,0.05)",
                }}>{m.content}</div>
                {!isUser && m.suggestedQuestions?.length > 0 && (
                  <div style={{ background: "#FAFBFF", border: `1px solid ${C.border}`, borderRadius: 12, padding: "10px 12px" }}>
                    <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, marginBottom: 8 }}>💡 이런 것도 궁금하신가요?</div>
                    <div className="sq-grid" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {m.suggestedQuestions.map((q, qi) => (
                        <button key={qi} className="sq-card" onClick={() => send(q)} disabled={loading} style={{
                          display: "flex", alignItems: "center", gap: 7,
                          background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
                          padding: "8px 12px", fontSize: 12.5, color: C.textSub,
                          cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                          transition: "all 0.15s", lineHeight: 1.4,
                        }}>
                          <span style={{ flexShrink: 0 }}>💬</span>
                          <span>{q}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 14 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: `linear-gradient(135deg, ${C.primary}, ${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
            <div style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: "18px 18px 18px 4px", padding: "10px 14px" }}><TypingDots /></div>
          </div>
        )}
        {messages.length <= 2 && (
          <div style={{ marginTop: 4, marginBottom: 16 }}>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, marginBottom: 8 }}>자주 묻는 질문</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 7 }}>
              {(QUICK[activeCat] || QUICK.all).map((qq, i) => (
                <button key={i} onClick={() => send(qq.q)} style={{
                  background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 10,
                  padding: "9px 12px", textAlign: "left", cursor: "pointer",
                  fontFamily: "inherit", fontSize: 12, color: C.textSub, fontWeight: 500,
                  transition: "all 0.15s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.primary; e.currentTarget.style.color = C.primary; e.currentTarget.style.background = C.primaryLight; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.textSub; e.currentTarget.style.background = C.white; }}>
                  {qq.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} style={{ height: 16 }} />
      </div>

      <div style={{ background: C.white, borderTop: `1px solid ${C.border}`, padding: "12px 16px", boxShadow: "0 -2px 10px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 10, alignItems: "flex-end" }}>
          <div style={{ flex: 1, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 14, padding: "9px 14px" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="질문을 입력하세요... (Enter 전송)"
              rows={1} style={{
                width: "100%", background: "transparent", border: "none",
                color: C.text, fontSize: 13.5, lineHeight: 1.6,
                fontFamily: "inherit", maxHeight: 100, overflow: "auto", resize: "none", outline: "none",
              }}
              onInput={e => { e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 100) + "px"; }} />
          </div>
          <button onClick={() => send()} disabled={!input.trim() || loading} style={{
            width: 42, height: 42, borderRadius: 12, fontSize: 18,
            background: input.trim() && !loading ? `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})` : C.border,
            border: "none", cursor: input.trim() && !loading ? "pointer" : "default",
            color: input.trim() && !loading ? "#fff" : C.textMuted,
            transition: "all 0.15s", flexShrink: 0,
          }}>↑</button>
        </div>
      </div>
    </div>
  );
}

// ── 구현 중 페이지 ──────────────────────────────────────
function ComingSoonPage({ onBack }) {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Noto Sans KR', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1F36", marginBottom: 20 }}>현재 해당 기능은 구현 중에 있습니다.</div>
        <button onClick={onBack} style={{
          background: C.teal, border: "none", borderRadius: 10, padding: "10px 20px",
          fontSize: 13, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit",
        }}>← 홈으로</button>
      </div>
    </div>
  );
}

// ── 메인 앱 ────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);

  useSecurity(!!user);

  function handleLogin(u) {
    setUser(u);
    setPage("home");
  }

  function handleLogout() {
    setUser(null);
    setPage("login");
  }

  return (
    <>
      <Watermark user={user} />
      {page === "login" && <LoginPage onLogin={handleLogin} />}
      {page === "home" && user && <HomePage user={user} onNav={setPage} onLogout={handleLogout} />}
      {page === "ai" && user && <AICenterPage user={user} onBack={() => setPage("home")} />}
      {page === "history" && user && <HistoryPage user={user} onBack={() => setPage("home")} />}
      {page === "coming-soon" && user && <ComingSoonPage onBack={() => setPage("home")} />}
    </>
  );
}
