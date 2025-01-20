import {useCallback, type FC} from 'react'
import type {
  ConditionParameters,
  RulesetTarget,
  IncludeExcludeParameters,
  TargetType,
  OrganizationIdConditionMetadata,
  OrganizationIdParameters,
} from '../../../types/rules-types'
import {IncludeExcludeTarget} from './IncludeExcludeTarget'
import {isAllCondition} from '../../../helpers/conditions'
import {OrganizationIdTarget} from './OrganizationIdTarget'
import {Checkbox, FormControl} from '@primer/react'

const PUSH_RULESET_TARGET_INFO = 'Push rulesets only apply to private repositories and their forks'

export type OrganizationTargetProps = {
  rulesetId?: number
  readOnly: boolean
  fnmatchHelpUrl?: string
  rulesetTarget: RulesetTarget
  targetType: TargetType
  parameters: ConditionParameters
  metadata?: object
  updateParameters: (parameters: ConditionParameters) => void
  supportsEmuTargeting: boolean
}

export const OrganizationTarget: FC<OrganizationTargetProps> = ({
  rulesetId,
  readOnly,
  fnmatchHelpUrl,
  rulesetTarget,
  targetType,
  parameters,
  metadata,
  updateParameters,
  supportsEmuTargeting,
}) => {
  const includeEmuAccounts = (parameters as IncludeExcludeParameters | OrganizationIdParameters).include_emu_accounts
  const toggleIncludeEmuAccounts = useCallback(() => {
    updateParameters({
      ...parameters,
      include_emu_accounts: !includeEmuAccounts,
    })
  }, [includeEmuAccounts, parameters, updateParameters])

  const target = isAllCondition(targetType, parameters) ? 'all_orgs' : targetType
  return (
    <div>
      {target === 'organization_name' ? (
        <IncludeExcludeTarget
          rulesetId={rulesetId}
          readOnly={readOnly}
          rulesetTarget={rulesetTarget}
          fnmatchHelpUrl={fnmatchHelpUrl}
          parameters={parameters as IncludeExcludeParameters}
          panelTitle="Targeting criteria"
          targetType="organization_name"
          updateParameters={updateParameters}
          headerRowText={rulesetTarget === 'push' ? PUSH_RULESET_TARGET_INFO : undefined}
          blankslate={{
            heading: 'No organization targets have been added yet',
          }}
        />
      ) : target === 'organization_id' ? (
        <OrganizationIdTarget
          readOnly={readOnly}
          parameters={parameters as OrganizationIdParameters}
          metadata={metadata as OrganizationIdConditionMetadata | undefined}
          updateParameters={updateParameters}
          headerRowText={rulesetTarget === 'push' ? PUSH_RULESET_TARGET_INFO : undefined}
          blankslate={{
            heading: 'No organization targets have been added yet',
            description: !readOnly ? (
              <>Organization targeting determines which repositories will be protected by this ruleset.</>
            ) : undefined,
          }}
        />
      ) : null}

      {!readOnly && supportsEmuTargeting && (
        <div className={target === 'all_orgs' ? 'pb-3' : 'py-3'}>
          <FormControl>
            <Checkbox checked={includeEmuAccounts || false} onChange={toggleIncludeEmuAccounts} />
            <FormControl.Label>Target all enterprise managed user accounts</FormControl.Label>
            <FormControl.Caption>
              If enabled, this ruleset will also apply to all repositories owned by enterprise managed users.
            </FormControl.Caption>
          </FormControl>
        </div>
      )}
    </div>
  )
}
