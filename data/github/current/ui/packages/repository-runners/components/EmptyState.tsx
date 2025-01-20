import {Link} from '@github-ui/react-core/link'
import {Box, Button, Heading, Link as PrimerLink} from '@primer/react'
import {testIdProps} from '@github-ui/test-id-props'
import {useClickAnalytics} from '@github-ui/use-analytics'

const DOCS_URL = 'https://docs.github.com/actions/using-github-hosted-runners/about-github-hosted-runners'

export interface EmptyStateProps {
  selectedTab: 'github-hosted' | 'self-hosted'
  setUpRunnersLink?: string
}

export function EmptyState({selectedTab, setUpRunnersLink, ...props}: EmptyStateProps) {
  const {sendClickAnalyticsEvent} = useClickAnalytics()

  const setUpRunnersCta = setUpRunnersLink && (
    <Button
      as={Link}
      to={setUpRunnersLink}
      variant="primary"
      sx={{mt: 3}}
      onClick={() => {
        sendClickAnalyticsEvent({
          category: 'repository_runners',
          action: 'click_new_runner_cta',
          label: `ref_cta:new_runner;ref_loc:empty_state;path:${setUpRunnersLink};selected_tab:${selectedTab}`,
        })
      }}
      {...testIdProps('empty-state-new-runner-cta')}
    >
      New runner
    </Button>
  )

  let docsCta = null
  // Don't show docs CTA on self-hosted tab
  if (selectedTab === 'github-hosted') {
    const sendAnalyticsDocs = () => {
      sendClickAnalyticsEvent({
        category: 'repository_runners',
        action: 'click_view_runner_docs',
        label: `ref_cta:learn_more_about_using_runners;ref_loc:empty_state;selected_tab:${selectedTab}`,
      })
    }

    if (setUpRunnersLink) {
      docsCta = (
        <PrimerLink href={DOCS_URL} sx={{padding: 2}} onClick={sendAnalyticsDocs}>
          Learn more about using runners
        </PrimerLink>
      )
    } else {
      docsCta = (
        <Button
          as="a"
          href={DOCS_URL}
          variant="primary"
          sx={{mt: 3, mb: 2}}
          onClick={sendAnalyticsDocs}
          {...testIdProps('empty-state-learn-more-cta')}
        >
          Learn more <span className="sr-only">about using runners</span>
        </Button>
      )
    }
  }

  const descriptionText =
    selectedTab === 'github-hosted'
      ? 'Runners are the machines that execute GitHub Actions workflows.'
      : 'Self-hosted runners are virtual machines for GitHub Actions workflows that you manage and maintain outside of GitHub.'

  return (
    <Box
      data-hpc
      sx={{
        border: '1px solid',
        borderColor: 'border.muted',
        borderRadius: 2,
        padding: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
      {...testIdProps('empty-state')}
      {...props}
    >
      <Heading as="h3" sx={{fontSize: 3, fontWeight: 'bold'}}>
        You don&apos;t have any {selectedTab === 'self-hosted' && 'self-hosted '}runners for this repository
      </Heading>
      <span>{descriptionText}</span>
      {setUpRunnersCta}
      {docsCta}
    </Box>
  )
}
