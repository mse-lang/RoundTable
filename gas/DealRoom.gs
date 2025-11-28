/**
 * ============================================================
 * VS AI ERP - DealRoom.gs
 * 딜룸 데이터 관리 및 조회 모듈
 * ============================================================
 * 
 * 딜룸 목록 조회, 상세 정보 조회, 권한 검증 로직을 담당합니다.
 * 티저(공개) 정보와 풀리포트(NDA 서명자 전용) 정보를 구분하여 제공합니다.
 */

// ============================================================
// 상수 정의
// ============================================================

/**
 * 딜 상태 enum
 */
const DEAL_STAGE = {
  DRAFT: 'Draft',       // 초안 작성 중
  REVIEW: 'Review',     // 검토 중
  ACTIVE: 'Active',     // 활성화 (열람 가능)
  PENDING: 'Pending',   // 보류
  SOLD: 'Sold',         // 거래 완료
  CLOSED: 'Closed'      // 종료
};

/**
 * 티저(공개) 정보에 포함되는 필드
 * NDA 없이 볼 수 있는 정보
 */
const TEASER_FIELDS = [
  'DEAL_ID',
  'Industry',
  'Deal_Type',
  'Summary',
  'Revenue_Range',
  'Target_Valuation',
  'Stage',
  'Teaser_Link',
  'Created_At'
];

/**
 * 풀리포트(NDA 후) 정보에 포함되는 필드
 */
const FULL_REPORT_FIELDS = [
  'DEAL_ID',
  'COM_ID',
  'Industry',
  'Deal_Type',
  'Summary',
  'Full_Description',
  'Revenue_Range',
  'Target_Valuation',
  'Stage',
  'Teaser_Link',
  'Full_Report_Link',
  'Folder_ID_Private',
  'Contact_Person',
  'Created_At',
  'Updated_At'
];

// ============================================================
// 딜 목록 조회 (공개)
// ============================================================

/**
 * Active 상태의 딜 목록 조회 (티저 정보만)
 * 
 * @param {Object} filters - 필터 조건 (optional)
 * @param {string} filters.industry - 업종 필터
 * @param {string} filters.dealType - 딜 유형 (매각/투자)
 * @param {string} filters.revenueRange - 매출 규모
 * @param {number} filters.page - 페이지 번호 (1부터 시작)
 * @param {number} filters.pageSize - 페이지 크기 (기본 12)
 * @returns {Object} - { success, data: { deals, pagination } }
 */
