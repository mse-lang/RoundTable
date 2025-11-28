/**
 * ============================================================
 * VS AI ERP - Code.gs
 * 메인 엔트리포인트 및 API 라우터
 * ============================================================
 * 
 * Google Apps Script Web App의 doGet/doPost 핸들러를 담당합니다.
 * 모든 API 요청은 이 파일을 통해 라우팅됩니다.
 * 
 * API 엔드포인트:
 * - GET  ?action=getActiveDeals       : 딜 목록 조회
 * - GET  ?action=getDealDetail        : 딜 상세 조회 (권한 검증)
 * - GET  ?action=getFilterOptions     : 필터 옵션 조회
 * - GET  ?action=getRoundTable        : 라운드 테이블 일정 조회
 * - GET  ?action=getUserStatus        : 사용자 딜 현황 조회
 * - GET  ?action=checkNDA             : NDA 상태 확인
 * - POST ?action=requestNDA           : NDA 서명 요청
 * - POST ?action=applyRoundTable      : 라운드 테이블 신청
 * - POST ?action=signingWebhook       : 유캔사인 서명 완료 Webhook
 */

// ============================================================
// GET 요청 핸들러
// ============================================================

/**
 * GET 요청 처리
 * 
 * @param {GoogleAppsScript.Events.DoGet} e - 이벤트 객체
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doGet(e) {
  const startTime = new Date();
  
  try {
    // CORS 프리플라이트 처리 (OPTIONS)는 doGet에서 불가하므로
    // 실제 CORS는 프론트엔드에서 JSONP 또는 프록시 사용 권장
    
    // e가 undefined인 경우 방어 처리
    const params = (e && e.parameter) ? e.parameter : {};
    const action = params.action || '';
    
    Logger.log(`[doGet] Action: ${action}, Params: ${JSON.stringify(params)}`);
    
    let result;
    
    switch (action) {
      // ========================================
      // 딜룸 관련 액션
      // ========================================
      
      case 'getActiveDeals':
        // 딜 목록 조회
        result = getActiveDeals({
          industry: params.industry,
          dealType: params.dealType,
          revenueRange: params.revenueRange,
          page: parseInt(params.page) || 1,
          pageSize: parseInt(params.pageSize) || 12
        });
        break;
        
      case 'getDealDetail':
        // 딜 상세 조회 (권한 검증 포함)
        if (!params.dealId) {
          result = { success: false, message: 'dealId 파라미터가 필요합니다.' };
        } else {
          result = getDealDetail(params.dealId, params.email);
        }
        break;
        
      case 'getFilterOptions':
        // 필터 옵션 조회
        result = getFilterOptions();
        break;
        
      // ========================================
      // 라운드 테이블 관련 액션
      // ========================================
      
      case 'getRoundTable':
        // 라운드 테이블 일정 조회
        result = getRoundTableSchedule({
          month: params.month,
          type: params.type
        });
        break;
        
      // ========================================
      // 사용자 관련 액션
      // ========================================
      
      case 'getUserStatus':
        // 사용자 딜 현황 조회
        if (!params.email) {
          result = { success: false, message: 'email 파라미터가 필요합니다.' };
        } else {
          result = getUserDealStatus(params.email);
        }
        break;
        
      case 'checkNDA':
        // NDA 상태 확인
        if (!params.dealId || !params.email) {
          result = { success: false, message: 'dealId와 email 파라미터가 필요합니다.' };
        } else {
          result = checkNDAStatus(params.dealId, params.email);
        }
        break;
        
      // ========================================
      // 헬스체크 및 기본
      // ========================================
      
      case 'health':
      case 'ping':
        result = {
          success: true,
          data: {
            status: 'healthy',
            timestamp: formatDate(new Date()),
            version: '1.0.0',
            service: 'VS AI ERP - DealRoom API'
          },
          message: 'Service is running'
        };
        break;
        
      // ========================================
      // 관리자 관련 액션
      // ========================================
      
      case 'getAdminStats':
        // 관리자 대시보드 통계 조회
        result = getAdminDashboardStats();
        break;
        
      case 'getPendingApprovals':
        // 승인 대기 목록 조회
        result = getPendingApprovals();
        break;
        
      case 'getRecentActivity':
        // 최근 활동 조회
        result = getRecentActivity();
        break;
        
      default:
        // 액션이 없거나 알 수 없는 경우
        result = {
          success: false,
          message: `알 수 없는 액션입니다: ${action}`,
          availableActions: [
            'getActiveDeals',
            'getDealDetail',
            'getFilterOptions',
            'getRoundTable',
            'getUserStatus',
            'checkNDA',
            'health'
          ]
        };
    }
    
    // 처리 시간 로깅
    const duration = new Date() - startTime;
    Logger.log(`[doGet] Completed in ${duration}ms`);
    
    return createJsonResponse(result.data, result.success, result.message);
    
  } catch (error) {
    Logger.log(`[doGet] Error: ${error.message}`);
    const actionName = (e && e.parameter) ? e.parameter.action : 'unknown';
    sendToGoogleChat(`❌ *API 오류 (GET)*\nAction: ${actionName}\n오류: ${error.message}`);
    
    return createErrorResponse(error.message, 500);
  }
}

// ============================================================
// POST 요청 핸들러
// ============================================================

/**
 * POST 요청 처리
 * 
 * @param {GoogleAppsScript.Events.DoPost} e - 이벤트 객체
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function doPost(e) {
  const startTime = new Date();
  
  try {
    // POST 데이터 파싱
    let postData = {};
    
    if (e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (parseError) {
        // URL 인코딩된 폼 데이터일 수 있음
        postData = e.parameter || {};
      }
    } else {
      postData = e.parameter || {};
    }
    
    const action = postData.action || e.parameter?.action || '';
    
    Logger.log(`[doPost] Action: ${action}, Data: ${JSON.stringify(postData)}`);
    
    let result;
    
    switch (action) {
      // ========================================
      // NDA 관련 액션
      // ========================================
      
      case 'requestNDA':
        // NDA 서명 요청
        result = requestSecureNDA({
          dealId: postData.dealId,
          userEmail: postData.email,
          userName: postData.name,
          userPhone: postData.phone
        });
        break;
        
      // ========================================
      // Webhook 처리
      // ========================================
      
      case 'signingWebhook':
      case 'ucansign_webhook':
        // 유캔사인 서명 완료 Webhook
        result = handleSigningWebhook(postData);
        break;
        
      // ========================================
      // 라운드 테이블 관련 액션
      // ========================================
      
      case 'applyRoundTable':
        // 라운드 테이블 참가 신청
        result = applyForRoundTable({
          rtId: postData.rtId,
          userEmail: postData.email,
          userName: postData.name,
          purpose: postData.purpose,
          feeRate: parseFloat(postData.feeRate) || 3.0
        });
        break;
        
      // ========================================
      // AI 분석 관련 액션
      // ========================================
      
      case 'analyzeDeal':
        // 딜 분석 요청 (Gemini)
        result = handleAnalyzeRequest({
          dealId: postData.dealId,
          sourceFolderId: postData.folderId
        });
        break;
        
      // ========================================
      // 관리자 인증 및 관리 액션
      // ========================================
      
      case 'adminLogin':
        // 관리자 로그인
        result = handleAdminLogin({
          adminId: postData.adminId,
          password: postData.password
        });
        break;
        
      case 'adminVerifySession':
        // 관리자 세션 검증
        result = verifyAdminSession(postData.sessionToken);
        break;
        
      case 'approveInvestor':
        // 투자자 승인
        result = approveInvestor(postData.investorId, postData.sessionToken);
        break;
        
      case 'approveBroker':
        // 중개인 승인
        result = approveBroker(postData.brokerId, postData.sessionToken);
        break;
        
      case 'createInvestorAccount':
        // 투자자 계정 생성
        result = createInvestorAccount(postData, postData.sessionToken);
        break;
        
      case 'addViewCredits':
        // 열람권 추가 부여
        result = addViewCredits(postData, postData.sessionToken);
        break;
        
      // ========================================
      // 기본
      // ========================================
      
      default:
        result = {
          success: false,
          message: `알 수 없는 액션입니다: ${action}`,
          availableActions: [
            'requestNDA',
            'signingWebhook',
            'applyRoundTable',
            'analyzeDeal'
          ]
        };
    }
    
    // 처리 시간 로깅
    const duration = new Date() - startTime;
    Logger.log(`[doPost] Completed in ${duration}ms`);
    
    return createJsonResponse(result.data, result.success, result.message);
    
  } catch (error) {
    Logger.log(`[doPost] Error: ${error.message}`);
    const actionName = (e && e.parameter) ? e.parameter.action : 'unknown';
    sendToGoogleChat(`❌ *API 오류 (POST)*\nAction: ${actionName}\n오류: ${error.message}`);
    
    return createErrorResponse(error.message, 500);
  }
}

// ============================================================
// 초기화 및 트리거 설정
// ============================================================

/**
 * 초기 설정 실행
 * 첫 배포 시 한 번 실행
 */
