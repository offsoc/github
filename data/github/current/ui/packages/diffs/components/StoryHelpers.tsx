import type {StoryFn} from '@storybook/react'
import type {SimpleDiffLine} from '../types'

export const tableDecorator = (Story: StoryFn) => (
  <table width="100%">
    <tbody>
      <tr>
        <Story />
      </tr>
    </tbody>
  </table>
)

const html = '  // TODO: 1234 example line'

export const line = {
  left: 11,
  html,
  right: 22,
  type: 'ADDITION',
} satisfies SimpleDiffLine
