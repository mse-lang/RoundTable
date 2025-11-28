/**
 * ============================================================
 * VS AI ERP - GeminiAnalyzer.gs
 * Gemini AI 기반 문서 분석 및 리포트 생성 모듈
 * ============================================================
 * 
 * Google Drive의 기업 자료를 Gemini 1.5 Pro로 분석하여
 * 투자심사보고서(Full Report)와 비실명 티저(Teaser)를 생성합니다.
 * 
 * 주요 기능:
 * - Drive 폴더 내 문서 자동 수집 및 텍스트 추출
 * - Gemini API를 통한 재무/비재무 분석
 * - 투자심사보고서 PDF 생성
 * - 비실명 티저 요약본 생성
 */

// ============================================================
// 상수 정의
// ============================================================

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

/**
 * 지원하는 파일 형식
 */
const SUPPORTED_MIME_TYPES = {
  // 문서
  'application/pdf': 'PDF',
  'application/vnd.google-apps.document': 'Google Docs',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
  'application/msword': 'Word',
  // 스프레드시트
  'application/vnd.google-apps.spreadsheet': 'Google Sheets',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'Excel',
  'application/vnd.ms-excel': 'Excel',
  // 프레젠테이션
  'application/vnd.google-apps.presentation': 'Google Slides',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'PowerPoint',
  // 텍스트
  'text/plain': 'Text',
  'text/csv': 'CSV'
};

/**
 * 분석 프롬프트 템플릿
 */
