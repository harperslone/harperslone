'use client'

import { useState } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'

interface SequentialGalleryProps {
  images: any[]
  title?: string
  description?: string
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  customMaxWidth?: number // Custom max width in pixels
  hideCaptions?: boolean // Hide image captions
}

// Helper function to check if item is audio
function isAudio(item: any): boolean {
  if (!item) return false
  const mimeType = item.asset?.mimeType || ''
  const url = item.asset?.url || ''
  
  if (mimeType.startsWith('audio/')) {
    if (mimeType === 'audio/quicktime' && url.match(/\.mov$/i)) return true
    return true
  }
  
  if (url.match(/\.(mp3|wav|ogg|aac|flac|m4a|wma|opus)$/i)) return true
  
  return false
}

// Helper function to check if item is video
function isVideo(item: any): boolean {
  if (!item) return false
  if (item._type === 'file') {
    const url = item.asset?.url || ''
    const mimeType = item.asset?.mimeType || ''
    
    if (isAudio(item)) return false
    
    if (url.match(/\.(mp4|mov|webm|avi|wmv|flv|mkv|m4v|3gp|mpg|mpeg)$/i)) {
      return true
    }
    if (mimeType.startsWith('video/')) return true
  }
  if (item.asset?.mimeType?.startsWith('video/')) return true
  const url = item.asset?.url || ''
  if (url.match(/\.(mp4|mov|webm|avi|wmv|flv|mkv|m4v|3gp|mpg|mpeg)$/i)) return true
  if (item.asset?.url && !item.asset?.metadata?.dimensions && !isAudio(item)) {
    return true
  }
  return false
}

// Helper function to get media URL
function getMediaUrl(item: any): string | null {
  if (!item) return null
  if (isVideo(item)) {
    return item.asset?.url || null
  }
  return urlFor(item)?.url() || null
}

