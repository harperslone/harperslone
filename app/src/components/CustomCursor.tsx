'use client'

import { useEffect, useState } from 'react'

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
      
      // Check if hovering over clickable image elements
      const target = e.target as HTMLElement
      const isOverImage = target.closest('.cursor-red-dot') || 
                         target.closest('img') || 
                         target.closest('video') ||
                         target.tagName === 'IMG' ||
                         target.tagName === 'VIDEO' ||
                         (target.closest('div') && target.closest('div')?.classList.contains('cursor-red-dot'))
      
      setIsHovering(isOverImage || false)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
      setIsHovering(false)
    }

    window.addEventListener('mousemove', updateCursor)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', updateCursor)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className="pointer-events-none fixed z-[9999] transition-all duration-150 ease-out"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -50%)',
        width: isHovering ? '20px' : '10px',
        height: isHovering ? '20px' : '10px',
      }}
    >
      <div
        className="rounded-full bg-red-500"
        style={{
          width: '100%',
          height: '100%',
          boxShadow: '0 0 0 2px rgba(255, 0, 0, 0.2)',
        }}
      />
    </div>
  )
}

