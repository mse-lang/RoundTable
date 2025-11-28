# VS AI ERP - 팩트시트 데이터룸

AI 기반 투자심사 분석과 NDA 보호 시스템을 통한 안전한 딜소싱 플랫폼

## 프로젝트 개요

- **Name**: VS AI ERP 팩트시트 데이터룸
- **Goal**: 스타트업 투자 자료를 AI로 분석하여 투자심사보고서를 자동 생성하고, NDA 기반 안전한 열람 환경 제공
- **Features**: 
  - AI 투자심사보고서 자동 생성 (Gemini 1.5 Pro)
  - UcanSign 기반 휴대폰 본인인증 NDA 서명
  - 서명 완료 시 Google Drive 폴더 자동 권한 부여
  - O2O 라운드테이블 매칭 (투자자-창업자)

## 기술 스택

| Layer | Technology |
|-------|------------|
| **Frontend** | Hono + TypeScript + TailwindCSS |
| **Backend** | Google Apps Script |
| **Database** | Google Sheets (VS_Master_DB) |
| **Auth/NDA** | UcanSign API (휴대폰 본인인증) |
| **AI** | Gemini 1.5 Pro |
| **Notification** | Solapi (SMS/Kakao), Google Chat Webhook |
| **Deploy** | Cloudflare Pages |

## 프로젝트 구조

```
webapp/
├── frontend/                    # Hono 프론트엔드
│   ├── src/
│   │   ├── index.tsx           # 메인 라우터 (/, /deal/:id, /round-table, /my-page)
│   │   ├── renderer.tsx        # JSX 렌더러
│   │   └── components/         # UI 컴포넌트
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── DealCard.tsx
│   │       └── NDAModal.tsx
│   ├── public/static/
│   │   ├── app.js              # 프론트엔드 로직
│   │   └── style.css           # 커스텀 스타일
│   └── ecosystem.config.cjs    # PM2 설정
│
└── gas/                         # Google Apps Script 백엔드
    ├── Code.gs                  # API 라우터 (doGet/doPost)
    ├── Config.gs                # DB 연결 및 설정 헬퍼
    ├── UcanSign.gs              # NDA 전자서명 처리
    ├── DealRoom.gs              # 딜룸/라운드테이블 관리
    ├── GeminiAnalyzer.gs        # AI 문서 분석
    └── sheets-setup/            # DB 설정 가이드
```

## 주요 페이지

| 경로 | 설명 | 접근 |
|------|------|------|
| `/` | 딜룸 메인 (딜 목록) | Public |
| `/deal/:id` | 딜 상세 (티저) | Public |
| `/deal/:id` (Full) | 딜 상세 (전체) | NDA Signed |
| `/round-table` | 라운드테이블 캘린더 | Public |
| `/my-page` | 마이페이지 (NDA/참가 현황) | Logged In |

## API 엔드포인트 (GAS)

### GET Actions
| Action | Parameters | Description |
|--------|------------|-------------|
| `getActiveDeals` | - | 활성 딜 목록 조회 |
| `getDealDetail` | `dealId`, `email` | 딜 상세 (NDA 검증) |
| `getFilterOptions` | - | 필터 옵션 |
| `getRoundTable` | `month`, `year` | 라운드테이블 일정 |
| `getUserStatus` | `email` | 사용자 NDA/참가 현황 |
| `checkNDA` | `dealId`, `email` | NDA 상태 확인 |
| `health` | - | 서버 상태 체크 |

### POST Actions
| Action | Parameters | Description |
|--------|------------|-------------|
| `requestNDA` | `dealId`, `name`, `email`, `phone` | NDA 서명 요청 |
| `signingWebhook` | UcanSign payload | 서명 완료 웹훅 |
| `applyRoundTable` | `rtId`, `name`, `email`, `purpose` | 라운드테이블 참가 신청 |
| `analyzeDeal` | `dealId`, `folderId` | AI 문서 분석 |

## 데이터 모델

### TB_DEAL_ROOM
| Column | Description |
|--------|-------------|
| DEAL_ID | 딜 고유 ID |
| Company_Name | 회사명 (비공개) |
| Industry | 업종 |
| Deal_Type | 투자유치/매각/M&A |
| Summary | 티저 요약 |
| Revenue_Range | 매출 구간 |
| Target_Valuation | 희망 밸류에이션 |
| Private_Folder_ID | 전체 자료 폴더 |
| Public_Folder_ID | 티저 폴더 |
| Stage | Active/Closed/Draft |

### TB_NDA_REQ
| Column | Description |
|--------|-------------|
| NDA_ID | NDA 요청 ID |
| DEAL_ID | 대상 딜 |
| User_Email | 사용자 이메일 |
| User_Name | 사용자 이름 |
| User_Phone | 사용자 전화번호 |
| Status | Pending/Signed/Expired |
| Signed_At | 서명 완료 시각 |
| Expiry_Date | 만료일 |

### TB_ROUND_TABLE
| Column | Description |
|--------|-------------|
| RT_ID | 라운드테이블 ID |
| Type | Public/Private |
| Date_Time | 일시 |
| Location | 장소 |
| Max_Participants | 최대 인원 |
| Available_Slots | 잔여 좌석 |

## NDA 보안 플로우

```
[사용자] → [NDA 요청] → [UcanSign API 호출]
                            ↓
[사용자] ← [휴대폰 본인인증 SMS]
                            ↓
[서명 완료] → [Webhook 수신] → [Google Drive 권한 부여]
                            ↓
[사용자] → [상세 자료 열람 가능]
```

## 개발 환경 실행

```bash
# Frontend
cd frontend
npm install
npm run build
pm2 start ecosystem.config.cjs

# 확인
curl http://localhost:3000
```

## 환경 변수 (GAS Script Properties)

| Key | Description |
|-----|-------------|
| `MASTER_DB_ID` | Google Sheets ID |
| `GEMINI_API_KEY` | Gemini API Key |
| `SOLAPI_API_KEY` | Solapi API Key |
| `SOLAPI_API_SECRET` | Solapi API Secret |
| `SOLAPI_SENDER_PHONE` | 발신 번호 |
| `SOLAPI_SENDER_NAME` | 발신자명 |
| `SOLAPI_PF_ID` | 카카오 채널 ID |
| `PUBLIC_DATA_KEY` | 공공데이터 API Key |

## 완료된 기능

- [x] GAS 백엔드 모듈 (Code.gs, Config.gs, UcanSign.gs, DealRoom.gs)
- [x] Gemini AI 문서 분석 모듈 (GeminiAnalyzer.gs)
- [x] Solapi SMS/알림톡 연동
- [x] Google Sheets DB 설정 자동화
- [x] 프론트엔드 UI (딜룸, 딜 상세, 라운드테이블, 마이페이지)
- [x] NDA 서명 모달

## 다음 단계

- [ ] GAS Web App 배포 및 프론트엔드 API 연동
- [ ] Cloudflare Pages 배포
- [ ] UcanSign 실제 연동 테스트
- [ ] 딜 등록 페이지 구현

## 배포 상태

| Service | Status | URL |
|---------|--------|-----|
| Frontend (Dev) | Running | `https://3000-ig1cko3y6z8mltleju0n6-b237eb32.sandbox.novita.ai` |
| GAS Backend | Pending | - |
| Production | Pending | - |

---

**Last Updated**: 2024-11-28
