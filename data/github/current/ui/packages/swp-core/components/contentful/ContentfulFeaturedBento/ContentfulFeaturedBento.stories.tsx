import '@primer/react-brand/lib/css/main.css'

import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulFeaturedBento} from './ContentfulFeaturedBento'
import {BLOCKS, MARKS} from '@contentful/rich-text-types'

const meta: Meta<typeof ContentfulFeaturedBento> = {
  title: 'Mkt/Swp/Contentful/ContentfulFeaturedBento',
  component: ContentfulFeaturedBento,
}

export default meta

type Story = StoryObj<typeof ContentfulFeaturedBento>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'featuredBento',
          },
        },
        id: 'primer-component-bento',
      },
      fields: {
        icon: 'feed-forked',
        title: 'The enterprise-ready platform that developers know and love.',
        heading: {
          data: {},
          content: [
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'Everything you need to know about ',
                  nodeType: 'text',
                },
              ],
              nodeType: BLOCKS.PARAGRAPH,
            },
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [{type: MARKS.ITALIC}],
                  value: 'getting started with GitHub Actions.',
                  nodeType: 'text',
                },
              ],
              nodeType: BLOCKS.PARAGRAPH,
            },
          ],
          nodeType: BLOCKS.DOCUMENT,
        },
        link: {
          sys: {
            contentType: {
              sys: {
                id: 'link',
              },
            },
            id: 'link-id',
          },
          fields: {
            href: 'https://primer.style/brand',
            text: 'Some really cool link',
            openInNewTab: false,
          },
        },
        image: {
          fields: {
            description: 'A placeholder image',
            file: {
              url: 'https://images.placeholders.dev/?width=200&height=200&text=Hero&bgColor=%000000&textColor=%236d6e71',
            },
          },
        },
      },
    },
  },
}
export const WithoutImage: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'featuredBento',
          },
        },
        id: 'primer-component-bento',
      },
      fields: {
        icon: 'feed-forked',
        title: 'The enterprise-ready platform that developers know and love.',
        heading: {
          data: {},
          content: [
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'Everything you need to know about ',
                  nodeType: 'text',
                },
              ],
              nodeType: BLOCKS.PARAGRAPH,
            },
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [{type: MARKS.ITALIC}],
                  value: 'getting started with GitHub Actions.',
                  nodeType: 'text',
                },
              ],
              nodeType: BLOCKS.PARAGRAPH,
            },
          ],
          nodeType: BLOCKS.DOCUMENT,
        },

        link: {
          sys: {
            contentType: {
              sys: {
                id: 'link',
              },
            },
            id: 'link-id',
          },
          fields: {
            href: 'https://primer.style/brand',
            text: 'Some really cool link',
            openInNewTab: false,
          },
        },
      },
    },
  },
}
