// Give a surrounding element a class of `js-alert-actions-portal-root` to render the overlay in that element.
// This will no longer be required once https://github.com/primer/react/issues/4694 has been done
import {
  AnchoredOverlay,
  ActionList,
  Box,
  Heading,
  IconButton,
  Button,
  Flash,
  FormControl,
  RadioGroup,
  Radio,
  Textarea,
  registerPortalRoot,
  type OverlayProps,
} from '@primer/react'
import {TriangleDownIcon, XIcon} from '@primer/octicons-react'

import {useEffect, useState} from 'react'
import {verifiedFetch} from '@github-ui/verified-fetch'

export interface CodeScanningAlertDismissalProps {
  alertClosureReasons: {[key: string]: string}
  closeReasonDetails: {[key: string]: string}
  path: string
  number?: number
  refNames?: string[]
  reloadPage?: boolean
  prReviewThreadID?: number
}

export function CodeScanningAlertDismissal({
  alertClosureReasons,
  closeReasonDetails,
  number,
  path,
  refNames = [],
  prReviewThreadID,
}: CodeScanningAlertDismissalProps) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [portalRoot, setPortalRoot] = useState<string | null>(null)

  const handleReasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReason(event.target.value)
  }

  useEffect(() => {
    const root = document.querySelector('.js-alert-actions-portal-root')
    if (root) {
      registerPortalRoot(root, 'alert-actions-portal-root')
      setPortalRoot('alert-actions-portal-root')
    }
  }, [])

  const closeOverlay = () => {
    setOpen(false)
    setReason('')
    setDismissalComment('')
    setError(false)
  }

  const [dismissalComment, setDismissalComment] = useState('')
  const handleSetReason = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDismissalComment(e.target.value)
  }

  const [error, setError] = useState(false)

  const handleSubmit = async (e: React.FormEvent<EventTarget>) => {
    e.preventDefault()

    const formData = new FormData()
    formData.set('_method', 'put')
    formData.set('reason', reason)
    formData.set('resolution_note', dismissalComment)
    if (number) {
      formData.append('number[]', number.toString())
    }
    for (const ref_name of refNames) {
      formData.append('ref_names_b64[]', ref_name)
    }

    if (prReviewThreadID) {
      formData.set('pull_request_review_thread', prReviewThreadID.toString())
    }

    const result = await verifiedFetch(path, {
      method: 'POST',
      body: formData,
    })

    if (!result.ok) {
      setError(true)
    } else {
      closeOverlay()
      window.location.reload()
    }
  }
  const overlayProps: Partial<OverlayProps> = {
    role: 'dialog',
    'aria-modal': 'true',
    style: {zIndex: 2147483647},
  }
  if (portalRoot) {
    overlayProps.portalContainerName = portalRoot
  }

  return (
    <AnchoredOverlay
      open={open}
      onOpen={() => setOpen(true)}
      onClose={closeOverlay}
      width="medium"
      focusZoneSettings={{disabled: true}}
      renderAnchor={props => (
        <Button
          {...props}
          size="small"
          trailingVisual={TriangleDownIcon}
          data-testid="code-scanning-alert-dismissal-toggle-button"
        >
          Dismiss alert
        </Button>
      )}
      overlayProps={overlayProps}
    >
      <Box
        sx={{
          display: 'flex',
          py: 1,
          px: 2,
          alignItems: 'center',
          borderBottom: '1px solid',
          borderColor: 'border.muted',
        }}
      >
        <Heading as="h2" sx={{fontSize: 0, flexGrow: 1}} id="dismissal_reason">
          Select a reason to dismiss
        </Heading>
        {/*
          We don't need unsafeDisableTooltip since this IconButton is ready for its
          tooltip to be shown. cf https://github.com/github/github/pull/331875
          This comment block can be removed once step 2 of this plan is complete:
          https://github.com/github/primer/discussions/3333
        */}
        <IconButton
          icon={XIcon}
          size="small"
          aria-label="Close"
          variant="invisible"
          onClick={closeOverlay}
          tooltipDirection="sw"
        />
      </Box>
      <form onSubmit={handleSubmit} data-testid="code-scanning-alert-dismissal-form">
        <RadioGroup name={'Alert Dismissal Reasons'} sx={{px: 3, py: 2}} aria-labelledby="dismissal_reason">
          {Object.entries(alertClosureReasons).map(([key, value], index) => (
            <div key={key} data-testid="code-scanning-alert-dismissal-reason">
              <FormControl sx={{fontSize: 0, p: 1}}>
                <Radio name="reason" value={key} sx={{fontSize: 0}} onChange={handleReasonChange} />
                <FormControl.Label sx={{fontSize: 0}}>{value}</FormControl.Label>
                <FormControl.Caption sx={{display: 'block'}}>{closeReasonDetails[key]}</FormControl.Caption>
              </FormControl>
              {index !== Object.keys(alertClosureReasons).length - 1 && <ActionList.Divider />}
            </div>
          ))}
        </RadioGroup>

        {reason !== '' && (
          <div data-testid="code-scanning-alert-dismissal-comment">
            <FormControl>
              <FormControl.Label
                sx={{
                  fontSize: 0,
                  marginY: 1,
                  px: 3,
                  py: 2,
                  width: '100%',
                  borderTop: '1px solid',
                  borderBottom: '1px solid',
                  borderColor: 'border.muted',
                }}
              >
                Dismissal Reason
              </FormControl.Label>
              <Box sx={{px: 3, width: '100%'}}>
                <Textarea
                  rows={2}
                  sx={{fontSize: 0, display: 'block'}}
                  onChange={handleSetReason}
                  value={dismissalComment}
                  maxLength={280}
                  placeholder="Add a comment"
                />
              </Box>
            </FormControl>
            {error && (
              <Flash variant="danger" sx={{m: 2}}>
                There was an issue dismissing the alert(s). Please try again.
              </Flash>
            )}
            <Box sx={{display: 'flex', justifyContent: 'flex-end', p: 3}}>
              <Button onClick={closeOverlay} sx={{mr: 2}}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Dismiss alert
              </Button>
            </Box>
          </div>
        )}
      </form>
    </AnchoredOverlay>
  )
}
