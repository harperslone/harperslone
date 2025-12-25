import {PortableTextComponents} from '@portabletext/react'

export const portableTextComponents: PortableTextComponents = {
  block: {
    h1: ({children}) => (
      <h1 className="text-experimental mb-6 mt-12 text-3xl md:text-4xl font-normal text-black dark:text-white">
        {children}
      </h1>
    ),
    h2: ({children}) => (
      <h2 className="text-experimental mb-4 mt-8 text-2xl md:text-3xl font-normal text-black dark:text-white">
        {children}
      </h2>
    ),
    h3: ({children}) => (
      <h3 className="text-experimental mb-3 mt-6 text-xl md:text-2xl font-normal text-black dark:text-white">
        {children}
      </h3>
    ),
    normal: ({children}) => (
      <p className="mb-6 leading-relaxed text-base md:text-lg text-black dark:text-white font-normal">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({children}) => (
      <ul className="mb-4 ml-6 list-disc space-y-2 text-black dark:text-white font-normal">
        {children}
      </ul>
    ),
    number: ({children}) => (
      <ol className="mb-4 ml-6 list-decimal space-y-2 text-black dark:text-white font-normal">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({children}) => (
      <strong className="font-normal text-black dark:text-white">
        {children}
      </strong>
    ),
    em: ({children}) => (
      <em className="italic font-normal">{children}</em>
    ),
    link: ({value, children}) => (
      <a
        href={value?.href}
        className="text-black underline hover:no-underline dark:text-white font-normal"
        target={value?.blank ? '_blank' : undefined}
        rel={value?.blank ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
  },
}

