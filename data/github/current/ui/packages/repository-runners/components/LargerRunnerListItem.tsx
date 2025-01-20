import {ListItemActionBar} from '@github-ui/list-view/ListItemActionBar'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import {Text, Label, ActionList, Octicon} from '@primer/react'
import {MarkGithubIcon, LockIcon} from '@primer/octicons-react'
import {testIdProps} from '@github-ui/test-id-props'
import {useClickAnalytics} from '@github-ui/use-analytics'

type LargerRunnerListItemProps = {
  setUpRunnersLink?: string
}

export function LargerRunnerListItem({setUpRunnersLink: setUpRunnersLink}: LargerRunnerListItemProps) {
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  const sendAnalyticsSetUpRunners = () => {
    sendClickAnalyticsEvent({
      category: 'repository_runners',
      action: `click_to_set_up_larger_runners`,
      label: `ref_cta:set_up_larger_runners;ref_loc:larger_runners_list_menu;`,
    })
  }

  const sendAnalyticsDocuments = () => {
    sendClickAnalyticsEvent({
      category: 'repository_runners',
      action: `click_to_view_larger_runners_docs`,
      label: `ref_cta:view_larger_runner_docs;ref_loc:larger_runners_list_menu;`,
    })
  }

  const sendAnalyticsPricing = () => {
    sendClickAnalyticsEvent({
      category: 'repository_runners',
      action: `click_to_view_larger_runners_pricing`,
      label: `ref_cta:see_pricing;ref_loc:larger_runners_list_menu;`,
    })
  }

  return (
    <ListItem
      title={
        <ListItemTitle
          value="Larger GitHub-hosted runners"
          containerSx={{
            display: 'inline-flex',
            justifyContent: 'flex-start',
            flexShrink: 1,
            flexWrap: 'wrap',
            rowGap: 1,
            columnGap: 2,
            alignItems: 'center',
          }}
          headingSx={{fontWeight: '600'}}
        >
          <Label>
            <Octicon icon={LockIcon} size={12} sx={{mr: 1}} />
            Unprovisioned
          </Label>
          <Label variant="accent">Team & Enterprise</Label>
        </ListItemTitle>
      }
      secondaryActions={
        <ListItemActionBar
          label="Runner list item actions"
          staticMenuActions={[
            {
              key: 'setup-larger-runners',
              render: () => {
                if (!setUpRunnersLink) return null
                return (
                  <ActionList.LinkItem href={setUpRunnersLink} onClick={sendAnalyticsSetUpRunners}>
                    Set up larger runners
                  </ActionList.LinkItem>
                )
              },
            },
            {
              key: 'view-larger-runner-docs',
              render: () => (
                <ActionList.LinkItem
                  href="https://docs.github.com/actions/using-github-hosted-runners/using-larger-runners"
                  onClick={sendAnalyticsDocuments}
                >
                  View larger runner docs
                </ActionList.LinkItem>
              ),
            },
            {
              key: 'see-pricing',
              render: () => (
                <ActionList.LinkItem
                  href="https://docs.github.com/billing/managing-billing-for-github-actions/about-billing-for-github-actions"
                  onClick={sendAnalyticsPricing}
                >
                  See pricing
                </ActionList.LinkItem>
              ),
            },
          ]}
        />
      }
      {...testIdProps('larger-runner-list-item')}
    >
      <ListItemLeadingContent>
        <ListItemLeadingVisual icon={MarkGithubIcon} color="fg.subtle" />
      </ListItemLeadingContent>

      <ListItemMainContent>
        <ListItemDescription>
          <span>
            <Text sx={{fontWeight: 'bold'}}>Sizes up to:</Text> 64-cores · 256 GB RAM · 2040 GB SSD Storage · Windows,
            Linux, and Mac
          </span>
        </ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}
