'use client'

import { useState } from 'react'
import Image from 'next/image'
import { urlFor } from '@/lib/sanity/image'

interface GalleryLightboxProps {
  images: any[]
  title?: string
  columns?: number
  imageSize?: number // Image dimension (width and height) - options: 400, 800, 1200, 1600, 2000, 2400
  firstImageSize?: number // Optional different size for the first image
}

// Helper function to check if item is audio
function isAudio(item: any): boolean {
  if (!item) return false
  const mimeType = item.asset?.mimeType || ''
  const url = item.asset?.url || ''
  
  // Check mimeType for audio
  if (mimeType.startsWith('audio/')) {
    // .mov files with audio/quicktime are audio-only, not video
    if (mimeType === 'audio/quicktime' && url.match(/\.mov$/i)) return true
    return true
  }
  
  // Check URL extension for audio files
  if (url.match(/\.(mp3|wav|ogg|aac|flac|m4a|wma|opus)$/i)) return true
  
  return false
}

// Helper function to check if item is a video
function isVideo(item: any): boolean {
  if (!item) return false
  // Check _type field
  if (item._type === 'file') {
    // For file types, check URL extension first (most reliable)
    const url = item.asset?.url || ''
    // Check mimeType - but .mov files can have audio/quicktime mimeType
    const mimeType = item.asset?.mimeType || ''
    
    // If it's audio, it's not video
    if (isAudio(item)) return false
    
    // Check for video file extensions
    if (url.match(/\.(mp4|mov|webm|avi|wmv|flv|mkv|m4v|3gp|mpg|mpeg)$/i)) {
      return true
    }
    if (mimeType.startsWith('video/')) return true
  }
  // Check mimeType in asset (includes video/quicktime for .mov)
  if (item.asset?.mimeType?.startsWith('video/')) return true
  // Check URL extension for video files
  const url = item.asset?.url || ''
  if (url.match(/\.(mp4|mov|webm|avi|wmv|flv|mkv|m4v|3gp|mpg|mpeg)$/i)) return true
  // Check if asset exists and has url but no image-specific fields
  if (item.asset?.url && !item.asset?.metadata?.dimensions && !isAudio(item)) {
    // If it has a URL but no dimensions and it's not audio, it might be a video
    return true
  }
  return false
}

// Helper function to get media URL
function getMediaUrl(item: any): string | null {
  if (!item) return null
  if (isVideo(item)) {
    // For videos, get URL directly from asset
    return item.asset?.url || null
  }
  // For images, use urlFor
  try {
    return urlFor(item)?.url() || null
  } catch (error) {
    // Fallback: try direct asset URL
    return item.asset?.url || null
  }
}

