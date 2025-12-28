import {client} from '@/lib/sanity/client'
import {projectsQuery} from '@/lib/sanity/queries'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
import SidebarNavigation from '@/components/SidebarNavigation'

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
  const allProjects = await getProjects()

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      <Navigation />
      
      <div className="relative z-10 flex w-full flex-1">
      {/* Left Sidebar - Navigation with Expandable Items */}
      <SidebarNavigation projects={allProjects} />

      {/* Main Content Area - Empty */}
      <main className="flex-1 relative z-10">
      </main>
      </div>
    </div>
  )
}
