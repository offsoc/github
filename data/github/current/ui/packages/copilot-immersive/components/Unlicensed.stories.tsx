import {Box} from '@primer/react'
import type {Meta} from '@storybook/react'

import {Unlicensed} from './Unlicensed'

const meta = {
  title: 'Copilot/Unlicensed',
  component: Unlicensed,
} satisfies Meta<typeof Unlicensed>

export default meta

export const UnlicensedExample = {
  render: () => {
    return (
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'start', gap: 4}}>
        <Unlicensed />
      </Box>
    )
  },
}
