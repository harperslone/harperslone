import {createClient} from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'n9vrqynh',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function addBtsSubProject() {
  try {
    // Get the current work project
    const project = await client.fetch(
      `*[_type == "project" && slug.current == "work"][0]`
    )

    if (!project) {
      console.error('Work project not found')
      return
    }

    // Check if bts subproject already exists
    const existingBts = project.subProjects?.find(
      (sp) => sp.title?.toLowerCase() === 'bts' || sp.pv?.toLowerCase() === 'bts'
    )

    if (existingBts) {
      console.log('bts subproject already exists:', existingBts)
      return
    }

    // Get existing subProjects
    const existingSubProjects = project.subProjects || []

    // Add the new bts sub-project
    const updatedSubProjects = [
      ...existingSubProjects,
      {
        _type: 'object',
        _key: `bts-${Date.now()}`,
        pv: '',
        title: 'bts',
        description: '',
        gallery: []
      },
    ]

    // Update and publish the project
    const result = await client
      .patch(project._id)
      .set({subProjects: updatedSubProjects})
      .commit()

    console.log('Successfully added bts sub-project to work project')
    console.log('Result:', result)
    
    // Publish the document to make it visible
    try {
      await client
        .patch(project._id)
        .set({subProjects: updatedSubProjects})
        .commit()
      
      // Try to publish if there's a draft
      const published = await client.fetch(`*[_id == "${project._id}"][0]`)
      console.log('Current project state:', published?.subProjects?.map(sp => ({ title: sp.title, pv: sp.pv })))
    } catch (publishError) {
      console.log('Publish note:', publishError.message)
    }
  } catch (error) {
    console.error('Error adding bts sub-project:', error)
  }
}

addBtsSubProject()

