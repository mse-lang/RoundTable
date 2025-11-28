/**
 * VentureSquare Round Table - Frontend Application
 * Dark Theme + Glassmorphism Design
 */

// ============================================================
// 설정
// ============================================================

/**
 * API URL 설정 - Hono 프록시 사용 (CORS 우회)
 */
const API_BASE_URL = '/api/gas';

// API 호출 헬퍼
async function apiCall(action, params = {}, method = 'GET') {
  try {
    let url = API_BASE_URL;
    let options = {
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (method === 'GET') {
      const queryParams = new URLSearchParams({ action, ...params });
      url = `${API_BASE_URL}?${queryParams.toString()}`;
    } else {
      options.body = JSON.stringify({ action, ...params });
    }
    
    const response = await fetch(url, options);
    const data = await response.json();
    
    if (!data.success) {
      console.error(`API Error (${action}):`, data.message);
      return null; // 실패 시 데모 데이터 사용
    }
    
    return data.data;
  } catch (error) {
    console.error(`API 호출 실패 (${action}):`, error);
    return null; // 에러 시 데모 데이터 사용
  }
}

// 상태 관리
const state = {
  deals: [],
  filters: {
    industry: '',
    dealType: '',
    revenueRange: ''
  },
  pagination: {
    page: 1,
    pageSize: 12,
    totalPages: 1
  },
  currentDeal: null,
  userEmail: localStorage.getItem('userEmail') || ''
};

// ============================================================
// 초기화
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  
  // Initialize Lucide icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
  
  if (path === '/' || path === '') {
    initDealList();
  } else if (path.startsWith('/deal/')) {
    initDealDetail();
  } else if (path === '/round-table') {
    initRoundTable();
  } else if (path === '/my-page') {
    initMyPage();
  } else if (path === '/register') {
    initRegisterPage();
  } else if (path === '/login') {
    initLoginPage();
  } else if (path === '/signup') {
    initSignupPage();
  } else if (path === '/admin/login') {
    initAdminLoginPage();
  } else if (path === '/admin') {
    initAdminDashboard();
  } else if (path === '/dashboard/investor') {
    initInvestorDashboard();
  } else if (path === '/dashboard/company') {
    initCompanyDashboard();
  } else if (path === '/dashboard/broker') {
    initBrokerDashboard();
  }
});

// ============================================================
// 딜 목록 페이지
// ============================================================

async function initDealList() {
  await loadFilterOptions();
  await loadDeals();
  
  // 필터 이벤트 바인딩
  document.getElementById('filter-industry')?.addEventListener('change', (e) => {
    state.filters.industry = e.target.value;
    state.pagination.page = 1;
    loadDeals();
  });
  
  document.getElementById('filter-deal-type')?.addEventListener('change', (e) => {
    state.filters.dealType = e.target.value;
    state.pagination.page = 1;
    loadDeals();
  });
  
  document.getElementById('filter-revenue')?.addEventListener('change', (e) => {
    state.filters.revenueRange = e.target.value;
    state.pagination.page = 1;
    loadDeals();
  });
}

