import {Box, Button, Text} from '@primer/react'
import {Section} from '@github-ui/issue-metadata/Section'
import {ReadonlySectionHeader} from '@github-ui/issue-metadata/ReadonlySectionHeader'
import {BellIcon, BellSlashIcon} from '@primer/octicons-react'
import {useCallback, useState} from 'react'
import {commitUpdateIssueSubscriptionMutation} from '../../mutations/update-issue-subscription'
import {graphql, useFragment, useRelayEnvironment} from 'react-relay'
import {LABELS} from '../../constants/labels'
import type {SubscriptionSectionFragment$key} from './__generated__/SubscriptionSectionFragment.graphql'

export type SubscriptionSectionProps = {
  issue: SubscriptionSectionFragment$key
}

export function SubscriptionSection({issue}: SubscriptionSectionProps) {
  const [subscriptionAnnouncement, setSubscriptionAnnouncement] = useState<string>()
  const environment = useRelayEnvironment()
  const {id, viewerThreadSubscriptionFormAction} = useFragment(
    graphql`
      fragment SubscriptionSectionFragment on Issue {
        id
        viewerThreadSubscriptionFormAction
      }
    `,
    issue,
  )
  const subscribed = viewerThreadSubscriptionFormAction === 'UNSUBSCRIBE'

  const toggleSubscription = useCallback(() => {
    const newSubscribed = !subscribed
    commitUpdateIssueSubscriptionMutation({
      environment,
      input: {
        subscribableId: id,
        state: newSubscribed ? 'SUBSCRIBED' : 'UNSUBSCRIBED',
      },
      onCompleted: () => {
        setSubscriptionAnnouncement(
          newSubscribed ? LABELS.notifications.subscribedAnnouncement : LABELS.notifications.unsubscribedAnnouncement,
        )
      },
    })
  }, [environment, id, subscribed])

  return (
    <Section sectionHeader={<ReadonlySectionHeader title="Notifications" />}>
      <Box sx={{display: 'flex', flexDirection: 'column', width: '100%', px: 2, pt: 2, alignItems: 'stretch'}}>
        <Button
          aria-describedby="issue-viewer-subscription-description"
          leadingVisual={subscribed ? BellSlashIcon : BellIcon}
          onClick={toggleSubscription}
        >
          {subscribed ? LABELS.notifications.subscribedButton : LABELS.notifications.unsubscribedButton}
        </Button>
        <Text id="issue-viewer-subscription-description" sx={{fontSize: 0, mb: 2, mt: 2, color: 'fg.muted'}}>
          {subscribed ? LABELS.notifications.subscribedDescription : LABELS.notifications.unsubscribedDescription}
        </Text>
        <span className="sr-only" aria-live="polite">
          {subscriptionAnnouncement}
        </span>
      </Box>
    </Section>
  )
}

export function SubscriptionSectionFallback() {
  return (
    <Section sectionHeader={<ReadonlySectionHeader title="Notifications" />}>
      <Box sx={{display: 'flex', flexDirection: 'column', width: '100%', px: 2, pt: 2, alignItems: 'stretch'}}>
        <Button aria-describedby="issue-viewer-subscription-description" leadingVisual={BellIcon}>
          {LABELS.notifications.unsubscribedButton}
        </Button>
        <Text id="issue-viewer-subscription-description" sx={{fontSize: 0, mb: 2, mt: 2, color: 'fg.muted'}}>
          {LABELS.notifications.unsubscribedDescription}
        </Text>
      </Box>
    </Section>
  )
}
