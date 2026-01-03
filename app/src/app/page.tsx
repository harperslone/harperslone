import {client} from '@/lib/sanity/client'
import {projectsQuery} from '@/lib/sanity/queries'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import SidebarNavigation from '@/components/SidebarNavigation'
import ClickableDot from '@/components/ClickableDot'
import ProjectLink from '@/components/ProjectLink'

interface Project {
  _id: string
  number: string
  title: string
  slug: {
    current: string
  }
  year?: number
  category?: string
  description?: string
  themes?: string[]
  subProjects?: {
    _key: string
    pv?: string
    title?: string
    description?: string
  }[]
}

async function getProjects() {
  try {
    const projects = await client.fetch<Project[]>(projectsQuery)
    return projects
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

export default async function Home() {
  let allProjects: Project[] = []
  try {
    allProjects = await getProjects()
  } catch (error) {
    console.error('Error in Home component:', error)
    // Return empty array if there's an error
    allProjects = []
  }

  // Generate colored dots positions with links
  const coloredDots = Array.from({ length: 40 }, (_, i) => {
    const colors = [
      { color: '#bfdbfe', slug: 'work' }, // pale blue → work
      { color: '#fef08a', slug: 'projects' }, // pale yellow → projects
      { color: '#fce7f3', slug: 'exhibitions' }, // pale pink → exhibitions
      { color: '#d1fae5', slug: 'print' } // pale green → print
    ]
    const colorData = colors[i % colors.length]
    const size = Math.random() * 20 + 10 // 10-30px
    const top = Math.random() * 60 + 20 // 20-80%
    const left = Math.random() * 60 + 20 // 20-80%
    return { color: colorData.color, slug: colorData.slug, size, top, left }
  })
  
  // Generate black dots for contact page
  const blackDots = Array.from({ length: 10 }, (_, i) => {
    const size = Math.random() * 15 + 8 // 8-23px
    const top = Math.random() * 60 + 20 // 20-80%
    const left = Math.random() * 60 + 20 // 20-80%
    return { size, top, left }
  })

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col relative overflow-hidden">
      <Navigation />
      
      <div className="relative z-10 flex w-full" style={{ minHeight: 'calc(100vh - 42px)' }}>
        {/* Left Sidebar - Navigation with Expandable Items */}
        <SidebarNavigation projects={allProjects} />

        {/* Main Content Area - Swiss Style Poster Design */}
        <main className="flex-1 relative z-10 flex items-center justify-center p-4 md:p-16 homepage-main">
          <div className="relative w-full max-w-4xl homepage-container" style={{ aspectRatio: '1/1', maxHeight: '90vh' }}>
            {/* Dark gray corners */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gray-400 z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gray-400 z-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gray-400 z-0" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gray-400 z-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
            
            {/* White rotated square (diamond) */}
            <div 
              className="absolute top-1/2 left-1/2 bg-white z-10 homepage-diamond"
              style={{
                width: '70%',
                height: '70%',
                transform: 'translate(-50%, -50%) rotate(45deg)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                overflow: 'visible'
              }}
            >
              {/* Colored dots scattered inside */}
              {coloredDots.map((dot, i) => (
                <ClickableDot
                  key={i}
                  color={dot.color}
                  slug={dot.slug}
                  size={dot.size}
                  top={dot.top}
                  left={dot.left}
                />
              ))}
              
              {/* Grey dots for contact page */}
              {blackDots.map((dot, i) => (
                <Link
                  key={`black-${i}`}
                  href="/contact"
                  className="absolute rounded-full hover:opacity-80 transition-opacity cursor-red-dot z-20 homepage-dot"
                  style={{
                    width: `${dot.size}px`,
                    height: `${dot.size}px`,
                    backgroundColor: '#A7ACB4',
                    top: `${dot.top}%`,
                    left: `${dot.left}%`,
                    transform: 'rotate(-45deg)',
                  }}
                  aria-label="Go to contact page"
                />
              ))}
              
              {/* Projects on top-left edge - rotated -45deg */}
              <div 
                className="absolute text-black homepage-projects-text"
                style={{
                  top: '8%',
                  left: '50%',
                  transform: 'rotate(-45deg)',
                  transformOrigin: 'top left',
                  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(2px, 0.4vw, 5px)',
                    alignItems: 'flex-end',
                  }}
                >
                  {/* Projects */}
                  <div 
                    className="homepage-projects-list"
                    style={{
                      display: 'flex',
                      gap: 'clamp(8px, 1vw, 16px)',
                      fontSize: 'clamp(7px, 0.9vw, 11px)',
                      lineHeight: '1.4',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {allProjects.map((project, idx) => {
                      const slug = project.slug?.current?.toLowerCase() || project.title?.toLowerCase() || ''
                      let bgColor = 'transparent'
                      
                      if (slug === 'projects') bgColor = '#fef08a'
                      else if (slug === 'work') bgColor = '#bfdbfe'
                      else if (slug === 'exhibitions') bgColor = '#fce7f3'
                      else if (slug === 'print') bgColor = '#d1fae5'
                      
                      return (
                        <ProjectLink key={idx} project={project} bgColor={bgColor} />
                      )
                    })}
                  </div>
                </div>
              </div>
              
              {/* Services on bottom-right edge - rotated +45deg (opposite) */}
              <div 
                className="absolute text-black homepage-services"
                style={{
                  bottom: '8%',
                  right: '50%',
                  transform: 'rotate(45deg)',
                  transformOrigin: 'bottom right',
                  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                }}
              >
                <div 
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'clamp(2px, 0.4vw, 5px)',
                    alignItems: 'flex-start',
                  }}
                >
                  {/* Services header */}
                  <div 
                    className="homepage-services-line"
                    style={{
                      fontSize: 'clamp(7px, 0.9vw, 11px)',
                      lineHeight: '1.4',
                      letterSpacing: '0.1px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    services
                  </div>
                  
                  {/* Services line 1 */}
                  <div 
                    className="homepage-services-line"
                    style={{
                      fontSize: 'clamp(7px, 0.9vw, 11px)',
                      lineHeight: '1.4',
                      letterSpacing: '0.1px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    image · video · identity · book · magazine · print · poster · retail graphics
                  </div>
                  
                  {/* Services line 2 */}
                  <div 
                    className="homepage-services-line"
                    style={{
                      fontSize: 'clamp(7px, 0.9vw, 11px)',
                      lineHeight: '1.4',
                      letterSpacing: '0.1px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    brand design · brand strategy · content direction · type design · product
                  </div>
                  
                  {/* Services line 3 */}
                  <div 
                    className="homepage-services-line"
                    style={{
                      fontSize: 'clamp(7px, 0.9vw, 11px)',
                      lineHeight: '1.4',
                      letterSpacing: '0.1px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    design · creative direction
                  </div>
                </div>
              </div>
              
              
              {/* Large name on right side */}
              <div 
                className="absolute text-black font-bold homepage-name"
                style={{
                  top: '20%',
                  right: '20%',
                  transform: 'rotate(-45deg)',
                  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                  fontSize: 'clamp(24px, 5vw, 56px)',
                  letterSpacing: '-1px',
                  whiteSpace: 'nowrap',
                }}
              >
                harper slone
              </div>
            </div>
            
            {/* Location - STRAIGHT text at bottom, outside the diamond */}
            <div 
              className="absolute text-black homepage-location-straight"
              style={{
                bottom: '2%',
                left: '50%',
                transform: 'translateX(-50%)',
                fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                fontSize: 'clamp(8px, 1vw, 11px)',
                lineHeight: '1.4',
                letterSpacing: '0.1px',
                whiteSpace: 'nowrap',
                textAlign: 'center',
              }}
            >
              based in paris · available worldwide
            </div>
        </div>
      </main>
      </div>
    </div>
  )
}
