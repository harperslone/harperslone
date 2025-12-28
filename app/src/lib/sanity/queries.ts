import groq from 'groq'

export const postsQuery = groq`*[_type == "post"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  author,
  publishedAt,
  mainImage,
  body
}`

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
  body,
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

export const projectsByCategoryQuery = groq`*[_type == "project" && category == $category] | order(number asc) {
  _id,
  number,
  title,
  slug,
  year,
  category,
  description,
  mainImage,
  images,
  tags
}`
