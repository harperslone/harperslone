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

          {/* Services List - Three Columns */}
          <div className="p-6 rounded-2xl" style={{
            backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
            backgroundSize: '8px 8px',
            backgroundColor: '#bfdbfe',
          }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {/* Left Column */}
              <div>
                <p className="font-normal text-black mb-4" style={{ fontSize: '13px' }}>
                  services_
                </p>
              </div>

              {/* Middle Column */}
              <div>
                <ul className="space-y-2">
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>image</li>
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>video</li>
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>identity</li>
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>book</li>
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>magazine</li>
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>print</li>
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>poster</li>
                </ul>
              </div>

              {/* Right Column */}
              <div>
                <ul className="space-y-2">
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>retail graphics</li>
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>brand design</li>
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>brand strategy</li>
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>content direction</li>
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>type design</li>
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>product design</li>
                  <li className="font-normal text-black lowercase" style={{ fontSize: '13px' }}>creative direction</li>
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
