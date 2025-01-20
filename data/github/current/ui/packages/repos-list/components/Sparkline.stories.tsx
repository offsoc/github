import {Box} from '@primer/react'
import type {Meta} from '@storybook/react'

import {Sparkline} from './Sparkline'

const meta: Meta<typeof Sparkline> = {
  title: 'Apps/Repos List/Components/Sparkline',
  component: Sparkline,
}

export default meta

export const Default = () => {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
      <Sparkline label="Past year of activity" uniqueKey="1" points={[0, 0, 10, 15, 40, 5, 3, 8, 0, 0]} />
      <Sparkline label="No activity" uniqueKey="2" points={[]} />
    </Box>
  )
}
