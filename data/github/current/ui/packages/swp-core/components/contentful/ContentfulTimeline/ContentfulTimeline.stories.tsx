import '@primer/react-brand/lib/css/main.css'

import {BLOCKS} from '@contentful/rich-text-types'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulTimeline} from './ContentfulTimeline'

const meta: Meta<typeof ContentfulTimeline> = {
  title: 'Mkt/Swp/Contentful/ContentfulTimeline',
  component: ContentfulTimeline,
}

export default meta

type Story = StoryObj<typeof ContentfulTimeline>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentTimeline',
          },
        },
        id: 'primer-component-timeline',
      },
      fields: {
        blocks: [
          {
            sys: {
              contentType: {
                sys: {
                  id: 'primerComponentTimelineBlock',
                },
              },
              id: 'primer-component-timeline-block-1',
            },
            fields: {
              text: {
                data: {},
                content: [
                  {
                    data: {},
                    content: [
                      {
                        data: {},
                        marks: [],
                        value:
                          'From cloud hosting to development platforms and premium educational content, the Student Developer Pack includes dozens of partner offers and resources that will allow you to use professional tools at no cost.',
                        nodeType: 'text',
                      },
                    ],
                    nodeType: BLOCKS.PARAGRAPH,
                  },
                ],
                nodeType: BLOCKS.DOCUMENT,
              },
            },
          },
          {
            sys: {
              contentType: {
                sys: {
                  id: 'primerComponentTimelineBlock',
                },
              },
              id: 'primer-component-timeline-block-2',
            },
            fields: {
              text: {
                data: {},
                content: [
                  {
                    data: {},
                    content: [
                      {
                        data: {},
                        marks: [],
                        value:
                          'Get the most out of the pack with Learning Paths and Experiences. Follow step-by-step guides for students of all levels, and dive into curated bundles like "Web Development" or "Data Science & Machine Learning" to boost your journey.',
                        nodeType: 'text',
                      },
                    ],
                    nodeType: BLOCKS.PARAGRAPH,
                  },
                ],
                nodeType: BLOCKS.DOCUMENT,
              },
            },
          },
        ],
      },
    },
  },
}
