interface DealCardProps {
  dealId: string
  industry: string
  dealType: string
  summary: string
  revenueRange: string
  targetValuation: string
}

export const DealCard = (props: DealCardProps) => {
  const { dealId, industry, dealType, summary, revenueRange, targetValuation } = props
  
  // Industry icon mapping
  const industryIcons: Record<string, string> = {
    'IT/소프트웨어': 'fa-laptop-code',
    '바이오/헬스케어': 'fa-heartbeat',
    '핀테크': 'fa-coins',
    '이커머스': 'fa-shopping-cart',
    '에듀테크': 'fa-graduation-cap',
    '물류/유통': 'fa-truck',
    '콘텐츠/미디어': 'fa-film',
    '제조/하드웨어': 'fa-industry',
    '부동산/프롭테크': 'fa-building'
  }
  
  const icon = industryIcons[industry] || 'fa-briefcase'
  
  // Deal type color
  const typeColors: Record<string, string> = {
    '투자유치': 'bg-green-100 text-green-700',
    '매각': 'bg-purple-100 text-purple-700',
    'M&A': 'bg-orange-100 text-orange-700'
  }
  
  const typeColor = typeColors[dealType] || 'bg-gray-100 text-gray-700'
  
  return (
    <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
      {/* Card Header */}
      <div class="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
        <div class="flex items-center justify-between mb-4">
          <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <i class={`fas ${icon} text-2xl`}></i>
          </div>
          <span class={`px-3 py-1 rounded-full text-xs font-medium ${typeColor}`}>
            {dealType}
          </span>
        </div>
        <div class="text-sm opacity-80 mb-1">{industry}</div>
        <div class="text-xs opacity-60">{dealId}</div>
      </div>
      
      {/* Card Body */}
      <div class="p-6">
        <p class="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[60px]">
          {summary}
        </p>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div class="text-xs text-gray-500 mb-1">매출 규모</div>
            <div class="font-semibold text-gray-900">{revenueRange || '-'}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500 mb-1">희망 밸류</div>
            <div class="font-semibold text-primary">{targetValuation || '-'}</div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <a href={`/deal/${dealId}`} 
            class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-center text-sm font-medium hover:bg-gray-200 transition">
            <i class="fas fa-eye mr-1"></i>티저 보기
          </a>
          <button 
            onclick={`openNDAModal('${dealId}')`}
            class="flex-1 bg-primary text-white py-2 rounded-lg text-center text-sm font-medium hover:bg-blue-600 transition">
            <i class="fas fa-file-signature mr-1"></i>상세 열람
          </button>
        </div>
      </div>
    </div>
  )
}

// HTML string version for dynamic rendering
export const dealCardHTML = (deal: any) => `
  <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden group">
    <div class="bg-gradient-to-r from-primary to-blue-600 p-6 text-white">
      <div class="flex items-center justify-between mb-4">
        <div class="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
          <i class="fas fa-briefcase text-2xl"></i>
        </div>
        <span class="px-3 py-1 rounded-full text-xs font-medium bg-white/20">
          ${deal.Deal_Type || '투자유치'}
        </span>
      </div>
      <div class="text-sm opacity-80 mb-1">${deal.Industry || '기타'}</div>
      <div class="text-xs opacity-60">${deal.DEAL_ID}</div>
    </div>
    
    <div class="p-6">
      <p class="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[60px]">
        ${deal.Summary || '상세 정보는 NDA 서명 후 열람 가능합니다.'}
      </p>
      
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div class="text-xs text-gray-500 mb-1">매출 규모</div>
          <div class="font-semibold text-gray-900">${deal.Revenue_Range || '-'}</div>
        </div>
        <div>
          <div class="text-xs text-gray-500 mb-1">희망 밸류</div>
          <div class="font-semibold text-primary">${deal.Target_Valuation || '-'}</div>
        </div>
      </div>
      
      <div class="flex gap-2">
        <a href="/deal/${deal.DEAL_ID}" 
          class="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-center text-sm font-medium hover:bg-gray-200 transition">
          <i class="fas fa-eye mr-1"></i>티저 보기
        </a>
        <button 
          onclick="openNDAModal('${deal.DEAL_ID}')"
          class="flex-1 bg-primary text-white py-2 rounded-lg text-center text-sm font-medium hover:bg-blue-600 transition">
          <i class="fas fa-file-signature mr-1"></i>상세 열람
        </button>
      </div>
    </div>
  </div>
`
