import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function Cart() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col relative">
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex items-center justify-center p-8 md:p-12">
        <div className="max-w-md w-full text-center space-y-8">
          {/* Under Construction Icon */}
          <div className="flex justify-center">
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-black"
            >
              {/* Construction/Warning Triangle */}
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              {/* Exclamation mark */}
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
          
          <div className="space-y-4">
            <h1 className="font-bold text-black" style={{ fontSize: '24px' }}>
              under construction
            </h1>
            <p className="font-normal text-black leading-relaxed" style={{ fontSize: '13px' }}>
              the shop is currently being built.
            </p>
            <p className="font-normal text-black" style={{ fontSize: '13px' }}>
              check back soon!
            </p>
          </div>
        </div>
        
        {/* Yellow Dot - Return to Home */}
        <div className="fixed bottom-8 left-8 z-20">
          <Link href="/" className="block w-4 h-4 bg-yellow-400 rounded-full hover:opacity-80 transition-opacity" title="Return to home">
          </Link>
        </div>
      </main>
    </div>
  )
}

