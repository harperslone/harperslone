'use client'

export default function GalleryDebug({ items }: { items: any[] }) {
  if (process.env.NODE_ENV === 'development') {
    console.log('Gallery Debug - Items:', items)
    items.forEach((item, index) => {
      console.log(`Item ${index}:`, {
        _type: item?._type,
        _key: item?._key,
        hasAsset: !!item?.asset,
        assetUrl: item?.asset?.url,
        mimeType: item?.asset?.mimeType,
        hasDimensions: !!item?.asset?.metadata?.dimensions,
        fullItem: item
      })
    })
  }
  return null
}
















