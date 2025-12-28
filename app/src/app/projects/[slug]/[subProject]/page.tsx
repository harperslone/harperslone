import {client} from '@/lib/sanity/client'
import {projectBySlugQuery, projectsQuery} from '@/lib/sanity/queries'
import {notFound} from 'next/navigation'
import Navigation from '@/components/Navigation'
import SidebarNavigation from '@/components/SidebarNavigation'
import GalleryLightbox from '@/components/GalleryLightbox'
import GalleryDebug from '@/components/GalleryDebug'
import AutoPlayVideo from '@/components/AutoPlayVideo'
import {urlFor} from '@/lib/sanity/image'

interface SubProject {
  _key: string
  pv?: string
  title?: string
  description?: string
  image?: any
  gallery?: any[]
}

interface Project {
  _id: string
  title: string
  slug: {
    current: string
  }
  subProjects?: SubProject[]
}

// Helper function to create a slug from a title
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
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
    return item.asset?.url || null
  }
  return urlFor(item)?.url() || null
}

async function getProject(slug: string) {
  try {
    const project = await client.fetch<Project>(projectBySlugQuery, {slug})
    return project
  } catch (error) {
    console.error('Error fetching project:', error)
    return null
  }
}

async function getAllProjects() {
  try {
    const projects = await client.fetch<Project[]>(projectsQuery)
    return projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

export default async function SubProjectPage({
  params,
}: {
  params: Promise<{slug: string; subProject: string}>
}) {
  const {slug, subProject} = await params
  const project = await getProject(slug)
  const allProjects = await getAllProjects()

  if (!project || !project.subProjects) {
    notFound()
  }

  // Find the sub-project by matching the slug
  const foundSubProject = project.subProjects.find((sp) => {
    const subProjectSlug = createSlug(sp.title || sp.pv || '')
    return subProjectSlug === subProject || 
           sp.title?.toLowerCase() === subProject.toLowerCase() ||
           sp.pv?.toLowerCase() === subProject.toLowerCase()
  })

  if (!foundSubProject) {
    notFound()
  }

  // Check if this is the Tokyo sub-project
  const isTokyo = foundSubProject.title?.toLowerCase() === 'tokyo' || 
                  foundSubProject.pv?.toLowerCase() === 'tokyo' ||
                  subProject.toLowerCase() === 'tokyo'
  
  // Check if this is The Parisian Vintage sub-project
  const isParisianVintage = foundSubProject.title?.toLowerCase() === 'the parisian vintage' || 
                            foundSubProject.pv?.toLowerCase() === 'the parisian vintage' ||
                            foundSubProject.title?.toLowerCase().includes('parisian vintage') ||
                            foundSubProject.pv?.toLowerCase().includes('parisian vintage')
  
  // Check if this is the 0fr sub-project
  const is0fr = foundSubProject.title?.toLowerCase() === '0fr' || 
                foundSubProject.pv?.toLowerCase() === '0fr' ||
                subProject.toLowerCase() === '0fr'
  
  // Debug log
  if (foundSubProject.title?.toLowerCase() === '0fr' || foundSubProject.pv?.toLowerCase() === '0fr') {
    console.log('0fr sub-project detected:', { 
      title: foundSubProject.title, 
      pv: foundSubProject.pv, 
      subProject, 
      is0fr,
      galleryLength: foundSubProject.gallery?.length 
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <Navigation />
      
      <div className="relative z-10 flex w-full flex-1">
        {/* Left Sidebar - Navigation with Expandable Items */}
        <SidebarNavigation projects={allProjects} />

        {/* Main Content Area */}
        <main className="flex-1 relative z-10 p-8 md:p-12">
          <div className={isTokyo ? "max-w-full" : "max-w-7xl"}>
            {/* Right Graphic Design */}
            {foundSubProject.image && (
              <div className="mb-8 flex justify-center">
                <GalleryLightbox 
                  images={[foundSubProject.image]} 
                  title={foundSubProject.title || 'Gallery'}
                  columns={1}
                  imageSize={800}
                />
              </div>
            )}
            
            {/* Description - Special layout for 0fr, otherwise default */}
            {foundSubProject.description && !is0fr && (
              <div 
                className="mb-8 text-black font-normal lowercase text-90s"
                style={{ 
                  fontSize: '13px',
                  lineHeight: '1.85',
                  letterSpacing: '0.2px',
                  textAlign: 'left'
                }}
              >
                {foundSubProject.description.split('\n').map((line: string, index: number) => {
                  // Handle bold text with ** markers
                  const parts = line.split(/(\*\*.*?\*\*)/g)
                  return (
                    <div key={index} className="mb-2">
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
            
            {/* Gallery */}
            {foundSubProject.gallery && Array.isArray(foundSubProject.gallery) && foundSubProject.gallery.length > 0 && (
              <>
                <GalleryDebug items={foundSubProject.gallery} />
                
                {/* Special layout for 0fr - 2x1 gallery with description on the side */}
                {is0fr && foundSubProject.gallery.length >= 2 && (
                  <div className="mb-8 grid grid-cols-3 gap-12 max-w-6xl">
                    {/* Images in 2x1 gallery - takes 2 columns */}
                    <div className="col-span-2">
                      <GalleryLightbox 
                        images={foundSubProject.gallery.slice(0, 2)} 
                        title={foundSubProject.title || 'Gallery'}
                        columns={2}
                        imageSize={400}
                      />
                    </div>
                    
                    {/* Description area - takes 1 column */}
                    <div className="text-black font-normal lowercase text-90s" style={{ 
                      fontSize: '13px',
                      lineHeight: '1.4',
                      letterSpacing: '0.1px',
                      textAlign: 'left'
                    }}>
                      {foundSubProject.description ? (
                        foundSubProject.description.split('\n').map((line: string, index: number) => {
                          // Handle bold text with ** markers
                          const parts = line.split(/(\*\*.*?\*\*)/g)
                          return (
                            <div key={index} className="mb-1">
                              {parts.map((part, partIndex) => {
                                if (part.startsWith('**') && part.endsWith('**')) {
                                  return <strong key={partIndex}>{part.slice(2, -2)}</strong>
                                }
                                return <span key={partIndex}>{part}</span>
                              })}
                            </div>
                          )
                        })
                      ) : (
                        <div>Add description text here</div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Second gallery for 0fr - 3 images side by side with description on the right */}
                {is0fr && foundSubProject.gallery && (
                  <div className="mb-8 grid grid-cols-4 gap-12 max-w-6xl">
                    {(() => {
                      // Find images by specific filenames
                      const targetFilenames = [
                        'Document_2025-09-20_171936.JPG',
                        '2025-09-21_225111.JPG',
                        '2025-09-21_225010.JPG'
                      ]
                      
                      const secondGalleryImages = targetFilenames
                        .map(filename => {
                          return foundSubProject.gallery?.find((item: any) => {
                            const originalFilename = item.asset?.originalFilename || ''
                            return originalFilename === filename || originalFilename.endsWith(filename)
                          })
                        })
                        .filter((item: any) => item !== undefined)
                      
                      if (secondGalleryImages.length === 0) return null
                      
                      return (
                        <>
                          {/* Images in 3x1 gallery - takes 3 columns */}
                          <div className="col-span-3">
                            <GalleryLightbox 
                              images={secondGalleryImages} 
                              title={foundSubProject.title || 'Gallery'}
                              columns={3}
                              imageSize={400}
                            />
                          </div>
                          
                          {/* Description area - takes 1 column */}
                          <div className="text-black font-normal lowercase text-90s" style={{ 
                            fontSize: '13px',
                            lineHeight: '1.4',
                            letterSpacing: '0.1px',
                            textAlign: 'left'
                          }}>
                            <div>exhibition poster designs and retail graphics</div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                )}
                
                {/* Main Gallery - 5x3 grid for The Parisian Vintage, otherwise first image at 800x800, then portrait gallery 5x1 */}
                {!is0fr && (
                <div className="mb-8">
                  {(() => {
                    if (isParisianVintage) {
                      // For The Parisian Vintage, show all images in a 5x3 grid (15 images)
                      // Exclude the special images (tomato tie, blue bag, alaia in the atelier)
                      const specialFilenames = [
                        'img20250422_11141080.jpg',
                        'img20250422_11175977.jpg',
                        'img20250422_11143742.jpg'
                      ]
                      
                      const allImages = foundSubProject.gallery.filter((item: any) => {
                        if (!item || !item.asset) return false
                        
                        // Check if it's a video - exclude videos from image gallery
                        const mimeType = item.asset?.mimeType || ''
                        const url = item.asset?.url || ''
                        const isVideo = mimeType.startsWith('video/') || url.match(/\.(mp4|mov|webm|avi|wmv|flv|mkv|m4v|3gp|mpg|mpeg)$/i)
                        if (isVideo) return false
                        
                        // Check if it's an image with valid URL
                        const imageUrl = urlFor(item)?.url()
                        if (!imageUrl) return false
                        
                        // Exclude special images by filename
                        const originalFilename = item.asset?.originalFilename || ''
                        const isSpecial = specialFilenames.some(filename => 
                          originalFilename === filename || originalFilename.endsWith(filename)
                        )
                        
                        // Exclude cherry blossom image (keep it only in solo gallery)
                        const isCherryBlossom = originalFilename === 'BC4A3E71-C7EF-4CB9-89F2-08A2C1BF4CEF.JPG' || originalFilename.endsWith('BC4A3E71-C7EF-4CB9-89F2-08A2C1BF4CEF.JPG')
                        
                        return !isSpecial && !isCherryBlossom
                      })
                      
                      if (allImages.length === 0) return null
                      
                      return (
                        <GalleryLightbox 
                          images={allImages} 
                          title={foundSubProject.title || 'Gallery'}
                          columns={5}
                          imageSize={400}
                        />
                      )
                    }
                    
                    // Default layout for other sub-projects
                    // Exclude cherry blossom image (keep it only in solo gallery)
                    const cherryBlossomFilename = 'BC4A3E71-C7EF-4CB9-89F2-08A2C1BF4CEF.JPG'
                    const filteredGallery = foundSubProject.gallery.filter((item: any) => {
                      if (!item || !item.asset) return false
                      const originalFilename = item.asset?.originalFilename || ''
                      const isCherryBlossom = originalFilename === cherryBlossomFilename || originalFilename.endsWith(cherryBlossomFilename)
                      return !isCherryBlossom
                    })
                    
                    const galleryImages = filteredGallery.length >= 22 
                      ? filteredGallery.slice(0, 19) 
                      : filteredGallery
                    
                    if (galleryImages.length === 0) return null
                    
                    // Always show first image at 800x800 with lightbox
                    const firstImage = galleryImages[0]
                    const hasMiddleGallery = galleryImages.length > 1
                    const middleGalleryImages = hasMiddleGallery ? galleryImages.slice(1, 6).filter((item: any) => {
                      const url = urlFor(item)?.url()
                      return url !== null && url !== undefined
                    }) : []
                    
                    return (
                      <>
                        {/* First image at 800x800 with lightbox */}
                        {firstImage && (
                          <div className={`flex justify-center ${isTokyo ? 'mb-16' : 'mb-8'}`}>
                            <GalleryLightbox 
                              images={[firstImage]} 
                              title={foundSubProject.title || 'Gallery'}
                              columns={1}
                              imageSize={800}
                            />
                          </div>
                        )}
                        
                        {/* Portrait images gallery - 5x1 underneath (images 2-6) - FIRST 5x1 GALLERY */}
                        {middleGalleryImages.length > 0 && (
                          <div className={isTokyo ? "mt-16 mb-16" : "mt-8 mb-8"}>
                            <GalleryLightbox 
                              images={middleGalleryImages} 
                              title={foundSubProject.title || 'Gallery'}
                              columns={5}
                              imageSize={400}
                            />
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
                )}
                
                {/* Special 3x1 Gallery for tomato tie, blue bag, and alaia in the atelier (for The Parisian Vintage) - appears underneath main gallery */}
                {isParisianVintage && foundSubProject.gallery && (
                  <div className="mt-8 mb-8">
                    {(() => {
                      // Find images by specific filenames
                      const targetFilenames = [
                        'img20250422_11141080.jpg',
                        'img20250422_11175977.jpg',
                        'img20250422_11143742.jpg'
                      ]
                      
                      const specialImages = targetFilenames
                        .map(filename => {
                          return foundSubProject.gallery?.find((item: any) => {
                            const originalFilename = item.asset?.originalFilename || ''
                            return originalFilename === filename || originalFilename.endsWith(filename)
                          })
                        })
                        .filter((item: any) => item !== undefined)
                      
                      if (specialImages.length === 0) return null
                      
                      return (
                        <GalleryLightbox 
                          images={specialImages} 
                          title={foundSubProject.title || 'Gallery'}
                          columns={3}
                          imageSize={400}
                        />
                      )
                    })()}
                  </div>
                )}
                
                {/* Video gallery for The Parisian Vintage - appears as last gallery, muted */}
                {isParisianVintage && foundSubProject.gallery && (
                  <div className="mt-8 mb-8">
                    {(() => {
                      // Find video files in the gallery
                      const videoItems = foundSubProject.gallery.filter((item: any) => {
                        if (!item) return false
                        const mimeType = item.asset?.mimeType || ''
                        const url = item.asset?.url || ''
                        
                        // Check for video file types
                        if (mimeType.startsWith('video/')) return true
                        if (url.match(/\.(mp4|mov|webm|avi|wmv|flv|mkv|m4v|3gp|mpg|mpeg)$/i)) return true
                        
                        return false
                      })
                      
                      if (videoItems.length === 0) return null
                      
                      return (
                        <div className="w-full max-w-4xl">
                          {videoItems.map((item: any, index: number) => {
                            const videoUrl = item.asset?.url
                            if (!videoUrl) return null
                            
                            return (
                              <div key={`video-${index}-${item._key || index}`} className="w-full mb-8">
                                <AutoPlayVideo
                                  src={videoUrl}
                                  className="w-full h-auto"
                                  style={{ maxHeight: '80vh' }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                {/* Second 5x1 Gallery - Images 7-11 (skip for The Parisian Vintage and 0fr) */}
                {!isParisianVintage && !is0fr && foundSubProject.gallery && foundSubProject.gallery.length >= 11 && (
                  <div className={isTokyo ? "mt-16 mb-16" : "mt-8 mb-8"}>
                    <GalleryLightbox 
                      images={foundSubProject.gallery.slice(6, 11)} 
                      title={foundSubProject.title || 'Gallery'}
                      columns={5}
                      imageSize={400}
                    />
                  </div>
                )}
                
                {/* Third 5x1 Gallery - Specific images by filename (skip for The Parisian Vintage and 0fr) */}
                {!isParisianVintage && !is0fr && foundSubProject.gallery && foundSubProject.gallery.length >= 5 && (
                  <div className={isTokyo ? "mt-16 mb-16" : "mt-8 mb-8"}>
                    {(() => {
                      // Find the specific images by their originalFilename
                      const targetFilenames = [
                        '000000460027.tif',
                        '000000460035.tif',
                        '000000470009.tif',
                        '000000470019.tif',
                        '000000470008.tif'
                      ]
                      
                      const thirdGalleryImages = targetFilenames
                        .map(filename => {
                          return foundSubProject.gallery?.find((item: any) => {
                            const originalFilename = item.asset?.originalFilename || ''
                            return originalFilename === filename || originalFilename.endsWith(filename)
                          })
                        })
                        .filter((item: any) => item !== undefined)
                      
                      console.log('Third 5x1 Gallery - Found images:', thirdGalleryImages.map((img: any) => img?.asset?.originalFilename || img?.asset?._id))
                      
                      if (thirdGalleryImages.length === 0) return null
                      
                      return (
                        <GalleryLightbox 
                          images={thirdGalleryImages} 
                          title={foundSubProject.title || 'Gallery'}
                          columns={5}
                          imageSize={400}
                        />
                      )
                    })()}
                  </div>
                )}
                
                {/* 7x1 Gallery - Original 7 Images with Lightbox (skip for The Parisian Vintage and 0fr) */}
                {!isParisianVintage && !is0fr && foundSubProject.gallery && Array.isArray(foundSubProject.gallery) && foundSubProject.gallery.length >= 7 && (
                  <div className={isTokyo ? "mt-16 mb-16" : "mt-8 mb-8"}>
                    {(() => {
                      // Find the original 7 images by their filenames
                      const targetFilenames = [
                        'IMG_8341.JPG',
                        'IMG_8338.JPG',
                        'IMG_8336.JPG',
                        'IMG_8315.JPG',
                        'IMG_8320.JPG',
                        'IMG_8337.JPG',
                        'IMG_8335 2.JPG'
                      ]
                      
                      const original7Images = targetFilenames
                        .map(filename => {
                          return foundSubProject.gallery?.find((item: any) => {
                            const originalFilename = item.asset?.originalFilename || ''
                            return originalFilename === filename || originalFilename.endsWith(filename)
                          })
                        })
                        .filter((item: any) => item !== undefined)
                      
                      console.log('7x1 Gallery - Original 7 images:', original7Images.map((img: any) => img?.asset?.originalFilename || img?.asset?._id))
                      
                      if (original7Images.length === 0) return null
                      
                      return (
                        <GalleryLightbox 
                          images={original7Images} 
                          title={foundSubProject.title || 'Gallery'}
                          columns={7}
                          imageSize={250}
                        />
                      )
                    })()}
                  </div>
                )}
                
                {/* Tokyo 3x2 Gallery - Last gallery for Tokyo sub-project */}
                {isTokyo && foundSubProject.gallery && (
                  <div className="mt-16 mb-16">
                    {(() => {
                      // Find images by specific filenames
                      const targetFilenames = [
                        '000000430033.tif',
                        '000000430018.tif',
                        '000000430011.tif',
                        '000000430005.tif',
                        '000000430017.tif',
                        '000000430003.tif'
                      ]
                      
                      const tokyoGalleryImages = targetFilenames
                        .map(filename => {
                          return foundSubProject.gallery?.find((item: any) => {
                            const originalFilename = item.asset?.originalFilename || ''
                            return originalFilename === filename || originalFilename.endsWith(filename)
                          })
                        })
                        .filter((item: any) => item !== undefined)
                      
                      if (tokyoGalleryImages.length === 0) return null
                      
                      return (
                        <GalleryLightbox 
                          images={tokyoGalleryImages} 
                          title={foundSubProject.title || 'Gallery'}
                          columns={3}
                          imageSize={400}
                        />
                      )
                    })()}
                  </div>
                )}
                
                {/* 6x1 Gallery - Last gallery with specific images */}
                {foundSubProject.gallery && Array.isArray(foundSubProject.gallery) && (
                  <div className={isTokyo ? "mt-16 mb-16" : "mt-8 mb-8"}>
                    {(() => {
                      // Find images by specific filenames
                      const targetFilenames = [
                        '000000450029.tif',
                        '000000450026.tif',
                        '000000450011.tif',
                        '000000450009.tif',
                        '000000450005.tif',
                        '000000450022.tif'
                      ]
                      
                      const gallery6x1Images = targetFilenames
                        .map(filename => {
                          return foundSubProject.gallery?.find((item: any) => {
                            const originalFilename = item.asset?.originalFilename || ''
                            return originalFilename === filename || originalFilename.endsWith(filename)
                          })
                        })
                        .filter((item: any) => item !== undefined)
                      
                      if (gallery6x1Images.length === 0) return null
                      
                      return (
                        <GalleryLightbox 
                          images={gallery6x1Images} 
                          title={foundSubProject.title || 'Gallery'}
                          columns={6}
                          imageSize={400}
                        />
                      )
                    })()}
                  </div>
                )}
                
                {/* Final image with description - at the end of all galleries */}
                {foundSubProject.gallery && Array.isArray(foundSubProject.gallery) && (
                  <div className={isTokyo ? "mt-16 mb-8" : "mt-8 mb-8"}>
                    {(() => {
                      // Find the image by filename
                      const targetFilename = 'BC4A3E71-C7EF-4CB9-89F2-08A2C1BF4CEF.JPG'
                      
                      const finalImage = foundSubProject.gallery?.find((item: any) => {
                        const originalFilename = item.asset?.originalFilename || ''
                        return originalFilename === targetFilename || originalFilename.endsWith(targetFilename)
                      })
                      
                      if (!finalImage) return null
                      
                      return (
                        <div className="grid grid-cols-2 gap-12 max-w-4xl">
                          {/* Text description on the left */}
                          <div className="text-black font-normal lowercase text-90s" style={{ 
                            fontSize: '13px',
                            lineHeight: '1.4',
                            letterSpacing: '0.1px',
                            textAlign: 'left'
                          }}>
                            <div>Add description text here</div>
                          </div>
                          
                          {/* Small image on the right */}
                          <div className="flex justify-end">
                            <GalleryLightbox 
                              images={[finalImage]} 
                              title={foundSubProject.title || 'Gallery'}
                              columns={1}
                              imageSize={200}
                            />
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                {/* 2x3 and 3x3 Galleries side by side */}
                {foundSubProject.gallery && Array.isArray(foundSubProject.gallery) && (
                  <div className={isTokyo ? "mt-16 mb-8" : "mt-8 mb-8"}>
                    {(() => {
                      // Find images for 2x3 gallery
                      const targetFilenames2x3 = [
                        '000000450019.tif',
                        '000000450017.tif',
                        '000000450013.tif',
                        '000000450012.tif',
                        '000000450014.tif',
                        '000000450015.tif'
                      ]
                      
                      const gallery2x3Images = targetFilenames2x3
                        .map(filename => {
                          return foundSubProject.gallery?.find((item: any) => {
                            const originalFilename = item.asset?.originalFilename || ''
                            return originalFilename === filename || originalFilename.endsWith(filename)
                          })
                        })
                        .filter((item: any) => item !== undefined)
                      
                      // Find images for 3x3 gallery
                      const targetFilenames3x3 = [
                        'IMG_7025.jpg',
                        'IMG_6996-2.jpg',
                        'IMG_7008.jpg',
                        'IMG_6999-2.jpg',
                        'IMG_6999-3.jpg',
                        'IMG_7002-2.jpg',
                        'IMG_7005.jpg',
                        'IMG_7003.jpg',
                        'IMG_7010-2.jpg'
                      ]
                      
                      const gallery3x3Images = targetFilenames3x3
                        .map(filename => {
                          return foundSubProject.gallery?.find((item: any) => {
                            const originalFilename = item.asset?.originalFilename || ''
                            return originalFilename === filename || originalFilename.endsWith(filename)
                          })
                        })
                        .filter((item: any) => item !== undefined)
                      
                      if (gallery2x3Images.length === 0 && gallery3x3Images.length === 0) return null
                      
                      return (
                        <div style={{ display: 'flex', gap: '16px', justifyContent: 'space-between', maxWidth: '100%' }}>
                          {/* 2x3 Gallery on the left */}
                          {gallery2x3Images.length > 0 && (
                            <div style={{ maxWidth: '416px' }}>
                              <GalleryLightbox 
                                images={gallery2x3Images} 
                                title={foundSubProject.title || 'Gallery'}
                                columns={2}
                                imageSize={200}
                              />
                            </div>
                          )}
                          
                          {/* 3x3 Gallery on the right */}
                          {gallery3x3Images.length > 0 && (
                            <div style={{ maxWidth: '632px', marginLeft: 'auto' }}>
                              <GalleryLightbox 
                                images={gallery3x3Images} 
                                title={foundSubProject.title || 'Gallery'}
                                columns={3}
                                imageSize={200}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                {/* Two images side by side underneath 3x3 gallery - aligned right */}
                {foundSubProject.gallery && Array.isArray(foundSubProject.gallery) && (
                  <div className={isTokyo ? "mt-8 mb-8" : "mt-8 mb-8"}>
                    {(() => {
                      // Find images by specific filenames
                      const targetFilenames = [
                        'IMG_7013.jpg',
                        'IMG_7020.jpg'
                      ]
                      
                      const sideBySideImages = targetFilenames
                        .map(filename => {
                          return foundSubProject.gallery?.find((item: any) => {
                            const originalFilename = item.asset?.originalFilename || ''
                            return originalFilename === filename || originalFilename.endsWith(filename)
                          })
                        })
                        .filter((item: any) => item !== undefined)
                      
                      if (sideBySideImages.length === 0) return null
                      
                      return (
                        <div style={{ maxWidth: '816px', marginLeft: 'auto', marginRight: '0' }}>
                          <GalleryLightbox 
                            images={sideBySideImages} 
                            title={foundSubProject.title || 'Gallery'}
                            columns={2}
                            imageSize={400}
                          />
                        </div>
                      )
                    })()}
                  </div>
                )}
                
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

