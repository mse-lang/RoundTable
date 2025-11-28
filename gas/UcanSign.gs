/**
 * ============================================================
 * VS AI ERP - UcanSign.gs
 * NDA 전자서명 및 권한 관리 모듈
 * ============================================================
 * 
 * 유캔사인 API를 통한 휴대폰 본인인증 기반 NDA 서명 처리,
 * 서명 완료 후 Google Drive 폴더 접근 권한 부여 로직을 담당합니다.
 */

// ============================================================
// 상수 정의
// ============================================================

const UCANSIGN_BASE_URL = 'https://api.ucansign.com/v1';

/**
 * NDA 상태 enum
 */
const NDA_STATUS = {
  PENDING: 'Pending',      // 서명 요청됨
  SIGNED: 'Signed',        // 서명 완료
  EXPIRED: 'Expired',      // 만료됨
  REJECTED: 'Rejected',    // 거절됨
  CANCELLED: 'Cancelled'   // 취소됨
};

// ============================================================
// NDA 서명 요청
// ============================================================

/**
 * 휴대폰 본인인증이 포함된 NDA 서명 요청
 * 
 * @param {Object} params - 요청 파라미터
 * @param {string} params.dealId - 딜 ID
 * @param {string} params.userEmail - 사용자 이메일
 * @param {string} params.userName - 사용자 실명
 * @param {string} params.userPhone - 사용자 전화번호
 * @returns {Object} - { success, data: { reqId, docId }, message }
 */
function requestSecureNDA(params) {
  const { dealId, userEmail, userName, userPhone } = params;
  
  try {
    // 1. 필수 파라미터 검증
    if (!dealId || !userEmail || !userName || !userPhone) {
      throw new Error('필수 파라미터가 누락되었습니다: dealId, userEmail, userName, userPhone');
    }
    
    // 2. 전화번호 포맷 정리 (숫자만)
    const cleanPhone = userPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      throw new Error('유효하지 않은 전화번호입니다.');
    }
    
    // 3. 딜 정보 조회
    const deal = findOneRecord(SHEET_NAMES.DEAL_ROOM, { DEAL_ID: dealId });
    if (!deal) {
      throw new Error(`딜을 찾을 수 없습니다: ${dealId}`);
    }
    
    if (deal.Stage !== 'Active') {
      throw new Error('현재 열람 신청이 불가능한 딜입니다.');
    }
    
    // 4. 기존 NDA 요청 확인 (중복 방지)
    const existingNDA = findOneRecord(SHEET_NAMES.NDA_REQ, {
      DEAL_ID: dealId,
      User_Email: userEmail
    });
    
    if (existingNDA && existingNDA.Status === NDA_STATUS.SIGNED) {
      // 이미 서명 완료된 경우 - 만료 여부 확인
      if (existingNDA.Access_Expiry && new Date(existingNDA.Access_Expiry) > new Date()) {
        return {
          success: true,
          data: { reqId: existingNDA.REQ_ID, alreadySigned: true },
          message: '이미 NDA 서명이 완료되어 있습니다.'
        };
      }
    }
    
    if (existingNDA && existingNDA.Status === NDA_STATUS.PENDING) {
      // 대기 중인 요청이 있으면 기존 요청 정보 반환
      return {
        success: true,
        data: { reqId: existingNDA.REQ_ID, docId: existingNDA.Doc_ID },
        message: '이미 서명 요청이 진행 중입니다. 카카오톡을 확인해주세요.'
      };
    }
    
    // 5. 유캔사인 API 호출
    const ucanConfig = getUcanSignConfig();
    const docId = callUcanSignAPI(ucanConfig, {
      templateId: ucanConfig.templateId,
      signerName: userName,
      signerPhone: cleanPhone,
      signerEmail: userEmail,
      dealId: dealId,
      enablePhoneVerification: true  // 휴대폰 본인인증 활성화
    });
    
    // 6. NDA 요청 레코드 생성
    const reqId = generateId('REQ');
    const expiryDate = addDays(getNDAExpiryDays());
    
    insertRecord(SHEET_NAMES.NDA_REQ, {
      REQ_ID: reqId,
      DEAL_ID: dealId,
      User_Email: userEmail,
      User_Name: userName,
      User_Phone: cleanPhone,
      Doc_ID: docId,
      Status: NDA_STATUS.PENDING,
      Access_Expiry: formatDate(expiryDate, 'yyyy-MM-dd'),
      Created_At: formatDate(new Date()),
      Updated_At: formatDate(new Date())
    });
    
    // 7. 운영팀 알림
    sendToGoogleChat(
      `📝 *NDA 서명 요청*\n` +
      `• 딜: ${dealId}\n` +
      `• 신청자: ${userName} (${userEmail})\n` +
      `• 문서 ID: ${docId}`
    );
    
    Logger.log(`[UcanSign] NDA 요청 완료 - REQ_ID: ${reqId}, Doc_ID: ${docId}`);
    
    return {
      success: true,
      data: { reqId, docId },
      message: '서명 요청이 발송되었습니다. 카카오톡을 확인해주세요.'
    };
    
  } catch (error) {
    Logger.log(`[UcanSign] NDA 요청 실패: ${error.message}`);
    sendToGoogleChat(`❌ *NDA 요청 오류*\n${error.message}\n\nParams: ${JSON.stringify(params)}`);
    
    return {
      success: false,
      data: null,
      message: error.message
    };
  }
}

