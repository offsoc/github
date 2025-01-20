import type {Meta} from '@storybook/react'
import {Link} from '@primer/react'
import {VersionsIcon} from '@primer/octicons-react'
import {GrowthBanner, type GrowthBannerProps} from './GrowthBanner'

const meta = {
  title: 'Recipes/GrowthComponents/GrowthBanner',
  component: GrowthBanner,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    showCloseButton: {
      control: 'boolean',
      defaultValue: true,
    },
    icon: {control: false},
    closeButtonClick: {control: false},
    primaryButtonProps: {control: false},
    secondaryButtonProps: {control: false},
    sx: {control: false},
    title: {control: false},
    variant: {control: false},
  },
} satisfies Meta<typeof GrowthBanner>

export default meta

const defaultArgs: Partial<GrowthBannerProps> = {
  showCloseButton: true,
  icon: VersionsIcon,
  primaryButtonProps: {
    onClick: () => {
      alert('primary example action')
    },
    children: 'Primary',
  },
  secondaryButtonProps: {
    onClick: () => {
      alert('secondary example action')
    },
    children: 'Secondary',
  },
}

export const Base = {
  args: {
    ...defaultArgs,
  },
  render: (args: GrowthBannerProps) => (
    <>
      <GrowthBanner {...args} title="This is a default banner">
        Learn <Link inline>actions</Link> in a safe playground environment. Run example workflows, try challenges, and
        deploy an an example website to GitHub Pages.
      </GrowthBanner>

      <GrowthBanner {...args} sx={{mt: 2}} title="This is an information banner" variant="information">
        Learn <Link inline>actions</Link> in a safe playground environment. Run example workflows, try challenges, and
        deploy an an example website to GitHub Pages.
      </GrowthBanner>

      <GrowthBanner {...args} sx={{mt: 2}} title="This is a warning banner" variant="warning">
        Learn <Link inline>actions</Link> in a safe playground environment. Run example workflows, try challenges, and
        deploy an an example website to GitHub Pages.
      </GrowthBanner>

      <GrowthBanner {...args} sx={{mt: 2}} title="This is a danger banner" variant="danger">
        Learn <Link inline>actions</Link> in a safe playground environment. Run example workflows, try challenges, and
        deploy an an example website to GitHub Pages.
      </GrowthBanner>

      <GrowthBanner {...args} sx={{mt: 2}} title="This is a success banner" variant="success">
        Learn <Link inline>actions</Link> in a safe playground environment. Run example workflows, try challenges, and
        deploy an an example website to GitHub Pages.
      </GrowthBanner>

      <GrowthBanner {...args} sx={{mt: 2}} title="This is a done banner" variant="done">
        Learn <Link inline>actions</Link> in a safe playground environment. Run example workflows, try challenges, and
        deploy an an example website to GitHub Pages.
      </GrowthBanner>
    </>
  ),
}
