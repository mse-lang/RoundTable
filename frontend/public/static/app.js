/**
 * VS AI ERP - Frontend Application
 * 딜룸 프론트엔드 JavaScript
 */

// ============================================================
// 설정
// ============================================================

// GAS API URL (배포 후 실제 URL로 교체)
const API_BASE_URL = window.GAS_API_URL || '';

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
  // 필터 옵션 로드
  await loadFilterOptions();
  
  // 딜 목록 로드
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
    // 데모 데이터 (GAS 연동 시 API 호출로 교체)
    const industries = ['IT/소프트웨어', '바이오/헬스케어', '핀테크', '이커머스', '에듀테크'];
    const revenues = ['Pre-Revenue', '1억 미만', '1억~5억', '5억~10억', '10억~50억', '50억~100억', '100억 이상'];
    
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
    <div class="col-span-full text-center py-12">
      <i class="fas fa-spinner fa-spin text-4xl text-gray-300"></i>
      <p class="text-gray-500 mt-4">딜 정보를 불러오는 중...</p>
    </div>
  `;
  
  try {
    // 데모 데이터 (GAS 연동 시 API 호출로 교체)
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
    
    // 필터 적용
    let filteredDeals = demoDeals;
    if (state.filters.industry) {
      filteredDeals = filteredDeals.filter(d => d.Industry === state.filters.industry);
    }
    if (state.filters.dealType) {
      filteredDeals = filteredDeals.filter(d => d.Deal_Type === state.filters.dealType);
    }
    
    // 통계 업데이트
    document.getElementById('stat-deals').textContent = filteredDeals.length;
    
    // 딜 카드 렌더링
    if (filteredDeals.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full text-center py-12">
          <i class="fas fa-inbox text-4xl text-gray-300"></i>
          <p class="text-gray-500 mt-4">조건에 맞는 딜이 없습니다.</p>
        </div>
      `;
      return;
    }
    
    grid.innerHTML = filteredDeals.map(deal => dealCardHTML(deal)).join('');
    
  } catch (error) {
    console.error('딜 목록 로드 실패:', error);
    grid.innerHTML = `
      <div class="col-span-full text-center py-12">
        <i class="fas fa-exclamation-circle text-4xl text-red-300"></i>
        <p class="text-gray-500 mt-4">딜 정보를 불러오는데 실패했습니다.</p>
      </div>
    `;
  }
}

