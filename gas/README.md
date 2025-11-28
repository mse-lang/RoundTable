# VS AI ERP - 팩트시트 데이터룸 백엔드 모듈

## 프로젝트 개요

**VS AI ERP 팩트시트 데이터룸 & 딜 소싱 플랫폼**의 백엔드 Google Apps Script(GAS) 모듈입니다.

### 핵심 기능
- 기업 데이터를 AI로 분석하여 투자용 자산(FactSheet)으로 전환
- NDA 기반의 안전한 열람 (휴대폰 본인인증)
- 오프라인 미팅(Round Table) 연결
- O2O 딜 소싱 플랫폼

---

## 파일 구조

```
gas/
├── Code.gs           # 메인 엔트리포인트 (doGet/doPost 라우터)
├── Config.gs         # 데이터베이스 연결 및 시스템 설정 헬퍼
├── UcanSign.gs       # NDA 전자서명 및 권한 관리
├── DealRoom.gs       # 딜룸 데이터 조회 및 라운드테이블 관리
└── README.md         # 프로젝트 문서
```

---

## 모듈별 설명

### 1. Config.gs - 데이터베이스 연결

**주요 함수:**
| 함수명 | 설명 |
|--------|------|
| `getMasterDB()` | VS_Master_DB 스프레드시트 연결 |
| `getSheet(sheetName)` | 특정 시트 객체 반환 |
| `getSheetDataAsObjects(sheetName)` | 시트 데이터를 객체 배열로 반환 |
| `findRecords(sheetName, conditions)` | 조건 필터링 조회 |
| `findOneRecord(sheetName, conditions)` | 단일 레코드 조회 |
| `insertRecord(sheetName, data)` | 새 레코드 추가 |
| `updateRecord(sheetName, rowIndex, updates)` | 레코드 업데이트 |
| `getConfig(key)` | System_Config에서 설정값 조회 |
| `getUcanSignConfig()` | 유캔사인 API 설정 조회 |
| `getSolapiConfig()` | 솔라피 API 설정 조회 |
| `sendToGoogleChat(message)` | Google Chat 알림 전송 |
| `generateId(prefix)` | 고유 ID 생성 |

### 2. UcanSign.gs - NDA 프로세스

**주요 함수:**
| 함수명 | 설명 |
|--------|------|
| `requestSecureNDA(params)` | 휴대폰 본인인증 NDA 서명 요청 |
| `callUcanSignAPI(config, requestData)` | 유캔사인 API 호출 |
| `handleSigningWebhook(webhookData)` | 서명 완료 Webhook 처리 |
| `grantFolderAccess(folderId, email)` | Drive 폴더 뷰어 권한 부여 |
| `revokeFolderAccess(folderId, email)` | 폴더 권한 해제 |
| `revokeExpiredNDAAccess()` | 만료된 NDA 일괄 해제 (트리거) |
| `checkNDAStatus(dealId, userEmail)` | NDA 상태 조회 |

### 3. DealRoom.gs - 딜룸 관리

**주요 함수:**
| 함수명 | 설명 |
|--------|------|
| `getActiveDeals(filters)` | Active 딜 목록 조회 (티저 정보) |
| `getFilterOptions()` | 필터 옵션 목록 조회 |
| `getDealDetail(dealId, userEmail)` | 딜 상세 조회 (권한 검증) |
| `verifyNDAAccess(dealId, userEmail)` | NDA 접근 권한 검증 |
| `getRoundTableSchedule(filters)` | 라운드 테이블 일정 조회 |
| `applyForRoundTable(params)` | 라운드 테이블 참가 신청 |
| `getUserDealStatus(userEmail)` | 사용자 딜 현황 조회 |

### 4. Code.gs - API 라우터

**GET 엔드포인트:**
| Action | 설명 | 파라미터 |
|--------|------|----------|
| `getActiveDeals` | 딜 목록 조회 | industry, dealType, revenueRange, page, pageSize |
| `getDealDetail` | 딜 상세 조회 | dealId*, email |
| `getFilterOptions` | 필터 옵션 조회 | - |
| `getRoundTable` | 라운드 테이블 일정 | month, type |
| `getUserStatus` | 사용자 현황 | email* |
| `checkNDA` | NDA 상태 확인 | dealId*, email* |
| `health` | 서비스 상태 | - |

**POST 엔드포인트:**
| Action | 설명 | Body |
|--------|------|------|
| `requestNDA` | NDA 서명 요청 | dealId*, email*, name*, phone* |
| `applyRoundTable` | 라운드 테이블 신청 | rtId*, email*, name*, purpose, feeRate* |
| `signingWebhook` | 유캔사인 Webhook | (유캔사인 시스템 자동 호출) |

---

## 데이터베이스 스키마 (Google Sheets)

