import {Fragment, useEffect, useRef} from 'react'
import {Box, FormControl, IconButton, Text, TextInput} from '@primer/react'
import {SearchIcon, XIcon} from '@primer/octicons-react'
import {Dialog} from '@primer/react/experimental'
import {type FlashAlert, DismissibleFlashOrToast} from '@github-ui/dismissible-flash'

const inputPlaceholder = `Search`

type BypassDialogHeaderProps = {
  onClose: () => void
  bypassListFilter: string
  setBypassListFilter: (bypassListFilter: string) => void
  dialogLabelId: string
  flashAlert: FlashAlert
  setFlashAlert: (flashAlert: FlashAlert) => void
  addReviewerSubtitle: string
}

export function BypassDialogHeader({
  onClose,
  bypassListFilter,
  setBypassListFilter,
  dialogLabelId,
  flashAlert,
  setFlashAlert,
  addReviewerSubtitle,
}: BypassDialogHeaderProps) {
  const flashRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    flashRef.current?.focus()
  }, [flashAlert, flashRef])

  return (
    <Fragment>
      <Box sx={{padding: 3, display: 'flex', flexDirection: 'column'}}>
        <DismissibleFlashOrToast flashAlert={flashAlert} setFlashAlert={setFlashAlert} ref={flashRef} />
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <Dialog.Title id={dialogLabelId} sx={{fontWeight: 'bold', flex: 1}}>
            Add bypass
          </Dialog.Title>
          <IconButton variant="invisible" aria-label="Close Dialog" icon={XIcon} onClick={onClose} />
        </Box>
        <Text sx={{fontWeight: 'normal', color: 'fg.subtle'}}>{addReviewerSubtitle}</Text>
        <FormControl sx={{marginTop: 1}}>
          <FormControl.Label visuallyHidden>Search for bypass actors</FormControl.Label>
          <TextInput
            block={false}
            sx={{width: '100%', fontWeight: 'normal'}}
            leadingVisual={SearchIcon}
            placeholder={inputPlaceholder}
            onChange={e => setBypassListFilter(e.target.value)}
            value={bypassListFilter}
          />
        </FormControl>
      </Box>
      <Box
        className="color-bg-subtle color-border-default"
        sx={{
          display: 'flex',
          paddingLeft: 3,
          paddingTop: 1,
          paddingBottom: 1,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderLeftWidth: 0,
          borderRightWidth: 0,
          borderStyle: 'solid',
        }}
      >
        <Text id="suggestionsHeading" className="text-small" sx={{fontWeight: 'bold', color: 'fg.muted'}}>
          Suggestions
        </Text>
      </Box>
    </Fragment>
  )
}
