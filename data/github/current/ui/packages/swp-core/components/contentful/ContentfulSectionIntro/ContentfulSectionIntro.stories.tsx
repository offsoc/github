import '@primer/react-brand/lib/css/main.css'

import {BLOCKS} from '@contentful/rich-text-types'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulSectionIntro} from './ContentfulSectionIntro'

const meta: Meta<typeof ContentfulSectionIntro> = {
  title: 'Mkt/Swp/Contentful/ContentfulSectionIntro',
  component: ContentfulSectionIntro,
}

export default meta

type Story = StoryObj<typeof ContentfulSectionIntro>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentSectionIntro',
          },
        },
        id: 'primer-section-intro',
      },
      fields: {
        align: 'start',
        heading: {
          data: {},
          content: [
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'This is my super sweet SectionIntro heading',
                  nodeType: 'text',
                },
              ],
              nodeType: BLOCKS.PARAGRAPH,
            },
          ],
          nodeType: BLOCKS.DOCUMENT,
        },
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
                    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. In sapien sit id. Aliquam luctus sed turpis felis nam pulvinar risus elementum',
                  nodeType: 'text',
                },
              ],
              nodeType: BLOCKS.PARAGRAPH,
            },
          ],
          nodeType: BLOCKS.DOCUMENT,
        },
      },
    },
  },
}