/**
 * 유캔사인 API 호출 (내부 함수)
 * 
 * @param {Object} config - API 설정 { apiKey, apiSecret, templateId }
 * @param {Object} requestData - 요청 데이터
 * @returns {string} - 생성된 문서 ID
 */
function callUcanSignAPI(config, requestData) {
  const { apiKey, apiSecret } = config;
  
  if (!apiKey || !apiSecret) {
    throw new Error('유캔사인 API 키가 설정되지 않았습니다.');
  }
  
  // API 인증 헤더 생성 (Basic Auth 또는 Bearer Token)
  const authHeader = Utilities.base64Encode(`${apiKey}:${apiSecret}`);
  
  const payload = {
    template_id: requestData.templateId,
    signer: {
      name: requestData.signerName,
      phone: requestData.signerPhone,
      email: requestData.signerEmail
    },
    options: {
      phone_verification: requestData.enablePhoneVerification,
      send_kakao: true,
      send_email: true,
      auto_reminder: true,
      callback_url: getWebhookCallbackUrl()
    },
    metadata: {
      deal_id: requestData.dealId,
      source: 'VS_AI_ERP'
    }
  };
  
  try {
    const response = UrlFetchApp.fetch(`${UCANSIGN_BASE_URL}/documents/create-from-template`, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'X-Request-ID': Utilities.getUuid()
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
    const statusCode = response.getResponseCode();
    const responseBody = JSON.parse(response.getContentText());
    
    if (statusCode >= 200 && statusCode < 300) {
      return responseBody.document_id || responseBody.doc_id;
    } else {
      throw new Error(`유캔사인 API 오류 (${statusCode}): ${responseBody.message || responseBody.error}`);
    }
    
  } catch (error) {
    Logger.log(`[UcanSign API] 호출 실패: ${error.message}`);
    throw new Error(`전자서명 요청 중 오류가 발생했습니다: ${error.message}`);
  }
}

/**
 * Webhook 콜백 URL 반환
 * 이 GAS 웹앱의 doPost URL
 */
function getWebhookCallbackUrl() {
  return ScriptApp.getService().getUrl();
}

// ============================================================
// 서명 완료 Webhook 처리
// ============================================================

/**
 * 유캔사인 서명 완료 Webhook 처리
 * 
 * @param {Object} webhookData - Webhook 페이로드
 * @returns {Object} - 처리 결과
 */
function handleSigningWebhook(webhookData) {
  try {
    Logger.log(`[Webhook] 수신: ${JSON.stringify(webhookData)}`);
    
    const { event, document_id, status, metadata } = webhookData;
    
    // 1. 이벤트 타입 확인
    if (event !== 'document.signed' && status !== 'completed') {
      Logger.log(`[Webhook] 처리 대상 아님: event=${event}, status=${status}`);
      return { success: true, message: '처리 대상 이벤트가 아닙니다.' };
    }
    
    // 2. NDA 요청 레코드 조회
    const ndaRecord = findOneRecord(SHEET_NAMES.NDA_REQ, { Doc_ID: document_id });
    
    if (!ndaRecord) {
      throw new Error(`NDA 레코드를 찾을 수 없습니다: Doc_ID=${document_id}`);
    }
    
    // 3. 이미 처리된 경우 스킵
    if (ndaRecord.Status === NDA_STATUS.SIGNED) {
      Logger.log(`[Webhook] 이미 처리됨: ${ndaRecord.REQ_ID}`);
      return { success: true, message: '이미 처리된 요청입니다.' };
    }
    
    // 4. 딜 정보 조회 (폴더 ID 필요)
    const deal = findOneRecord(SHEET_NAMES.DEAL_ROOM, { DEAL_ID: ndaRecord.DEAL_ID });
    
    if (!deal) {
      throw new Error(`딜을 찾을 수 없습니다: ${ndaRecord.DEAL_ID}`);
    }
    
    // 5. 폴더 접근 권한 부여
    const accessResult = grantFolderAccess(
      deal.Folder_ID_Private,
      ndaRecord.User_Email
    );
    
    if (!accessResult.success) {
      throw new Error(`폴더 권한 부여 실패: ${accessResult.message}`);
    }
    
    // 6. NDA 상태 업데이트
    updateRecord(SHEET_NAMES.NDA_REQ, ndaRecord._rowIndex, {
      Status: NDA_STATUS.SIGNED,
      Signed_At: formatDate(new Date()),
      Updated_At: formatDate(new Date())
    });
    
    // 7. 알림 발송
    sendToGoogleChat(
      `✅ *NDA 서명 완료*\n` +
      `• 딜: ${ndaRecord.DEAL_ID}\n` +
      `• 서명자: ${ndaRecord.User_Name} (${ndaRecord.User_Email})\n` +
      `• 만료일: ${ndaRecord.Access_Expiry}`
    );
    
    // 8. 서명자에게 안내 이메일 발송 (선택적)
    sendAccessGrantedEmail(ndaRecord, deal);
    
    Logger.log(`[Webhook] 처리 완료: ${ndaRecord.REQ_ID}`);
    
    return {
      success: true,
      message: 'NDA 서명 처리 완료',
      data: { reqId: ndaRecord.REQ_ID }
    };
    
  } catch (error) {
    Logger.log(`[Webhook] 처리 실패: ${error.message}`);
    sendToGoogleChat(`❌ *Webhook 처리 오류*\n${error.message}`);
    
    return {
      success: false,
      message: error.message
    };
  }
}

// ============================================================
// Google Drive 권한 관리
// ============================================================

/**
 * Google Drive 폴더에 사용자 접근 권한 부여
 * 
 * @param {string} folderId - Drive 폴더 ID
 * @param {string} email - 권한을 부여할 이메일
 * @returns {Object} - { success, message }
 */
function grantFolderAccess(folderId, email) {
  try {
    if (!folderId) {
      throw new Error('폴더 ID가 지정되지 않았습니다.');
    }
    
    if (!email || !email.includes('@')) {
      throw new Error('유효하지 않은 이메일 주소입니다.');
    }
    
    // 1. 폴더 존재 확인
    const folder = DriveApp.getFolderById(folderId);
    
    // 2. 기존 권한 확인
    const viewers = folder.getViewers();
    const alreadyHasAccess = viewers.some(viewer => viewer.getEmail() === email);
    
    if (alreadyHasAccess) {
      Logger.log(`[Drive] 이미 권한 있음: ${email} -> ${folderId}`);
      return {
        success: true,
        message: '이미 접근 권한이 있습니다.'
      };
    }
    
    // 3. 뷰어 권한 부여 (알림 이메일 발송 옵션)
    folder.addViewer(email);
    
    Logger.log(`[Drive] 권한 부여 완료: ${email} -> ${folderId}`);
    
    return {
      success: true,
      message: '폴더 접근 권한이 부여되었습니다.'
    };
    
  } catch (error) {
    Logger.log(`[Drive] 권한 부여 실패: ${error.message}`);
    
    // 권한 없는 경우 별도 처리
    if (error.message.includes('Access denied') || error.message.includes('not found')) {
      sendToGoogleChat(
        `⚠️ *폴더 권한 문제*\n` +
        `폴더 ID: ${folderId}\n` +
        `대상: ${email}\n` +
        `오류: ${error.message}\n\n` +
        `폴더가 존재하는지, GAS 계정이 폴더 관리 권한이 있는지 확인해주세요.`
      );
    }
    
    return {
      success: false,
      message: error.message
    };
  }
}

/**
 * 폴더 접근 권한 해제 (만료 처리용)
 * 
 * @param {string} folderId - Drive 폴더 ID
 * @param {string} email - 권한을 해제할 이메일
 * @returns {Object} - { success, message }
 */
function revokeFolderAccess(folderId, email) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    folder.removeViewer(email);
    
    Logger.log(`[Drive] 권한 해제 완료: ${email} <- ${folderId}`);
    
    return {
      success: true,
      message: '폴더 접근 권한이 해제되었습니다.'
    };
    
  } catch (error) {
    Logger.log(`[Drive] 권한 해제 실패: ${error.message}`);
    
    return {
      success: false,
      message: error.message
    };
  }
}