const ANALYSIS_PROMPTS = {
  
  // 라운드테이블 적정 가치 지수 산출 보고서
  FULL_REPORT: `# Role: 전문 벤처캐피탈(VC) 심사역 및 기업가치 평가 전문가

# Task
현재 폴더(또는 제공된 문서들)에 있는 기업 자료(IR 패키지, 재무제표, 사업자등록증, 이력서 등)를 종합적으로 분석하여, 해당 기업의 투자 매력도를 정량화한 **'라운드테이블 적정 가치 지수(Roundtable Valuation Index)'**를 산출하고 상세 리포트를 작성해 주세요.

## 분석 자료
{documents}

# Process & Guidelines

## 1. 기업 개요 및 단계 파악 (Context Identification)
제공된 문서를 바탕으로 다음 핵심 정보를 가장 먼저 추출하세요.
- **기업명:**
- **핵심 기술/제품:**
- **주력 산업군(Industry Group):** (예: AI/SaaS, 바이오/헬스케어, 하드웨어/제조, 플랫폼/서비스 등)
- **현재 성장 단계(Growth Stage):** (예: Seed, Pre-A, Series A, Series B 이상)
  *판단 기준: 누적 투자금, 매출 규모, 제품 개발 현황 등을 종합 고려

## 2. '라운드테이블 가중치 매트릭스' 적용 (Weighting Matrix)
기업의 **성장 단계**와 **산업군**에 따라 아래의 평가 항목 가중치를 유동적으로 조정하여 적용하세요.

**(1) 성장 단계별 기본 가중치 (Base Weights)**
* **초기 단계 (Seed ~ Pre-A):**
  - 팀/경영진 역량 (40%)
  - 기술/특허 경쟁력 (30%)
  - 시장 규모 및 성장성 (20%)
  - 재무/매출 실적 (10%)
* **성장 단계 (Series A ~ B):**
  - 재무/매출 성장률 (30%)
  - 시장 점유율 및 지표 (30%)
  - 팀/운영 효율성 (20%)
  - 기술 해자/확장성 (20%)
* **성장 후기 (Series C 이상):**
  - 영업이익/현금흐름 (40%)
  - 시장 지배력 (30%)
  - 글로벌 확장성 (20%)
  - 경영진/조직 관리 (10%)

**(2) 산업군별 가중치 조정 (Industry Adjustment)**
* **바이오/딝테크:** '기술/특허' 항목 가중치 +10%p, '매출 실적' -10%p
* **플랫폼/서비스:** '시장 지표(MAU 등)' 가중치 +10%p, '기술' -10%p
* **제조/하드웨어:** '생산/양산 능력'을 기술 항목에 포함하여 평가

## 3. 평가 및 지수 산출 (Scoring)
위 가중치를 기준으로 각 항목을 100점 만점으로 평가한 뒤, 가중 평균을 내어 **총점(라운드테이블 적정 가치 지수)**을 계산하세요.
* **평가 근거:** 각 점수를 부여한 구체적인 근거를 문서 내의 팩트(숫자, 경력, 특허 등)를 인용하여 제시해야 합니다.

## 4. 최종 산출물 형식 (Output Format)

다음 형식으로 마크다운 보고서를 작성해주세요:

---

# [분석 보고서] : {기업명}

## 1. 기업 스냅샷
* **산업군:** {산업군}
* **성장 단계:** {단계}
* **핵심 가치 제안:** {한 줄 요약}

## 2. 라운드테이블 적정 가치 지수: {총점}점 / 100점
*(평가 등급: S(90~), A(80~), B(70~), C(60~), D(60미만))*

## 3. 세부 평가 항목 및 근거
| 평가 항목 | 가중치 | 점수 | 핵심 근거 (문서 인용) |
| :--- | :---: | :---: | :--- |
| **팀/경영진** | {00}% | {00}점 | (예: CEO의 00분야 10년 경력, 이력서 확인) |
| **기술/제품** | {00}% | {00}점 | (예: 특허 0건 보유, 기술차별성 내용) |
| **시장성** | {00}% | {00}점 | (예: TAM 00조 원, 연평균 성장률 00%) |
| **재무/실적** | {00}% | {00}점 | (예: 전년 대비 매출 00% 성장) |

## 4. 항목별 상세 분석

### 4.1 팀/경영진 역량
- 대표자 경력 및 역량
- 핵심 인력 구성
- 조직 문화 및 실행력

### 4.2 기술/제품 경쟁력
- 핵심 기술 및 IP 현황
- 제품 차별화 포인트
- 기술 로드맵

### 4.3 시장 분석
- TAM/SAM/SOM 추정
- 시장 트렌드 및 성장성
- 경쟁 환경 분석

### 4.4 재무 분석
- 매출 현황 및 추이
- 수익성 지표
- 현금흐름 상태

## 5. 밸류에이션 제언
* **희망 기업가치(Pre-Money):** {문서 내 수치} (확인 불가 시 추정)
* **적정성 코멘트:** 위 지수와 동종 업계 평균(Peer Group)을 고려했을 때, 해당 기업가치의 적정성 여부 및 투자 시 유의해야 할 리스크 요인.

## 6. 리스크 요인
- 사업 리스크
- 시장 리스크
- 재무 리스크
- 경영 리스크

## 7. 종합 투자 의견
- 투자 추천 여부 (강력 추천 / 추천 / 조건부 추천 / 비추천)
- 핵심 투자 포인트 3가지
- 예상 수익률 및 Exit 시나리오

---

마크다운 형식으로 작성하고, 테이블은 반드시 마크다운 테이블 형식을 사용하세요.`,

  // 비실명 티저 생성 (라운드테이블 적정 가치 지수 기반)
  TEASER: `당신은 벤처캐피탈의 딜소싱 담당자입니다.
아래 '라운드테이블 적정 가치 지수' 분석 자료를 바탕으로 투자자들의 관심을 끌 수 있는 비실명 티저를 작성해주세요.

## 원본 분석 자료
{fullReport}

## 작성 규칙
1. **회사명, 대표자명, 구체적 주소 등 식별 가능한 정보는 절대 포함하지 마세요**
2. 업종과 사업 모델은 일반화하여 표현
3. 구체적 수치는 범위로 표현 (예: "매출 50억" → "매출 50억~100억 규모")
4. '라운드테이블 적정 가치 지수'와 평가 등급을 반드시 포함
5. 투자자의 호기심을 자극하는 간결한 문체 사용

## 티저 구성

### 📊 라운드테이블 지수
**{점수}점 / 100점** ({등급} 등급)

### 🏢 한줄 소개
(업종 + 핵심 가치 제안, 30자 이내)

### 📈 사업 개요
(비즈니스 모델과 시장 기회, 100자 내외)

### 💹 주요 지표
- 매출 규모: (범위로)
- 성장률: (범위로)  
- 고객 수/MAU: (범위로)
- 성장 단계: (Seed/Series A/B 등)

### ⭐ 투자 하이라이트
1. (핵심 강점 1)
2. (핵심 강점 2)
3. (핵심 강점 3)

### ⚠️ 주요 체크포인트
(투자 검토 시 확인이 필요한 사항 1-2가지)

### 💰 희망 조건
- 투자 형태:
- 밸류에이션 범위:
- 자금 사용 계획:

마크다운 형식으로 작성해주세요.`,

  // 빠른 요약 (라운드테이블 적정 가치 지수 산출용)
  QUICK_SUMMARY: `아래 문서를 분석하여 '라운드테이블 적정 가치 지수' 산출에 필요한 항목을 JSON 형식으로 추출해주세요:

## 문서
{documents}

## 추출 항목
{
  "company_name": "회사명",
  "industry_group": "주력 산업군 (AI/SaaS, 바이오/헬스케어, 하드웨어/제조, 플랫폼/서비스, 핀테크, 이커머스, 기타 중 하나)",
  "growth_stage": "성장 단계 (Seed, Pre-A, Series A, Series B, Series C+)",
  "core_product": "핵심 기술/제품 (30자)",
  "business_model": "비즈니스 모델 요약 (50자)",
  "revenue": "최근 매출 (숫자 또는 범위)",
  "revenue_growth": "매출 성장률 (%)",
  "key_metrics": ["핵심 지표 1", "핵심 지표 2", "핵심 지표 3"],
  "team_highlights": ["팀 강점 1", "팀 강점 2"],
  "tech_highlights": ["기술 강점 1", "기술 강점 2"],
  "market_size": "TAM 시장규모",
  "strengths": ["강점 1", "강점 2", "강점 3"],
  "risks": ["리스크 1", "리스크 2"],
  "target_valuation": "희망 밸류에이션",
  "funding_amount": "희망 투자금액",
  "roundtable_index_estimate": "예상 지수 (0-100)",
  "grade_estimate": "예상 등급 (S/A/B/C/D)"
}

JSON만 반환하세요. 추가 설명 없이.`
};

