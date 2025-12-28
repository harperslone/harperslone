import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-black dark:text-zinc-50">
          Post Not Found
        </h1>
        <p className="mb-8 text-zinc-600 dark:text-zinc-400">
          The post you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Back to Posts
        </Link>
      </div>
    </div>
  )
}







