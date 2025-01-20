import type React from 'react'
import {Box} from '@primer/react'

type SettingsFormFooterProps = {
  children: React.ReactNode
}

const SettingsFormFooter: React.FC<SettingsFormFooterProps> = ({children}) => {
  return (
    <Box sx={{display: 'flex', gap: 2, pt: 3, borderTop: '1px solid', borderColor: 'border.muted'}}>{children}</Box>
  )
}

export default SettingsFormFooter
