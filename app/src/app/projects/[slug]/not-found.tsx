import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-black grunge-bg">
      <div className="text-center layout-overlap">
        <div className="text-experimental mb-6 text-8xl md:text-9xl font-black text-black dark:text-white text-grunge">
          404
        </div>
        <h1 className="text-deconstructed mb-8 text-4xl md:text-5xl font-black text-black dark:text-white">
          PROJECT NOT FOUND
        </h1>
        <Link
          href="/"
          className="inline-block grunge-border border-4 border-black px-8 py-4 text-sm uppercase tracking-widest font-black transition-colors hover:bg-black hover:text-white dark:border-white dark:hover:bg-white dark:hover:text-black text-deconstructed-alt"
        >
          BACK TO ARCHIVE
        </Link>
      </div>
    </div>
  )
}
