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

        {/* CTA Section - 딜 등록 */}
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

        {/* Investor Registration CTA Section */}
        <section class="py-16 border-t border-white/10">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="bg-gradient-to-br from-purple-900/40 to-blue-900/40 rounded-3xl border border-purple-500/20 overflow-hidden">
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">
                {/* Left - Content */}
                <div class="flex flex-col justify-center">
                  <div class="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium mb-6 w-fit">
                    <i data-lucide="sparkles" class="w-4 h-4"></i>
                    투자자 전용
                  </div>
                  <h2 class="text-2xl lg:text-3xl font-bold text-white mb-4 leading-tight">
                    새로운 딜 소식을<br/>
                    가장 먼저 받아보세요
                  </h2>
                  <p class="text-gray-400 mb-6 leading-relaxed">
                    투자자 회원으로 등록하시면 매주 엄선된 스타트업 딜 정보를 
                    뉴스레터로 받아보실 수 있습니다. AI가 분석한 투자심사보고서와 
                    함께 검증된 투자 기회를 만나보세요.
                  </p>
                  
                  {/* Benefits */}
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    <div class="flex items-center gap-3 text-sm">
                      <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i data-lucide="mail" class="w-4 h-4 text-blue-400"></i>
                      </div>
                      <span class="text-gray-300">주간 딜 뉴스레터</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm">
                      <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i data-lucide="eye" class="w-4 h-4 text-green-400"></i>
                      </div>
                      <span class="text-gray-300">월 5건 무료 열람</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm">
                      <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i data-lucide="calendar" class="w-4 h-4 text-purple-400"></i>
                      </div>
                      <span class="text-gray-300">라운드테이블 초대</span>
                    </div>
                    <div class="flex items-center gap-3 text-sm">
                      <div class="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i data-lucide="gift" class="w-4 h-4 text-orange-400"></i>
                      </div>
                      <span class="text-gray-300">추천 시 +2 열람권</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <a href="/investor/register" 
                    class="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 w-fit">
                    <i data-lucide="briefcase" class="w-5 h-5"></i>
                    투자자 등록 신청
                    <i data-lucide="arrow-right" class="w-5 h-5"></i>
                  </a>
                </div>

                {/* Right - Visual */}
                <div class="hidden lg:flex items-center justify-center">
                  <div class="relative">
                    {/* Background Glow */}
                    <div class="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-blue-500/30 rounded-3xl blur-3xl"></div>
                    
                    {/* Mock Newsletter Card */}
                    <div class="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 w-80 transform rotate-3 hover:rotate-0 transition-transform">
                      <div class="flex items-center gap-3 mb-4">
                        <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                          <i data-lucide="mail" class="w-5 h-5 text-white"></i>
                        </div>
                        <div>
                          <div class="text-white font-semibold text-sm">VS Round Table</div>
                          <div class="text-gray-500 text-xs">Weekly Deal Newsletter</div>
                        </div>
                      </div>
                      <div class="space-y-3">
                        <div class="bg-white/5 rounded-lg p-3">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded-full">AI/SaaS</span>
                            <span class="text-green-400 text-xs">NEW</span>
                          </div>
                          <div class="text-white text-sm font-medium">AI 기반 HR 솔루션 스타트업</div>
                          <div class="text-gray-500 text-xs mt-1">Series A · 목표 100억</div>
                        </div>
                        <div class="bg-white/5 rounded-lg p-3">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded-full">핀테크</span>
                            <span class="text-green-400 text-xs">NEW</span>
                          </div>
                          <div class="text-white text-sm font-medium">블록체인 B2B 결제 플랫폼</div>
                          <div class="text-gray-500 text-xs mt-1">Series B · 목표 300억</div>
                        </div>
                        <div class="bg-white/5 rounded-lg p-3 opacity-60">
                          <div class="flex items-center gap-2 mb-1">
                            <span class="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">헬스케어</span>
                          </div>
                          <div class="text-white text-sm font-medium">디지털 헬스케어 플랫폼</div>
                          <div class="text-gray-500 text-xs mt-1">Pre-A · 목표 50억</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                    벤처스퀘어의 <a href="/terms" class="underline hover:text-yellow-300">이용약관</a> 및 
                    <a href="/privacy" class="underline hover:text-yellow-300">개인정보처리방침</a>에 동의합니다.
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
// 이용약관
// ============================================================
app.get('/terms', (c) => {
  return c.render(
    <div class="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main class="flex-1 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div class="mb-8">
            <h1 class="text-2xl lg:text-3xl font-bold text-white mb-2">이용약관</h1>
            <p class="text-gray-400">VentureSquare Round Table 서비스 이용약관</p>
          </div>

          {/* Content */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 lg:p-8 space-y-8">
            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm text-blue-400">1</span>
                목적
              </h2>
              <p class="text-gray-400 leading-relaxed text-sm">
                본 약관은 (주)벤처스퀘어(이하 "회사")가 제공하는 VentureSquare Round Table 서비스(이하 "서비스")의 이용조건 및 절차, 
                회사와 이용자의 권리, 의무 및 책임사항 등을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm text-blue-400">2</span>
                서비스의 내용
              </h2>
              <p class="text-gray-400 leading-relaxed text-sm mb-3">
                회사가 제공하는 서비스는 다음과 같습니다:
              </p>
              <ul class="list-disc list-inside text-gray-400 text-sm space-y-1 pl-2">
                <li>스타트업 투자 딜 정보 열람 서비스</li>
                <li>NDA(비밀유지계약) 기반 딜룸 접근 서비스</li>
                <li>라운드테이블(오프라인 미팅) 참가 신청 서비스</li>
                <li>AI 기반 투자심사보고서 제공 서비스</li>
                <li>기타 회사가 추가 개발하거나 제휴를 통해 제공하는 서비스</li>
              </ul>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm text-blue-400">3</span>
                이용자의 의무
              </h2>
              <p class="text-gray-400 leading-relaxed text-sm mb-3">
                이용자는 다음 행위를 하여서는 안 됩니다:
              </p>
              <ul class="list-disc list-inside text-gray-400 text-sm space-y-1 pl-2">
                <li>서비스를 통해 취득한 딜 정보를 제3자에게 무단 제공, 누설하는 행위</li>
                <li>NDA 서명 없이 딜 상세정보에 접근하거나 이를 시도하는 행위</li>
                <li>허위 정보를 등록하거나 타인의 정보를 도용하는 행위</li>
                <li>서비스의 안정적 운영을 방해하는 행위</li>
                <li>기타 관련 법령에 위배되는 행위</li>
              </ul>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm text-blue-400">4</span>
                비밀유지 의무
              </h2>
              <p class="text-gray-400 leading-relaxed text-sm">
                이용자는 서비스 이용 과정에서 취득한 모든 딜 관련 정보(기업명, 재무정보, 사업계획 등)에 대해 
                비밀유지 의무를 가지며, 별도의 NDA 서명 시 해당 계약 조건을 준수하여야 합니다. 
                비밀유지 의무 위반 시 민형사상 책임을 질 수 있습니다.
              </p>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm text-blue-400">5</span>
                수수료
              </h2>
              <p class="text-gray-400 leading-relaxed text-sm">
                라운드테이블을 통해 투자가 성사될 경우, 투자금의 일정 비율(3% 등)을 수수료로 지급하는 것에 동의합니다. 
                수수료 비율은 참가 신청 시 명시되며, 신청 완료 시 이에 동의한 것으로 간주합니다.
              </p>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm text-blue-400">6</span>
                면책조항
              </h2>
              <p class="text-gray-400 leading-relaxed text-sm">
                회사는 서비스에 등록된 딜 정보의 정확성, 완전성을 보증하지 않으며, 
                이용자의 투자 결정에 따른 손실에 대해 책임지지 않습니다. 
                투자는 이용자 본인의 판단과 책임하에 이루어져야 합니다.
              </p>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center text-sm text-blue-400">7</span>
                분쟁해결
              </h2>
              <p class="text-gray-400 leading-relaxed text-sm">
                서비스 이용과 관련하여 발생한 분쟁에 대해 회사와 이용자는 성실히 협의하여 해결합니다. 
                협의가 이루어지지 않을 경우, 관할 법원은 회사 소재지 관할 법원으로 합니다.
              </p>
            </section>

            <section class="bg-white/5 rounded-xl p-4 border border-white/10">
              <h2 class="text-base font-bold text-white mb-2">부칙</h2>
              <p class="text-gray-500 text-sm">
                본 약관은 2024년 1월 1일부터 시행합니다.<br/>
                최종 개정일: 2024년 11월 28일
              </p>
            </section>
          </div>

          {/* Back Button */}
          <div class="mt-8 text-center">
            <a href="/" class="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              홈으로 돌아가기
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>,
    { title: '이용약관 | 벤쳐스퀘어 라운드테이블' }
  )
})

// ============================================================
// 개인정보처리방침
// ============================================================
app.get('/privacy', (c) => {
  return c.render(
    <div class="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main class="flex-1 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div class="mb-8">
            <h1 class="text-2xl lg:text-3xl font-bold text-white mb-2">개인정보처리방침</h1>
            <p class="text-gray-400">(주)벤처스퀘어 개인정보처리방침</p>
          </div>

          {/* Content */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 lg:p-8 space-y-8">
            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-sm text-purple-400">1</span>
                개인정보 수집 항목
              </h2>
              <p class="text-gray-400 leading-relaxed text-sm mb-3">
                회사는 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다:
              </p>
              <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                <ul class="text-gray-400 text-sm space-y-2">
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span><strong class="text-white">필수 정보:</strong> 이름, 이메일 주소, 휴대폰 번호</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span><strong class="text-white">딜 등록 시:</strong> 회사명, 대표자명, 사업자등록번호, 사업 정보</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span><strong class="text-white">자동 수집:</strong> IP 주소, 쿠키, 방문 일시, 서비스 이용 기록</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-sm text-purple-400">2</span>
                개인정보 수집 및 이용목적
              </h2>
              <ul class="list-disc list-inside text-gray-400 text-sm space-y-1 pl-2">
                <li>서비스 제공 및 운영 (딜 정보 열람, NDA 체결, 라운드테이블 참가)</li>
                <li>회원 관리 및 본인 확인</li>
                <li>투자자-스타트업 매칭 서비스 제공</li>
                <li>서비스 관련 공지 및 고객 문의 응대</li>
                <li>서비스 개선 및 맞춤 서비스 제공</li>
              </ul>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-sm text-purple-400">3</span>
                개인정보 보유 및 이용기간
              </h2>
              <p class="text-gray-400 leading-relaxed text-sm mb-3">
                회사는 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 지체 없이 파기합니다. 
                단, 관계 법령에 따라 보존해야 하는 경우 해당 기간 동안 보관합니다:
              </p>
              <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                <ul class="text-gray-400 text-sm space-y-2">
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span>계약 또는 청약철회 등에 관한 기록: <strong class="text-white">5년</strong> (전자상거래법)</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span>대금결제 및 재화 등의 공급에 관한 기록: <strong class="text-white">5년</strong> (전자상거래법)</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span>소비자 불만 또는 분쟁처리에 관한 기록: <strong class="text-white">3년</strong> (전자상거래법)</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span>웹사이트 방문 기록: <strong class="text-white">3개월</strong> (통신비밀보호법)</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-sm text-purple-400">4</span>
                개인정보의 제3자 제공
              </h2>
              <p class="text-gray-400 leading-relaxed text-sm">
                회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 
                다만, 다음의 경우에는 예외로 합니다:
              </p>
              <ul class="list-disc list-inside text-gray-400 text-sm space-y-1 pl-2 mt-3">
                <li>이용자가 사전에 동의한 경우</li>
                <li>NDA 체결 시 해당 딜 담당자에게 연락처 제공 (별도 동의)</li>
                <li>법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차에 따른 요청이 있는 경우</li>
              </ul>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-sm text-purple-400">5</span>
                개인정보 보호를 위한 기술적/관리적 대책
              </h2>
              <ul class="list-disc list-inside text-gray-400 text-sm space-y-1 pl-2">
                <li>개인정보 암호화: 비밀번호는 암호화되어 저장 및 관리</li>
                <li>해킹 등에 대비한 기술적 대책: SSL/TLS 암호화 통신</li>
                <li>개인정보 취급 직원의 최소화 및 교육</li>
                <li>개인정보보호 내부관리계획 수립 및 시행</li>
              </ul>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-sm text-purple-400">6</span>
                이용자의 권리와 행사 방법
              </h2>
              <p class="text-gray-400 leading-relaxed text-sm">
                이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회, 수정, 삭제할 수 있으며, 
                개인정보 처리에 대한 동의 철회를 요청할 수 있습니다. 
                관련 문의는 개인정보보호 담당자에게 서면, 전화 또는 이메일로 연락하시면 
                지체 없이 조치하겠습니다.
              </p>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-sm text-purple-400">7</span>
                개인정보 보호책임자
              </h2>
              <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                <ul class="text-gray-400 text-sm space-y-2">
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span><strong class="text-white">성명:</strong> 명승은</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span><strong class="text-white">직책:</strong> 대표이사</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span><strong class="text-white">이메일:</strong> roundtable@venturesquare.net</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span><strong class="text-white">전화번호:</strong> 02-1877-6503</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 class="text-lg font-bold text-white mb-3 flex items-center gap-2">
                <span class="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center text-sm text-purple-400">8</span>
                고충처리 기관
              </h2>
              <p class="text-gray-400 leading-relaxed text-sm mb-3">
                개인정보 침해에 대한 신고나 상담이 필요한 경우, 아래 기관에 문의하실 수 있습니다:
              </p>
              <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                <ul class="text-gray-400 text-sm space-y-2">
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span>개인정보침해신고센터: (국번없이) 118 / privacy.kisa.or.kr</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span>개인정보분쟁조정위원회: 1833-6972 / kopico.go.kr</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span>대검찰청 사이버수사과: (국번없이) 1301 / spo.go.kr</span>
                  </li>
                  <li class="flex items-start gap-2">
                    <span class="text-purple-400">•</span>
                    <span>경찰청 사이버안전국: (국번없이) 182 / cyberbureau.police.go.kr</span>
                  </li>
                </ul>
              </div>
            </section>

            <section class="bg-white/5 rounded-xl p-4 border border-white/10">
              <h2 class="text-base font-bold text-white mb-2">부칙</h2>
              <p class="text-gray-500 text-sm">
                본 개인정보처리방침은 2024년 1월 1일부터 적용됩니다.<br/>
                최종 개정일: 2024년 11월 28일
              </p>
            </section>
          </div>

          {/* Back Button */}
          <div class="mt-8 text-center">
            <a href="/" class="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <i data-lucide="arrow-left" class="w-4 h-4"></i>
              홈으로 돌아가기
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>,
    { title: '개인정보처리방침 | 벤쳐스퀘어 라운드테이블' }
  )
})

// ============================================================
// 투자자 회원가입 프로세스 안내
// ============================================================
app.get('/investor/register', (c) => {
  return c.render(
    <div class="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main class="flex-1 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div class="mb-8 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i data-lucide="briefcase" class="w-8 h-8 text-white"></i>
            </div>
            <h1 class="text-2xl lg:text-3xl font-bold text-white mb-2">투자자 회원 가입</h1>
            <p class="text-gray-400">VentureSquare Round Table 투자자 회원 가입 프로세스</p>
          </div>

          {/* Notice Box */}
          <div class="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-6 mb-8">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <i data-lucide="info" class="w-5 h-5 text-blue-400"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-blue-400 mb-2">가입 안내</h3>
                <p class="text-blue-200/80 text-sm leading-relaxed">
                  투자자 회원은 <strong class="text-white">운영진이 발급한 아이디와 비밀번호</strong>로만 접속할 수 있습니다.
                  가입을 원하시면 아래 양식을 작성해 주시면, 운영진 검토 후 계정을 발급해 드립니다.
                </p>
              </div>
            </div>
          </div>

          {/* Process Steps */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
            <h2 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <i data-lucide="list-checks" class="w-5 h-5 text-green-400"></i>
              가입 프로세스
            </h2>
            
            <div class="space-y-6">
              {/* Step 1 */}
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <div class="w-0.5 h-full bg-white/10 mt-2"></div>
                </div>
                <div class="flex-1 pb-6">
                  <h3 class="text-white font-semibold mb-1">가입 신청서 제출</h3>
                  <p class="text-gray-400 text-sm">아래 양식을 작성하여 가입 신청</p>
                </div>
              </div>
              
              {/* Step 2 */}
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <div class="w-0.5 h-full bg-white/10 mt-2"></div>
                </div>
                <div class="flex-1 pb-6">
                  <h3 class="text-white font-semibold mb-1">운영진 검토</h3>
                  <p class="text-gray-400 text-sm">영업일 기준 1-2일 내 검토</p>
                </div>
              </div>
              
              {/* Step 3 */}
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <div class="w-0.5 h-full bg-white/10 mt-2"></div>
                </div>
                <div class="flex-1 pb-6">
                  <h3 class="text-white font-semibold mb-1">본인인증</h3>
                  <p class="text-gray-400 text-sm">휴대폰 본인인증 진행 (필수)</p>
                </div>
              </div>
              
              {/* Step 4 */}
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                </div>
                <div class="flex-1">
                  <h3 class="text-white font-semibold mb-1">계정 발급</h3>
                  <p class="text-gray-400 text-sm">이메일로 아이디/비밀번호 전달</p>
                </div>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i data-lucide="gift" class="w-5 h-5 text-yellow-400"></i>
              회원 혜택
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <i data-lucide="eye" class="w-4 h-4 text-blue-400"></i>
                  </div>
                  <span class="text-white font-medium">월 5건 무료 열람</span>
                </div>
                <p class="text-gray-500 text-sm">매월 5건의 딜 자료를 무료로 열람할 수 있습니다.</p>
              </div>
              
              <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <i data-lucide="users" class="w-4 h-4 text-purple-400"></i>
                  </div>
                  <span class="text-white font-medium">추천 보너스</span>
                </div>
                <p class="text-gray-500 text-sm">다른 투자자를 추천하면 추가 2건 열람권 제공</p>
              </div>
              
              <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <i data-lucide="calendar-check" class="w-4 h-4 text-green-400"></i>
                  </div>
                  <span class="text-white font-medium">라운드테이블 참가</span>
                </div>
                <p class="text-gray-500 text-sm">오프라인 투자 미팅 우선 참가 기회</p>
              </div>
              
              <div class="bg-white/5 rounded-xl p-4 border border-white/5">
                <div class="flex items-center gap-3 mb-2">
                  <div class="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <i data-lucide="shield-check" class="w-4 h-4 text-orange-400"></i>
                  </div>
                  <span class="text-white font-medium">NDA 보호</span>
                </div>
                <p class="text-gray-500 text-sm">전자서명 기반 안전한 NDA 체결</p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
            <h2 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <i data-lucide="user-plus" class="w-5 h-5 text-blue-400"></i>
              가입 신청서
            </h2>
            
            <form id="investor-register-form" class="space-y-6">
              {/* Personal Info */}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-2">성명 <span class="text-red-400">*</span></label>
                  <input type="text" name="name" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="홍길동" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">이메일 <span class="text-red-400">*</span></label>
                  <input type="email" name="email" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="investor@company.com" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">휴대폰 번호 <span class="text-red-400">*</span></label>
                  <input type="tel" name="phone" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="010-1234-5678" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">소속 기관/회사 <span class="text-red-400">*</span></label>
                  <input type="text" name="company" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="OO벤처캐피탈" />
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm text-gray-400 mb-2">직책 <span class="text-red-400">*</span></label>
                  <input type="text" name="position" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="심사역 / 파트너" />
                </div>
                <div>
                  <label class="block text-sm text-gray-400 mb-2">투자자 유형 <span class="text-red-400">*</span></label>
                  <select name="investorType" required 
                    class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors">
                    <option value="">선택하세요</option>
                    <option value="VC">벤처캐피탈 (VC)</option>
                    <option value="CVC">기업형벤처캐피탈 (CVC)</option>
                    <option value="AC">액셀러레이터 (AC)</option>
                    <option value="Angel">엔젤투자자</option>
                    <option value="PE">사모펀드 (PE)</option>
                    <option value="Family">패밀리오피스</option>
                    <option value="Strategic">전략적 투자자</option>
                    <option value="Other">기타</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label class="block text-sm text-gray-400 mb-2">관심 투자 분야</label>
                <input type="text" name="interests" 
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="예: AI/SaaS, 바이오, 핀테크" />
              </div>
              
              <div>
                <label class="block text-sm text-gray-400 mb-2">추천인 (선택)</label>
                <input type="text" name="referrer" 
                  class="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="추천해주신 분의 성함 또는 이메일" />
                <p class="text-xs text-gray-600 mt-1">추천인이 있으면 양측 모두 추가 열람권 2건이 제공됩니다.</p>
              </div>
              
              {/* Agreements */}
              <div class="space-y-3">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="agreeTerms" required class="mt-1 w-5 h-5 flex-shrink-0" />
                  <span class="text-sm text-gray-400">
                    <a href="/terms" class="text-blue-400 underline">이용약관</a> 및 
                    <a href="/privacy" class="text-blue-400 underline">개인정보처리방침</a>에 동의합니다. <span class="text-red-400">*</span>
                  </span>
                </label>
                
                <label class="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="agreeNDA" required class="mt-1 w-5 h-5 flex-shrink-0" />
                  <span class="text-sm text-gray-400">
                    딜 정보 열람 시 <strong class="text-white">NDA(비밀유지계약)</strong> 체결에 동의합니다. <span class="text-red-400">*</span>
                  </span>
                </label>
                
                <label class="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" name="agreeIdentity" required class="mt-1 w-5 h-5 flex-shrink-0" />
                  <span class="text-sm text-gray-400">
                    <strong class="text-white">본인인증</strong> 절차 진행에 동의합니다. <span class="text-red-400">*</span>
                  </span>
                </label>
              </div>
              
              {/* Submit */}
              <button type="submit" 
                class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                <i data-lucide="send" class="w-5 h-5"></i>
                가입 신청
              </button>
            </form>
          </div>

          {/* Already Member */}
          <div class="text-center">
            <p class="text-gray-500 mb-2">이미 계정이 있으신가요?</p>
            <a href="/investor/login" class="text-blue-400 hover:text-blue-300 font-medium">
              로그인하기 →
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>,
    { title: '투자자 회원가입 | 벤쳐스퀘어 라운드테이블' }
  )
})

// ============================================================
// 투자자 로그인
// ============================================================
app.get('/investor/login', (c) => {
  return c.render(
    <div class="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main class="flex-1 py-8 flex items-center justify-center">
        <div class="w-full max-w-md px-4">
          {/* Login Card */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            {/* Header */}
            <div class="text-center mb-8">
              <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i data-lucide="briefcase" class="w-8 h-8 text-white"></i>
              </div>
              <h1 class="text-2xl font-bold text-white mb-2">투자자 로그인</h1>
              <p class="text-gray-400 text-sm">운영진이 발급한 계정으로 로그인하세요</p>
            </div>
            
            {/* Login Form */}
            <form id="investor-login-form" class="space-y-4">
              <div>
                <label class="block text-sm text-gray-400 mb-2">아이디</label>
                <div class="relative">
                  <i data-lucide="user" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"></i>
                  <input type="text" name="userId" required 
                    class="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="발급받은 아이디" />
                </div>
              </div>
              
              <div>
                <label class="block text-sm text-gray-400 mb-2">비밀번호</label>
                <div class="relative">
                  <i data-lucide="lock" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"></i>
                  <input type="password" name="password" required 
                    class="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="비밀번호" />
                </div>
              </div>
              
              <div class="flex items-center justify-between text-sm">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="remember" class="w-4 h-4" />
                  <span class="text-gray-400">로그인 유지</span>
                </label>
                <a href="#" class="text-blue-400 hover:text-blue-300">비밀번호 찾기</a>
              </div>
              
              <button type="submit" 
                class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                <i data-lucide="log-in" class="w-5 h-5"></i>
                로그인
              </button>
            </form>
            
            {/* Divider */}
            <div class="flex items-center gap-4 my-6">
              <div class="flex-1 h-px bg-white/10"></div>
              <span class="text-gray-500 text-sm">또는</span>
              <div class="flex-1 h-px bg-white/10"></div>
            </div>
            
            {/* Register Link */}
            <div class="text-center">
              <p class="text-gray-500 text-sm mb-2">아직 계정이 없으신가요?</p>
              <a href="/investor/register" 
                class="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium">
                <i data-lucide="user-plus" class="w-4 h-4"></i>
                회원가입 신청
              </a>
            </div>
          </div>
          
          {/* Help */}
          <div class="mt-6 text-center">
            <p class="text-gray-600 text-sm">
              로그인에 문제가 있으신가요?<br/>
              <a href="mailto:roundtable@venturesquare.net" class="text-blue-400 hover:text-blue-300">
                roundtable@venturesquare.net
              </a>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>,
    { title: '투자자 로그인 | 벤쳐스퀘어 라운드테이블' }
  )
})

// ============================================================
// 중개인 회원 안내
// ============================================================
app.get('/broker/info', (c) => {
  return c.render(
    <div class="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      
      <main class="flex-1 py-8">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div class="mb-8 text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <i data-lucide="handshake" class="w-8 h-8 text-white"></i>
            </div>
            <h1 class="text-2xl lg:text-3xl font-bold text-white mb-2">중개인 회원 안내</h1>
            <p class="text-gray-400">VentureSquare Round Table 중개인 회원 프로세스</p>
          </div>

          {/* Role Description */}
          <div class="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-6 mb-8">
            <h3 class="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
              <i data-lucide="info" class="w-5 h-5"></i>
              중개인의 역할
            </h3>
            <p class="text-purple-200/80 text-sm leading-relaxed mb-4">
              중개인 회원은 <strong class="text-white">기업 회원</strong> 또는 <strong class="text-white">투자자 회원</strong>으로부터 
              위임을 받아 투자 중개 활동을 수행합니다. 다수의 기업 및 투자자와 계약할 수 있으며, 
              각 건별로 별도의 NDA를 체결해야 합니다.
            </p>
            <ul class="text-purple-200/80 text-sm space-y-2">
              <li class="flex items-start gap-2">
                <i data-lucide="check-circle" class="w-4 h-4 text-purple-400 mt-0.5"></i>
                기업을 대신하여 투자자에게 딜 소개
              </li>
              <li class="flex items-start gap-2">
                <i data-lucide="check-circle" class="w-4 h-4 text-purple-400 mt-0.5"></i>
                투자자를 대신하여 딜 검토 및 연락
              </li>
              <li class="flex items-start gap-2">
                <i data-lucide="check-circle" class="w-4 h-4 text-purple-400 mt-0.5"></i>
                투자 성사 시 중개 수수료 수취
              </li>
            </ul>
          </div>

          {/* Process */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8">
            <h2 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <i data-lucide="list-checks" class="w-5 h-5 text-green-400"></i>
              중개인 등록 프로세스
            </h2>
            
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">1</div>
                  <div class="w-0.5 h-full bg-white/10 mt-2"></div>
                </div>
                <div class="flex-1 pb-6">
                  <h3 class="text-white font-semibold mb-1">추천 및 지정</h3>
                  <p class="text-gray-400 text-sm">운영진, 투자자 회원, 또는 기업 회원의 추천이 필요합니다.</p>
                </div>
              </div>
              
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold">2</div>
                  <div class="w-0.5 h-full bg-white/10 mt-2"></div>
                </div>
                <div class="flex-1 pb-6">
                  <h3 class="text-white font-semibold mb-1">위임 계약 체결</h3>
                  <p class="text-gray-400 text-sm">기업 또는 투자자와 전자서명 기반 위임 계약을 체결합니다.</p>
                </div>
              </div>
              
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">3</div>
                  <div class="w-0.5 h-full bg-white/10 mt-2"></div>
                </div>
                <div class="flex-1 pb-6">
                  <h3 class="text-white font-semibold mb-1">운영진 승인</h3>
                  <p class="text-gray-400 text-sm">위임 계약서를 첨부하여 운영진 승인을 받습니다.</p>
                </div>
              </div>
              
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">4</div>
                  <div class="w-0.5 h-full bg-white/10 mt-2"></div>
                </div>
                <div class="flex-1 pb-6">
                  <h3 class="text-white font-semibold mb-1">본인인증</h3>
                  <p class="text-gray-400 text-sm">휴대폰 본인인증을 완료합니다.</p>
                </div>
              </div>
              
              <div class="flex gap-4">
                <div class="flex flex-col items-center">
                  <div class="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">5</div>
                </div>
                <div class="flex-1">
                  <h3 class="text-white font-semibold mb-1">활동 시작</h3>
                  <p class="text-gray-400 text-sm">계정 발급 후 중개 활동을 시작합니다.</p>
                </div>
              </div>
            </div>
          </div>

          {/* NDA Notice */}
          <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-6 mb-8">
            <h3 class="text-lg font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <i data-lucide="alert-triangle" class="w-5 h-5"></i>
              NDA 체결 안내
            </h3>
            <div class="text-yellow-200/80 text-sm space-y-3">
              <p>
                중개인은 다수의 기업/투자자와 계약할 수 있지만, <strong class="text-white">각 건별로 별도의 NDA</strong>를 체결해야 합니다.
              </p>
              <ul class="space-y-1 pl-4">
                <li class="flex items-start gap-2">
                  <span class="text-yellow-400">•</span>
                  기업 A와 체결한 NDA는 기업 B의 정보에 적용되지 않습니다.
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-yellow-400">•</span>
                  투자자 X와 체결한 NDA는 투자자 Y의 활동에 적용되지 않습니다.
                </li>
                <li class="flex items-start gap-2">
                  <span class="text-yellow-400">•</span>
                  모든 NDA는 개별적으로 관리되며, 위반 시 해당 건에 대한 책임을 집니다.
                </li>
              </ul>
            </div>
          </div>

          {/* Contact */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 text-center">
            <h3 class="text-white font-semibold mb-2">중개인 등록 문의</h3>
            <p class="text-gray-400 text-sm mb-4">
              중개인 등록을 원하시면 운영진에게 연락해 주세요.
            </p>
            <a href="mailto:roundtable@venturesquare.net" 
              class="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors">
              <i data-lucide="mail" class="w-5 h-5"></i>
              문의하기
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>,
    { title: '중개인 회원 안내 | 벤쳐스퀘어 라운드테이블' }
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

// ============================================================
// 운영진 로그인
// ============================================================
app.get('/admin/login', (c) => {
  return c.render(
    <div class="min-h-screen flex flex-col bg-[#0a0a0a]">
      <main class="flex-1 flex items-center justify-center p-4">
        <div class="w-full max-w-md">
          {/* Login Card */}
          <div class="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-8">
            {/* Header */}
            <div class="text-center mb-8">
              <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <i data-lucide="shield" class="w-8 h-8 text-white"></i>
              </div>
              <h1 class="text-2xl font-bold text-white mb-2">운영진 로그인</h1>
              <p class="text-gray-400 text-sm">VentureSquare Round Table 관리자</p>
            </div>
            
            {/* Login Form */}
            <form id="admin-login-form" class="space-y-4">
              <div>
                <label class="block text-sm text-gray-400 mb-2">관리자 아이디</label>
                <div class="relative">
                  <i data-lucide="user" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"></i>
                  <input type="text" name="adminId" required 
                    class="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="admin" />
                </div>
              </div>
              
              <div>
                <label class="block text-sm text-gray-400 mb-2">비밀번호</label>
                <div class="relative">
                  <i data-lucide="lock" class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"></i>
                  <input type="password" name="password" required 
                    class="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                    placeholder="••••••••" />
                </div>
              </div>
              
              <button type="submit" 
                class="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
                <i data-lucide="log-in" class="w-5 h-5"></i>
                로그인
              </button>
            </form>
            
            {/* Security Notice */}
            <div class="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <div class="flex items-start gap-3">
                <i data-lucide="alert-triangle" class="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"></i>
                <div class="text-xs text-yellow-200/80">
                  <p class="font-semibold text-yellow-400 mb-1">보안 주의</p>
                  <p>이 페이지는 운영진 전용입니다. 무단 접근 시도는 기록됩니다.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Back Link */}
          <div class="mt-6 text-center">
            <a href="/" class="text-gray-500 hover:text-white text-sm transition-colors">
              ← 메인 페이지로 돌아가기
            </a>
          </div>
        </div>
      </main>
    </div>,
    { title: '운영진 로그인 | 벤쳐스퀘어 라운드테이블' }
  )
})

// ============================================================
// 운영진 대시보드
// ============================================================
app.get('/admin', (c) => {
  return c.render(
    <div class="min-h-screen bg-[#0a0a0a]">
      {/* Admin Header */}
      <header class="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-b border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <i data-lucide="shield" class="w-5 h-5 text-white"></i>
              </div>
              <div>
                <div class="font-bold text-white">VS Round Table</div>
                <div class="text-xs text-red-400">Admin Dashboard</div>
              </div>
            </div>
            <div class="flex items-center gap-4">
              <span class="text-gray-400 text-sm hidden sm:block">관리자</span>
              <a href="/" class="text-gray-400 hover:text-white text-sm flex items-center gap-1">
                <i data-lucide="external-link" class="w-4 h-4"></i>
                사이트 보기
              </a>
              <a href="/admin/login" class="text-red-400 hover:text-red-300 text-sm flex items-center gap-1">
                <i data-lucide="log-out" class="w-4 h-4"></i>
                로그아웃
              </a>
            </div>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div class="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <i data-lucide="briefcase" class="w-5 h-5 text-blue-400"></i>
              </div>
              <span class="text-gray-400 text-sm">투자자 회원</span>
            </div>
            <div class="text-3xl font-bold text-white" id="stat-investors">-</div>
            <div class="text-xs text-green-400 mt-1">승인 대기: <span id="stat-investors-pending">0</span>건</div>
          </div>
          
          <div class="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <i data-lucide="handshake" class="w-5 h-5 text-purple-400"></i>
              </div>
              <span class="text-gray-400 text-sm">중개인</span>
            </div>
            <div class="text-3xl font-bold text-white" id="stat-brokers">-</div>
            <div class="text-xs text-yellow-400 mt-1">승인 대기: <span id="stat-brokers-pending">0</span>건</div>
          </div>
          
          <div class="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <i data-lucide="building-2" class="w-5 h-5 text-green-400"></i>
              </div>
              <span class="text-gray-400 text-sm">등록 딜</span>
            </div>
            <div class="text-3xl font-bold text-white" id="stat-deals">-</div>
            <div class="text-xs text-blue-400 mt-1">Active: <span id="stat-deals-active">0</span>건</div>
          </div>
          
          <div class="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <i data-lucide="file-signature" class="w-5 h-5 text-orange-400"></i>
              </div>
              <span class="text-gray-400 text-sm">NDA 요청</span>
            </div>
            <div class="text-3xl font-bold text-white" id="stat-nda">-</div>
            <div class="text-xs text-orange-400 mt-1">이번 달: <span id="stat-nda-month">0</span>건</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div class="bg-white/5 rounded-2xl border border-white/10 p-6 mb-8">
          <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <i data-lucide="zap" class="w-5 h-5 text-yellow-400"></i>
            빠른 작업
          </h2>
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/admin/investors" class="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
              <i data-lucide="user-plus" class="w-6 h-6 text-blue-400"></i>
              <span class="text-sm text-gray-300">투자자 승인</span>
            </a>
            <a href="/admin/brokers" class="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
              <i data-lucide="user-check" class="w-6 h-6 text-purple-400"></i>
              <span class="text-sm text-gray-300">중개인 승인</span>
            </a>
            <a href="/admin/deals" class="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
              <i data-lucide="folder-plus" class="w-6 h-6 text-green-400"></i>
              <span class="text-sm text-gray-300">딜 관리</span>
            </a>
            <a href="/admin/credits" class="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors">
              <i data-lucide="ticket" class="w-6 h-6 text-orange-400"></i>
              <span class="text-sm text-gray-300">열람권 관리</span>
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Approvals */}
          <div class="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i data-lucide="clock" class="w-5 h-5 text-yellow-400"></i>
              승인 대기
            </h2>
            <div id="pending-list" class="space-y-3">
              {/* Sample pending items */}
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <i data-lucide="user" class="w-4 h-4 text-blue-400"></i>
                  </div>
                  <div>
                    <div class="text-white text-sm font-medium">투자자 가입 신청</div>
                    <div class="text-gray-500 text-xs">홍길동 · OO벤처캐피탈</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button class="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors">
                    <i data-lucide="check" class="w-4 h-4 text-green-400"></i>
                  </button>
                  <button class="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">
                    <i data-lucide="x" class="w-4 h-4 text-red-400"></i>
                  </button>
                </div>
              </div>
              
              <div class="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <i data-lucide="handshake" class="w-4 h-4 text-purple-400"></i>
                  </div>
                  <div>
                    <div class="text-white text-sm font-medium">중개인 등록 신청</div>
                    <div class="text-gray-500 text-xs">김중개 · 위임계약서 첨부</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <button class="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg transition-colors">
                    <i data-lucide="check" class="w-4 h-4 text-green-400"></i>
                  </button>
                  <button class="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-colors">
                    <i data-lucide="x" class="w-4 h-4 text-red-400"></i>
                  </button>
                </div>
              </div>
              
              <div class="text-center py-4 text-gray-500 text-sm">
                승인 대기 중인 항목이 없습니다.
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div class="bg-white/5 rounded-2xl border border-white/10 p-6">
            <h2 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <i data-lucide="activity" class="w-5 h-5 text-green-400"></i>
              최근 활동
            </h2>
            <div id="activity-list" class="space-y-3">
              <div class="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <div class="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i data-lucide="file-signature" class="w-4 h-4 text-green-400"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-white text-sm">NDA 서명 완료</div>
                  <div class="text-gray-500 text-xs">박투자 → DEAL_20241128_001</div>
                  <div class="text-gray-600 text-xs mt-1">10분 전</div>
                </div>
              </div>
              
              <div class="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <div class="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i data-lucide="user-plus" class="w-4 h-4 text-blue-400"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-white text-sm">투자자 가입 승인</div>
                  <div class="text-gray-500 text-xs">이투자 · ABC캐피탈</div>
                  <div class="text-gray-600 text-xs mt-1">30분 전</div>
                </div>
              </div>
              
              <div class="flex items-start gap-3 p-3 bg-white/5 rounded-xl">
                <div class="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i data-lucide="calendar-check" class="w-4 h-4 text-purple-400"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-white text-sm">라운드테이블 참가 신청</div>
                  <div class="text-gray-500 text-xs">최투자 → RT_202412_001</div>
                  <div class="text-gray-600 text-xs mt-1">1시간 전</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Management Sections */}
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Investor Management */}
          <div class="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <i data-lucide="users" class="w-5 h-5 text-blue-400"></i>
                투자자 관리
              </h2>
              <a href="/admin/investors" class="text-blue-400 hover:text-blue-300 text-sm">전체보기 →</a>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span class="text-gray-400 text-sm">전체 회원</span>
                <span class="text-white font-semibold" id="inv-total">-</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span class="text-gray-400 text-sm">활성 회원</span>
                <span class="text-green-400 font-semibold" id="inv-active">-</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span class="text-gray-400 text-sm">승인 대기</span>
                <span class="text-yellow-400 font-semibold" id="inv-pending">-</span>
              </div>
            </div>
            <button onclick="window.location.href='/admin/investors/new'" 
              class="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <i data-lucide="user-plus" class="w-4 h-4"></i>
              계정 발급
            </button>
          </div>

          {/* Deal Management */}
          <div class="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <i data-lucide="folder" class="w-5 h-5 text-green-400"></i>
                딜 관리
              </h2>
              <a href="/admin/deals" class="text-green-400 hover:text-green-300 text-sm">전체보기 →</a>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span class="text-gray-400 text-sm">전체 딜</span>
                <span class="text-white font-semibold" id="deal-total">-</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span class="text-gray-400 text-sm">Active</span>
                <span class="text-green-400 font-semibold" id="deal-active">-</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span class="text-gray-400 text-sm">검토중</span>
                <span class="text-yellow-400 font-semibold" id="deal-review">-</span>
              </div>
            </div>
            <button onclick="window.location.href='/admin/deals/new'" 
              class="w-full mt-4 bg-green-600 hover:bg-green-700 text-white py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              딜 등록
            </button>
          </div>

          {/* Credit Management */}
          <div class="bg-white/5 rounded-2xl border border-white/10 p-6">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <i data-lucide="ticket" class="w-5 h-5 text-orange-400"></i>
                열람권 관리
              </h2>
              <a href="/admin/credits" class="text-orange-400 hover:text-orange-300 text-sm">전체보기 →</a>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span class="text-gray-400 text-sm">이번달 사용</span>
                <span class="text-white font-semibold" id="credit-used">-</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span class="text-gray-400 text-sm">추가 요청</span>
                <span class="text-yellow-400 font-semibold" id="credit-request">-</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                <span class="text-gray-400 text-sm">추천 보너스</span>
                <span class="text-purple-400 font-semibold" id="credit-bonus">-</span>
              </div>
            </div>
            <button onclick="window.location.href='/admin/credits/add'" 
              class="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
              <i data-lucide="plus" class="w-4 h-4"></i>
              추가 열람권 부여
            </button>
          </div>
        </div>
      </div>
    </div>,
    { title: '운영진 대시보드 | 벤쳐스퀘어 라운드테이블' }
  )
})

export default app
