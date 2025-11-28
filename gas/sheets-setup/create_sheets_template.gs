/**
 * ============================================================
 * VS AI ERP - Google Sheets 자동 생성 스크립트
 * ============================================================
 * 
 * 이 스크립트를 실행하면 VS_Master_DB의 모든 시트와 
 * 헤더, 초기 데이터가 자동으로 생성됩니다.
 * 
 * 사용법:
 * 1. 빈 Google Sheets 생성
 * 2. 확장 프로그램 > Apps Script 클릭
 * 3. 이 코드 붙여넣기
 * 4. createAllSheets() 함수 실행
 */

/**
 * 모든 시트 생성 (메인 함수)
 */
function createAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  Logger.log('=== VS AI ERP 데이터베이스 시트 생성 시작 ===');
  Logger.log(`스프레드시트 ID: ${ss.getId()}`);
  Logger.log('이 ID를 GAS 스크립트 속성의 MASTER_DB_ID에 설정하세요.\n');
  
  // 1. TB_DEAL_ROOM
  createDealRoomSheet(ss);
  
  // 2. TB_NDA_REQ
  createNDAReqSheet(ss);
  
  // 3. TB_ROUND_TABLE
  createRoundTableSheet(ss);
  
  // 4. TB_RT_APPLICATION
  createRTApplicationSheet(ss);
  
  // 5. System_Config
  createSystemConfigSheet(ss);
  
  // 기본 Sheet1 삭제 (있는 경우)
  try {
    const defaultSheet = ss.getSheetByName('Sheet1') || ss.getSheetByName('시트1');
    if (defaultSheet) {
      ss.deleteSheet(defaultSheet);
    }
  } catch (e) {
    // 무시
  }
  
  Logger.log('\n=== 모든 시트 생성 완료 ===');
  Logger.log('다음 단계:');
  Logger.log('1. System_Config 시트에 API 키 입력');
  Logger.log('2. GAS 스크립트 속성에 MASTER_DB_ID 설정');
  Logger.log('3. initialize() 함수 실행');
  
  // 알림
  SpreadsheetApp.getUi().alert(
    'VS AI ERP 데이터베이스 생성 완료!\n\n' +
    '스프레드시트 ID: ' + ss.getId() + '\n\n' +
    '이 ID를 GAS 스크립트 속성에 설정하세요.'
  );
}

/**
 * TB_DEAL_ROOM 시트 생성
 */
