/**
 * ============================================================
 * VentureSquare Round Table - 샘플 데이터 삽입 스크립트
 * ============================================================
 * 
 * 이 스크립트를 GAS에서 실행하면 TB_DEAL_ROOM과 TB_ROUND_TABLE에
 * 샘플 데이터가 자동으로 입력됩니다.
 * 
 * 사용법:
 * 1. 이 코드를 GAS 프로젝트에 새 파일로 추가
 * 2. insertAllSampleData() 함수 실행
 */

/**
 * 모든 샘플 데이터 삽입 (메인 함수)
 */
function insertAllSampleData() {
  Logger.log('=== 샘플 데이터 삽입 시작 ===');
  
  insertSampleDeals();
  insertSampleRoundTables();
  
  Logger.log('=== 샘플 데이터 삽입 완료 ===');
  
  SpreadsheetApp.getUi().alert('샘플 데이터 삽입이 완료되었습니다!\n\n딜: 10건\n라운드테이블: 5건');
}

/**
 * TB_DEAL_ROOM 샘플 데이터 삽입
 */
function insertSampleDeals() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TB_DEAL_ROOM');
  
  if (!sheet) {
    Logger.log('TB_DEAL_ROOM 시트를 찾을 수 없습니다.');
    return;
  }
  
  // 기존 데이터 삭제 (헤더 제외)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }
  
  const now = new Date().toISOString();
  
  // 샘플 딜 데이터 (10건)
  const sampleDeals = [
    // DEAL_ID, COM_ID, Industry, Deal_Type, Summary, Full_Description, Revenue_Range, Target_Valuation, Stage, Folder_ID_Private, Folder_ID_Public, Teaser_Link, Full_Report_Link, Contact_Person, Created_At, Updated_At
    [
      'DEAL_20241128_001', 'COM_001', 'IT/소프트웨어', '투자유치',
      'AI 기반 HR 솔루션 스타트업. 기업 채용 프로세스를 혁신하는 SaaS 플랫폼. AI 면접 분석, 역량 평가, 채용 예측 기능 제공.',
      'AI 면접 분석, 역량 평가, 채용 예측 등 종합 HR Tech 솔루션을 제공합니다. 현재 국내 대기업 포함 50개 이상의 기업 고객을 확보하고 있으며, 월 매출 2억원 달성. 2024년 시리즈A 유치를 목표로 하고 있습니다. 주요 경쟁력: 자체 개발 AI 엔진, 95% 이상의 고객 만족도.',
      '10억~50억', '100억', 'Active', '', '', '', '', '김태영 대표', now, now
    ],
    [
      'DEAL_20241128_002', 'COM_002', '바이오/헬스케어', '매각',
      '디지털 헬스케어 플랫폼. 원격 진료 및 개인 건강관리 서비스. MAU 10만, 제휴 병원 200개 보유.',
      '비대면 진료 플랫폼과 개인 건강관리 앱을 운영하는 디지털 헬스케어 스타트업입니다. 월간 활성 사용자 10만명, 제휴 병원/약국 200개 이상 확보. 2024년 흑자전환 예상. 대형 제약사/병원 그룹에 전략적 매각을 검토 중입니다.',
      '50억~100억', '300억', 'Active', '', '', '', '', '이수현 대표', now, now
    ],
    [
      'DEAL_20241128_003', 'COM_003', '핀테크', '투자유치',
      '블록체인 기반 B2B 크로스보더 결제 솔루션. 기업간 국제 송금 수수료 90% 절감. 현재 20개국 서비스 중.',
      '블록체인 기술을 활용한 기업간 국제 송금 플랫폼입니다. 기존 SWIFT 대비 수수료 90% 절감, 정산 시간 T+0 실현. 현재 아시아/유럽 20개국에서 서비스 중이며, 월 거래액 100억원 돌파. 시리즈B 라운드 진행 중.',
      '5억~10억', '150억', 'Active', '', '', '', '', '박준혁 대표', now, now
    ],
    [
      'DEAL_20241128_004', 'COM_004', '이커머스', '매각',
      'MZ세대 타겟 D2C 스트리트웨어 브랜드. 인스타그램 팔로워 50만, 자사몰 월 매출 8억원.',
      '2020년 런칭한 MZ세대 타겟 스트리트웨어 브랜드입니다. 자체 디자인/생산 체계 구축, 인스타그램 팔로워 50만명 확보. 자사몰 월 매출 8억원, 영업이익률 15%. 글로벌 패션 그룹 또는 PE에 매각 검토 중.',
      '50억~100억', '200억', 'Active', '', '', '', '', '최민지 대표', now, now
    ],
    [
      'DEAL_20241128_005', 'COM_005', '에듀테크', '투자유치',
      'GPT 기반 1:1 AI 영어회화 앱. 월 구독자 5만명, MRR 3억원. 일본/베트남 진출 준비 중.',
      'GPT-4 기반의 1:1 AI 영어회화 학습 앱입니다. 실시간 발음 교정, 문법 첨삭, 맞춤형 커리큘럼 제공. 월 구독자 5만명, MRR 3억원 달성. 2025년 1분기 일본/베트남 진출 예정. 시리즈A 유치 목표.',
      '10억~50억', '80억', 'Active', '', '', '', '', '정우성 대표', now, now
    ],
    [
      'DEAL_20241128_006', 'COM_006', 'IT/소프트웨어', '투자유치',
      'B2B SaaS 마케팅 자동화 플랫폼. 고객 여정 분석, 캠페인 최적화, ROI 측정 기능. 엔터프라이즈 고객 30개사.',
      'B2B 기업을 위한 마케팅 자동화 SaaS 플랫폼입니다. 고객 여정 분석, 이메일/광고 캠페인 자동화, 실시간 ROI 측정 대시보드 제공. 현재 엔터프라이즈 고객 30개사 확보, ARR 15억원. 글로벌 진출을 위한 시리즈A 유치 중.',
      '10억~50억', '70억', 'Active', '', '', '', '', '한지민 대표', now, now
    ],
    [
      'DEAL_20241128_007', 'COM_007', '물류/로보틱스', '투자유치',
      '물류센터용 자율주행 로봇 솔루션. 피킹 효율 300% 향상. 쿠팡, CJ대한통운 등 대형 고객 확보.',
      '물류센터 자동화를 위한 자율주행 로봇 솔루션을 개발합니다. AMR(자율이동로봇) 기반 피킹/소팅 자동화로 물류 효율 300% 향상. 쿠팡, CJ대한통운, 롯데글로벌로지스 등 대형 고객사 확보. 로봇 200대 이상 운영 중.',
      '10억~50억', '200억', 'Active', '', '', '', '', '오승환 대표', now, now
    ],
    [
      'DEAL_20241128_008', 'COM_008', '바이오/헬스케어', '투자유치',
      'AI 기반 신약 후보물질 발굴 플랫폼. 글로벌 제약사 3곳과 공동연구 진행 중.',
      'AI/ML 기반 신약 후보물질 발굴 플랫폼을 운영합니다. 기존 대비 신약개발 기간 50% 단축, 비용 70% 절감 효과. 현재 글로벌 Top 20 제약사 3곳과 공동연구 계약 체결(계약금 총 50억원). 시리즈B 유치로 자체 파이프라인 확대 예정.',
      '5억~10억', '500억', 'Active', '', '', '', '', '김서연 대표', now, now
    ],
    [
      'DEAL_20241128_009', 'COM_009', '모빌리티/에너지', 'M&A',
      '전기차 충전 인프라 운영사. 전국 충전소 500개소 운영. 월 충전량 100만kWh.',
      '전국 500개소의 전기차 급속/완속 충전소를 운영하는 충전 인프라 기업입니다. 월 충전량 100만kWh, 월 매출 5억원. 자체 개발 충전 관제 시스템 보유. 대형 에너지 기업 또는 자동차 OEM의 M&A 제안을 검토 중.',
      '50억~100억', '250억', 'Active', '', '', '', '', '이동훈 대표', now, now
    ],
    [
      'DEAL_20241128_010', 'COM_010', '애그테크', '투자유치',
      '스마트팜 IoT 솔루션. 센서 기반 작물 생육 모니터링, AI 수확량 예측. 농가 200곳 도입.',
      '농업용 IoT 센서와 AI 분석 플랫폼을 제공하는 애그테크 스타트업입니다. 토양/기상/작물 생육 데이터 실시간 모니터링, AI 기반 수확량 예측 및 병충해 조기경보. 현재 전국 200개 농가에서 사용 중. 정부 스마트팜 사업 주요 협력사.',
      '5억~10억', '50억', 'Active', '', '', '', '', '박영수 대표', now, now
    ]
  ];
  
  // 데이터 삽입
  sheet.getRange(2, 1, sampleDeals.length, sampleDeals[0].length).setValues(sampleDeals);
  
  Logger.log(`TB_DEAL_ROOM: ${sampleDeals.length}건의 샘플 딜 데이터 삽입 완료`);
}

