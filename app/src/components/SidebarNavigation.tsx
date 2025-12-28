'use client'

import Link from 'next/link'
import { useState } from 'react'

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

  return (
    <aside className="w-48 md:w-56 border-r border-black bg-white overflow-y-auto" style={{ height: 'calc(100vh - 50px)' }}>
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
                        className="font-normal lowercase text-90s text-black"
                        style={{ fontSize: '13px' }}
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
                        className="font-normal lowercase text-90s text-black"
                        style={{ fontSize: '13px' }}
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
                    {project.subProjects?.map((subProject) => {
                      // Create a slug from the sub-project title or pv
                      const createSlug = (text: string) => {
                        return text
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-+|-+$/g, '')
                      }
                      
                      const subProjectTitle = (subProject.title || subProject.pv || subProject.description || 'untitled').toLowerCase()
                      const subProjectSlug = createSlug(subProjectTitle)
                      const subProjectHref = `/projects/${project.slug.current}/${subProjectSlug}`
                      
                      return (
                        <li key={subProject._key}>
                          <Link
                            href={subProjectHref}
                            className="block hover:opacity-80 transition-opacity"
                          >
                            <span 
                              className="font-normal lowercase text-90s text-black"
                              style={{ fontSize: '10px' }}
                            >
                              {subProjectTitle}
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

        {/* Yellow Dot - Return to Home */}
        <div className="mt-auto pt-8">
          <Link href="/" className="block w-4 h-4 bg-yellow-400 rounded-full hover:opacity-80 transition-opacity" title="Return to home">
          </Link>
        </div>
      </div>
    </aside>
  )
}

