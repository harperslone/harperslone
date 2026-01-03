'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

interface SubProject {
  _key: string
  pv?: string
  title?: string
  description?: string
}

interface SidebarProject {
  _id: string
  title: string
  slug: {
    current: string
  }
  subProjects?: SubProject[]
}

interface SidebarNavigationProps {
  projects: SidebarProject[]
}

export default function SidebarNavigation({ projects }: SidebarNavigationProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Filter out excluded projects and identify main navigation items
  const excludedSlugs = ['books', 'fashion', 'the-parisian-vintage']
  const mainNavItems = projects.filter(project => {
    const slug = project.slug?.current?.toLowerCase() || ''
    return !excludedSlugs.includes(slug)
  })

  // Debug: Log work project data in sidebar
  useEffect(() => {
    const workProject = mainNavItems.find(p => p.slug?.current?.toLowerCase() === 'work')
    if (workProject) {
      console.log('SidebarNavigation - Work project:', {
        title: workProject.title,
        subProjectsCount: workProject.subProjects?.length,
        subProjects: workProject.subProjects?.map(sp => ({
          _key: sp._key,
          title: sp.title,
          pv: sp.pv
        }))
      })
    }
  }, [mainNavItems])

  return (
    <>
      {/* Mobile menu button - visible hamburger icon */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed z-50 bg-white border-2 border-black rounded-md shadow-lg mobile-menu-btn"
        style={{ 
          top: '52px', 
          left: '10px', 
          padding: '8px 12px',
          minWidth: '44px',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        aria-label="Toggle menu"
      >
        <span className="text-black font-bold" style={{ fontSize: '18px' }}>☰</span>
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside 
        className={`fixed md:relative w-48 md:w-56 border-r border-black bg-white overflow-y-auto z-40 md:z-auto transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        style={{ height: '100%', minHeight: 'calc(100vh - 42px)' }}
      >
        <div className="p-8 md:p-12 flex flex-col h-full">
        <ul className="space-y-2 flex-1">
          {mainNavItems.map((project) => {
            const isOpen = openItems.has(project._id)
            const hasSubProjects = project.subProjects && project.subProjects.length > 0
            const isProjects = project.slug.current?.toLowerCase() === 'projects' || 
                              project.title?.toLowerCase() === 'projects'
            const isWork = project.slug.current?.toLowerCase() === 'work' || 
                          project.title?.toLowerCase() === 'work'
            const isExhibitions = project.slug.current?.toLowerCase() === 'exhibitions' || 
                                 project.title?.toLowerCase() === 'exhibitions' ||
                                 project.title?.toLowerCase() === 'exhibition'
            const isPrint = project.slug.current?.toLowerCase() === 'print' || 
                           project.title?.toLowerCase() === 'print'

            return (
              <li key={project._id} className="space-y-1">
                {/* Main Navigation Item */}
                <div className="flex items-center justify-between">
                  {hasSubProjects ? (
                    <button
                      onClick={() => toggleItem(project._id)}
                      className="flex-1 text-left group hover:opacity-80 transition-opacity cursor-pointer"
                    >
                      <span 
                        className="lowercase text-black"
                        style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em' }}
                      >
                        {project.title.toLowerCase()}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={isProjects ? '/projects' : `/projects/${project.slug.current}`}
                      className="flex-1 block group hover:opacity-80 transition-opacity"
                    >
                      <span 
                        className="lowercase text-black"
                        style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'Arial, Helvetica, sans-serif', letterSpacing: '0.02em' }}
                      >
                        {project.title.toLowerCase()}
                      </span>
                    </Link>
                  )}
                  {hasSubProjects && (
                    <div className="ml-2 relative" style={{ width: '16px', height: '16px' }}>
                      {isOpen ? (
                        <span className="text-black" style={{ fontSize: '10px', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                          −
                        </span>
                      ) : (
                        <>
                          {/* Single dot - yellow for projects, pale pink for exhibitions, pale green for print, blue for work */}
                          <div className="absolute rounded-full" style={{ 
                            backgroundColor: isProjects ? '#fef08a' : isExhibitions ? '#fce7f3' : isPrint ? '#d1fae5' : '#bfdbfe',
                            width: '8px',
                            height: '8px',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)'
                          }}></div>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Sub Navigation - Appears Below Main Item */}
                {isOpen && hasSubProjects && (
                  <ul className="ml-4 mt-1 space-y-2">
                    {project.subProjects
                      ?.filter((subProject) => {
                        // Filter out rivegaucherivedroit from print project
                        const subProjectTitle = (subProject.title || subProject.pv || '').toLowerCase()
                        const isPrint = project.slug.current?.toLowerCase() === 'print' || 
                                       project.title?.toLowerCase() === 'print'
                        if (isPrint && subProjectTitle === 'rivegaucherivedroit') {
                          return false
                        }
                        return true
                      })
                      ?.map((subProject, index) => {
                      // Create a slug from the sub-project title or pv
                      const createSlug = (text: string) => {
                        // For Japanese characters, use the exact title (Next.js will handle URL encoding)
                        const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)
                        if (hasJapanese) {
                          // Return the exact title - Next.js Link component will handle encoding
                          return text
                        }
                        // For non-Japanese, use the standard slug format
                        return text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '')
                      }
                      
                      const subProjectTitle = subProject.title || subProject.pv || subProject.description || 'untitled'
                      const subProjectSlug = createSlug(subProjectTitle)
                      const subProjectHref = `/projects/${project.slug.current}/${subProjectSlug}`
                      
                      // Debug log for ALL work subprojects
                      if (isWork) {
                        console.log(`Work subproject ${index}:`, {
                          _key: subProject._key,
                          title: subProject.title,
                          pv: subProject.pv,
                          subProjectTitle,
                          subProjectSlug,
                          fullSubProject: subProject
                        })
                      }
                      
                      // Check if _key exists
                      if (!subProject._key) {
                        console.error('Subproject missing _key:', subProject)
                      }
                      
                      return (
                        <li key={subProject._key || `subproject-${index}`}>
                          <Link
                            href={subProjectHref}
                            className="block hover:opacity-80 transition-opacity"
                          >
                            <span 
                              className="font-normal lowercase text-90s text-black"
                              style={{ fontSize: '13px' }}
                            >
                              {subProjectTitle.toLowerCase()}
                            </span>
                          </Link>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </div>
      </aside>
    </>
  )
}

