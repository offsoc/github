import '@primer/react-brand/lib/css/main.css'

import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulAnchorNav} from './ContentfulAnchorNav'

const meta: Meta<typeof ContentfulAnchorNav> = {
  title: 'Mkt/Swp/Contentful/ContentfulAnchorNav',
  component: ContentfulAnchorNav,
}

export default meta

type Story = StoryObj<typeof ContentfulAnchorNav>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentAnchorNav',
          },
        },
        id: 'anchor-nav',
      },
      fields: {
        links: [
          {
            sys: {
              id: 'link-1',
              contentType: {
                sys: {
                  id: 'primerComponentAnchorLink',
                },
              },
            },
            fields: {
              id: 'heading-1',
              text: 'Heading 1',
            },
          },
          {
            sys: {
              id: 'link-2',
              contentType: {
                sys: {
                  id: 'primerComponentAnchorLink',
                },
              },
            },
            fields: {
              id: 'heading-2',
              text: 'Heading 2',
            },
          },
          {
            sys: {
              id: 'link-3',
              contentType: {
                sys: {
                  id: 'primerComponentAnchorLink',
                },
              },
            },
            fields: {
              id: 'heading-3',
              text: 'Heading 3',
            },
          },
        ],
      },
    },
  },
}
