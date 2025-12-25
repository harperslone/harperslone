import {client} from '@/lib/sanity/client'
import {postBySlugQuery} from '@/lib/sanity/queries'
import {urlFor} from '@/lib/sanity/image'
import Image from 'next/image'
import {PortableText} from '@portabletext/react'
import Link from 'next/link'
import {notFound} from 'next/navigation'
import {portableTextComponents} from '@/lib/sanity/portable-text-components'

interface Post {
  _id: string
  title: string
  slug: {
    current: string
  }
  author?: string
  publishedAt?: string
  mainImage?: any
  body?: any
}

async function getPost(slug: string) {
  try {
    const post = await client.fetch<Post>(postBySlugQuery, {slug})
    return post
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{slug: string}>
}) {
  const {slug} = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-4 py-16">
        <Link
          href="/"
          className="mb-8 inline-block text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to posts
        </Link>

        <article>
          <h1 className="mb-4 text-4xl font-bold text-black dark:text-zinc-50">
            {post.title}
          </h1>

          <div className="mb-8 flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
            {post.author && <span>By {post.author}</span>}
            {post.publishedAt && (
              <span>
                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>

          {post.mainImage && (
            <div className="relative mb-8 h-96 w-full overflow-hidden rounded-lg">
              <Image
                src={urlFor(post.mainImage).width(1200).height(600).url()}
                alt={post.title}
                fill
                className="object-cover"
              />
            </div>
          )}

          {post.body && (
            <div className="mt-8">
              <PortableText value={post.body} components={portableTextComponents} />
            </div>
          )}
        </article>
      </main>
    </div>
  )
}

