import '@primer/react-brand/lib/css/main.css'

import {BLOCKS} from '@contentful/rich-text-types'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulFaq} from './ContentfulFaq'

const meta: Meta<typeof ContentfulFaq> = {
  title: 'Mkt/Swp/Contentful/ContentfulFaq',
  component: ContentfulFaq,
}

export default meta

type Story = StoryObj<typeof ContentfulFaq>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentFaq',
          },
        },
        id: 'primer-component-faq',
      },
      fields: {
        heading: 'Frequently Asked Questions',
        blocks: [
          {
            sys: {
              contentType: {
                sys: {
                  id: 'primerComponentFaqBlock',
                },
              },
              id: 'faq-block-1',
            },
            fields: {
              questions: [
                {
                  sys: {
                    contentType: {
                      sys: {
                        id: 'primerComponentFaqQuestion',
                      },
                    },
                    id: 'faq-question-1',
                  },
                  fields: {
                    question: 'What is the meaning of life?',
                    answer: {
                      data: {},
                      content: [
                        {
                          data: {},
                          content: [
                            {
                              data: {},
                              marks: [],
                              value: '42',
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
                        id: 'primerComponentFaqQuestion',
                      },
                    },
                    id: 'faq-question-2',
                  },
                  fields: {
                    question: 'What is the purpose of life?',
                    answer: {
                      data: {},
                      content: [
                        {
                          data: {},
                          content: [
                            {
                              data: {},
                              marks: [],
                              value: 'To be happy.',
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
        ],
      },
    },
  },
}
