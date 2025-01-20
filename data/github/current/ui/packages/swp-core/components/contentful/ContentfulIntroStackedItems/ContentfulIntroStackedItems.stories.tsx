import '@primer/react-brand/lib/css/main.css'

import {BLOCKS} from '@contentful/rich-text-types'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulIntroStackedItems} from './ContentfulIntroStackedItems'

const meta: Meta<typeof ContentfulIntroStackedItems> = {
  title: 'Mkt/Swp/Contentful/ContentfulIntroStackedItems',
  component: ContentfulIntroStackedItems,
}

export default meta

type Story = StoryObj<typeof ContentfulIntroStackedItems>

export const Default: Story = {
  args: {
    component: {
      sys: {
        id: '59k8i4XuWU0pYjE6x3kjRf',
        contentType: {
          sys: {
            id: 'introStackedItems',
          },
        },
      },
      fields: {
        headline: 'A single, integrated, enterprise-ready platform',
        items: [
          {
            sys: {
              id: '1m4dQeWRp4Ye8ALqIdO9xC',
              contentType: {
                sys: {
                  id: 'introItem',
                },
              },
            },
            fields: {
              text: {
                nodeType: BLOCKS.DOCUMENT,
                data: {},
                content: [
                  {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [
                      {
                        nodeType: 'text',
                        value: 'Lorem ipsum dolor sit amet',
                        marks: [
                          {
                            type: 'bold',
                          },
                        ],
                        data: {},
                      },
                      {
                        nodeType: 'text',
                        value:
                          ', consectetur adipiscing elit. In sapien sit ullamcorper id. Aliquam luctus sed turpis felis nam pulvinar.',
                        marks: [],
                        data: {},
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            sys: {
              id: '22vnrDhhMvJNpu4dFsBpJk',
              contentType: {
                sys: {
                  id: 'introItem',
                },
              },
            },
            fields: {
              text: {
                nodeType: BLOCKS.DOCUMENT,
                data: {},
                content: [
                  {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [
                      {
                        nodeType: 'text',
                        value: 'Lorem ipsum dolor sit amet',
                        marks: [
                          {
                            type: 'bold',
                          },
                        ],
                        data: {},
                      },
                      {
                        nodeType: 'text',
                        value:
                          ', consectetur adipiscing elit. In sapien sit ullamcorper id. Aliquam luctus sed turpis felis nam pulvinar.',
                        marks: [],
                        data: {},
                      },
                    ],
                  },
                ],
              },
            },
          },
          {
            sys: {
              id: '5x8qLxAQL3grVr2Q3dn8eS',
              contentType: {
                sys: {
                  id: 'introItem',
                },
              },
            },
            fields: {
              text: {
                nodeType: BLOCKS.DOCUMENT,
                data: {},
                content: [
                  {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [
                      {
                        nodeType: 'text',
                        value: 'Lorem ipsum dolor sit amet',
                        marks: [
                          {
                            type: 'bold',
                          },
                        ],
                        data: {},
                      },
                      {
                        nodeType: 'text',
                        value:
                          ', consectetur adipiscing elit. In sapien sit ullamcorper id. Aliquam luctus sed turpis felis nam pulvinar.',
                        marks: [],
                        data: {},
                      },
                    ],
                  },
                ],
              },
            },
          },
        ],
        link: {
          sys: {
            id: '75emgBiU0yZFVqjlGxEjSG',
            contentType: {
              sys: {
                id: 'link',
              },
            },
          },
          fields: {
            href: 'https://github.com/enterprise',
            text: 'Explore GitHub Enterprise',
            openInNewTab: false,
          },
        },
      },
    },
  },
}
