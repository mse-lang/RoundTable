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
    
    const params = e.parameter;
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
    sendToGoogleChat(`❌ *API 오류 (GET)*\nAction: ${e.parameter?.action}\n오류: ${error.message}`);
    
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
    sendToGoogleChat(`❌ *API 오류 (POST)*\nAction: ${e.parameter?.action}\n오류: ${error.message}`);
    
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
