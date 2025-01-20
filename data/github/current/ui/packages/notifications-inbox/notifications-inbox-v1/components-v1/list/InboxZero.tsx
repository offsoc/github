/* eslint eslint-comments/no-use: off */
import {Box, Heading, Text} from '@primer/react'
import type {FC} from 'react'

import InboxZeroGraphic from './InboxZeroGraphic'

const InboxZero: FC = () => {
  return (
    <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 7, gap: 4}}>
      <InboxZeroGraphic />
      <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <Heading as="h2" sx={{fontSize: 4}}>
          All caught up!
        </Heading>
        <Text sx={{color: 'fg.subtle'}}>Take a break, write some code, do what you do best.</Text>
      </Box>
    </Box>
  )
}

export default InboxZero
