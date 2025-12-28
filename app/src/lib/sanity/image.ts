import imageUrlBuilder from '@sanity/image-url'
import {client} from './client'
import type {SanityImageSource} from '@sanity/image-url'

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

