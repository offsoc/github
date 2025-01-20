import type {Meta} from '@storybook/react'
import {PromotionCard, type PromotionCardProps} from './PromotionCard'
import {MarkGithubIcon} from '@primer/octicons-react'

const meta = {
  title: 'Recipes/GrowthComponents/PromotionCard',
  component: PromotionCard,
  parameters: {
    controls: {expanded: true, sort: 'alpha'},
  },
  argTypes: {
    actionButtonProps: {control: false},
    closeButtonClick: {control: false},
    darkImagePath: {control: false},
    eventIcon: {control: false},
    eventTitle: {control: false},
    lightImagePath: {control: false},
    sx: {control: false},
    title: {control: false},
  },
} satisfies Meta<typeof PromotionCard>

export default meta

const defaultArgs: Partial<PromotionCardProps> = {
  title: 'Let’s build from here',
  actionButtonProps: {
    onClick: () => {
      alert('my example promo')
    },
    children: 'Get started',
  },
}

export const Base = {
  args: {
    ...defaultArgs,
  },
  render: (args: PromotionCardProps) => (
    <>
      <PromotionCard eventIcon={MarkGithubIcon} eventTitle="Universe 2023" {...args}>
        Watch all the latest product announcements and expert-driven sessions from this year&apos;s event, available now
        on-demand.
      </PromotionCard>

      <PromotionCard
        lightImagePath="https://github.com/images/modules/growth/member_feature_requests/light.png"
        darkImagePath="https://github.com/images/modules/growth/member_feature_requests/dark.png"
        sx={{mt: 4}}
        {...args}
      >
        Watch all the latest product announcements and expert-driven sessions from this year&apos;s event, available now
        on-demand.
      </PromotionCard>

      <PromotionCard {...args} sx={{mt: 4}}>
        Watch all the latest product announcements and expert-driven sessions from this year&apos;s event, available now
        on-demand.
      </PromotionCard>
    </>
  ),
}
