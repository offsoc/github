import {Flash} from '@primer/react'
import {memo} from 'react'

export const ErrorMessage = memo(({message}: {message: string}) => (
  <Flash variant="danger" full sx={{fontSize: 1, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, px: 2, py: 2}}>
    {message}
  </Flash>
))
ErrorMessage.displayName = 'MarkdownEditor.ErrorMessage'