// ============================================================
// 메인 분석 함수
// ============================================================

/**
 * 딜 분석 시작 (메인 함수)
 * 운영자가 '분석 시작' 버튼 클릭 시 호출
 * 
 * @param {string} dealId - 딜 ID
 * @param {string} sourceFolderId - 원본 자료 폴더 ID
 * @returns {Object} - { success, fullReportUrl, teaserUrl, summary }
 */
function startDealAnalysis(dealId, sourceFolderId) {
  const startTime = new Date();
  
  try {
    Logger.log(`[Gemini] 딜 분석 시작: ${dealId}`);
    sendToGoogleChat(`🔍 *딜 분석 시작*\n딜 ID: ${dealId}`);
    
    // 1. 폴더에서 문서 수집
    Logger.log('[Gemini] 1단계: 문서 수집');
    const documents = collectDocumentsFromFolder(sourceFolderId);
    
    if (documents.length === 0) {
      throw new Error('분석할 문서가 없습니다. 폴더에 파일을 추가해주세요.');
    }
    
    Logger.log(`[Gemini] 수집된 문서: ${documents.length}개`);
    
    // 2. 문서 텍스트 추출
    Logger.log('[Gemini] 2단계: 텍스트 추출');
    const extractedTexts = documents.map(doc => ({
      name: doc.name,
      type: doc.type,
      content: extractTextFromFile(doc.file)
    }));
    
    // 3. Gemini로 종합 분석
    Logger.log('[Gemini] 3단계: AI 분석 (투자심사보고서)');
    const fullReport = generateFullReport(extractedTexts);
    
    // 4. 비실명 티저 생성
    Logger.log('[Gemini] 4단계: 비실명 티저 생성');
    const teaser = generateTeaser(fullReport);
    
    // 5. 빠른 요약 추출 (메타데이터용)
    Logger.log('[Gemini] 5단계: 메타데이터 추출');
    const summary = extractQuickSummary(extractedTexts);
    
    // 6. PDF 생성 및 저장
    Logger.log('[Gemini] 6단계: PDF 생성');
    const deal = findOneRecord(SHEET_NAMES.DEAL_ROOM, { DEAL_ID: dealId });
    
    let fullReportUrl = '';
    let teaserUrl = '';
    
    if (deal && deal.Folder_ID_Private) {
      fullReportUrl = createReportPDF(
        deal.Folder_ID_Private, 
        `투자심사보고서_${dealId}`, 
        fullReport
      );
    }
    
    if (deal && deal.Folder_ID_Public) {
      teaserUrl = createReportPDF(
        deal.Folder_ID_Public,
        `티저_${dealId}`,
        teaser
      );
    }
    
    // 7. DB 업데이트
    if (deal) {
      updateRecord(SHEET_NAMES.DEAL_ROOM, deal._rowIndex, {
        Full_Report_Link: fullReportUrl,
        Teaser_Link: teaserUrl,
        Stage: 'Review',  // 검토 단계로 변경
        Updated_At: formatDate(new Date())
      });
    }
    
    // 8. 완료 알림
    const duration = Math.round((new Date() - startTime) / 1000);
    sendToGoogleChat(
      `✅ *딜 분석 완료*\n` +
      `• 딜 ID: ${dealId}\n` +
      `• 분석 문서: ${documents.length}개\n` +
      `• 소요 시간: ${duration}초\n` +
      `• 상태: Review (검토 대기)\n\n` +
      `📄 투자심사보고서: ${fullReportUrl || '(폴더 미설정)'}\n` +
      `📋 티저: ${teaserUrl || '(폴더 미설정)'}`
    );
    
    Logger.log(`[Gemini] 분석 완료: ${duration}초 소요`);
    
    return {
      success: true,
      fullReportUrl: fullReportUrl,
      teaserUrl: teaserUrl,
      summary: summary,
      documentCount: documents.length,
      duration: duration
    };
    
  } catch (error) {
    Logger.log(`[Gemini] 분석 실패: ${error.message}`);
    sendToGoogleChat(`❌ *딜 분석 오류*\n딜: ${dealId}\n오류: ${error.message}`);
    
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================================
// 문서 수집 및 텍스트 추출
// ============================================================

/**
 * 폴더에서 분석 가능한 문서 수집
 * 
 * @param {string} folderId - Google Drive 폴더 ID
 * @returns {Array} - [{ file, name, type, mimeType }]
 */
function collectDocumentsFromFolder(folderId) {
  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  const documents = [];
  
  while (files.hasNext()) {
    const file = files.next();
    const mimeType = file.getMimeType();
    const fileName = file.getName();
    
    // 지원하는 파일 형식인지 확인
    if (SUPPORTED_MIME_TYPES[mimeType]) {
      // 최신 버전 파일 선별 (파일명에 버전 정보가 있는 경우)
      // 예: "사업계획서_v3.pdf" > "사업계획서_v2.pdf"
      documents.push({
        file: file,
        name: fileName,
        type: SUPPORTED_MIME_TYPES[mimeType],
        mimeType: mimeType,
        lastUpdated: file.getLastUpdated()
      });
    }
  }
  
  // 최신순 정렬
  documents.sort((a, b) => b.lastUpdated - a.lastUpdated);
  
  // 같은 기본 이름의 파일 중 최신 버전만 유지
  const latestVersions = filterLatestVersions(documents);
  
  return latestVersions;
}

/**
 * 동일 파일의 최신 버전만 필터링
 * 
 * @param {Array} documents - 문서 배열
 * @returns {Array} - 필터링된 문서 배열
 */
function filterLatestVersions(documents) {
  const versionPattern = /(.+?)(?:_v\d+|_버전\d+|\(\d+\))?(\.[^.]+)$/i;
  const latestMap = new Map();
  
  documents.forEach(doc => {
    const match = doc.name.match(versionPattern);
    const baseName = match ? match[1] + match[2] : doc.name;
    
    if (!latestMap.has(baseName) || doc.lastUpdated > latestMap.get(baseName).lastUpdated) {
      latestMap.set(baseName, doc);
    }
  });
  
  return Array.from(latestMap.values());
}

/**
 * 파일에서 텍스트 추출
 * 
 * @param {GoogleAppsScript.Drive.File} file - Drive 파일 객체
 * @returns {string} - 추출된 텍스트
 */
function extractTextFromFile(file) {
  const mimeType = file.getMimeType();
  
  try {
    switch (mimeType) {
      case 'application/vnd.google-apps.document':
        return extractFromGoogleDoc(file);
        
      case 'application/vnd.google-apps.spreadsheet':
        return extractFromGoogleSheet(file);
        
      case 'application/vnd.google-apps.presentation':
        return extractFromGoogleSlides(file);
        
      case 'application/pdf':
        return extractFromPDF(file);
        
      case 'text/plain':
      case 'text/csv':
        return file.getBlob().getDataAsString();
        
      default:
        // Word, Excel, PPT 등은 Google 형식으로 변환 후 추출
        return extractFromConvertedFile(file);
    }
  } catch (error) {
    Logger.log(`[Gemini] 텍스트 추출 실패 (${file.getName()}): ${error.message}`);
    return `[파일 추출 오류: ${file.getName()}]`;
  }
}

/**
 * Google Docs에서 텍스트 추출
 */
function extractFromGoogleDoc(file) {
  const doc = DocumentApp.openById(file.getId());
  return doc.getBody().getText();
}

/**
 * Google Sheets에서 텍스트 추출
 */
function extractFromGoogleSheet(file) {
  const ss = SpreadsheetApp.openById(file.getId());
  const sheets = ss.getSheets();
  let text = '';
  
  sheets.forEach(sheet => {
    text += `\n=== ${sheet.getName()} ===\n`;
    const data = sheet.getDataRange().getValues();
    data.forEach(row => {
      text += row.join('\t') + '\n';
    });
  });
  
  return text;
}

/**
 * Google Slides에서 텍스트 추출
 */
function extractFromGoogleSlides(file) {
  const presentation = SlidesApp.openById(file.getId());
  const slides = presentation.getSlides();
  let text = '';
  
  slides.forEach((slide, index) => {
    text += `\n=== 슬라이드 ${index + 1} ===\n`;
    slide.getShapes().forEach(shape => {
      if (shape.getText) {
        text += shape.getText().asString() + '\n';
      }
    });
  });
  
  return text;
}

/**
 * PDF에서 텍스트 추출 (OCR 사용)
 */
function extractFromPDF(file) {
  // PDF를 Google Docs로 변환하여 텍스트 추출
  const blob = file.getBlob();
  const resource = {
    title: file.getName() + '_temp',
    mimeType: 'application/vnd.google-apps.document'
  };
  
  try {
    const tempFile = Drive.Files.insert(resource, blob, { ocr: true });
    const doc = DocumentApp.openById(tempFile.id);
    const text = doc.getBody().getText();
    
    // 임시 파일 삭제
    DriveApp.getFileById(tempFile.id).setTrashed(true);
    
    return text;
  } catch (error) {
    Logger.log(`[Gemini] PDF OCR 실패: ${error.message}`);
    return `[PDF 추출 실패: ${file.getName()}]`;
  }
}

/**
 * Office 파일을 Google 형식으로 변환 후 추출
 */
function extractFromConvertedFile(file) {
  const blob = file.getBlob();
  const mimeType = file.getMimeType();
  
  let targetMimeType;
  if (mimeType.includes('word')) {
    targetMimeType = 'application/vnd.google-apps.document';
  } else if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) {
    targetMimeType = 'application/vnd.google-apps.spreadsheet';
  } else if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) {
    targetMimeType = 'application/vnd.google-apps.presentation';
  } else {
    return `[지원하지 않는 형식: ${mimeType}]`;
  }
  
  try {
    const resource = {
      title: file.getName() + '_temp',
      mimeType: targetMimeType
    };
    
    const tempFile = Drive.Files.insert(resource, blob);
    let text = '';
    
    if (targetMimeType.includes('document')) {
      text = extractFromGoogleDoc(DriveApp.getFileById(tempFile.id));
    } else if (targetMimeType.includes('spreadsheet')) {
      text = extractFromGoogleSheet(DriveApp.getFileById(tempFile.id));
    } else if (targetMimeType.includes('presentation')) {
      text = extractFromGoogleSlides(DriveApp.getFileById(tempFile.id));
    }
    
    // 임시 파일 삭제
    DriveApp.getFileById(tempFile.id).setTrashed(true);
    
    return text;
  } catch (error) {
    Logger.log(`[Gemini] 파일 변환 실패: ${error.message}`);
    return `[변환 실패: ${file.getName()}]`;
  }
}

