import type {Meta, StoryObj} from '@storybook/react'
import {ContentfulMobileAppStoreLink} from './ContentfulMobileAppStoreLinks'

const meta: Meta<typeof ContentfulMobileAppStoreLink> = {
  title: 'Mkt/Swp/Contentful/ContentfulMobileAppStoreLink',
  component: ContentfulMobileAppStoreLink,
}

export default meta

type Story = StoryObj<typeof ContentfulMobileAppStoreLink>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'appStoreButton',
          },
        },
        id: 'app-store-button',
      },
      fields: {
        storeOs: 'iOS',
        link: {
          sys: {
            contentType: {
              sys: {
                id: 'link',
              },
            },
            id: 'ios-link',
          },
          fields: {
            text: 'Download for iOS',
            href: 'https://www.apple.com',
          },
        },
      },
    },
  },
}