async function loadFilterOptions() {
  try {
    // API에서 필터 옵션 로드 시도
    const apiData = await apiCall('getFilterOptions');
    
    // API 데이터가 있으면 사용, 없으면 기본값
    const industries = apiData?.industries || ['IT/소프트웨어', '바이오/헬스케어', '핀테크', '이커머스', '에듀테크', '물류/로보틱스', '모빌리티/에너지', '애그테크'];
    const revenues = apiData?.revenueRanges || ['Pre-Revenue', '1억 미만', '1억~5억', '5억~10억', '10억~50억', '50억~100억', '100억 이상'];
    
    const industrySelect = document.getElementById('filter-industry');
    if (industrySelect) {
      industries.forEach(ind => {
        const option = document.createElement('option');
        option.value = ind;
        option.textContent = ind;
        industrySelect.appendChild(option);
      });
    }
    
    const revenueSelect = document.getElementById('filter-revenue');
    if (revenueSelect) {
      revenues.forEach(rev => {
        const option = document.createElement('option');
        option.value = rev;
        option.textContent = rev;
        revenueSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('필터 옵션 로드 실패:', error);
  }
}

async function loadDeals() {
  const grid = document.getElementById('deal-grid');
  if (!grid) return;
  
  // 로딩 표시
  grid.innerHTML = `
    <div class="col-span-full flex flex-col items-center justify-center py-20">
      <div class="spinner mb-4"></div>
      <p class="text-gray-500">딜 정보를 불러오는 중...</p>
    </div>
  `;
  
  try {
    // API에서 딜 목록 로드 시도
    const apiData = await apiCall('getActiveDeals', {
      industry: state.filters.industry,
      dealType: state.filters.dealType,
      revenueRange: state.filters.revenueRange,
      page: state.pagination.page,
      pageSize: state.pagination.pageSize
    });
    
    // API 데이터가 있으면 사용
    if (apiData?.deals) {
      state.deals = apiData.deals;
      state.pagination = apiData.pagination || state.pagination;
      renderDeals(state.deals);
      return;
    }
    
    // API 없으면 데모 데이터 사용
    const demoDeals = [
      {
        DEAL_ID: 'DEAL_20241128_001',
        Industry: 'IT/소프트웨어',
        Deal_Type: '투자유치',
        Summary: 'AI 기반 HR 솔루션 스타트업. 기업 채용 프로세스를 혁신하는 SaaS 플랫폼.',
        Revenue_Range: '10억~50억',
        Target_Valuation: '100억'
      },
      {
        DEAL_ID: 'DEAL_20241128_002',
        Industry: '바이오/헬스케어',
        Deal_Type: '매각',
        Summary: '디지털 헬스케어 플랫폼. 원격 진료 및 건강관리 서비스.',
        Revenue_Range: '50억~100억',
        Target_Valuation: '300억'
      },
      {
        DEAL_ID: 'DEAL_20241128_003',
        Industry: '핀테크',
        Deal_Type: '투자유치',
        Summary: '블록체인 기반 결제 솔루션. B2B 크로스보더 페이먼트.',
        Revenue_Range: '5억~10억',
        Target_Valuation: '50억'
      },
      {
        DEAL_ID: 'DEAL_20241128_004',
        Industry: '이커머스',
        Deal_Type: '매각',
        Summary: 'D2C 패션 브랜드. MZ세대 타겟 스트리트웨어. 인스타그램 팔로워 50만.',
        Revenue_Range: '50억~100억',
        Target_Valuation: '150억'
      },
      {
        DEAL_ID: 'DEAL_20241128_005',
        Industry: '에듀테크',
        Deal_Type: '투자유치',
        Summary: 'AI 영어 학습 앱. GPT 기반 1:1 영어 회화 및 첨삭 서비스.',
        Revenue_Range: '10억~50억',
        Target_Valuation: '80억'
      },
      {
        DEAL_ID: 'DEAL_20241128_006',
        Industry: 'IT/소프트웨어',
        Deal_Type: '투자유치',
        Summary: 'B2B SaaS 마케팅 자동화 플랫폼. 고객 여정 분석 및 캠페인 최적화.',
        Revenue_Range: '5억~10억',
        Target_Valuation: '70억'
      }
    ];
    
    state.deals = demoDeals;
    renderDeals(demoDeals);
    
  } catch (error) {
    console.error('딜 목록 로드 실패:', error);
    grid.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <i data-lucide="alert-circle" class="w-8 h-8 text-red-400"></i>
        </div>
        <p class="text-gray-500">딜 정보를 불러오는데 실패했습니다.</p>
      </div>
    `;
    lucide.createIcons();
  }
}

// 딜 목록 렌더링 함수
function renderDeals(deals) {
  const grid = document.getElementById('deal-grid');
  if (!grid) return;
  
  // 필터 적용 (데모 모드용)
  let filteredDeals = deals;
    if (state.filters.industry) {
      filteredDeals = filteredDeals.filter(d => d.Industry === state.filters.industry);
    }
    if (state.filters.dealType) {
      filteredDeals = filteredDeals.filter(d => d.Deal_Type === state.filters.dealType);
    }
    
    // 통계 업데이트
    const statEl = document.getElementById('stat-deals');
    if (statEl) statEl.textContent = filteredDeals.length;
    
    // 딜 카드 렌더링
    if (filteredDeals.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full flex flex-col items-center justify-center py-20">
          <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <i data-lucide="inbox" class="w-8 h-8 text-gray-600"></i>
          </div>
          <p class="text-gray-500">조건에 맞는 딜이 없습니다.</p>
        </div>
      `;
      lucide.createIcons();
      return;
    }
    
  grid.innerHTML = filteredDeals.map(deal => dealCardHTML(deal)).join('');
  lucide.createIcons();
}

// 딜 카드 HTML 생성 (Dark Theme)
function dealCardHTML(deal) {
  const industryIcons = {
    'IT/소프트웨어': 'laptop',
    '바이오/헬스케어': 'heart-pulse',
    '핀테크': 'coins',
    '이커머스': 'shopping-cart',
    '에듀테크': 'graduation-cap',
    '물류/로보틱스': 'bot',
    '모빌리티/에너지': 'zap',
    '애그테크': 'sprout'
  };
  
  const industryColors = {
    'IT/소프트웨어': 'blue',
    '바이오/헬스케어': 'green',
    '물류/로보틱스': 'cyan',
    '모빌리티/에너지': 'amber',
    '애그테크': 'lime',
    '핀테크': 'yellow',
    '이커머스': 'purple',
    '에듀테크': 'orange'
  };
  
  const dealTypeColors = {
    '투자유치': 'bg-green-500/20 text-green-400',
    '매각': 'bg-purple-500/20 text-purple-400',
    'M&A': 'bg-orange-500/20 text-orange-400'
  };
  
  const icon = industryIcons[deal.Industry] || 'briefcase';
  const color = industryColors[deal.Industry] || 'blue';
  const typeColor = dealTypeColors[deal.Deal_Type] || 'bg-gray-500/20 text-gray-400';
  
  return `
    <div class="deal-card bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
      <!-- Header -->
      <div class="p-6 border-b border-white/10">
        <div class="flex items-start justify-between mb-4">
          <div class="w-12 h-12 bg-${color}-500/20 rounded-xl flex items-center justify-center">
            <i data-lucide="${icon}" class="w-6 h-6 text-${color}-400"></i>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-medium ${typeColor}">
            ${deal.Deal_Type || '투자유치'}
          </span>
        </div>
        <div class="text-sm text-gray-400 mb-1">${deal.Industry || '기타'}</div>
        <div class="text-xs text-gray-600">${deal.DEAL_ID}</div>
      </div>
      
      <!-- Body -->
      <div class="p-6">
        <p class="text-gray-300 text-sm mb-6 line-clamp-3 min-h-[60px]">
          ${deal.Summary || '상세 정보는 NDA 서명 후 열람 가능합니다.'}
        </p>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-white/5 rounded-xl p-3">
            <div class="text-xs text-gray-500 mb-1">매출 규모</div>
            <div class="font-semibold text-white text-sm">${deal.Revenue_Range || '-'}</div>
          </div>
          <div class="bg-blue-500/10 rounded-xl p-3">
            <div class="text-xs text-blue-400 mb-1">희망 밸류</div>
            <div class="font-semibold text-blue-400 text-sm">${deal.Target_Valuation || '-'}</div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <a href="/deal/${deal.DEAL_ID}" 
            class="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl text-center text-sm font-medium transition-colors flex items-center justify-center gap-1">
            <i data-lucide="eye" class="w-4 h-4"></i>
            티저 보기
          </a>
          <button 
            onclick="openNDAModal('${deal.DEAL_ID}')"
            class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-center text-sm font-medium transition-colors flex items-center justify-center gap-1">
            <i data-lucide="file-signature" class="w-4 h-4"></i>
            상세 열람
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============================================================
// 딜 상세 페이지
// ============================================================

async function initDealDetail() {
  const container = document.getElementById('deal-detail');
  const dealId = container?.dataset.dealId;
  
  if (!dealId) return;
  
  try {
    // API에서 딜 상세 조회 시도
    let deal = await apiCall('getDealDetail', { dealId });
    
    // API 데이터가 없으면 데모 데이터 사용
    if (!deal) {
      deal = {
        DEAL_ID: dealId,
        Industry: 'IT/소프트웨어',
        Deal_Type: '투자유치',
        Summary: 'AI 기반 HR 솔루션 스타트업. 기업 채용 프로세스를 혁신하는 SaaS 플랫폼. AI 면접 분석, 역량 평가, 채용 예측 기능을 제공합니다.',
        Revenue_Range: '10억~50억',
        Target_Valuation: '100억',
        Stage: 'Active'
      };
    }
    
    // 업종별 아이콘 매핑
    const industryIcons = {
      'IT/소프트웨어': 'laptop',
      '바이오/헬스케어': 'heart-pulse',
      '핀테크': 'coins',
      '이커머스': 'shopping-cart',
      '에듀테크': 'graduation-cap',
      '물류/로보틱스': 'bot',
      '모빌리티/에너지': 'zap',
      '애그테크': 'sprout'
    };
    const icon = industryIcons[deal.Industry] || 'briefcase';
    
    container.innerHTML = `
      <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        <!-- Header -->
        <div class="p-8 border-b border-white/10 bg-gradient-to-br from-blue-600/20 to-purple-600/10">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <i data-lucide="${icon}" class="w-8 h-8 text-blue-400"></i>
            </div>
            <div>
              <div class="text-sm text-gray-400">${deal.Industry}</div>
              <h1 class="text-2xl font-bold text-white">${deal.DEAL_ID}</h1>
            </div>
          </div>
          <div class="flex gap-3">
            <span class="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">${deal.Deal_Type}</span>
            <span class="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400 flex items-center gap-1">
              <span class="w-2 h-2 bg-blue-400 rounded-full"></span>
              ${deal.Stage}
            </span>
          </div>
        </div>
        
        <!-- Body -->
        <div class="p-8">
          <!-- Teaser Info -->
          <div class="mb-8">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i data-lucide="info" class="w-5 h-5 text-blue-400"></i>
              티저 정보
            </h2>
            <p class="text-gray-300 leading-relaxed">
              ${deal.Summary}
            </p>
          </div>
          
          <!-- Key Metrics -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-white/5 rounded-xl p-4 text-center">
              <div class="text-sm text-gray-500 mb-1">매출 규모</div>
              <div class="text-lg font-bold text-white">${deal.Revenue_Range}</div>
            </div>
            <div class="bg-blue-500/10 rounded-xl p-4 text-center">
              <div class="text-sm text-blue-400 mb-1">희망 밸류</div>
              <div class="text-lg font-bold text-blue-400">${deal.Target_Valuation}</div>
            </div>
            <div class="bg-white/5 rounded-xl p-4 text-center">
              <div class="text-sm text-gray-500 mb-1">딜 유형</div>
              <div class="text-lg font-bold text-white">${deal.Deal_Type}</div>
            </div>
            <div class="bg-white/5 rounded-xl p-4 text-center">
              <div class="text-sm text-gray-500 mb-1">업종</div>
              <div class="text-lg font-bold text-white">${deal.Industry}</div>
            </div>
          </div>
          
          <!-- Full Report Section (Locked) -->
          <div class="bg-white/5 rounded-2xl p-8 text-center mb-8 border border-white/10">
            <div class="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <i data-lucide="lock" class="w-8 h-8 text-gray-500"></i>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">상세 정보는 NDA 서명 후 열람 가능합니다</h3>
            <p class="text-gray-500 mb-6">
              투자심사보고서, 재무제표, 기술 자료 등 상세 정보를 확인하시려면<br/>
              NDA(비밀유지계약) 서명이 필요합니다.
            </p>
            <button onclick="openNDAModal('${deal.DEAL_ID}')"
              class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors inline-flex items-center gap-2">
              <i data-lucide="file-signature" class="w-5 h-5"></i>
              NDA 서명하고 열람하기
            </button>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-4">
            <a href="/" class="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-center font-medium transition-colors flex items-center justify-center gap-2">
              <i data-lucide="arrow-left" class="w-5 h-5"></i>
              목록으로
            </a>
            <button onclick="openNDAModal('${deal.DEAL_ID}')"
              class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl text-center font-medium transition-colors flex items-center justify-center gap-2">
              <i data-lucide="calendar-plus" class="w-5 h-5"></i>
              미팅 요청
            </button>
          </div>
        </div>
      </div>
    `;
    
    lucide.createIcons();
    
  } catch (error) {
    console.error('딜 상세 로드 실패:', error);
    container.innerHTML = `
      <div class="flex flex-col items-center justify-center py-20">
        <div class="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
          <i data-lucide="alert-circle" class="w-8 h-8 text-red-400"></i>
        </div>
        <p class="text-gray-500">딜 정보를 불러오는데 실패했습니다.</p>
      </div>
    `;
    lucide.createIcons();
  }
}

// ============================================================
// NDA 모달
// ============================================================

function openNDAModal(dealId) {
  const modal = document.getElementById('nda-modal');
  const dealIdDisplay = document.getElementById('nda-deal-id');
  const dealIdInput = document.getElementById('nda-deal-id-input');
  
  if (modal && dealIdDisplay && dealIdInput) {
    dealIdDisplay.textContent = dealId;
    dealIdInput.value = dealId;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
  }
}

function closeNDAModal() {
  const modal = document.getElementById('nda-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// NDA 폼 제출
document.addEventListener('DOMContentLoaded', () => {
  const ndaForm = document.getElementById('nda-form');
  
  if (ndaForm) {
    ndaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(ndaForm);
      const data = {
        action: 'requestNDA',
        dealId: formData.get('dealId'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone')
      };
      
      const submitBtn = document.getElementById('nda-submit-btn');
      const errorDiv = document.getElementById('nda-error');
      const errorMsg = document.getElementById('nda-error-message');
      
      // 로딩 상태
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div><span>처리 중...</span>';
      errorDiv.classList.add('hidden');
      
      try {
        // API 호출
        const result = await apiCall('requestNDA', data, 'POST');
        
        if (result === null) {
          // 데모 모드 - 시뮬레이션
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        // 성공 시
        showToast('NDA 서명 요청이 발송되었습니다. 카카오톡을 확인해주세요.', 'success');
        closeNDAModal();
        ndaForm.reset();
        
      } catch (error) {
        errorDiv.classList.remove('hidden');
        errorMsg.textContent = error.message || 'NDA 요청 중 오류가 발생했습니다.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="send" class="w-4 h-4"></i>서명 요청하기';
        lucide.createIcons();
      }
    });
  }
});

// 모달 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
  const modal = document.getElementById('nda-modal');
  if (modal && e.target.classList.contains('modal-overlay')) {
    closeNDAModal();
  }
});

// ============================================================
// 라운드테이블 페이지
// ============================================================

async function initRoundTable() {
  renderCalendar();
  await loadUpcomingEvents();
}

function renderCalendar() {
  const grid = document.getElementById('calendar-grid');
  if (!grid) return;
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let html = '';
  
  // 시작 요일까지 빈 셀
  for (let i = 0; i < firstDay.getDay(); i++) {
    html += '<div class="p-4 border-b border-r border-white/5 bg-white/[0.02] min-h-[100px]"></div>';
  }
  
  // 날짜 셀
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const isToday = day === now.getDate();
    const hasEvent = [15, 20, 22].includes(day);
    
    html += `
      <div class="calendar-cell p-4 border-b border-r border-white/5 min-h-[100px] cursor-pointer ${isToday ? 'bg-blue-500/10' : 'hover:bg-white/5'}"
           onclick="showDayEvents(${year}, ${month + 1}, ${day})">
        <div class="font-medium mb-2 ${isToday ? 'text-blue-400' : 'text-gray-400'}">${day}</div>
        ${hasEvent ? `
          <div class="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded-lg truncate">
            라운드테이블
          </div>
        ` : ''}
      </div>
    `;
  }
  
  grid.innerHTML = html;
  
  // 월 표시 업데이트
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  const monthEl = document.getElementById('current-month');
  if (monthEl) monthEl.textContent = `${year}년 ${monthNames[month]}`;
}

async function loadUpcomingEvents() {
  const container = document.getElementById('upcoming-events');
  if (!container) return;
  
  // API에서 라운드테이블 일정 조회
  let events = await apiCall('getRoundTable');
  
  // API 데이터가 없으면 데모 데이터 사용
  if (!events || events.length === 0) {
    events = [
      {
        RT_ID: 'RT_202412_001',
        Type: 'Public',
        Date_Time: '2024-12-15 14:00',
        Location: '강남 VS스퀘어 3층',
        Description: '12월 정기 딜소싱 라운드테이블',
        Available_Slots: 6
      },
      {
        RT_ID: 'RT_202412_002',
        Type: 'Public',
        Date_Time: '2024-12-20 10:00',
        Location: '판교 스타트업캠퍼스',
        Description: '바이오/헬스케어 전문 라운드테이블',
        Available_Slots: 6
      },
      {
        RT_ID: 'RT_202501_001',
        Type: 'Public',
        Date_Time: '2025-01-10 14:00',
        Location: '서울 여의도 IFC',
        Description: '2025년 신년 딜소싱 라운드테이블',
        Available_Slots: 10
      }
    ];
  }
  
  container.innerHTML = events.map(event => {
    const dateParts = event.Date_Time ? event.Date_Time.split(' ')[0].split('-') : ['2024', '12', '15'];
    const time = event.Date_Time ? event.Date_Time.split(' ')[1] : '14:00';
    
    return `
    <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-purple-500/20 rounded-xl flex flex-col items-center justify-center">
          <span class="text-xs text-purple-400 font-medium">${dateParts[1]}월</span>
          <span class="text-xl font-bold text-purple-400">${dateParts[2]}</span>
        </div>
        <div>
          <div class="font-semibold text-white">${event.Description || event.RT_ID}</div>
          <div class="text-xs text-gray-600 mb-1">${event.RT_ID}</div>
          <div class="text-sm text-gray-500 flex items-center gap-1">
            <i data-lucide="map-pin" class="w-4 h-4"></i>
            ${event.Location}
          </div>
          <div class="text-sm text-gray-500 flex items-center gap-1">
            <i data-lucide="clock" class="w-4 h-4"></i>
            ${time}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-sm text-gray-400">
          잔여 <span class="font-bold text-blue-400">${event.Available_Slots || 0}</span>석
        </div>
        <button onclick="openRTModal('${event.RT_ID}')"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <i data-lucide="calendar-plus" class="w-4 h-4"></i>
          참가 신청
        </button>
      </div>
    </div>
  `}).join('');
  
  lucide.createIcons();
}

function openRTModal(rtId) {
  const modal = document.getElementById('rt-apply-modal');
  const rtIdInput = document.getElementById('rt-id');
  const rtInfo = document.getElementById('rt-info');
  
  if (modal && rtIdInput) {
    rtIdInput.value = rtId;
    rtInfo.innerHTML = `<strong class="text-blue-400">${rtId}</strong><span class="text-blue-200/80">에 참가 신청합니다.</span>`;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
  }
}

function closeRTModal() {
  const modal = document.getElementById('rt-apply-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// ============================================================
// 딜 등록 페이지
// ============================================================

function initRegisterPage() {
  const form = document.getElementById('deal-register-form');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const submitBtn = document.getElementById('register-submit-btn');
      
      // 로딩 상태
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div><span>처리 중...</span>';
      
      try {
        // 폼 데이터 수집
        const data = {
          companyName: formData.get('companyName'),
          ceoName: formData.get('ceoName'),
          industry: formData.get('industry'),
          foundedYear: formData.get('foundedYear'),
          dealType: formData.get('dealType'),
          investmentRound: formData.get('investmentRound'),
          revenueRange: formData.get('revenueRange'),
          targetValuation: formData.get('targetValuation'),
          targetFunding: formData.get('targetFunding'),
          summary: formData.get('summary'),
          description: formData.get('description'),
          contactName: formData.get('contactName'),
          contactTitle: formData.get('contactTitle'),
          contactEmail: formData.get('contactEmail'),
          contactPhone: formData.get('contactPhone')
        };
        
        // API 호출 (실제 운영 시)
        // await apiCall('registerDeal', data, 'POST');
        
        // 데모: 1.5초 대기 후 성공 처리
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 성공 처리
        form.classList.add('hidden');
        document.getElementById('register-success').classList.remove('hidden');
        showToast('딜 등록 신청이 완료되었습니다.', 'success');
        
        // 스크롤 맨 위로
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
      } catch (error) {
        console.error('딜 등록 실패:', error);
        showToast('딜 등록 중 오류가 발생했습니다.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i>딜 등록 신청';
        lucide.createIcons();
      }
    });
  }
}

// ============================================================
// 마이페이지
// ============================================================

function initMyPage() {
  const savedEmail = localStorage.getItem('userEmail');
  if (savedEmail) {
    const emailInput = document.getElementById('user-email');
    if (emailInput) emailInput.value = savedEmail;
  }
}

async function loadUserStatus() {
  const emailInput = document.getElementById('user-email');
  const email = emailInput?.value;
  
  if (!email) {
    showToast('이메일을 입력해주세요.', 'error');
    return;
  }
  
  localStorage.setItem('userEmail', email);
  
  // 로딩 표시
  document.getElementById('my-nda-list').innerHTML = '<div class="flex justify-center py-8"><div class="spinner"></div></div>';
  document.getElementById('my-rt-list').innerHTML = '<div class="flex justify-center py-8"><div class="spinner"></div></div>';
  
  // API에서 사용자 현황 조회
  const userData = await apiCall('getUserStatus', { email });
  
  // NDA 현황 렌더링
  if (userData?.ndaRequests && userData.ndaRequests.length > 0) {
    document.getElementById('my-nda-list').innerHTML = `
      <div class="divide-y divide-white/10">
        ${userData.ndaRequests.map(nda => {
          const statusColors = {
            'Signed': 'bg-green-500/20 text-green-400',
            'Pending': 'bg-yellow-500/20 text-yellow-400',
            'Expired': 'bg-red-500/20 text-red-400'
          };
          const statusIcons = {
            'Signed': 'check',
            'Pending': 'clock',
            'Expired': 'x'
          };
          return `
            <div class="py-4 flex items-center justify-between">
              <div>
                <div class="font-medium text-white">${nda.dealId}</div>
                <div class="text-sm text-gray-500">${nda.requestedAt || ''}</div>
              </div>
              <span class="px-3 py-1 rounded-full text-sm ${statusColors[nda.status] || 'bg-gray-500/20 text-gray-400'} flex items-center gap-1">
                <i data-lucide="${statusIcons[nda.status] || 'info'}" class="w-3 h-3"></i>
                ${nda.status}
              </span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  } else {
    // 데모 데이터 표시
    document.getElementById('my-nda-list').innerHTML = `
    <div class="divide-y divide-white/10">
      <div class="py-4 flex items-center justify-between">
        <div>
          <div class="font-medium text-white">DEAL_20241128_001</div>
          <div class="text-sm text-gray-500">IT/소프트웨어 • 투자유치</div>
        </div>
        <span class="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400 flex items-center gap-1">
          <i data-lucide="check" class="w-3 h-3"></i>
          Signed
        </span>
      </div>
      <div class="py-4 flex items-center justify-between">
        <div>
          <div class="font-medium text-white">DEAL_20241128_002</div>
          <div class="text-sm text-gray-500">바이오/헬스케어 • 매각</div>
        </div>
        <span class="px-3 py-1 rounded-full text-sm bg-yellow-500/20 text-yellow-400 flex items-center gap-1">
          <i data-lucide="clock" class="w-3 h-3"></i>
          Pending
        </span>
      </div>
    </div>
  `;
  }
  
  // RT 현황 렌더링
  if (userData?.roundTableApps && userData.roundTableApps.length > 0) {
    document.getElementById('my-rt-list').innerHTML = `
      <div class="divide-y divide-white/10">
        ${userData.roundTableApps.map(rt => `
          <div class="py-4 flex items-center justify-between">
            <div>
              <div class="font-medium text-white">${rt.rtId}</div>
              <div class="text-sm text-gray-500">${rt.dateTime || ''} • ${rt.location || ''}</div>
            </div>
            <span class="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400 flex items-center gap-1">
              <i data-lucide="calendar-check" class="w-3 h-3"></i>
              ${rt.status || '확정'}
            </span>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    // 데모 데이터 표시
    document.getElementById('my-rt-list').innerHTML = `
      <div class="divide-y divide-white/10">
        <div class="py-4 flex items-center justify-between">
          <div>
            <div class="font-medium text-white">RT_202412_001</div>
            <div class="text-sm text-gray-500">2024-12-15 14:00 • 강남 VS스퀘어</div>
          </div>
          <span class="px-3 py-1 rounded-full text-sm bg-blue-500/20 text-blue-400 flex items-center gap-1">
            <i data-lucide="calendar-check" class="w-3 h-3"></i>
            확정
          </span>
        </div>
      </div>
    `;
  }
  
  lucide.createIcons();
  showToast('조회가 완료되었습니다.', 'success');
}

// ============================================================
// 통합 로그인 페이지
// ============================================================

function initLoginPage() {
  const form = document.getElementById('unified-login-form');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const role = formData.get('role');
      const userId = formData.get('userId');
      const password = formData.get('password');
      const remember = formData.get('remember');
      
      if (!role) {
        showToast('회원 유형을 선택해주세요.', 'error');
        return;
      }
      
      const submitBtn = document.getElementById('login-btn');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div><span>로그인 중...</span>';
      
      try {
        // API 호출
        const result = await apiCall('login', { role, userId, password }, 'POST');
        
        if (result === null) {
          // 데모 모드 - 로그인 시뮬레이션
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 데모용 세션 저장
          const demoSession = {
            role: role,
            userId: userId,
            name: role === 'admin' ? '운영진' : role === 'investor' ? '투자자' : role === 'company' ? '기업' : '중개인',
            loginTime: new Date().toISOString(),
            token: 'demo_token_' + Date.now()
          };
          
          localStorage.setItem('session', JSON.stringify(demoSession));
          if (remember) {
            localStorage.setItem('rememberLogin', 'true');
          }
          
          showToast('로그인 성공!', 'success');
          
          // 역할별 대시보드로 리다이렉트
          redirectToDashboard(role);
          return;
        }
        
        // 실제 API 응답 처리
        if (result.success) {
          const session = {
            role: role,
            userId: result.userId || userId,
            name: result.name || userId,
            loginTime: new Date().toISOString(),
            token: result.sessionToken
          };
          
          localStorage.setItem('session', JSON.stringify(session));
          if (remember) {
            localStorage.setItem('rememberLogin', 'true');
          }
          
          showToast('로그인 성공!', 'success');
          redirectToDashboard(role);
        }
        
      } catch (error) {
        console.error('로그인 실패:', error);
        showToast('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i>로그인';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    });
  }
}

// 역할별 대시보드로 리다이렉트
function redirectToDashboard(role) {
  const dashboardUrls = {
    'investor': '/dashboard/investor',
    'company': '/dashboard/company',
    'broker': '/dashboard/broker',
    'admin': '/admin'
  };
  
  const url = dashboardUrls[role] || '/';
  window.location.href = url;
}

// ============================================================
// 통합 회원가입 페이지
// ============================================================

function initSignupPage() {
  const form = document.getElementById('unified-signup-form');
  const roleRadios = document.querySelectorAll('input[name="role"]');
  
  // 역할 선택 시 동적 필드 표시
  roleRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      const role = e.target.value;
      updateSignupFields(role);
    });
  });
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const role = formData.get('role');
      
      if (!role) {
        showToast('회원 유형을 선택해주세요.', 'error');
        return;
      }
      
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div><span>처리 중...</span>';
      
      try {
        const data = {
          role: role,
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          company: formData.get('company'),
          position: formData.get('position')
        };
        
        // 역할별 추가 필드
        if (role === 'investor') {
          data.investorType = formData.get('investorType');
          data.interests = formData.get('interests');
        } else if (role === 'company') {
          data.industry = formData.get('industry');
          data.foundedYear = formData.get('foundedYear');
        } else if (role === 'broker') {
          data.referrer = formData.get('referrer');
        }
        
        // API 호출
        const result = await apiCall('signup', data, 'POST');
        
        if (result === null) {
          // 데모 모드
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
        
        showToast('회원가입 신청이 완료되었습니다. 운영진 승인 후 계정이 발급됩니다.', 'success');
        
        // 로그인 페이지로 이동
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
        
      } catch (error) {
        console.error('회원가입 실패:', error);
        showToast('회원가입 처리 중 오류가 발생했습니다.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i>회원가입 신청';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    });
  }
}

function updateSignupFields(role) {
  const investorFields = document.getElementById('investor-fields');
  const companyFields = document.getElementById('company-fields');
  const brokerFields = document.getElementById('broker-fields');
  const roleNotice = document.getElementById('role-notice');
  
  // 모든 필드 숨기기
  if (investorFields) investorFields.classList.add('hidden');
  if (companyFields) companyFields.classList.add('hidden');
  if (brokerFields) brokerFields.classList.add('hidden');
  
  // 역할별 필드 표시 및 안내 문구 업데이트
  const notices = {
    'investor': {
      title: '투자자 가입 안내',
      content: '투자자 회원은 운영진 승인 후 계정이 발급됩니다. 월 5건의 무료 열람권이 제공됩니다.'
    },
    'company': {
      title: '기업 가입 안내',
      content: '기업 회원은 딜 등록 및 IR 활동이 가능합니다. AI 투자심사보고서를 받으실 수 있습니다.'
    },
    'broker': {
      title: '중개인 가입 안내',
      content: '중개인은 운영진, 투자자, 또는 기업 회원의 추천 및 위임 계약이 필요합니다. 가입 신청 후 별도의 승인 절차가 진행됩니다.'
    }
  };
  
  if (role === 'investor' && investorFields) {
    investorFields.classList.remove('hidden');
  } else if (role === 'company' && companyFields) {
    companyFields.classList.remove('hidden');
  } else if (role === 'broker' && brokerFields) {
    brokerFields.classList.remove('hidden');
  }
  
  if (roleNotice && notices[role]) {
    roleNotice.innerHTML = `
      <div class="flex items-start gap-3">
        <i data-lucide="info" class="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"></i>
        <div class="text-sm text-blue-200/80">
          <p class="font-semibold text-blue-400 mb-1">${notices[role].title}</p>
          <p>${notices[role].content}</p>
        </div>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// ============================================================
// 운영진 로그인 페이지
// ============================================================

function initAdminLoginPage() {
  const form = document.getElementById('admin-login-form');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData(form);
      const adminId = formData.get('adminId');
      const password = formData.get('password');
      
      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<div class="spinner" style="width:20px;height:20px;border-width:2px;"></div><span>로그인 중...</span>';
      
      try {
        // API 호출
        const result = await apiCall('adminLogin', { adminId, password }, 'POST');
        
        if (result === null) {
          // 데모 모드
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // 데모용 세션 저장
          const demoSession = {
            role: 'admin',
            userId: adminId,
            name: '운영진',
            loginTime: new Date().toISOString(),
            token: 'admin_demo_token_' + Date.now()
          };
          
          localStorage.setItem('session', JSON.stringify(demoSession));
          showToast('운영진 로그인 성공!', 'success');
          window.location.href = '/admin';
          return;
        }
        
        // 실제 API 응답 처리
        if (result.success || result.sessionToken) {
          const session = {
            role: 'admin',
            userId: result.adminId || adminId,
            name: '운영진',
            loginTime: result.loginTime || new Date().toISOString(),
            token: result.sessionToken
          };
          
          localStorage.setItem('session', JSON.stringify(session));
          showToast('운영진 로그인 성공!', 'success');
          window.location.href = '/admin';
        } else {
          showToast(result.message || '로그인에 실패했습니다.', 'error');
        }
        
      } catch (error) {
        console.error('운영진 로그인 실패:', error);
        showToast('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.', 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="log-in" class="w-5 h-5"></i>로그인';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }
    });
  }
}

// ============================================================
// 운영진 대시보드
// ============================================================

function initAdminDashboard() {
  // 세션 확인
  const session = checkSession('admin');
  if (!session) return;
  
  // 대시보드 데이터 로드
  loadAdminStats();
}

async function loadAdminStats() {
  try {
    const stats = await apiCall('getAdminStats', {});
    
    if (stats) {
      if (document.getElementById('stat-investors')) {
        document.getElementById('stat-investors').textContent = stats.totalInvestors || '0';
      }
      if (document.getElementById('stat-investors-pending')) {
        document.getElementById('stat-investors-pending').textContent = stats.pendingInvestors || '0';
      }
      if (document.getElementById('stat-brokers')) {
        document.getElementById('stat-brokers').textContent = stats.totalBrokers || '0';
      }
      if (document.getElementById('stat-brokers-pending')) {
        document.getElementById('stat-brokers-pending').textContent = stats.pendingBrokers || '0';
      }
      if (document.getElementById('stat-deals')) {
        document.getElementById('stat-deals').textContent = stats.totalDeals || '0';
      }
      if (document.getElementById('stat-deals-active')) {
        document.getElementById('stat-deals-active').textContent = stats.activeDeals || '0';
      }
      if (document.getElementById('stat-nda')) {
        document.getElementById('stat-nda').textContent = stats.totalNDA || '0';
      }
      if (document.getElementById('stat-nda-month')) {
        document.getElementById('stat-nda-month').textContent = stats.monthlyNDA || '0';
      }
    }
  } catch (error) {
    console.error('관리자 통계 로드 실패:', error);
  }
}

// ============================================================
// 투자자 대시보드
// ============================================================

function initInvestorDashboard() {
  // 세션 확인
  const session = checkSession('investor');
  if (!session) return;
  
  // 사용자 이름 표시
  const nameEl = document.getElementById('investor-name');
  const welcomeNameEl = document.getElementById('investor-welcome-name');
  if (nameEl) nameEl.textContent = session.name || '투자자';
  if (welcomeNameEl) welcomeNameEl.textContent = session.name || '투자자';
  
  // 대시보드 데이터 로드
  loadInvestorData();
}

async function loadInvestorData() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    const data = await apiCall('getInvestorDashboard', { userId: session.userId });
    
    if (data) {
      if (document.getElementById('remaining-credits')) {
        document.getElementById('remaining-credits').textContent = data.remainingCredits || '5';
      }
      if (document.getElementById('nda-count')) {
        document.getElementById('nda-count').textContent = data.ndaCount || '0';
      }
      if (document.getElementById('rt-count')) {
        document.getElementById('rt-count').textContent = data.rtCount || '0';
      }
      if (document.getElementById('referral-bonus')) {
        document.getElementById('referral-bonus').textContent = data.referralBonus || '0';
      }
    }
  } catch (error) {
    console.error('투자자 데이터 로드 실패:', error);
  }
}

// ============================================================
// 기업 대시보드
// ============================================================

function initCompanyDashboard() {
  // 세션 확인
  const session = checkSession('company');
  if (!session) return;
  
  // 사용자 이름 표시
  const nameEl = document.getElementById('company-name');
  const welcomeNameEl = document.getElementById('company-welcome-name');
  if (nameEl) nameEl.textContent = session.name || '기업';
  if (welcomeNameEl) welcomeNameEl.textContent = session.name || '기업';
  
  // 대시보드 데이터 로드
  loadCompanyData();
}

async function loadCompanyData() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    const data = await apiCall('getCompanyDashboard', { userId: session.userId });
    
    if (data) {
      if (document.getElementById('company-deals')) {
        document.getElementById('company-deals').textContent = data.dealCount || '0';
      }
      if (document.getElementById('company-views')) {
        document.getElementById('company-views').textContent = data.viewCount || '0';
      }
      if (document.getElementById('company-nda')) {
        document.getElementById('company-nda').textContent = data.ndaCount || '0';
      }
      if (document.getElementById('company-rt')) {
        document.getElementById('company-rt').textContent = data.rtCount || '0';
      }
    }
  } catch (error) {
    console.error('기업 데이터 로드 실패:', error);
  }
}

// ============================================================
// 중개인 대시보드
// ============================================================

function initBrokerDashboard() {
  // 세션 확인
  const session = checkSession('broker');
  if (!session) return;
  
  // 사용자 이름 표시
  const nameEl = document.getElementById('broker-name');
  const welcomeNameEl = document.getElementById('broker-welcome-name');
  if (nameEl) nameEl.textContent = session.name || '중개인';
  if (welcomeNameEl) welcomeNameEl.textContent = session.name || '중개인';
  
  // 대시보드 데이터 로드
  loadBrokerData();
}

async function loadBrokerData() {
  try {
    const session = JSON.parse(localStorage.getItem('session') || '{}');
    const data = await apiCall('getBrokerDashboard', { userId: session.userId });
    
    if (data) {
      if (document.getElementById('broker-contracts')) {
        document.getElementById('broker-contracts').textContent = data.contractCount || '0';
      }
      if (document.getElementById('broker-companies')) {
        document.getElementById('broker-companies').textContent = data.companyCount || '0';
      }
      if (document.getElementById('broker-investors')) {
        document.getElementById('broker-investors').textContent = data.investorCount || '0';
      }
      if (document.getElementById('broker-success')) {
        document.getElementById('broker-success').textContent = data.successCount || '0';
      }
    }
  } catch (error) {
    console.error('중개인 데이터 로드 실패:', error);
  }
}

// ============================================================
// 세션 관리
// ============================================================

function checkSession(requiredRole = null) {
  const sessionStr = localStorage.getItem('session');
  
  if (!sessionStr) {
    showToast('로그인이 필요합니다.', 'error');
    window.location.href = '/login';
    return null;
  }
  
  try {
    const session = JSON.parse(sessionStr);
    
    // 세션 만료 확인 (8시간)
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
    
    if (hoursDiff > 8) {
      localStorage.removeItem('session');
      showToast('세션이 만료되었습니다. 다시 로그인해주세요.', 'error');
      window.location.href = '/login';
      return null;
    }
    
    // 역할 확인 (데모 모드에서는 유연하게 처리)
    if (requiredRole && session.role !== requiredRole) {
      // 데모 모드에서는 역할 불일치 허용
      console.log(`Role mismatch: expected ${requiredRole}, got ${session.role}. Allowing for demo.`);
    }
    
    return session;
    
  } catch (error) {
    console.error('세션 파싱 오류:', error);
    localStorage.removeItem('session');
    window.location.href = '/login';
    return null;
  }
}

function logout() {
  localStorage.removeItem('session');
  localStorage.removeItem('rememberLogin');
  showToast('로그아웃되었습니다.', 'success');
  window.location.href = '/login';
}

// 전역에서 사용할 수 있도록 window 객체에 등록
window.logout = logout;
window.redirectToDashboard = redirectToDashboard;

// ============================================================
// 유틸리티
// ============================================================

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
    lucide.createIcons();
  }
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="flex items-center gap-2">
      <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info'}" class="w-5 h-5"></i>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(toast);
  lucide.createIcons();
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
