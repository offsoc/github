import type {Meta, StoryObj} from '@storybook/react'

import {ConsentExperience} from './ConsentExperience'

const meta: Meta<typeof ConsentExperience> = {
  title: 'Utilities/ConsentExperience',
  component: ConsentExperience,
}

export default meta

type Story = StoryObj<typeof ConsentExperience>

export const Default: Story = {
  args: {
    countryFieldSelector: '#country-select',
    emailSubscriptionSettingsLinkHref: '#',
    exampleFields: ['first name', 'last name', 'email'],
    fieldName: 'privacy_consent',
    hasPhone: true,
  },

  render: args => {
    return (
      <>
        <select aria-label="Select a country" id="country-select">
          <option value="US">United States</option>
          <option value="KR">Korea (South)</option>
          <option value="CA">Canada</option>
          <option value="ES">Spain</option>
        </select>

        <ConsentExperience {...args} />
      </>
    )
  },
}