// ============================================================
// Gemini API 호출
// ============================================================

/**
 * Gemini API 호출
 * 
 * @param {string} prompt - 프롬프트
 * @param {Object} options - 옵션 { temperature, maxTokens }
 * @returns {string} - 생성된 텍스트
 */
function callGeminiAPI(prompt, options = {}) {
  const apiKey = getGeminiApiKey();
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
  }
  
  const { temperature = 0.7, maxTokens = 8192 } = options;
  
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: maxTokens,
      topP: 0.95,
      topK: 40
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
    ]
  };
  
  const response = UrlFetchApp.fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
  
  const statusCode = response.getResponseCode();
  const responseBody = JSON.parse(response.getContentText());
  
  if (statusCode !== 200) {
    const error = responseBody.error?.message || 'Gemini API 오류';
    throw new Error(`Gemini API 실패 (${statusCode}): ${error}`);
  }
  
  const generatedText = responseBody.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!generatedText) {
    throw new Error('Gemini 응답에서 텍스트를 찾을 수 없습니다.');
  }
  
  return generatedText;
}

/**
 * 투자심사보고서 생성
 * 
 * @param {Array} documents - [{ name, type, content }]
 * @returns {string} - 마크다운 형식의 보고서
 */
function generateFullReport(documents) {
  // 문서 내용 합치기
  const documentsText = documents.map(doc => 
    `\n### ${doc.name} (${doc.type})\n${doc.content.substring(0, 15000)}`  // 토큰 제한 고려
  ).join('\n---\n');
  
  const prompt = ANALYSIS_PROMPTS.FULL_REPORT.replace('{documents}', documentsText);
  
  return callGeminiAPI(prompt, { temperature: 0.5, maxTokens: 8192 });
}

