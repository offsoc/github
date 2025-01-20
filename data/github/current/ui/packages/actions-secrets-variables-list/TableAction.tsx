import {LinkButton} from '@primer/react'
import {useState} from 'react'
import {FormDialog} from './FormDialog'
import {testIdProps} from '@github-ui/test-id-props'

import {FormMode} from './types'
import type {TableActionProps} from './types'

export const TableAction = ({
  url,
  mode,
  message,
  useDialog,
  isEditableInScope,
  publicKey,
  keyId,
  tableDataUpdater,
}: TableActionProps) => {
  const variant = isEditableInScope ? 'primary' : 'default'
  const [newItemDialogOpen, setNewItemDialogOpen] = useState(false)

  if (url) {
    if (useDialog) {
      return (
        <>
          <LinkButton
            variant="default"
            sx={{fontSize: 1, ':hover': {textDecoration: 'none'}}}
            underline={false}
            onClick={() => setNewItemDialogOpen(true)}
            {...testIdProps('create-new-item-form-button')}
          >
            {message}
          </LinkButton>
          {newItemDialogOpen && (
            <FormDialog
              mode={mode}
              onClose={() => setNewItemDialogOpen(false)}
              tableDataUpdater={tableDataUpdater}
              formMode={FormMode.add}
              url={url}
              publicKey={publicKey}
              keyId={keyId}
              rowId={''}
            />
          )}
        </>
      )
    } else {
      return (
        <LinkButton
          variant={variant}
          sx={{fontSize: 1, ':hover': {textDecoration: 'none'}}}
          underline={false}
          href={url}
        >
          {message}
        </LinkButton>
      )
    }
  } else {
    // Non-admins do not have a table action
    return <></>
  }
}

export default TableAction