// ============================================================
// NDA 만료 처리
// ============================================================

/**
 * 만료된 NDA 접근 권한 일괄 해제 (Time-driven Trigger용)
 * 매일 새벽에 실행하도록 트리거 설정 권장
 */
function revokeExpiredNDAAccess() {
  try {
    Logger.log('[NDA 만료 처리] 시작');
    
    const today = formatDate(new Date(), 'yyyy-MM-dd');
    const ndaRecords = getSheetDataAsObjects(SHEET_NAMES.NDA_REQ);
    
    let revokedCount = 0;
    
    for (const nda of ndaRecords) {
      // Signed 상태이고 만료일이 지난 경우
      if (nda.Status === NDA_STATUS.SIGNED && nda.Access_Expiry && nda.Access_Expiry < today) {
        
        // 딜 정보 조회
        const deal = findOneRecord(SHEET_NAMES.DEAL_ROOM, { DEAL_ID: nda.DEAL_ID });
        
        if (deal && deal.Folder_ID_Private) {
          // 권한 해제
          const result = revokeFolderAccess(deal.Folder_ID_Private, nda.User_Email);
          
          if (result.success) {
            // 상태 업데이트
            updateRecord(SHEET_NAMES.NDA_REQ, nda._rowIndex, {
              Status: NDA_STATUS.EXPIRED,
              Updated_At: formatDate(new Date())
            });
            
            revokedCount++;
            Logger.log(`[NDA 만료] 처리됨: ${nda.REQ_ID} (${nda.User_Email})`);
          }
        }
      }
    }
    
    if (revokedCount > 0) {
      sendToGoogleChat(`🔒 *NDA 만료 처리 완료*\n만료 처리된 접근 권한: ${revokedCount}건`);
    }
    
    Logger.log(`[NDA 만료 처리] 완료: ${revokedCount}건 처리`);
    
  } catch (error) {
    Logger.log(`[NDA 만료 처리] 오류: ${error.message}`);
    sendToGoogleChat(`❌ *NDA 만료 처리 오류*\n${error.message}`);
  }
}