export default function SequentialGallery({ images, title, description, maxWidth = 'lg', customMaxWidth, hideCaptions = false }: SequentialGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [lightboxImage, setLightboxImage] = useState<string | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Filter out items without valid media URLs
  const validImages = images.filter((item: any) => getMediaUrl(item))
  
  if (validImages.length === 0) return null

  const currentItem = validImages[currentIndex]
  const mediaUrl = getMediaUrl(currentItem)
  const isVideoItem = isVideo(currentItem)
  const isAudioItem = isAudio(currentItem)

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % validImages.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + validImages.length) % validImages.length)
  }

  const openLightbox = (index: number) => {
    const item = validImages[index]
    const url = getMediaUrl(item)
    if (url) {
      setLightboxImage(url)
      setLightboxIndex(index)
    }
  }

  const closeLightbox = () => {
    setLightboxImage(null)
    setLightboxIndex(null)
  }

  const lightboxGoToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (lightboxIndex !== null && lightboxIndex > 0) {
      openLightbox(lightboxIndex - 1)
    }
  }

  const lightboxGoToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (lightboxIndex !== null && lightboxIndex < validImages.length - 1) {
      openLightbox(lightboxIndex + 1)
    }
  }

  return (
    <>
      <div className="w-full mb-8">
        {/* Text description on the left above - only show if description exists */}
        {description && (
          <div 
            className="text-black font-normal lowercase text-90s mb-6"
            style={{ 
              fontSize: '13px',
              lineHeight: '1.4',
              letterSpacing: '0.2px',
              textAlign: 'left',
              width: '300px'
            }}
          >
            {description.split('\n').map((line: string, index: number) => {
              // Handle bold text with ** markers
              const isFirstLine = index === 0
              const displayLine = line
              const parts = displayLine.split(/(\*\*.*?\*\*)/g)
              return (
                <div key={index} style={{ marginBottom: isFirstLine ? '6px' : '2px', fontWeight: 'normal' }}>
                  {parts.map((part, partIndex) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={partIndex}>{part.slice(2, -2)}</strong>
                    }
                    return <span key={partIndex}>{part}</span>
                  })}
                </div>
              )
            })}
          </div>
        )}
        
        {/* Current Image Display - Fixed center position with arrows on both sides */}
        <div 
          className="relative w-full sequential-gallery-container"
          style={{ 
            minHeight: customMaxWidth ? `${Math.max(customMaxWidth + 100, 400)}px` : '500px',
            position: 'relative',
            paddingTop: '20px',
            paddingBottom: '20px',
            maxWidth: '100%',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {/* Left arrow - fixed position at center of container */}
          {validImages.length > 1 && (
            <div 
              className="flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity z-10 sequential-arrow-left"
              onClick={goToPrevious}
              style={{ 
                position: 'absolute',
                top: '50%',
                left: '40px',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px'
              }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: '#dc2626' }}
              >
                <path 
                  d="M19 12H5M5 12L12 5M5 12L12 19" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
          
          {/* Image, Video, or Audio - always centered in container */}
          <div 
            className="flex flex-col justify-center items-center sequential-image-container"
            style={{ 
              maxWidth: customMaxWidth ? `${customMaxWidth + 160}px` : (
                maxWidth === 'xs' ? '460px' : 
                maxWidth === 'sm' ? '560px' : 
                maxWidth === 'md' ? '660px' : 
                maxWidth === 'xl' ? '860px' : 
                '760px'
              ),
              width: 'auto',
              paddingLeft: validImages.length > 1 ? '80px' : '0',
              paddingRight: validImages.length > 1 ? '80px' : '0',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div 
              className="flex justify-center items-center cursor-red-dot hover:opacity-90 transition-opacity w-full"
              onClick={() => openLightbox(currentIndex)}
            >
              {isAudioItem ? (
                <div 
                  className="relative aspect-square bg-gray-100 flex items-center justify-center p-8 w-full"
                  style={{ maxWidth: customMaxWidth ? `${customMaxWidth}px` : (
                    maxWidth === 'xs' ? '300px' : 
                    maxWidth === 'sm' ? '400px' : 
                    maxWidth === 'md' ? '500px' : 
                    maxWidth === 'xl' ? '700px' : 
                    '600px'
                  ) }}
                >
                  <audio
                    src={mediaUrl || ''}
                    controls
                    className="w-full max-w-md"
                    preload="metadata"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : isVideoItem ? (
                <div 
                  className="relative aspect-video bg-black flex items-center justify-center w-full"
                  style={{ maxWidth: customMaxWidth ? `${customMaxWidth}px` : (
                    maxWidth === 'xs' ? '300px' : 
                    maxWidth === 'sm' ? '400px' : 
                    maxWidth === 'md' ? '500px' : 
                    maxWidth === 'xl' ? '700px' : 
                    '600px'
                  ) }}
                >
                  <video
                    src={mediaUrl || ''}
                    className="w-full h-full object-contain"
                    muted
                    playsInline
                    preload="metadata"
                    controls
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              ) : (
                <img
                  src={mediaUrl || ''}
                  alt={currentItem.caption || currentItem.alt || `${title || 'Gallery'} image ${currentIndex + 1}`}
                  style={{ 
                    maxWidth: customMaxWidth ? `${customMaxWidth}px` : (
                      maxWidth === 'xs' ? '300px' : 
                      maxWidth === 'sm' ? '400px' : 
                      maxWidth === 'md' ? '500px' : 
                      maxWidth === 'xl' ? '700px' : 
                      '600px'
                    ),
                    maxHeight: '70vh',
                    width: 'auto',
                    height: 'auto',
                    objectFit: 'contain'
                  }}
                />
              )}
            </div>
            
            {/* Image caption/description below the image with numbering - hidden if hideCaptions is true */}
            {!hideCaptions && (
              <div 
                className="text-black font-normal lowercase text-90s mt-3 text-left"
                style={{ 
                  fontSize: '9px',
                  lineHeight: '1.4',
                  letterSpacing: '0.1px',
                  width: '100%',
                  opacity: 0.7,
                  paddingTop: '8px'
                }}
              >
                {(() => {
                  const imageNumber = currentIndex + 1
                  const caption = currentItem.caption || currentItem.alt || ''
                  // If there's a caption, combine it with the number, otherwise just show the number
                  if (caption) {
                    return `n°${imageNumber} ${caption}`
                  } else {
                    return `n°${imageNumber}`
                  }
                })()}
              </div>
            )}
          </div>
          
          {/* Right arrow - fixed position at center of container */}
          {validImages.length > 1 && (
            <div 
              className="flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity z-10 sequential-arrow-right"
              onClick={goToNext}
              style={{ 
                position: 'absolute',
                top: '50%',
                right: '40px',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px'
              }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                style={{ color: '#dc2626' }}
              >
                <path 
                  d="M5 12H19M19 12L12 5M19 12L12 19" 
                  stroke="currentColor" 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && lightboxIndex !== null && (
        <div 
          className="fixed inset-0 bg-white z-50 flex items-center justify-center cursor-pointer"
          onClick={closeLightbox}
        >
          <div className="relative w-full h-full flex items-center justify-center p-4">
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-black text-2xl font-bold z-10 hover:opacity-70"
              style={{ fontSize: '32px', lineHeight: '1' }}
            >
              ×
            </button>

            {/* Previous button */}
            {lightboxIndex > 0 && (
              <button
                onClick={lightboxGoToPrevious}
                className="absolute left-4 text-black text-4xl font-bold z-10 hover:opacity-70"
                style={{ fontSize: '28px', lineHeight: '1' }}
              >
                ‹
              </button>
            )}

            {/* Next button */}
            {lightboxIndex < validImages.length - 1 && (
              <button
                onClick={lightboxGoToNext}
                className="absolute right-4 text-black text-4xl font-bold z-10 hover:opacity-70"
                style={{ fontSize: '28px', lineHeight: '1' }}
              >
                ›
              </button>
            )}

            {/* Image */}
            <img
              src={lightboxImage}
              alt={`${title || 'Gallery'} image ${lightboxIndex + 1}`}
              className="max-w-4xl max-h-[80vh] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  )
}