function createDealRoomSheet(ss) {
  const sheetName = 'TB_DEAL_ROOM';
  let sheet = ss.getSheetByName(sheetName);
  
  if (sheet) {
    Logger.log(`[${sheetName}] 이미 존재함 - 건너뜀`);
    return;
  }
  
  sheet = ss.insertSheet(sheetName);
  
  // 헤더 설정
  const headers = [
    'DEAL_ID',
    'COM_ID', 
    'Industry',
    'Deal_Type',
    'Summary',
    'Full_Description',
    'Revenue_Range',
    'Target_Valuation',
    'Stage',
    'Folder_ID_Private',
    'Folder_ID_Public',
    'Teaser_Link',
    'Full_Report_Link',
    'Contact_Person',
    'Created_At',
    'Updated_At'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  
  // 헤더 스타일
  formatHeader(sheet, headers.length);
  
  // 샘플 데이터
  const sampleData = [
    [
      'DEAL_20241128_001',
      'COM_001',
      'IT/소프트웨어',
      '투자유치',
      'AI 기반 HR 솔루션 스타트업. 기업 채용 프로세스를 혁신하는 SaaS 플랫폼.',
      'AI 면접 분석, 역량 평가, 채용 예측 등 종합 HR Tech 솔루션을 제공. 현재 50개 이상의 기업 고객 확보.',
      '10억~50억',
      '100억',
      'Active',
      '',
      '',
      '',
      '',
      '김투자',
      new Date().toISOString(),
      new Date().toISOString()
    ],
    [
      'DEAL_20241128_002',
      'COM_002',
      '바이오/헬스케어',
      '매각',
      '디지털 헬스케어 플랫폼. 원격 진료 및 건강관리 서비스.',
      '비대면 진료 플랫폼과 개인 건강관리 앱을 운영. MAU 10만, 제휴 병원 200개 이상.',
      '50억~100억',
      '300억',
      'Active',
      '',
      '',
      '',
      '',
      '이사업',
      new Date().toISOString(),
      new Date().toISOString()
    ],
    [
      'DEAL_20241128_003',
      'COM_003',
      '핀테크',
      '투자유치',
      '블록체인 기반 결제 솔루션. B2B 크로스보더 페이먼트.',
      '기업간 국제 송금 수수료를 90% 절감하는 블록체인 결제 인프라. 현재 20개국 서비스 중.',
      '5억~10억',
      '50억',
      'Active',
      '',
      '',
      '',
      '',
      '박대표',
      new Date().toISOString(),
      new Date().toISOString()
    ]
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  // 열 너비 조정
  sheet.setColumnWidth(1, 180);  // DEAL_ID
  sheet.setColumnWidth(5, 300);  // Summary
  sheet.setColumnWidth(6, 400);  // Full_Description
  
  Logger.log(`[${sheetName}] 생성 완료 (샘플 데이터 ${sampleData.length}건)`);
}

/**
 * TB_NDA_REQ 시트 생성
 */
function createNDAReqSheet(ss) {
  const sheetName = 'TB_NDA_REQ';
  let sheet = ss.getSheetByName(sheetName);
  
  if (sheet) {
    Logger.log(`[${sheetName}] 이미 존재함 - 건너뜀`);
    return;
  }
  
  sheet = ss.insertSheet(sheetName);
  
  const headers = [
    'REQ_ID',
    'DEAL_ID',
    'User_Email',
    'User_Name',
    'User_Phone',
    'Doc_ID',
    'Status',
    'Access_Expiry',
    'Signed_At',
    'Created_At',
    'Updated_At'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  // 열 너비 조정
  sheet.setColumnWidth(1, 180);
  sheet.setColumnWidth(2, 180);
  sheet.setColumnWidth(3, 200);
  
  // 드롭다운 (Status)
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'Signed', 'Expired', 'Rejected', 'Cancelled'])
    .build();
  sheet.getRange('G2:G1000').setDataValidation(statusRule);
  
  Logger.log(`[${sheetName}] 생성 완료`);
}

/**
 * TB_ROUND_TABLE 시트 생성
 */
function createRoundTableSheet(ss) {
  const sheetName = 'TB_ROUND_TABLE';
  let sheet = ss.getSheetByName(sheetName);
  
  if (sheet) {
    Logger.log(`[${sheetName}] 이미 존재함 - 건너뜀`);
    return;
  }
  
  sheet = ss.insertSheet(sheetName);
  
  const headers = [
    'RT_ID',
    'Type',
    'Date_Time',
    'Location',
    'Description',
    'Host_ID',
    'Max_Attendees',
    'Current_Attendees',
    'Status',
    'Created_At'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  // 샘플 데이터
  const sampleData = [
    [
      'RT_202412_001',
      'Public',
      '2024-12-15 14:00',
      '강남 VS스퀘어 3층 회의실',
      '12월 정기 딜소싱 라운드테이블. AI/핀테크 분야 스타트업 집중.',
      'admin@venturesquare.net',
      8,
      2,
      'Open',
      new Date().toISOString()
    ],
    [
      'RT_202412_002',
      'Public',
      '2024-12-20 10:00',
      '판교 스타트업캠퍼스 B동',
      '바이오/헬스케어 전문 라운드테이블.',
      'admin@venturesquare.net',
      6,
      0,
      'Open',
      new Date().toISOString()
    ],
    [
      'RT_202412_003',
      'Private',
      '2024-12-22 15:00',
      '서울 강남 (상세 위치 개별 안내)',
      '프라이빗 1:1 미팅. 시리즈B 투자 논의.',
      'admin@venturesquare.net',
      4,
      1,
      'Open',
      new Date().toISOString()
    ]
  ];
  
  sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  
  // 드롭다운
  const typeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Public', 'Private'])
    .build();
  sheet.getRange('B2:B1000').setDataValidation(typeRule);
  
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Open', 'Closed', 'Cancelled', 'Completed'])
    .build();
  sheet.getRange('I2:I1000').setDataValidation(statusRule);
  
  // 열 너비
  sheet.setColumnWidth(4, 250);
  sheet.setColumnWidth(5, 300);
  
  Logger.log(`[${sheetName}] 생성 완료 (샘플 데이터 ${sampleData.length}건)`);
}

/**
 * TB_RT_APPLICATION 시트 생성
 */
function createRTApplicationSheet(ss) {
  const sheetName = 'TB_RT_APPLICATION';
  let sheet = ss.getSheetByName(sheetName);
  
  if (sheet) {
    Logger.log(`[${sheetName}] 이미 존재함 - 건너뜀`);
    return;
  }
  
  sheet = ss.insertSheet(sheetName);
  
  const headers = [
    'APP_ID',
    'RT_ID',
    'Participant_Email',
    'Participant_Name',
    'Purpose',
    'Fee_Rate',
    'Agreed_At',
    'Status'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  // 드롭다운
  const purposeRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['IR', 'Sourcing', 'Networking', 'General'])
    .build();
  sheet.getRange('E2:E1000').setDataValidation(purposeRule);
  
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['Pending', 'Confirmed', 'Cancelled', 'Attended', 'No-Show'])
    .build();
  sheet.getRange('H2:H1000').setDataValidation(statusRule);
  
  // 열 너비
  sheet.setColumnWidth(3, 200);
  
  Logger.log(`[${sheetName}] 생성 완료`);
}

/**
 * System_Config 시트 생성
 */
function createSystemConfigSheet(ss) {
  const sheetName = 'System_Config';
  let sheet = ss.getSheetByName(sheetName);
  
  if (sheet) {
    Logger.log(`[${sheetName}] 이미 존재함 - 건너뜀`);
    return;
  }
  
  sheet = ss.insertSheet(sheetName);
  
  const headers = ['KEY', 'VALUE', 'Description'];
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  formatHeader(sheet, headers.length);
  
  // 초기 설정값
  // ※ 솔라피 API는 Script Properties에 별도 저장 (SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER)
  const configData = [
    ['UCANSIGN_API_KEY', '', '유캔사인 API 키 (https://ucansign.com에서 발급)'],
    ['UCANSIGN_API_SECRET', '', '유캔사인 API 시크릿'],
    ['UCANSIGN_TEMPLATE_ID', '', 'NDA 문서 템플릿 ID'],
    ['GOOGLE_CHAT_WEBHOOK', '', 'Google Chat 웹훅 URL (운영 알림용)'],
    ['NDA_EXPIRY_DAYS', '90', 'NDA 접근 권한 만료 일수 (기본 90일)'],
    ['ADMIN_EMAIL', 'admin@venturesquare.net', '관리자 이메일'],
    ['SERVICE_NAME', 'VS AI ERP', '서비스명'],
    ['DEFAULT_FEE_RATE', '3.0', '기본 수수료 확약률 (%)']
  ];
  
  sheet.getRange(2, 1, configData.length, 3).setValues(configData);
  
  // 열 너비
  sheet.setColumnWidth(1, 200);
  sheet.setColumnWidth(2, 400);
  sheet.setColumnWidth(3, 350);
  
  // VALUE 열 보호 (민감 정보)
  sheet.getRange('B2:B100').setBackground('#fffde7');  // 연한 노란색
  
  // 안내 메모
  sheet.getRange('A1').setNote('⚠️ 이 시트의 VALUE 컬럼에 API 키를 입력하세요. 절대 외부에 공유하지 마세요!');
  
  Logger.log(`[${sheetName}] 생성 완료 (설정 ${configData.length}개)`);
}

/**
 * 헤더 스타일 적용
 */
function formatHeader(sheet, colCount) {
  const headerRange = sheet.getRange(1, 1, 1, colCount);
  
  headerRange
    .setBackground('#1a73e8')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setHorizontalAlignment('center');
  
  // 첫 행 고정
  sheet.setFrozenRows(1);
}

/**
 * 스프레드시트 ID 확인용 함수
 */
function getSpreadsheetId() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const id = ss.getId();
  
  Logger.log('========================================');
  Logger.log('VS_Master_DB 스프레드시트 ID:');
  Logger.log(id);
  Logger.log('========================================');
  Logger.log('이 ID를 GAS 스크립트 속성의 MASTER_DB_ID에 설정하세요.');
  
  SpreadsheetApp.getUi().alert('스프레드시트 ID:\n\n' + id);
  
  return id;
}

/**
 * 시트 초기화 (모든 시트 삭제 후 재생성)
 * ⚠️ 주의: 모든 데이터가 삭제됩니다!
 */
function resetAllSheets() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '⚠️ 경고',
    '모든 시트와 데이터가 삭제됩니다. 계속하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    Logger.log('초기화 취소됨');
    return;
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheets = ss.getSheets();
  
  // 임시 시트 생성 (최소 1개 시트 필요)
  const tempSheet = ss.insertSheet('_TEMP_');
  
  // 모든 시트 삭제
  sheets.forEach(sheet => {
    try {
      ss.deleteSheet(sheet);
    } catch (e) {
      // 무시
    }
  });
  
  // 새로 생성
  createAllSheets();
  
  // 임시 시트 삭제
  try {
    ss.deleteSheet(ss.getSheetByName('_TEMP_'));
  } catch (e) {
    // 무시
  }
}
