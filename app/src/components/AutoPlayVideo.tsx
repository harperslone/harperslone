'use client'

import { useEffect, useRef } from 'react'

interface AutoPlayVideoProps {
  src: string
  className?: string
  style?: React.CSSProperties
}

export default function AutoPlayVideo({ src, className, style }: AutoPlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.play().catch((err) => {
        console.warn('Video autoplay failed:', err)
      })
    }
  }, [src])

  return (
    <video
      ref={videoRef}
      src={src}
      muted
      autoPlay
      loop
      playsInline
      className={className}
      style={style}
      crossOrigin="anonymous"
    />
  )
}

