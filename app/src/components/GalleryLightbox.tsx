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
  rotateImageIndex?: number // Optional index of image to rotate (in degrees, negative for counter-clockwise)
  gap?: number // Optional custom gap size in pixels
  center?: boolean // Center the gallery instead of stretching to full width
}

// Helper function to check if item is audio
function isAudio(item: any): boolean {
  if (!item) return false
  const mimeType = item.asset?.mimeType || ''
  const url = item.asset?.url || ''
  
  // Check URL extension for audio files first (most reliable)
  // Exclude .mov files as they are typically video files
  if (url.match(/\.(mp3|wav|ogg|aac|flac|m4a|wma|opus)$/i)) return true
  
  // Check mimeType for audio (but .mov files with audio/quicktime are usually video)
  if (mimeType.startsWith('audio/')) {
    // Only treat as audio if it's NOT a .mov file
    // .mov files with audio/quicktime mimeType are typically video files
    if (url.match(/\.mov$/i)) return false
    return true
  }
  
  return false
}

// Helper function to check if item is a video
function isVideo(item: any): boolean {
  if (!item) return false
  const url = item.asset?.url || ''
  const mimeType = item.asset?.mimeType || ''
  
  // Check _type field
  if (item._type === 'file') {
    // For file types, check URL extension first (most reliable)
    // .mov files are video files (even if mimeType is audio/quicktime)
    if (url.match(/\.(mp4|mov|webm|avi|wmv|flv|mkv|m4v|3gp|mpg|mpeg)$/i)) {
      // Double-check it's not actually audio
      if (!isAudio(item)) return true
    }
    if (mimeType.startsWith('video/')) return true
    // .mov files with audio/quicktime mimeType are typically video files
    if (mimeType === 'audio/quicktime' && url.match(/\.mov$/i)) return true
  }
  
  // Check mimeType in asset (includes video/quicktime for .mov)
  if (mimeType.startsWith('video/')) return true
  // .mov files with audio/quicktime mimeType are typically video files
  if (mimeType === 'audio/quicktime' && url.match(/\.mov$/i)) return true
  
  // Check URL extension for video files
  if (url.match(/\.(mp4|mov|webm|avi|wmv|flv|mkv|m4v|3gp|mpg|mpeg)$/i)) {
    // Double-check it's not actually audio
    if (!isAudio(item)) return true
  }
  
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

// Helper function to check if an image is landscape (width > height)
function isLandscape(item: any): boolean {
  if (!item || isVideo(item) || isAudio(item)) return false
  const dimensions = item.asset?.metadata?.dimensions
  if (dimensions && dimensions.width && dimensions.height) {
    return dimensions.width > dimensions.height
  }
  return false
}

export default function GalleryLightbox({ images, title, columns = 5, imageSize = 800, firstImageSize, rotateImageIndex, gap, center = false }: GalleryLightboxProps) {
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
        (() => {
          // Check if any images are landscape (will be 300px, unless imageSize is explicitly 200px or less)
          const hasLandscapeImages = images.some((item: any) => isLandscape(item))
          // Use 300px for maxWidth calculation if there are landscape images, unless imageSize is 200px or less
          // This allows explicit 200px sizing to override the landscape 300px default
          const maxImageSize = (hasLandscapeImages && imageSize > 200) ? 300 : imageSize
          
          // Calculate column widths - use firstImageSize for first column if provided
          const firstColSize = firstImageSize || imageSize
          const gapSize = gap !== undefined ? gap : (maxImageSize > 800 ? 24 : 16)
          
          // Determine grid template columns
          let gridTemplateColumns = ''
          
          if (columns === 1) {
            gridTemplateColumns = '1fr'
          } else if (maxImageSize <= 400) {
            // For small images, use fixed pixel widths
            // When center is true, use fixed widths to prevent wrapping
            if (center) {
              gridTemplateColumns = `repeat(${columns}, ${maxImageSize}px)`
            } else if (firstImageSize && columns === 2) {
              gridTemplateColumns = `minmax(0, ${firstColSize}px) minmax(0, ${imageSize}px)`
            } else {
              gridTemplateColumns = `repeat(${columns}, minmax(0, ${maxImageSize}px))`
            }
          } else {
            // For larger images (800px+), use flexible columns
            gridTemplateColumns = `repeat(${columns}, 1fr)`
          }
          
          // Calculate minimum width needed for all columns when center is true
          // On mobile, don't enforce minWidth to allow wrapping
          const minWidth = center && maxImageSize <= 400 
            ? `${columns * maxImageSize + (columns - 1) * gapSize}px`
            : 'auto'
          
          // Mobile-responsive: reduce columns on smaller screens
          // For 4+ columns, use 2 on mobile; for 6+ columns, use 3 on mobile
          const mobileColumns = columns >= 6 ? 3 : (columns >= 4 ? 2 : columns)
          const mobileImageSize = Math.min(maxImageSize, 120) // Cap at 120px on mobile
          
          return (
            <div 
              className={`grid gallery-container`} 
              style={{ 
                // Desktop: use original columns, Mobile: use reduced columns via CSS
                gridTemplateColumns: gridTemplateColumns,
                gap: `${gapSize}px`,
                columnGap: `${gapSize}px`,
                rowGap: `${gapSize}px`,
                width: '100%',
                maxWidth: center ? minWidth : '100%',
                alignItems: 'start',
                justifyItems: center ? 'center' : 'start',
                display: 'grid',
                boxSizing: 'border-box',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                margin: center ? '0 auto' : '0',
                gridAutoFlow: 'row',
                gridAutoRows: 'auto'
              }}
              data-columns={columns}
              data-mobile-columns={mobileColumns}
              data-image-size={maxImageSize}
              data-mobile-image-size={mobileImageSize}
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
                  className="relative cursor-red-dot hover:opacity-80 transition-opacity"
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
                    (() => {
                      // Determine the size for this image: 300px for landscape (unless imageSize is 200px or less), otherwise use imageSize
                      const isLandscapeImage = isLandscape(galleryItem)
                      // If imageSize is 200px or less, use it even for landscape images
                      const currentImageSize = (isLandscapeImage && imageSize > 200) ? 300 : (index === 0 && firstImageSize ? firstImageSize : imageSize)
                      const needsRotation = rotateImageIndex !== undefined && index === rotateImageIndex
                      
                      // Get image dimensions for rotation calculation
                      const imgWidth = galleryItem?.asset?.metadata?.dimensions?.width || currentImageSize
                      const imgHeight = galleryItem?.asset?.metadata?.dimensions?.height || currentImageSize
                      
                      // Calculate dimensions after rotation
                      const rotatedWidth = needsRotation ? imgHeight * (currentImageSize / imgWidth) : currentImageSize
                      const rotatedHeight = needsRotation ? imgWidth * (currentImageSize / imgHeight) : currentImageSize
                      
                      return (
                        <div 
                          className="relative" 
                          style={{ 
                            width: '100%',
                            maxWidth: needsRotation ? `${rotatedHeight}px` : `${currentImageSize}px`,
                            height: needsRotation ? `${rotatedWidth}px` : 'auto',
                            minHeight: !needsRotation && currentImageSize > 800 ? `${currentImageSize * 0.6}px` : (needsRotation ? `${rotatedWidth}px` : 'auto'),
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            overflow: 'visible'
                          }}
                        >
                          <div style={{
                            transform: needsRotation ? 'rotate(-270deg)' : 'none',
                            transformOrigin: 'center center',
                            width: '100%',
                            maxWidth: needsRotation ? `${rotatedHeight}px` : `${currentImageSize}px`,
                            height: needsRotation ? `${rotatedWidth}px` : 'auto'
                          }}>
                            <Image
                              src={mediaUrl}
                              alt={`${title || 'Gallery'} image ${index + 1}`}
                              width={needsRotation ? imgHeight : currentImageSize}
                              height={needsRotation ? imgWidth : currentImageSize}
                              className="h-auto"
                              style={{
                                width: '100%',
                                maxWidth: needsRotation ? `${rotatedHeight}px` : `${currentImageSize}px`,
                                height: 'auto',
                                objectFit: 'contain',
                                display: 'block'
                              }}
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          </div>
                        </div>
                      )
                    })()
                  )}
                </div>
              )
            } catch (error) {
              console.error('Error rendering gallery item:', error)
              return null
            }
          })}
            </div>
          )
        })()
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

