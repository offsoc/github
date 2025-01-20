import type {Meta, StoryObj} from '@storybook/react'
import {ContentfulAppStoreButtonGroup} from './ContentfulAppStoreButtonGroup'

const meta: Meta<typeof ContentfulAppStoreButtonGroup> = {
  title: 'Mkt/Swp/Contentful/ContentfulTrailingComponent',
  component: ContentfulAppStoreButtonGroup,
}

export default meta

type Story = StoryObj<typeof ContentfulAppStoreButtonGroup>

export const Default: Story = {
  args: {
    components: [
      {
        sys: {
          id: 'ios-button',
          contentType: {
            sys: {
              id: 'appStoreButton',
            },
          },
        },
        fields: {
          storeOs: 'iOS',
          link: {
            sys: {
              id: 'ios-link',
              contentType: {
                sys: {
                  id: 'link',
                },
              },
            },
            fields: {
              href: 'https://apps.apple.com',
              text: 'Download for iOS',
              openInNewTab: false,
            },
          },
        },
      },
      {
        sys: {
          id: 'android-button',
          contentType: {
            sys: {
              id: 'appStoreButton',
            },
          },
        },
        fields: {
          storeOs: 'Android',
          link: {
            sys: {
              id: 'android-link',
              contentType: {
                sys: {
                  id: 'link',
                },
              },
            },
            fields: {
              href: 'https://play.google.com',
              text: 'Download for Android',
              openInNewTab: false,
            },
          },
        },
      },
    ],
  },
}