function initialize() {
  Logger.log('=== VS AI ERP DealRoom API 초기화 ===');
  
  // 1. Script Properties 확인
  const props = PropertiesService.getScriptProperties();
  const masterDbId = props.getProperty('MASTER_DB_ID');
  
  if (!masterDbId) {
    Logger.log('⚠️ MASTER_DB_ID가 설정되지 않았습니다.');
    Logger.log('스크립트 속성에 MASTER_DB_ID를 설정해주세요.');
  } else {
    Logger.log(`✅ MASTER_DB_ID: ${masterDbId}`);
  }
  
  // 2. 트리거 설정
  setupTriggers();
  
  // 3. 웹앱 URL 출력
  const url = ScriptApp.getService().getUrl();
  Logger.log(`🌐 Web App URL: ${url}`);
  
  Logger.log('=== 초기화 완료 ===');
}

/**
 * 트리거 설정
 */
function setupTriggers() {
  // 기존 트리거 삭제
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === 'revokeExpiredNDAAccess') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // NDA 만료 처리 트리거 (매일 새벽 2시)
  ScriptApp.newTrigger('revokeExpiredNDAAccess')
    .timeBased()
    .atHour(2)
    .everyDays(1)
    .create();
  
  Logger.log('✅ 트리거 설정 완료: revokeExpiredNDAAccess (매일 02:00)');
}

