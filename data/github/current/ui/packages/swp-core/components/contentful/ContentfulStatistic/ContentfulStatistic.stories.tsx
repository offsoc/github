import '@primer/react-brand/lib/css/main.css'

import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulStatistic} from './ContentfulStatistic'

const meta: Meta<typeof ContentfulStatistic> = {
  title: 'Mkt/Swp/Contentful/ContentfulStatistic',
  component: ContentfulStatistic,
  parameters: {
    a11y: {
      config: {
        rules: [
          {id: 'color-contrast', enabled: false}, // Incomplete check resulting in flaky tests
        ],
      },
    },
  },
}

export default meta

type Story = StoryObj<typeof ContentfulStatistic>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentStatistic',
          },
        },
        id: 'primer-statistic',
      },
      fields: {
        description: 'Given back to our maintainers',
        descriptionVariant: 'default',
        heading: '$2M+',
        size: 'large',
      },
    },
  },
}

export const BoxedVariant: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentStatistic',
          },
        },
        id: 'primer-statistic',
      },
      fields: {
        description: 'Given back to our maintainers',
        descriptionVariant: 'default',
        heading: '$2M+',
        size: 'large',
        variant: 'boxed',
      },
    },
  },
}

export const MeduimSize: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentStatistic',
          },
        },
        id: 'primer-statistic',
      },
      fields: {
        description: 'Given back to our maintainers',
        descriptionVariant: 'default',
        heading: '$2M+',
        size: 'medium',
      },
    },
  },
}

export const SmallSize: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentStatistic',
          },
        },
        id: 'primer-statistic',
      },
      fields: {
        description: 'Given back to our maintainers',
        descriptionVariant: 'default',
        heading: '$2M+',
        size: 'small',
      },
    },
  },
}

export const DescriptionAccent: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentStatistic',
          },
        },
        id: 'primer-statistic',
      },
      fields: {
        description: 'Given back to our maintainers',
        descriptionVariant: 'accent',
        heading: '$2M+',
        size: 'large',
        variant: 'boxed',
      },
    },
  },
}
