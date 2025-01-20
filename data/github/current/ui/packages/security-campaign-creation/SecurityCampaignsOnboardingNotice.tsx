import {Button, Flash, Heading, Popover, Text} from '@primer/react'
import {useCallback, useState} from 'react'
import {useDismissOnboardingNoticeMutation} from './hooks/use-dismiss-onboarding-notice-mutation'
import {SyncIcon} from '@primer/octicons-react'

export interface SecurityCampaignsOnboardingNoticeProps {
  show: boolean
  dismissPath: string
}

export function SecurityCampaignsOnboardingNotice({show, dismissPath}: SecurityCampaignsOnboardingNoticeProps) {
  const [showNotice, setShowNotice] = useState(show)

  const {mutate, isPending, error} = useDismissOnboardingNoticeMutation(dismissPath)

  const onDismiss = useCallback(async () => {
    mutate(void 0, {
      onSuccess: () => {
        setShowNotice(false)
      },
    })
  }, [mutate])

  return (
    showNotice && (
      <Popover
        open={showNotice}
        caret="top"
        sx={{
          left: '50%',
          transform: 'translateX(-50%)',
          mt: 2,
        }}
      >
        <Popover.Content sx={{mt: 2}}>
          {error && <Flash variant="danger">{error.message}</Flash>}

          <Heading
            as="h1"
            sx={{
              fontSize: 2,
            }}
          >
            Introducing security campaigns!
          </Heading>
          <Text as="p" sx={{pt: 3}}>
            Security campaigns help your team set clear, achievable goals for developers to fix the most critical
            vulnerabilities in your organization.
          </Text>
          <Button onClick={onDismiss} disabled={isPending} leadingVisual={isPending ? SyncIcon : null}>
            Got it!
          </Button>
        </Popover.Content>
      </Popover>
    )
  )
}
