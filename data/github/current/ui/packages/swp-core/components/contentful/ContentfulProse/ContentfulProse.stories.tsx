import '@primer/react-brand/lib/css/main.css'

import {BLOCKS} from '@contentful/rich-text-types'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulProse} from './ContentfulProse'

const meta: Meta<typeof ContentfulProse> = {
  title: 'Mkt/Swp/Contentful/ContentfulProse',
  component: ContentfulProse,
}

export default meta

type Story = StoryObj<typeof ContentfulProse>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentProse',
          },
        },
        id: 'primer-prose',
      },
      fields: {
        text: {
          data: {},
          content: [
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'Hello, world!',
                  nodeType: 'text',
                },
              ],
              nodeType: BLOCKS.HEADING_1,
            },
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'This is a paragraph.',
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
