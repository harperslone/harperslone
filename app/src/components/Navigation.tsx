'use client'

import Link from 'next/link'

export default function Navigation() {
  return (
    <div className="relative z-20">
      {/* Primary Navigation - Always Displayed */}
      <nav className="py-1 px-2 md:py-2 md:px-4" style={{
        backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        backgroundColor: '#ffefd5',
      }}>
        <div className="flex flex-wrap items-center justify-between gap-2 md:gap-4" style={{ fontSize: '11px' }}>
          <Link href="/" className="text-black font-normal hover:opacity-70 nav-link" style={{
            backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
            backgroundSize: '6px 6px',
            backgroundColor: '#bfdbfe',
            fontSize: '11px',
            padding: '2px 6px',
            lineHeight: '1.2',
          }}>
            harper slone
          </Link>
          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-black font-normal" style={{ fontSize: '11px' }}>
            <Link href="/about" className="hover:opacity-70 nav-link" style={{
              backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
              backgroundSize: '6px 6px',
              backgroundColor: '#bfdbfe',
              fontSize: '11px',
              padding: '2px 6px',
              lineHeight: '1.2',
            }}>
              about
            </Link>
            <Link href="/contact" className="hover:opacity-70 nav-link" style={{
              backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
              backgroundSize: '6px 6px',
              backgroundColor: '#bfdbfe',
              fontSize: '11px',
              padding: '2px 6px',
              lineHeight: '1.2',
            }}>
              contact
            </Link>
            <Link href="/cart" className="hover:opacity-70 flex items-center justify-center nav-link" style={{
              backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
              backgroundSize: '6px 6px',
              backgroundColor: '#bfdbfe',
              padding: '2px 6px',
              lineHeight: '1.2',
            }}>
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ display: 'inline-block', verticalAlign: 'middle' }}
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}
