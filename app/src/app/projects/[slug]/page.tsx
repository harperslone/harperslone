import {client} from '@/lib/sanity/client'
import {projectBySlugQuery} from '@/lib/sanity/queries'
import {urlFor} from '@/lib/sanity/image'
import Image from 'next/image'
import {notFound} from 'next/navigation'
import Navigation from '@/components/Navigation'

interface SubProject {
  pv?: string
  title?: string
  description?: string
  image?: any
  _key?: string
}

interface Project {
  _id: string
  title: string
  slug: {
    current: string
  }
  subProjects?: SubProject[]
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

export default async function ProjectPage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const {slug} = await params
  
  // If slug is "projects", show empty page
  if (slug === 'projects') {
    return (
      <div className="min-h-screen bg-amber-50 flex flex-col relative">
        <Navigation />
        <main className="flex-1 relative z-10 p-8 md:p-12">
          <div className="max-w-4xl">
            {/* Empty - no content */}
          </div>
        </main>
      </div>
    )
  }

  const project = await getProject(slug)

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col relative">
      <Navigation />

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 p-8 md:p-12">
        <div className="max-w-4xl">
          {/* Only show The Parisian Vintage sub-project image and title */}
          {project.subProjects && Array.isArray(project.subProjects) && project.subProjects.length > 0 && (
            <>
              {project.subProjects
                .filter((subProject: any) => subProject && subProject.title === 'The Parisian Vintage')
                .map((subProject: any, index: number) => (
                  <div key={subProject._key || index}>
                    {/* Image */}
                    {subProject.image && (() => {
                      try {
                        const imageUrl = urlFor(subProject.image)?.width(1200).height(800)?.url()
                        if (!imageUrl) return null
                        return (
                          <div className="mb-4">
                            <Image
                              src={imageUrl}
                              alt={subProject.title || 'The Parisian Vintage'}
                              width={1200}
                              height={800}
                              className="w-full h-auto"
                            />
                          </div>
                        )
                      } catch (error) {
                        console.error('Error rendering sub-project image:', error)
                        return null
                      }
                    })()}
                    
                    {/* Title */}
                    {subProject.title && (
                      <div className="text-black" style={{ fontSize: '16px', fontWeight: 400 }}>
                        {subProject.title.toLowerCase()}
                      </div>
                    )}
                  </div>
                ))}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
