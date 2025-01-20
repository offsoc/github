import '@primer/react-brand/lib/css/main.css'

import {Heading} from '@primer/react-brand'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulBackgroundImage} from './ContentfulBackgroundImage'

const meta: Meta<typeof ContentfulBackgroundImage> = {
  title: 'Mkt/Swp/Contentful/ContentfulBackgroundImage',
  component: ContentfulBackgroundImage,
}

export default meta

type Story = StoryObj<typeof ContentfulBackgroundImage>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'backgroundImage',
          },
        },
        id: 'background-image',
      },
      fields: {
        image: {
          fields: {
            description: 'placeholder image',
            file: {
              url: 'https://via.placeholder.com/1280x720',
            },
          },
        },
      },
    },
    children: <Heading as="h1">Hello World!</Heading>,
  },
}