// 딜 카드 HTML 생성
function dealCardHTML(deal) {
  const industryIcons = {
    'IT/소프트웨어': 'fa-laptop-code',
    '바이오/헬스케어': 'fa-heartbeat',
    '핀테크': 'fa-coins',
    '이커머스': 'fa-shopping-cart',
    '에듀테크': 'fa-graduation-cap'
  };
  
  const icon = industryIcons[deal.Industry] || 'fa-briefcase';
  
  return `
    <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
      <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <i class="fas ${icon} text-2xl"></i>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-medium bg-white/20">
            ${deal.Deal_Type || '투자유치'}
          </span>
        </div>
        <div class="text-sm opacity-80 mb-1">${deal.Industry || '기타'}</div>
        <div class="text-xs opacity-60">${deal.DEAL_ID}</div>
      </div>
      
      <div class="p-6">
        <p class="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[60px]">
          ${deal.Summary || '상세 정보는 NDA 서명 후 열람 가능합니다.'}
        </p>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">매출 규모</div>
            <div class="font-semibold text-gray-900">${deal.Revenue_Range || '-'}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">희망 밸류</div>
            <div class="font-semibold text-blue-600">${deal.Target_Valuation || '-'}</div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <a href="/deal/${deal.DEAL_ID}" 
            class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-center text-sm font-medium hover:bg-gray-200 transition">
            <i class="fas fa-eye mr-1"></i>티저 보기
          </a>
          <button 
            onclick="openNDAModal('${deal.DEAL_ID}')"
            class="flex-1 bg-blue-600 text-white py-2 rounded-lg text-center text-sm font-medium hover:bg-blue-700 transition">
            <i class="fas fa-file-signature mr-1"></i>상세 열람
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
    // 데모 데이터 (GAS 연동 시 API 호출로 교체)
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
      <div class="bg-white rounded-2xl shadow-lg overflow-hidden">
        <!-- Header -->
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <i class="fas fa-laptop-code text-3xl"></i>
            </div>
            <div>
              <div class="text-sm opacity-80">${deal.Industry}</div>
              <h1 class="text-2xl font-bold">${deal.DEAL_ID}</h1>
            </div>
          </div>
          <div class="flex gap-3">
            <span class="px-3 py-1 rounded-full text-sm bg-white/20">${deal.Deal_Type}</span>
            <span class="px-3 py-1 rounded-full text-sm bg-green-400/30 text-green-100">
              <i class="fas fa-circle text-xs mr-1"></i>${deal.Stage}
            </span>
          </div>
        </div>
        
        <!-- Body -->
        <div class="p-8">
          <!-- Teaser Info -->
          <div class="mb-8">
            <h2 class="text-lg font-bold text-gray-900 mb-4">
              <i class="fas fa-info-circle text-blue-500 mr-2"></i>
              티저 정보
            </h2>
            <p class="text-gray-600 leading-relaxed">
              ${deal.Summary}
            </p>
          </div>
          
          <!-- Key Metrics -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div class="bg-gray-50 rounded-xl p-4 text-center">
              <div class="text-sm text-gray-500 mb-1">매출 규모</div>
              <div class="text-lg font-bold text-gray-900">${deal.Revenue_Range}</div>
            </div>
            <div class="bg-blue-50 rounded-xl p-4 text-center">
              <div class="text-sm text-blue-600 mb-1">희망 밸류</div>
              <div class="text-lg font-bold text-blue-700">${deal.Target_Valuation}</div>
            </div>
            <div class="bg-gray-50 rounded-xl p-4 text-center">
              <div class="text-sm text-gray-500 mb-1">딜 유형</div>
              <div class="text-lg font-bold text-gray-900">${deal.Deal_Type}</div>
            </div>
            <div class="bg-gray-50 rounded-xl p-4 text-center">
              <div class="text-sm text-gray-500 mb-1">업종</div>
              <div class="text-lg font-bold text-gray-900">${deal.Industry}</div>
            </div>
          </div>
          
          <!-- Full Report Section (Locked) -->
          <div class="bg-gray-100 rounded-xl p-8 text-center mb-8">
            <div class="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <i class="fas fa-lock text-3xl text-gray-500"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-700 mb-2">상세 정보는 NDA 서명 후 열람 가능합니다</h3>
            <p class="text-gray-500 mb-6">
              투자심사보고서, 재무제표, 기술 자료 등 상세 정보를 확인하시려면<br/>
              NDA(비밀유지계약) 서명이 필요합니다.
            </p>
            <button onclick="openNDAModal('${deal.DEAL_ID}')"
              class="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition inline-flex items-center gap-2">
              <i class="fas fa-file-signature"></i>
              NDA 서명하고 열람하기
            </button>
          </div>
          
          <!-- Actions -->
          <div class="flex gap-4">
            <a href="/" class="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg text-center font-medium hover:bg-gray-200 transition">
              <i class="fas fa-arrow-left mr-2"></i>목록으로
            </a>
            <button onclick="openNDAModal('${deal.DEAL_ID}')"
              class="flex-1 bg-blue-600 text-white py-3 rounded-lg text-center font-medium hover:bg-blue-700 transition">
              <i class="fas fa-calendar-plus mr-2"></i>미팅 요청
            </button>
          </div>
        </div>
      </div>
    `;
    
  } catch (error) {
    console.error('딜 상세 로드 실패:', error);
    container.innerHTML = `
      <div class="text-center py-12">
        <i class="fas fa-exclamation-circle text-4xl text-red-300"></i>
        <p class="text-gray-500 mt-4">딜 정보를 불러오는데 실패했습니다.</p>
      </div>
    `;
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
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>처리 중...';
      errorDiv.classList.add('hidden');
      
      try {
        // API 호출 (데모에서는 시뮬레이션)
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 성공 시
        alert('NDA 서명 요청이 발송되었습니다.\n카카오톡을 확인해주세요.');
        closeNDAModal();
        ndaForm.reset();
        
      } catch (error) {
        errorDiv.classList.remove('hidden');
        errorMsg.textContent = error.message || 'NDA 요청 중 오류가 발생했습니다.';
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>서명 요청하기';
      }
    });
  }
});

