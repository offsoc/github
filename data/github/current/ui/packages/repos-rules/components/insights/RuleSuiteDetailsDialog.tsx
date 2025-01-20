import type {FC} from 'react'
import {useMemo, useState} from 'react'
import {Box, Octicon, IconButton, Label, Link, Text, Tooltip, Flash} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {
  CheckCircleFillIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  GitMergeQueueIcon,
  XCircleFillIcon,
} from '@primer/octicons-react'
import type {
  ExemptionResponseMetadata,
  MergeQueueCheckResult,
  PullRequestMetadata,
  PullRequestSummary,
  RuleRun,
  RuleSuite,
  RuleSuiteResult,
} from '../../types/rules-types'
import {RulesetEnforcement} from '../../types/rules-types'
import {partition, partitionMap} from '../../helpers/utils'
import {pluralize} from '../../helpers/string'
import {EnforcementIcon} from '../EnforcementIcon'
import {RuleRunMetadataList, hasAdditionalMetadata} from './rule-run-metadata-list/index'
import {ListItem} from './rule-run-metadata-list/ListItem'
import {User} from './User'

type RuleSuiteDetailsDialogProps = {
  ruleSuite: RuleSuite
  visibleResult: RuleSuiteResult
  onClose: () => void
}

export const RuleSuiteDetailsDialog: FC<RuleSuiteDetailsDialogProps> = ({ruleSuite, visibleResult, onClose}) => {
  const {orderedCategories, passedRulesetCount, failedRulesetCount, bypassedRulesetCount} = useRulesetRunMap(
    ruleSuite,
    visibleResult,
  )

  const rejectedInPushPhase = ruleSuite.evaluationMetadata.preReceiveFailure || false

  // All PRs in merge queue group:
  const mergeGroupPrs = ruleSuite.evaluationMetadata.mergeGroupPullRequests
  // This ref update failure was an entire merge queue group:
  const isQueueFailure = ruleSuite.result === 'failed' && ruleSuite.evaluationMetadata.mergeQueueRemovalReason
  // Checks run while in the merge queue:
  const mergeQueueChecks = ruleSuite.evaluationMetadata.mergeQueueCheckResults

  return (
    <Dialog
      width="xlarge"
      onClose={onClose}
      sx={{overflowY: 'auto'}}
      renderHeader={() => (
        <Box sx={{display: 'flex', flexDirection: 'row', padding: 2}}>
          <Box sx={{display: 'flex', flexDirection: 'column', flex: 1, gap: 1, padding: 2}}>
            {isQueueFailure ? (
              <Text as="h4" sx={{fontWeight: 'bold', color: 'danger.fg'}}>
                Merge queue push failed
              </Text>
            ) : failedRulesetCount > 0 ? (
              <Text as="h4" sx={{fontWeight: 'bold', color: 'danger.fg'}}>
                Some rules did not pass
              </Text>
            ) : bypassedRulesetCount > 0 ? (
              <Text as="h4" sx={{fontWeight: 'bold', color: 'fg.default'}}>
                Some rules were bypassed
              </Text>
            ) : ruleSuite.result === 'push_rejected' ? (
              // If this update was rejected due to another push rules failure, don't show "all rules passed"
              <Text as="h4" sx={{fontWeight: 'bold', color: 'success.fg'}}>
                Push rules passed
              </Text>
            ) : (
              <Text as="h4" sx={{fontWeight: 'bold', color: 'success.fg'}}>
                All rules passed
              </Text>
            )}
            <Text sx={{color: 'fg.muted'}}>
              {resultMessage(passedRulesetCount, failedRulesetCount, bypassedRulesetCount)}
            </Text>
          </Box>
          <Dialog.CloseButton onClose={() => onClose()} />
        </Box>
      )}
      renderBody={() => (
        <>
          {rejectedInPushPhase && (
            <Flash variant="warning" sx={{mx: 3, mb: 3, display: 'flex', flexDirection: 'column'}}>
              <span>Push rules blocked this update, preventing other rulesets from applying.</span>
              {ruleSuite.result === 'push_rejected' && (
                <span>Other updates in this push were blocked impacting this change.</span>
              )}
            </Flash>
          )}
          <ul>
            {orderedCategories.map(([category, runs]) => {
              const evaluateMode = runs.some(run => run.result === 'evaluate_failed')
              const bypassed =
                (evaluateMode && visibleResult === 'bypassed') || (!evaluateMode && ruleSuite.result === 'bypassed')
              return (
                <Box
                  as="li"
                  sx={{
                    display: 'flex',
                    border: 0,
                    borderTop: 1,
                    borderTopStyle: 'solid',
                    borderTopColor: 'border.default',
                  }}
                  key={`${category.name}/${category.id}`}
                >
                  <RulesetRow ruleRuns={runs} category={category} categoryBypassed={bypassed} />
                </Box>
              )
            })}

            {(mergeGroupPrs?.length || mergeQueueChecks?.length) && (
              <Box
                as="li"
                key="mqdetails"
                sx={{
                  display: 'flex',
                  border: 0,
                  borderTop: 1,
                  borderTopStyle: 'solid',
                  borderTopColor: 'border.default',
                }}
              >
                <MergeQueueDetailsRow
                  afterOid={ruleSuite.afterOid}
                  mergeGroupPrs={mergeGroupPrs}
                  mergeQueueChecks={mergeQueueChecks}
                />
              </Box>
            )}
          </ul>
        </>
      )}
    />
  )
}

