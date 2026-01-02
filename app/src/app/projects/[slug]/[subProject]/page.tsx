import {client} from '@/lib/sanity/client'
import {projectBySlugQuery, projectsQuery} from '@/lib/sanity/queries'
import {notFound} from 'next/navigation'
import Navigation from '@/components/Navigation'
import SidebarNavigation from '@/components/SidebarNavigation'
import GalleryLightbox from '@/components/GalleryLightbox'
import GalleryDebug from '@/components/GalleryDebug'
import AutoPlayVideo from '@/components/AutoPlayVideo'
import SequentialGallery from '@/components/SequentialGallery'
import {urlFor} from '@/lib/sanity/image'
import Image from 'next/image'

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
    // .mov files are video files (even if mimeType is video/quicktime)
    if (url.match(/\.(mp4|mov|webm|avi|wmv|flv|mkv|m4v|3gp|mpg|mpeg)$/i)) {
      // Double-check it's not actually audio
      if (!isAudio(item)) return true
    }
    if (mimeType.startsWith('video/')) return true
    // .mov files with video/quicktime mimeType are video files
    if (mimeType === 'video/quicktime' && url.match(/\.mov$/i)) return true
  }
  
  // Check mimeType in asset (includes video/quicktime for .mov)
  if (mimeType.startsWith('video/')) return true
  // .mov files with video/quicktime mimeType are video files
  if (mimeType === 'video/quicktime' && url.match(/\.mov$/i)) return true
  
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
  // Decode the subProject parameter in case it's URL-encoded
  const decodedSubProject = decodeURIComponent(subProject)
  const foundSubProject = project.subProjects.find((sp) => {
    const subProjectSlug = createSlug(sp.title || sp.pv || '')
    // Check exact title match first (for Japanese characters) - try both encoded and decoded
    const exactTitleMatch = sp.title === decodedSubProject || sp.pv === decodedSubProject ||
                            sp.title === subProject || sp.pv === subProject
    // Then check slug match (both encoded and decoded)
    const slugMatch = subProjectSlug === subProject || subProjectSlug === decodedSubProject
    // Then check case-insensitive title match
    const titleMatch = sp.title?.toLowerCase() === decodedSubProject.toLowerCase() ||
                       sp.pv?.toLowerCase() === decodedSubProject.toLowerCase() ||
                       sp.title?.toLowerCase() === subProject.toLowerCase() ||
                       sp.pv?.toLowerCase() === subProject.toLowerCase()
    return exactTitleMatch || slugMatch || titleMatch
  })

  if (!foundSubProject) {
    notFound()
  }
  
  // Debug: Log all subproject data to help identify Tokyo Harper
  console.log('Subproject data:', {
    title: foundSubProject.title,
    pv: foundSubProject.pv,
    subProjectSlug: subProject,
    galleryLength: foundSubProject.gallery?.length
  })

  // Check if this is the Tokyo sub-project
  const isTokyo = foundSubProject.title?.toLowerCase() === 'tokyo' || 
                  foundSubProject.pv?.toLowerCase() === 'tokyo' ||
                  subProject.toLowerCase() === 'tokyo'
  
  // Check if this is The Parisian Vintage sub-project
  const isParisianVintage = foundSubProject.title?.toLowerCase() === 'the parisian vintage' || 
                            foundSubProject.pv?.toLowerCase() === 'the parisian vintage' ||
                            foundSubProject.title?.toLowerCase().includes('parisian vintage') ||
                            foundSubProject.pv?.toLowerCase().includes('parisian vintage') ||
                            subProject.toLowerCase().includes('parisian-vintage') ||
                            subProject.toLowerCase().includes('parisianvintage')
  
  // Debug: Log Parisian Vintage detection
  console.log('Parisian Vintage detection:', {
    isParisianVintage,
    title: foundSubProject.title,
    pv: foundSubProject.pv,
    subProjectSlug: subProject,
    titleMatch: foundSubProject.title?.toLowerCase() === 'the parisian vintage',
    pvMatch: foundSubProject.pv?.toLowerCase() === 'the parisian vintage',
    titleIncludes: foundSubProject.title?.toLowerCase().includes('parisian vintage'),
    pvIncludes: foundSubProject.pv?.toLowerCase().includes('parisian vintage')
  })
  
  // Check if this is image/styling sub-project
  const isLaMode = foundSubProject.title?.toLowerCase() === 'image/styling' || 
                   foundSubProject.pv?.toLowerCase() === 'image/styling' ||
                   foundSubProject.title?.toLowerCase() === 'la mode' || 
                   foundSubProject.pv?.toLowerCase() === 'la mode'
  
  // Check if this is the 0fr sub-project
  const is0fr = foundSubProject.title?.toLowerCase() === '0fr' || 
                foundSubProject.pv?.toLowerCase() === '0fr'
  const isBts = foundSubProject.title?.toLowerCase() === 'bts' || 
                foundSubProject.pv?.toLowerCase() === 'bts' ||
                subProject.toLowerCase() === 'bts'
  
  // Check if this is the les mots bleus sub-project
  const isLesMotsBleus = foundSubProject.title?.toLowerCase() === 'les mots bleus' || 
                         foundSubProject.pv?.toLowerCase() === 'les mots bleus' ||
                         foundSubProject.title?.toLowerCase().includes('les mots bleus') ||
                         foundSubProject.pv?.toLowerCase().includes('les mots bleus') ||
                         subProject.toLowerCase() === 'les-mots-bleus' ||
                         subProject.toLowerCase().includes('les-mots-bleus') ||
                         subProject.toLowerCase() === 'lesmotsbleus' ||
                         subProject.toLowerCase().includes('mots-bleus')
  
  // Check if this is the out of sight solo sub-project
  const isOutOfSightSolo = foundSubProject.title?.toLowerCase() === 'out of sight solo' || 
                           foundSubProject.pv?.toLowerCase() === 'out of sight solo' ||
                           foundSubProject.title?.toLowerCase().includes('out of sight solo') ||
                           foundSubProject.pv?.toLowerCase().includes('out of sight solo') ||
                           subProject.toLowerCase() === 'out-of-sight-solo' ||
                           subProject.toLowerCase().includes('out-of-sight-solo') ||
                           subProject.toLowerCase() === 'outofsightsolo' ||
                           subProject.toLowerCase().includes('out-of-sight')
  
  // Check if this is the blue sub-project
  const isBlue = foundSubProject.title?.toLowerCase() === 'blue' || 
                 foundSubProject.pv?.toLowerCase() === 'blue' ||
                 foundSubProject.title?.toLowerCase().includes('blue') ||
                 foundSubProject.pv?.toLowerCase().includes('blue') ||
                 subProject.toLowerCase() === 'blue'
  
  // Check if this is the 東京ハーパー (Tokyo Harper) sub-project
  // Check exact match first (Japanese characters don't need toLowerCase)
  const isTokyoHarper = foundSubProject.title === '東京ハーパー' || 
                        foundSubProject.pv === '東京ハーパー' ||
                        foundSubProject.title === '東京 ハーパー' ||
                        foundSubProject.pv === '東京 ハーパー' ||
                        (foundSubProject.title && foundSubProject.title.includes('東京ハーパー')) ||
                        (foundSubProject.pv && foundSubProject.pv.includes('東京ハーパー')) ||
                        (foundSubProject.title && foundSubProject.title.includes('東京 ハーパー')) ||
                        (foundSubProject.pv && foundSubProject.pv.includes('東京 ハーパー')) ||
                        foundSubProject.title?.toLowerCase() === 'tokyo harper' ||
                        foundSubProject.pv?.toLowerCase() === 'tokyo harper' ||
                        foundSubProject.title?.toLowerCase().includes('tokyo harper') ||
                        foundSubProject.pv?.toLowerCase().includes('tokyo harper') ||
                        subProject === '東京ハーパー' ||
                        subProject === '東京-ハーパー' ||
                        subProject.toLowerCase().includes('tokyo-harper') ||
                        subProject.toLowerCase().includes('tokyoharper') ||
                        (subProject.includes('東京') && subProject.toLowerCase().includes('harper'))
  
  // Debug log for les mots bleus
  if (isLesMotsBleus) {
    console.log('les mots bleus sub-project detected:', { 
      title: foundSubProject.title, 
      pv: foundSubProject.pv, 
      subProject, 
      isLesMotsBleus,
      galleryLength: foundSubProject.gallery?.length 
    })
  }
  
  // Debug log for out of sight solo
  if (isOutOfSightSolo) {
    console.log('out of sight solo sub-project detected:', { 
      title: foundSubProject.title, 
      pv: foundSubProject.pv, 
      subProject, 
      isOutOfSightSolo,
      galleryLength: foundSubProject.gallery?.length 
    })
  }
  
  // Debug log for blue
  if (isBlue) {
    console.log('blue sub-project detected:', { 
      title: foundSubProject.title, 
      pv: foundSubProject.pv, 
      subProject, 
      isBlue,
      galleryLength: foundSubProject.gallery?.length 
    })
  }
  
  // Debug log for 東京ハーパー
  if (isTokyoHarper) {
    console.log('東京ハーパー sub-project detected:', { 
      title: foundSubProject.title, 
      pv: foundSubProject.pv, 
      subProject, 
      isTokyoHarper,
      galleryLength: foundSubProject.gallery?.length 
    })
  }
  
  // Check if this is the le bal de debutantes sub-project
  const isLeBalDeDebutantes = foundSubProject.title?.toLowerCase() === 'le bal de debutantes' || 
                              foundSubProject.pv?.toLowerCase() === 'le bal de debutantes' ||
                              foundSubProject.title?.toLowerCase().includes('le bal de debutantes') ||
                              foundSubProject.pv?.toLowerCase().includes('le bal de debutantes') ||
                              foundSubProject.title?.toLowerCase().includes('bal de debutantes') ||
                              foundSubProject.pv?.toLowerCase().includes('bal de debutantes') ||
                              subProject.toLowerCase() === 'le-bal-de-debutantes' ||
                              subProject.toLowerCase().includes('le-bal-de-debutantes') ||
                              subProject.toLowerCase() === 'lebaldedebutantes' ||
                              subProject.toLowerCase().includes('bal-de-debutantes')
  
  // Check if this is the palette&formes sub-project (also matches "palette & forms")
  const isPaletteFormes = foundSubProject.title?.toLowerCase() === 'palette&formes' || 
                          foundSubProject.pv?.toLowerCase() === 'palette&formes' ||
                          foundSubProject.title?.toLowerCase() === 'palettes&formes' ||
                          foundSubProject.pv?.toLowerCase() === 'palettes&formes' ||
                          foundSubProject.title?.toLowerCase() === 'palette & forms' ||
                          foundSubProject.pv?.toLowerCase() === 'palette & forms' ||
                          foundSubProject.title?.toLowerCase() === 'palettes & forms' ||
                          foundSubProject.pv?.toLowerCase() === 'palettes & forms' ||
                          (foundSubProject.title?.toLowerCase().includes('palette') && (foundSubProject.title?.toLowerCase().includes('formes') || foundSubProject.title?.toLowerCase().includes('forms'))) ||
                          (foundSubProject.pv?.toLowerCase().includes('palette') && (foundSubProject.pv?.toLowerCase().includes('formes') || foundSubProject.pv?.toLowerCase().includes('forms'))) ||
                          subProject.toLowerCase() === 'palette-formes' ||
                          subProject.toLowerCase() === 'palettes-formes' ||
                          subProject.toLowerCase() === 'palette-forms' ||
                          subProject.toLowerCase() === 'palettes-forms' ||
                          (subProject.toLowerCase().includes('palette') && (subProject.toLowerCase().includes('formes') || subProject.toLowerCase().includes('forms')))
  
  // Check if this is the cote d'azur sub-project
  const isCoteDAzur = foundSubProject.title?.toLowerCase() === "cote d'azur" || 
                      foundSubProject.pv?.toLowerCase() === "cote d'azur" ||
                      foundSubProject.title?.toLowerCase().includes("cote d'azur") ||
                      foundSubProject.pv?.toLowerCase().includes("cote d'azur") ||
                      foundSubProject.title?.toLowerCase() === 'cote dazur' ||
                      foundSubProject.pv?.toLowerCase() === 'cote dazur' ||
                      subProject.toLowerCase() === "cote-d'azur" ||
                      subProject.toLowerCase() === 'cote-dazur' ||
                      subProject.toLowerCase().includes("cote-d'azur") ||
                      subProject.toLowerCase().includes('cote-dazur')
  
  // Check if this is the paris sub-project
  const isParis = foundSubProject.title?.toLowerCase() === 'paris' || 
                  foundSubProject.pv?.toLowerCase() === 'paris' ||
                  foundSubProject.title?.toLowerCase().includes('paris') ||
                  foundSubProject.pv?.toLowerCase().includes('paris') ||
                  subProject.toLowerCase() === 'paris'
  
  const isLosAngeles = foundSubProject.title?.toLowerCase() === 'los angeles' ||
                       foundSubProject.pv?.toLowerCase() === 'los angeles' ||
                       foundSubProject.title?.toLowerCase().includes('los angeles') ||
                       foundSubProject.pv?.toLowerCase().includes('los angeles') ||
                       subProject.toLowerCase() === 'los-angeles' ||
                       subProject.toLowerCase() === 'los angeles'
  
  // Check if this is the boutique romantique sub-project
  const isBoutiqueRomantique = foundSubProject.title?.toLowerCase() === 'boutique romantique' || 
                               foundSubProject.pv?.toLowerCase() === 'boutique romantique' ||
                               foundSubProject.title?.toLowerCase().includes('boutique romantique') ||
                               foundSubProject.pv?.toLowerCase().includes('boutique romantique') ||
                               subProject.toLowerCase() === 'boutique-romantique' ||
                               subProject.toLowerCase().includes('boutique-romantique')
  
  const isAnnk = foundSubProject.title?.toLowerCase() === 'annk' || 
                 foundSubProject.pv?.toLowerCase() === 'annk' ||
                 foundSubProject.title?.toLowerCase().includes('annk') ||
                 foundSubProject.pv?.toLowerCase().includes('annk') ||
                 subProject.toLowerCase() === 'annk'
  
  const isGrafikDesign = foundSubProject.title?.toLowerCase() === 'grafik(design)' || 
                         foundSubProject.pv?.toLowerCase() === 'grafik(design)' ||
                         foundSubProject.title?.toLowerCase().includes('grafik') ||
                         foundSubProject.pv?.toLowerCase().includes('grafik') ||
                         subProject.toLowerCase() === 'grafik(design)' ||
                         subProject.toLowerCase() === 'grafik-design'
  
  // Debug log for grafik(design)
  if (foundSubProject.title?.toLowerCase().includes('grafik') || foundSubProject.pv?.toLowerCase().includes('grafik') || subProject.toLowerCase().includes('grafik')) {
    console.log('Grafik(design) sub-project check:', { 
      title: foundSubProject.title, 
      pv: foundSubProject.pv, 
      subProject, 
      isGrafikDesign,
      galleryLength: foundSubProject.gallery?.length 
    })
  }
  
  // Debug log for annk
  if (foundSubProject.title?.toLowerCase().includes('annk') || foundSubProject.pv?.toLowerCase().includes('annk') || subProject.toLowerCase().includes('annk')) {
    console.log('Annk sub-project check:', { 
      title: foundSubProject.title, 
      pv: foundSubProject.pv, 
      subProject, 
      isAnnk,
      galleryLength: foundSubProject.gallery?.length 
    })
  }
  
  // Debug log for los angeles
  if (foundSubProject.title?.toLowerCase().includes('los') || foundSubProject.title?.toLowerCase().includes('angeles') || subProject.toLowerCase().includes('los') || subProject.toLowerCase().includes('angeles')) {
    console.log('Los Angeles sub-project check:', { 
      title: foundSubProject.title, 
      pv: foundSubProject.pv, 
      subProject, 
      isLosAngeles,
      galleryLength: foundSubProject.gallery?.length 
    })
  }
  
  // Debug log for palette&formes - always log for exhibitions to help debug
  if (isPaletteFormes || slug.toLowerCase() === 'exhibitions') {
    console.log('=== PALETTE&FORMES DEBUG ===')
    console.log('isPaletteFormes:', isPaletteFormes)
    console.log('Title:', foundSubProject.title)
    console.log('PV:', foundSubProject.pv)
    console.log('SubProject slug:', subProject)
    console.log('Project slug:', slug)
    console.log('Gallery length:', foundSubProject.gallery?.length)
    console.log('Will render SequentialGallery:', isPaletteFormes && slug.toLowerCase() === 'exhibitions' && foundSubProject.gallery && foundSubProject.gallery.length > 0)
    console.log('================================')
  }
  
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
  
  // Debug log for bts
  if (foundSubProject.title?.toLowerCase() === 'bts' || foundSubProject.pv?.toLowerCase() === 'bts' || subProject.toLowerCase() === 'bts') {
    console.log('bts sub-project detected:', { 
      title: foundSubProject.title, 
      pv: foundSubProject.pv, 
      subProject, 
      isBts,
      galleryLength: foundSubProject.gallery?.length,
      gallery: foundSubProject.gallery
    })
  }

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <Navigation />
      
      <div className="relative z-10 flex w-full flex-1">
        {/* Left Sidebar - Navigation with Expandable Items */}
        <SidebarNavigation projects={allProjects} />

        {/* Main Content Area */}
        <main className="flex-1 relative z-10 p-4 md:p-8 lg:p-12">
          <div className={isTokyo ? "max-w-full" : "max-w-7xl"} style={{ width: '100%', overflowX: 'hidden' }}>
            {/* Right Graphic Design - skip for cote d'azur, paris, los angeles, annk, and la mode */}
            {!isCoteDAzur && !isParis && !isLosAngeles && !isAnnk && !isLaMode && !isParisianVintage && foundSubProject.image && (
              <div className="mb-8 flex justify-center">
                <GalleryLightbox 
                  images={[foundSubProject.image]} 
                  title={foundSubProject.title || 'Gallery'}
                  columns={1}
                  imageSize={800}
                />
              </div>
            )}
            
            {/* Special layout for bts - Description + Sequential Gallery */}
            {isBts && (
              <>
                {/* First Description for bts (title + n°1) */}
                {foundSubProject.description && (
                  <div 
                    className="mb-8 text-black font-normal lowercase text-90s"
                    style={{ 
                      fontSize: '13px',
                      lineHeight: '1.85',
                      letterSpacing: '0.2px',
                      textAlign: 'left'
                    }}
                  >
                    {(() => {
                      // Split by double newlines to separate sections
                      const sections = foundSubProject.description.split('\n\n')
                      // Take first two sections (title + n°1)
                      const firstSections = sections.slice(0, 2)
                      return firstSections.map((section: string, sectionIndex: number) => (
                        <div key={sectionIndex} className="mb-2">
                          {section.split('\n').map((line: string, lineIndex: number) => (
                            <div key={lineIndex}>{line}</div>
                          ))}
                        </div>
                      ))
                    })()}
                  </div>
                )}
                
                {/* First Sequential Gallery for bts - first 12 images */}
                {foundSubProject.gallery && foundSubProject.gallery.length > 0 && (
                  <div className="mb-8 w-full">
                    <SequentialGallery 
                      images={foundSubProject.gallery.slice(0, 12)} 
                      customMaxWidth={500}
                      hideCaptions={true}
                    />
                  </div>
                )}
                
                {/* Second Description for bts (n°2) */}
                {foundSubProject.description && (
                  <div 
                    className="mb-8 text-black font-normal lowercase text-90s"
                    style={{ 
                      fontSize: '13px',
                      lineHeight: '1.85',
                      letterSpacing: '0.2px',
                      textAlign: 'left'
                    }}
                  >
                    {(() => {
                      // Split by double newlines to separate sections
                      const sections = foundSubProject.description.split('\n\n')
                      // Take remaining sections (n°2, etc.)
                      const remainingSections = sections.slice(2)
                      if (remainingSections.length === 0) return null
                      return remainingSections.map((section: string, sectionIndex: number) => (
                        <div key={sectionIndex} className="mb-2">
                          {section.split('\n').map((line: string, lineIndex: number) => (
                            <div key={lineIndex}>{line}</div>
                          ))}
                        </div>
                      ))
                    })()}
                  </div>
                )}
                
                {/* Second Sequential Gallery for bts - last 13 images */}
                {foundSubProject.gallery && foundSubProject.gallery.length > 12 && (
                  <div className="mb-8 w-full">
                    <SequentialGallery 
                      images={foundSubProject.gallery.slice(-13)} 
                      customMaxWidth={500}
                      hideCaptions={true}
                    />
                  </div>
                )}
              </>
            )}
            
            {/* Non-bts content */}
            {!isBts && (
              <>
                {/* Description - Special layout for 0fr, otherwise default - skip for sequential galleries */}
                {/* Show description for palette&formes separately (exhibitions and print) */}
                {foundSubProject.description && isPaletteFormes && (slug.toLowerCase() === 'exhibitions' || slug.toLowerCase() === 'print') && (
                  <div 
                    className="mb-8 text-black font-normal lowercase text-90s"
                    style={{ 
                      fontSize: '13px',
                      lineHeight: '1.4',
                      letterSpacing: '0.2px',
                      textAlign: 'left'
                    }}
                  >
                    {foundSubProject.description.split('\n').map((line: string, index: number) => {
                      // Handle bold text with ** markers
                      const isFirstLine = index === 0
                      const parts = line.split(/(\*\*.*?\*\*)/g)
                      return (
                        <div key={index} style={{ marginBottom: isFirstLine ? '12px' : '1px', lineHeight: isFirstLine ? '1.4' : '1.2' }}>
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
                {foundSubProject.description && !is0fr && !isOutOfSightSolo && !isBlue && !isTokyoHarper && !isLeBalDeDebutantes && !isPaletteFormes && !isLaMode && !isParisianVintage && !(isLesMotsBleus && slug.toLowerCase() === 'print') && (
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
                
              </>
            )}
            
            {/* Gallery - for non-bts projects, but The Parisian Vintage, grafik(design), and image/styling have their own sections below */}
            {!isBts && !isParisianVintage && !isGrafikDesign && !isLaMode && foundSubProject.gallery && Array.isArray(foundSubProject.gallery) && foundSubProject.gallery.length > 0 && (
              <>
                {isCoteDAzur ? (
                  foundSubProject.gallery && foundSubProject.gallery.length >= 16 && (
                    <div className="mb-8 w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <div style={{ width: 'fit-content', display: 'flex', justifyContent: 'center' }}>
                        <GalleryLightbox 
                          images={foundSubProject.gallery.slice(0, 16)} 
                          title={foundSubProject.title || 'Gallery'}
                          columns={4}
                          imageSize={200}
                        />
                      </div>
                    </div>
                  )
                ) : isParis ? (
                  <>
                    {/* 2x1 Gallery for paris */}
                    {foundSubProject.gallery && foundSubProject.gallery.length >= 2 && (
                      <div className="mb-8 w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ width: 'fit-content', display: 'flex', justifyContent: 'center' }}>
                          <GalleryLightbox 
                            images={foundSubProject.gallery.slice(0, 2)} 
                            title={foundSubProject.title || 'Gallery'}
                            columns={2}
                            imageSize={400}
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* 4x1 Gallery for paris - underneath the 2x1 gallery */}
                    {foundSubProject.gallery && foundSubProject.gallery.length >= 6 && (
                      <div className="mb-8 w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ width: 'fit-content', display: 'flex', justifyContent: 'center' }}>
                          <GalleryLightbox 
                            images={foundSubProject.gallery.slice(2, 6)} 
                            title={foundSubProject.title || 'Gallery'}
                            columns={4}
                            imageSize={200}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : isLosAngeles ? (
                  <>
                    {/* 6x2 Gallery for los angeles - up to 12 images */}
                    {foundSubProject.gallery && foundSubProject.gallery.length > 0 && (
                      <div className="mb-8 w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ width: 'fit-content', display: 'flex', justifyContent: 'center' }}>
                          <GalleryLightbox 
                            images={foundSubProject.gallery.slice(0, Math.min(12, foundSubProject.gallery.length))} 
                            title={foundSubProject.title || 'Gallery'}
                            columns={6}
                            imageSize={200}
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : isAnnk ? (
                  <>
                    {/* 4x1 Gallery for annk - up to 4 images (excluding videos) */}
                    {foundSubProject.gallery && foundSubProject.gallery.length > 0 && (() => {
                      // Filter out videos, keep only images
                      const imageItems = foundSubProject.gallery.filter((item: any) => !isVideo(item))
                      
                      if (imageItems.length > 0) {
                        return (
                          <div className="mb-8 w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                            <div style={{ width: 'fit-content', display: 'flex', justifyContent: 'center' }}>
                              <GalleryLightbox 
                                images={imageItems.slice(0, Math.min(4, imageItems.length))} 
                                title={foundSubProject.title || 'Gallery'}
                                columns={4}
                                imageSize={200}
                              />
                            </div>
                          </div>
                        )
                      }
                      return null
                    })()}
                    
                    {/* Videos below gallery for annk */}
                    {foundSubProject.gallery && foundSubProject.gallery.length > 0 && (() => {
                      // Filter to get only videos - simplified direct check
                      const videoItems = foundSubProject.gallery.filter((item: any) => {
                        if (!item || !item.asset) return false
                        
                        const url = item.asset?.url || ''
                        const mimeType = item.asset?.mimeType || ''
                        const _type = item._type
                        
                        // Direct check: if it's a file type with video extension or video mimeType
                        if (_type === 'file') {
                          const hasVideoExtension = url.match(/\.(mp4|mov|webm|avi|wmv|flv|mkv|m4v|3gp|mpg|mpeg)$/i)
                          const hasVideoMimeType = mimeType && (mimeType.startsWith('video/') || mimeType === 'video/quicktime')
                          
                          if (hasVideoExtension || hasVideoMimeType) {
                            // Make sure it's not audio
                            const isAudioFile = isAudio(item)
                            return !isAudioFile
                          }
                        }
                        
                        // Also try isVideo function as fallback
                        return isVideo(item)
                      })
                      
                      console.log('Annk: Video detection complete. Found', videoItems.length, 'videos out of', foundSubProject.gallery.length, 'total items')
                      
                      if (videoItems.length === 0) {
                        console.log('Annk: Gallery items details:', foundSubProject.gallery.map((item: any) => ({
                          _type: item._type,
                          mimeType: item.asset?.mimeType,
                          url: item.asset?.url?.substring(0, 50) + '...',
                          filename: item.asset?.originalFilename
                        })))
                        return null
                      }
                      
                      return (
                        <div className="w-full max-w-4xl" style={{ margin: '0 auto', marginTop: '2rem' }}>
                          {videoItems.map((item: any, index: number) => {
                            const videoUrl = item.asset?.url
                            if (!videoUrl) {
                              console.warn('Annk: Video item has no URL')
                              return null
                            }
                            
                            console.log('Annk: Rendering video', index + 1, ':', videoUrl.substring(0, 60) + '...')
                            
                            return (
                              <div key={`video-${index}-${item._key || index}`} className="w-full mb-8" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <div style={{ width: '100%', maxWidth: '600px', backgroundColor: '#000', minHeight: '200px' }}>
                                  <AutoPlayVideo
                                    src={videoUrl}
                                    className="w-full h-auto"
                                    style={{ maxHeight: '400px', display: 'block' }}
                                    controls={true}
                                  />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })()}
                  </>
                ) : (
                  <>
                    <GalleryDebug items={foundSubProject.gallery} />
                
                {/* EXCLUSIVE: SequentialGallery for palette&formes in exhibitions - MUST render first and block other galleries */}
                {!isCoteDAzur && isPaletteFormes && slug.toLowerCase() === 'exhibitions' && (
                  <>
                    {/* Top 4x1 gallery row - expo1, expo2, expo3, expo4 images only */}
                    {foundSubProject.gallery && (() => {
                      const expoImages = foundSubProject.gallery.filter((item: any) => {
                        const caption = item.caption?.toLowerCase() || ''
                        return caption === 'expo1' || caption === 'expo2' || caption === 'expo3' || caption === 'expo4'
                      })
                      // Sort by caption to ensure correct order: expo1, expo2, expo3, expo4
                      expoImages.sort((a: any, b: any) => {
                        const captionA = a.caption?.toLowerCase() || ''
                        const captionB = b.caption?.toLowerCase() || ''
                        if (captionA === 'expo1') return -1
                        if (captionB === 'expo1') return 1
                        if (captionA === 'expo2') return -1
                        if (captionB === 'expo2') return 1
                        if (captionA === 'expo3') return -1
                        if (captionB === 'expo3') return 1
                        return 0
                      })
                      console.log('Expo images found:', expoImages.length, expoImages.map((img: any) => img.caption))
                      return expoImages.length >= 3 ? (
                        <div className="mb-8 w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{ width: 'fit-content', display: 'flex', justifyContent: 'center' }}>
                            <GalleryLightbox 
                              images={expoImages} 
                              title={foundSubProject.title || 'Gallery'}
                              columns={4}
                              imageSize={200}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="mb-8 w-full text-center text-red-500">
                          Debug: Found {expoImages.length} expo images. Expected at least 3.
                        </div>
                      )
                    })()}
                    
                    {/* Two SequentialGalleries side by side - first one with images 1-29, second one with sq1-sq9 (smaller) */}
                    <div className="mb-8 w-full">
                      {(() => {
                        // First gallery: images 1-29 (excluding expo1-4 and sq1-sq9)
                        const firstGalleryImages = foundSubProject.gallery?.filter((item: any) => {
                          const caption = item.caption?.toLowerCase() || ''
                          return caption !== 'expo1' && caption !== 'expo2' && caption !== 'expo3' && caption !== 'expo4' &&
                                 caption !== 'sq1' && caption !== 'sq2' && caption !== 'sq3' && caption !== 'sq4' &&
                                 caption !== 'sq5' && caption !== 'sq6' && caption !== 'sq7' && caption !== 'sq8' && caption !== 'sq9'
                        }).slice(0, 29) || []
                        
                        // Second gallery: sq1-sq9 images only
                        const sqImages = foundSubProject.gallery?.filter((item: any) => {
                          const caption = item.caption?.toLowerCase() || ''
                          return caption === 'sq1' || caption === 'sq2' || caption === 'sq3' || caption === 'sq4' ||
                                 caption === 'sq5' || caption === 'sq6' || caption === 'sq7' || caption === 'sq8' || caption === 'sq9'
                        }) || []
                        
                        // Sort sq images by caption to ensure correct order: sq1, sq2, sq3, etc.
                        sqImages.sort((a: any, b: any) => {
                          const captionA = a.caption?.toLowerCase() || ''
                          const captionB = b.caption?.toLowerCase() || ''
                          // Extract number from caption (sq1 -> 1, sq2 -> 2, etc.)
                          const numA = parseInt(captionA.replace('sq', '')) || 0
                          const numB = parseInt(captionB.replace('sq', '')) || 0
                          return numA - numB
                        })
                        
                        return (
                          <div className="flex gap-8 justify-center items-start w-full side-by-side-galleries" style={{ flexWrap: 'wrap' }}>
                            {/* First SequentialGallery - larger */}
                            <div className="flex-1 gallery-column" style={{ minWidth: '300px', maxWidth: '60%' }}>
                              <SequentialGallery 
                                images={firstGalleryImages} 
                                title={foundSubProject.title || 'Gallery'}
                                description={''}
                                maxWidth="sm"
                              />
                            </div>
                            
                            {/* Second SequentialGallery - smaller */}
                            {sqImages.length > 0 && (
                              <div className="flex-1 gallery-column" style={{ minWidth: '400px', maxWidth: '40%' }}>
                                <SequentialGallery 
                                  images={sqImages} 
                                  title={foundSubProject.title || 'Gallery'}
                                  description={''}
                                  maxWidth="md"
                                />
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                    
                    {/* 6x1 gallery - last 6 uploaded images (excluding expo1-4 and sq1-sq9) */}
                    {foundSubProject.gallery && (() => {
                      // Filter out expo and sq images
                      const imagesExcludingExpoAndSq = foundSubProject.gallery.filter((item: any) => {
                        const caption = item.caption?.toLowerCase() || ''
                        return caption !== 'expo1' && caption !== 'expo2' && caption !== 'expo3' && caption !== 'expo4' &&
                               caption !== 'sq1' && caption !== 'sq2' && caption !== 'sq3' && caption !== 'sq4' &&
                               caption !== 'sq5' && caption !== 'sq6' && caption !== 'sq7' && caption !== 'sq8' && caption !== 'sq9'
                      })
                      
                      // Get the last 6 images (most recently uploaded)
                      const last6Images = imagesExcludingExpoAndSq.slice(-6)
                      
                      return last6Images.length >= 6 ? (
                        <div className="mt-16 mb-8 w-full">
                          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <GalleryLightbox 
                              images={last6Images} 
                              title={foundSubProject.title || 'Gallery'}
                              columns={6}
                              imageSize={200}
                            />
                          </div>
                        </div>
                      ) : null
                    })()}
                  </>
                )}
                
                {/* SequentialGallery for palette&formes in print */}
                {isPaletteFormes && slug.toLowerCase() === 'print' && foundSubProject.gallery && foundSubProject.gallery.length > 0 && (
                  <div className="mb-8 w-full">
                    <SequentialGallery 
                      images={foundSubProject.gallery} 
                      title={foundSubProject.title || 'Gallery'}
                      description={''}
                      customMaxWidth={500}
                    />
                  </div>
                )}
                
                {/* Special 2x5 gallery layout for 0fr - 5 rows, each with description on left and 2 images on right */}
                {is0fr && foundSubProject.gallery && foundSubProject.gallery.length >= 10 && (
                  <div className="mb-8 w-full">
                    {[
                      { label: 'exhibition design & retail graphic', indices: [0, 1] },
                      { label: 'other graphic ideas', indices: [2, 3] },
                      { label: 'tokyo retail graphic n°1', indices: [4, 5] },
                      { label: 'tokyo retail graphic n°2', indices: [6, 7] },
                      { label: 'seoul map retail graphic', indices: [8, 9] }
                    ].map((row, rowIndex) => {
                      const rowImages = row.indices
                        .map(index => foundSubProject.gallery?.[index])
                        .filter((item: any) => item !== undefined)
                      
                      if (rowImages.length === 0) return null
                      
                      return (
                        <div key={rowIndex} className="mb-8 flex flex-col md:flex-row items-start gap-8 w-full">
                          {/* Description area on the left */}
                          <div className="text-black font-normal lowercase text-90s flex-shrink-0" style={{ 
                            fontSize: '13px',
                            lineHeight: '1.4',
                            letterSpacing: '0.1px',
                            textAlign: 'left',
                            width: '300px'
                          }}>
                            {row.label}
                          </div>
                          
                          {/* 2 images on the right */}
                          <div className="flex-1 flex justify-end">
                            <div style={{ maxWidth: '600px' }}>
                              <GalleryLightbox 
                                images={rowImages} 
                                title={foundSubProject.title || 'Gallery'}
                                columns={2}
                                imageSize={300}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {/* New row for 0fr - two images side by side (indices 10, 11) */}
                {is0fr && foundSubProject.gallery && foundSubProject.gallery.length >= 12 && (
                  <div className="mb-8 w-full">
                    {(() => {
                      // Use images at indices 10 and 11 (after the 5 rows which use indices 0-9)
                      const newRowImages = [foundSubProject.gallery?.[10], foundSubProject.gallery?.[11]].filter((item: any) => item !== undefined)
                      
                      if (newRowImages.length === 0) return null
                      
                      return (
                        <div className="mb-8 flex flex-col md:flex-row items-start gap-8 w-full">
                          {/* Description area on the left */}
                          <div className="text-black font-normal lowercase text-90s flex-shrink-0" style={{ 
                            fontSize: '13px',
                            lineHeight: '1.4',
                            letterSpacing: '0.1px',
                            textAlign: 'left',
                            width: '300px'
                          }}>
                            rivedroitrivegauche retail graphic
                          </div>
                          
                          {/* 2 images on the right */}
                          <div className="flex-1 flex justify-end">
                            <div style={{ maxWidth: '600px' }}>
                              <GalleryLightbox 
                                images={newRowImages} 
                                title={foundSubProject.title || 'Gallery'}
                                columns={2}
                                imageSize={300}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                {/* Additional row for 0fr - description on left, single image on right */}
                {is0fr && foundSubProject.gallery && foundSubProject.gallery.length >= 13 && (
                  <div className="mb-8 w-full">
                    {(() => {
                      // Use the image at index 12 (after the 5 rows which use indices 0-9 and the new row which uses indices 10-11)
                      const additionalImage = foundSubProject.gallery?.[12]
                      
                      if (!additionalImage) return null
                      
                      return (
                        <div className="mb-8 flex flex-col md:flex-row items-start gap-8 w-full">
                          {/* Description area on the left */}
                          <div className="text-black font-normal lowercase text-90s flex-shrink-0" style={{ 
                            fontSize: '13px',
                            lineHeight: '1.4',
                            letterSpacing: '0.1px',
                            textAlign: 'left',
                            width: '300px'
                          }}>
                            {/* Description text - you can add specific text here or use caption */}
                            {additionalImage.caption || ''}
                          </div>
                          
                          {/* Single image on the right */}
                          <div className="flex-1 flex justify-end">
                            <div style={{ maxWidth: '600px' }}>
                              <GalleryLightbox 
                                images={[additionalImage]} 
                                title={foundSubProject.title || 'Gallery'}
                                columns={1}
                                imageSize={300}
                              />
                            </div>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                {/* SequentialGallery for 0fr - images after the rows (starting from index 13) - description on left, gallery on right */}
                {is0fr && foundSubProject.gallery && foundSubProject.gallery.length >= 14 && (
                  <div className="mb-8 w-full">
                    {(() => {
                      // Get images starting from index 13 (after the 5 rows which use indices 0-9, the new row which uses indices 10-11, and the additional row which uses index 12)
                      const sequentialImages = foundSubProject.gallery.slice(13)
                      
                      if (sequentialImages.length === 0) return null
                      
                      return (
                        <div className="flex items-start gap-8 w-full">
                          {/* Description area on the left */}
                          <div className="text-black font-normal lowercase text-90s flex-shrink-0" style={{ 
                            fontSize: '13px',
                            lineHeight: '1.4',
                            letterSpacing: '0.1px',
                            textAlign: 'left',
                            width: '300px'
                          }}>
                            image for brand campaign
                          </div>
                          
                          {/* SequentialGallery on the right */}
                          <div className="flex-1">
                            <SequentialGallery 
                              images={sequentialImages} 
                              title={foundSubProject.title || 'Gallery'}
                              description={''}
                              customMaxWidth={384}
                            />
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                {/* Sequential layout with arrows for out of sight solo, blue, 東京ハーパー, le bal de debutantes */}
                {/* NOTE: palette&formes in exhibitions and print, and les mots bleus in print are handled separately */}
                {/* Special handling for 東京ハーパー in exhibitions - Description + 4x1 gallery + SequentialGallery */}
                {isTokyoHarper && slug.toLowerCase() === 'exhibitions' && foundSubProject.gallery && foundSubProject.gallery.length > 0 && (
                  <>
                    {/* Description for 東京ハーパー in exhibitions */}
                    {foundSubProject.description && (
                      <div 
                        className="mb-8 text-black font-normal lowercase text-90s"
                        style={{ 
                          fontSize: '13px',
                          lineHeight: '1.85',
                          letterSpacing: '0.2px',
                          textAlign: 'left'
                        }}
                      >
                        {foundSubProject.description.split('\n').map((line: string, index: number) => (
                          <div key={index} className={index > 0 ? 'mt-4' : ''}>
                            {line}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Top 4x1 gallery row - first1, first2, first3, first4 images only */}
                    {foundSubProject.gallery && (() => {
                      const firstImages = foundSubProject.gallery.filter((item: any) => {
                        const caption = item.caption?.toLowerCase() || ''
                        return caption === 'first1' || caption === 'first2' || caption === 'first3' || caption === 'first4'
                      })
                      // Sort by caption to ensure correct order: first1, first2, first3, first4
                      firstImages.sort((a: any, b: any) => {
                        const captionA = a.caption?.toLowerCase() || ''
                        const captionB = b.caption?.toLowerCase() || ''
                        if (captionA === 'first1') return -1
                        if (captionB === 'first1') return 1
                        if (captionA === 'first2') return -1
                        if (captionB === 'first2') return 1
                        if (captionA === 'first3') return -1
                        if (captionB === 'first3') return 1
                        return 0
                      })
                      return firstImages.length >= 4 ? (
                        <div className="mb-8 w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{ width: 'fit-content', display: 'flex', justifyContent: 'center' }}>
                            <GalleryLightbox 
                              images={firstImages} 
                              title={foundSubProject.title || 'Gallery'}
                              columns={4}
                              imageSize={200}
                            />
                          </div>
                        </div>
                      ) : null
                    })()}
                    
                    {/* Two SequentialGalleries side by side - first with sq1-sq8, second with ex1-ex14 */}
                    <div className="mb-8 w-full">
                      {(() => {
                        // First gallery: sq1-sq8 images
                        const sqImages = foundSubProject.gallery?.filter((item: any) => {
                          const caption = item.caption?.toLowerCase() || ''
                          return caption === 'sq1' || caption === 'sq2' || caption === 'sq3' || caption === 'sq4' ||
                                 caption === 'sq5' || caption === 'sq6' || caption === 'sq7' || caption === 'sq8'
                        }) || []
                        
                        // Sort sq images by caption
                        sqImages.sort((a: any, b: any) => {
                          const captionA = a.caption?.toLowerCase() || ''
                          const captionB = b.caption?.toLowerCase() || ''
                          const numA = parseInt(captionA.replace('sq', '')) || 0
                          const numB = parseInt(captionB.replace('sq', '')) || 0
                          return numA - numB
                        })
                        
                        // Second gallery: ex1-ex14 images
                        const exImages = foundSubProject.gallery?.filter((item: any) => {
                          const caption = item.caption?.toLowerCase() || ''
                          return caption === 'ex1' || caption === 'ex2' || caption === 'ex3' || caption === 'ex4' ||
                                 caption === 'ex5' || caption === 'ex6' || caption === 'ex7' || caption === 'ex8' ||
                                 caption === 'ex9' || caption === 'ex10' || caption === 'ex11' || caption === 'ex12' ||
                                 caption === 'ex13' || caption === 'ex14'
                        }) || []
                        
                        // Sort ex images by caption
                        exImages.sort((a: any, b: any) => {
                          const captionA = a.caption?.toLowerCase() || ''
                          const captionB = b.caption?.toLowerCase() || ''
                          const numA = parseInt(captionA.replace('ex', '')) || 0
                          const numB = parseInt(captionB.replace('ex', '')) || 0
                          return numA - numB
                        })
                        
                        return (
                          <div className="flex gap-8 justify-center items-start w-full side-by-side-galleries" style={{ flexWrap: 'wrap' }}>
                            {/* First SequentialGallery - sq1-sq8 */}
                            {sqImages.length > 0 && (
                              <div className="flex-1 gallery-column" style={{ minWidth: '300px', maxWidth: '60%' }}>
                                <SequentialGallery 
                                  images={sqImages} 
                                  title={foundSubProject.title || 'Gallery'}
                                  description={''}
                                  maxWidth="xl"
                                  hideCaptions={true}
                                />
                              </div>
                            )}
                            
                            {/* Second SequentialGallery - ex1-ex14 (smaller) */}
                            {exImages.length > 0 && (
                              <div className="flex-1 gallery-column" style={{ minWidth: '400px', maxWidth: '40%' }}>
                                <SequentialGallery 
                                  images={exImages} 
                                  title={foundSubProject.title || 'Gallery'}
                                  description={''}
                                  maxWidth="xl"
                                  hideCaptions={true}
                                />
                              </div>
                            )}
                          </div>
                        )
                      })()}
                    </div>
                    
                    {/* 6x3 gallery - newest 16 images (excluding first1-4, sq1-sq8, and ex1-ex14) */}
                    {foundSubProject.gallery && (() => {
                      const imagesExcludingSpecial = foundSubProject.gallery.filter((item: any) => {
                        const caption = item.caption?.toLowerCase() || ''
                        return caption !== 'first1' && caption !== 'first2' && caption !== 'first3' && caption !== 'first4' &&
                               caption !== 'sq1' && caption !== 'sq2' && caption !== 'sq3' && caption !== 'sq4' &&
                               caption !== 'sq5' && caption !== 'sq6' && caption !== 'sq7' && caption !== 'sq8' &&
                               caption !== 'ex1' && caption !== 'ex2' && caption !== 'ex3' && caption !== 'ex4' &&
                               caption !== 'ex5' && caption !== 'ex6' && caption !== 'ex7' && caption !== 'ex8' &&
                               caption !== 'ex9' && caption !== 'ex10' && caption !== 'ex11' && caption !== 'ex12' &&
                               caption !== 'ex13' && caption !== 'ex14'
                      })
                      // Get the last 16 images (newest uploaded)
                      const last16Images = imagesExcludingSpecial.slice(-16)
                      
                      return last16Images.length >= 16 ? (
                        <div className="mt-16 mb-8 w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <div style={{ 
                            width: 'fit-content', 
                            maxWidth: '100%',
                            margin: '0 auto'
                          }}>
                            <GalleryLightbox 
                              images={last16Images} 
                              title={foundSubProject.title || 'Gallery'}
                              columns={6}
                              imageSize={200}
                            />
                          </div>
                        </div>
                      ) : null
                    })()}
                  </>
                )}
                
                {(isOutOfSightSolo || isBlue || isTokyoHarper || isLeBalDeDebutantes) && !(isPaletteFormes && slug.toLowerCase() === 'exhibitions') && !(isPaletteFormes && slug.toLowerCase() === 'print') && !(isLesMotsBleus && slug.toLowerCase() === 'print') && !(isTokyoHarper && slug.toLowerCase() === 'exhibitions') && !isCoteDAzur && !isParis && !isLosAngeles && !isAnnk && foundSubProject.gallery && foundSubProject.gallery.length > 0 && (
                  <div className="mb-8 w-full">
                    {/* Sequential images with arrows - images appear one after another in order */}
                    <SequentialGallery 
                      images={foundSubProject.gallery} 
                      title={foundSubProject.title || 'Gallery'}
                      description={foundSubProject.description}
                      hideCaptions={isTokyoHarper && slug.toLowerCase() !== 'print'}
                      customMaxWidth={
                        (isBlue && slug.toLowerCase() === 'print') ? 500 :
                        isBlue ? 400 : 
                        (isLeBalDeDebutantes && slug.toLowerCase() === 'print' ? 500 : 
                        (isOutOfSightSolo && slug.toLowerCase() === 'print' ? 500 : 
                        (isTokyoHarper && slug.toLowerCase() === 'print' ? 512 : undefined)))
                      }
                    />
                  </div>
                )}
                
                {/* Two separate SequentialGalleries for les mots bleus in print */}
                {isLesMotsBleus && slug.toLowerCase() === 'print' && foundSubProject.gallery && foundSubProject.gallery.length > 0 && (
                  <div className="mb-8 w-full">
                    {/* Description */}
                    {foundSubProject.description && (
                      <div 
                        className="mb-8 text-black font-normal lowercase text-90s"
                        style={{ 
                          fontSize: '13px',
                          lineHeight: '1.4',
                          letterSpacing: '0.2px',
                          textAlign: 'left'
                        }}
                      >
                        {foundSubProject.description.split('\n').map((line: string, index: number) => {
                          const isFirstLine = index === 0
                          const parts = line.split(/(\*\*.*?\*\*)/g)
                          return (
                            <div key={index} style={{ marginBottom: isFirstLine ? '12px' : '1px', lineHeight: isFirstLine ? '1.4' : '1.2' }}>
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
                    {/* Split gallery into two SequentialGalleries */}
                    {(() => {
                      const midPoint = Math.ceil(foundSubProject.gallery.length / 2)
                      const firstGallery = foundSubProject.gallery.slice(0, midPoint)
                      const secondGallery = foundSubProject.gallery.slice(midPoint)
                      
                      return (
                        <>
                          {/* First SequentialGallery */}
                          {firstGallery.length > 0 && (
                            <div className="mb-16 w-full">
                              <SequentialGallery 
                                images={firstGallery} 
                                title={foundSubProject.title || 'Gallery'}
                                customMaxWidth={500}
                              />
                            </div>
                          )}
                          {/* Second SequentialGallery */}
                          {secondGallery.length > 0 && (
                            <div className="mb-8 w-full">
                              <SequentialGallery 
                                images={secondGallery} 
                                title={foundSubProject.title || 'Gallery'}
                                customMaxWidth={500}
                              />
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
                
                {/* Sequential layout for les mots bleus in exhibitions - First gallery with description */}
                {isLesMotsBleus && slug.toLowerCase() === 'exhibitions' && foundSubProject.gallery && foundSubProject.gallery.length > 0 && (
                  <div className="mb-8">
                    {(() => {
                      // Find the three specific images for the top gallery
                      const topGalleryFilenames = ['lesmotsbleus1', 'lesmotsbleus2', 'lesmotsbleus3']
                      let topGalleryImages = topGalleryFilenames
                        .map(filename => {
                          return foundSubProject.gallery?.find((item: any) => {
                            if (!item || !item.asset) return false
                            const originalFilename = item.asset?.originalFilename || ''
                            const lowerFilename = originalFilename.toLowerCase()
                            // Try multiple matching strategies
                            return lowerFilename.includes(filename.toLowerCase()) ||
                                   lowerFilename.includes(filename.toLowerCase().replace('lesmotsbleus', 'les mots bleus')) ||
                                   lowerFilename.startsWith(filename.toLowerCase()) ||
                                   lowerFilename.endsWith(filename.toLowerCase() + '.jpg') ||
                                   lowerFilename.endsWith(filename.toLowerCase() + '.jpeg') ||
                                   lowerFilename.endsWith(filename.toLowerCase() + '.png')
                          })
                        })
                        .filter((item: any) => item !== undefined)
                      
                      // If we didn't find all 3 by filename, use the first 3 images from the gallery
                      if (topGalleryImages.length < 3 && foundSubProject.gallery && foundSubProject.gallery.length >= 3) {
                        topGalleryImages = foundSubProject.gallery.slice(0, 3)
                      }
                      
                      return (
                        <>
                          {/* Top gallery - 3x1, 200px images */}
                          {topGalleryImages.length > 0 && (
                            <div className="mb-8" style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                              <div style={{ 
                                width: '632px', // 3 * 200px + 2 * 16px gap
                                maxWidth: '100%',
                                margin: '0 auto'
                              }}>
                                <GalleryLightbox 
                                  images={topGalleryImages} 
                                  title={foundSubProject.title || 'Gallery'}
                                  columns={3}
                                  imageSize={200}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )
                    })()}
                    
                    {(() => {
                      // Top gallery filenames to exclude from sequential galleries
                      const topGalleryFilenames = ['lesmotsbleus1', 'lesmotsbleus2', 'lesmotsbleus3']
                      
                      // Get the actual top gallery images to exclude by reference
                      const topGalleryImages = topGalleryFilenames
                        .map(filename => {
                          return foundSubProject.gallery?.find((item: any) => {
                            if (!item || !item.asset) return false
                            const originalFilename = item.asset?.originalFilename || ''
                            const lowerFilename = originalFilename.toLowerCase()
                            return lowerFilename.includes(filename.toLowerCase()) ||
                                   lowerFilename.includes(filename.toLowerCase().replace('lesmotsbleus', 'les mots bleus')) ||
                                   lowerFilename.startsWith(filename.toLowerCase()) ||
                                   lowerFilename.endsWith(filename.toLowerCase() + '.jpg') ||
                                   lowerFilename.endsWith(filename.toLowerCase() + '.jpeg') ||
                                   lowerFilename.endsWith(filename.toLowerCase() + '.png')
                          })
                        })
                        .filter((item: any) => item !== undefined)
                      
                      // If we didn't find all 3 by filename, use the first 3 images from the gallery
                      let actualTopGalleryImages = topGalleryImages
                      if (topGalleryImages.length < 3 && foundSubProject.gallery && foundSubProject.gallery.length >= 3) {
                        actualTopGalleryImages = foundSubProject.gallery.slice(0, 3)
                      }
                      
                      // Get last uploaded images for 6x2 gallery
                      // Exclude top 3 images, then take the last 12 images from the remaining gallery
                      const allImagesExcludingTop = foundSubProject.gallery.filter((item: any) => {
                        if (!item || !item.asset) return false
                        // Exclude top gallery images by reference
                        const isTopGalleryImage = actualTopGalleryImages.some((topImage: any) => 
                          topImage.asset?._id === item.asset?._id || 
                          topImage._key === item._key
                        )
                        return !isTopGalleryImage
                      })
                      
                      // Take the last 12 images (most recently uploaded, excluding top 3) for 6x2 gallery
                      const finalPosterImages = allImagesExcludingTop.slice(-12)
                      
                      // Debug: log all available images and last uploaded images
                      console.log('=== LES MOTS BLEUS DEBUG ===')
                      console.log('Total gallery images:', foundSubProject.gallery?.length)
                      console.log('Images excluding top 3:', allImagesExcludingTop.length)
                      console.log('Last 12 uploaded images for 6x2 gallery:', finalPosterImages.length)
                      if (finalPosterImages.length > 0) {
                        console.log('6x2 gallery image filenames:', finalPosterImages.map((item: any) => item.asset?.originalFilename))
                      }
                      console.log('===========================')
                      
                      // SequentialGallery: images 4-15 (next 12 images after top 3)
                      // First, get all images excluding top gallery images
                      const imagesExcludingTop = foundSubProject.gallery.filter((item: any) => {
                        if (!item || !item.asset) return false
                        // Exclude by reference
                        const isTopGalleryImage = actualTopGalleryImages.some((topImage: any) => 
                          topImage.asset?._id === item.asset?._id || 
                          topImage._key === item._key
                        )
                        return !isTopGalleryImage
                      })
                      
                      // Take images 4-15 (indices 3-14, which is 12 images)
                      const sequentialGalleryImages = imagesExcludingTop.slice(0, 12)
                      
                      return (
                        <>
                          {/* Sequential gallery with all images except the first 3 */}
                          {sequentialGalleryImages.length > 0 && (
                            <SequentialGallery 
                              images={sequentialGalleryImages} 
                              title={foundSubProject.title || 'Gallery'}
                              maxWidth="sm"
                            />
                          )}
                          
                          {/* 6x2 gallery below SequentialGallery - last 12 uploaded images */}
                          {finalPosterImages.length > 0 && (
                            <div className="mt-16 mb-8 w-full">
                              <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <GalleryLightbox 
                                  images={finalPosterImages} 
                                  title={foundSubProject.title || 'Gallery'}
                                  columns={6}
                                  imageSize={200}
                                />
                              </div>
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>
                )}
                  </>
                )}
                
                {/* Boutique romantique - single sequential gallery with all images */}
                {isBoutiqueRomantique && foundSubProject.gallery && foundSubProject.gallery.length > 0 && (
                  <div className="mb-8 w-full">
                    {(() => {
                      // Sort images so "start" caption comes first
                      const sortedGallery = [...foundSubProject.gallery].sort((a: any, b: any) => {
                        const captionA = a.caption?.toLowerCase() || ''
                        const captionB = b.caption?.toLowerCase() || ''
                        if (captionA === 'start') return -1
                        if (captionB === 'start') return 1
                        return 0
                      })
                      
                      return (
                        <SequentialGallery 
                          images={sortedGallery} 
                          title={foundSubProject.title || 'Gallery'}
                          description={foundSubProject.description || ''}
                          customMaxWidth={500}
                        />
                      )
                    })()}
                  </div>
                )}
                
                {/* All other galleries - only show if NOT bts, NOT les mots bleus, NOT out of sight solo, NOT blue, NOT 東京ハーパー, NOT le bal de debutantes, NOT palette&formes, NOT la mode, NOT los angeles, NOT grafik(design), NOT paris, NOT cote d'azur, NOT boutique romantique, and NOT The Parisian Vintage (all use sequential layout or special layout) */}
                {!isBts && !isLesMotsBleus && !isOutOfSightSolo && !isBlue && !isTokyoHarper && !isLeBalDeDebutantes && !(isPaletteFormes && slug.toLowerCase() === 'exhibitions') && !(isPaletteFormes && slug.toLowerCase() === 'print') && !isLaMode && !isLosAngeles && !isAnnk && !isGrafikDesign && !isParis && !isCoteDAzur && !isBoutiqueRomantique && !isParisianVintage && (
                  <>
                
                {/* Main Gallery - first image at 800x800, then portrait gallery 5x1 */}
                {!is0fr && !isBts && (
                <div className="mb-8">
                  {(() => {
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
                
                {/* Second 5x1 Gallery - Images 7-11 (skip for The Parisian Vintage, 0fr, bts, cote d'azur, paris, and boutique romantique) */}
                {!isParisianVintage && !is0fr && !isBts && !isCoteDAzur && !isParis && !isLosAngeles && !isAnnk && !isBoutiqueRomantique && foundSubProject.gallery && foundSubProject.gallery.length >= 11 && (
                  <div className={isTokyo ? "mt-16 mb-16" : "mt-8 mb-8"}>
                    <GalleryLightbox 
                      images={foundSubProject.gallery.slice(6, 11)} 
                      title={foundSubProject.title || 'Gallery'}
                      columns={5}
                      imageSize={400}
                    />
                  </div>
                )}
                
                {/* Third 5x1 Gallery - Specific images by filename (skip for The Parisian Vintage, 0fr, bts, cote d'azur, paris, and boutique romantique) */}
                {!isParisianVintage && !is0fr && !isBts && !isCoteDAzur && !isParis && !isLosAngeles && !isAnnk && !isBoutiqueRomantique && foundSubProject.gallery && foundSubProject.gallery.length >= 5 && (
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
                
                {/* 7x1 Gallery - Original 7 Images with Lightbox (skip for The Parisian Vintage, 0fr, bts, cote d'azur, and paris) */}
                {!isParisianVintage && !is0fr && !isBts && !isCoteDAzur && !isParis && !isLosAngeles && !isAnnk && foundSubProject.gallery && Array.isArray(foundSubProject.gallery) && foundSubProject.gallery.length >= 7 && (
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
                
                {/* Tokyo 6x1 Gallery - Black and white images in a single row */}
                {isTokyo && foundSubProject.gallery && (
                  <div className="mt-16 mb-16 w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          <GalleryLightbox 
                            images={tokyoGalleryImages} 
                            title={foundSubProject.title || 'Gallery'}
                            columns={6}
                            imageSize={200}
                            center={true}
                          />
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                {/* 6x1 Gallery - Last gallery with specific images (skip for cote d'azur and paris) */}
                {!isCoteDAzur && !isParis && !isLosAngeles && !isAnnk && foundSubProject.gallery && Array.isArray(foundSubProject.gallery) && (
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
                
                {/* SequentialGallery for Tokyo with description and sakura photo - side by side layout */}
                {isTokyo && foundSubProject.gallery && foundSubProject.gallery.length > 0 && (
                  <div className="mb-8 w-full">
                    {(() => {
                      // Exclude images that are already shown in previous tokyo galleries
                      const excludedFilenames = [
                        'IMG_8313.JPG',
                        '000000460002.tif',
                        '000000460006.tif',
                        '000000460012.tif',
                        '000000460016.tif',
                        '000000460026.tif',
                        '000000460056.tif',
                        '000000460058.tif',
                        '000000460060.tif',
                        '000000460052.tif',
                        '000000460049.tif',
                        '000000460027.tif',
                        '000000460035.tif',
                        '000000470009.tif',
                        '000000470019.tif',
                        '000000470008.tif',
                        'IMG_8341.JPG',
                        'IMG_8338.JPG',
                        'IMG_8336.JPG',
                        'IMG_8315.JPG',
                        'IMG_8320.JPG',
                        'IMG_8337.JPG',
                        'IMG_8335 2.JPG',
                        '000000430033.tif',
                        '000000430018.tif',
                        '000000430011.tif',
                        '000000430005.tif',
                        '000000430017.tif',
                        '000000430003.tif',
                        '000000450029.tif',
                        '000000450026.tif',
                        '000000450011.tif',
                        '000000450009.tif',
                        '000000450005.tif',
                        '000000450022.tif',
                        '000000450019.tif',
                        '000000450017.tif',
                        '000000450013.tif',
                        '000000450012.tif',
                        '000000450014.tif',
                        '000000450015.tif',
                        'BC4A3E71-C7EF-4CB9-89F2-08A2C1BF4CEF.JPG'
                      ]
                      
                      // Get images that are NOT in the excluded list (these are the new/untitled ones)
                      const sequentialImages = foundSubProject.gallery.filter((item: any) => {
                        if (!item || !item.asset) return false
                        const originalFilename = item.asset?.originalFilename || ''
                        const isExcluded = excludedFilenames.some(excluded => 
                          originalFilename === excluded || 
                          originalFilename.endsWith(excluded) ||
                          originalFilename.toLowerCase().includes(excluded.toLowerCase())
                        )
                        return !isExcluded
                      })
                      
                      // Find the sakura image
                      const targetFilename = 'BC4A3E71-C7EF-4CB9-89F2-08A2C1BF4CEF.JPG'
                      const finalImage = foundSubProject.gallery?.find((item: any) => {
                        const originalFilename = item.asset?.originalFilename || ''
                        return originalFilename === targetFilename || originalFilename.endsWith(targetFilename)
                      })
                      
                      if (sequentialImages.length === 0 && !finalImage) return null
                      
                      return (
                        <div className="flex items-start gap-8 w-full">
                          {/* Text description on the left */}
                          <div className="text-black font-normal lowercase text-90s flex-shrink-0" style={{ 
                            fontSize: '13px',
                            lineHeight: '1.4',
                            letterSpacing: '0.1px',
                            textAlign: 'left',
                            width: '300px'
                          }}>
                            <div>viktoria in nakameguro one sunny morning</div>
                          </div>
                          
                          {/* Sakura photo in the middle */}
                          {finalImage && (
                            <div className="flex-shrink-0">
                              <GalleryLightbox 
                                images={[finalImage]} 
                                title={foundSubProject.title || 'Gallery'}
                                columns={1}
                                imageSize={200}
                              />
                            </div>
                          )}
                          
                          {/* SequentialGallery on the right */}
                          {sequentialImages.length > 0 && (
                            <div className="flex-1">
                              <SequentialGallery 
                                images={sequentialImages} 
                                title={foundSubProject.title || 'Gallery'}
                                description={''}
                                customMaxWidth={384}
                              />
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                {/* 6-image Gallery for Tokyo (6x1 row) - Gallery with v1-v6 images, centered */}
                {isTokyo && foundSubProject.gallery && foundSubProject.gallery.length > 0 && (
                  <div className="mt-16 mb-8 w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {(() => {
                      // Find images by specific captions (v1, v2, v3, v4, v5, v6)
                      const targetCaptions = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6']
                      
                      const gallery6x1Images = targetCaptions
                        .map(caption => {
                          return foundSubProject.gallery?.find((item: any) => {
                            if (!item || !item.asset) return false
                            const itemCaption = item.caption?.toLowerCase() || ''
                            const originalFilename = item.asset?.originalFilename?.toLowerCase() || ''
                            return itemCaption === caption || originalFilename.includes(caption)
                          })
                        })
                        .filter((item: any) => item !== undefined)
                      
                      if (gallery6x1Images.length === 0) return null
                      
                      return (
                        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                          <GalleryLightbox 
                            images={gallery6x1Images} 
                            title={foundSubProject.title || 'Gallery'}
                            columns={6}
                            imageSize={200}
                            center={true}
                          />
                        </div>
                      )
                    })()}
                  </div>
                )}
                
                {/* Final image with description - at the end of all galleries (skip for cote d'azur and paris and tokyo) */}
                {!isCoteDAzur && !isParis && !isLosAngeles && !isAnnk && !isTokyo && foundSubProject.gallery && Array.isArray(foundSubProject.gallery) && (
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
                {!isTokyo && foundSubProject.gallery && Array.isArray(foundSubProject.gallery) && (
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
                {!isTokyo && foundSubProject.gallery && Array.isArray(foundSubProject.gallery) && (
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
              </>
            )}
            
            {/* SequentialGallery for grafik(design) */}
            {isGrafikDesign && foundSubProject.gallery && foundSubProject.gallery.length > 0 && (
              <div className="mb-8 w-full">
                <SequentialGallery 
                  images={foundSubProject.gallery} 
                  title={foundSubProject.title || 'Gallery'}
                  description={''}
                  customMaxWidth={512}
                />
              </div>
            )}

            {/* Description for image/styling */}
            {isLaMode && foundSubProject.description && (
              <>
                <div 
                  className="mb-4 text-black font-normal lowercase text-90s"
                  style={{ 
                    fontSize: '13px',
                    lineHeight: '1.85',
                    letterSpacing: '0.2px',
                    textAlign: 'left'
                  }}
                >
                  {foundSubProject.description.split('\n').map((line: string, index: number) => (
                    <div key={index} className={index > 0 ? 'mt-4' : ''}>
                      {line}
                    </div>
                  ))}
                </div>
                
                {/* Instagram icon below description - left aligned */}
                <div className="flex justify-start items-center mb-8">
                  <a 
                    href="https://www.instagram.com/harper.slone/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block hover:opacity-70 transition-opacity"
                    title="Instagram"
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      style={{ color: '#000000' }}
                    >
                      <path 
                        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162 0 3.403 2.759 6.162 6.162 6.162 3.403 0 6.162-2.759 6.162-6.162 0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4 2.209 0 4 1.791 4 4 0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" 
                        fill="currentColor"
                      />
                    </svg>
                  </a>
                </div>
              </>
            )}
            
            {/* SequentialGallery for image/styling - shows all images including latest additions */}
            {isLaMode && foundSubProject.gallery && foundSubProject.gallery.length > 0 && (
              <div className="mb-8 w-full">
                <SequentialGallery 
                  images={foundSubProject.gallery} 
                  title={foundSubProject.title || 'Gallery'}
                  description={''}
                  customMaxWidth={500}
                />
              </div>
            )}
            
            {/* The Parisian Vintage - Simplified Layout: TIF files in grid, JPG files in sequential gallery */}
            {isParisianVintage && foundSubProject.gallery && (
              <div>
                {/* Description box above main gallery */}
                <div className="mb-6">
                  <p className="text-sm text-gray-700">riso prints for palette & formes project</p>
                </div>
                
                {/* Main Gallery - TIF files only (riso prints) */}
                <div className="mb-8">
                  {(() => {
                    // Get only TIF files (riso prints)
                    const tifImages = foundSubProject.gallery.filter((item: any) => {
                      if (!item || !item.asset) return false
                      const filename = item.asset?.originalFilename || ''
                      const url = item.asset?.url || ''
                      return filename.toLowerCase().endsWith('.tif') || url.toLowerCase().includes('.tif')
                    })
                    
                    if (tifImages.length === 0) return null
                    
                    return (
                      <GalleryLightbox 
                        images={tifImages} 
                        title={foundSubProject.title || 'Gallery'}
                        columns={5}
                        imageSize={400}
                      />
                    )
                  })()}
                </div>
                
                {/* Description box above sequential gallery */}
                <div className="mt-8 mb-6">
                  <p className="text-sm text-gray-700">imagery/content for social media</p>
                </div>
                
                {/* Sequential Gallery - JPG files only (social media content) */}
                <div className="mb-8">
                  {(() => {
                    // Get only JPG files (social media images)
                    const jpgImages = foundSubProject.gallery.filter((item: any) => {
                      if (!item || !item.asset) return false
                      const filename = item.asset?.originalFilename || ''
                      const url = item.asset?.url || ''
                      // Exclude TIF files (they're in the main gallery)
                      const isTif = filename.toLowerCase().endsWith('.tif') || url.toLowerCase().includes('.tif')
                      // Exclude videos
                      const isVideo = url.match(/\.(mp4|mov|webm|avi|wmv|flv|mkv|m4v|3gp|mpg|mpeg)$/i)
                      return !isTif && !isVideo
                    })
                    
                    if (jpgImages.length === 0) return null
                    
                    return (
                      <SequentialGallery 
                        images={jpgImages} 
                        title={foundSubProject.title || 'Gallery'}
                        description={''}
                        customMaxWidth={300}
                        hideCaptions={true}
                      />
                    )
                  })()}
                </div>
                
                {/* Video gallery - appears as last gallery, muted */}
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
              </div>
            )}
            
            {/* Last 5x2 Gallery - 10 images (5 columns, 2 rows) - Excluded for print */}
            {isTokyoHarper && slug.toLowerCase() !== 'print' && foundSubProject.gallery && foundSubProject.gallery.length >= 10 && (
              <div className="mt-16 mb-8 w-full" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {(() => {
                  // Get the last 10 images from the gallery
                  const last10Images = foundSubProject.gallery.slice(-10)
                  
                  if (last10Images.length < 10) return null
                  
                  return (
                    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                      <GalleryLightbox 
                        images={last10Images} 
                        title={foundSubProject.title || 'Gallery'}
                        columns={5}
                        imageSize={200}
                        center={true}
                      />
                    </div>
                  )
                })()}
              </div>
            )}
            
          </div>
        </main>
      </div>
    </div>
  )
}