// 모달 외부 클릭 시 닫기
document.addEventListener('click', (e) => {
  const modal = document.getElementById('nda-modal');
  if (modal && e.target === modal) {
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
  
  // 현재 월의 날짜 생성
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  
  let html = '';
  
  // 시작 요일까지 빈 셀
  for (let i = 0; i < firstDay.getDay(); i++) {
    html += '<div class="p-4 border-b border-r bg-gray-50"></div>';
  }
  
  // 날짜 셀
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const isToday = day === now.getDate();
    const hasEvent = [15, 20, 22].includes(day); // 데모 이벤트
    
    html += `
      <div class="p-4 border-b border-r min-h-[100px] ${isToday ? 'bg-blue-50' : 'hover:bg-gray-50'} transition cursor-pointer"
           onclick="showDayEvents(${year}, ${month + 1}, ${day})">
        <div class="font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}">${day}</div>
        ${hasEvent ? `
          <div class="mt-2">
            <div class="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded truncate">
              라운드테이블
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
  
  grid.innerHTML = html;
  
  // 월 표시 업데이트
  const monthNames = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
  document.getElementById('current-month').textContent = `${year}년 ${monthNames[month]}`;
}

function loadUpcomingEvents() {
  const container = document.getElementById('upcoming-events');
  if (!container) return;
  
  // 데모 이벤트
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
    <div class="bg-white rounded-xl shadow p-6 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-14 h-14 bg-blue-100 rounded-xl flex flex-col items-center justify-center">
          <span class="text-xs text-blue-600 font-medium">${event.Date_Time.split(' ')[0].split('-')[1]}월</span>
          <span class="text-xl font-bold text-blue-700">${event.Date_Time.split(' ')[0].split('-')[2]}</span>
        </div>
        <div>
          <div class="font-semibold text-gray-900">${event.RT_ID}</div>
          <div class="text-sm text-gray-500">
            <i class="fas fa-map-marker-alt mr-1"></i>${event.Location}
          </div>
          <div class="text-sm text-gray-500">
            <i class="fas fa-clock mr-1"></i>${event.Date_Time.split(' ')[1]}
          </div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-sm text-gray-500 mb-2">
          잔여 <span class="font-bold text-blue-600">${event.Available_Slots}</span>석
        </div>
        <button onclick="openRTModal('${event.RT_ID}')"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
          참가 신청
        </button>
      </div>
    </div>
  `).join('');
}

// 라운드테이블 모달
function openRTModal(rtId) {
  const modal = document.getElementById('rt-apply-modal');
  const rtIdInput = document.getElementById('rt-id');
  const rtInfo = document.getElementById('rt-info');
  
  if (modal && rtIdInput) {
    rtIdInput.value = rtId;
    rtInfo.innerHTML = `<strong>${rtId}</strong>에 참가 신청합니다.`;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
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
    document.getElementById('user-email').value = savedEmail;
  }
}

async function loadUserStatus() {
  const email = document.getElementById('user-email').value;
  if (!email) {
    alert('이메일을 입력해주세요.');
    return;
  }
  
  localStorage.setItem('userEmail', email);
  
  // 데모 데이터
  document.getElementById('my-nda-list').innerHTML = `
    <div class="divide-y">
      <div class="py-4 flex items-center justify-between">
        <div>
          <div class="font-medium">DEAL_20241128_001</div>
          <div class="text-sm text-gray-500">IT/소프트웨어 • 투자유치</div>
        </div>
        <span class="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
          <i class="fas fa-check mr-1"></i>Signed
        </span>
      </div>
      <div class="py-4 flex items-center justify-between">
        <div>
          <div class="font-medium">DEAL_20241128_002</div>
          <div class="text-sm text-gray-500">바이오/헬스케어 • 매각</div>
        </div>
        <span class="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-700">
          <i class="fas fa-clock mr-1"></i>Pending
        </span>
      </div>
    </div>
  `;
  
  document.getElementById('my-rt-list').innerHTML = `
    <div class="divide-y">
      <div class="py-4 flex items-center justify-between">
        <div>
          <div class="font-medium">RT_202412_001</div>
          <div class="text-sm text-gray-500">2024-12-15 14:00 • 강남 VS스퀘어</div>
        </div>
        <span class="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
          <i class="fas fa-calendar-check mr-1"></i>확정
        </span>
      </div>
    </div>
  `;
}

// ============================================================
// 유틸리티
// ============================================================

function toggleMobileMenu() {
  const menu = document.getElementById('mobile-menu');
  if (menu) {
    menu.classList.toggle('hidden');
  }
}