function resultMessage(passed: number, failed: number, bypassed: number) {
  const counts = new Map<string, number>(Object.entries({passed, failed, bypassed}))
  const entries = Array.from(counts.entries()).filter(x => x[1] > 0)
  if (entries.length > 2) {
    return entries.map(x => `${pluralize(x[1], 'ruleset', 'rulesets')} ${x[0]}`).join(', ')
  } else if (entries.length === 2) {
    return entries.map(x => `${pluralize(x[1], 'ruleset', 'rulesets')} ${x[0]}`).join(' and ')
  } else if (entries.length === 1) {
    return `${pluralize(entries[0]![1], 'ruleset', 'rulesets')} ${entries[0]![0]}`
  } else {
    return 'No rulesets ran'
  }
}

function MergeQueueDetailsRow({
  afterOid,
  mergeGroupPrs,
  mergeQueueChecks,
}: {
  afterOid?: string | null
  mergeGroupPrs?: PullRequestSummary[]
  mergeQueueChecks?: MergeQueueCheckResult[]
}) {
  const [showExpanded, setShowExpanded] = useState<boolean>(false)

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          flexGrow: 1,
          paddingY: 3,
          paddingLeft: 2,
          paddingRight: 4,
          alignItems: 'center',
        }}
      >
        <Box sx={{display: 'flex'}}>
          <IconButton
            sx={{color: 'fg.muted', marginRight: 1, flexShrink: 0}}
            icon={showExpanded ? ChevronDownIcon : ChevronRightIcon}
            size="small"
            variant="invisible"
            aria-label="View rule runs"
            title="View rule runs"
            type="button"
            onClick={() => setShowExpanded(!showExpanded)}
          />
        </Box>
        <Box sx={{display: 'flex', alignItems: 'baseline'}}>
          <Octicon icon={GitMergeQueueIcon} sx={{marginRight: 2, color: 'attention.fg'}} />
        </Box>
        <Box sx={{display: 'flex', alignItems: 'baseline', flexGrow: 1}}>
          <Text sx={{fontWeight: 'bold'}}>Merge queue details</Text>
        </Box>
      </Box>
      {showExpanded ? (
        <Box as="ul" sx={{backgroundColor: 'canvas.subtle'}}>
          {mergeGroupPrs?.length && <MergeGroupRow mergeGroupPrs={mergeGroupPrs} key="grp" />}

          {mergeQueueChecks?.length && (
            <MergeCheckList afterOid={afterOid} mergeQueueChecks={mergeQueueChecks} key="chk" />
          )}
        </Box>
      ) : null}
    </Box>
  )
}

