import {PortableTextComponents} from '@portabletext/react'
import {urlFor} from './image'
import Image from 'next/image'

export const portableTextComponents: PortableTextComponents = {
  types: {
    image: ({value}) => {
      if (!value?.asset) {
        return null
      }
      return (
        <div className="my-8">
          <Image
            src={urlFor(value).width(1200).height(800).url()}
            alt={value.alt || 'Image'}
            width={1200}
            height={800}
            className="w-full h-auto"
          />
        </div>
      )
    },
  },
  marks: {
    link: ({value, children}) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined
      return (
        <a href={value?.href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined}>
          {children}
        </a>
      )
    },
  },
}