### TB_DEAL_ROOM
| 컬럼명 | 설명 |
|--------|------|
| DEAL_ID | 고유 ID (PK) |
| COM_ID | 회사 ID (FK) |
| Folder_ID_Private | 보안 폴더 ID |
| Folder_ID_Public | 티저 폴더 ID |
| Teaser_Link | 비실명 요약본 링크 |
| Full_Report_Link | 투자심사보고서 링크 |
| Stage | 딜 단계 (Draft/Review/Active/Sold) |
| Industry | 업종 |
| Deal_Type | 딜 유형 |
| Target_Valuation | 희망 기업가치 |

### TB_NDA_REQ
| 컬럼명 | 설명 |
|--------|------|
| REQ_ID | 요청 ID (PK) |
| DEAL_ID | 딜 ID (FK) |
| User_Email | 신청자 이메일 |
| User_Name | 실명 |
| User_Phone | 전화번호 |
| Doc_ID | 유캔사인 문서 ID |
| Status | 상태 (Pending/Signed/Expired) |
| Access_Expiry | 열람 만료일 |

### TB_ROUND_TABLE
| 컬럼명 | 설명 |
|--------|------|
| RT_ID | 미팅 ID (PK) |
| Type | 유형 (Public/Private) |
| Date_Time | 일시 |
| Location | 장소 |
| Max_Attendees | 최대 인원 |
| Current_Attendees | 현재 인원 |

### TB_RT_APPLICATION
| 컬럼명 | 설명 |
|--------|------|
| APP_ID | 신청 ID (PK) |
| RT_ID | 미팅 ID (FK) |
| Participant_Email | 참가자 이메일 |
| Purpose | 목적 (IR/Sourcing) |
| Fee_Rate | 수수료 확약률 |
| Agreed_At | 동의 일시 |

### System_Config
| 컬럼명 | 설명 |
|--------|------|
| KEY | 설정 키 |
| VALUE | 설정 값 |

**필수 설정 키:**
- `UCANSIGN_API_KEY` - 유캔사인 API 키
- `UCANSIGN_API_SECRET` - 유캔사인 시크릿
- `UCANSIGN_TEMPLATE_ID` - NDA 템플릿 ID
- `SOLAPI_API_KEY` - 솔라피 API 키
- `SOLAPI_API_SECRET` - 솔라피 시크릿
- `GOOGLE_CHAT_WEBHOOK` - 구글챗 Webhook URL
- `NDA_EXPIRY_DAYS` - NDA 만료 일수 (기본 90)

---

## 배포 가이드

### 1. 사전 준비
1. Google Sheets에 `VS_Master_DB` 생성
2. 위 스키마에 따라 시트 생성
3. System_Config에 API 키 설정

### 2. GAS 프로젝트 설정
```javascript
// 스크립트 속성 설정 (Project Settings > Script Properties)
MASTER_DB_ID = "스프레드시트 ID"
```

### 3. 파일 복사
1. `Code.gs`, `Config.gs`, `UcanSign.gs`, `DealRoom.gs` 파일을 GAS 프로젝트에 생성
2. 각 파일 내용 복사

### 4. 초기화 및 배포
```javascript
// 1. 초기화 함수 실행
initialize();

// 2. 웹앱 배포
// Deploy > New deployment > Web app
// - Execute as: Me
// - Who has access: Anyone (또는 조직 내)
```

### 5. 트리거 확인
- `revokeExpiredNDAAccess`: 매일 02:00 실행 (만료된 NDA 처리)

---

## API 사용 예시

### 딜 목록 조회
```javascript
// GET
fetch('https://script.google.com/.../exec?action=getActiveDeals&page=1&pageSize=10')
  .then(res => res.json())
  .then(data => console.log(data));
```

### NDA 서명 요청
```javascript
// POST
fetch('https://script.google.com/.../exec', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'requestNDA',
    dealId: 'DEAL_20241129_001',
    email: 'investor@vc.com',
    name: '홍길동',
    phone: '01012345678'
  })
});
```

### 딜 상세 조회 (권한 검증)
```javascript
// GET - NDA 서명 완료자만 풀리포트 조회 가능
fetch('https://script.google.com/.../exec?action=getDealDetail&dealId=DEAL_001&email=investor@vc.com')
  .then(res => res.json())
  .then(data => {
    if (data.accessLevel === 'full') {
      // 전체 정보 표시
    } else {
      // 티저만 표시 + NDA 서명 유도
    }
  });
```

---

## 보안 고려사항

1. **API 키 관리**: 모든 민감한 키값은 `System_Config` 시트에서 관리
2. **본인인증**: 유캔사인 휴대폰 본인인증을 통한 실명 확인
3. **접근 제어**: Google Drive 폴더 뷰어 권한으로 데이터 보호
4. **만료 처리**: NDA 만료일 기준 자동 권한 해제

---

## 테스트

```javascript
// 전체 통합 테스트
testAllModules();

// 개별 모듈 테스트
testConfigModule();
testUcanSignModule();
testDealRoomModule();

// API 엔드포인트 테스트
testApiEndpoint();
```

---

## 연락처

- **프로젝트**: VS AI ERP
- **버전**: 1.0.0
- **최종 수정**: 2024-11-28
