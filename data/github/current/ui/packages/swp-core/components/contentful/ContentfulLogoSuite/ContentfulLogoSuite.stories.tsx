import '@primer/react-brand/lib/css/main.css'

import type {Meta, StoryObj} from '@storybook/react'

import {ContentfulLogoSuite} from './ContentfulLogoSuite'

const meta: Meta<typeof ContentfulLogoSuite> = {
  title: 'Mkt/Swp/Contentful/ContentfulLogoSuite',
  component: ContentfulLogoSuite,
}

export default meta

type Story = StoryObj<typeof ContentfulLogoSuite>

export const Default: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentLogoSuite',
          },
        },
        id: 'primer-component-logo-suite',
      },
      fields: {
        align: 'center',
        heading: 'Used by the best',
        logos: [
          'Intel',
          'Telus',
          'Duolingo',
          'Coyote Logistic',
          'Mercado Libre',
          'Elanco',
          'KPMG',
          'Fidelity',
          'Philips',
          'Mercedes Benz',
        ],
        variant: 'muted',
      },
    },
  },
}

export const AnimateIn: Story = {
  args: {
    component: {
      sys: {
        contentType: {
          sys: {
            id: 'primerComponentLogoSuite',
          },
        },
        id: 'primer-component-logo-suite',
      },
      fields: {
        align: 'justify',
        heading: 'Used by the best',
        logos: ['Intel', 'Telus', 'Duolingo', 'Coyote Logistic', 'Mercado Libre'],
        variant: 'muted',
      },
    },
    shouldAnimate: true,
  },
}
