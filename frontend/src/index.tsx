import { Hono } from 'hono'
import { renderer } from './renderer'
import { cors } from 'hono/cors'

// Components
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { NDAModal } from './components/NDAModal'

const app = new Hono()

// Middleware
app.use(renderer)
app.use('/api/*', cors())

// ============================================================
// GAS API 프록시 (CORS 우회)
// ============================================================
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbzGCjvvVnwliXvEcvLwKsxFvYrQVuE6DfhcCFyPQ3zgOAA-DFA774xv5aFc3AuzBrly/exec'

// GET 요청 프록시
app.get('/api/gas', async (c) => {
  const url = new URL(c.req.url)
  const params = url.searchParams.toString()
  
  try {
    const response = await fetch(`${GAS_API_URL}?${params}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    return c.json({ success: false, message: 'GAS API 호출 실패', error: String(error) }, 500)
  }
})

// POST 요청 프록시
app.post('/api/gas', async (c) => {
  try {
    const body = await c.req.json()
    const response = await fetch(GAS_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    return c.json(data)
  } catch (error) {
    return c.json({ success: false, message: 'GAS API 호출 실패', error: String(error) }, 500)
  }
})

// ============================================================
// 메인 페이지 - 딜룸 목록
// ============================================================
app.get('/', (c) => {
  return c.render(
    <div class="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main class="flex-1">
        {/* Hero Section */}
        <section class="relative py-20 overflow-hidden">
          {/* Background Gradient */}
          <div class="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent"></div>
          <div class="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div class="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          
          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="max-w-3xl">
              <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                투자 기회를<br />
                <span class="gradient-text">발견하세요</span>
              </h1>
              <p class="text-xl text-gray-400 mb-8 leading-relaxed">
                AI가 분석한 검증된 스타트업 딜을 안전하게 열람하고, 
                라운드테이블에서 직접 만나보세요.
              </p>
              <div class="flex flex-wrap gap-4">
                <a href="#deals" class="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50">
                  <i data-lucide="search" class="w-5 h-5"></i>
                  딜 둘러보기
                </a>
                <a href="/round-table" class="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-all border border-white/20">
                  <i data-lucide="calendar" class="w-5 h-5"></i>
                  라운드테이블
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section class="py-8 border-y border-white/10 bg-white/5">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div class="text-center">
                <div class="text-3xl font-bold text-white mb-1" id="stat-deals">-</div>
                <div class="text-sm text-gray-500">Active Deals</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-white mb-1">500+</div>
                <div class="text-sm text-gray-500">투자자</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-white mb-1">120+</div>
                <div class="text-sm text-gray-500">성사된 미팅</div>
              </div>
              <div class="text-center">
                <div class="text-3xl font-bold text-white mb-1">500억+</div>
                <div class="text-sm text-gray-500">누적 투자 규모</div>
              </div>
            </div>
          </div>
        </section>

        {/* Deal List Section */}
        <section id="deals" class="py-16">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header & Filters */}
            <div class="flex flex-col lg:flex-row gap-4 mb-8 justify-between items-start lg:items-center">
              <div>
                <h2 class="text-2xl font-bold text-white flex items-center gap-2">
                  <i data-lucide="flame" class="w-6 h-6 text-orange-500"></i>
                  Active Deals
                </h2>
                <p class="text-gray-500 mt-1">AI가 분석한 투자 기회</p>
              </div>
              
              <div class="flex flex-wrap gap-3">
                <select id="filter-industry" class="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="">전체 업종</option>
                </select>
                <select id="filter-deal-type" class="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="">전체 유형</option>
                  <option value="투자유치">투자유치</option>
                  <option value="매각">매각</option>
                  <option value="M&A">M&A</option>
                </select>
                <select id="filter-revenue" class="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors">
                  <option value="">전체 매출</option>
                </select>
              </div>
            </div>

            {/* Deal Grid */}
            <div id="deal-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Loading State */}
              <div class="col-span-full flex flex-col items-center justify-center py-20">
                <div class="spinner mb-4"></div>
                <p class="text-gray-500">딜 정보를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section class="py-20 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold text-white mb-4">딜 등록을 원하시나요?</h2>
            <p class="text-gray-400 mb-8 max-w-xl mx-auto">
              AI가 분석한 투자심사보고서로 투자자에게 어필하세요.
              NDA 기반의 안전한 정보 공개를 보장합니다.
            </p>
            <a href="/register" class="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-all">
              <i data-lucide="plus" class="w-5 h-5"></i>
              딜 등록 신청
            </a>
          </div>
        </section>
      </main>

      <Footer />
      <NDAModal />
    </div>,
    { title: '벤쳐스퀘어 라운드테이블' }
  )
})

// ============================================================
// 딜 상세 페이지
// ============================================================
app.get('/deal/:id', (c) => {
  const dealId = c.req.param('id')
  
  return c.render(
    <div class="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main class="flex-1 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav class="mb-6">
            <ol class="flex items-center gap-2 text-sm text-gray-500">
              <li>
                <a href="/" class="hover:text-white transition-colors flex items-center gap-1">
                  <i data-lucide="layout-grid" class="w-4 h-4"></i>
                  딜룸
                </a>
              </li>
              <li><i data-lucide="chevron-right" class="w-4 h-4"></i></li>
              <li class="text-white font-medium" id="deal-id">{dealId}</li>
            </ol>
          </nav>

          {/* Deal Detail Container */}
          <div id="deal-detail" data-deal-id={dealId}>
            <div class="flex flex-col items-center justify-center py-20">
              <div class="spinner mb-4"></div>
              <p class="text-gray-500">딜 정보를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <NDAModal />
    </div>,
    { title: `딜 상세 | 벤쳐스퀘어 라운드테이블` }
  )
})

// ============================================================
// 라운드테이블 페이지
// ============================================================
app.get('/round-table', (c) => {
  return c.render(
    <div class="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main class="flex-1 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 class="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
                <div class="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <i data-lucide="users" class="w-5 h-5 text-purple-400"></i>
                </div>
                라운드테이블
              </h1>
              <p class="text-gray-400 mt-2">투자자와 창업자가 만나는 오프라인 미팅</p>
            </div>
            <div class="flex items-center gap-2 bg-white/5 rounded-xl p-1 border border-white/10">
              <button id="prev-month" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <i data-lucide="chevron-left" class="w-5 h-5 text-gray-400"></i>
              </button>
              <span id="current-month" class="px-4 py-2 font-semibold text-white min-w-[140px] text-center">2024년 12월</span>
              <button id="next-month" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <i data-lucide="chevron-right" class="w-5 h-5 text-gray-400"></i>
              </button>
            </div>
          </div>

          {/* Calendar */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden mb-8">
            {/* Calendar Header */}
            <div class="grid grid-cols-7 bg-white/5 border-b border-white/10">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                <div class={`py-4 text-center text-sm font-medium ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'}`}>
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Grid */}
            <div id="calendar-grid" class="grid grid-cols-7">
              <div class="col-span-7 flex items-center justify-center py-20">
                <div class="spinner"></div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <h2 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <i data-lucide="calendar-check" class="w-5 h-5 text-green-400"></i>
              다가오는 일정
            </h2>
            <div id="upcoming-events" class="space-y-4">
              {/* Events loaded via JavaScript */}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
      {/* Round Table Application Modal */}
      <div id="rt-apply-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeRTModal()"></div>
        <div class="relative bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-white/10 shadow-2xl modal-content">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold text-white">라운드테이블 참가 신청</h3>
            <button onclick="closeRTModal()" class="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <i data-lucide="x" class="w-5 h-5 text-gray-400"></i>
            </button>
          </div>
          
          <form id="rt-apply-form" class="space-y-4">
            <input type="hidden" id="rt-id" name="rtId" />
            
            <div id="rt-info" class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
              {/* RT info loaded dynamically */}
            </div>
            
            <div>
              <label class="block text-sm text-gray-400 mb-2">이름</label>
              <input type="text" name="name" required 
                class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
            </div>
            
            <div>
              <label class="block text-sm text-gray-400 mb-2">이메일</label>
              <input type="email" name="email" required 
                class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500" />
            </div>
            
            <div>
              <label class="block text-sm text-gray-400 mb-2">참가 목적</label>
              <select name="purpose" required 
                class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500">
                <option value="Sourcing">딜소싱 (투자자)</option>
                <option value="IR">IR (창업자)</option>
                <option value="Networking">네트워킹</option>
              </select>
            </div>
            
            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="feeAgreed" required class="mt-1 w-5 h-5" />
                <span class="text-sm text-yellow-200">
                  <strong class="text-yellow-400">수수료 확약 동의</strong><br />
                  <span class="text-yellow-200/80">
                    본 라운드테이블을 통해 투자가 성사될 경우, 
                    투자금의 <strong>3%</strong>를 수수료로 지급할 것을 확약합니다.
                  </span>
                </span>
              </label>
            </div>
            
            <button type="submit" 
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
              <i data-lucide="check" class="w-5 h-5"></i>
              참가 신청
            </button>
          </form>
        </div>
      </div>
    </div>,
    { title: '라운드테이블 | 벤쳐스퀘어' }
  )
})

