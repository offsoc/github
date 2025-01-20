import {testIdProps} from '@github-ui/test-id-props'
import {Flash, Text, TextInput} from '@primer/react'
import {Dialog, type DialogHeaderProps} from '@primer/react/lib-esm/Dialog/Dialog'
import {useEffect, useRef, useState} from 'react'

import {SingleConfirmBody, SingleConfirmHeader} from '../../../components/alert-dialog'
import {SettingsResources} from '../../../strings'

const CloseHeaderWithAlert: React.FC<DialogHeaderProps> = props => {
  return (
    <>
      <SingleConfirmHeader {...props} />
      <Flash variant="warning" full sx={{mb: 2}}>
        {SettingsResources.deleteProjectWarning}
      </Flash>
    </>
  )
}

const BoldText = ({children}: {children: React.ReactNode}) => {
  return <Text sx={{fontWeight: 'bold'}}>{children}</Text>
}

export type DeleteProjectDialogProps = {
  onClose: (gesture: 'confirm' | 'cancel' | 'close-button' | 'escape') => void
  onConfirm: (event: React.FormEvent<HTMLFormElement>) => void
  projectName: string
  draftIssueCount: number
}

export function DeleteProjectDialog({onClose, onConfirm, projectName, draftIssueCount}: DeleteProjectDialogProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [inputValue, setInputValue] = useState('')

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  return (
    <Dialog
      title={SettingsResources.deleteProjectTitle}
      width="large"
      renderBody={SingleConfirmBody}
      renderHeader={CloseHeaderWithAlert}
      onClose={onClose}
      role="alertdialog"
    >
      <p>
        This action <BoldText>cannot</BoldText> be undone. This will permanently delete the{' '}
        <BoldText>{projectName}</BoldText> project, saved views, custom fields and associated values, and Insights data.
      </p>
      {draftIssueCount ? (
        <p>
          This will also delete{' '}
          <BoldText>
            {draftIssueCount} draft issue{draftIssueCount > 1 ? 's' : ''}
          </BoldText>{' '}
          that {draftIssueCount > 1 ? 'were' : 'was'} created in this project.
        </p>
      ) : null}
      <p>This will not delete issues or pull requests themselves.</p>
      <p>
        Please type <BoldText>{projectName}</BoldText> to confirm.
      </p>

      <form onSubmit={onConfirm} {...testIdProps('confirm-delete-form')}>
        <TextInput
          aria-label={SettingsResources.deleteProjectInputLabel}
          ref={inputRef}
          block
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInputValue(e.target.value)}
          value={inputValue}
          sx={{mb: 3}}
          {...testIdProps('confirm-delete-input')}
        />

        <Dialog.Buttons
          buttons={[
            {
              content: SettingsResources.deleteProjectConfirmation,
              buttonType: 'danger',
              disabled: inputValue.trim() !== projectName.trim(),
              type: 'submit',
              sx: {width: '100%'},
            },
          ]}
        />
      </form>
    </Dialog>
  )
}