/**
 * TB_ROUND_TABLE 샘플 데이터 삽입
 */
function insertSampleRoundTables() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('TB_ROUND_TABLE');
  
  if (!sheet) {
    Logger.log('TB_ROUND_TABLE 시트를 찾을 수 없습니다.');
    return;
  }
  
  // 기존 데이터 삭제 (헤더 제외)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).clearContent();
  }
  
  const now = new Date().toISOString();
  
  // 샘플 라운드테이블 데이터 (5건)
  const sampleRT = [
    // RT_ID, Type, Date_Time, Location, Description, Host_ID, Max_Attendees, Current_Attendees, Status, Created_At
    [
      'RT_202412_001', 'Public', '2024-12-15 14:00', 
      '서울 강남 VS스퀘어 3층', 
      '12월 정기 딜소싱 라운드테이블 - AI/핀테크 스타트업 집중',
      'admin@venturesquare.net', 8, 2, 'Open', now
    ],
    [
      'RT_202412_002', 'Public', '2024-12-20 10:00', 
      '판교 스타트업캠퍼스 B동', 
      '바이오/헬스케어 전문 라운드테이블',
      'admin@venturesquare.net', 6, 0, 'Open', now
    ],
    [
      'RT_202412_003', 'Private', '2024-12-22 15:00', 
      '서울 강남 (상세 위치 개별 안내)', 
      '프라이빗 1:1 미팅 - 시리즈B 투자 논의',
      'admin@venturesquare.net', 4, 1, 'Open', now
    ],
    [
      'RT_202501_001', 'Public', '2025-01-10 14:00', 
      '서울 여의도 IFC', 
      '2025년 신년 딜소싱 라운드테이블',
      'admin@venturesquare.net', 10, 0, 'Open', now
    ],
    [
      'RT_202501_002', 'Public', '2025-01-17 10:00', 
      '부산 센텀 스타트업파크', 
      '부산/경남 지역 스타트업 라운드테이블',
      'admin@venturesquare.net', 8, 0, 'Open', now
    ]
  ];
  
  // 데이터 삽입
  sheet.getRange(2, 1, sampleRT.length, sampleRT[0].length).setValues(sampleRT);
  
  Logger.log(`TB_ROUND_TABLE: ${sampleRT.length}건의 샘플 라운드테이블 데이터 삽입 완료`);
}

