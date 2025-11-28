# VentureSquare Round Table - GAS 백엔드 배포 가이드

## 📋 개요

이 가이드는 Google Apps Script(GAS) 백엔드를 Google Cloud에 배포하는 방법을 설명합니다.

---

## 🔧 1단계: Google Sheets 데이터베이스 생성

### 1.1 새 스프레드시트 생성
1. [Google Drive](https://drive.google.com) 접속
2. **새로 만들기** > **Google 스프레드시트** > **빈 스프레드시트**
3. 이름: `VS_Master_DB` (권장)

### 1.2 시트 구조 자동 생성
1. **확장 프로그램** > **Apps Script** 클릭
2. `sheets-setup/create_sheets_template.gs` 내용 붙여넣기
3. **실행** > `createAllSheets` 함수 실행
4. 권한 승인

### 1.3 스프레드시트 ID 복사
- URL에서 ID 확인: `https://docs.google.com/spreadsheets/d/{스프레드시트_ID}/edit`
- 또는 `getSpreadsheetId()` 함수 실행

---

## 📝 2단계: GAS 프로젝트 생성

### 2.1 새 Apps Script 프로젝트 생성
1. [script.google.com](https://script.google.com) 접속
2. **새 프로젝트** 클릭
3. 프로젝트 이름: `VentureSquare-RoundTable-API`

### 2.2 파일 생성 및 코드 복사

다음 순서로 파일을 생성하고 각 `.gs` 파일 내용을 복사합니다:

| 파일명 | 설명 |
|--------|------|
| `appsscript.json` | 프로젝트 설정 (보기 > 매니페스트 파일 표시 체크 후) |
| `Code.gs` | 메인 엔트리포인트 및 API 라우터 |
| `Config.gs` | 데이터베이스 연결 및 시스템 설정 헬퍼 |
| `DealRoom.gs` | 딜룸 데이터 관리 및 조회 |
| `UcanSign.gs` | NDA 전자서명 및 권한 관리 |
| `GeminiAnalyzer.gs` | AI 문서 분석 (선택) |

### 2.3 appsscript.json 설정

**보기** > **매니페스트 파일 표시** 체크 후 `appsscript.json` 내용 교체:

```json
{
  "timeZone": "Asia/Seoul",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8",
  "webapp": {
    "executeAs": "USER_DEPLOYING",
    "access": "ANYONE_ANONYMOUS"
  },
  "oauthScopes": [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
    "https://www.googleapis.com/auth/script.external_request",
    "https://www.googleapis.com/auth/script.send_mail",
    "https://www.googleapis.com/auth/chat.webhooks"
  ]
}
```

---

## ⚙️ 3단계: Script Properties 설정

### 3.1 프로젝트 설정 열기
1. **프로젝트 설정** (톱니바퀴 아이콘) 클릭
2. **스크립트 속성** 섹션에서 **스크립트 속성 추가** 클릭

### 3.2 필수 속성 추가

| 속성 이름 | 값 | 설명 |
|-----------|-----|------|
| `MASTER_DB_ID` | `{스프레드시트_ID}` | 1단계에서 복사한 ID |
| `GEMINI_API_KEY` | `{API_KEY}` | Google AI Studio에서 발급 |

### 3.3 선택 속성 (SMS/알림톡용 - 솔라피)

| 속성 이름 | 값 | 설명 |
|-----------|-----|------|
| `SOLAPI_API_KEY` | `{API_KEY}` | 솔라피 API 키 |
| `SOLAPI_API_SECRET` | `{SECRET}` | 솔라피 시크릿 |
| `SOLAPI_SENDER_PHONE` | `01012345678` | 발신번호 (사전등록 필요) |
| `SOLAPI_PF_ID` | `{CHANNEL_ID}` | 카카오 채널 ID (알림톡용) |

---

## 🗄️ 4단계: System_Config 시트 설정

Google Sheets의 `System_Config` 시트에서 다음 값들을 설정합니다:

| KEY | VALUE | 설명 |
|-----|-------|------|
| `UCANSIGN_API_KEY` | `{API_KEY}` | 유캔사인 API 키 |
| `UCANSIGN_API_SECRET` | `{SECRET}` | 유캔사인 시크릿 |
| `UCANSIGN_TEMPLATE_ID` | `{TEMPLATE_ID}` | NDA 템플릿 ID |
| `GOOGLE_CHAT_WEBHOOK` | `{WEBHOOK_URL}` | 운영 알림용 (선택) |
| `NDA_EXPIRY_DAYS` | `90` | NDA 유효 일수 |

---

## 🚀 5단계: 웹 앱 배포

### 5.1 배포 설정
1. **배포** > **새 배포** 클릭
2. **유형 선택**: ⚙️ (설정 아이콘) > **웹 앱** 선택

### 5.2 배포 옵션 설정

| 옵션 | 설정값 |
|------|--------|
| 설명 | `VentureSquare Round Table API v1.0` |
| 다음 사용자 인증 정보로 실행 | **나** (본인 계정) |
| 액세스 권한이 있는 사용자 | **모든 사용자** |

### 5.3 배포 완료
1. **배포** 버튼 클릭
2. 권한 승인 (첫 배포 시)
3. **웹 앱 URL** 복사 및 저장

```
예시: https://script.google.com/macros/s/AKfyc.../exec
```

---

## ✅ 6단계: 테스트

### 6.1 Health Check
브라우저에서 다음 URL 접속:
```
{웹_앱_URL}?action=health
```

예상 응답:
```json
{
  "success": true,
  "message": "Service is running",
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "service": "VS AI ERP - DealRoom API"
  }
}
```

### 6.2 딜 목록 조회 테스트
```
{웹_앱_URL}?action=getActiveDeals&page=1&pageSize=10
```

### 6.3 필터 옵션 조회 테스트
```
{웹_앱_URL}?action=getFilterOptions
```

---

## 🔗 7단계: 프론트엔드 연동

### 7.1 API URL 설정

프론트엔드 `public/static/app.js` 파일에서:

```javascript
// GAS API URL 설정
const API_BASE_URL = 'https://script.google.com/macros/s/AKfyc.../exec';
```

또는 환경변수로 주입:
```javascript
const API_BASE_URL = window.GAS_API_URL || '';
```

### 7.2 CORS 참고사항

GAS Web App은 기본적으로 CORS를 지원하지 않습니다.
프론트엔드에서는 다음 방법 중 하나를 사용:

1. **직접 호출** (Same Origin 또는 JSONP)
2. **Cloudflare Workers 프록시** (권장)
3. **API 게이트웨이** 사용

---

## 🔄 8단계: 트리거 설정

### 8.1 자동 트리거 설정
GAS 에디터에서 `initialize()` 함수를 한 번 실행하면 자동으로 트리거가 설정됩니다.

### 8.2 수동 트리거 설정 (필요시)
1. **트리거** (시계 아이콘) 클릭
2. **트리거 추가** 버튼
3. 설정:
   - 함수: `revokeExpiredNDAAccess`
   - 이벤트 소스: 시간 기반
   - 시간 기반 트리거 유형: 일별 타이머
   - 시간: 오전 1시~2시

---

## 📊 API 엔드포인트 요약

### GET 요청

| Action | 설명 | 필수 파라미터 |
|--------|------|---------------|
| `health` | 서비스 상태 확인 | - |
| `getActiveDeals` | 딜 목록 조회 | page, pageSize (선택) |
| `getDealDetail` | 딜 상세 조회 | dealId, email (선택) |
| `getFilterOptions` | 필터 옵션 목록 | - |
| `getRoundTable` | 라운드테이블 일정 | month, type (선택) |
| `getUserStatus` | 마이페이지 데이터 | email |
| `checkNDA` | NDA 상태 확인 | dealId, email |

### POST 요청

| Action | 설명 | Body 파라미터 |
|--------|------|---------------|
| `requestNDA` | NDA 서명 요청 | dealId, email, name, phone |
| `applyRoundTable` | 라운드테이블 신청 | rtId, email, name, purpose, feeRate |
| `signingWebhook` | 서명 완료 콜백 | (유캔사인에서 자동 호출) |

---

## 🛠️ 문제 해결

### 권한 오류 발생 시
1. GAS 에디터에서 **실행** > `testAllModules` 실행
2. 권한 승인 팝업에서 **고급** > **{프로젝트명}(으)로 이동** 클릭
3. **허용** 클릭

### 스프레드시트 연결 오류
1. Script Properties의 `MASTER_DB_ID` 확인
2. 스프레드시트 공유 설정 확인 (GAS 계정에 편집 권한 필요)

### 배포 후 변경사항 미반영
1. **배포** > **배포 관리** 클릭
2. **새 버전** 배포 (기존 URL 유지하려면 동일 배포 수정)

---

## 📞 지원

문제 발생 시 GitHub Issues 또는 운영팀에 문의해주세요.

- **서비스**: VentureSquare Round Table
- **버전**: 1.0.0
- **최종 업데이트**: 2024-11-28
