import '@primer/react-brand/lib/css/main.css'

import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulSubnav} from './ContentfulSubnav'

const meta: Meta<typeof ContentfulSubnav> = {
  title: 'Mkt/Swp/Contentful/ContentfulSubnav',
  component: ContentfulSubnav,
}

export default meta

type Story = StoryObj<typeof ContentfulSubnav>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentSubnav',
          },
        },
        id: 'primer-component-subnav',
      },
      fields: {
        heading: {
          sys: {
            contentType: {
              sys: {
                id: 'link',
              },
            },
            id: 'heading',
          },
          fields: {
            href: 'https://github.com',
            text: 'Features',
          },
        },

        links: [
          {
            sys: {
              contentType: {
                sys: {
                  id: 'link',
                },
              },
              id: 'link-1',
            },
            fields: {
              href: 'https://github.com',
              text: 'Feature 1',
            },
          },
          {
            sys: {
              contentType: {
                sys: {
                  id: 'link',
                },
              },
              id: 'link-2',
            },
            fields: {
              href: 'https://github.com',
              text: 'Feature 2',
            },
          },
          {
            sys: {
              contentType: {
                sys: {
                  id: 'link',
                },
              },
              id: 'link-3',
            },
            fields: {
              href: 'https://github.com',
              text: 'Feature 3',
            },
          },
        ],
      },
    },
  },
}
