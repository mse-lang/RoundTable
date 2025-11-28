import { Hono } from 'hono'
import { renderer } from './renderer'
import { cors } from 'hono/cors'

// Components
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { DealCard } from './components/DealCard'
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
    <div class="min-h-screen flex flex-col">
      <Header />
      
      <main class="flex-1">
        {/* Hero Section */}
        <section class="bg-gradient-to-r from-primary to-blue-700 text-white py-16">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
              투자 기회를 발견하세요
            </h1>
            <p class="text-xl text-blue-100 mb-8 max-w-2xl">
              AI가 분석한 검증된 스타트업 딜을 안전하게 열람하고, 
              라운드테이블에서 직접 만나보세요.
            </p>
            <div class="flex gap-4">
              <a href="#deals" class="bg-white text-primary px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                <i class="fas fa-search mr-2"></i>딜 둘러보기
              </a>
              <a href="/round-table" class="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition">
                <i class="fas fa-calendar mr-2"></i>라운드테이블
              </a>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section class="bg-white py-8 border-b">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div class="text-3xl font-bold text-primary" id="stat-deals">-</div>
                <div class="text-gray-500">Active Deals</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-primary" id="stat-investors">500+</div>
                <div class="text-gray-500">투자자</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-primary" id="stat-meetings">120+</div>
                <div class="text-gray-500">성사된 미팅</div>
              </div>
              <div>
                <div class="text-3xl font-bold text-primary" id="stat-amount">500억+</div>
                <div class="text-gray-500">누적 투자 규모</div>
              </div>
            </div>
          </div>
        </section>

        {/* Deal List Section */}
        <section id="deals" class="py-12">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div class="flex flex-wrap gap-4 mb-8 items-center justify-between" x-data="{ showFilters: false }">
              <h2 class="text-2xl font-bold">
                <i class="fas fa-fire text-accent mr-2"></i>
                Active Deals
              </h2>
              
              <div class="flex gap-4 items-center">
                <select id="filter-industry" class="border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="">전체 업종</option>
                </select>
                <select id="filter-deal-type" class="border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="">전체 유형</option>
                  <option value="투자유치">투자유치</option>
                  <option value="매각">매각</option>
                  <option value="M&A">M&A</option>
                </select>
                <select id="filter-revenue" class="border rounded-lg px-4 py-2 bg-white focus:ring-2 focus:ring-primary focus:outline-none">
                  <option value="">전체 매출</option>
                </select>
              </div>
            </div>

            {/* Deal Grid */}
            <div id="deal-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Deals loaded via JavaScript */}
              <div class="col-span-full text-center py-12">
                <i class="fas fa-spinner fa-spin text-4xl text-gray-300"></i>
                <p class="text-gray-500 mt-4">딜 정보를 불러오는 중...</p>
              </div>
            </div>

            {/* Pagination */}
            <div id="pagination" class="flex justify-center mt-8 gap-2">
              {/* Pagination loaded via JavaScript */}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section class="bg-gray-900 text-white py-16">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 class="text-3xl font-bold mb-4">딜 등록을 원하시나요?</h2>
            <p class="text-gray-400 mb-8 max-w-xl mx-auto">
              AI가 분석한 투자심사보고서로 투자자에게 어필하세요.
              NDA 기반의 안전한 정보 공개를 보장합니다.
            </p>
            <a href="/register" class="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition inline-flex items-center">
              <i class="fas fa-plus mr-2"></i>딜 등록 신청
            </a>
          </div>
        </section>
      </main>

      <Footer />
      
      {/* NDA Modal */}
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
    <div class="min-h-screen flex flex-col">
      <Header />
      
      <main class="flex-1 py-8">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav class="mb-6">
            <ol class="flex items-center space-x-2 text-sm text-gray-500">
              <li><a href="/" class="hover:text-primary">딜룸</a></li>
              <li><i class="fas fa-chevron-right text-xs"></i></li>
              <li class="text-gray-900 font-medium" id="deal-id">{dealId}</li>
            </ol>
          </nav>

          {/* Deal Detail Container */}
          <div id="deal-detail" data-deal-id={dealId}>
            <div class="text-center py-12">
              <i class="fas fa-spinner fa-spin text-4xl text-gray-300"></i>
              <p class="text-gray-500 mt-4">딜 정보를 불러오는 중...</p>
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
    <div class="min-h-screen flex flex-col">
      <Header />
      
      <main class="flex-1 py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center mb-8">
            <div>
              <h1 class="text-3xl font-bold">
                <i class="fas fa-users text-primary mr-3"></i>
                라운드테이블
              </h1>
              <p class="text-gray-500 mt-2">투자자와 창업자가 만나는 오프라인 미팅</p>
            </div>
            <div class="flex gap-2">
              <button id="prev-month" class="p-2 rounded-lg hover:bg-gray-100">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span id="current-month" class="px-4 py-2 font-semibold">2024년 12월</span>
              <button id="next-month" class="p-2 rounded-lg hover:bg-gray-100">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div class="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Calendar Header */}
            <div class="grid grid-cols-7 bg-gray-50 border-b">
              {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                <div class={`py-3 text-center font-medium ${i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-700'}`}>
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Body */}
            <div id="calendar-grid" class="grid grid-cols-7">
              {/* Calendar cells loaded via JavaScript */}
              <div class="col-span-7 text-center py-12">
                <i class="fas fa-spinner fa-spin text-4xl text-gray-300"></i>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div class="mt-8">
            <h2 class="text-xl font-bold mb-4">
              <i class="fas fa-calendar-check text-green-500 mr-2"></i>
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
      <div id="rt-apply-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-2xl max-w-md w-full p-6">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-xl font-bold">라운드테이블 참가 신청</h3>
            <button onclick="closeRTModal()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <form id="rt-apply-form" class="space-y-4">
            <input type="hidden" id="rt-id" name="rtId" />
            
            <div id="rt-info" class="bg-blue-50 rounded-lg p-4 mb-4">
              {/* RT info loaded dynamically */}
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">이름</label>
              <input type="text" name="name" required 
                class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input type="email" name="email" required 
                class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">참가 목적</label>
              <select name="purpose" required 
                class="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none">
                <option value="Sourcing">딜소싱 (투자자)</option>
                <option value="IR">IR (창업자)</option>
                <option value="Networking">네트워킹</option>
              </select>
            </div>
            
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="feeAgreed" required class="mt-1" />
                <span class="text-sm">
                  <strong class="text-yellow-800">수수료 확약 동의</strong><br />
                  <span class="text-yellow-700">
                    본 라운드테이블을 통해 투자가 성사될 경우, 
                    투자금의 <strong>3%</strong>를 수수료로 지급할 것을 확약합니다.
                  </span>
                </span>
              </label>
            </div>
            
            <button type="submit" 
              class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition">
              <i class="fas fa-check mr-2"></i>참가 신청
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
    <div class="min-h-screen flex flex-col">
      <Header />
      
      <main class="flex-1 py-8">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold mb-8">
            <i class="fas fa-user-circle text-primary mr-3"></i>
            마이페이지
          </h1>

          {/* Email Input */}
          <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일로 조회</label>
            <div class="flex gap-4">
              <input type="email" id="user-email" placeholder="investor@example.com"
                class="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none" />
              <button onclick="loadUserStatus()" class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition">
                <i class="fas fa-search mr-2"></i>조회
              </button>
            </div>
          </div>

          {/* My Deals */}
          <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 class="text-xl font-bold mb-4">
              <i class="fas fa-folder-open text-yellow-500 mr-2"></i>
              나의 NDA 현황
            </h2>
            <div id="my-nda-list">
              <p class="text-gray-500 text-center py-8">이메일을 입력하고 조회해주세요.</p>
            </div>
          </div>

          {/* My Round Tables */}
          <div class="bg-white rounded-xl shadow-lg p-6">
            <h2 class="text-xl font-bold mb-4">
              <i class="fas fa-handshake text-green-500 mr-2"></i>
              나의 라운드테이블
            </h2>
            <div id="my-rt-list">
              <p class="text-gray-500 text-center py-8">이메일을 입력하고 조회해주세요.</p>
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
