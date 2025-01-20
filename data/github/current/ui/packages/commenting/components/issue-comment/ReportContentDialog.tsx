// eslint-disable-next-line no-restricted-imports
import {useToastContext} from '@github-ui/toast/ToastContext'
import {ActionList, ActionMenu, Box, Button, FormControl, Link, Portal, Radio, RadioGroup} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {useCallback, useState} from 'react'
import {useRelayEnvironment} from 'react-relay'

import type {AbuseReportReason} from '../../mutations/__generated__/submitAbuseReportMutation.graphql'
import {submitAbuseReportMutation} from '../../mutations/submit-abuse-report-mutation'

export type ReportContentDialogProps = {
  owner: string
  ownerUrl: string
  reportUrl?: string
  contentId: string
  onClose: () => void
  contentType?: ContentType
}

type ReportReason = AbuseReportReason | 'Choose a reason'
type ReportType = 'admins' | 'support'
type ContentType = 'issue' | 'comment' | 'pull request' | 'content'

export const ReportContentDialog = ({
  owner,
  ownerUrl,
  reportUrl,
  contentId,
  onClose,
  contentType = 'content',
}: ReportContentDialogProps) => {
  const environment = useRelayEnvironment()
  const {addToast} = useToastContext()
  const [reportReason, setReportReason] = useState<ReportReason>('Choose a reason')
  const [isLoading, setIsLoading] = useState(false)
  const [reportType, setReportType] = useState<ReportType>('admins')

  const onSubmitReportToRepositoryAdmins = useCallback(() => {
    setIsLoading(true)
    const reason = getReason(reportReason)

    submitAbuseReportMutation({
      environment,
      input: {
        reportedContentId: contentId,
        reason,
      },
      onError(error) {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'error',
          message: `Unable to submit report: ${error}`,
        })
        setIsLoading(false)
      },
      onCompleted() {
        // eslint-disable-next-line @github-ui/dotcom-primer/toast-migration
        addToast({
          type: 'success',
          message: 'Report submitted',
        })
        setIsLoading(false)
        onClose()
      },
    })
  }, [addToast, contentId, environment, onClose, reportReason])

  const handleReportTypeChange = (selectedValue: string | null) => {
    setReportType(selectedValue as ReportType)
  }

  const reportToMaintainers = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div>
        <p>
          <span>This {contentType} violates </span>
          <Link href={ownerUrl}>{`@${owner}'s `}</Link>
          <span>Code of Conduct and should be submitted to the maintainers of this repository for review.</span>
        </p>
        <p>This report, as well as your username as the reporter, will be viewable by all admins of this repository.</p>
        <p>Choose a reason for reporting this {contentType}</p>
      </div>
      <Box
        sx={{
          marginTop: '8px',
          marginBottom: '16px',
        }}
      >
        <ActionMenu>
          <ActionMenu.Button>{reportReason}</ActionMenu.Button>

          <ActionMenu.Overlay>
            <ActionList>
              <ActionList.Item onSelect={() => setReportReason('ABUSE')}>Abuse</ActionList.Item>
              <ActionList.Item onSelect={() => setReportReason('SPAM')}>Spam</ActionList.Item>
              <ActionList.Item onSelect={() => setReportReason('OFF_TOPIC')}>Off Topic</ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </Box>
      <Box
        sx={{
          marginTop: '8px',
        }}
      >
        <Box
          sx={{
            fontSize: '12px',
            color: 'fg.muted',
          }}
        >
          <span>Learn more about </span>
          <Link href="https://docs.github.com/articles/reporting-abuse-or-spam">
            requesting that maintainers moderate content.
          </Link>
        </Box>
        <Button
          sx={{
            marginTop: '30px',
            width: '100%',
          }}
          variant={'danger'}
          onClick={() => onSubmitReportToRepositoryAdmins()}
          disabled={isLoading}
        >
          Report to repository admins
        </Button>
      </Box>
    </Box>
  )

  const reportToSupport = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <span>Contact GitHub Support about this user&apos;s spammy or abusive behavior.</span>
      <Box
        sx={{
          marginTop: '12px',
        }}
      >
        <Box
          sx={{
            marginTop: 'auto',
            fontSize: '12px',
            color: 'fg.muted',
          }}
        >
          <span>Learn more about </span>
          <Link href="https://docs.github.com/articles/reporting-abuse-or-spam">reporting abuse to GitHub support</Link>
        </Box>
        <Button
          sx={{
            width: '100%',
            marginTop: '30px',
          }}
          variant={'danger'}
          as={'a'}
          href={reportUrl}
          disabled={isLoading}
        >
          Report abuse to GitHub support
        </Button>
      </Box>
    </Box>
  )

  return (
    <Portal>
      <Dialog
        renderHeader={() => (
          <Dialog.Header>
            <Box sx={{display: 'flex'}}>
              <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, px: 2, py: '6px'}}>
                <Dialog.Title>Report {contentType}</Dialog.Title>
              </Box>
              <Dialog.CloseButton onClose={onClose} />
            </Box>
          </Dialog.Header>
        )}
        sx={{
          width: '100%',
          margin: 4,
          maxWidth: '640px',
          maxHeight: 'clamp(315px, 80vh, 800px)',
        }}
        width="xlarge"
        height="auto"
        onClose={onClose}
      >
        <Box sx={{gap: 3, display: 'grid'}}>
          <RadioGroup name="choiceGroup" onChange={handleReportTypeChange}>
            <RadioGroup.Label sx={{fontWeight: 'bold', fontSize: '14px', mb: '4px'}}>
              Where would you like to report this {contentType} to?
            </RadioGroup.Label>
            <FormControl>
              <Radio value="admins" defaultChecked />
              <FormControl.Label>To repository admins</FormControl.Label>
            </FormControl>
            <FormControl>
              <Radio value="support" />
              <FormControl.Label>To GitHub support</FormControl.Label>
            </FormControl>
          </RadioGroup>
          {reportType === 'admins' && reportToMaintainers}
          {reportType === 'support' && reportToSupport}
        </Box>
      </Dialog>
    </Portal>
  )
}

function getReason(reportReason: ReportReason): AbuseReportReason {
  if (reportReason === 'Choose a reason') {
    return 'UNSPECIFIED'
  }
  return reportReason
}
