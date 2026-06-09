# Sales Desk Agent

영업 데스크 업무를 지원하는 AI 에이전트 웹 애플리케이션입니다. React + Vite 기반으로 구축되었으며, Dify API를 통해 AI 응답을 제공합니다.

## 주요 기능

- AI 기반 영업 지원 챗 인터페이스
- 추천 질문 카드 UI
- 유통망 손익 시뮬레이터
- RAG(문서 기반 검색) 지원

## 기술 스택

- **Frontend**: React 18, React Router 6
- **빌드 도구**: Vite 5
- **AI 백엔드**: Dify API

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 설정합니다.

```bash
VITE_DIFY_API_KEY=your_dify_api_key
VITE_DIFY_ENDPOINT=https://api.dify.ai/v1
```

> `.env.local` 및 관련 백업 파일은 `.gitignore`에 포함되어 저장소에 커밋되지 않습니다.

### 3. 개발 서버 실행

```bash
npm start
```

기본적으로 `http://localhost:3000` 에서 실행됩니다.

### 4. 프로덕션 빌드

```bash
npm run build      # dist/ 디렉토리에 빌드
npm run preview    # 빌드 결과 미리보기
```

## 프로젝트 구조

```
src/
├── App.jsx              # 메인 애플리케이션 컴포넌트
├── config.js            # Dify API 설정
├── main.jsx             # 엔트리 포인트
├── index.css            # 전역 스타일
├── data/
│   └── support-form.csv # 지원 양식 데이터
└── utils/
    └── ragLoader.js     # RAG 문서 로더
```

## 라이선스

사내 프로젝트 (SK broadband — team-marketeragent)
