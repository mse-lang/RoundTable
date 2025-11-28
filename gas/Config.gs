/**
 * ============================================================
 * VS AI ERP - Config.gs
 * 데이터베이스 연결 및 시스템 설정 헬퍼 모듈
 * ============================================================
 * 
 * 이 모듈은 Google Sheets 데이터베이스와의 연결,
 * 시스템 설정값 조회, 공통 유틸리티 함수를 제공합니다.
 */

// ============================================================
// 전역 상수
// ============================================================

/**
 * 스프레드시트 ID (VS_Master_DB)
 * 실제 운영 시 Script Properties로 관리 권장
 */
const MASTER_DB_ID = PropertiesService.getScriptProperties().getProperty('MASTER_DB_ID') || '';

/**
 * 시트명 상수
 */
const SHEET_NAMES = {
  DEAL_ROOM: 'TB_DEAL_ROOM',
  NDA_REQ: 'TB_NDA_REQ',
  ROUND_TABLE: 'TB_ROUND_TABLE',
  RT_APPLICATION: 'TB_RT_APPLICATION',
  SYSTEM_CONFIG: 'System_Config'
};

/**
 * API 키 식별자 (System_Config 시트의 KEY 컬럼값)
 */
const CONFIG_KEYS = {
  UCANSIGN_API_KEY: 'UCANSIGN_API_KEY',
  UCANSIGN_API_SECRET: 'UCANSIGN_API_SECRET',
  UCANSIGN_TEMPLATE_ID: 'UCANSIGN_TEMPLATE_ID',
  SOLAPI_API_KEY: 'SOLAPI_API_KEY',
  SOLAPI_API_SECRET: 'SOLAPI_API_SECRET',
  GOOGLE_CHAT_WEBHOOK: 'GOOGLE_CHAT_WEBHOOK',
  NDA_EXPIRY_DAYS: 'NDA_EXPIRY_DAYS'
};

// ============================================================
// 스프레드시트 연결 헬퍼
// ============================================================

/**
 * 마스터 DB 스프레드시트 객체 반환
 * @returns {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function getMasterDB() {
  try {
    if (!MASTER_DB_ID) {
      throw new Error('MASTER_DB_ID가 설정되지 않았습니다. Script Properties를 확인하세요.');
    }
    return SpreadsheetApp.openById(MASTER_DB_ID);
  } catch (error) {
    sendToGoogleChat(`[Config] DB 연결 실패: ${error.message}`);
    throw error;
  }
}

/**
 * 특정 시트 객체 반환
 * @param {string} sheetName - 시트명
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getSheet(sheetName) {
  const ss = getMasterDB();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    const error = new Error(`시트를 찾을 수 없습니다: ${sheetName}`);
    sendToGoogleChat(`[Config] ${error.message}`);
    throw error;
  }
  
  return sheet;
}

/**
 * 시트 데이터를 객체 배열로 반환 (헤더 기준)
 * @param {string} sheetName - 시트명
 * @returns {Object[]} - 데이터 객체 배열
 */
function getSheetDataAsObjects(sheetName) {
  const sheet = getSheet(sheetName);
  const data = sheet.getDataRange().getValues();
  
  if (data.length < 2) {
    return [];
  }
  
  const headers = data[0];
  const rows = data.slice(1);
  
  return rows.map((row, rowIndex) => {
    const obj = { _rowIndex: rowIndex + 2 }; // 실제 시트 행 번호 (1-indexed + 헤더)
    headers.forEach((header, colIndex) => {
      obj[header] = row[colIndex];
    });
    return obj;
  });
}

/**
 * 특정 조건으로 데이터 필터링
 * @param {string} sheetName - 시트명
 * @param {Object} conditions - 필터 조건 { columnName: value }
 * @returns {Object[]} - 필터링된 데이터
 */
function findRecords(sheetName, conditions) {
  const data = getSheetDataAsObjects(sheetName);
  
  return data.filter(row => {
    return Object.entries(conditions).every(([key, value]) => {
      return row[key] === value;
    });
  });
}

/**
 * 단일 레코드 조회 (첫 번째 매칭)
 * @param {string} sheetName - 시트명
 * @param {Object} conditions - 필터 조건
 * @returns {Object|null}
 */
function findOneRecord(sheetName, conditions) {
  const records = findRecords(sheetName, conditions);
  return records.length > 0 ? records[0] : null;
}

/**
 * 새 레코드 추가
 * @param {string} sheetName - 시트명
 * @param {Object} data - 추가할 데이터 객체
 * @returns {number} - 추가된 행 번호
 */
function insertRecord(sheetName, data) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  const rowData = headers.map(header => data[header] || '');
  sheet.appendRow(rowData);
  
  return sheet.getLastRow();
}

/**
 * 레코드 업데이트
 * @param {string} sheetName - 시트명
 * @param {number} rowIndex - 행 번호 (1-indexed)
 * @param {Object} updates - 업데이트할 데이터 { columnName: newValue }
 */
function updateRecord(sheetName, rowIndex, updates) {
  const sheet = getSheet(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  Object.entries(updates).forEach(([columnName, value]) => {
    const colIndex = headers.indexOf(columnName);
    if (colIndex !== -1) {
      sheet.getRange(rowIndex, colIndex + 1).setValue(value);
    }
  });
}

// ============================================================
// 시스템 설정 관리
// ============================================================

/**
 * System_Config에서 설정값 조회
 * @param {string} key - 설정 키
 * @returns {string} - 설정값
 */
function getConfig(key) {
  try {
    const sheet = getSheet(SHEET_NAMES.SYSTEM_CONFIG);
    const data = sheet.getDataRange().getValues();
    
    // KEY, VALUE 컬럼 찾기
    const headers = data[0];
    const keyColIndex = headers.indexOf('KEY');
    const valueColIndex = headers.indexOf('VALUE');
    
    if (keyColIndex === -1 || valueColIndex === -1) {
      throw new Error('System_Config 시트에 KEY 또는 VALUE 컬럼이 없습니다.');
    }
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][keyColIndex] === key) {
        return data[i][valueColIndex];
      }
    }
    
    Logger.log(`[Config] 설정값을 찾을 수 없음: ${key}`);
    return null;
    
  } catch (error) {
    sendToGoogleChat(`[Config] 설정 조회 실패 (${key}): ${error.message}`);
    throw error;
  }
}

