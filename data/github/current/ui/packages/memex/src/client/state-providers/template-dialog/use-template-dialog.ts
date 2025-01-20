import {useContext} from 'react'

import {TemplateDialogContext} from './template-dialog-state-provider'

/**
 * This hooks exposes a callback to update the state of the template dialog
 */

export const useTemplateDialog = () => {
  const context = useContext(TemplateDialogContext)

  if (!context) {
    throw new Error('useTemplateDialog must be used within a TemplateDialogStateProvider')
  }

  return context
}
