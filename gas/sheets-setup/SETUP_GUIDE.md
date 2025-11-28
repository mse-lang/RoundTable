# VS AI ERP - Google Sheets 데이터베이스 설정 가이드

## 📋 개요

VS AI ERP 팩트시트 데이터룸의 데이터베이스로 사용될 Google Sheets를 설정하는 가이드입니다.

---

## 1단계: 스프레드시트 생성

1. [Google Sheets](https://sheets.google.com) 접속
2. **빈 스프레드시트** 생성
3. 파일명을 `VS_Master_DB`로 변경
4. **스프레드시트 ID 복사** (URL에서 확인)
   ```
   https://docs.google.com/spreadsheets/d/[이 부분이 ID]/edit
   ```

---

## 2단계: 시트 생성

아래 5개의 시트를 생성하세요:

| 시트명 | 용도 |
|--------|------|
| `TB_DEAL_ROOM` | 딜 & 데이터룸 관리 |
| `TB_NDA_REQ` | NDA 및 접근 권한 |
| `TB_ROUND_TABLE` | 라운드 테이블 일정 |
| `TB_RT_APPLICATION` | 참가 신청 및 수수료 확약 |
| `System_Config` | 시스템 설정 (API 키 등) |

---

## 3단계: 각 시트 헤더 설정

### 📊 TB_DEAL_ROOM (딜 관리)

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DEAL_ID | COM_ID | Industry | Deal_Type | Summary | Full_Description | Revenue_Range | Target_Valuation | Stage | Folder_ID_Private | Folder_ID_Public | Teaser_Link | Full_Report_Link | Contact_Person | Created_At | Updated_At |

### 📊 TB_NDA_REQ (NDA 요청)

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| REQ_ID | DEAL_ID | User_Email | User_Name | User_Phone | Doc_ID | Status | Access_Expiry | Signed_At | Created_At | Updated_At |

### 📊 TB_ROUND_TABLE (라운드 테이블)

| A | B | C | D | E | F | G | H | I | J |
|---|---|---|---|---|---|---|---|---|---|
| RT_ID | Type | Date_Time | Location | Description | Host_ID | Max_Attendees | Current_Attendees | Status | Created_At |

### 📊 TB_RT_APPLICATION (참가 신청)

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| APP_ID | RT_ID | Participant_Email | Participant_Name | Purpose | Fee_Rate | Agreed_At | Status |

### 📊 System_Config (시스템 설정)

| A | B | C |
|---|---|---|
| KEY | VALUE | Description |

---

## 4단계: System_Config 초기 데이터 입력

`System_Config` 시트에 아래 설정값을 입력하세요:

| KEY | VALUE | Description |
|-----|-------|-------------|
| UCANSIGN_API_KEY | (유캔사인에서 발급) | 유캔사인 API 키 |
| UCANSIGN_API_SECRET | (유캔사인에서 발급) | 유캔사인 API 시크릿 |
| UCANSIGN_TEMPLATE_ID | (유캔사인 템플릿 ID) | NDA 문서 템플릿 ID |
| SOLAPI_API_KEY | (솔라피에서 발급) | 솔라피 알림톡 API 키 |
| SOLAPI_API_SECRET | (솔라피에서 발급) | 솔라피 API 시크릿 |
| GOOGLE_CHAT_WEBHOOK | (구글챗 웹훅 URL) | 운영 알림용 웹훅 |
| NDA_EXPIRY_DAYS | 90 | NDA 만료 일수 |

---

## 5단계: 테스트 데이터 입력 (선택)

### TB_DEAL_ROOM 샘플 데이터

| DEAL_ID | COM_ID | Industry | Deal_Type | Summary | Revenue_Range | Target_Valuation | Stage |
|---------|--------|----------|-----------|---------|---------------|------------------|-------|
| DEAL_20241128_001 | COM_001 | IT/소프트웨어 | 투자유치 | AI 기반 HR 솔루션 스타트업 | 10억~50억 | 100억 | Active |
| DEAL_20241128_002 | COM_002 | 바이오/헬스케어 | 매각 | 디지털 헬스케어 플랫폼 | 50억~100억 | 300억 | Active |
| DEAL_20241128_003 | COM_003 | 핀테크 | 투자유치 | 블록체인 결제 솔루션 | 5억~10억 | 50억 | Active |

### TB_ROUND_TABLE 샘플 데이터

| RT_ID | Type | Date_Time | Location | Max_Attendees | Current_Attendees | Status |
|-------|------|-----------|----------|---------------|-------------------|--------|
| RT_202412_001 | Public | 2024-12-15 14:00 | 강남 VS스퀘어 | 8 | 2 | Open |
| RT_202412_002 | Public | 2024-12-20 10:00 | 판교 스타트업캠퍼스 | 6 | 0 | Open |
| RT_202412_003 | Private | 2024-12-22 15:00 | 서울 강남 | 4 | 1 | Open |

---

## 6단계: GAS 스크립트 속성 설정

1. GAS 에디터에서 **프로젝트 설정** (톱니바퀴) 클릭
2. **스크립트 속성** 섹션에서 **속성 추가**
3. 아래 속성 추가:

| 속성 | 값 |
|------|-----|
| MASTER_DB_ID | (복사한 스프레드시트 ID) |

---

## 7단계: 권한 설정

### Google Drive 폴더 구조

각 딜마다 2개의 폴더를 생성:

```
VS_AI_ERP_DataRoom/
├── DEAL_20241128_001/
│   ├── Public/    ← Folder_ID_Public (누구나 볼 수 있는 티저)
│   └── Private/   ← Folder_ID_Private (NDA 서명자만)
├── DEAL_20241128_002/
│   ├── Public/
│   └── Private/
└── ...
```

### 폴더 권한 설정

1. **Public 폴더**: "링크가 있는 모든 사용자" → 뷰어
2. **Private 폴더**: "제한됨" (GAS에서 개별 뷰어 추가)

### GAS 서비스 계정 권한

- GAS가 Private 폴더의 권한을 관리하려면, GAS 실행 계정이 해당 폴더의 **편집자** 또는 **관리자** 권한이 있어야 합니다.

---

## 8단계: 검증

1. GAS 에디터에서 `testConfigModule()` 실행
2. 로그에서 DB 연결 확인
3. `initialize()` 함수 실행하여 트리거 설정

---

## 🔗 유용한 링크

- [유캔사인 API 문서](https://docs.ucansign.com)
- [솔라피 API 문서](https://docs.solapi.com)
- [Google Chat Webhook 설정](https://developers.google.com/chat/how-tos/webhooks)

---

## 문제 해결

### "시트를 찾을 수 없습니다" 오류
- 시트명이 정확히 일치하는지 확인 (대소문자, 공백)

### "MASTER_DB_ID가 설정되지 않았습니다" 오류
- 스크립트 속성에 MASTER_DB_ID 추가

### "Access denied" 폴더 오류
- GAS 실행 계정이 폴더 편집 권한이 있는지 확인
