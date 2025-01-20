import type React from 'react'
import {Box} from '@primer/react'

const SectionDivider: React.FC = () => {
  return <Box sx={{height: '1px', width: '100%', borderTop: '1px solid', borderColor: 'border.muted'}} />
}

export default SectionDivider