export default function GalleryLightbox({ images, title, columns = 5, imageSize = 800, firstImageSize }: GalleryLightboxProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)

  const openLightbox = (index: number) => {
    setSelectedImage(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1)
    }
  }

  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (selectedImage !== null && selectedImage < images.length - 1) {
      setSelectedImage(selectedImage + 1)
    }
  }

  return (
    <>
      {/* Gallery Grid - configurable columns */}
      {images && Array.isArray(images) && images.length > 0 && (
        <div 
          className={`grid`} 
          style={{ 
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            gap: imageSize > 800 ? '24px' : '16px',
            maxWidth: columns === 1 
              ? (imageSize > 800 ? `${imageSize}px` : '100%')
              : imageSize > 800 
                ? `${imageSize * columns + (24 * (columns - 1))}px`
                : `${imageSize * columns + (16 * (columns - 1))}px`
          }}
        >
          {images.map((galleryItem: any, index: number) => {
            try {
              if (!galleryItem) return null
              
              // Debug: Log all items
              console.log(`Gallery item ${index}:`, {
                _type: galleryItem._type,
                _key: galleryItem._key,
                asset: galleryItem.asset,
                assetUrl: galleryItem.asset?.url,
                mimeType: galleryItem.asset?.mimeType,
                hasDimensions: !!galleryItem.asset?.metadata?.dimensions
              })
              
              const isVideoItem = isVideo(galleryItem)
              const isAudioItem = isAudio(galleryItem)
              const mediaUrl = getMediaUrl(galleryItem)
              
              if (!mediaUrl) {
                console.warn('No media URL for gallery item:', {
                  item: galleryItem,
                  _type: galleryItem._type,
                  asset: galleryItem.asset,
                  mimeType: galleryItem.asset?.mimeType
                })
                return null
              }
              
              // Debug log for videos and audio
              if (isVideoItem) {
                console.log('Rendering video:', { index, mediaUrl, item: galleryItem })
              }
              if (isAudioItem) {
                console.log('Rendering audio:', { index, mediaUrl, item: galleryItem })
              }
              
              return (
                <div 
                  key={index} 
                  className="relative w-full cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openLightbox(index)}
                >
                  {isAudioItem ? (
                    <div className="relative w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      <div className="w-full p-4">
                        <audio
                          src={mediaUrl}
                          controls
                          className="w-full"
                          preload="metadata"
                        />
                      </div>
                    </div>
                  ) : isVideoItem ? (
                    <div className="relative w-full aspect-square bg-black flex items-center justify-center overflow-hidden">
                      <video
                        src={mediaUrl}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          console.error('Video load error:', e, mediaUrl)
                        }}
                        onMouseEnter={(e) => {
                          const video = e.currentTarget
                          video.play().catch((err) => {
                            console.warn('Video play failed:', err)
                          })
                        }}
                        onMouseLeave={(e) => {
                          const video = e.currentTarget
                          video.pause()
                          video.currentTime = 0
                        }}
                        onLoadedMetadata={(e) => {
                          // Try to capture first frame as poster
                          const video = e.currentTarget
                          video.currentTime = 0.1
                        }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <svg className="w-12 h-12 text-white opacity-70" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="relative w-full" style={{ 
                      minHeight: (index === 0 && firstImageSize ? firstImageSize : imageSize) > 800 ? `${(index === 0 && firstImageSize ? firstImageSize : imageSize) * 0.6}px` : 'auto'
                    }}>
                      <Image
                        src={mediaUrl}
                        alt={`${title || 'Gallery'} image ${index + 1}`}
                        width={index === 0 && firstImageSize ? firstImageSize : imageSize}
                        height={index === 0 && firstImageSize ? firstImageSize : imageSize}
                        className={(index === 0 && firstImageSize ? firstImageSize : imageSize) > 800 ? "h-auto" : columns === 1 ? "h-auto" : "w-full h-auto"}
                        style={(index === 0 && firstImageSize ? firstImageSize : imageSize) > 800 ? {
                          width: '100%',
                          maxWidth: `${index === 0 && firstImageSize ? firstImageSize : imageSize}px`,
                          height: 'auto',
                          objectFit: 'contain'
                        } : columns === 1 ? {
                          width: `${index === 0 && firstImageSize ? firstImageSize : imageSize}px`,
                          maxWidth: `${index === 0 && firstImageSize ? firstImageSize : imageSize}px`,
                          height: 'auto',
                          objectFit: 'contain'
                        } : {
                          width: '100%',
                          height: 'auto',
                          objectFit: 'contain'
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            } catch (error) {
              console.error('Error rendering gallery item:', error)
              return null
            }
          })}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 z-50 bg-white flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close Button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-black text-4xl hover:opacity-70 transition-opacity z-10"
            aria-label="Close lightbox"
          >
            ×
          </button>

          {/* Previous Button */}
          {selectedImage > 0 && (
            <button
              onClick={goToPrevious}
              className="absolute left-4 text-red-500 text-4xl hover:opacity-70 transition-opacity z-10"
              aria-label="Previous image"
            >
              ‹
            </button>
          )}

          {/* Next Button */}
          {selectedImage < images.length - 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 text-red-500 text-4xl hover:opacity-70 transition-opacity z-10"
              aria-label="Next image"
            >
              ›
            </button>
          )}

          {/* Image or Video */}
          <div 
            className="relative max-w-[60vw] max-h-[60vh] p-4"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const selectedItem = images[selectedImage]
              if (!selectedItem) return null
              
              const isVideoItem = isVideo(selectedItem)
              const isAudioItem = isAudio(selectedItem)
              const mediaUrl = getMediaUrl(selectedItem)
              if (!mediaUrl) return null
              
              if (isAudioItem) {
                return (
                  <div className="w-full max-w-md">
                    <audio
                      src={mediaUrl}
                      controls
                      className="w-full"
                      preload="metadata"
                      onError={(e) => {
                        console.error('Lightbox audio load error:', e, mediaUrl)
                      }}
                    />
                  </div>
                )
              }
              
              if (isVideoItem) {
                return (
                  <video
                    src={mediaUrl}
                    controls
                    className="max-w-full max-h-[60vh]"
                    style={{ maxHeight: '60vh' }}
                    crossOrigin="anonymous"
                    onError={(e) => {
                      console.error('Lightbox video load error:', e, mediaUrl)
                    }}
                  />
                )
              }
              
              return (
                <Image
                  src={mediaUrl}
                  alt={`${title || 'Gallery'} image ${selectedImage + 1}`}
                  width={2000}
                  height={2000}
                  className="max-w-full max-h-[60vh] object-contain"
                  unoptimized
                />
              )
            })()}
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-black text-sm">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}

