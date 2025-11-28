export const NDAModal = () => {
  return (
    <div id="nda-modal" class="hidden fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div class="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="text-xl font-bold mb-1">
                <i class="fas fa-file-signature mr-2"></i>
                NDA 서명 요청
              </h3>
              <p class="text-blue-100 text-sm">상세 정보 열람을 위해 NDA 서명이 필요합니다</p>
            </div>
            <button onclick="closeNDAModal()" class="text-white/80 hover:text-white">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
        </div>
        
        {/* Modal Body */}
        <div class="p-6">
          {/* Deal Info */}
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <div class="text-sm text-gray-500 mb-1">열람 요청 딜</div>
            <div class="font-semibold text-gray-900" id="nda-deal-id">-</div>
          </div>
          
          {/* NDA Form */}
          <form id="nda-form" class="space-y-4">
            <input type="hidden" id="nda-deal-id-input" name="dealId" />
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-user mr-1 text-gray-400"></i>이름 (실명)
              </label>
              <input type="text" name="name" required 
                placeholder="홍길동"
                class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-envelope mr-1 text-gray-400"></i>이메일
              </label>
              <input type="email" name="email" required 
                placeholder="investor@example.com"
                class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition" />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-phone mr-1 text-gray-400"></i>전화번호 (본인인증용)
              </label>
              <input type="tel" name="phone" required 
                placeholder="01012345678"
                pattern="[0-9]{10,11}"
                class="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition" />
              <p class="text-xs text-gray-500 mt-1">
                <i class="fas fa-info-circle mr-1"></i>
                휴대폰 본인인증을 통해 서명이 진행됩니다
              </p>
            </div>
            
            {/* NDA Terms */}
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="agreed" required class="mt-1" />
                <span class="text-sm text-yellow-800">
                  <strong>NDA 동의</strong><br />
                  본 자료는 투자 검토 목적으로만 사용하며, 제3자에게 공유하거나 
                  외부로 유출하지 않을 것을 서약합니다. 위반 시 법적 책임을 질 수 있습니다.
                </span>
              </label>
            </div>
            
            {/* Error Message */}
            <div id="nda-error" class="hidden bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              <i class="fas fa-exclamation-circle mr-2"></i>
              <span id="nda-error-message"></span>
            </div>
            
            {/* Submit Button */}
            <button type="submit" id="nda-submit-btn"
              class="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2">
              <i class="fas fa-paper-plane"></i>
              서명 요청하기
            </button>
          </form>
          
          {/* Info */}
          <div class="mt-4 text-center text-xs text-gray-500">
            <i class="fas fa-shield-alt mr-1"></i>
            유캔사인 전자서명으로 안전하게 처리됩니다
          </div>
        </div>
      </div>
    </div>
  )
}