/**
 * 샘플 데이터 삭제 (초기화)
 */
function clearAllSampleData() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    '⚠️ 주의',
    '모든 샘플 데이터가 삭제됩니다. 계속하시겠습니까?',
    ui.ButtonSet.YES_NO
  );
  
  if (response !== ui.Button.YES) {
    return;
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // TB_DEAL_ROOM 초기화
  const dealSheet = ss.getSheetByName('TB_DEAL_ROOM');
  if (dealSheet && dealSheet.getLastRow() > 1) {
    dealSheet.getRange(2, 1, dealSheet.getLastRow() - 1, dealSheet.getLastColumn()).clearContent();
  }
  
  // TB_ROUND_TABLE 초기화
  const rtSheet = ss.getSheetByName('TB_ROUND_TABLE');
  if (rtSheet && rtSheet.getLastRow() > 1) {
    rtSheet.getRange(2, 1, rtSheet.getLastRow() - 1, rtSheet.getLastColumn()).clearContent();
  }
  
  // TB_NDA_REQ 초기화
  const ndaSheet = ss.getSheetByName('TB_NDA_REQ');
  if (ndaSheet && ndaSheet.getLastRow() > 1) {
    ndaSheet.getRange(2, 1, ndaSheet.getLastRow() - 1, ndaSheet.getLastColumn()).clearContent();
  }
  
  // TB_RT_APPLICATION 초기화
  const appSheet = ss.getSheetByName('TB_RT_APPLICATION');
  if (appSheet && appSheet.getLastRow() > 1) {
    appSheet.getRange(2, 1, appSheet.getLastRow() - 1, appSheet.getLastColumn()).clearContent();
  }
  
  ui.alert('모든 데이터가 초기화되었습니다.');
  Logger.log('모든 샘플 데이터 삭제 완료');
}
