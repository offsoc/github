import {Box, Flash, Octicon, Text} from '@primer/react'
import {StopIcon} from '@primer/octicons-react'
import type {ErrorContent} from './types'

interface Props {
  errors: ErrorContent[] | undefined
}

export function GeneralErrors({errors}: Props) {
  if (!errors?.length) return null

  return (
    <>
      {errors.map(error => (
        <Flash key={error.heading} sx={{alignItems: 'flex-start', display: 'flex', p: '8px'}} variant="danger">
          <Box sx={{alignItems: 'center', display: 'flex', justifyContent: 'center', m: '8px'}}>
            <Octicon
              icon={StopIcon}
              size={16}
              sx={{color: 'var(--fgColor-danger, var(--color-danger-fg))', mr: '0px !important'}}
            />
          </Box>
          <Box sx={{display: 'flex', flexDirection: 'column', px: '8px', py: '6px'}}>
            <Text sx={{fontWeight: 'semibold'}}>{error.heading}</Text>
            <span>{error.message}</span>
          </Box>
        </Flash>
      ))}
    </>
  )
}
