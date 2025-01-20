import {useRef, useState} from 'react'
import {Box, Button, Dialog, Link, Spinner, Text} from '@primer/react'
import {MoveToBottomIcon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {TabStates} from './your-sponsorships-types'

interface ExportSponsorshipProps {
  sponsorLogin: string
  viewerPrimaryEmail?: string
  currentTab: TabStates
  setFlash: (props: {variant: 'success' | 'danger'; message: string}) => void
}

export const ExportSponsorships = ({
  sponsorLogin,
  viewerPrimaryEmail,
  currentTab,
  setFlash,
}: ExportSponsorshipProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const returnFocusRef = useRef(null)

  const onClick = async () => {
    setIsLoading(true)
    const resp = await verifiedFetchJSON(`/orgs/${sponsorLogin}/sponsoring/sponsorships_exports`, {
      method: 'POST',
      body: {active: currentTab === TabStates.ACTIVE_SPONSORSHIPS},
    })

    if (!resp.ok) {
      setIsLoading(false)
      setIsOpen(false)
      setFlash({variant: 'danger', message: 'There was a problem exporting your sponsorships.'})
      return
    }

    const jsonResp = await resp.json()
    setIsLoading(false)
    setIsOpen(false)
    setFlash({variant: 'success', message: jsonResp.msg})
  }

  return (
    <>
      <Button
        ref={returnFocusRef}
        leadingVisual={MoveToBottomIcon}
        onClick={() => {
          setIsOpen(true)
        }}
        {...testIdProps('your-sponsorships-export-button')}
      >
        Export as CSV
      </Button>
      <Dialog
        returnFocusRef={returnFocusRef}
        title="Export sponsorships"
        isOpen={isOpen}
        onDismiss={() => {
          setIsOpen(false)
        }}
      >
        <div>
          <Dialog.Header id="header">Export sponsorships</Dialog.Header>
          <Box sx={{p: 3}}>
            <span>
              We&apos;ll start the export process and email you at{' '}
              <Text sx={{fontWeight: 'bold'}}>{viewerPrimaryEmail}</Text> with the export attached when it&apos;s done.
              Update your{' '}
              <Link inline={true} href="/settings/emails">
                contact email settings
              </Link>{' '}
              to change where the file is sent.
            </span>
            <Button
              sx={{mt: 2}}
              block={true}
              variant="primary"
              onClick={onClick}
              {...testIdProps('your-sponsorships-start-export-button')}
            >
              {isLoading ? <Spinner size="small" /> : 'Start export'}
            </Button>
          </Box>
        </div>
      </Dialog>
    </>
  )
}
