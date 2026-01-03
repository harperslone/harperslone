import { NextResponse } from 'next/server'
import { client } from '@/lib/sanity/client'

export async function GET() {
  try {
    const projects = await client.fetch(`*[_type == "project"] {
      title,
      "slug": slug.current,
      description,
      category,
      subProjects[] {
        title,
        pv,
        description
      }
    }`)

    const formattedProjects = projects.map((project: any) => ({
      title: project.title,
      slug: project.slug,
      description: project.description || null,
      category: project.category || null,
      url: `https://www.harperslone.com/projects/${project.slug}`,
      subProjects: project.subProjects?.map((sp: any) => ({
        title: sp.title || sp.pv,
        description: sp.description || null,
      })) || [],
    }))

    return NextResponse.json({
      total: formattedProjects.length,
      projects: formattedProjects,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