function MergeGroupRow({mergeGroupPrs}: {mergeGroupPrs: PullRequestSummary[]}) {
  return (
    <Box
      as="li"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 2,
        paddingRight: 3,
        paddingBottom: 2,
        paddingLeft: 6,
        borderTopColor: 'border.default',
        borderTopStyle: 'solid',
        borderTopWidth: 1,
      }}
    >
      <Text sx={{flexShrink: 0, flexBasis: 'auto', paddingRight: 2, paddingBottom: 1, fontWeight: 'bold'}}>
        Pull requests in this merge group
      </Text>
      <Box sx={{display: 'flex', flexFlow: 'row wrap', columnGap: 2, flexGrow: 1}}>
        {mergeGroupPrs.map(pr => (
          <Link href={pr?.link} key={pr.id}>
            #{pr?.number}
          </Link>
        ))}
      </Box>
    </Box>
  )
}

function MergeCheckList({
  afterOid,
  mergeQueueChecks,
}: {
  afterOid?: string | null
  mergeQueueChecks: MergeQueueCheckResult[]
}) {
  return (
    <Box
      as="li"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 2,
        paddingRight: 3,
        paddingBottom: 2,
        paddingLeft: 6,
        borderTopColor: 'border.default',
        borderTopStyle: 'solid',
        borderTopWidth: 1,
      }}
    >
      <Box sx={{display: 'flex', flexDirection: 'row', flexGrow: 0}}>
        <Text sx={{flexGrow: 0, fontWeight: 'bold'}}>Required checks run by the merge queue</Text>
      </Box>

      <Box
        as="ul"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 1,
          marginBottom: 1,
          paddingLeft: 2,
          columnGap: 1,
          borderTopStyle: 'none',
        }}
      >
        {mergeQueueChecks.map(check => (
          <MergeCheckRow afterOid={afterOid} mergeCheck={check} key={check.context} />
        ))}
      </Box>
    </Box>
  )
}

function MergeCheckRow({afterOid, mergeCheck}: {afterOid?: string | null; mergeCheck: MergeQueueCheckResult}) {
  return (
    <Box
      as="li"
      sx={{
        display: 'flex',
        flexGrow: 1,
        borderTopStyle: 'none',
      }}
    >
      <ListItem
        paddingY={0}
        key={mergeCheck.context}
        state={mergeCheck.state || 'pending'}
        title={` / ${mergeCheck.context}`}
        description={` ${afterOid ? `• ${afterOid.toString().slice(0, 6)}` : ''}`}
      />
    </Box>
  )
}

