import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/cart/'],
      },
      {
        // Allow AI crawlers full access
        userAgent: ['GPTBot', 'ChatGPT-User', 'Claude-Web', 'Anthropic-AI', 'CCBot'],
        allow: '/',
      },
    ],
    sitemap: 'https://www.harperslone.com/sitemap.xml',
    host: 'https://www.harperslone.com',
  }
}

