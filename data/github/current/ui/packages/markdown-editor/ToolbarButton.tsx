// needs to be a separate file from Toolbar to avoid circular imports between Toolbar <-> SavedReplies

import {forwardRef, useContext} from 'react'
import {MarkdownEditorContext} from './MarkdownEditorContext'
import {IconButton, type IconButtonProps} from '@primer/react'

export const ToolbarButton = forwardRef<HTMLButtonElement, IconButtonProps>((props, ref) => {
  const {disabled, condensed} = useContext(MarkdownEditorContext)

  return (
    // eslint-disable-next-line primer-react/a11y-remove-disable-tooltip
    <IconButton
      unsafeDisableTooltip={true}
      ref={ref}
      size={condensed ? 'small' : 'medium'}
      variant="invisible"
      disabled={disabled}
      // Prevent focus leaving input:
      onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
      {...props}
      sx={{color: 'fg.muted', ...props.sx}}
    />
  )
})
ToolbarButton.displayName = 'MarkdownEditor.ToolbarButton'