function RulesetRow({
  ruleRuns,
  category,
  categoryBypassed,
}: {
  ruleRuns: RuleRun[]
  category: Category
  categoryBypassed: boolean
}) {
  const [showExpanded, setShowExpanded] = useState<boolean>(false)
  const allowed = ruleRuns.every(run => run.result === 'allowed' || run.result === 'evaluate_allowed')
  const failureCount = ruleRuns.filter(run => run.result === 'evaluate_failed' || run.result === 'failed').length
  const outOfDate = ruleRuns.some(run => run.insightsSourceOutOfDate)

  const validResponses = [
    ...new Map<number, ExemptionResponseMetadata>(
      ruleRuns.flatMap(run => (run.exemptionResponses || []).map(resp => [resp.id, resp])),
    ).values(),
  ]

  let bypassNote = null
  let verb = null
  let responders = validResponses.filter(response => response.status === 'rejected')
  if (responders.length > 0) {
    verb = 'rejected'
  } else {
    responders = validResponses.filter(response => response.status === 'approved')
    if (responders.length > 0) {
      verb = 'approved'
    }
  }

  if (responders.length > 0 && verb) {
    const firstResponder = responders[0]!

    bypassNote = (
      <>
        <Text sx={{mr: 1}}>
          {firstResponder.exemptionRequestUrl ? (
            <Link href={firstResponder.exemptionRequestUrl}>Bypass request</Link>
          ) : (
            'Bypass request'
          )}{' '}
          {verb} by
        </Text>
        <User user={firstResponder.reviewer} />
        {responders.length > 1 ? `and ${responders.length - 1} others` : ''}.
      </>
    )
  }

  const orderedRuns = partition(ruleRuns, run => run.result === 'failed' || run.result === 'evaluate_failed').flat()

  return (
    <Box sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, overflowX: 'clip'}}>
      <Box sx={{display: 'flex', flexDirection: 'column', paddingY: 3}}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            flexGrow: 1,
            paddingLeft: 2,
            paddingRight: 4,
            alignItems: 'center',
          }}
        >
          <Box sx={{display: 'flex'}}>
            <IconButton
              sx={{color: 'fg.muted', marginRight: 1, flexShrink: 0}}
              icon={showExpanded ? ChevronDownIcon : ChevronRightIcon}
              size="small"
              variant="invisible"
              aria-label="View rule runs"
              title="View rule runs"
              type="button"
              onClick={() => setShowExpanded(!showExpanded)}
            />
          </Box>
          <Box sx={{display: 'flex', alignItems: 'baseline'}}>
            {allowed ? (
              <Octicon icon={CheckCircleFillIcon} sx={{marginRight: 2, color: 'success.fg'}} />
            ) : (
              <Octicon icon={XCircleFillIcon} sx={{marginRight: 2, color: 'danger.fg'}} />
            )}
          </Box>
          <Box sx={{display: 'flex', alignItems: 'baseline', flexGrow: 1}}>
            {category.link ? (
              <Link hoverColor="accent.fg" sx={{color: 'fg.default'}} href={category.link}>
                <Text sx={{fontWeight: 'bold'}}>{category.name}</Text>
              </Link>
            ) : (
              <Text sx={{fontWeight: 'bold'}}>{category.name}</Text>
            )}
            {outOfDate && (
              <Tooltip wrap aria-label="The ruleset that ran for this push has changed">
                <Label sx={{marginLeft: 2}} variant="secondary">
                  Outdated
                </Label>
              </Tooltip>
            )}
            {!allowed && (
              <Text sx={{marginLeft: 2, color: 'danger.fg', fontSize: 0}}>
                {pluralize(failureCount, 'rule', 'rules')} {categoryBypassed ? 'bypassed' : 'failed'}
              </Text>
            )}
          </Box>
          <Box sx={{display: 'flex', alignItems: 'baseline', marginLeft: 1}}>
            <EnforcementIcon enforcement={calcuateEnforcement(ruleRuns)} />
          </Box>
        </Box>
        {bypassNote && (
          <Box sx={{marginLeft: 8}}>{<Text sx={{color: 'fg.muted', fontSize: 0}}>{bypassNote}</Text>}</Box>
        )}
      </Box>
      {showExpanded ? (
        <ul>
          {orderedRuns.map(ruleRun => (
            <RunListItem key={ruleRun.id} ruleRun={ruleRun} bypassed={categoryBypassed} />
          ))}
        </ul>
      ) : null}
    </Box>
  )
}

function RunListItem({ruleRun, bypassed}: {ruleRun: RuleRun; bypassed: boolean}) {
  const [showExpanded, setShowExpanded] = useState<boolean>(false)
  const {result, message} = ruleRun
  const isAllowed = result === 'allowed' || result === 'evaluate_allowed'
  return (
    <Box
      as="li"
      sx={{
        display: 'flex',
        paddingBottom: 2,
        paddingLeft: 4,
        paddingRight: 3,
        backgroundColor: 'canvas.subtle',
        borderTopColor: 'border.default',
        borderTopStyle: 'solid',
        borderTopWidth: 1,
      }}
    >
      {hasAdditionalMetadata(ruleRun) ? (
        <IconButton
          sx={{color: 'fg.muted', marginRight: 1, marginTop: 1, flexShrink: 0}}
          icon={showExpanded ? ChevronDownIcon : ChevronRightIcon}
          size="small"
          variant="invisible"
          aria-label="View rule run"
          title="View rule run"
          type="button"
          onClick={() => setShowExpanded(!showExpanded)}
        />
      ) : (
        <Box sx={{paddingLeft: 3, paddingRight: 2, marginRight: 2}} />
      )}
      <Box
        sx={{display: 'flex', flexDirection: 'column', flexGrow: 1, paddingTop: 2, marginLeft: 1, overflowX: 'clip'}}
      >
        <Box sx={{display: 'flex', flexDirection: 'row', flexGrow: 1}}>
          {isAllowed ? (
            <Octicon icon={CheckCircleFillIcon} sx={{marginTop: 0.9, marginRight: 2, color: 'success.fg'}} />
          ) : (
            <Octicon icon={XCircleFillIcon} sx={{marginTop: 0.9, marginRight: 2, color: 'danger.fg'}} />
          )}
          <Text sx={{flexGrow: 1, fontWeight: 'bold'}}>{ruleDisplayName(ruleRun)}</Text>
          {result === 'failed' && !bypassed && (
            <Text sx={{marginRight: 3, color: 'danger.fg', fontSize: 0}}>Push blocked</Text>
          )}
        </Box>
        <Box sx={{marginLeft: 4}}>{message && <Text sx={{color: 'fg.muted', fontSize: 0}}>{message}</Text>}</Box>
        {showExpanded ? <RuleRunMetadataList ruleRun={ruleRun} /> : null}
      </Box>
    </Box>
  )
}

