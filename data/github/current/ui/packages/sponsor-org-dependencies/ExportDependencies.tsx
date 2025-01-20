import {useRef, useState} from 'react'
import {Box, Button, Dialog, Link, Spinner, Text} from '@primer/react'
import {MoveToBottomIcon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'

export enum BannerVariants {
  SUCCESS = 'success',
  ERROR = 'critical',
}

interface ExportDependenciesProps {
  orgName: string
  viewerPrimaryEmail?: string
  setBanner: (props: {
    variant: BannerVariants.SUCCESS | BannerVariants.ERROR
    message: string
    isVisible: boolean
  }) => void
}

export const ExportDependencies = ({orgName, setBanner, viewerPrimaryEmail}: ExportDependenciesProps) => {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const returnFocusRef = useRef(null)

  const onClick = async () => {
    setIsLoading(true)
    try {
      const resp = await verifiedFetchJSON(`/orgs/${orgName}/sponsoring/sponsorships_dependencies_exports`, {
        method: 'POST',
        body: {},
      })

      if (!resp.ok) {
        setIsLoading(false)
        setIsExportModalOpen(false)
        setBanner({
          variant: BannerVariants.ERROR,
          message: 'There was a problem exporting your dependencies.',
          isVisible: true,
        })
        return
      }
      const jsonResp = await resp.json()
      setIsLoading(false)
      setIsExportModalOpen(false)
      setBanner({
        variant: BannerVariants.SUCCESS,
        message: jsonResp.msg,
        isVisible: true,
      })
      return
    } catch (err) {
      setIsLoading(false)
      setIsExportModalOpen(false)
      setBanner({
        variant: BannerVariants.ERROR,
        message: 'There was a problem exporting your dependencies.',
        isVisible: true,
      })
      return
    }
  }

  return (
    <>
      <Button
        ref={returnFocusRef}
        leadingVisual={MoveToBottomIcon}
        onClick={() => {
          setIsExportModalOpen(true)
        }}
        {...testIdProps('dependencies-export-button')}
      >
        Export as CSV
      </Button>
      <Dialog
        returnFocusRef={returnFocusRef}
        title="Export dependencies"
        isOpen={isExportModalOpen}
        onDismiss={() => {
          setIsExportModalOpen(false)
        }}
      >
        <div>
          <Dialog.Header id="header">Export dependencies</Dialog.Header>
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
              {...testIdProps('dependencies-start-export-button')}
            >
              {isLoading ? <Spinner size="small" /> : 'Start export'}
            </Button>
          </Box>
        </div>
      </Dialog>
    </>
  )
}
