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

  // Generate small scattered squares (like musica viva 1959 poster)
  const scatteredSquares = [
    { color: '#3b82f6', top: 8, left: 75 },   // blue
    { color: '#ef4444', top: 18, left: 62 },  // red
    { color: '#fbbf24', top: 22, left: 78 },  // yellow
    { color: '#ef4444', top: 28, left: 55 },  // red
    { color: '#3b82f6', top: 32, left: 42 },  // blue
    { color: '#000000', top: 38, left: 58 },  // black
    { color: '#fbbf24', top: 42, left: 35 },  // yellow
    { color: '#3b82f6', top: 45, left: 72 },  // blue
    { color: '#ef4444', top: 52, left: 48 },  // red
    { color: '#fbbf24', top: 55, left: 65 },  // yellow
    { color: '#000000', top: 58, left: 38 },  // black
    { color: '#3b82f6', top: 62, left: 55 },  // blue
    { color: '#ef4444', top: 68, left: 42 },  // red
    { color: '#000000', top: 72, left: 62 },  // black
    { color: '#fbbf24', top: 78, left: 52 },  // yellow
  ]

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col relative overflow-hidden">
      <Navigation />
      
      <div className="relative z-10 flex w-full" style={{ minHeight: 'calc(100vh - 42px)' }}>
        {/* Left Sidebar - Navigation with Expandable Items */}
        <SidebarNavigation projects={allProjects} />

        {/* Main Content Area - Swiss Style Poster Design */}
        <main className="flex-1 relative z-10 flex items-center justify-center p-8 md:p-16">
          <div className="relative w-full max-w-4xl" style={{ aspectRatio: '1/1', maxHeight: '90vh' }}>
            {/* Dark gray corners */}
            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-gray-400 z-0" style={{ clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}></div>
            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gray-400 z-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }}></div>
            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gray-400 z-0" style={{ clipPath: 'polygon(0 0, 0 100%, 100% 100%)' }}></div>
            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gray-400 z-0" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 100%)' }}></div>
            
            {/* White rotated square (diamond) */}
            <div 
              className="absolute top-1/2 left-1/2 bg-white z-10"
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
                  className="absolute rounded-full hover:opacity-80 transition-opacity cursor-red-dot z-20"
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
              
              {/* Swiss Style text content - inside the white diamond */}
              <div 
                className="absolute text-black"
                style={{
                  bottom: '15%',
                  left: '15%',
                  transform: 'rotate(-45deg)',
                  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
                  maxWidth: '40%',
                }}
              >
                {/* Header info */}
                <div style={{ fontSize: 'clamp(6px, 0.8vw, 9px)', lineHeight: '1.4', letterSpacing: '0.3px', marginBottom: 'clamp(4px, 0.5vw, 8px)' }}>
                  <div>archive design portfolio</div>
                  <div>2024</div>
                </div>
                
                {/* Name - Large */}
                <div className="font-bold" style={{ fontSize: 'clamp(16px, 3vw, 32px)', letterSpacing: '-0.5px', marginBottom: 'clamp(8px, 1vw, 16px)' }}>
                  harper slone
                </div>
                
                {/* Services - horizontal layout */}
                <div style={{ fontSize: 'clamp(5px, 0.6vw, 7px)', lineHeight: '1.5', letterSpacing: '0.2px', marginBottom: 'clamp(8px, 1vw, 16px)' }}>
                  <div>image · video · identity · book · magazine</div>
                  <div>print · poster · retail graphics · brand design</div>
                  <div>brand strategy · content direction · type design</div>
                  <div>product design · creative direction · styling</div>
                </div>
                
                {/* Projects */}
                <div style={{ fontSize: 'clamp(5px, 0.6vw, 7px)', marginBottom: 'clamp(8px, 1vw, 16px)' }}>
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
                
                {/* Location */}
                <div style={{ fontSize: 'clamp(5px, 0.6vw, 7px)', letterSpacing: '0.2px' }}>
                  <div>based in paris · available worldwide</div>
                </div>
              </div>
            </div>
        </div>
      </main>
      </div>
    </div>
  )
}
