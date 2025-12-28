'use client'

import Link from 'next/link'

export default function Navigation() {
  return (
    <div className="relative z-20">
      {/* Primary Navigation - Always Displayed */}
      <nav className="py-2 px-4" style={{
        backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
        backgroundSize: '30px 30px',
        backgroundColor: '#ffefd5',
      }}>
        <div className="flex flex-wrap items-center justify-between gap-3 md:gap-4" style={{ fontSize: '13px' }}>
          <Link href="/" className="text-black font-normal hover:opacity-70 px-2 py-1" style={{
            backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
            backgroundSize: '8px 8px',
            backgroundColor: '#bfdbfe',
            fontSize: '13px',
          }}>
            harper slone
          </Link>
          <div className="flex flex-wrap items-center gap-3 md:gap-4 text-black font-normal" style={{ fontSize: '13px' }}>
            <Link href="/about" className="hover:opacity-70 px-2 py-1" style={{
              backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
              backgroundSize: '8px 8px',
              backgroundColor: '#bfdbfe',
              fontSize: '13px',
            }}>
              about
            </Link>
            <Link href="/contact" className="hover:opacity-70 px-2 py-1" style={{
              backgroundImage: 'radial-gradient(circle, #bfdbfe 1px, transparent 1px)',
              backgroundSize: '8px 8px',
              backgroundColor: '#bfdbfe',
              fontSize: '13px',
            }}>
              contact
            </Link>
          </div>
        </div>
      </nav>
    </div>
  )
}

