import { jsxRenderer } from 'hono/jsx-renderer'

export const renderer = jsxRenderer(({ children, title }) => {
  return (
    <html lang="ko">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title || 'VS AI ERP - 딜룸'}</title>
        
        {/* Tailwind CSS */}
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            tailwind.config = {
              darkMode: 'class',
              theme: {
                extend: {
                  colors: {
                    background: '#0a0a0a',
                    foreground: '#ededed',
                    card: 'rgba(17, 17, 17, 0.7)',
                    'card-border': 'rgba(255, 255, 255, 0.1)',
                    primary: {
                      DEFAULT: '#3b82f6',
                      hover: '#2563eb',
                      50: '#eff6ff',
                      100: '#dbeafe',
                      200: '#bfdbfe',
                      300: '#93c5fd',
                      400: '#60a5fa',
                      500: '#3b82f6',
                      600: '#2563eb',
                      700: '#1d4ed8',
                    },
                    success: '#10b981',
                    warning: '#f59e0b',
                    error: '#ef4444'
                  },
                  backdropBlur: {
                    xs: '2px',
                  }
                }
              }
            }
          `
        }} />
        
        {/* Lucide Icons - CDN */}
        <script src="https://unpkg.com/lucide@latest"></script>
        
        {/* Google Fonts - Inter */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        
        {/* Custom Styles */}
        <link href="/static/style.css" rel="stylesheet" />
      </head>
      <body class="font-sans bg-background text-foreground min-h-screen antialiased">
        {children}
        
        {/* Axios for API calls */}
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        
        {/* App Scripts */}
        <script src="/static/app.js"></script>
        
        {/* Initialize Lucide Icons */}
        <script dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('DOMContentLoaded', () => {
              if (typeof lucide !== 'undefined') {
                lucide.createIcons();
              }
            });
          `
        }} />
      </body>
    </html>
  )
})
