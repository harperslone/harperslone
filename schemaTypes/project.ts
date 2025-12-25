import {defineField, defineType} from 'sanity'

export default defineType({
  name: 'project',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'number',
      title: 'Number',
      type: 'string',
      description: 'Project number (e.g., Nº01, Nº02)',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'year',
      title: 'Year',
      type: 'number',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          {title: 'Feature', value: 'feature'},
          {title: 'Look', value: 'look'},
          {title: 'Exhibition', value: 'exhibition'},
          {title: 'Publication', value: 'publication'},
          {title: 'Video', value: 'video'},
        ],
      },
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
    }),
    defineField({
      name: 'mainImage',
      title: 'Main Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true,
          },
        },
      ],
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'array',
      of: [
        {
          type: 'block',
        },
      ],
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'video',
      title: 'Video URL',
      type: 'url',
      description: 'Embed URL for a single video (YouTube, Vimeo, etc.)',
    }),
    defineField({
      name: 'videos',
      title: 'Videos',
      type: 'array',
      of: [{type: 'url'}],
      description: 'Multiple video embed URLs',
    }),
  ],
  preview: {
    select: {
      number: 'number',
      title: 'title',
      year: 'year',
      media: 'mainImage',
    },
    prepare(selection) {
      const {number, title, year} = selection
      return {
        ...selection,
        title: number ? `${number} ${title}` : title,
        subtitle: year ? year.toString() : '',
      }
    },
  },
  orderings: [
    {
      title: 'Number',
      name: 'numberAsc',
      by: [{field: 'number', direction: 'asc'}],
    },
    {
      title: 'Year',
      name: 'yearDesc',
      by: [{field: 'year', direction: 'desc'}],
    },
  ],
})