// ============================================================
// API 문서 생성
// ============================================================

/**
 * API 문서 HTML 반환
 */
function getApiDocumentation() {
  const baseUrl = ScriptApp.getService().getUrl();
  
  const doc = {
    title: 'VS AI ERP - DealRoom API',
    version: '1.0.0',
    baseUrl: baseUrl,
    endpoints: {
      GET: [
        {
          action: 'getActiveDeals',
          description: 'Active 상태의 딜 목록 조회 (티저 정보)',
          params: {
            industry: '(선택) 업종 필터',
            dealType: '(선택) 딜 유형 필터',
            revenueRange: '(선택) 매출 규모 필터',
            page: '(선택) 페이지 번호 (기본 1)',
            pageSize: '(선택) 페이지 크기 (기본 12)'
          },
          example: `${baseUrl}?action=getActiveDeals&page=1&pageSize=10`
        },
        {
          action: 'getDealDetail',
          description: '딜 상세 정보 조회 (NDA 서명 검증)',
          params: {
            dealId: '(필수) 딜 ID',
            email: '(선택) 요청자 이메일 (권한 검증용)'
          },
          example: `${baseUrl}?action=getDealDetail&dealId=DEAL_20241129_001&email=investor@vc.com`
        },
        {
          action: 'getFilterOptions',
          description: '필터 옵션 목록 조회',
          params: {},
          example: `${baseUrl}?action=getFilterOptions`
        },
        {
          action: 'getRoundTable',
          description: '라운드 테이블 일정 조회',
          params: {
            month: '(선택) 월 필터 (YYYY-MM)',
            type: '(선택) 유형 (Public/Private)'
          },
          example: `${baseUrl}?action=getRoundTable&month=2024-12`
        },
        {
          action: 'getUserStatus',
          description: '사용자 딜 현황 조회',
          params: {
            email: '(필수) 사용자 이메일'
          },
          example: `${baseUrl}?action=getUserStatus&email=user@example.com`
        },
        {
          action: 'checkNDA',
          description: 'NDA 서명 상태 확인',
          params: {
            dealId: '(필수) 딜 ID',
            email: '(필수) 사용자 이메일'
          },
          example: `${baseUrl}?action=checkNDA&dealId=DEAL_001&email=user@example.com`
        },
        {
          action: 'health',
          description: '서비스 상태 확인',
          params: {},
          example: `${baseUrl}?action=health`
        }
      ],
      POST: [
        {
          action: 'requestNDA',
          description: 'NDA 서명 요청 (휴대폰 본인인증)',
          body: {
            action: 'requestNDA',
            dealId: '(필수) 딜 ID',
            email: '(필수) 신청자 이메일',
            name: '(필수) 신청자 실명',
            phone: '(필수) 전화번호'
          }
        },
        {
          action: 'applyRoundTable',
          description: '라운드 테이블 참가 신청',
          body: {
            action: 'applyRoundTable',
            rtId: '(필수) 라운드 테이블 ID',
            email: '(필수) 신청자 이메일',
            name: '(필수) 신청자 이름',
            purpose: '(선택) 참가 목적',
            feeRate: '(필수) 수수료 확약률 (%)'
          }
        },
        {
          action: 'signingWebhook',
          description: '유캔사인 서명 완료 Webhook (내부용)',
          note: '유캔사인 시스템에서 자동 호출'
        }
      ]
    }
  };
  
  return doc;
}

