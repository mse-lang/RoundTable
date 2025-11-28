export const Header = () => {
  return (
    <header class="bg-white shadow-sm sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <i class="fas fa-chart-line text-white text-lg"></i>
            </div>
            <div>
              <div class="font-bold text-lg text-gray-900">VS AI ERP</div>
              <div class="text-xs text-gray-500">팩트시트 데이터룸</div>
            </div>
          </a>

          {/* Navigation */}
          <nav class="hidden md:flex items-center gap-8">
            <a href="/" class="text-gray-600 hover:text-primary font-medium transition">
              딜룸
            </a>
            <a href="/round-table" class="text-gray-600 hover:text-primary font-medium transition">
              라운드테이블
            </a>
            <a href="/my-page" class="text-gray-600 hover:text-primary font-medium transition">
              마이페이지
            </a>
          </nav>

          {/* Actions */}
          <div class="flex items-center gap-4">
            <a href="/register" class="hidden sm:inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition">
              <i class="fas fa-plus"></i>
              딜 등록
            </a>
            
            {/* Mobile Menu Button */}
            <button class="md:hidden p-2 rounded-lg hover:bg-gray-100" onclick="toggleMobileMenu()">
              <i class="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" class="hidden md:hidden pb-4">
          <nav class="flex flex-col gap-2">
            <a href="/" class="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <i class="fas fa-th-large mr-2 w-5"></i>딜룸
            </a>
            <a href="/round-table" class="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <i class="fas fa-users mr-2 w-5"></i>라운드테이블
            </a>
            <a href="/my-page" class="px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600">
              <i class="fas fa-user mr-2 w-5"></i>마이페이지
            </a>
            <a href="/register" class="px-4 py-2 rounded-lg bg-primary text-white text-center">
              <i class="fas fa-plus mr-2"></i>딜 등록
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
