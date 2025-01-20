import type {Meta} from '@storybook/react'
import {OnboardingTipBanner, type OnboardingTipBannerProps} from './OnboardingTipBanner'
import {ShieldCheckIcon, ShieldIcon} from '@primer/octicons-react'

const meta = {
  title: 'Recipes/OnboardingTipBanner',
  component: OnboardingTipBanner,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    link: {control: false},
    linkText: {control: false},
    heading: {control: false},
    icon: {control: false},
  },
} satisfies Meta<typeof OnboardingTipBanner>

export default meta

const defaultArgs: Partial<OnboardingTipBannerProps> = {
  link: '#',
  linkText: 'Back to onboarding',
  heading: 'Enable Advanced Security with GitHub recommended settings',
  icon: ShieldCheckIcon,
}

export const Base = {
  args: {
    ...defaultArgs,
  },
  render: (args: OnboardingTipBannerProps) => (
    <>
      <OnboardingTipBanner {...args}>
        Automatically apply our standard settings to Dependabot, code scanning, and secret scanning by selecting{' '}
        <strong> Apply to</strong> below.
      </OnboardingTipBanner>

      <OnboardingTipBanner
        {...args}
        icon={ShieldIcon}
        linkText="Back to link message"
        heading="This is a default heading"
      >
        This is a default onboarding tip message in a paragraph line
      </OnboardingTipBanner>
    </>
  ),
}
