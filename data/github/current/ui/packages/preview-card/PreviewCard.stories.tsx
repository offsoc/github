/* eslint eslint-comments/no-use: off */

import type {Meta, StoryObj} from '@storybook/react'

import {PreviewCardOutlet} from './PreviewCard'

const meta = {
  title: 'Preview Card',
  component: PreviewCardOutlet,
} satisfies Meta<typeof PreviewCardOutlet>

export default meta

export const Default = {
  decorators: [
    Story => {
      return (
        <>
          {Story()}
          <span>This story is used for axe scans.</span>
        </>
      )
    },
  ],
} satisfies StoryObj<typeof PreviewCardOutlet>
