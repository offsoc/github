import '@primer/react-brand/lib/css/main.css'

import {BLOCKS} from '@contentful/rich-text-types'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulIntroPillars} from './ContentfulIntroPillars'

const meta: Meta<typeof ContentfulIntroPillars> = {
  title: 'Mkt/Swp/Contentful/ContentfulIntroPillars',
  component: ContentfulIntroPillars,
}

export default meta

type Story = StoryObj<typeof ContentfulIntroPillars>

export const Default: Story = {
  args: {
    component: {
      sys: {
        id: '4EdzTppOXE6gGJPWdeQwzl',
        contentType: {
          sys: {
            id: 'introPillars',
          },
        },
      },
      fields: {
        headline: 'A single, integrated, enterprise-ready platform',
        pillars: [
          {
            sys: {
              id: '6W9sbJpyhvtcZD0ykxU5Zg',
              contentType: {
                sys: {
                  id: 'primerComponentPillar',
                },
              },
            },
            fields: {
              align: 'start',
              icon: 'zap',
              heading: 'Streamline healthcare',
              description: {
                nodeType: BLOCKS.DOCUMENT,
                data: {},
                content: [
                  {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [
                      {
                        nodeType: 'text',
                        value:
                          'Focus on delivering impactful patient outcomes by priming your engineering staff for scale.',
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
              id: 'dK9JjXg8N0R1AvIoVIbYg',
              contentType: {
                sys: {
                  id: 'primerComponentPillar',
                },
              },
            },
            fields: {
              align: 'start',
              icon: 'code-review',
              heading: 'Unlock engineering potential',
              description: {
                nodeType: BLOCKS.DOCUMENT,
                data: {},
                content: [
                  {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [
                      {
                        nodeType: 'text',
                        value: 'Empower developer collaboration, productivity, and creativity at scale.',
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
              id: '4cMYxTrS9iS93nQwmY9rIN',
              contentType: {
                sys: {
                  id: 'primerComponentPillar',
                },
              },
            },
            fields: {
              align: 'start',
              icon: 'heart',
              heading: 'Enhance patient care',
              description: {
                nodeType: BLOCKS.DOCUMENT,
                data: {},
                content: [
                  {
                    nodeType: BLOCKS.PARAGRAPH,
                    data: {},
                    content: [
                      {
                        nodeType: 'text',
                        value:
                          'Facilitate rapid innovation so you can implement the latest technologies more reliably.',
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
      },
    },
  },
}
