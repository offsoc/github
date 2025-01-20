import type {FC} from 'react'
import type {
  ConditionParameters,
  RulesetTarget,
  RepositoryIdParameters,
  RepositoryIdConditionMetadata,
  IncludeExcludeParameters,
  RepositoryPropertyParameters,
  TargetType,
} from '../../../types/rules-types'
import {INCLUDE_ALL_PATTERN} from '../../../types/rules-types'
import {IncludeExcludeTarget} from './IncludeExcludeTarget'
import {RepositoryIdTarget} from './RepositoryIdTarget'
import {TargetsTable} from '../TargetsTable'
import {RepositoryPropertyTarget} from './RepositoryPropertyTarget'
import {isAllCondition} from '../../../helpers/conditions'

const PUSH_RULESET_TARGET_INFO = 'Push rulesets only apply to private repositories and their forks'

export type RepositoryTargetProps = {
  rulesetId?: number
  readOnly: boolean
  fnmatchHelpUrl?: string
  rulesetTarget: RulesetTarget
  targetType: TargetType
  parameters: ConditionParameters
  metadata?: object
  updateParameters: (parameters: ConditionParameters) => void
}

export const RepositoryTarget: FC<RepositoryTargetProps> = ({
  rulesetId,
  readOnly,
  fnmatchHelpUrl,
  rulesetTarget,
  targetType,
  parameters,
  metadata,
  updateParameters,
}) => {
  const target = isAllCondition(targetType, parameters) ? 'all_repos' : targetType
  return target === 'all_repos' && !readOnly ? null : (
    <div>
      {target === 'repository_name' ? (
        <IncludeExcludeTarget
          rulesetId={rulesetId}
          readOnly={readOnly}
          rulesetTarget={rulesetTarget}
          fnmatchHelpUrl={fnmatchHelpUrl}
          parameters={parameters as IncludeExcludeParameters}
          panelTitle="Targeting criteria"
          targetType="repository_name"
          updateParameters={updateParameters}
          headerRowText={rulesetTarget === 'push' ? PUSH_RULESET_TARGET_INFO : undefined}
          blankslate={{
            heading: 'No repository targets have been added yet',
          }}
        />
      ) : target === 'repository_id' ? (
        <RepositoryIdTarget
          readOnly={readOnly}
          parameters={parameters as RepositoryIdParameters}
          metadata={metadata as RepositoryIdConditionMetadata | undefined}
          updateParameters={updateParameters}
          headerRowText={rulesetTarget === 'push' ? PUSH_RULESET_TARGET_INFO : undefined}
          excludePublicRepos={rulesetTarget === 'push'}
          blankslate={{
            heading: 'No repository targets have been added yet',
            description: !readOnly ? (
              <>Repository targeting determines which repositories will be protected by this ruleset.</>
            ) : undefined,
          }}
        />
      ) : target === 'repository_property' ? (
        <RepositoryPropertyTarget
          readOnly={readOnly}
          parameters={parameters as RepositoryPropertyParameters}
          updateParameters={updateParameters}
          headerRowText={rulesetTarget === 'push' ? PUSH_RULESET_TARGET_INFO : undefined}
          rulesetTarget={rulesetTarget}
          blankslate={{
            heading: 'No repository targets have been added yet',
            description: !readOnly ? (
              <>Repository targeting determines which repositories will be protected by this ruleset.</>
            ) : undefined,
          }}
        />
      ) : (
        <TargetsTable
          renderTitle={() => <h3 className="Box-title">Repositories</h3>}
          blankslate={{
            heading: 'No repository targets have been added yet',
            description: !readOnly ? (
              <>Repository targeting determines which repositories will be protected by this ruleset.</>
            ) : undefined,
          }}
          headerRowText={rulesetTarget === 'push' ? PUSH_RULESET_TARGET_INFO : undefined}
          targets={[{type: 'include', value: INCLUDE_ALL_PATTERN}]}
          readOnly
        />
      )}
    </div>
  )
}
