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

export const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer class="bg-black/50 border-t border-white/10 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <VentureSquareLogo />
              <div>
                <div class="font-bold text-lg text-white tracking-wide">VENTURE SQUARE</div>
                <div class="text-xs text-blue-400 font-medium">Round Table</div>
              </div>
            </div>
            <p class="text-sm text-gray-400 max-w-md leading-relaxed">
              AI 기반 투자 분석과 NDA 보호 시스템으로 안전한 딜소싱 환경을 제공합니다.
              스타트업과 투자자를 연결하는 O2O 플랫폼입니다.
            </p>
            
            {/* Social Links */}
            <div class="flex gap-3 mt-6">
              <a href="#" class="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <i data-lucide="linkedin" class="w-5 h-5 text-gray-400 hover:text-white"></i>
              </a>
              <a href="#" class="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <i data-lucide="instagram" class="w-5 h-5 text-gray-400 hover:text-white"></i>
              </a>
              <a href="#" class="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                <i data-lucide="youtube" class="w-5 h-5 text-gray-400 hover:text-white"></i>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 class="text-white font-semibold mb-4">서비스</h4>
            <ul class="space-y-3 text-sm">
              <li>
                <a href="/" class="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <i data-lucide="layout-grid" class="w-4 h-4"></i>
                  딜룸
                </a>
              </li>
              <li>
                <a href="/round-table" class="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <i data-lucide="users" class="w-4 h-4"></i>
                  라운드테이블
                </a>
              </li>
              <li>
                <a href="/register" class="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <i data-lucide="plus-circle" class="w-4 h-4"></i>
                  딜 등록
                </a>
              </li>
              <li>
                <a href="/my-page" class="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
                  <i data-lucide="user" class="w-4 h-4"></i>
                  마이페이지
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 class="text-white font-semibold mb-4">문의</h4>
            <ul class="space-y-3 text-sm text-gray-400">
              <li class="flex items-center gap-2">
                <i data-lucide="mail" class="w-4 h-4"></i>
                contact@venturesquare.net
              </li>
              <li class="flex items-center gap-2">
                <i data-lucide="phone" class="w-4 h-4"></i>
                02-1234-5678
              </li>
              <li class="flex items-center gap-2">
                <i data-lucide="map-pin" class="w-4 h-4"></i>
                서울시 강남구 테헤란로
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div class="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {currentYear} VentureSquare. All rights reserved.</p>
          <div class="flex gap-6">
            <a href="#" class="hover:text-white transition-colors">이용약관</a>
            <a href="#" class="hover:text-white transition-colors">개인정보처리방침</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