/**
 * 비실명 티저 생성
 * 
 * @param {string} fullReport - 투자심사보고서 전문
 * @returns {string} - 마크다운 형식의 티저
 */
function generateTeaser(fullReport) {
  const prompt = ANALYSIS_PROMPTS.TEASER.replace('{fullReport}', fullReport);
  
  return callGeminiAPI(prompt, { temperature: 0.7, maxTokens: 2048 });
}

/**
 * 빠른 요약 추출 (메타데이터)
 * 
 * @param {Array} documents - 문서 배열
 * @returns {Object} - 파싱된 요약 객체
 */
function extractQuickSummary(documents) {
  try {
    const documentsText = documents.map(doc => 
      `${doc.name}: ${doc.content.substring(0, 5000)}`
    ).join('\n---\n');
    
    const prompt = ANALYSIS_PROMPTS.QUICK_SUMMARY.replace('{documents}', documentsText);
    const response = callGeminiAPI(prompt, { temperature: 0.3, maxTokens: 1024 });
    
    // JSON 파싱
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    return null;
  } catch (error) {
    Logger.log(`[Gemini] 요약 추출 실패: ${error.message}`);
    return null;
  }
}

// ============================================================
// PDF 생성
// ============================================================

/**
 * 마크다운 보고서를 PDF로 변환하여 저장
 * 
 * @param {string} folderId - 저장할 폴더 ID
 * @param {string} fileName - 파일명 (확장자 제외)
 * @param {string} markdownContent - 마크다운 내용
 * @returns {string} - PDF 파일 URL
 */
