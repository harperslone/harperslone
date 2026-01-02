'use client'

interface ProjectLinkProps {
  project: {
    slug: { current: string }
    title?: string
  }
  bgColor: string
}

export default function ProjectLink({ project, bgColor }: ProjectLinkProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Find the sidebar button for this project and click it
    setTimeout(() => {
      const sidebar = document.querySelector('aside')
      if (!sidebar) return
      
      const buttons = Array.from(sidebar.querySelectorAll('button'))
      const slug = project.slug?.current?.toLowerCase() || ''
      const title = project.title?.toLowerCase() || ''
      
      buttons.forEach((button) => {
        const span = button.querySelector('span')
        const text = span?.textContent?.toLowerCase().trim() || button.textContent?.toLowerCase().trim() || ''
        
        if (text === slug || text === title) {
          button.click()
          return
        }
      })
    }, 10)
  }

  return (
    <button
      onClick={handleClick}
      className="inline-block hover:opacity-70 transition-opacity cursor-red-dot homepage-project-link"
      style={{ 
        fontSize: 'clamp(9px, 1.1vw, 13px)',
        color: '#000000',
        backgroundColor: bgColor,
        borderRadius: '50%',
        padding: '4px 12px',
        display: 'inline-block',
        border: 'none',
        background: bgColor !== 'transparent' ? bgColor : 'transparent',
        marginBottom: '0',
        marginLeft: '0',
        paddingLeft: '0',
      }}
    >
      {project.title?.toLowerCase() || ''}
    </button>
  )
}

