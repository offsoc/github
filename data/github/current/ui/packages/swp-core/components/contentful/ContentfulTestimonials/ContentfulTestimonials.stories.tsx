import '@primer/react-brand/lib/css/main.css'

import {BLOCKS} from '@contentful/rich-text-types'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulTestimonials} from './ContentfulTestimonials'

const meta: Meta<typeof ContentfulTestimonials> = {
  title: 'Mkt/Swp/Contentful/ContentfulTestimonials',
  component: ContentfulTestimonials,
}

export default meta

type Story = StoryObj<typeof ContentfulTestimonials>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerTestimonials',
          },
        },
        id: 'primer-testimonials',
      },
      fields: {
        testimonials: [
          {
            sys: {
              contentType: {
                sys: {
                  id: 'primerComponentTestimonial',
                },
              },
              id: 'primer-component-testimonial-1',
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
          {
            sys: {
              contentType: {
                sys: {
                  id: 'primerComponentTestimonial',
                },
              },
              id: 'primer-component-testimonial-2',
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
        ],
      },
    },
  },
}