/**
 * 유캔사인 API 설정 조회
 * @returns {Object} - { apiKey, apiSecret, templateId }
 */
function getUcanSignConfig() {
  return {
    apiKey: getConfig(CONFIG_KEYS.UCANSIGN_API_KEY),
    apiSecret: getConfig(CONFIG_KEYS.UCANSIGN_API_SECRET),
    templateId: getConfig(CONFIG_KEYS.UCANSIGN_TEMPLATE_ID)
  };
}

/**
 * 솔라피 API 설정 조회
 * @returns {Object} - { apiKey, apiSecret }
 */
function getSolapiConfig() {
  return {
    apiKey: getConfig(CONFIG_KEYS.SOLAPI_API_KEY),
    apiSecret: getConfig(CONFIG_KEYS.SOLAPI_API_SECRET)
  };
}

/**
 * Google Chat Webhook URL 조회
 * @returns {string}
 */
function getGoogleChatWebhook() {
  return getConfig(CONFIG_KEYS.GOOGLE_CHAT_WEBHOOK);
}

/**
 * NDA 만료 일수 조회 (기본값 90일)
 * @returns {number}
 */
function getNDAExpiryDays() {
  const days = getConfig(CONFIG_KEYS.NDA_EXPIRY_DAYS);
  return days ? parseInt(days, 10) : 90;
}

// ============================================================
// 유틸리티 함수
// ============================================================

/**
 * 고유 ID 생성
 * @param {string} prefix - ID 접두사 (예: 'DEAL', 'REQ', 'RT')
 * @returns {string} - 생성된 ID
 */
function generateId(prefix) {
  const now = new Date();
  const dateStr = Utilities.formatDate(now, 'Asia/Seoul', 'yyyyMMdd');
  const randomStr = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}_${dateStr}_${randomStr}`;
}

/**
 * 날짜 포맷팅
 * @param {Date} date - 날짜 객체
 * @param {string} format - 포맷 문자열 (기본: 'yyyy-MM-dd HH:mm:ss')
 * @returns {string}
 */
function formatDate(date, format = 'yyyy-MM-dd HH:mm:ss') {
  return Utilities.formatDate(date, 'Asia/Seoul', format);
}

/**
 * N일 후 날짜 계산
 * @param {number} days - 일수
 * @returns {Date}
 */
function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

/**
 * JSON 응답 생성
 * @param {Object} data - 응답 데이터
 * @param {boolean} success - 성공 여부
 * @param {string} message - 메시지
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function createJsonResponse(data, success = true, message = '') {
  const response = {
    success: success,
    message: message,
    data: data,
    timestamp: formatDate(new Date())
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 에러 응답 생성
 * @param {string} message - 에러 메시지
 * @param {number} code - 에러 코드
 * @returns {GoogleAppsScript.Content.TextOutput}
 */
function createErrorResponse(message, code = 500) {
  return createJsonResponse({ errorCode: code }, false, message);
}

/**
 * Google Chat으로 알림 전송
 * @param {string} message - 알림 메시지
 */
function sendToGoogleChat(message) {
  try {
    const webhookUrl = getGoogleChatWebhook();
    
    if (!webhookUrl) {
      Logger.log(`[Chat] Webhook URL 미설정, 로그만 기록: ${message}`);
      return;
    }
    
    const payload = {
      text: `🔔 *VS AI ERP 알림*\n${message}\n\n_${formatDate(new Date())}_`
    };
    
    UrlFetchApp.fetch(webhookUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    
  } catch (error) {
    Logger.log(`[Chat] 알림 전송 실패: ${error.message}`);
  }
}

// ============================================================
// 딜룸 전용 헬퍼
// ============================================================

/**
 * TB_DEAL_ROOM 시트 조회
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getDealRoomSheet() {
  return getSheet(SHEET_NAMES.DEAL_ROOM);
}

/**
 * TB_NDA_REQ 시트 조회
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getNDAReqSheet() {
  return getSheet(SHEET_NAMES.NDA_REQ);
}

/**
 * TB_ROUND_TABLE 시트 조회
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getRoundTableSheet() {
  return getSheet(SHEET_NAMES.ROUND_TABLE);
}

/**
 * TB_RT_APPLICATION 시트 조회
 * @returns {GoogleAppsScript.Spreadsheet.Sheet}
 */
function getRTApplicationSheet() {
  return getSheet(SHEET_NAMES.RT_APPLICATION);
}

// ============================================================
// 테스트 함수
// ============================================================

/**
 * Config 모듈 테스트
 */
function testConfigModule() {
  try {
    Logger.log('=== Config 모듈 테스트 시작 ===');
    
    // ID 생성 테스트
    const dealId = generateId('DEAL');
    Logger.log(`생성된 DEAL ID: ${dealId}`);
    
    // 날짜 테스트
    const expiryDate = addDays(90);
    Logger.log(`90일 후 만료일: ${formatDate(expiryDate)}`);
    
    Logger.log('=== Config 모듈 테스트 완료 ===');
    
  } catch (error) {
    Logger.log(`테스트 실패: ${error.message}`);
  }
}
