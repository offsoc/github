import {AlertIcon} from '@primer/octicons-react'
import {Box, Heading, Octicon} from '@primer/react'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'

import {boxStyle} from '../utils/style'

const containerStyle = {
  width: '100%',
  display: 'flex',
  flex: '1',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  ...boxStyle,
}

interface Props {
  testid: string
  text: string
  sx?: BetterSystemStyleObject
}

export default function ErrorComponent({testid, text, sx}: Props) {
  return (
    <Box sx={{...containerStyle, ...sx}}>
      <Octicon icon={AlertIcon} size={32} sx={{mb: 2, color: 'danger.fg'}} />
      <Heading as="h2" sx={{fontSize: 3}} data-testid={testid}>
        {text}
      </Heading>
    </Box>
  )
}
