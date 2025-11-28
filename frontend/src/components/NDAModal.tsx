export const NDAModal = () => {
  return (
    <div id="nda-modal" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="closeNDAModal()"></div>
      
      {/* Modal Content */}
      <div class="relative w-full max-w-md bg-gray-900 rounded-2xl border border-white/10 shadow-2xl modal-content">
        {/* Header */}
        <div class="p-6 border-b border-white/10">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <i data-lucide="file-signature" class="w-5 h-5 text-blue-400"></i>
              </div>
              <div>
                <h3 class="text-lg font-bold text-white">NDA 서명 요청</h3>
                <p class="text-sm text-gray-500">상세 정보 열람을 위해 서명이 필요합니다</p>
              </div>
            </div>
            <button 
              onclick="closeNDAModal()" 
              class="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <i data-lucide="x" class="w-5 h-5 text-gray-400"></i>
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div class="p-6">
          {/* Deal Info */}
          <div class="bg-white/5 rounded-xl p-4 mb-6 border border-white/10">
            <div class="text-sm text-gray-500 mb-1">열람 요청 딜</div>
            <div class="font-semibold text-white" id="nda-deal-id">-</div>
          </div>
          
          {/* Form */}
          <form id="nda-form" class="space-y-4">
            <input type="hidden" id="nda-deal-id-input" name="dealId" />
            
            {/* Name */}
            <div>
              <label class="block text-sm text-gray-400 mb-2">
                <i data-lucide="user" class="w-4 h-4 inline mr-1"></i>
                이름 (실명)
              </label>
              <input 
                type="text" 
                name="name" 
                required 
                placeholder="홍길동"
                class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            {/* Email */}
            <div>
              <label class="block text-sm text-gray-400 mb-2">
                <i data-lucide="mail" class="w-4 h-4 inline mr-1"></i>
                이메일
              </label>
              <input 
                type="email" 
                name="email" 
                required 
                placeholder="investor@example.com"
                class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            {/* Phone */}
            <div>
              <label class="block text-sm text-gray-400 mb-2">
                <i data-lucide="phone" class="w-4 h-4 inline mr-1"></i>
                전화번호 (본인인증용)
              </label>
              <input 
                type="tel" 
                name="phone" 
                required 
                placeholder="01012345678"
                pattern="[0-9]{10,11}"
                class="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <p class="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <i data-lucide="info" class="w-3 h-3"></i>
                휴대폰 본인인증을 통해 서명이 진행됩니다
              </p>
            </div>
            
            {/* NDA Agreement */}
            <div class="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" name="agreed" required class="mt-1 w-5 h-5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500" />
                <span class="text-sm text-yellow-200">
                  <strong class="text-yellow-400">NDA 동의</strong><br />
                  <span class="text-yellow-200/80">
                    본 자료는 투자 검토 목적으로만 사용하며, 제3자에게 공유하거나 
                    외부로 유출하지 않을 것을 서약합니다. 위반 시 법적 책임을 질 수 있습니다.
                  </span>
                </span>
              </label>
            </div>
            
            {/* Error Message */}
            <div id="nda-error" class="hidden bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              <div class="flex items-center gap-2 text-red-400 text-sm">
                <i data-lucide="alert-circle" class="w-4 h-4"></i>
                <span id="nda-error-message"></span>
              </div>
            </div>
            
            {/* Submit Button */}
            <button 
              type="submit" 
              id="nda-submit-btn"
              class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <i data-lucide="send" class="w-4 h-4"></i>
              서명 요청하기
            </button>
          </form>
          
          {/* Info */}
          <div class="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
            <i data-lucide="shield-check" class="w-3 h-3"></i>
            유캔사인 전자서명으로 안전하게 처리됩니다
          </div>
        </div>
      </div>
    </div>
  )
}
