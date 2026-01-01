import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'n9vrqynh',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN, // You may need to set this
})

async function updateProjects() {
  try {
    // Update Books to Projects
    await client
      .patch('a8e018b0-a3a2-4075-a601-b2d060570972')
      .set({
        title: 'Projects',
        description: 'projects',
      })
      .set({slug: {current: 'projects'}})
      .commit()

    // Update Fashion to Print
    await client
      .patch('cb57104b-ec03-4f79-bc46-a9811d2fcc07')
      .set({
        title: 'Print',
        description: 'print',
      })
      .set({slug: {current: 'print'}})
      .commit()

    console.log('Projects updated successfully!')
  } catch (error) {
    console.error('Error updating projects:', error)
  }
}

updateProjects()


















