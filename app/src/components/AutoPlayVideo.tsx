'use client'

import { useEffect, useRef, useState } from 'react'

interface AutoPlayVideoProps {
  src: string
  className?: string
  style?: React.CSSProperties
  controls?: boolean
}

export default function AutoPlayVideo({ src, className, style, controls = false }: AutoPlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadTimeout, setLoadTimeout] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Set a timeout to detect if video is stuck loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Video loading timeout after 10 seconds:', src)
        setError('Video is taking too long to load. Please try clicking play manually.')
        setIsLoading(false)
      }
    }, 10000)

    setLoadTimeout(timeout)

    // Try to play the video
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('Video autoplay failed:', err)
        // Don't set error for autoplay failures - user can still click play
      })
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [src, isLoading])

  const handleError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const video = e.currentTarget
    const error = video.error
    let errorMsg = 'Video load error'
    
    if (error) {
      switch (error.code) {
        case error.MEDIA_ERR_ABORTED:
          errorMsg = 'Video loading aborted'
          break
        case error.MEDIA_ERR_NETWORK:
          errorMsg = 'Network error loading video'
          break
        case error.MEDIA_ERR_DECODE:
          errorMsg = 'Video format not supported or corrupted'
          break
        case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
          errorMsg = 'Video format not supported by browser'
          break
        default:
          errorMsg = `Video error (code: ${error.code})`
      }
    }
    
    console.error('Video error:', errorMsg, src, error)
    setError(errorMsg)
    setIsLoading(false)
    if (loadTimeout) clearTimeout(loadTimeout)
  }

  const handleLoadedData = () => {
    console.log('Video loaded successfully:', src)
    setIsLoading(false)
    setError(null)
    if (loadTimeout) clearTimeout(loadTimeout)
  }

  const handleCanPlay = () => {
    console.log('Video can play:', src)
    setIsLoading(false)
    if (loadTimeout) clearTimeout(loadTimeout)
  }

  const handleStalled = () => {
    console.warn('Video stalled:', src)
  }

  const handleWaiting = () => {
    console.warn('Video waiting for data:', src)
  }

  return (
    <div style={{ position: 'relative', width: '100%', backgroundColor: '#000' }}>
      <video
        ref={videoRef}
        src={src}
        muted
        autoPlay
        loop
        playsInline
        controls={controls}
        className={className}
        style={style}
        preload="auto"
        onError={handleError}
        onLoadedData={handleLoadedData}
        onCanPlay={handleCanPlay}
        onStalled={handleStalled}
        onWaiting={handleWaiting}
        onLoadStart={() => {
          console.log('Video load started:', src)
          setIsLoading(true)
        }}
      >
        Your browser does not support the video tag.
        <source src={src} type="video/quicktime" />
        <source src={src} type="video/mp4" />
      </video>
      {error && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: 'white',
          backgroundColor: 'rgba(0,0,0,0.8)',
          padding: '1rem 2rem',
          borderRadius: '4px',
          textAlign: 'center',
          maxWidth: '80%',
          zIndex: 10
        }}>
          <div style={{ marginBottom: '0.5rem' }}>{error}</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>
            Try clicking the play button or check the browser console for details.
          </div>
        </div>
      )}
      {isLoading && !error && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          color: 'white',
          zIndex: 10
        }}>
          Loading video...
        </div>
      )}
    </div>
  )
}

