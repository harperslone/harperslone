import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function About() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col relative">
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex items-center justify-center p-8 md:p-12">
        <div className="max-w-2xl w-full text-center space-y-4">
          <p className="font-normal text-black leading-relaxed" style={{ fontSize: '13px' }}>
            Slone (b.2001) is a visual artist and photographer, whose practice is driven
            by intuition and color-based inspiration. Capturing the beauty of her physical environment while creating imagined spaces.
          </p>
          <p className="font-normal text-black" style={{ fontSize: '13px' }}>
            Graduate of Parsons School of Design (Art, Media, Technology)
          </p>
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

