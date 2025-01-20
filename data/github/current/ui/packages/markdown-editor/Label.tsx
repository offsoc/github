import type {FC} from 'react'
import type React from 'react'
import {useContext} from 'react'
import {MarkdownEditorContext} from './MarkdownEditorContext'
import type {SxProp} from '@primer/react'
import InputLabel from '@github-ui/input-label'

type LabelProps = SxProp & {
  visuallyHidden?: boolean
  children?: React.ReactNode
}

// ref is not forwarded because InputLabel does not (yet) support it
const Legend: FC<LabelProps> = ({sx, ...props}) => {
  // using context and definining a Slot in the same component causes an infinite loop, so these must be separate
  const {disabled, required} = useContext(MarkdownEditorContext)

  return (
    <InputLabel as="legend" disabled={disabled} required={required} {...props} sx={{cursor: 'default', mb: 1, ...sx}} />
  )
}
Legend.displayName = 'MarkdownEditor.Label'

export const Label: FC<LabelProps> = props => <Legend {...props} />
