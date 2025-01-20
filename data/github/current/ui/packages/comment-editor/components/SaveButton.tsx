import type {ValidationResult} from '@github-ui/entity-validators'
import {AlertFillIcon} from '@primer/octicons-react'
import {Tooltip} from '@primer/react'
import {CommentEditorButton} from '../components/comment-editor-button'

interface SaveButtonProps {
  onSave: () => void
  validationResult: ValidationResult
  children: string
  trailingIcon: boolean
  disabled: boolean
  size?: 'small' | 'medium'
}

export function SaveButton({onSave, validationResult, children, trailingIcon, disabled, size}: SaveButtonProps) {
  const button = (
    <CommentEditorButton
      variant="primary"
      size={size}
      onClick={onSave}
      disabled={disabled || !validationResult.isValid}
      trailingVisual={trailingIcon && disabled ? AlertFillIcon : null}
    >
      {children}
    </CommentEditorButton>
  )

  return validationResult.isValid ? (
    button
  ) : (
    <Tooltip text={validationResult.errorMessage} direction="w" data-testid="save-button-tooltip">
      {button}
    </Tooltip>
  )
}
