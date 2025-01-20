import '@primer/react-brand/lib/css/main.css'

import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulCards} from './ContentfulCards'

const meta: Meta<typeof ContentfulCards> = {
  title: 'Mkt/Swp/Contentful/ContentfulCards',
  component: ContentfulCards,
}

export default meta

type Story = StoryObj<typeof ContentfulCards>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerCards',
          },
        },
        id: 'primer-cards',
      },
      fields: {
        cards: [
          {
            sys: {
              id: 'card-1',
              contentType: {
                sys: {
                  id: 'primerComponentCard',
                },
              },
            },
            fields: {
              heading: 'Hello World!',
              href: 'https://primer.style/brand',
            },
          },
          {
            sys: {
              id: 'card-2',
              contentType: {
                sys: {
                  id: 'primerComponentCard',
                },
              },
            },
            fields: {
              heading: 'Hello World!',
              href: 'https://primer.style/brand',
            },
          },
          {
            sys: {
              id: 'card-3',
              contentType: {
                sys: {
                  id: 'primerComponentCard',
                },
              },
            },
            fields: {
              heading: 'Hello World!',
              href: 'https://primer.style/brand',
            },
          },
          {
            sys: {
              id: 'card-4',
              contentType: {
                sys: {
                  id: 'primerComponentCard',
                },
              },
            },
            fields: {
              heading: 'Hello World!',
              href: 'https://primer.style/brand',
            },
          },
          {
            sys: {
              id: 'card-5',
              contentType: {
                sys: {
                  id: 'primerComponentCard',
                },
              },
            },
            fields: {
              heading: 'Hello World!',
              href: 'https://primer.style/brand',
            },
          },
        ],
      },
    },
  },
}
