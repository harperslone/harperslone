import {createClient} from '@sanity/client'

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'n9vrqynh',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
})

async function checkBts() {
  try {
    // Get the work project with all subprojects
    const project = await client.fetch(
      `*[_type == "project" && slug.current == "work"][0] {
        _id,
        title,
        slug,
        subProjects[] {
          _key,
          pv,
          title,
          description
        }
      }`
    )

    if (!project) {
      console.error('Work project not found')
      return
    }

    console.log('Work project:', {
      title: project.title,
      slug: project.slug?.current,
      subProjectsCount: project.subProjects?.length || 0,
      subProjects: project.subProjects?.map(sp => ({
        _key: sp._key,
        title: sp.title,
        pv: sp.pv
      }))
    })

    const btsSubProject = project.subProjects?.find(
      (sp) => sp.title?.toLowerCase() === 'bts' || sp.pv?.toLowerCase() === 'bts'
    )

    if (btsSubProject) {
      console.log('\n✅ bts subproject found:', btsSubProject)
    } else {
      console.log('\n❌ bts subproject NOT found in work project')
    }
  } catch (error) {
    console.error('Error checking bts:', error)
  }
}

checkBts()














