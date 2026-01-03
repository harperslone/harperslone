import { MetadataRoute } from 'next'
import { client } from '@/lib/sanity/client'

interface Project {
  slug: { current: string }
  subProjects?: { title?: string; pv?: string }[]
}

function createSlug(text: string): string {
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)
  if (hasJapanese) return text
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.harperslone.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
  ]

  // Fetch projects from Sanity
  let projectPages: MetadataRoute.Sitemap = []
  try {
    const projects = await client.fetch<Project[]>(`*[_type == "project"] {
      slug,
      subProjects[] {
        title,
        pv
      }
    }`)

    // Add project pages
    for (const project of projects) {
      if (project.slug?.current) {
        projectPages.push({
          url: `${baseUrl}/projects/${project.slug.current}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.7,
        })

        // Add sub-project pages
        if (project.subProjects) {
          for (const subProject of project.subProjects) {
            const subTitle = subProject.title || subProject.pv
            if (subTitle) {
              const subSlug = createSlug(subTitle)
              projectPages.push({
                url: `${baseUrl}/projects/${project.slug.current}/${subSlug}`,
                lastModified: new Date(),
                changeFrequency: 'weekly',
                priority: 0.6,
              })
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('Error fetching projects for sitemap:', error)
  }

  return [...staticPages, ...projectPages]
}

