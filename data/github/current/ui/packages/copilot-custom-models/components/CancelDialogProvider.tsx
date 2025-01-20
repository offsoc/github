import {createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren} from 'react'
import {useOverlayControls} from '../hooks/use-overlay-controls'
import {Dialog} from '@primer/react/drafts'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {defaultErrorMessage, useNavigateWithFlashBanner} from '../features/NavigateWithFlashBanner'

interface IContext {
  closeDialog: () => void
  isSubmitting: boolean
  onSubmit: () => Promise<void>
  openDialogForCancelPath: (cancelPath: string) => void
}

const Context = createContext<IContext | null>(null)

interface CancelResponse {
  payload: {
    message: string
    redirect_url: string
  }
}

export function CancelDialogProvider({children}: PropsWithChildren) {
  const {close: closeDialog, isOpen: isDialogOpen, open: openDialog} = useOverlayControls()
  const [cancelPath, setCancelPath] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {setFlashState} = useNavigateWithFlashBanner()

  const openDialogForCancelPath = useCallback(
    (newCancelPath: string) => {
      setCancelPath(newCancelPath)
      openDialog()
    },
    [openDialog],
  )

  const onSubmit = useCallback(async () => {
    if (!cancelPath) return
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      const response = await verifiedFetchJSON(cancelPath, {method: 'DELETE'})

      if (response.ok) {
        const {
          payload: {redirect_url},
        } = (await response.json()) as CancelResponse
        window.location.href = redirect_url
      } else {
        const errors = await response.json()
        setFlashState({message: defaultErrorMessage, variant: 'danger'})
        setIsSubmitting(false)
        closeDialog()
        throw new Error(errors)
      }
    } catch (err) {
      setFlashState({message: defaultErrorMessage, variant: 'danger'})
      setIsSubmitting(false)
      closeDialog()
      throw new Error(String(err))
    }
  }, [cancelPath, closeDialog, isSubmitting, setFlashState])

  const value = useMemo(
    () => ({closeDialog, isSubmitting, onSubmit, openDialogForCancelPath}),
    [closeDialog, isSubmitting, onSubmit, openDialogForCancelPath],
  )

  return (
    <Context.Provider value={value}>
      {isDialogOpen && <CancelDialog />}
      {children}
    </Context.Provider>
  )
}

export function useCancelDialog(): IContext {
  const context = useContext(Context)

  if (!context) {
    throw new Error('useCancelDialog must be used within <CancelDialogProvider />')
  }

  return context
}

function CancelDialog() {
  const {closeDialog, isSubmitting, onSubmit} = useCancelDialog()

  return (
    <Dialog
      footerButtons={[{buttonType: 'danger', content: 'Cancel training', inactive: isSubmitting, onClick: onSubmit}]}
      onClose={closeDialog}
      renderBody={() => (
        <Dialog.Body>
          <span>
            Canceling your custom model training will stop all the current progress. Are you sure you want to proceed?
          </span>
        </Dialog.Body>
      )}
      renderFooter={({footerButtons}) => {
        return (
          <Dialog.Footer sx={{'@media screen and (max-height: 400px)': {p: 2}}}>
            {footerButtons && <Dialog.Buttons buttons={footerButtons} />}
          </Dialog.Footer>
        )
      }}
      sx={{'@media screen and (max-height: 400px)': {maxHeight: 'calc(100vh - 8px)'}}}
      title="Cancel custom model training"
      width="large"
    />
  )
}