/**
 * API 문서 조회 (GET ?action=docs)
 */
function getApiDocs() {
  return {
    success: true,
    data: getApiDocumentation(),
    message: 'API 문서'
  };
}

// ============================================================
// 관리자 인증 및 관리 함수
// ============================================================

/**
 * 관리자 로그인 처리
 * @param {Object} params - { adminId, password }
 * @returns {Object} - { success, data, message }
 */
function handleAdminLogin(params) {
  try {
    const { adminId, password } = params;
    
    if (!adminId || !password) {
      return {
        success: false,
        data: null,
        message: '아이디와 비밀번호를 모두 입력해주세요.'
      };
    }
    
    // Script Properties에서 관리자 정보 조회
    const credentials = getAdminCredentials();
    
    if (!credentials.adminId || !credentials.adminPassword) {
      Logger.log('[Admin] 관리자 계정이 설정되지 않았습니다.');
      return {
        success: false,
        data: null,
        message: '관리자 계정이 설정되지 않았습니다. 시스템 관리자에게 문의하세요.'
      };
    }
    
    // 인증 검증
    if (adminId === credentials.adminId && password === credentials.adminPassword) {
      // 세션 토큰 생성
      const sessionToken = generateSessionToken();
      
      Logger.log(`[Admin] 로그인 성공: ${adminId}`);
      sendToGoogleChat(`🔐 *관리자 로그인*\nID: ${adminId}\n시간: ${formatDate(new Date())}`);
      
      return {
        success: true,
        data: {
          sessionToken: sessionToken,
          adminId: adminId,
          loginTime: formatDate(new Date()),
          expiresIn: '8시간'
        },
        message: '로그인 성공'
      };
    } else {
      Logger.log(`[Admin] 로그인 실패 (잘못된 인증): ${adminId}`);
      sendToGoogleChat(`⚠️ *관리자 로그인 실패*\n시도 ID: ${adminId}\n시간: ${formatDate(new Date())}`);
      
      return {
        success: false,
        data: null,
        message: '아이디 또는 비밀번호가 올바르지 않습니다.'
      };
    }
    
  } catch (error) {
    Logger.log(`[Admin] 로그인 오류: ${error.message}`);
    return {
      success: false,
      data: null,
      message: `로그인 처리 중 오류가 발생했습니다: ${error.message}`
    };
  }
}

/**
 * 관리자 세션 검증
 * @param {string} sessionToken - 세션 토큰
 * @returns {Object} - { success, data, message }
 */
