import '@primer/react-brand/lib/css/main.css'

import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulCard} from './ContentfulCard'

const meta: Meta<typeof ContentfulCard> = {
  title: 'Mkt/Swp/Contentful/ContentfulCard',
  component: ContentfulCard,
}

export default meta

type Story = StoryObj<typeof ContentfulCard>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentCard',
          },
        },
        id: 'primer-component-card',
      },
      fields: {
        heading: 'Hello World!',
        href: 'https://primer.style/brand',
      },
    },
  },
}
export const WithImage: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentCard',
          },
        },
        id: 'primer-component-card',
      },
      fields: {
        heading: 'Hello World!',
        href: 'https://primer.style/brand',
        image: {
          fields: {
            description: 'A description',
            file: {
              url: 'https://via.placeholder.com/400x400',
            },
          },
        },
        variant: 'minimal',
      },
    },
    imageAspectRatio: '16:9',
  },
}