// ============================================================
// 이메일 알림
// ============================================================

/**
 * 접근 권한 부여 완료 이메일 발송
 * 
 * @param {Object} ndaRecord - NDA 레코드
 * @param {Object} deal - 딜 정보
 */
function sendAccessGrantedEmail(ndaRecord, deal) {
  try {
    const subject = `[VS AI ERP] ${deal.DEAL_ID} 데이터룸 접근 권한이 부여되었습니다`;
    
    const body = `
안녕하세요, ${ndaRecord.User_Name}님.

NDA 서명이 완료되어 데이터룸 접근 권한이 부여되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📂 딜 정보
• 딜 ID: ${deal.DEAL_ID}
• 접근 만료일: ${ndaRecord.Access_Expiry}

📌 주의사항
• 본 자료는 NDA에 따라 비밀이 유지되어야 합니다.
• 제3자에게 공유하거나 외부로 유출하지 마세요.
• 접근 권한은 만료일에 자동으로 해제됩니다.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

감사합니다.
VS AI ERP 운영팀
    `.trim();
    
    MailApp.sendEmail({
      to: ndaRecord.User_Email,
      subject: subject,
      body: body
    });
    
    Logger.log(`[Email] 접근 권한 안내 발송: ${ndaRecord.User_Email}`);
    
  } catch (error) {
    Logger.log(`[Email] 발송 실패: ${error.message}`);
    // 이메일 실패는 크리티컬하지 않으므로 에러를 던지지 않음
  }
}

// ============================================================
// NDA 상태 조회
// ============================================================

/**
 * 사용자의 특정 딜에 대한 NDA 상태 조회
 * 
 * @param {string} dealId - 딜 ID
 * @param {string} userEmail - 사용자 이메일
 * @returns {Object} - NDA 상태 정보
 */
function checkNDAStatus(dealId, userEmail) {
  const nda = findOneRecord(SHEET_NAMES.NDA_REQ, {
    DEAL_ID: dealId,
    User_Email: userEmail
  });
  
  if (!nda) {
    return {
      hasNDA: false,
      status: null,
      message: 'NDA 신청 내역이 없습니다.'
    };
  }
  
  // 만료 여부 확인
  if (nda.Status === NDA_STATUS.SIGNED && nda.Access_Expiry) {
    const today = new Date();
    const expiry = new Date(nda.Access_Expiry);
    
    if (expiry < today) {
      return {
        hasNDA: true,
        status: NDA_STATUS.EXPIRED,
        message: '접근 권한이 만료되었습니다. 재신청이 필요합니다.'
      };
    }
  }
  
  return {
    hasNDA: true,
    status: nda.Status,
    accessExpiry: nda.Access_Expiry,
    message: nda.Status === NDA_STATUS.SIGNED 
      ? '접근 권한이 유효합니다.'
      : nda.Status === NDA_STATUS.PENDING
        ? '서명 대기 중입니다.'
        : `현재 상태: ${nda.Status}`
  };
}

// ============================================================
// 테스트 함수
// ============================================================

/**
 * UcanSign 모듈 테스트
 */
function testUcanSignModule() {
  Logger.log('=== UcanSign 모듈 테스트 ===');
  
  // NDA 상태 조회 테스트
  const status = checkNDAStatus('DEAL_TEST_001', 'test@example.com');
  Logger.log(`NDA 상태: ${JSON.stringify(status)}`);
  
  Logger.log('=== 테스트 완료 ===');
}
