# VS AI ERP - 디자인 가이드

## 📋 목차
1. [디자인 철학](#1-디자인-철학)
2. [컬러 시스템](#2-컬러-시스템)
3. [타이포그래피](#3-타이포그래피)
4. [레이아웃 시스템](#4-레이아웃-시스템)
5. [컴포넌트 스타일 가이드](#5-컴포넌트-스타일-가이드)
6. [아이콘 사용 가이드](#6-아이콘-사용-가이드)
7. [애니메이션 가이드](#7-애니메이션-가이드)
8. [반응형 디자인](#8-반응형-디자인)
9. [다크 테마 시스템](#9-다크-테마-시스템)
10. [컴포넌트 템플릿](#10-컴포넌트-템플릿)

---

## 1. 디자인 철학

### 1.1 핵심 원칙

| 원칙 | 설명 |
|------|------|
| **Glassmorphism** | 반투명 배경 + 블러 효과로 깊이감 있는 UI |
| **Dark First** | 다크 모드 기본, 눈의 피로 최소화 |
| **Minimal & Clean** | 불필요한 요소 제거, 핵심 콘텐츠에 집중 |
| **Consistent** | 일관된 간격, 색상, 타이포그래피 사용 |
| **Accessible** | 충분한 대비, 명확한 상호작용 피드백 |

### 1.2 디자인 키워드

```
모던 | 심플 | 전문적 | 직관적 | 깔끔한 | 미래지향적
```

---

## 2. 컬러 시스템

### 2.1 CSS 변수 정의 (globals.css)

```css
:root {
  /* 배경 */
  --background: #0a0a0a;           /* 메인 배경 */
  --foreground: #ededed;           /* 기본 텍스트 */
  --card-background: rgba(17, 17, 17, 0.7);  /* 카드 배경 */
  --card-border: rgba(255, 255, 255, 0.1);   /* 카드 테두리 */
  
  /* 브랜드 색상 */
  --primary: #3b82f6;              /* 주요 액션 (blue-500) */
  --primary-hover: #2563eb;        /* 호버 (blue-600) */
  
  /* 시맨틱 색상 */
  --success: #10b981;              /* 성공 (green-500) */
  --warning: #f59e0b;              /* 경고 (yellow-500) */
  --error: #ef4444;                /* 오류 (red-500) */
}
```

### 2.2 Tailwind 색상 팔레트

#### 배경 색상
| 용도 | 클래스 | 예시 |
|------|--------|------|
| 메인 배경 | `bg-[#0a0a0a]` | 전체 페이지 배경 |
| 카드 배경 | `bg-white/5` | 콘텐츠 카드 |
| 호버 배경 | `bg-white/10` | 버튼/행 호버 |
| 입력 배경 | `bg-white/5` 또는 `bg-gray-800` | input, select |
| 모달 배경 | `bg-gray-900` | 모달 컨테이너 |

#### 텍스트 색상
| 용도 | 클래스 | 예시 |
|------|--------|------|
| 제목/강조 | `text-white` | h1, h2, 중요 텍스트 |
| 본문 | `text-gray-300` | 일반 텍스트 |
| 보조/설명 | `text-gray-400` | label, placeholder |
| 비활성 | `text-gray-500` | disabled, muted |

#### 브랜드/액션 색상
```tsx
// 주요 (Primary - Blue)
className="bg-blue-600 hover:bg-blue-700 text-white"

// 성공 (Success - Green)  
className="bg-green-600 hover:bg-green-700 text-white"

// 경고 (Warning - Yellow)
className="bg-yellow-600 hover:bg-yellow-700 text-white"

// 위험 (Danger - Red)
className="bg-red-600 hover:bg-red-700 text-white"
```

### 2.3 상태 배지 색상

```tsx
// 활성/성공
className="bg-green-500/20 text-green-400"

// 비활성/중립
className="bg-gray-500/20 text-gray-400"

// 대기중/경고
className="bg-yellow-500/20 text-yellow-400"

// 오류/위험
className="bg-red-500/20 text-red-400"

// 정보/기본
className="bg-blue-500/20 text-blue-400"

// 보라색 (특별)
className="bg-purple-500/20 text-purple-400"
```

### 2.4 그라데이션

```tsx
// 로고/헤더 그라데이션
className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"

// 배경 그라데이션
className="bg-gradient-to-br from-blue-600/20 to-purple-600/20"

// 버튼 강조
className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
```

---

## 3. 타이포그래피

### 3.1 폰트 설정

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

### 3.2 텍스트 크기

| 용도 | 클래스 | 크기 |
|------|--------|------|
| 페이지 제목 | `text-2xl lg:text-3xl font-bold` | 24px / 30px |
| 섹션 제목 | `text-xl font-bold` | 20px |
| 카드 제목 | `text-lg font-semibold` | 18px |
| 본문 | `text-base` (기본) | 16px |
| 레이블 | `text-sm text-gray-400` | 14px |
| 캡션/메타 | `text-xs text-gray-500` | 12px |

### 3.3 폰트 굵기

```tsx
// 굵기 클래스
font-bold      // 700 - 제목
font-semibold  // 600 - 강조
font-medium    // 500 - 버튼, 네비게이션
font-normal    // 400 - 본문 (기본)
```

### 3.4 타이포그래피 예시

```tsx
// 페이지 제목
<h1 className="text-2xl lg:text-3xl font-bold text-white">페이지 제목</h1>

// 섹션 제목
<h2 className="text-xl font-bold text-white">섹션 제목</h2>

// 카드 제목
<h3 className="text-lg font-semibold text-white">카드 제목</h3>

// 본문
<p className="text-gray-300">일반 텍스트입니다.</p>

// 보조 텍스트
<p className="text-sm text-gray-400">보조 설명 텍스트</p>

// 레이블
<label className="block text-sm text-gray-400 mb-2">레이블</label>
```

---

## 4. 레이아웃 시스템

### 4.1 기본 레이아웃 구조

```tsx
<div className="flex min-h-screen bg-[#0a0a0a]">
  {/* 사이드바 - 고정 너비 */}
  <Sidebar />  {/* w-64 (256px) */}
  
  {/* 메인 콘텐츠 */}
  <main className="flex-1 overflow-auto">
    <div className="max-w-7xl mx-auto p-4 lg:p-8">
      {children}
    </div>
  </main>
</div>
```

### 4.2 간격 시스템 (Spacing)

| 용도 | 클래스 | 크기 |
|------|--------|------|
| 아이템 내부 | `p-2`, `p-3` | 8px, 12px |
| 카드 패딩 | `p-4`, `p-6` | 16px, 24px |
| 섹션 간격 | `mb-6`, `mb-8` | 24px, 32px |
| 그룹 간격 | `gap-2`, `gap-4` | 8px, 16px |
| 페이지 패딩 | `p-4 lg:p-8` | 16px / 32px |

### 4.3 최대 너비

```tsx
max-w-md     // 448px - 모달, 작은 폼
max-w-lg     // 512px - 중간 모달
max-w-xl     // 576px - 큰 모달
max-w-2xl    // 672px - 상세 폼
max-w-4xl    // 896px - 넓은 콘텐츠
max-w-7xl    // 1280px - 페이지 컨테이너
```

### 4.4 그리드 시스템

```tsx
// 2컬럼 반응형
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">

// 3컬럼 반응형
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// 4컬럼 반응형 (대시보드 카드)
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

// 2:1 비율 (사이드 패널)
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2">{/* 메인 */}</div>
  <div>{/* 사이드 */}</div>
</div>
```

---

## 5. 컴포넌트 스타일 가이드

### 5.1 버튼 (Buttons)

#### Primary Button
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
  <Plus size={18} />
  신규 등록
</button>
```

#### Secondary Button
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors">
  <Edit size={16} />
  수정
</button>
```

#### Danger Button
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors">
  <Trash2 size={16} />
  삭제
</button>
```

#### Ghost Button (아이콘만)
```tsx
<button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="상세보기">
  <Eye size={16} className="text-gray-400" />
</button>
```

#### 버튼 크기
```tsx
// Small
className="px-3 py-1.5 text-sm rounded-md"

// Medium (기본)
className="px-4 py-2 rounded-lg"

// Large
className="px-6 py-3 text-lg rounded-xl"

// Full Width
className="w-full px-4 py-2.5 rounded-lg"
```

### 5.2 입력 필드 (Inputs)

#### Text Input
```tsx
<input
  type="text"
  placeholder="검색..."
  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
/>
```

#### Search Input (아이콘 포함)
```tsx
<div className="relative flex-1">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
  <input
    type="text"
    placeholder="검색..."
    className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
  />
</div>
```

#### Textarea
```tsx
<textarea
  className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 h-24 resize-none"
  placeholder="내용을 입력하세요..."
/>
```

#### Select
```tsx
<select className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer">
  <option value="all">전체 상태</option>
  <option value="Active">활성</option>
  <option value="Inactive">비활성</option>
</select>
```

#### 입력 필드 + 레이블
```tsx
<div>
  <label className="block text-sm text-gray-400 mb-2">이름 *</label>
  <input
    type="text"
    required
    className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
  />
</div>
```

### 5.3 카드 (Cards)

#### 기본 카드
```tsx
<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
  <h3 className="text-lg font-semibold text-white mb-4">카드 제목</h3>
  <p className="text-gray-400">카드 내용</p>
</div>
```

#### 통계 카드 (대시보드)
```tsx
<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
  <div className="flex items-center justify-between mb-4">
    <div className="p-3 rounded-xl bg-blue-500/20">
      <Users size={24} className="text-blue-400" />
    </div>
    <span className="text-green-400 text-sm flex items-center gap-1">
      <TrendingUp size={14} />
      +12%
    </span>
  </div>
  <p className="text-gray-400 text-sm">총 고객사</p>
  <p className="text-3xl font-bold text-white mt-1">156</p>
</div>
```

#### 호버 가능 카드
```tsx
<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer">
  {/* 내용 */}
</div>
```

### 5.4 테이블 (Tables)

```tsx
<div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-white/10">
          <th className="text-left p-4 text-gray-400 font-medium">이름</th>
          <th className="text-left p-4 text-gray-400 font-medium">상태</th>
          <th className="text-right p-4 text-gray-400 font-medium">액션</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
            <td className="p-4 text-white">{item.name}</td>
            <td className="p-4">
              <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
                Active
              </span>
            </td>
            <td className="p-4 text-right">
              <button className="p-2 hover:bg-white/10 rounded-lg">
                <Eye size={16} className="text-gray-400" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

### 5.5 배지 (Badges)

```tsx
// 상태 배지
<span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">
  활성
</span>

// 숫자 배지
<span className="px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">
  5
</span>

// 라벨 배지
<span className="px-3 py-1 rounded-lg text-sm bg-blue-500/20 text-blue-400">
  신규
</span>
```

### 5.6 모달 (Modals)

```tsx
{/* 오버레이 */}
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />

{/* 모달 컨테이너 */}
<div className="fixed inset-0 flex items-center justify-center z-50 p-4">
  <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-white/10 shadow-2xl">
    {/* 헤더 */}
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold text-white">모달 제목</h2>
      <button 
        onClick={onClose}
        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
      >
        <X size={20} className="text-gray-400" />
      </button>
    </div>
    
    {/* 내용 */}
    <div className="space-y-4">
      {/* 폼 필드들 */}
    </div>
    
    {/* 푸터 */}
    <div className="flex gap-3 mt-6">
      <button 
        onClick={onClose}
        className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 text-white hover:bg-white/20"
      >
        취소
      </button>
      <button className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
        확인
      </button>
    </div>
  </div>
</div>
```

### 5.7 탭 (Tabs)

```tsx
<div className="flex gap-1 mb-6 border-b border-white/10">
  {tabs.map((tab) => (
    <button
      key={tab.id}
      onClick={() => setActiveTab(tab.id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-[1px] ${
        activeTab === tab.id
          ? 'text-blue-400 border-blue-400'
          : 'text-gray-400 border-transparent hover:text-white'
      }`}
    >
      <tab.icon size={16} />
      {tab.label}
    </button>
  ))}
</div>
```

### 5.8 토스트 알림 (Toast)

```tsx
// 성공
className="bg-green-500/10 border-green-500/50 text-green-400"

// 오류
className="bg-red-500/10 border-red-500/50 text-red-400"

// 경고
className="bg-yellow-500/10 border-yellow-500/50 text-yellow-400"

// 정보
className="bg-blue-500/10 border-blue-500/50 text-blue-400"
```

### 5.9 로딩 상태 (Loading)

```tsx
// 스피너
<Loader2 className="animate-spin text-blue-500" size={40} />

// 로딩 컨테이너
<div className="flex items-center justify-center py-20">
  <Loader2 className="animate-spin text-blue-500" size={40} />
</div>

// 버튼 로딩
<button disabled className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
  <Loader2 size={16} className="animate-spin" />
  처리 중...
</button>
```

### 5.10 빈 상태 (Empty State)

```tsx
<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center py-20">
  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
    <FileText size={32} className="text-gray-500" />
  </div>
  <p className="text-gray-400 mb-4">데이터가 없습니다.</p>
  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
    새로 만들기
  </button>
</div>
```

---

## 6. 아이콘 사용 가이드

### 6.1 아이콘 라이브러리

```tsx
import { IconName } from 'lucide-react'
```

**Lucide React 공식 문서**: https://lucide.dev/icons/

### 6.2 자주 사용하는 아이콘

| 용도 | 아이콘 | import |
|------|--------|--------|
| 홈/대시보드 | `LayoutDashboard` | `import { LayoutDashboard } from 'lucide-react'` |
| 회사/고객 | `Building2` | `import { Building2 } from 'lucide-react'` |
| 문서/파일 | `FileText` | `import { FileText } from 'lucide-react'` |
| 설정 | `Settings` | `import { Settings } from 'lucide-react'` |
| 추가 | `Plus` | `import { Plus } from 'lucide-react'` |
| 검색 | `Search` | `import { Search } from 'lucide-react'` |
| 수정 | `Edit2`, `Pencil` | `import { Edit2 } from 'lucide-react'` |
| 삭제 | `Trash2` | `import { Trash2 } from 'lucide-react'` |
| 보기 | `Eye` | `import { Eye } from 'lucide-react'` |
| 닫기 | `X` | `import { X } from 'lucide-react'` |
| 메뉴 | `Menu` | `import { Menu } from 'lucide-react'` |
| 뒤로 | `ArrowLeft` | `import { ArrowLeft } from 'lucide-react'` |
| 저장 | `Save` | `import { Save } from 'lucide-react'` |
| 로딩 | `Loader2` | `import { Loader2 } from 'lucide-react'` |
| 성공 | `CheckCircle` | `import { CheckCircle } from 'lucide-react'` |
| 오류 | `XCircle` | `import { XCircle } from 'lucide-react'` |
| 경고 | `AlertTriangle` | `import { AlertTriangle } from 'lucide-react'` |
| 정보 | `Info` | `import { Info } from 'lucide-react'` |
| 외부링크 | `ExternalLink` | `import { ExternalLink } from 'lucide-react'` |
| 캘린더 | `Calendar` | `import { Calendar } from 'lucide-react'` |
| 차트 | `BarChart3` | `import { BarChart3 } from 'lucide-react'` |
| 메일 | `Mail` | `import { Mail } from 'lucide-react'` |
| 전화 | `Phone` | `import { Phone } from 'lucide-react'` |
| 사용자 | `User`, `Users` | `import { User, Users } from 'lucide-react'` |
| 다운로드 | `Download` | `import { Download } from 'lucide-react'` |
| 업로드 | `Upload` | `import { Upload } from 'lucide-react'` |
| 새로고침 | `RefreshCw` | `import { RefreshCw } from 'lucide-react'` |
| 필터 | `Filter` | `import { Filter } from 'lucide-react'` |
| 더보기 | `MoreHorizontal`, `MoreVertical` | `import { MoreHorizontal } from 'lucide-react'` |

### 6.3 아이콘 크기 가이드

```tsx
// 아이콘 크기
<Icon size={14} />  // 작은 아이콘 (텍스트 옆)
<Icon size={16} />  // 버튼 내 아이콘
<Icon size={18} />  // 일반 아이콘
<Icon size={20} />  // 네비게이션 아이콘
<Icon size={24} />  // 카드/강조 아이콘
<Icon size={32} />  // 빈 상태 아이콘
<Icon size={40} />  // 로딩 스피너
```

### 6.4 아이콘 색상

```tsx
// 기본 (중립)
<Icon className="text-gray-400" />

// 강조
<Icon className="text-white" />

// 브랜드/액션
<Icon className="text-blue-400" />

// 성공
<Icon className="text-green-400" />

// 경고
<Icon className="text-yellow-400" />

// 오류
<Icon className="text-red-400" />
```

---

## 7. 애니메이션 가이드

### 7.1 트랜지션

```tsx
// 색상 변경
className="transition-colors"

// 모든 속성
className="transition-all duration-200"

// 특정 속성
className="transition-transform duration-300 ease-in-out"
```

### 7.2 Tailwind 애니메이션

```tsx
// 스핀 (로딩)
className="animate-spin"

// 펄스 (로딩 플레이스홀더)
className="animate-pulse"

// 바운스
className="animate-bounce"

// 핑 (알림)
className="animate-ping"
```

### 7.3 커스텀 애니메이션 (globals.css)

```css
/* Fade In */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.4s ease-out;
}

/* Spinner */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.spinner {
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 0.8s linear infinite;
}
```

### 7.4 호버 효과

```tsx
// 버튼 호버
className="hover:bg-blue-700 transition-colors"

// 카드 호버 (살짝 올라감)
className="hover:transform hover:-translate-y-1 transition-transform"

// 글래스 호버
className="glass-hover"  // globals.css에 정의됨
```

---

## 8. 반응형 디자인

### 8.1 브레이크포인트

| 이름 | 접두사 | 최소 너비 |
|------|--------|-----------|
| 모바일 | 없음 | 0px |
| Small | `sm:` | 640px |
| Medium | `md:` | 768px |
| Large | `lg:` | 1024px |
| XL | `xl:` | 1280px |
| 2XL | `2xl:` | 1536px |

### 8.2 모바일 우선 (Mobile First)

```tsx
// 기본: 모바일 → sm → md → lg → xl
className="text-base sm:text-lg lg:text-xl"
className="p-4 lg:p-8"
className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
```

### 8.3 반응형 패턴

#### 숨기기/보이기
```tsx
// 모바일에서만 보임
className="block lg:hidden"

// 데스크탑에서만 보임
className="hidden lg:block"
```

#### 네비게이션
```tsx
// 모바일: 햄버거 메뉴
// 데스크탑: 사이드바
<aside className={`
  fixed lg:static
  transform transition-transform
  ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
`}>
```

#### 그리드 레이아웃
```tsx
// 모바일: 1열 → 태블릿: 2열 → 데스크탑: 4열
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
```

#### 테이블 → 카드
```tsx
// 데스크탑: 테이블
<div className="hidden md:block">
  <table>...</table>
</div>

// 모바일: 카드 리스트
<div className="md:hidden space-y-4">
  {items.map(item => (
    <div className="bg-white/5 rounded-xl p-4">...</div>
  ))}
</div>
```

---

## 9. 다크 테마 시스템

### 9.1 색상 대비

| 요소 | 배경 | 텍스트 | 대비율 |
|------|------|--------|--------|
| 본문 | `#0a0a0a` | `#ededed` | 16.5:1 ✓ |
| 카드 | `rgba(17,17,17,0.7)` | `#ffffff` | 17.1:1 ✓ |
| 보조텍스트 | `#0a0a0a` | `#9ca3af` | 5.9:1 ✓ |
| 레이블 | `#0a0a0a` | `#6b7280` | 4.6:1 ✓ |

### 9.2 글래스모피즘 (Glassmorphism)

```css
.glass {
  background: rgba(17, 17, 17, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

```tsx
// Tailwind로 구현
className="bg-white/5 backdrop-blur-sm border border-white/10"
```

### 9.3 그림자

```tsx
// 기본 그림자
className="shadow-lg"

// 컬러 그림자 (버튼 강조)
className="shadow-lg shadow-blue-600/50"

// 모달 그림자
className="shadow-2xl"
```

---

## 10. 컴포넌트 템플릿

### 10.1 페이지 헤더

```tsx
<div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
  <div>
    <h1 className="text-2xl font-bold text-white">페이지 제목</h1>
    <p className="text-gray-400 mt-1">총 {count}개 항목</p>
  </div>
  
  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
    <Plus size={18} />
    신규 등록
  </button>
</div>
```

### 10.2 검색/필터 바

```tsx
<div className="mb-6 flex flex-col sm:flex-row gap-4">
  {/* 검색 */}
  <div className="relative flex-1">
    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
    <input
      type="text"
      placeholder="검색..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
    />
  </div>
  
  {/* 필터 */}
  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
  >
    <option value="all">전체 상태</option>
    <option value="Active">활성</option>
    <option value="Inactive">비활성</option>
  </select>
</div>
```

### 10.3 상세 페이지 헤더

```tsx
<div className="mb-6">
  {/* 뒤로가기 & 액션 */}
  <div className="flex items-center justify-between mb-4">
    <Link 
      href="/list"
      className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
    >
      <ArrowLeft size={20} />
      <span>목록으로</span>
    </Link>
    
    <div className="flex items-center gap-2">
      <button className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
        <Edit2 size={16} />
        수정
      </button>
      <button className="flex items-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/30">
        <Trash2 size={16} />
        삭제
      </button>
    </div>
  </div>
  
  {/* 제목 & 상태 */}
  <div className="flex items-center gap-4">
    <h1 className="text-2xl font-bold text-white">{item.name}</h1>
    <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-400">
      {item.status}
    </span>
  </div>
  <p className="text-gray-400 mt-1">ID: {item.id}</p>
</div>
```

### 10.4 폼 레이아웃

```tsx
<div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
  <h3 className="text-lg font-semibold text-white mb-6">기본 정보</h3>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* 이름 */}
    <div>
      <label className="block text-sm text-gray-400 mb-2">이름 *</label>
      <input
        type="text"
        required
        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
      />
    </div>
    
    {/* 이메일 */}
    <div>
      <label className="block text-sm text-gray-400 mb-2">이메일</label>
      <input
        type="email"
        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500"
      />
    </div>
    
    {/* 설명 (전체 너비) */}
    <div className="md:col-span-2">
      <label className="block text-sm text-gray-400 mb-2">설명</label>
      <textarea
        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-blue-500 h-24"
      />
    </div>
  </div>
</div>
```

---

## 📚 참고 자료

- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/icons/
- **글래스모피즘 예시**: https://ui.glass/generator/
- **색상 대비 검사**: https://webaim.org/resources/contrastchecker/

---

## 🎨 디자인 체크리스트

새 컴포넌트 개발 시 확인사항:

- [ ] 다크 테마 색상 사용 (배경: `bg-white/5`, 텍스트: `text-white`, `text-gray-400`)
- [ ] 반응형 디자인 적용 (모바일 우선)
- [ ] 적절한 간격 사용 (`gap-4`, `p-4`, `p-6`)
- [ ] 일관된 모서리 둥글기 (`rounded-lg`, `rounded-xl`, `rounded-2xl`)
- [ ] 호버/포커스 상태 정의
- [ ] 로딩 상태 처리
- [ ] 빈 상태 디자인
- [ ] 아이콘 크기 일관성 (16, 18, 20, 24)
- [ ] 트랜지션 애니메이션 (`transition-colors`, `transition-all`)
- [ ] 글래스모피즘 효과 적용 (`bg-white/5 backdrop-blur-sm border border-white/10`)