function verifyAdminSession(sessionToken) {
  try {
    if (!sessionToken) {
      return {
        success: false,
        data: null,
        message: '세션 토큰이 필요합니다.'
      };
    }
    
    if (isValidSessionToken(sessionToken)) {
      return {
        success: true,
        data: { valid: true },
        message: '유효한 세션입니다.'
      };
    } else {
      return {
        success: false,
        data: { valid: false },
        message: '세션이 만료되었습니다. 다시 로그인해주세요.'
      };
    }
    
  } catch (error) {
    Logger.log(`[Admin] 세션 검증 오류: ${error.message}`);
    return {
      success: false,
      data: null,
      message: `세션 검증 중 오류가 발생했습니다.`
    };
  }
}

/**
 * 세션 검증 헬퍼 (내부용)
 * @param {string} sessionToken - 세션 토큰
 * @returns {boolean}
 */
function requireAdminAuth(sessionToken) {
  if (!sessionToken || !isValidSessionToken(sessionToken)) {
    throw new Error('관리자 인증이 필요합니다.');
  }
  return true;
}

/**
 * 관리자 대시보드 통계 조회
 * @returns {Object}
 */
function getAdminDashboardStats() {
  try {
    // 투자자 수 (TB_INVESTOR가 있다면)
    let investorCount = 0;
    try {
      const investors = getSheetDataAsObjects('TB_INVESTOR');
      investorCount = investors.filter(i => i.STATUS === 'ACTIVE').length;
    } catch (e) {
      investorCount = 0;
    }
    
    // 중개인 수 (TB_BROKER가 있다면)
    let brokerCount = 0;
    try {
      const brokers = getSheetDataAsObjects('TB_BROKER');
      brokerCount = brokers.filter(b => b.STATUS === 'ACTIVE').length;
    } catch (e) {
      brokerCount = 0;
    }
    
    // 딜 수
    let dealCount = 0;
    try {
      const deals = getSheetDataAsObjects(SHEET_NAMES.DEAL_ROOM);
      dealCount = deals.filter(d => d.STATUS === 'Active').length;
    } catch (e) {
      dealCount = 0;
    }
    
    // NDA 요청 수
    let ndaCount = 0;
    try {
      const ndas = getSheetDataAsObjects(SHEET_NAMES.NDA_REQ);
      ndaCount = ndas.length;
    } catch (e) {
      ndaCount = 0;
    }
    
    return {
      success: true,
      data: {
        investors: investorCount,
        brokers: brokerCount,
        deals: dealCount,
        ndaRequests: ndaCount
      },
      message: '통계 조회 성공'
    };
    
  } catch (error) {
    Logger.log(`[Admin] 통계 조회 오류: ${error.message}`);
    return {
      success: false,
      data: null,
      message: `통계 조회 중 오류가 발생했습니다.`
    };
  }
}

/**
 * 승인 대기 목록 조회
 * @returns {Object}
 */
function getPendingApprovals() {
  try {
    const pending = [];
    
    // 투자자 승인 대기
    try {
      const investors = getSheetDataAsObjects('TB_INVESTOR');
      const pendingInvestors = investors.filter(i => i.STATUS === 'PENDING');
      pendingInvestors.forEach(inv => {
        pending.push({
          type: 'investor',
          id: inv.INVESTOR_ID,
          name: inv.NAME,
          email: inv.EMAIL,
          requestDate: inv.REG_DATE
        });
      });
    } catch (e) {
      // TB_INVESTOR 시트가 없을 수 있음
    }
    
    // 중개인 승인 대기
    try {
      const brokers = getSheetDataAsObjects('TB_BROKER');
      const pendingBrokers = brokers.filter(b => b.STATUS === 'PENDING');
      pendingBrokers.forEach(brk => {
        pending.push({
          type: 'broker',
          id: brk.BROKER_ID,
          name: brk.NAME,
          email: brk.EMAIL,
          requestDate: brk.REG_DATE
        });
      });
    } catch (e) {
      // TB_BROKER 시트가 없을 수 있음
    }
    
    return {
      success: true,
      data: pending,
      message: `승인 대기 ${pending.length}건`
    };
    
  } catch (error) {
    Logger.log(`[Admin] 승인 대기 조회 오류: ${error.message}`);
    return {
      success: false,
      data: null,
      message: `승인 대기 조회 중 오류가 발생했습니다.`
    };
  }
}