// ============================================================
// 딜 등록 페이지
// ============================================================
app.get('/register', (c) => {
  return c.render(
    <div class="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main class="flex-1 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div class="mb-8">
            <h1 class="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <i data-lucide="plus-circle" class="w-5 h-5 text-blue-400"></i>
              </div>
              딜 등록 신청
            </h1>
            <p class="text-gray-400">투자 유치 또는 매각을 위한 딜 정보를 등록하세요</p>
          </div>

          {/* Process Steps */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i data-lucide="list-checks" class="w-5 h-5 text-green-400"></i>
              등록 프로세스
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-blue-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <div class="font-medium text-white text-sm">신청서 제출</div>
                  <div class="text-xs text-gray-500">기본 정보 입력</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-purple-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <div class="font-medium text-white text-sm">서류 검토</div>
                  <div class="text-xs text-gray-500">1-2 영업일</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-orange-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <div class="font-medium text-white text-sm">AI 분석</div>
                  <div class="text-xs text-gray-500">투자심사보고서 생성</div>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span class="text-green-400 font-bold text-sm">4</span>
                </div>
                <div>
                  <div class="font-medium text-white text-sm">딜룸 등록</div>
                  <div class="text-xs text-gray-500">투자자 매칭 시작</div>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <form id="deal-register-form" class="space-y-6">
            {/* Basic Info */}
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <i data-lucide="building-2" class="w-5 h-5 text-blue-400"></i>
                기업 정보
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-2">회사명 <span class="text-red-400">*</span></label>
                  <input type="text" name="companyName" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="주식회사 OOO" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">대표자명 <span class="text-red-400">*</span></label>
                  <input type="text" name="ceoName" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="홍길동" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">업종 <span class="text-red-400">*</span></label>
                  <select name="industry" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="">선택하세요</option>
                    <option value="IT/소프트웨어">IT/소프트웨어</option>
                    <option value="바이오/헬스케어">바이오/헬스케어</option>
                    <option value="핀테크">핀테크</option>
                    <option value="이커머스">이커머스</option>
                    <option value="에듀테크">에듀테크</option>
                    <option value="물류/로보틱스">물류/로보틱스</option>
                    <option value="모빌리티/에너지">모빌리티/에너지</option>
                    <option value="애그테크">애그테크</option>
                    <option value="콘텐츠/미디어">콘텐츠/미디어</option>
                    <option value="제조/하드웨어">제조/하드웨어</option>
                    <option value="기타">기타</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">설립연도 <span class="text-red-400">*</span></label>
                  <input type="number" name="foundedYear" required min="1900" max="2024"
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="2020" />
                </div>
              </div>
            </div>

            {/* Deal Info */}
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <i data-lucide="handshake" class="w-5 h-5 text-purple-400"></i>
                딜 정보
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-2">딜 유형 <span class="text-red-400">*</span></label>
                  <select name="dealType" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="">선택하세요</option>
                    <option value="투자유치">투자유치 (Fundraising)</option>
                    <option value="매각">매각 (M&A)</option>
                    <option value="전략적투자">전략적 투자 유치</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">투자 라운드</label>
                  <select name="investmentRound" 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="">선택하세요</option>
                    <option value="Pre-Seed">Pre-Seed</option>
                    <option value="Seed">Seed</option>
                    <option value="Series A">Series A</option>
                    <option value="Series B">Series B</option>
                    <option value="Series C+">Series C 이상</option>
                    <option value="Pre-IPO">Pre-IPO</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">매출 규모 <span class="text-red-400">*</span></label>
                  <select name="revenueRange" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="">선택하세요</option>
                    <option value="Pre-Revenue">Pre-Revenue</option>
                    <option value="1억 미만">1억 미만</option>
                    <option value="1억~5억">1억~5억</option>
                    <option value="5억~10억">5억~10억</option>
                    <option value="10억~50억">10억~50억</option>
                    <option value="50억~100억">50억~100억</option>
                    <option value="100억 이상">100억 이상</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">희망 밸류에이션 <span class="text-red-400">*</span></label>
                  <input type="text" name="targetValuation" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="예: 100억" />
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm text-gray-400 mb-2">희망 투자금액</label>
                  <input type="text" name="targetFunding" 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="예: 30억" />
                </div>
              </div>
            </div>

            {/* Business Description */}
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <i data-lucide="file-text" class="w-5 h-5 text-orange-400"></i>
                사업 소개
              </h2>
              
              <div class="space-y-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-2">사업 요약 (티저용) <span class="text-red-400">*</span></label>
                  <textarea name="summary" required rows={3}
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="투자자가 관심을 가질 만한 핵심 사업 내용을 2-3문장으로 요약해주세요. (NDA 없이 공개됩니다)"></textarea>
                  <p class="text-xs text-gray-600 mt-1">* 이 내용은 NDA 없이 티저로 공개됩니다</p>
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">상세 사업 설명</label>
                  <textarea name="description" rows={5}
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
                    placeholder="비즈니스 모델, 경쟁 우위, 성장 전략 등을 상세히 설명해주세요. (NDA 서명 후 공개)"></textarea>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
              <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <i data-lucide="mail" class="w-5 h-5 text-green-400"></i>
                연락처 정보
              </h2>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-2">담당자명 <span class="text-red-400">*</span></label>
                  <input type="text" name="contactName" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="김담당" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">직책</label>
                  <input type="text" name="contactTitle" 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="CFO" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">이메일 <span class="text-red-400">*</span></label>
                  <input type="email" name="contactEmail" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="contact@company.com" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">전화번호 <span class="text-red-400">*</span></label>
                  <input type="tel" name="contactPhone" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="010-1234-5678" />
                </div>
              </div>
            </div>

            {/* File Upload Info */}
            <div class="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6">
              <h2 class="text-lg font-bold text-blue-400 mb-2 flex items-center gap-2">
                <i data-lucide="upload-cloud" class="w-5 h-5"></i>
                제출 서류 안내
              </h2>
              <p class="text-blue-200/80 text-sm mb-4">
                신청서 제출 후 담당자가 연락드리면 아래 서류를 제출해주세요.
              </p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div class="flex items-center gap-2 text-blue-200">
                  <i data-lucide="check" class="w-4 h-4 text-blue-400"></i>
                  사업계획서 (IR Deck)
                </div>
                <div class="flex items-center gap-2 text-blue-200">
                  <i data-lucide="check" class="w-4 h-4 text-blue-400"></i>
                  최근 3년 재무제표
                </div>
                <div class="flex items-center gap-2 text-blue-200">
                  <i data-lucide="check" class="w-4 h-4 text-blue-400"></i>
                  법인등기부등본
                </div>
                <div class="flex items-center gap-2 text-blue-200">
                  <i data-lucide="check" class="w-4 h-4 text-blue-400"></i>
                  주주명부
                </div>
              </div>
            </div>

            {/* Agreement */}
            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="agreement" required class="mt-1 w-5 h-5 flex-shrink-0" />
                <span class="text-sm text-yellow-200">
                  <strong class="text-yellow-400">서비스 이용 동의</strong><br />
                  <span class="text-yellow-200/80">
                    본인은 딜 등록 신청에 따른 정보 제공에 동의하며, 
                    벤처스퀘어의 <a href="#" class="underline">이용약관</a> 및 
                    <a href="#" class="underline">개인정보처리방침</a>에 동의합니다.
                    제출된 정보는 투자 매칭 목적으로만 사용됩니다.
                  </span>
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div class="flex gap-4">
              <a href="/" class="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-xl font-semibold transition-colors text-center flex items-center justify-center gap-2">
                <i data-lucide="arrow-left" class="w-5 h-5"></i>
                취소
              </a>
              <button type="submit" id="register-submit-btn"
                class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
                <i data-lucide="send" class="w-5 h-5"></i>
                딜 등록 신청
              </button>
            </div>
          </form>

          {/* Success Message (Hidden by default) */}
          <div id="register-success" class="hidden">
            <div class="bg-green-500/10 border border-green-500/30 rounded-2xl p-8 text-center">
              <div class="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <i data-lucide="check-circle" class="w-8 h-8 text-green-400"></i>
              </div>
              <h2 class="text-2xl font-bold text-white mb-2">신청이 완료되었습니다!</h2>
              <p class="text-gray-400 mb-6">
                담당자가 1-2 영업일 내에 연락드리겠습니다.<br />
                제출하신 이메일로 확인 메일이 발송되었습니다.
              </p>
              <a href="/" class="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                <i data-lucide="home" class="w-5 h-5"></i>
                홈으로 돌아가기
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>,
    { title: '딜 등록 | 벤쳐스퀘어 라운드테이블' }
  )
})

// ============================================================
// 마이페이지
// ============================================================
app.get('/my-page', (c) => {
  return c.render(
    <div class="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main class="flex-1 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-2xl lg:text-3xl font-bold text-white mb-8 flex items-center gap-3">
            <div class="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
              <i data-lucide="user" class="w-5 h-5 text-green-400"></i>
            </div>
            마이페이지
          </h1>

          {/* Email Input */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
            <label class="block text-sm text-gray-400 mb-3">이메일로 조회</label>
            <div class="flex gap-4">
              <input 
                type="email" 
                id="user-email" 
                placeholder="investor@example.com"
                class="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" 
              />
              <button 
                onclick="loadUserStatus()" 
                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors flex items-center gap-2 font-medium"
              >
                <i data-lucide="search" class="w-5 h-5"></i>
                조회
              </button>
            </div>
          </div>

          {/* My NDA Status */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 mb-8">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i data-lucide="folder-open" class="w-5 h-5 text-yellow-400"></i>
              나의 NDA 현황
            </h2>
            <div id="my-nda-list">
              <div class="text-center py-12 text-gray-500">
                <i data-lucide="file-text" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                <p>이메일을 입력하고 조회해주세요.</p>
              </div>
            </div>
          </div>

          {/* My Round Tables */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i data-lucide="handshake" class="w-5 h-5 text-purple-400"></i>
              나의 라운드테이블
            </h2>
            <div id="my-rt-list">
              <div class="text-center py-12 text-gray-500">
                <i data-lucide="calendar" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                <p>이메일을 입력하고 조회해주세요.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>,
    { title: '마이페이지 | 벤쳐스퀘어 라운드테이블' }
  )
})

export default app
