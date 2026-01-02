import Link from 'next/link'
import Navigation from '@/components/Navigation'

export default function Contact() {
  return (
    <div className="min-h-screen bg-amber-50 flex flex-col relative">
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 p-8 md:p-12">
        <div className="max-w-6xl mx-auto">
          {/* Contact Information */}
          <div className="mb-12 text-center space-y-4">
            <p className="font-normal text-black inline-block px-4 py-2 rounded-full" style={{ 
              fontSize: '13px',
              backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
              backgroundSize: '8px 8px',
              backgroundColor: '#bfdbfe',
            }}>
              <a href="mailto:harperslone@me.com" className="underline hover:no-underline">harperslone@me.com</a>
            </p>
            <p className="font-normal text-black inline-block px-4 py-2 rounded-full" style={{ 
              fontSize: '13px',
              backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
              backgroundSize: '8px 8px',
              backgroundColor: '#bfdbfe',
            }}>
              <a href="https://instagram.com/harpergslone" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">@harpergslone</a>
            </p>
            <p className="font-normal text-black inline-block px-4 py-2 rounded-full" style={{ 
              fontSize: '13px',
              backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
              backgroundSize: '8px 8px',
              backgroundColor: '#bfdbfe',
            }}>
              <a href="https://instagram.com/harper.slone" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">@harper.slone</a>
            </p>
          </div>

          {/* Services List - Three Columns on desktop, Two on mobile */}
          <div className="p-4 md:p-6 rounded-2xl" style={{
            backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
            backgroundSize: '8px 8px',
            backgroundColor: '#bfdbfe',
          }}>
            {/* Services header */}
            <p className="font-normal text-black mb-4" style={{ fontSize: '13px' }}>
              services_
            </p>
            
            {/* Two columns on mobile, two columns on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-8">
              {/* Left Column */}
              <div>
                <ul className="space-y-1 md:space-y-2">
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>image</li>
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>video</li>
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>identity</li>
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>book</li>
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>magazine</li>
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>print</li>
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>poster</li>
                </ul>
              </div>

              {/* Right Column */}
              <div>
                <ul className="space-y-1 md:space-y-2">
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>retail graphics</li>
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>brand design</li>
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>brand strategy</li>
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>content direction</li>
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>type design</li>
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>product design</li>
                  <li className="font-normal text-black lowercase text-xs md:text-sm" style={{ fontSize: '11px' }}>creative direction</li>
                </ul>
              </div>
            </div>
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
