import {client} from '@/lib/sanity/client'
import {projectBySlugQuery} from '@/lib/sanity/queries'
import {urlFor} from '@/lib/sanity/image'
import {getEmbedUrl} from '@/lib/sanity/video'
import Image from 'next/image'
import Link from 'next/link'
import {PortableText} from '@portabletext/react'
import {notFound} from 'next/navigation'
import {portableTextComponents} from '@/lib/sanity/portable-text-components'
import Navigation from '@/components/Navigation'

async function getProjectsProject() {
  try {
    // First try to get "The Parisian Vintage" project
    let project = await client.fetch(projectBySlugQuery, {slug: 'the-parisian-vintage'})
    
    // If not found, fall back to "projects" project
    if (!project) {
      project = await client.fetch(projectBySlugQuery, {slug: 'projects'})
    }
    
    return project
  } catch (error) {
    console.error('Error fetching projects project:', error)
    return null
  }
}

export default async function ProjectsPage() {
  const project = await getProjectsProject()

  // If it's the "projects" project, show empty page
  if (project && project.slug?.current === 'projects') {
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

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-amber-50 flex flex-col relative">
      <Navigation />

      {/* Main Content */}
      <main className="flex-1 relative z-10 p-8 md:p-12">
        <div className="max-w-4xl">
          {/* Project Header - Upper Left */}
          <div className="mb-8">
            {project.number && (
              <div className="text-black mb-2" style={{ fontSize: '13px' }}>
                {project.number}
              </div>
            )}
            <h1 className="text-black mb-2" style={{ fontSize: '24px', fontWeight: 400 }}>
              {project.title}
            </h1>
            {project.year && (
              <p className="text-black mb-2" style={{ fontSize: '13px' }}>
                {project.year}
              </p>
            )}
            {/* Category */}
            {project.category && (
              <p className="text-black" style={{ fontSize: '13px' }}>
                {project.category}
              </p>
            )}
          </div>

          {/* Main Image */}
          {project.mainImage && (
            <div className="mb-8">
              <Image
                src={urlFor(project.mainImage).width(1200).height(800).url()}
                alt={project.title || 'Project image'}
                width={1200}
                height={800}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Body Content */}
          {project.body && (
            <div className="mb-8" style={{ fontSize: '13px', lineHeight: '1.6' }}>
              <PortableText value={project.body} components={portableTextComponents} />
            </div>
          )}

          {/* Video */}
          {project.video && (
            <div className="mb-8">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={getEmbedUrl(project.video)}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Multiple Videos */}
          {project.videos && project.videos.length > 0 && (
            <div className="space-y-8 mb-8">
              {project.videos.map((videoUrl: string, index: number) => (
                <div key={index} className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    src={getEmbedUrl(videoUrl)}
                    className="absolute top-0 left-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          )}

          {/* Additional Images */}
          {project.images && project.images.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {project.images.map((image: any, index: number) => (
                <div key={index}>
                  <Image
                    src={urlFor(image).width(800).height(600).url()}
                    alt={`${project.title} image ${index + 1}`}
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Gallery */}
          {project.gallery && project.gallery.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {project.gallery.map((item: any, index: number) => (
                <div key={index}>
                  <Image
                    src={urlFor(item).width(800).height(600).url()}
                    alt={item.alt || item.caption || `${project.title} gallery image ${index + 1}`}
                    width={800}
                    height={600}
                    className="w-full h-auto"
                  />
                  {item.caption && (
                    <p className="text-black mt-2" style={{ fontSize: '13px' }}>
                      {item.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Red Dot - Return to Home */}
        <div className="fixed bottom-8 left-8 z-20">
          <Link href="/" className="block w-4 h-4 bg-red-400 rounded-full hover:opacity-80 transition-opacity" title="Return to home">
          </Link>
        </div>
      </main>
    </div>
  )
}

