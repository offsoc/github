import '@primer/react-brand/lib/css/main.css'

import {BLOCKS} from '@contentful/rich-text-types'
import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulRiver} from './ContentfulRiver'

const meta: Meta<typeof ContentfulRiver> = {
  title: 'Mkt/Swp/Contentful/ContentfulRiver',
  component: ContentfulRiver,
}

export default meta

type Story = StoryObj<typeof ContentfulRiver>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentRiver',
          },
        },
        id: 'primer-river',
      },
      fields: {
        align: 'start',
        heading: 'Code in the cloud with GitHub Codespaces',
        image: {
          fields: {
            file: {
              url: 'https://via.placeholder.com/1000x1000',
            },
          },
        },
        imageTextRatio: '50:50',
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
                    'GitHub Codespaces provides a powerful, cloud-based development environment accessible from any device with internet access. Codespaces offers a consistent, customizable platform that scales with your development needs, supporting your journey from beginner to advanced projects, wherever you are.',
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
  },
}

export const WithLinkProps: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentRiver',
          },
        },
        id: 'primer-river',
      },
      fields: {
        align: 'start',
        callToAction: {
          sys: {
            id: '4vhEWIOztUKbJcfWn7cd7s',
            contentType: {
              sys: {
                id: 'link',
              },
            },
          },
          fields: {
            href: 'https://github.com',
            text: 'Explore GitHub Advanced Security',
            openInNewTab: true,
          },
        },
        heading: 'Code in the cloud with GitHub Codespaces',
        image: {
          fields: {
            file: {
              url: 'https://via.placeholder.com/1000x1000',
            },
          },
        },
        imageTextRatio: '50:50',
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
                    'GitHub Codespaces provides a powerful, cloud-based development environment accessible from any device with internet access. Codespaces offers a consistent, customizable platform that scales with your development needs, supporting your journey from beginner to advanced projects, wherever you are.',
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
    linkProps: {
      size: 'large',
      variant: 'accent',
      arrowDirection: 'end',
    },
  },
}

export const WithTrailingComponent: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentRiver',
          },
        },
        id: 'primer-river',
      },
      fields: {
        align: 'start',
        heading: 'Code in the cloud with GitHub Codespaces',
        image: {
          fields: {
            file: {
              url: 'https://via.placeholder.com/1000x1000',
            },
          },
        },
        imageTextRatio: '50:50',
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
                    'GitHub Codespaces provides a powerful, cloud-based development environment accessible from any device with internet access. Codespaces offers a consistent, customizable platform that scales with your development needs, supporting your journey from beginner to advanced projects, wherever you are.',
                  nodeType: 'text',
                },
              ],
              nodeType: BLOCKS.PARAGRAPH,
            },
          ],
          nodeType: BLOCKS.DOCUMENT,
        },
        trailingComponent: {
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
    },
  },
}
