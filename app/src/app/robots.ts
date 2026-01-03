import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/cart/'],
    },
    sitemap: 'https://www.harperslone.com/sitemap.xml',
  }
}

