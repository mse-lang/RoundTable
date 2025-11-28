export const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer class="bg-gray-900 text-gray-400">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div class="col-span-1 md:col-span-2">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i class="fas fa-chart-line text-white text-lg"></i>
              </div>
              <div>
                <div class="font-bold text-lg text-white">VS AI ERP</div>
                <div class="text-xs">팩트시트 데이터룸</div>
              </div>
            </div>
            <p class="text-sm max-w-md">
              AI 기반 투자 분석과 NDA 보호 시스템으로 안전한 딜소싱 환경을 제공합니다.
              스타트업과 투자자를 연결하는 O2O 플랫폼입니다.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 class="text-white font-semibold mb-4">서비스</h4>
            <ul class="space-y-2 text-sm">
              <li><a href="/" class="hover:text-white transition">딜룸</a></li>
              <li><a href="/round-table" class="hover:text-white transition">라운드테이블</a></li>
              <li><a href="/register" class="hover:text-white transition">딜 등록</a></li>
              <li><a href="/my-page" class="hover:text-white transition">마이페이지</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 class="text-white font-semibold mb-4">문의</h4>
            <ul class="space-y-2 text-sm">
              <li>
                <i class="fas fa-envelope mr-2 w-4"></i>
                contact@venturesquare.net
              </li>
              <li>
                <i class="fas fa-phone mr-2 w-4"></i>
                02-1234-5678
              </li>
              <li>
                <i class="fas fa-map-marker-alt mr-2 w-4"></i>
                서울시 강남구 테헤란로
              </li>
            </ul>
            <div class="flex gap-4 mt-4">
              <a href="#" class="hover:text-white transition"><i class="fab fa-facebook text-lg"></i></a>
              <a href="#" class="hover:text-white transition"><i class="fab fa-linkedin text-lg"></i></a>
              <a href="#" class="hover:text-white transition"><i class="fab fa-instagram text-lg"></i></a>
            </div>
          </div>
        </div>

        <div class="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
          <p>© {currentYear} VentureSquare. All rights reserved.</p>
          <div class="flex gap-6 mt-4 md:mt-0">
            <a href="#" class="hover:text-white transition">이용약관</a>
            <a href="#" class="hover:text-white transition">개인정보처리방침</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
