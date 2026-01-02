import {createClient} from '@sanity/client'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim()
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET?.trim()
const apiVersionEnv = process.env.NEXT_PUBLIC_SANITY_API_VERSION?.trim()
const apiVersion = (apiVersionEnv && /^\d{4}-\d{2}-\d{2}$/.test(apiVersionEnv)) 
  ? apiVersionEnv 
  : '2024-01-01'

if (!projectId) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable')
}

if (!dataset) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET environment variable')
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Set to false to avoid caching issues - ensures fresh data
})

