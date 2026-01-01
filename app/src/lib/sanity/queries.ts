import {groq} from 'next-sanity'

export const postBySlugQuery = groq`*[_type == "post" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  author,
  publishedAt,
  mainImage,
  body
}`

export const projectsQuery = groq`*[_type == "project"] | order(number asc) {
  _id,
  number,
  title,
  slug,
  year,
  category,
  description,
  mainImage {
    asset->{
      _id,
      url,
      originalFilename,
      mimeType,
      metadata {
        dimensions {
          width,
          height
        }
      }
    }
  },
  images,
  gallery[] {
    _type,
    _key,
    asset->{
      _id,
      url,
      originalFilename,
      mimeType,
      metadata {
        dimensions {
          width,
          height
        }
      }
    },
    caption,
    alt
  },
  tags,
  themes,
  video,
  videos,
  subProjects[] {
    _key,
    pv,
    title,
    description,
    image {
      asset->{
        _id,
        url,
        originalFilename,
        mimeType,
        metadata {
          dimensions {
            width,
            height
          }
        }
      }
    },
    gallery[] {
      _type,
      _key,
      asset->{
        _id,
        url,
        originalFilename,
        mimeType,
        metadata {
          dimensions {
            width,
            height
          }
        }
      },
      caption,
      alt
    }
  }
}`

export const projectBySlugQuery = groq`*[_type == "project" && slug.current == $slug][0] {
  _id,
  number,
  title,
  slug,
  year,
  category,
  description,
  mainImage,
  images,
  gallery,
  tags,
  themes,
  video,
  videos,
  subProjects[] {
    _key,
    pv,
    title,
    description,
    image,
    gallery[] {
      _type,
      _key,
      asset->{
        _id,
        url,
        originalFilename,
        mimeType,
        metadata {
          dimensions {
            width,
            height
          }
        }
      },
      caption,
      alt
    }
  }
}`

