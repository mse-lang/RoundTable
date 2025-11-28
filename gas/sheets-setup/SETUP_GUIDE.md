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

아래 시트들을 생성하세요:

### 📁 핵심 시트

| 시트명 | 용도 |
|--------|------|
| `TB_DEAL_ROOM` | 딜 & 데이터룸 관리 |
| `TB_NDA_REQ` | NDA 및 접근 권한 |
| `TB_ROUND_TABLE` | 라운드 테이블 일정 |
| `TB_RT_APPLICATION` | 참가 신청 및 수수료 확약 |
| `System_Config` | 시스템 설정 (API 키 등) |

### 📁 회원 관리 시트 (신규)

| 시트명 | 용도 |
|--------|------|
| `TB_INVESTOR` | 투자자 회원 관리 |
| `TB_BROKER` | 중개인 회원 관리 |
| `TB_COMPANY` | 기업 회원 관리 |
| `TB_DELEGATION` | 위임 계약 관리 (중개인-기업/투자자) |
| `TB_VIEW_CREDIT` | 열람권 관리 (월 5건, 추천 보너스 등) |
| `TB_REFERRAL` | 추천인 관리 |

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

## 3-2단계: 회원 관리 시트 헤더 설정

### 📊 TB_INVESTOR (투자자 회원)

| 컬럼 | 설명 |
|------|------|
| INVESTOR_ID | 투자자 고유 ID (INV_YYYYMMDD_NNN) |
| User_ID | 로그인 아이디 (운영진 발급) |
| Password_Hash | 비밀번호 해시 |
| Name | 실명 |
| Email | 이메일 |
| Phone | 전화번호 |
| Company | 소속 회사/기관 |
| Position | 직책 |
| Identity_Verified | 본인인증 완료 여부 (Y/N) |
| Identity_Verified_At | 본인인증 일시 |
| Referrer_ID | 추천인 ID (있는 경우) |
| Status | 상태 (Pending/Active/Suspended) |
| Created_At | 가입일 |
| Last_Login | 최근 로그인 |

**헤더 행:**
```
INVESTOR_ID | User_ID | Password_Hash | Name | Email | Phone | Company | Position | Identity_Verified | Identity_Verified_At | Referrer_ID | Status | Created_At | Last_Login
```

### 📊 TB_BROKER (중개인 회원)

| 컬럼 | 설명 |
|------|------|
| BROKER_ID | 중개인 고유 ID (BRK_YYYYMMDD_NNN) |
| User_ID | 로그인 아이디 |
| Password_Hash | 비밀번호 해시 |
| Name | 실명 |
| Email | 이메일 |
| Phone | 전화번호 |
| Company | 소속 회사 |
| License_No | 자격증/사업자번호 |
| Recommender_Type | 추천인 유형 (Admin/Investor/Company) |
| Recommender_ID | 추천인 ID |
| Identity_Verified | 본인인증 완료 (Y/N) |
| Admin_Approved | 운영진 승인 (Y/N) |
| Admin_Approved_At | 승인 일시 |
| Status | 상태 (Pending/Active/Suspended) |
| Created_At | 가입일 |

**헤더 행:**
```
BROKER_ID | User_ID | Password_Hash | Name | Email | Phone | Company | License_No | Recommender_Type | Recommender_ID | Identity_Verified | Admin_Approved | Admin_Approved_At | Status | Created_At
```

### 📊 TB_COMPANY (기업 회원)

| 컬럼 | 설명 |
|------|------|
| COMPANY_ID | 기업 고유 ID (COM_YYYYMMDD_NNN) |
| User_ID | 로그인 아이디 |
| Password_Hash | 비밀번호 해시 |
| Company_Name | 회사명 |
| Business_No | 사업자등록번호 |
| CEO_Name | 대표자명 |
| Contact_Name | 담당자명 |
| Contact_Email | 담당자 이메일 |
| Contact_Phone | 담당자 전화번호 |
| Industry | 업종 |
| Identity_Verified | 본인인증 완료 (Y/N) |
| Status | 상태 (Pending/Active/Suspended) |
| Created_At | 가입일 |

**헤더 행:**
```
COMPANY_ID | User_ID | Password_Hash | Company_Name | Business_No | CEO_Name | Contact_Name | Contact_Email | Contact_Phone | Industry | Identity_Verified | Status | Created_At
```

### 📊 TB_DELEGATION (위임 계약)

| 컬럼 | 설명 |
|------|------|
| DELEGATION_ID | 위임 계약 ID (DEL_YYYYMMDD_NNN) |
| Broker_ID | 중개인 ID |
| Delegator_Type | 위임자 유형 (Investor/Company) |
| Delegator_ID | 위임자 ID |
| Contract_Doc_ID | 위임 계약서 문서 ID (유캔사인) |
| Contract_Status | 계약 상태 (Draft/Signed/Expired) |
| Admin_Approved | 운영진 승인 (Y/N) |
| Admin_Approved_At | 승인 일시 |
| Valid_From | 계약 시작일 |
| Valid_Until | 계약 종료일 |
| Created_At | 생성일 |

**헤더 행:**
```
DELEGATION_ID | Broker_ID | Delegator_Type | Delegator_ID | Contract_Doc_ID | Contract_Status | Admin_Approved | Admin_Approved_At | Valid_From | Valid_Until | Created_At
```

### 📊 TB_VIEW_CREDIT (열람권 관리)

| 컬럼 | 설명 |
|------|------|
| CREDIT_ID | 열람권 ID |
| User_Type | 사용자 유형 (Investor/Broker) |
| User_ID | 사용자 ID |
| Month | 해당 월 (YYYY-MM) |
| Free_Credits | 무료 열람권 (기본 5건) |
| Bonus_Credits | 보너스 열람권 (추천 등) |
| Used_Credits | 사용한 열람권 |
| Extra_Credits | 추가 열람권 (운영진 승인) |
| Updated_At | 최종 업데이트 |

**헤더 행:**
```
CREDIT_ID | User_Type | User_ID | Month | Free_Credits | Bonus_Credits | Used_Credits | Extra_Credits | Updated_At
```

### 📊 TB_REFERRAL (추천인 관리)

| 컬럼 | 설명 |
|------|------|
| REFERRAL_ID | 추천 ID |
| Referrer_Type | 추천인 유형 (Investor/Broker/Company) |
| Referrer_ID | 추천인 ID |
| Referred_Type | 피추천인 유형 |
| Referred_ID | 피추천인 ID |
| Bonus_Applied | 보너스 적용 여부 (Y/N) |
| Bonus_Credits | 적용된 보너스 열람권 수 |
| Created_At | 추천일 |

**헤더 행:**
```
REFERRAL_ID | Referrer_Type | Referrer_ID | Referred_Type | Referred_ID | Bonus_Applied | Bonus_Credits | Created_At
```

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
