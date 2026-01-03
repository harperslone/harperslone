'use client'

import Link from 'next/link'

export default function Navigation() {
  return (
    <div className="relative z-20">
      {/* Primary Navigation - Always Displayed */}
      <nav className="nav-bar py-2 px-4" style={{
        backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        backgroundColor: '#ffefd5',
      }}>
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4" style={{ fontSize: '13px' }}>
          <Link href="/" className="text-black font-normal hover:opacity-70 px-2 py-1 nav-link-box" style={{
            backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
            backgroundSize: '8px 8px',
            backgroundColor: '#bfdbfe',
          }}>
            harper slone
          </Link>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-black font-normal">
            <Link href="/about" className="hover:opacity-70 px-2 py-1 nav-link-box" style={{
              backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
              backgroundSize: '8px 8px',
              backgroundColor: '#bfdbfe',
            }}>
              about
            </Link>
            <Link href="/contact" className="hover:opacity-70 px-2 py-1 nav-link-box" style={{
              backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
              backgroundSize: '8px 8px',
              backgroundColor: '#bfdbfe',
            }}>
              contact
            </Link>
            <Link href="/cart" className="hover:opacity-70 px-2 py-1 flex items-center justify-center nav-link-box" style={{
              backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
              backgroundSize: '8px 8px',
              backgroundColor: '#bfdbfe',
            }}>
              <svg 
                className="nav-cart-icon"
                width="16" 
                height="16" 
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
