import type React from 'react'
import {forwardRef, useContext} from 'react'
import {MarkdownEditorContext} from './MarkdownEditorContext'
import {Button, type ButtonProps} from '@primer/react'

export const Actions = ({children}: {children?: React.ReactNode}) => <>{children}</>
Actions.displayName = 'MarkdownEditor.Actions'

export const ActionButton = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const {disabled} = useContext(MarkdownEditorContext)
  return <Button ref={ref} disabled={disabled} {...props} />
})
ActionButton.displayName = 'MarkdownEditor.ActionButton'
