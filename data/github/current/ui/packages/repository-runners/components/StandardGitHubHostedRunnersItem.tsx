import {Link, ActionList} from '@primer/react'
import {MarkGithubIcon} from '@primer/octicons-react'
import type {AnalyticsEvent} from '@github-ui/use-analytics'
import {ListItemActionBar} from '@github-ui/list-view/ListItemActionBar'
import {ListItemDescription} from '@github-ui/list-view/ListItemDescription'
import {ListItemLeadingContent} from '@github-ui/list-view/ListItemLeadingContent'
import {ListItemLeadingVisual} from '@github-ui/list-view/ListItemLeadingVisual'
import {ListItemMainContent} from '@github-ui/list-view/ListItemMainContent'
import {ListItemTitle} from '@github-ui/list-view/ListItemTitle'
import {ListItem} from '@github-ui/list-view/ListItem'
import {testIdProps} from '@github-ui/test-id-props'
import {useClipboard} from '@github-ui/use-clipboard'

function getAnalyicsPayload(label: string): AnalyticsEvent {
  return {
    category: 'repository_runners',
    action: 'click_to_copy_github_standard_runner_label',
    label: `ref_cta:copy_label;ref_loc:actions_runners;ref_label:${label}`,
  }
}

export function StandardGitHubHostedRunnersItem() {
  const {copyToClipboard} = useClipboard()
  const copyWindows = copyToClipboard({textToCopy: 'windows-latest', payload: getAnalyicsPayload('windows-latest')})
  const copyMacos = copyToClipboard({textToCopy: 'macos-latest', payload: getAnalyicsPayload('macos-latest')})
  const copyUbuntu = copyToClipboard({textToCopy: 'ubuntu-latest', payload: getAnalyicsPayload('ubuntu-latest')})
  return (
    <ListItem
      title={<ListItemTitle value="Standard GitHub-hosted runners" headingSx={{fontWeight: '600'}} />}
      secondaryActions={
        <ListItemActionBar
          label="Runner actions"
          staticMenuActions={[
            {
              key: 'copy-ubuntu',
              render: () => (
                <ActionList.Item onSelect={copyUbuntu}>
                  Copy ubuntu-latest <span className="sr-only">label</span>
                </ActionList.Item>
              ),
            },
            {
              key: 'copy-windows',
              render: () => (
                <ActionList.Item onSelect={copyWindows}>
                  Copy windows-latest <span className="sr-only">label</span>
                </ActionList.Item>
              ),
            },
            {
              key: 'copy-macos',
              render: () => (
                <ActionList.Item onSelect={copyMacos}>
                  Copy macos-latest <span className="sr-only">label</span>
                </ActionList.Item>
              ),
            },
          ]}
        />
      }
      {...testIdProps(`hosted-runners-list-item`)}
    >
      <ListItemLeadingContent>
        <ListItemLeadingVisual icon={MarkGithubIcon} color="fg.subtle" />
      </ListItemLeadingContent>

      <ListItemMainContent>
        <ListItemDescription>
          <span>
            Ready-to-use runners managed by GitHub.{' '}
            <Link inline href="https://docs.github.com/actions/using-github-hosted-runners/about-github-hosted-runners">
              Learn more about GitHub-hosted runners.
            </Link>
          </span>
        </ListItemDescription>
      </ListItemMainContent>
    </ListItem>
  )
}
