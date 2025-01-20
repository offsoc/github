import '@primer/react-brand/lib/css/main.css'

import {BLOCKS} from '@contentful/rich-text-types'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulTestimonial} from './ContentfulTestimonial'

const meta: Meta<typeof ContentfulTestimonial> = {
  title: 'Mkt/Swp/Contentful/ContentfulTestimonial',
  component: ContentfulTestimonial,
}

export default meta

type Story = StoryObj<typeof ContentfulTestimonial>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentTestimonial',
          },
        },
        id: 'primer-component-testimonial',
      },
      fields: {
        author: {
          sys: {
            contentType: {
              sys: {
                id: 'person',
              },
            },
            id: 'person',
          },
          fields: {
            fullName: 'John Doe',
            position: 'CEO',
          },
        },
        size: 'large',
        quote: {
          data: {},
          content: [
            {
              data: {},
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'This is my super sweet testimonial',
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