/**
 * 최근 활동 조회
 * @returns {Object}
 */
function getRecentActivity() {
  try {
    const activities = [];
    
    // NDA 요청 (최근 10건)
    try {
      const ndas = getSheetDataAsObjects(SHEET_NAMES.NDA_REQ);
      ndas.slice(-10).reverse().forEach(nda => {
        activities.push({
          type: 'nda',
          action: nda.STATUS === 'SIGNED' ? 'NDA 서명 완료' : 'NDA 요청',
          target: nda.USER_NAME || nda.USER_EMAIL,
          dealId: nda.DEAL_ID,
          timestamp: nda.CREATED_AT || nda.SIGNED_AT
        });
      });
    } catch (e) {
      // 시트가 없을 수 있음
    }
    
    // 라운드테이블 신청 (최근 10건)
    try {
      const applications = getSheetDataAsObjects(SHEET_NAMES.RT_APPLICATION);
      applications.slice(-10).reverse().forEach(app => {
        activities.push({
          type: 'roundtable',
          action: '라운드테이블 신청',
          target: app.USER_NAME || app.USER_EMAIL,
          rtId: app.RT_ID,
          timestamp: app.CREATED_AT
        });
      });
    } catch (e) {
      // 시트가 없을 수 있음
    }
    
    // 타임스탬프 기준 정렬 (최신순)
    activities.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0);
      const dateB = new Date(b.timestamp || 0);
      return dateB - dateA;
    });
    
    return {
      success: true,
      data: activities.slice(0, 20),
      message: '최근 활동 조회 성공'
    };
    
  } catch (error) {
    Logger.log(`[Admin] 최근 활동 조회 오류: ${error.message}`);
    return {
      success: false,
      data: null,
      message: `최근 활동 조회 중 오류가 발생했습니다.`
    };
  }
}

/**
 * 투자자 승인
 * @param {string} investorId - 투자자 ID
 * @param {string} sessionToken - 세션 토큰
 * @returns {Object}
 */
