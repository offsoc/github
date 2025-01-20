import type {FC} from 'react'
import {useMemo} from 'react'
import {ActionList, Box} from '@primer/react'
import type {Repository} from '@github-ui/current-repository'
import {RefSelector} from '@github-ui/ref-selector'
import {ReposSelector, simpleRepoLoader} from '@github-ui/repos-selector'
import {TimeFilter} from '@github-ui/action-menu-selector/TimeFilter'
import type {InsightsFilter, Ruleset, SourceType} from '../../types/rules-types'
import type {Organization} from '@github-ui/repos-types'
import {RuleStatusFilter} from './RuleStatusFilter'
import {UserSelector} from '@github-ui/user-selector'
import {RulesetFilter} from './RulesetFilter'
import {insightsIndexPath} from '../../helpers/insights-filter'
import {useInsightsActors} from '../../hooks/use-insights-actors'
import {useRelativeNavigation} from '../../hooks/use-relative-navigation'
import {EvaluateStatusFilter} from './EvaluateStatusFilter'

type InsightsFilterProps = {
  filter: InsightsFilter
  source: Repository | Organization
  sourceType: SourceType
  branchListCacheKey?: string
  rulesets: Ruleset[]
  repositories?: string[]
}

export const InsightsFilterBar: FC<InsightsFilterProps> = ({
  filter,
  source,
  sourceType,
  branchListCacheKey,
  rulesets,
  repositories,
}) => {
  const {actor, timePeriod, ruleset, branch, ruleStatus, evaluateStatus, repository} = filter
  const {navigate} = useRelativeNavigation()
  const insightsActorsState = useInsightsActors()

  const updateFilter = (newFilter: InsightsFilter) => {
    newFilter.page = undefined // Reset to first page when filter changes
    navigate('.', insightsIndexPath({filter: newFilter}), true)
  }

  const namedRepos = useMemo(() => repositories?.map(r => ({name: r})) || [], [repositories])

  return (
    <Box sx={{display: 'flex', flexDirection: 'row', flexWrap: 'wrap'}} className="mb-3">
      <div className="d-flex p-1">
        <EvaluateStatusFilter
          currentEvaluateStatus={evaluateStatus || 'active'}
          onSelect={selectedEvaluateStatus => {
            if (selectedEvaluateStatus !== evaluateStatus) {
              updateFilter({...filter, evaluateStatus: selectedEvaluateStatus})
            }
          }}
        />
      </div>
      <div className="d-flex p-1">
        <RulesetFilter
          currentRuleset={ruleset}
          allRulesets={rulesets}
          onSelect={selectedRuleset => {
            if (selectedRuleset !== ruleset) {
              updateFilter({...filter, ruleset: selectedRuleset})
            }
          }}
        />
      </div>
      {sourceType === 'repository' && (
        <div className="d-flex p-1">
          <RefSelector
            currentCommitish={branch || 'All branches'}
            defaultBranch={(source as Repository).defaultBranch}
            owner={(source as Repository).ownerLogin}
            repo={source.name}
            canCreate={false}
            cacheKey={branchListCacheKey as string}
            onSelectItem={ref => {
              if (ref !== branch) {
                updateFilter({...filter, branch: ref})
              }
            }}
            hotKey="w"
            types={['branch']}
            hideShowAll
            customFooterItemProps={{
              text: 'View for all branches',
              onClick: () => {
                if (branch !== undefined) {
                  updateFilter({...filter, branch: undefined})
                }
              },
              sx: {alignItems: 'center', display: 'flex', justifyContent: 'center'},
            }}
          />
        </div>
      )}
      {sourceType === 'organization' && (
        <div className="d-flex p-1">
          <ReposSelector
            currentSelection={repository ? {name: repository} : undefined}
            repositoryLoader={simpleRepoLoader(namedRepos)}
            selectAllOption={true}
            selectionVariant="single"
            onSelect={selectedRepository => {
              if (selectedRepository?.name !== repository) {
                updateFilter({...filter, repository: selectedRepository?.name})
              }
            }}
          />
        </div>
      )}
      <div className="d-flex p-1">
        <UserSelector
          defaultText="All users"
          usersState={insightsActorsState}
          currentUser={actor}
          onSelect={selectedUser => {
            if (selectedUser !== actor) {
              updateFilter({...filter, actor: selectedUser})
            }
          }}
          renderCustomFooter={() => (
            <ActionList.Item
              onSelect={() => {
                updateFilter({...filter, actor: undefined})
              }}
            >
              View for all users
            </ActionList.Item>
          )}
        />
      </div>
      <div className="d-flex p-1">
        <TimeFilter
          currentTimePeriod={timePeriod || 'day'}
          onSelect={selectedTimePeriod => {
            if (selectedTimePeriod !== timePeriod) {
              updateFilter({...filter, timePeriod: selectedTimePeriod})
            }
          }}
        />
      </div>
      <div className="d-flex p-1">
        <RuleStatusFilter
          currentRuleStatus={ruleStatus || 'all'}
          onSelect={selectedRuleStatus => {
            if (selectedRuleStatus !== ruleStatus) {
              updateFilter({...filter, ruleStatus: selectedRuleStatus})
            }
          }}
        />
      </div>
    </Box>
  )
}
