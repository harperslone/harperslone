import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'n9vrqynh',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN, // You'll need to set this
})

async function addSubProject() {
  try {
    // Get the current work project
    const project = await client.fetch(
      `*[_type == "project" && slug.current == "work"][0]`
    )

    if (!project) {
      console.error('Work project not found')
      return
    }

    // Get existing subProjects
    const existingSubProjects = project.subProjects || []

    // Add the new sub-project
    const updatedSubProjects = [
      ...existingSubProjects,
      {
        _type: 'object',
        pv: 'PV',
        title: '0fr',
        description: '0fr',
      },
    ]

    // Update the project
    await client
      .patch(project._id)
      .set({subProjects: updatedSubProjects})
      .commit()

    console.log('Successfully added 0fr sub-project to work project')
  } catch (error) {
    console.error('Error adding sub-project:', error)
  }
}

addSubProject()


















