'use client'

interface ClickableDotProps {
  color: string
  slug: string
  size: number
  top: number
  left: number
}

export default function ClickableDot({ color, slug, size, top, left }: ClickableDotProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Find the sidebar button for this project and click it
    setTimeout(() => {
      const sidebar = document.querySelector('aside')
      if (!sidebar) return
      
      // Find all buttons in the sidebar
      const buttons = Array.from(sidebar.querySelectorAll('button'))
      
      // Look for button that matches the slug
      // The button text should match the project title
      const slugMap: Record<string, string> = {
        'work': 'work',
        'projects': 'projects',
        'exhibitions': 'exhibitions',
        'print': 'print'
      }
      
      const targetText = slugMap[slug] || slug
      
      buttons.forEach((button) => {
        const span = button.querySelector('span')
        const text = span?.textContent?.toLowerCase().trim() || button.textContent?.toLowerCase().trim() || ''
        
        // Check if this button matches our slug
        if (text === targetText || text === slug.toLowerCase()) {
          button.click()
          return
        }
      })
    }, 10)
  }

  return (
    <button
      onClick={handleClick}
      className="absolute rounded-full hover:opacity-80 transition-opacity cursor-red-dot z-20"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color,
        top: `${top}%`,
        left: `${left}%`,
        transform: 'rotate(-45deg)',
      }}
      aria-label={`Open ${slug} project`}
    />
  )
}