function getActiveDeals(filters = {}) {
  try {
    const { industry, dealType, revenueRange, page = 1, pageSize = 12 } = filters;
    
    // 1. 전체 딜 데이터 조회
    let deals = getSheetDataAsObjects(SHEET_NAMES.DEAL_ROOM);
    
    // 2. Active 상태만 필터링
    deals = deals.filter(deal => deal.Stage === DEAL_STAGE.ACTIVE);
    
    // 3. 추가 필터 적용
    if (industry) {
      deals = deals.filter(deal => deal.Industry === industry);
    }
    if (dealType) {
      deals = deals.filter(deal => deal.Deal_Type === dealType);
    }
    if (revenueRange) {
      deals = deals.filter(deal => deal.Revenue_Range === revenueRange);
    }
    
    // 4. 최신순 정렬
    deals.sort((a, b) => {
      const dateA = new Date(a.Created_At || 0);
      const dateB = new Date(b.Created_At || 0);
      return dateB - dateA;
    });
    
    // 5. 페이지네이션
    const totalCount = deals.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const pagedDeals = deals.slice(startIndex, startIndex + pageSize);
    
    // 6. 티저 정보만 추출 (민감 정보 제외)
    const teaserDeals = pagedDeals.map(deal => {
      const teaser = {};
      TEASER_FIELDS.forEach(field => {
        teaser[field] = deal[field] || null;
      });
      return teaser;
    });
    
    Logger.log(`[DealRoom] 딜 목록 조회: ${teaserDeals.length}건 (전체 ${totalCount}건)`);
    
    return {
      success: true,
      data: {
        deals: teaserDeals,
        pagination: {
          page: page,
          pageSize: pageSize,
          totalCount: totalCount,
          totalPages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      },
      message: `${teaserDeals.length}건의 딜을 조회했습니다.`
    };
    
  } catch (error) {
    Logger.log(`[DealRoom] 딜 목록 조회 실패: ${error.message}`);
    sendToGoogleChat(`❌ *딜 목록 조회 오류*\n${error.message}`);
    
    return {
      success: false,
      data: null,
      message: error.message
    };
  }
}

/**
 * 필터 옵션 목록 조회 (드롭다운용)
 * 
 * @returns {Object} - { industries, dealTypes, revenueRanges }
 */
function getFilterOptions() {
  try {
    const deals = getSheetDataAsObjects(SHEET_NAMES.DEAL_ROOM);
    const activeDeals = deals.filter(d => d.Stage === DEAL_STAGE.ACTIVE);
    
    // 고유값 추출
    const industries = [...new Set(activeDeals.map(d => d.Industry).filter(Boolean))].sort();
    const dealTypes = [...new Set(activeDeals.map(d => d.Deal_Type).filter(Boolean))].sort();
    const revenueRanges = [...new Set(activeDeals.map(d => d.Revenue_Range).filter(Boolean))].sort();
    
    return {
      success: true,
      data: {
        industries,
        dealTypes,
        revenueRanges
      }
    };
    
  } catch (error) {
    Logger.log(`[DealRoom] 필터 옵션 조회 실패: ${error.message}`);
    return {
      success: false,
      data: null,
      message: error.message
    };
  }
}

// ============================================================
// 딜 상세 조회 (권한 검증 필수)
// ============================================================

/**
 * 딜 상세 정보 조회 (NDA 서명 검증 포함)
 * 
 * @param {string} dealId - 딜 ID
 * @param {string} userEmail - 요청자 이메일
 * @returns {Object} - { success, data, accessLevel }
 */
function getDealDetail(dealId, userEmail) {
  try {
    if (!dealId) {
      throw new Error('딜 ID가 필요합니다.');
    }
    
    // 1. 딜 정보 조회
    const deal = findOneRecord(SHEET_NAMES.DEAL_ROOM, { DEAL_ID: dealId });
    
    if (!deal) {
      return {
        success: false,
        data: null,
        accessLevel: 'none',
        message: '딜을 찾을 수 없습니다.'
      };
    }
    
    // 2. 딜 상태 확인
    if (deal.Stage !== DEAL_STAGE.ACTIVE) {
      return {
        success: false,
        data: null,
        accessLevel: 'none',
        message: '현재 열람이 불가능한 딜입니다.'
      };
    }
    
    // 3. 이메일 없이 요청한 경우 - 티저만 반환
    if (!userEmail) {
      const teaserData = extractTeaserFields(deal);
      return {
        success: true,
        data: teaserData,
        accessLevel: 'teaser',
        message: '티저 정보를 반환합니다. 상세 정보는 NDA 서명 후 열람 가능합니다.'
      };
    }
    
    // 4. NDA 서명 상태 검증
    const ndaStatus = verifyNDAAccess(dealId, userEmail);
    
    if (!ndaStatus.hasAccess) {
      // NDA 미서명 또는 만료 - 티저만 반환
      const teaserData = extractTeaserFields(deal);
      return {
        success: true,
        data: teaserData,
        accessLevel: 'teaser',
        ndaStatus: ndaStatus.status,
        message: ndaStatus.message
      };
    }
    
    // 5. NDA 서명 완료 - 풀리포트 반환
    const fullData = extractFullReportFields(deal);
    
    // 6. 조회 로그 기록 (옵션)
    logDealAccess(dealId, userEmail, 'full_report');
    
    Logger.log(`[DealRoom] 상세 조회 성공: ${dealId} by ${userEmail}`);
    
    return {
      success: true,
      data: fullData,
      accessLevel: 'full',
      ndaStatus: 'Signed',
      accessExpiry: ndaStatus.accessExpiry,
      message: '전체 정보를 반환합니다.'
    };
    
  } catch (error) {
    Logger.log(`[DealRoom] 상세 조회 실패: ${error.message}`);
    sendToGoogleChat(`❌ *딜 상세 조회 오류*\n딜: ${dealId}\n사용자: ${userEmail}\n오류: ${error.message}`);
    
    return {
      success: false,
      data: null,
      accessLevel: 'error',
      message: error.message
    };
  }
}

/**
 * NDA 접근 권한 검증
 * 
 * @param {string} dealId - 딜 ID
 * @param {string} userEmail - 사용자 이메일
 * @returns {Object} - { hasAccess, status, accessExpiry, message }
 */
function verifyNDAAccess(dealId, userEmail) {
  // 1. NDA 레코드 조회
  const nda = findOneRecord(SHEET_NAMES.NDA_REQ, {
    DEAL_ID: dealId,
    User_Email: userEmail
  });
  
  if (!nda) {
    return {
      hasAccess: false,
      status: null,
      accessExpiry: null,
      message: 'NDA 서명이 필요합니다. [상세 열람 신청] 버튼을 클릭해주세요.'
    };
  }
  
  // 2. 상태 확인
  if (nda.Status !== NDA_STATUS.SIGNED) {
    const statusMessages = {
      [NDA_STATUS.PENDING]: '서명 대기 중입니다. 카카오톡을 확인해주세요.',
      [NDA_STATUS.EXPIRED]: '접근 권한이 만료되었습니다. 재신청이 필요합니다.',
      [NDA_STATUS.REJECTED]: '서명이 거절되었습니다.',
      [NDA_STATUS.CANCELLED]: '서명 요청이 취소되었습니다.'
    };
    
    return {
      hasAccess: false,
      status: nda.Status,
      accessExpiry: null,
      message: statusMessages[nda.Status] || `현재 상태: ${nda.Status}`
    };
  }
  
  // 3. 만료일 확인
  if (nda.Access_Expiry) {
    const today = new Date();
    const expiry = new Date(nda.Access_Expiry);
    
    if (expiry < today) {
      return {
        hasAccess: false,
        status: NDA_STATUS.EXPIRED,
        accessExpiry: nda.Access_Expiry,
        message: '접근 권한이 만료되었습니다. 재신청이 필요합니다.'
      };
    }
  }
  
  // 4. 접근 허용
  return {
    hasAccess: true,
    status: NDA_STATUS.SIGNED,
    accessExpiry: nda.Access_Expiry,
    message: '접근 권한이 유효합니다.'
  };
}

// ============================================================
// 데이터 변환 헬퍼
// ============================================================

/**
 * 티저 필드만 추출
 * @param {Object} deal - 딜 전체 데이터
 * @returns {Object} - 티저 정보만 포함된 객체
 */
function extractTeaserFields(deal) {
  const teaser = {};
  TEASER_FIELDS.forEach(field => {
    teaser[field] = deal[field] || null;
  });
  return teaser;
}

/**
 * 풀리포트 필드 추출
 * @param {Object} deal - 딜 전체 데이터
 * @returns {Object} - 풀리포트 정보 포함된 객체
 */
function extractFullReportFields(deal) {
  const fullReport = {};
  FULL_REPORT_FIELDS.forEach(field => {
    fullReport[field] = deal[field] || null;
  });
  return fullReport;
}

// ============================================================
// 접근 로그 기록
// ============================================================

/**
 * 딜 접근 로그 기록
 * @param {string} dealId - 딜 ID
 * @param {string} userEmail - 사용자 이메일
 * @param {string} accessType - 접근 유형 (teaser/full_report)
 */
function logDealAccess(dealId, userEmail, accessType) {
  try {
    // TB_DEAL_ACCESS_LOG 시트가 있다면 기록
    // 없으면 Logger만 사용
    Logger.log(`[Access Log] ${dealId} | ${userEmail} | ${accessType} | ${new Date().toISOString()}`);
  } catch (error) {
    // 로그 실패는 무시
  }
}

// ============================================================
// 라운드 테이블 관련
// ============================================================

/**
 * 라운드 테이블 일정 조회
 * 
 * @param {Object} filters - 필터 조건
 * @param {string} filters.month - 월 (YYYY-MM)
 * @param {string} filters.type - 유형 (Public/Private)
 * @returns {Object} - { success, data }
 */
function getRoundTableSchedule(filters = {}) {
  try {
    const { month, type } = filters;
    
    let schedules = getSheetDataAsObjects(SHEET_NAMES.ROUND_TABLE);
    
    // Open 상태만
    schedules = schedules.filter(s => s.Status === 'Open');
    
    // 월 필터
    if (month) {
      schedules = schedules.filter(s => {
        const dateStr = s.Date_Time ? s.Date_Time.toString() : '';
        return dateStr.startsWith(month);
      });
    }
    
    // 유형 필터
    if (type) {
      schedules = schedules.filter(s => s.Type === type);
    }
    
    // 날짜순 정렬
    schedules.sort((a, b) => {
      const dateA = new Date(a.Date_Time || 0);
      const dateB = new Date(b.Date_Time || 0);
      return dateA - dateB;
    });
    
    // 공개 가능한 필드만 반환
    const publicSchedules = schedules.map(s => ({
      RT_ID: s.RT_ID,
      Type: s.Type,
      Date_Time: s.Date_Time,
      Location: s.Location,
      Max_Attendees: s.Max_Attendees,
      Current_Attendees: s.Current_Attendees || 0,
      Available_Slots: (s.Max_Attendees || 0) - (s.Current_Attendees || 0),
      Description: s.Description
    }));
    
    return {
      success: true,
      data: publicSchedules,
      message: `${publicSchedules.length}건의 일정을 조회했습니다.`
    };
    
  } catch (error) {
    Logger.log(`[RoundTable] 일정 조회 실패: ${error.message}`);
    return {
      success: false,
      data: null,
      message: error.message
    };
  }
}

/**
 * 라운드 테이블 참가 신청
 * 
 * @param {Object} params - 신청 정보
 * @param {string} params.rtId - 라운드 테이블 ID
 * @param {string} params.userEmail - 신청자 이메일
 * @param {string} params.userName - 신청자 이름
 * @param {string} params.purpose - 참가 목적 (IR/Sourcing)
 * @param {number} params.feeRate - 수수료 확약률
 * @returns {Object} - { success, data }
 */
function applyForRoundTable(params) {
  try {
    const { rtId, userEmail, userName, purpose, feeRate } = params;
    
    // 1. 필수값 검증
    if (!rtId || !userEmail || !userName || !feeRate) {
      throw new Error('필수 정보가 누락되었습니다.');
    }
    
    // 2. 라운드 테이블 정보 확인
    const rt = findOneRecord(SHEET_NAMES.ROUND_TABLE, { RT_ID: rtId });
    if (!rt) {
      throw new Error('라운드 테이블을 찾을 수 없습니다.');
    }
    
    if (rt.Status !== 'Open') {
      throw new Error('신청이 마감된 일정입니다.');
    }
    
    // 3. 잔여 슬롯 확인
    const currentAttendees = rt.Current_Attendees || 0;
    if (currentAttendees >= rt.Max_Attendees) {
      throw new Error('정원이 마감되었습니다.');
    }
    
    // 4. 중복 신청 확인
    const existing = findOneRecord(SHEET_NAMES.RT_APPLICATION, {
      RT_ID: rtId,
      Participant_Email: userEmail
    });
    
    if (existing) {
      throw new Error('이미 신청한 일정입니다.');
    }
    
    // 5. 신청 레코드 생성
    const appId = generateId('APP');
    insertRecord(SHEET_NAMES.RT_APPLICATION, {
      APP_ID: appId,
      RT_ID: rtId,
      Participant_Email: userEmail,
      Participant_Name: userName,
      Purpose: purpose || 'General',
      Fee_Rate: feeRate,
      Agreed_At: formatDate(new Date()),
      Status: 'Confirmed'
    });
    
    // 6. 참가자 수 업데이트
    updateRecord(SHEET_NAMES.ROUND_TABLE, rt._rowIndex, {
      Current_Attendees: currentAttendees + 1
    });
    
    // 7. 알림
    sendToGoogleChat(
      `📅 *라운드 테이블 신청*\n` +
      `• 일정: ${rtId}\n` +
      `• 신청자: ${userName} (${userEmail})\n` +
      `• 목적: ${purpose}\n` +
      `• 수수료 확약: ${feeRate}%`
    );
    
    return {
      success: true,
      data: {
        appId: appId,
        rtId: rtId,
        dateTime: rt.Date_Time,
        location: rt.Location
      },
      message: '참가 신청이 완료되었습니다. 확인 이메일을 발송해드리겠습니다.'
    };
    
  } catch (error) {
    Logger.log(`[RoundTable] 신청 실패: ${error.message}`);
    return {
      success: false,
      data: null,
      message: error.message
    };
  }
}

// ============================================================
// 마이페이지 데이터
// ============================================================

/**
 * 사용자의 딜 현황 조회 (마이페이지용)
 * 
 * @param {string} userEmail - 사용자 이메일
 * @returns {Object} - { ndaRequests, roundTableApps }
 */
function getUserDealStatus(userEmail) {
  try {
    if (!userEmail) {
      throw new Error('이메일이 필요합니다.');
    }
    
    // 1. NDA 요청 현황
    const ndaRecords = findRecords(SHEET_NAMES.NDA_REQ, { User_Email: userEmail });
    const ndaList = ndaRecords.map(nda => ({
      reqId: nda.REQ_ID,
      dealId: nda.DEAL_ID,
      status: nda.Status,
      accessExpiry: nda.Access_Expiry,
      requestedAt: nda.Created_At
    }));
    
    // 2. 라운드 테이블 신청 현황
    const rtApps = findRecords(SHEET_NAMES.RT_APPLICATION, { Participant_Email: userEmail });
    const rtList = rtApps.map(app => {
      // 라운드 테이블 상세 정보 조회
      const rt = findOneRecord(SHEET_NAMES.ROUND_TABLE, { RT_ID: app.RT_ID });
      return {
        appId: app.APP_ID,
        rtId: app.RT_ID,
        dateTime: rt ? rt.Date_Time : null,
        location: rt ? rt.Location : null,
        status: app.Status,
        feeRate: app.Fee_Rate,
        appliedAt: app.Agreed_At
      };
    });
    
    return {
      success: true,
      data: {
        ndaRequests: ndaList,
        roundTableApps: rtList
      },
      message: '사용자 현황을 조회했습니다.'
    };
    
  } catch (error) {
    Logger.log(`[MyPage] 조회 실패: ${error.message}`);
    return {
      success: false,
      data: null,
      message: error.message
    };
  }
}

// ============================================================
// 테스트 함수
// ============================================================

/**
 * DealRoom 모듈 테스트
 */
function testDealRoomModule() {
  Logger.log('=== DealRoom 모듈 테스트 ===');
  
  // 딜 목록 조회 테스트
  const deals = getActiveDeals({ page: 1, pageSize: 5 });
  Logger.log(`딜 목록: ${JSON.stringify(deals)}`);
  
  // 필터 옵션 테스트
  const filters = getFilterOptions();
  Logger.log(`필터 옵션: ${JSON.stringify(filters)}`);
  
  Logger.log('=== 테스트 완료 ===');
}
