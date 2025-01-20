import '@primer/react-brand/lib/css/main.css'

import {BLOCKS} from '@contentful/rich-text-types'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulPillar} from './ContentfulPillar'

const meta: Meta<typeof ContentfulPillar> = {
  title: 'Mkt/Swp/Contentful/ContentfulPillar',
  component: ContentfulPillar,
}

export default meta

type Story = StoryObj<typeof ContentfulPillar>

export const Default: Story = {
  args: {
    asCard: false,
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentPillar',
          },
        },
        id: 'primer-component-pillar',
      },
      fields: {
        align: 'center',
        heading: 'Collaboration is the key to DevOps success',
        description: {
          data: {},
          content: [
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'Everything you need to know about getting started with GitHub Actions.',
                  nodeType: 'text',
                },
              ],
              nodeType: BLOCKS.PARAGRAPH,
            },
          ],
          nodeType: BLOCKS.DOCUMENT,
        },
        icon: 'zap',
        link: {
          sys: {id: '123', contentType: {sys: {id: 'link'}}},
          fields: {href: 'https://github.com', text: 'Learn More', openInNewTab: false},
        },
      },
    },
  },
}
