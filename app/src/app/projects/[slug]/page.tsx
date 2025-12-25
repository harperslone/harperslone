import {client} from '@/lib/sanity/client'
import {projectBySlugQuery, projectsQuery} from '@/lib/sanity/queries'
import {urlFor} from '@/lib/sanity/image'
import {getEmbedUrl} from '@/lib/sanity/video'
import Image from 'next/image'
import Link from 'next/link'
import {PortableText} from '@portabletext/react'
import {notFound} from 'next/navigation'
import {portableTextComponents} from '@/lib/sanity/portable-text-components'

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
  mainImage?: any
  images?: any[]
  body?: any
  tags?: string[]
  video?: string
  videos?: string[]
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

// Color palette: pale yellow, pale blue, silver, red
const pastelColors = [
  { class: 'text-yellow-200', color: '#fef08a' }, // pale yellow
  { class: 'text-blue-200', color: '#bfdbfe' }, // pale blue
  { class: 'text-gray-300', color: '#d1d5db' }, // silver
  { class: 'text-red-400', color: '#f87171' }, // red
]

export default async function ProjectPage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const {slug} = await params
  const project = await getProject(slug)
  const allProjects = await getAllProjects()

  if (!project) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black flex">
      {/* Left Sidebar - Project Descriptions in Column */}
      <aside className="w-64 md:w-80 border-r border-black dark:border-white bg-white dark:bg-black sticky top-0 h-screen overflow-y-auto">
        {/* Project List - Minimal Column Style */}
        <div className="p-8 md:p-12">
          <ul className="space-y-3">
            {allProjects.map((p, index) => {
              const color = pastelColors[index % pastelColors.length]
              return (
                <li key={p._id}>
                  <Link
                    href={`/projects/${p.slug.current}`}
                    className={`block group transition-opacity ${
                      p.slug.current === slug
                        ? 'opacity-100'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                  >
                    <span 
                      className={`text-sm md:text-base ${color.class} font-normal font-sans lowercase`}
                      style={{ color: color.color }}
                    >
                      {p.description || p.title}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </aside>

      {/* Main Content Area - Project Details */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="border-b border-black dark:border-white p-8 md:p-12">
          <div>
            <div className="text-experimental text-2xl md:text-3xl font-normal text-black dark:text-white mb-2">
              {project.number || 'Nº'}
            </div>
            <h1 className="text-experimental text-4xl md:text-5xl font-normal text-black dark:text-white leading-tight mb-2">
              {project.title}
            </h1>
            {project.year && (
              <p className="text-sm font-normal text-black dark:text-white">
                {project.year}
              </p>
            )}
          </div>
        </div>

        <div className="p-8 md:p-12 space-y-12">
          {/* Category and Tags */}
          {(project.category || (project.tags && project.tags.length > 0)) && (
            <div className="flex flex-wrap gap-4 text-sm font-normal">
              {project.category && (
                <span className="text-black dark:text-white">
                  {project.category}
                </span>
              )}
              {project.tags && project.tags.length > 0 && (
                <>
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-black dark:text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </>
              )}
            </div>
          )}

          {/* Description */}
          {project.description && (
            <div>
              <p className="text-lg md:text-xl leading-relaxed text-black dark:text-white font-normal">
                {project.description}
              </p>
            </div>
          )}

          {/* Main Image */}
          {project.mainImage && (
            <div className="relative w-full h-[60vh] md:h-[70vh] overflow-hidden mb-16">
              <Image
                src={urlFor(project.mainImage)?.width(1400)?.height(900)?.url() || ''}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Body Content */}
          {project.body && (
            <div>
              <PortableText value={project.body} components={portableTextComponents} />
            </div>
          )}

          {/* Video */}
          {project.video && (() => {
            const embedUrl = getEmbedUrl(project.video)
            if (!embedUrl) return null
            return (
              <div className="relative w-full aspect-video overflow-hidden mb-8">
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={project.title}
                />
              </div>
            )
          })()}

          {/* Multiple Videos */}
          {project.videos && project.videos.length > 0 && (
            <div className="space-y-8">
              {project.videos.map((video: string, index: number) => {
                const embedUrl = getEmbedUrl(video)
                if (!embedUrl) return null
                return (
                  <div
                    key={index}
                  className="relative w-full aspect-video overflow-hidden mb-8"
                  >
                    <iframe
                      src={embedUrl}
                      className="absolute inset-0 w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={`${project.title} - Video ${index + 1}`}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {/* Additional Images Grid */}
          {project.images && project.images.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {project.images.map((image: any, index: number) => {
                const imageUrl = urlFor(image)?.width(800)?.height(600)?.url()
                if (!imageUrl) return null
                return (
                  <div
                    key={index}
                  className={`relative h-64 md:h-80 w-full overflow-hidden ${
                    index % 3 === 1 ? 'md:col-span-2' : ''
                  }`}
                  >
                    <Image
                      src={imageUrl}
                      alt={`${project.title} - Image ${index + 1}`}
                      fill
                    className="object-cover"
                    />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
