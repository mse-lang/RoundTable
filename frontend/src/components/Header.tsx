export const Header = () => {
  return (
    <header class="sticky top-0 z-40 bg-glass border-b border-white/10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" class="flex items-center gap-3 group">
            <img 
              src="/static/vs-logo.png" 
              alt="VentureSquare" 
              class="w-10 h-10 rounded-lg group-hover:scale-105 transition-transform"
            />
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
            <a href="/login" class="hidden sm:inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10">
              <i data-lucide="log-in" class="w-4 h-4"></i>
              로그인
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
            <a href="/login" class="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 text-white mt-2">
              <i data-lucide="log-in" class="w-5 h-5"></i>
              로그인
            </a>
            <a href="/signup" class="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-gray-300 hover:text-white transition-all">
              <i data-lucide="user-plus" class="w-5 h-5"></i>
              회원가입
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
