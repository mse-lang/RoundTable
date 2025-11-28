/**
 * VentureSquare Round Table - Frontend Application
 * Dark Theme + Glassmorphism Design
 */

// ============================================================
// 설정
// ============================================================

/**
 * GAS API URL 설정
 */
const API_BASE_URL = window.GAS_API_URL || 'https://script.google.com/macros/s/AKfycbzGCjvvVnwliXvEcvLwKsxFvYrQVuE6DfhcCFyPQ3zgOAA-DFA774xv5aFc3AuzBrly/exec';

// API 호출 헬퍼 (GAS CORS 우회)
async function apiCall(action, params = {}, method = 'GET') {
  // API URL이 없으면 데모 모드
  if (!API_BASE_URL) {
    console.log(`[Demo Mode] API 호출: ${action}`, params);
    return null; // 데모 데이터 사용
  }
  
  try {
    const queryParams = new URLSearchParams({ action, ...params });
    const url = `${API_BASE_URL}?${queryParams.toString()}`;
    
    if (method === 'GET') {
      // GAS는 redirect 응답을 하므로 redirect: 'follow' 필요
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'follow'
      });
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'API 오류');
      }
      
      return data.data;
    } else {
      // POST는 form submit 방식 사용 (CORS 우회)
      return new Promise((resolve, reject) => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = API_BASE_URL;
        form.target = '_blank';
        
        // action 파라미터 추가
        const actionInput = document.createElement('input');
        actionInput.type = 'hidden';
        actionInput.name = 'action';
        actionInput.value = action;
        form.appendChild(actionInput);
        
        // 나머지 파라미터 추가
        Object.entries(params).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        
        // iframe으로 제출 (페이지 이동 방지)
        const iframe = document.createElement('iframe');
        iframe.name = 'api-frame-' + Date.now();
        iframe.style.display = 'none';
        form.target = iframe.name;
        
        document.body.appendChild(iframe);
        document.body.appendChild(form);
        
        iframe.onload = () => {
          setTimeout(() => {
            iframe.remove();
            form.remove();
            resolve({ submitted: true });
          }, 100);
        };
        
        form.submit();
      });
    }
  } catch (error) {
    console.error(`API 호출 실패 (${action}):`, error);
    throw error;
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
    // 데모 데이터
    const deal = {
      DEAL_ID: dealId,
      Industry: 'IT/소프트웨어',
      Deal_Type: '투자유치',
      Summary: 'AI 기반 HR 솔루션 스타트업. 기업 채용 프로세스를 혁신하는 SaaS 플랫폼.',
      Revenue_Range: '10억~50억',
      Target_Valuation: '100억',
      Stage: 'Active'
    };
    
    container.innerHTML = `
      <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
        <!-- Header -->
        <div class="p-8 border-b border-white/10 bg-gradient-to-br from-blue-600/20 to-purple-600/10">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <i data-lucide="laptop" class="w-8 h-8 text-blue-400"></i>
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

function initRoundTable() {
  renderCalendar();
  loadUpcomingEvents();
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

function loadUpcomingEvents() {
  const container = document.getElementById('upcoming-events');
  if (!container) return;
  
  const events = [
    {
      RT_ID: 'RT_202412_001',
      Type: 'Public',
      Date_Time: '2024-12-15 14:00',
      Location: '강남 VS스퀘어 3층',
      Available_Slots: 6
    },
    {
      RT_ID: 'RT_202412_002',
      Type: 'Public',
      Date_Time: '2024-12-20 10:00',
      Location: '판교 스타트업캠퍼스',
      Available_Slots: 6
    }
  ];
  
  container.innerHTML = events.map(event => `
    <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-purple-500/20 rounded-xl flex flex-col items-center justify-center">
          <span class="text-xs text-purple-400 font-medium">${event.Date_Time.split(' ')[0].split('-')[1]}월</span>
          <span class="text-xl font-bold text-purple-400">${event.Date_Time.split(' ')[0].split('-')[2]}</span>
        </div>
        <div>
          <div class="font-semibold text-white">${event.RT_ID}</div>
          <div class="text-sm text-gray-500 flex items-center gap-1 mt-1">
            <i data-lucide="map-pin" class="w-4 h-4"></i>
            ${event.Location}
          </div>
          <div class="text-sm text-gray-500 flex items-center gap-1">
            <i data-lucide="clock" class="w-4 h-4"></i>
            ${event.Date_Time.split(' ')[1]}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-sm text-gray-400">
          잔여 <span class="font-bold text-blue-400">${event.Available_Slots}</span>석
        </div>
        <button onclick="openRTModal('${event.RT_ID}')"
          class="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <i data-lucide="calendar-plus" class="w-4 h-4"></i>
          참가 신청
        </button>
      </div>
    </div>
  `).join('');
  
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
  
  // 데모 데이터
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
  
  lucide.createIcons();
  showToast('조회가 완료되었습니다.', 'success');
}

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
