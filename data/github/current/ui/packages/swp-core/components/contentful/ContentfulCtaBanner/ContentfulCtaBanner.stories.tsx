import '@primer/react-brand/lib/css/main.css'

import {BLOCKS} from '@contentful/rich-text-types'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulCtaBanner} from './ContentfulCtaBanner'

const meta: Meta<typeof ContentfulCtaBanner> = {
  title: 'Mkt/Swp/Contentful/ContentfulCtaBanner',
  component: ContentfulCtaBanner,
}

export default meta

type Story = StoryObj<typeof ContentfulCtaBanner>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentCtaBanner',
          },
        },
        id: 'primer-component-cta-banner',
      },
      fields: {
        align: 'center',
        description: {
          data: {},
          content: [
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value:
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sapien sit ullamcorper id. Aliquam luctus sed turpis felis nam pulvinar risus elementum.',
                  nodeType: 'text',
                },
              ],
              nodeType: BLOCKS.PARAGRAPH,
            },
          ],
          nodeType: BLOCKS.DOCUMENT,
        },
        hasBorder: true,
        hasBackground: true,
        heading: 'Where the most ambitious teams build great things',
        callToActionPrimary: {
          sys: {
            contentType: {
              sys: {
                id: 'link',
              },
            },
            id: 'cta-primary',
          },
          fields: {
            href: 'https://primer.style/brand',
            text: 'Primary CTA',
          },
        },
        callToActionSecondary: {
          sys: {
            contentType: {
              sys: {
                id: 'link',
              },
            },
            id: 'cta-primary',
          },
          fields: {
            href: 'https://primer.style/brand',
            text: 'Secondary CTA',
          },
        },
      },
    },
  },
}