function calcuateEnforcement(ruleRuns: RuleRun[]) {
  if (ruleRuns.some(run => run.result === 'evaluate_allowed' || run.result === 'evaluate_failed')) {
    return RulesetEnforcement.Evaluate
  } else {
    return RulesetEnforcement.Enabled
  }
}

function ruleDisplayName(ruleRun: RuleRun) {
  const name = ruleRun.ruleDisplayName || ruleRun.ruleType

  // Custom render for PR rule to show the passing PR link if present
  if (ruleRun.ruleType === 'pull_request' && ruleRun.metadata) {
    return (
      <>
        {`${name} (`}
        <Link href={(ruleRun.metadata as PullRequestMetadata).prLink}>
          #{(ruleRun.metadata as PullRequestMetadata).prNumber}
        </Link>
        {')'}
      </>
    )
  }

  return name
}

type Category = {
  name: string
  id: number | null
  link?: string
}

type OrderedCategory = Array<[Category, RuleRun[]]>

function useRulesetRunMap(
  ruleSuite: RuleSuite,
  visibleResult?: RuleSuiteResult,
): {
  orderedCategories: Array<[Category, RuleRun[]]>
  failedRulesetCount: number
  passedRulesetCount: number
  bypassedRulesetCount: number
} {
  const [failedCategories, passedCategories, bypassedCategories] = useMemo<
    [OrderedCategory, OrderedCategory, OrderedCategory]
  >(() => {
    const categoriesById = new Map<string | number, Category>()
    const runsByCategoryId = new Map<string | number, RuleRun[]>()
    for (const run of ruleSuite.ruleRuns) {
      const categoryId = run.insightsCategory.id || run.insightsCategory.name
      categoriesById.set(categoryId, run.insightsCategory)

      const runs = runsByCategoryId.get(categoryId) || []
      runs.push(run)
      runsByCategoryId.set(categoryId, runs)
    }

    const categoryMap = new Map<Category, RuleRun[]>()
    for (const [categoryId, runs] of runsByCategoryId.entries()) {
      categoryMap.set(categoriesById.get(categoryId)!, runs)
    }

    const [failedOrBypassed, passed] = partitionMap(categoryMap, (_k, v) => {
      return v.some(run => run.result === 'evaluate_failed' || run.result === 'failed')
    })
    const [bypassed, failed] = partitionMap(new Map(failedOrBypassed), (_k, v) => {
      const evaluateMode = v.some(run => run.result === 'evaluate_failed')
      return (evaluateMode && visibleResult === 'bypassed') || (!evaluateMode && ruleSuite.result === 'bypassed')
    })
    return [failed, passed, bypassed]
  }, [ruleSuite, visibleResult])

  return {
    orderedCategories: failedCategories.concat(bypassedCategories).concat(passedCategories),
    failedRulesetCount: failedCategories.length,
    passedRulesetCount: passedCategories.length,
    bypassedRulesetCount: bypassedCategories.length,
  }
}