function approveInvestor(investorId, sessionToken) {
  try {
    requireAdminAuth(sessionToken);
    
    const investor = findOneRecord('TB_INVESTOR', { INVESTOR_ID: investorId });
    if (!investor) {
      return { success: false, message: '투자자를 찾을 수 없습니다.' };
    }
    
    updateRecord('TB_INVESTOR', investor._rowIndex, {
      STATUS: 'ACTIVE',
      APPROVED_AT: formatDate(new Date())
    });
    
    Logger.log(`[Admin] 투자자 승인: ${investorId}`);
    sendToGoogleChat(`✅ *투자자 승인*\nID: ${investorId}\n이름: ${investor.NAME}`);
    
    return {
      success: true,
      data: { investorId },
      message: '투자자가 승인되었습니다.'
    };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * 중개인 승인
 * @param {string} brokerId - 중개인 ID
 * @param {string} sessionToken - 세션 토큰
 * @returns {Object}
 */
function approveBroker(brokerId, sessionToken) {
  try {
    requireAdminAuth(sessionToken);
    
    const broker = findOneRecord('TB_BROKER', { BROKER_ID: brokerId });
    if (!broker) {
      return { success: false, message: '중개인을 찾을 수 없습니다.' };
    }
    
    updateRecord('TB_BROKER', broker._rowIndex, {
      STATUS: 'ACTIVE',
      APPROVED_AT: formatDate(new Date())
    });
    
    Logger.log(`[Admin] 중개인 승인: ${brokerId}`);
    sendToGoogleChat(`✅ *중개인 승인*\nID: ${brokerId}\n이름: ${broker.NAME}`);
    
    return {
      success: true,
      data: { brokerId },
      message: '중개인이 승인되었습니다.'
    };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * 투자자 계정 생성 (관리자용)
 * @param {Object} data - 투자자 정보
 * @param {string} sessionToken - 세션 토큰
 * @returns {Object}
 */
function createInvestorAccount(data, sessionToken) {
  try {
    requireAdminAuth(sessionToken);
    
    const investorId = generateId('INV');
    
    insertRecord('TB_INVESTOR', {
      INVESTOR_ID: investorId,
      EMAIL: data.email,
      NAME: data.name,
      PHONE: data.phone,
      COMPANY: data.company || '',
      STATUS: 'ACTIVE',
      MONTHLY_CREDITS: 5,
      REMAINING_CREDITS: 5,
      REG_DATE: formatDate(new Date()),
      APPROVED_AT: formatDate(new Date())
    });
    
    Logger.log(`[Admin] 투자자 계정 생성: ${investorId}`);
    sendToGoogleChat(`👤 *투자자 계정 생성*\nID: ${investorId}\n이름: ${data.name}\n이메일: ${data.email}`);
    
    return {
      success: true,
      data: { investorId },
      message: '투자자 계정이 생성되었습니다.'
    };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

/**
 * 열람권 추가 부여
 * @param {Object} data - { investorId, credits, reason }
 * @param {string} sessionToken - 세션 토큰
 * @returns {Object}
 */
function addViewCredits(data, sessionToken) {
  try {
    requireAdminAuth(sessionToken);
    
    const investor = findOneRecord('TB_INVESTOR', { INVESTOR_ID: data.investorId });
    if (!investor) {
      return { success: false, message: '투자자를 찾을 수 없습니다.' };
    }
    
    const currentCredits = parseInt(investor.REMAINING_CREDITS) || 0;
    const addCredits = parseInt(data.credits) || 0;
    const newCredits = currentCredits + addCredits;
    
    updateRecord('TB_INVESTOR', investor._rowIndex, {
      REMAINING_CREDITS: newCredits
    });
    
    // 열람권 이력 기록 (TB_VIEW_CREDIT가 있다면)
    try {
      insertRecord('TB_VIEW_CREDIT', {
        CREDIT_ID: generateId('CRD'),
        INVESTOR_ID: data.investorId,
        CREDIT_TYPE: 'ADMIN_GRANT',
        AMOUNT: addCredits,
        REASON: data.reason || '관리자 부여',
        CREATED_AT: formatDate(new Date())
      });
    } catch (e) {
      // 시트가 없으면 무시
    }
    
    Logger.log(`[Admin] 열람권 부여: ${data.investorId}에게 ${addCredits}개`);
    sendToGoogleChat(`🎫 *열람권 부여*\n투자자: ${investor.NAME}\n부여: +${addCredits}개\n잔여: ${newCredits}개`);
    
    return {
      success: true,
      data: { 
        investorId: data.investorId,
        addedCredits: addCredits,
        totalCredits: newCredits
      },
      message: `열람권 ${addCredits}개가 부여되었습니다.`
    };
    
  } catch (error) {
    return { success: false, message: error.message };
  }
}

// ============================================================
// 테스트 함수
// ============================================================

/**
 * 전체 모듈 통합 테스트
 */
function testAllModules() {
  Logger.log('========================================');
  Logger.log('VS AI ERP - 통합 테스트 시작');
  Logger.log('========================================');
  
  // 1. Config 테스트
  Logger.log('\n[1] Config 모듈 테스트');
  testConfigModule();
  
  // 2. UcanSign 테스트
  Logger.log('\n[2] UcanSign 모듈 테스트');
  testUcanSignModule();
  
  // 3. DealRoom 테스트
  Logger.log('\n[3] DealRoom 모듈 테스트');
  testDealRoomModule();
  
  // 4. API 라우터 테스트
  Logger.log('\n[4] API 라우터 테스트');
  
  // Health check 시뮬레이션
  const healthResult = doGet({ parameter: { action: 'health' } });
  Logger.log(`Health Check: ${healthResult.getContent()}`);
  
  Logger.log('\n========================================');
  Logger.log('통합 테스트 완료');
  Logger.log('========================================');
}

/**
 * API 엔드포인트 개별 테스트
 */
function testApiEndpoint() {
  // 딜 목록 조회 테스트
  const result = doGet({
    parameter: {
      action: 'getActiveDeals',
      page: '1',
      pageSize: '5'
    }
  });
  
  Logger.log('API Response:');
  Logger.log(result.getContent());
}
