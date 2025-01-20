import {createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren} from 'react'
import {useOverlayControls} from '../hooks/use-overlay-controls'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {defaultErrorMessage, useNavigateWithFlashBanner} from '../features/NavigateWithFlashBanner'
import {Dialog} from '@primer/react/drafts'
import type {PipelineDetails} from '../types'

interface IContext {
  closeDialog: () => void
  isSubmitting: boolean
  onSubmit: () => Promise<void>
  openDialog: () => void
}

const Context = createContext<IContext | null>(null)

interface Props extends PropsWithChildren {
  pipelineDetails: PipelineDetails
}

interface DestroyResponse {
  payload: {
    message: string
    redirect_url: string
  }
}

interface DestroyErrorResponse {
  errors: string
}

export function DeleteDialogProvider({children, pipelineDetails}: Props) {
  const {close: closeDialog, isOpen: isDialogOpen, open: openDialog} = useOverlayControls()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const {setFlashState} = useNavigateWithFlashBanner()
  const {destroyPath} = pipelineDetails

  const onSubmit = useCallback(async () => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      const response = await verifiedFetchJSON(destroyPath, {method: 'DELETE'})

      if (response.ok) {
        const {
          payload: {redirect_url},
        } = (await response.json()) as DestroyResponse
        window.location.href = redirect_url
      } else {
        const {errors} = (await response.json()) as DestroyErrorResponse
        const message = errors ?? defaultErrorMessage
        setFlashState({message, variant: 'danger'})
        setIsSubmitting(false)
        throw new Error(errors)
      }
    } catch (err) {
      setFlashState({message: defaultErrorMessage, variant: 'danger'})
      setIsSubmitting(false)
      throw new Error(String(err))
    }
  }, [destroyPath, isSubmitting, setFlashState])

  const value = useMemo(
    () => ({closeDialog, isSubmitting, onSubmit, openDialog}),
    [closeDialog, isSubmitting, onSubmit, openDialog],
  )

  return (
    <Context.Provider value={value}>
      {isDialogOpen && <DeleteModelDialog />}
      {children}
    </Context.Provider>
  )
}

export function useDeleteModel(): IContext {
  const context = useContext(Context)

  if (!context) {
    throw new Error('useDeleteModel must be used within <DeleteModelProvider />')
  }

  return context
}

function DeleteModelDialog() {
  const {closeDialog, isSubmitting, onSubmit} = useDeleteModel()

  return (
    <Dialog
      footerButtons={[
        {buttonType: 'danger', content: 'Delete custom model', inactive: isSubmitting, onClick: onSubmit},
      ]}
      onClose={closeDialog}
      renderBody={() => (
        <Dialog.Body>
          <span>
            Deleting your custom model will cancel the training in process. Training a new custom model will take hours.
            Are you sure you want to proceed?
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
      title="Delete custom model"
      width="large"
    />
  )
}
