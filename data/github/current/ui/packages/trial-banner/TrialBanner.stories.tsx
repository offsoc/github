import type {Meta} from '@storybook/react'
import {Box, Text, Octicon, IconButton, Button} from '@primer/react'
import {MarkGithubIcon, ThreeBarsIcon} from '@primer/octicons-react'
import {TrialBanner, type TrialBannerProps} from './TrialBanner'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

const meta = {
  title: 'Recipes/GrowthComponents/TrialBanner',
  component: TrialBanner,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    showCloseButton: {
      control: 'boolean',
      defaultValue: true,
    },
    closeButtonClick: {control: false},
    primaryButtonProps: {control: false},
    secondaryButtonProps: {control: false},
    sx: {control: false},
    variant: {control: false},
  },
} satisfies Meta<typeof TrialBanner>

export default meta

const defaultArgs: Partial<TrialBannerProps> = {
  showCloseButton: true,
  closeButtonClick: () => {
    alert('close button clicked')
  },
  primaryButtonProps: {
    onClick: () => {
      alert('primary example action')
    },
    children: 'Buy Enterprise',
  },
  secondaryButtonProps: {
    onClick: () => {
      alert('secondary example action')
    },
    children: 'Talk to sales',
  },
  variant: 'active',
}

interface ExampleHeaderProps {
  sx?: BetterSystemStyleObject
}
function ExampleHeader({sx}: ExampleHeaderProps) {
  return (
    <Box className="AppHeader" sx={{...sx}}>
      <div className="AppHeader-globalBar">
        <div className="AppHeader-globalBar-start">
          {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
          <IconButton unsafeDisableTooltip={true} icon={ThreeBarsIcon} aria-label="Toggle sidebar" />
          <Octicon icon={MarkGithubIcon} size={32} />
          <Button variant="invisible" sx={{color: 'fg.default'}}>
            Enterprise
          </Button>
        </div>
      </div>
    </Box>
  )
}

export const Base = {
  args: {
    ...defaultArgs,
  },
  render: (args: TrialBannerProps) => (
    <>
      <ExampleHeader />
      <TrialBanner {...args}>
        <span>
          Your enterprise trial banner will expire in{' '}
          <Text as="span" sx={{fontWeight: 600}}>
            27 days
          </Text>
        </span>
      </TrialBanner>

      <ExampleHeader sx={{mt: 4}} />
      <TrialBanner {...args} variant="warning">
        <span>
          Your enterprise trial banner will expire in{' '}
          <Text as="span" sx={{fontWeight: 600}}>
            5 days
          </Text>
        </span>
      </TrialBanner>

      <ExampleHeader sx={{mt: 4}} />
      <TrialBanner {...args} variant="expired">
        <span>
          Your enterprise trial has{' '}
          <Text as="span" sx={{fontWeight: 600}}>
            expired
          </Text>
        </span>
      </TrialBanner>
    </>
  ),
}