function createReportPDF(folderId, fileName, markdownContent) {
  try {
    const folder = DriveApp.getFolderById(folderId);
    
    // Google Docs로 먼저 생성
    const doc = DocumentApp.create(fileName);
    const body = doc.getBody();
    
    // 마크다운을 간단히 포맷팅하여 삽입
    const formattedContent = formatMarkdownForDocs(markdownContent);
    body.setText(formattedContent);
    
    // 스타일 적용
    applyDocumentStyles(body);
    
    doc.saveAndClose();
    
    // PDF로 변환
    const docFile = DriveApp.getFileById(doc.getId());
    const pdfBlob = docFile.getAs('application/pdf');
    pdfBlob.setName(fileName + '.pdf');
    
    // 지정된 폴더에 PDF 저장
    const pdfFile = folder.createFile(pdfBlob);
    
    // 원본 Docs 파일 삭제 (선택적)
    docFile.setTrashed(true);
    
    Logger.log(`[Gemini] PDF 생성 완료: ${pdfFile.getUrl()}`);
    
    return pdfFile.getUrl();
    
  } catch (error) {
    Logger.log(`[Gemini] PDF 생성 실패: ${error.message}`);
    return '';
  }
}

/**
 * 마크다운을 Google Docs 형식으로 변환
 */
