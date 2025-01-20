import {Box, Header} from '@primer/react'
import {
  Dialog,
  type DialogButtonProps,
  type DialogHeaderProps,
  type DialogProps,
} from '@primer/react/lib-esm/Dialog/Dialog'
import type {BetterSystemStyleObject} from '@primer/react/lib-esm/sx'
import {useCallback} from 'react'

export interface AlertDialogProps {
  title: React.ReactNode
  confirmButtonContent?: React.ReactNode

  /**
   * Required. This callback is invoked when a gesture to close the dialog
   * is performed. The first argument indicates the gesture.
   */
  onClose: (gesture: 'confirm' | 'close-button' | 'escape') => void
  children?: React.ReactNode
}

const bodyStyle: BetterSystemStyleObject = {
  fontSize: 1,
  p: 3,
  pt: 0,
  color: 'fg.muted',
  flexGrow: 1,
}

const footerStyle: BetterSystemStyleObject = {
  display: 'flex',
  m: 3,
  mt: 0,
  button: {
    fontSize: 1,
    py: '5px',
    px: 3,
    ml: 'auto',
  },
}

const headerStyle: BetterSystemStyleObject = {
  backgroundColor: 'unset',
  p: 2,
  display: 'flex',
  flexDirection: 'row',
  color: 'fg.default',
}

const headerItemStyle: BetterSystemStyleObject = {fontSize: 3, fontWeight: 'bold', py: '6px', px: 2, flexGrow: 1}

export const SingleConfirmBody: React.FC<DialogProps & {children?: React.ReactNode}> = ({children}) => {
  return <Box sx={bodyStyle}>{children}</Box>
}

const SingleConfirmFooter: React.FC<DialogProps> = ({footerButtons}) => (
  <Box sx={footerStyle}>
    <Dialog.Buttons buttons={footerButtons ?? []} />
  </Box>
)

export const SingleConfirmHeader: React.FC<DialogHeaderProps> = ({title, onClose, dialogLabelId}) => {
  const onCloseClick = useCallback(() => {
    onClose('close-button')
  }, [onClose])
  return (
    <Header sx={headerStyle}>
      <Header.Item sx={headerItemStyle} id={dialogLabelId}>
        {title}
      </Header.Item>
      <Dialog.CloseButton onClose={onCloseClick} />
    </Header>
  )
}

export const AlertDialog: React.FC<AlertDialogProps> = ({children, confirmButtonContent = 'OK', onClose, title}) => {
  const onConfirmButtonClick = useCallback(() => {
    onClose('confirm')
  }, [onClose])

  const confirmButton: DialogButtonProps = {
    buttonType: 'primary',
    content: confirmButtonContent,
    onClick: onConfirmButtonClick,
  }

  return (
    <Dialog
      title={title}
      role="alertdialog"
      width="medium"
      onClose={onClose}
      footerButtons={[confirmButton]}
      renderBody={SingleConfirmBody}
      renderFooter={SingleConfirmFooter}
      renderHeader={SingleConfirmHeader}
    >
      {children}
    </Dialog>
  )
}
