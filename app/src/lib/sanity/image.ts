import imageUrlBuilder from '@sanity/image-url'
import {client} from './client'
import {SanityImageSource} from '@sanity/image-url/lib/types/types'

const builder = imageUrlBuilder(client)

export function urlFor(source: SanityImageSource | null | undefined) {
  if (!source) {
    return {
      width: () => ({height: () => ({url: () => ''})}),
      height: () => ({width: () => ({url: () => ''})}),
      url: () => '',
    }
  }
  return builder.image(source)
}

