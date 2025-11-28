// VentureSquare 로고 SVG 컴포넌트
const VentureSquareLogo = () => (
  <svg width="36" height="36" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* 검은색 라운드 사각형 배경 */}
    <rect width="40" height="40" rx="8" fill="#1a1a1a"/>
    {/* V 심볼 - 흰색 */}
    <path d="M10 12L20 28L24 20" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    {/* V 심볼 - 파란색 악센트 */}
    <path d="M24 20L30 12" stroke="#3B82F6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
)

export const Header = () => {
  return (
    <header class="sticky top-0 z-40 bg-glass border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" class="flex items-center gap-3 group">
            <div class="group-hover:scale-105 transition-transform">
              <VentureSquareLogo />
            </div>
            <div>
              <div class="font-bold text-lg text-white tracking-wide">VENTURE SQUARE</div>
              <div class="text-xs text-blue-400 font-medium">Round Table</div>
            </div>
          </a>

          {/* Navigation - Desktop */}
          <nav class="hidden md:flex items-center gap-1">
            <a href="/" class="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all">
              딜룸
            </a>
            <a href="/round-table" class="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all">
              라운드테이블
            </a>
            <a href="/my-page" class="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all">
              마이페이지
            </a>
          </nav>

          {/* Actions */}
          <div class="flex items-center gap-3">
            <a href="/register" class="hidden sm:inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-600/20">
              <i data-lucide="plus" class="w-4 h-4"></i>
              딜 등록
            </a>
            
            {/* Mobile Menu Button */}
            <button 
              class="md:hidden p-2 hover:bg-white/10 rounded-lg transition-colors"
              onclick="toggleMobileMenu()"
            >
              <i data-lucide="menu" class="w-6 h-6 text-gray-400"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" class="hidden md:hidden pb-4 border-t border-white/10 mt-2 pt-4">
          <nav class="flex flex-col gap-1">
            <a href="/" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all">
              <i data-lucide="layout-grid" class="w-5 h-5"></i>
              딜룸
            </a>
            <a href="/round-table" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all">
              <i data-lucide="users" class="w-5 h-5"></i>
              라운드테이블
            </a>
            <a href="/my-page" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all">
              <i data-lucide="user" class="w-5 h-5"></i>
              마이페이지
            </a>
            <a href="/register" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-600 text-white mt-2">
              <i data-lucide="plus" class="w-5 h-5"></i>
              딜 등록
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
