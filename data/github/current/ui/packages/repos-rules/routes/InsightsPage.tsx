import {useMemo, useRef, useState} from 'react'
import {Box, Pagination, RelativeTime, Octicon, Text, Timeline, LinkButton, Link, Heading} from '@primer/react'
import {PulseIcon, RocketIcon} from '@primer/octicons-react'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import {Subhead} from '../components/Subhead'
import {InsightsBlank} from '../components/insights/InsightsBlank'
import {InsightsFilterBar} from '../components/insights/InsightsFilterBar'
import {RuleSuiteRow} from '../components/insights/RuleSuiteRow'
import type {InsightsRoutePayload, RuleSuite, UpsellInfo} from '../types/rules-types'
import type {Repository} from '@github-ui/current-repository'
import {insightsIndexPath} from '../helpers/insights-filter'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import {useClickAnalytics} from '@github-ui/use-analytics'
import {isRulesetInherited} from '../helpers/utils'
import {DismissibleFlashOrToast, type FlashAlert} from '@github-ui/dismissible-flash'

export function InsightsPage() {
  const {upsellInfo, learnMoreUrl, source} = useRoutePayload<InsightsRoutePayload>()

  if (upsellInfo?.enterpriseRulesets.cta.visible) {
    return (
      <div>
        <Subhead heading="Rule insights" />
        <UpsellInsightsBanner upsellInfo={upsellInfo} learnMoreUrl={learnMoreUrl} sourceName={source.ownerLogin} />
      </div>
    )
  }

  return <InsightsPageComponent />
}

const UpsellInsightsBanner = ({
  upsellInfo,
  learnMoreUrl,
  sourceName,
}: {
  upsellInfo: UpsellInfo
  learnMoreUrl: string
  sourceName: string
}) => {
  const {sendClickAnalyticsEvent} = useClickAnalytics()
  let upsellPath = ''
  if (upsellInfo?.organization) {
    upsellPath = `/account/enterprises/new/${sourceName}`
  } else {
    upsellPath = '/account/enterprises/new'
  }

  return (
    <div className="border rounded-2 color-bg-premium">
      <div className="ml-3 d-flex flex-items-center flex-column flex-justify-center my-5">
        <Octicon className="color-fg-muted" icon={PulseIcon} size={24} />
        <Heading as="h1" sx={{fontSize: 4, mt: 3, mx: 5, textAlign: 'center'}}>
          See how rulesets are affecting this repository
        </Heading>
        <Text className="color-fg-muted mt-3 mx-5" sx={{textAlign: 'center'}}>
          Enterprise accounts enable you to review commits against rulesets to track pass, fail, or bypass status for
          greater oversight and understanding.
        </Text>
        {upsellInfo?.enterpriseRulesets.cta.path && (
          <div className="mt-3">
            <LinkButton
              className="btn-premium"
              href={upsellPath}
              leadingVisual={() => <Octicon icon={RocketIcon} className="color-fg-sponsors" />}
              onClick={() => {
                sendClickAnalyticsEvent({
                  category: 'repository-rule-insights',
                  action: 'click_rule_insights_upsell',
                  label: 'RULE_INSIGHTS_UPSELL_BUTTON',
                })
              }}
            >
              Try GitHub Enterprise
            </LinkButton>
          </div>
        )}
        <Link className="mt-3" href={learnMoreUrl}>
          Learn more
        </Link>
      </div>
    </div>
  )
}

function InsightsPageComponent() {
  const {
    source,
    sourceType,
    branchListCacheKey,
    filter,
    rulesets,
    repositories,
    ruleSuiteRuns,
    visibleResults,
    hasMoreSuites,
    readOnly,
    supportedTargets,
  } = useRoutePayload<InsightsRoutePayload>()
  const {navigate} = useRelativeNavigation()
  const [flashAlert, setFlashAlert] = useState<FlashAlert>({message: '', variant: 'default'})
  const flashRef = useRef<HTMLDivElement | null>(null)

  let {page} = filter
  page = page || 1
  const pageCount = hasMoreSuites ? page + 1 : page

  const isFork = sourceType === 'repository' && (source as Repository).isFork

  // Group rule suites by day
  const ruleSuitsByDay = useMemo(() => {
    return ruleSuiteRuns.reduce(
      (acc, ruleSuite) => {
        const date = new Date(ruleSuite.createdAt).toDateString()
        if (!acc[date]) {
          acc[date] = []
        }
        acc[date]?.push(ruleSuite)
        return acc
      },
      {} as {[key: string]: RuleSuite[]},
    )
  }, [ruleSuiteRuns])

  // We can only filter on rulesets defined at this level
  const filterableRulesets = useMemo(() => {
    return rulesets.filter(r => !isRulesetInherited({type: sourceType, id: source.id}, r))
  }, [rulesets, sourceType, source])

  return (
    <div>
      <DismissibleFlashOrToast flashAlert={flashAlert} setFlashAlert={setFlashAlert} ref={flashRef} />
      <Subhead heading="Rule insights" />
      <InsightsFilterBar
        filter={filter}
        source={source}
        sourceType={sourceType}
        branchListCacheKey={branchListCacheKey}
        rulesets={filterableRulesets}
        repositories={repositories}
      />
      {ruleSuiteRuns.length > 0 ? (
        <Timeline>
          {Object.keys(ruleSuitsByDay).map(day => (
            <Timeline.Item key={day} condensed>
              <Timeline.Badge>
                <Octicon icon={PulseIcon} />
              </Timeline.Badge>
              <Timeline.Body>
                <span>Activity on </span>
                <RelativeTime datetime={day} precision="day" threshold="P0D" prefix="" year="numeric" />
                <Box
                  className="ml-n6 ml-sm-0"
                  as="ol"
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: 'canvas.default',
                    borderColor: 'border.default',
                    borderStyle: 'solid',
                    borderWidth: 1,
                    marginTop: 3,
                    color: 'fg.default',
                    position: 'relative',
                  }}
                >
                  {ruleSuitsByDay[day]?.map(ruleSuite => (
                    <RuleSuiteRow
                      key={ruleSuite.id}
                      ruleSuite={ruleSuite}
                      visibleResult={visibleResults[ruleSuite.id]!}
                      sourceType={sourceType}
                      sourceName={source.name}
                    />
                  ))}
                </Box>
              </Timeline.Body>
            </Timeline.Item>
          ))}
        </Timeline>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden',
            borderColor: 'border.default',
            borderStyle: 'solid',
            borderWidth: 1,
            marginTop: 2,
          }}
        >
          <InsightsBlank
            showCreateButton={!readOnly && !isFork}
            setFlashAlert={setFlashAlert}
            supportedRulesetTargets={supportedTargets}
          />
        </Box>
      )}
      {(page !== 1 || pageCount !== 1) && (
        <Pagination
          pageCount={pageCount}
          currentPage={page}
          onPageChange={(e, newPage) => {
            e.preventDefault()
            if (page !== newPage) {
              navigate('.', insightsIndexPath({filter: {...filter, page: newPage}}), true)
            }
          }}
          showPages={false}
        />
      )}
    </div>
  )
}
