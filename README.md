# VentureSquare Round Table

스타트업 딜소싱 및 투자자 매칭 플랫폼

## 📌 프로젝트 개요

- **서비스명**: VentureSquare Round Table
- **목표**: 스타트업과 투자자를 연결하는 O2O 딜소싱 플랫폼
- **주요 기능**: 딜룸, 라운드테이블, NDA 전자서명, 마이페이지

## 🔗 URLs

### 프론트엔드
- **로컬 개발**: https://3000-ig1cko3y6z8mltleju0n6-b237eb32.sandbox.novita.ai
- **프로덕션**: (Cloudflare 배포 후 업데이트)

### 백엔드 (GAS)
- **API URL**: (GAS 배포 후 업데이트)
- **배포 가이드**: `/gas/DEPLOYMENT_GUIDE.md`

## ✅ 완료된 기능

### 프론트엔드
- [x] 딜룸 메인 페이지 (`/`) - 딜 목록, 필터링
- [x] 딜 상세 페이지 (`/deal/:id`) - 티저/풀리포트 구분
- [x] 라운드테이블 페이지 (`/round-table`) - 캘린더, 일정 목록
- [x] 마이페이지 (`/my-page`) - NDA/라운드테이블 신청 현황
- [x] NDA 서명 요청 모달 (유캔사인 연동 준비)
- [x] Dark Theme + Glassmorphism 디자인
- [x] 반응형 레이아웃 (모바일/데스크톱)
- [x] VentureSquare 공식 로고 적용

### 백엔드 (GAS)
- [x] API 라우터 (`Code.gs`) - doGet/doPost 핸들러
- [x] 딜룸 모듈 (`DealRoom.gs`) - 딜 목록/상세 조회
- [x] NDA 모듈 (`UcanSign.gs`) - 전자서명, 권한 관리
- [x] 설정 모듈 (`Config.gs`) - DB 연결, 유틸리티
- [x] AI 분석 모듈 (`GeminiAnalyzer.gs`) - Gemini 문서 분석
- [x] 시트 생성 스크립트 (`create_sheets_template.gs`)

## 📋 API 엔드포인트

### GET 요청
| Action | 설명 |
|--------|------|
| `health` | 서비스 상태 확인 |
| `getActiveDeals` | 딜 목록 조회 |
| `getDealDetail` | 딜 상세 조회 |
| `getFilterOptions` | 필터 옵션 목록 |
| `getRoundTable` | 라운드테이블 일정 |
| `getUserStatus` | 마이페이지 데이터 |
| `checkNDA` | NDA 상태 확인 |

### POST 요청
| Action | 설명 |
|--------|------|
| `requestNDA` | NDA 서명 요청 |
| `applyRoundTable` | 라운드테이블 신청 |
| `signingWebhook` | 유캔사인 콜백 |

## 📁 프로젝트 구조

```
webapp/
├── frontend/                  # Hono + TypeScript 프론트엔드
│   ├── src/
│   │   ├── index.tsx          # 라우트 정의
│   │   ├── renderer.tsx       # HTML 렌더러
│   │   └── components/        # UI 컴포넌트
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── DealCard.tsx
│   │       └── NDAModal.tsx
│   ├── public/static/         # 정적 파일
│   │   ├── app.js             # 프론트엔드 로직
│   │   ├── style.css          # 커스텀 CSS
│   │   └── vs-logo.png        # 로고 이미지
│   ├── wrangler.jsonc
│   ├── package.json
│   └── ecosystem.config.cjs   # PM2 설정
│
├── gas/                       # Google Apps Script 백엔드
│   ├── Code.gs                # API 라우터
│   ├── Config.gs              # 설정 및 유틸리티
│   ├── DealRoom.gs            # 딜룸 로직
│   ├── UcanSign.gs            # NDA 서명 관리
│   ├── GeminiAnalyzer.gs      # AI 분석
│   ├── appsscript.json        # GAS 설정
│   ├── DEPLOYMENT_GUIDE.md    # 배포 가이드
│   └── sheets-setup/          # DB 시트 생성 스크립트
│
└── README.md
```

## 🗄️ 데이터 모델

### Google Sheets 구조
| 시트명 | 설명 |
|--------|------|
| `TB_DEAL_ROOM` | 딜 정보 |
| `TB_NDA_REQ` | NDA 요청 기록 |
| `TB_ROUND_TABLE` | 라운드테이블 일정 |
| `TB_RT_APPLICATION` | 라운드테이블 신청 |
| `System_Config` | 시스템 설정값 |

### 외부 연동
- **유캔사인**: 휴대폰 본인인증 기반 NDA 전자서명
- **솔라피**: SMS/알림톡 발송 (선택)
- **Google Drive**: 데이터룸 폴더 권한 관리
- **Gemini AI**: 투자심사보고서 자동 생성

## 🚀 배포 절차

### 1. GAS 백엔드 배포
상세 가이드: `/gas/DEPLOYMENT_GUIDE.md`

1. Google Sheets 데이터베이스 생성
2. GAS 프로젝트 생성 및 코드 배포
3. Script Properties 설정
4. Web App 배포
5. API URL 복사

### 2. 프론트엔드 API 연동
```javascript
// frontend/public/static/app.js
const API_BASE_URL = 'https://script.google.com/macros/s/{your-deployment-id}/exec';
```

### 3. Cloudflare Pages 배포
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name venturesquare-roundtable
```

## 📱 사용 가이드

### 투자자
1. **딜룸** 접속 → 관심 딜 탐색
2. **티저 보기** → 공개 정보 확인
3. **상세 열람** → NDA 서명 요청
4. 카카오톡으로 본인인증 후 서명
5. 데이터룸 접근 권한 획득

### 스타트업
1. **딜 등록** → 정보 입력
2. AI가 투자심사보고서 자동 생성
3. **라운드테이블** 참가 신청
4. 투자자 미팅

## 📊 기술 스택

| 구분 | 기술 |
|------|------|
| **Frontend** | Hono, TypeScript, TailwindCSS, Lucide Icons |
| **Backend** | Google Apps Script |
| **Database** | Google Sheets |
| **AI** | Gemini API |
| **전자서명** | 유캔사인 |
| **배포** | Cloudflare Pages |

## ⏳ 미구현 기능

- [ ] 딜 등록 폼 (`/register`)
- [ ] Google OAuth 로그인
- [ ] 이메일 알림 시스템
- [ ] 관리자 대시보드
- [ ] 실시간 알림 (WebSocket)

## 🛠️ 개발 명령어

```bash
# 프론트엔드 개발
cd frontend
npm run build
pm2 start ecosystem.config.cjs
pm2 logs vs-erp-frontend --nostream

# 테스트
curl http://localhost:3000
curl http://localhost:3000/api/hello
```

## 📞 문의

- **운영**: VentureSquare
- **이메일**: contact@venturesquare.net
- **최종 업데이트**: 2024-11-28
