import '@primer/react-brand/lib/css/main.css'

import {BLOCKS} from '@contentful/rich-text-types'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulPillars} from './ContentfulPillars'

const meta: Meta<typeof ContentfulPillars> = {
  title: 'Mkt/Swp/Contentful/ContentfulPillars',
  component: ContentfulPillars,
}

export default meta

type Story = StoryObj<typeof ContentfulPillars>

export const Default: Story = {
  args: {
    asCards: false,
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerPillars',
          },
        },
        id: 'primer-pillars',
      },
      fields: {
        pillars: [
          {
            sys: {
              contentType: {
                sys: {
                  id: 'primerComponentPillar',
                },
              },
              id: 'primer-component-pillar-1',
            },
            fields: {
              align: 'start',
              heading: 'DevOps is the future',
              description: {
                data: {},
                content: [
                  {
                    data: {},
                    content: [
                      {
                        data: {},
                        marks: [],
                        value: 'Everything you need to know about getting started with GitHub Actions.',
                        nodeType: 'text',
                      },
                    ],
                    nodeType: BLOCKS.PARAGRAPH,
                  },
                ],
                nodeType: BLOCKS.DOCUMENT,
              },
              icon: 'zap',
            },
          },
          {
            sys: {
              contentType: {
                sys: {
                  id: 'primerComponentPillar',
                },
              },
              id: 'primer-component-pillar-2',
            },
            fields: {
              align: 'start',
              heading: 'Collaboration is the key to DevOps success',
              description: {
                data: {},
                content: [
                  {
                    data: {},
                    content: [
                      {
                        data: {},
                        marks: [],
                        value: 'Everything you need to know about getting started with GitHub Actions.',
                        nodeType: 'text',
                      },
                    ],
                    nodeType: BLOCKS.PARAGRAPH,
                  },
                ],
                nodeType: BLOCKS.DOCUMENT,
              },
              icon: 'zap',
            },
          },
          {
            sys: {
              contentType: {
                sys: {
                  id: 'primerComponentPillar',
                },
              },
              id: 'primer-component-pillar-3',
            },
            fields: {
              align: 'start',
              heading: 'CI/CD DevOps with GitHub Actions',
              description: {
                data: {},
                content: [
                  {
                    data: {},
                    content: [
                      {
                        data: {},
                        marks: [],
                        value: 'Everything you need to know about getting started with GitHub Actions.',
                        nodeType: 'text',
                      },
                    ],
                    nodeType: BLOCKS.PARAGRAPH,
                  },
                ],
                nodeType: BLOCKS.DOCUMENT,
              },
              icon: 'zap',
              link: {
                sys: {id: '123', contentType: {sys: {id: 'link'}}},
                fields: {href: 'https://github.com', text: 'Learn More', openInNewTab: false},
              },
            },
          },
        ],
      },
    },
  },
}
