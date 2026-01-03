/**
 * Converts a video URL to an embeddable URL
 * Supports YouTube and Vimeo
 */
export function getEmbedUrl(url: string | null | undefined): string {
  if (!url) return ''
  
  // YouTube URLs
  // Formats: 
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}`
  }
  
  // Vimeo URLs
  // Formats:
  // - https://vimeo.com/VIDEO_ID
  // - https://player.vimeo.com/video/VIDEO_ID
  const vimeoMatch = url.match(/(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/)
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }
  
  // If it's already an embed URL or unknown format, return as-is
  return url
}


