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
    { title: 'VS AI ERP - 팩트시트 데이터룸' }
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
    { title: `딜 상세 - ${dealId}` }
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
    { title: 'VS AI ERP - 라운드테이블' }
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
    { title: 'VS AI ERP - 마이페이지' }
  )
})

export default app
