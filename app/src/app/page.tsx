import {client} from '@/lib/sanity/client'
import {projectsQuery} from '@/lib/sanity/queries'
import Link from 'next/link'

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

// Color palette: pale yellow, pale blue, silver, red
const pastelColors = [
  { class: 'text-yellow-200', color: '#fef08a' }, // pale yellow
  { class: 'text-blue-200', color: '#bfdbfe' }, // pale blue
  { class: 'text-gray-300', color: '#d1d5db' }, // silver
  { class: 'text-red-400', color: '#f87171' }, // red
]

export default async function Home() {
  const projects = await getProjects()

  return (
    <div className="min-h-screen bg-white dark:bg-black flex">
      {/* Left Sidebar - Project Descriptions in Column */}
      <aside className="w-64 md:w-80 border-r border-black dark:border-white bg-white dark:bg-black sticky top-0 h-screen overflow-y-auto">
        {/* Project List - Red Text Overlay Style */}
        <div className="p-8 md:p-12">
          {projects.length === 0 ? (
            <p className="text-sm text-black dark:text-white">
              No projects found. Create your first project in the{' '}
              <a
                href="http://localhost:3333"
                className="underline font-bold"
                target="_blank"
                rel="noopener noreferrer"
              >
                Sanity Studio
              </a>
              .
            </p>
          ) : (
            <ul className="space-y-3">
              {projects.map((project, index) => {
                const color = pastelColors[index % pastelColors.length]
                return (
                  <li key={project._id}>
                    <Link
                      href={`/projects/${project.slug.current}`}
                      className="block group hover:opacity-80 transition-opacity"
                    >
                      <span 
                        className={`text-sm md:text-base ${color.class} font-normal font-sans lowercase`}
                        style={{ color: color.color }}
                      >
                        {project.description || project.title}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </aside>

      {/* Main Content Area - Name and Bio */}
      <main className="flex-1 flex items-center justify-center p-12">
        <div className="text-center max-w-2xl">
          <h1 className="text-experimental text-5xl md:text-7xl lg:text-8xl font-normal text-black dark:text-white leading-tight mb-8">
            Harper Slone
          </h1>
          <p className="text-experimental text-base md:text-lg font-normal text-black dark:text-white leading-relaxed">
            Slone (b. 2001) is a visual artist and photographer, whose practice is driven
            by intuition and color-based inspiration. Capturing the beauty of her physical environment while also
            conjuring imagined spaces through her work.
          </p>
        </div>
      </main>
    </div>
  )
}