function formatMarkdownForDocs(markdown) {
  let text = markdown;
  
  // 마크다운 헤더를 일반 텍스트로 변환
  text = text.replace(/^### (.+)$/gm, '\n▶ $1\n');
  text = text.replace(/^## (.+)$/gm, '\n■ $1\n');
  text = text.replace(/^# (.+)$/gm, '\n━━━ $1 ━━━\n');
  
  // 볼드/이탤릭 제거
  text = text.replace(/\*\*(.+?)\*\*/g, '$1');
  text = text.replace(/\*(.+?)\*/g, '$1');
  
  // 리스트 변환
  text = text.replace(/^- /gm, '• ');
  text = text.replace(/^\d+\. /gm, '  ');
  
  return text;
}

/**
 * 문서 스타일 적용
 */
function applyDocumentStyles(body) {
  // 기본 폰트 설정
  body.setFontFamily('Malgun Gothic');
  body.setFontSize(11);
  
  // 줄간격
  body.getParagraphs().forEach(paragraph => {
    paragraph.setLineSpacing(1.5);
  });
}

// ============================================================
// API 액션 (Code.gs에서 호출)
// ============================================================

/**
 * 딜 분석 요청 처리 (POST action)
 * 
 * @param {Object} params - { dealId, sourceFolderId }
 * @returns {Object}
 */
function handleAnalyzeRequest(params) {
  const { dealId, sourceFolderId } = params;
  
  if (!dealId) {
    return { success: false, message: 'dealId가 필요합니다.' };
  }
  
  // 딜 정보 조회
  const deal = findOneRecord(SHEET_NAMES.DEAL_ROOM, { DEAL_ID: dealId });
  
  if (!deal) {
    return { success: false, message: '딜을 찾을 수 없습니다.' };
  }
  
  // 폴더 ID 결정 (파라미터 > DB 저장값)
  const folderId = sourceFolderId || deal.Folder_ID_Private;
  
  if (!folderId) {
    return { success: false, message: '분석할 폴더가 지정되지 않았습니다.' };
  }
  
  // 분석 시작
  return startDealAnalysis(dealId, folderId);
}

// ============================================================
// 테스트 함수
// ============================================================

/**
 * Gemini API 테스트
 */
function testGeminiAPI() {
  try {
    Logger.log('=== Gemini API 테스트 ===');
    
    const response = callGeminiAPI('안녕하세요. 간단히 자기소개를 해주세요.', {
      temperature: 0.7,
      maxTokens: 256
    });
    
    Logger.log('응답: ' + response);
    Logger.log('=== 테스트 완료 ===');
    
  } catch (error) {
    Logger.log('테스트 실패: ' + error.message);
  }
}

/**
 * 문서 수집 테스트
 */
function testDocumentCollection() {
  // 테스트 폴더 ID로 교체하세요
  const testFolderId = 'YOUR_TEST_FOLDER_ID';
  
  try {
    const documents = collectDocumentsFromFolder(testFolderId);
    Logger.log('수집된 문서:');
    documents.forEach(doc => {
      Logger.log(`- ${doc.name} (${doc.type})`);
    });
  } catch (error) {
    Logger.log('테스트 실패: ' + error.message);
  }
}
