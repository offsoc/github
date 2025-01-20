import {AlertIcon} from '@primer/octicons-react'
import {Box, Heading, Link, Text} from '@primer/react'
import type {FC, RefObject} from 'react'
import {useCallback, useEffect, useMemo} from 'react'
import {isAllCondition, getDefaultTargetByObject} from '../../helpers/conditions'
import {
  PLURAL_RULESET_TARGETS,
  PLURAL_TARGET_OBJECT_TYPES,
  TARGET_OBJECT_BY_TYPE,
  TARGET_OBJECT_TYPES,
} from '../../helpers/constants'
import {capitalize, pluralize} from '../../helpers/string'
import type {
  Condition,
  ConditionParameters,
  DetailedValidationErrors,
  IncludeExcludeParameters,
  RepositoryPropertyParameters,
  RulesetTarget,
  TargetObjectType,
  ExpandedTargetType,
  TargetType,
} from '../../types/rules-types'
import {RefPill} from '../RefPill'
import {IncludeExcludeTarget} from './conditions/IncludeExcludeTarget'
import {PanelHeader} from './conditions/PanelHeader'
import {RepositoryTarget} from './conditions/RepositoryTarget'
import {RulesetFormErrorFlash} from '../RulesetFormErrorFlash'
import {RepositoryConditionsError} from '../rule-schema/errors/RepositoryConditionsError'
import {PushRulePublicTargetingBanner} from './PushRulePublicTargetingBanner'
import {orgRepositoriesPath} from '@github-ui/paths'
import {buildQueryForAllProperties} from '../../helpers/custom-properties-query'
import {OrganizationTarget} from './conditions/OrganizationTarget'
import type {Repository} from '@github-ui/current-repository'
import type {Enterprise, Organization} from '@github-ui/repos-types'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {emptyParametersByType, OrganizationTargetTypeSelector, RepositoryTargetTypeSelector} from './TargetTypeSelector'

type AffectedTargetsSummaryProps = {
  rulesetPreviewCount: number | undefined
  rulesetPreviewSamples: string[] | undefined
  rulesetError: string | undefined
  conditions: Condition[]
  sourceName: string
  targetObjectType: TargetObjectType
}

const AffectedTargetsSummary: FC<AffectedTargetsSummaryProps> = ({
  rulesetPreviewCount,
  rulesetPreviewSamples,
  rulesetError,
  conditions,
  sourceName,
  targetObjectType,
}) => {
  if (rulesetError) {
    return (
      <Box sx={{mt: 1}}>
        <Text className="text-small color-fg-muted" as="span" sx={{mr: 1}}>
          {rulesetError}
        </Text>
      </Box>
    )
  }

  if (typeof rulesetPreviewCount !== 'number') {
    return null
  }

  const propertyConditions = conditions?.find(c => c.target === 'repository_property')

  if (propertyConditions) {
    const parameters = propertyConditions.parameters as RepositoryPropertyParameters

    const repoQueryLink = buildRepoQueryUrl({
      orgName: sourceName,
      parameters,
    })
    return (
      <Box sx={{mt: 1}}>
        <Text className="text-small color-fg-muted" as="span" sx={{mr: 1}}>
          Applies to{' '}
          <Link inline={true} href={repoQueryLink}>
            {pluralize(rulesetPreviewCount, targetObjectType, PLURAL_TARGET_OBJECT_TYPES)}
          </Link>
          .
        </Text>
      </Box>
    )
  }

  return (
    <Box sx={{mt: 1}}>
      <span className="text-small color-fg-muted">
        Applies to {pluralize(rulesetPreviewCount, 'target', 'targets')}
        {rulesetPreviewCount === 1 ? ':' : ''}
        {rulesetPreviewSamples && rulesetPreviewSamples.length > 1 ? ' including ' : ''}
      </span>
      {rulesetPreviewSamples &&
        rulesetPreviewSamples.map((target: string, index: number) => (
          <span key={target}>
            {index === rulesetPreviewSamples.length - 1 && rulesetPreviewCount <= 10 && index > 0 && (
              <Text className="text-small color-fg-muted mt-1" as="span" sx={{mr: 1}}>
                and
              </Text>
            )}
            <RefPill param={target} />
            <span className="text-small color-fg-muted mt-1">
              {index < rulesetPreviewSamples.length - 1 ? ', ' : rulesetPreviewCount > 10 ? ' and others' : ''}
            </span>
          </span>
        ))}
      <span className="text-small color-fg-muted">.</span>
    </Box>
  )
}

function buildRepoQueryUrl({orgName, parameters}: {orgName: string; parameters: RepositoryPropertyParameters}): string {
  const query = buildQueryForAllProperties(parameters)

  return orgRepositoriesPath({owner: orgName, query})
}

export type TargetsPanelProps = {
  rulesetId?: number
  readOnly: boolean
  rulesetTarget: RulesetTarget
  rulesetPreviewCount: number | undefined
  rulesetPreviewSamples: string[] | undefined
  rulesetError: string | undefined
  fnmatchHelpUrl?: string
  dirtyConditions: Condition[]
  conditions: Condition[]
  conditionErrors?: DetailedValidationErrors['conditions']
  supportedConditionTargetObjects: TargetObjectType[]
  repositoryConditionRef: RefObject<HTMLButtonElement | HTMLDivElement>
  refConditionRef: RefObject<HTMLButtonElement | HTMLDivElement>
  addOrUpdateCondition: (target: TargetType, parameters: ConditionParameters) => void
  removeCondition: (condition: Condition) => void
  source: Repository | Organization | Enterprise
}

export const TargetsPanel: FC<TargetsPanelProps> = ({
  rulesetId,
  readOnly,
  rulesetTarget,
  rulesetPreviewCount,
  rulesetPreviewSamples,
  rulesetError,
  fnmatchHelpUrl,
  dirtyConditions,
  conditions,
  conditionErrors,
  supportedConditionTargetObjects,
  repositoryConditionRef,
  refConditionRef,
  addOrUpdateCondition,
  removeCondition,
  source,
}) => {
  const isEditing = typeof rulesetId !== 'undefined'
  const emuTargetingEnabled =
    useFeatureFlag('emu_inherit_rulesets_from_business') && (source as Enterprise).enterpriseManaged

  const conditionsByObject = useMemo(() => {
    return TARGET_OBJECT_TYPES.reduce((map, objectType) => {
      let condition = conditions.find(c => TARGET_OBJECT_BY_TYPE[c.target] === objectType)
      if (!condition) {
        const targetForParameters = getDefaultTargetByObject(objectType, {
          supportedConditionTargetObjects,
        })
        condition = {
          target: getDefaultTargetByObject(objectType) as TargetType,
          parameters: emptyParametersByType(targetForParameters),
          _dirty: true,
        }
      }
      map.set(objectType, condition)
      return map
    }, new Map<TargetObjectType, Condition>())
  }, [conditions, supportedConditionTargetObjects])

  const selectedTypeByObject = useMemo(() => {
    return TARGET_OBJECT_TYPES.reduce((map, objectType) => {
      const condition = conditionsByObject.get(objectType)!
      map.set(objectType, condition.target)
      return map
    }, new Map<TargetObjectType, TargetType>())
  }, [conditionsByObject])

  const changeConditionType = useCallback(
    (newType: ExpandedTargetType) => {
      let normalizedType = newType
      if (newType === 'all_orgs') {
        normalizedType = 'organization_name'
      }
      if (newType === 'all_repos') {
        normalizedType = 'repository_name'
      }
      // Remove any existing condition for this object type
      const condition = conditions.find(
        c => TARGET_OBJECT_BY_TYPE[c.target] === TARGET_OBJECT_BY_TYPE[normalizedType as TargetType],
      )
      if (condition) {
        removeCondition(condition)
      }

      addOrUpdateCondition(normalizedType as TargetType, emptyParametersByType(newType))
    },
    [conditions, removeCondition, addOrUpdateCondition],
  )

  useEffect(() => {
    for (const targetObjectType of supportedConditionTargetObjects) {
      const condition = conditionsByObject.get(targetObjectType)
      if (!condition) {
        continue
      }
      const persistedCondition = conditions.find(({target}) => target === condition.target)
      if (!persistedCondition) {
        addOrUpdateCondition(condition.target, condition.parameters)
      }
    }
  }, [conditions, conditionsByObject, supportedConditionTargetObjects, addOrUpdateCondition])

  const targetsRefs = supportedConditionTargetObjects.includes('ref')
  const targetsRepos = supportedConditionTargetObjects.includes('repository')
  const targetsOrgs = supportedConditionTargetObjects.includes('organization')

  const excludedRepoConditions: TargetType[] = targetsOrgs ? ['repository_id', 'repository_name'] : []
  const panelSubtitle =
    targetsRefs && targetsRepos
      ? `repositories and ${pluralize(2, rulesetTarget, PLURAL_RULESET_TARGETS, false)}`
      : targetsRefs
        ? `${pluralize(2, rulesetTarget, PLURAL_RULESET_TARGETS, false)}`
        : targetsRepos
          ? 'repositories'
          : ''

  function targetingSubtitle(target: string, pluralTarget: string) {
    return `${capitalize(
      target,
    )} targeting determines which ${pluralTarget} will be protected by this ruleset. Use inclusion patterns to expand the list of ${pluralTarget} under this ruleset. Use exclusion patterns to exclude ${pluralTarget}.`
  }

  return (
    <>
      <PanelHeader title="Targets" subtitle={`Which ${panelSubtitle} do you want to make a ruleset for?`} />
      <div className={`d-flex flex-column`}>
        {targetsOrgs && (
          <>
            <div className={`mb-${!readOnly ? 3 : 0}`}>
              <Heading as="h3" sx={{mb: 1, mt: 4, fontSize: 3, fontWeight: 'normal'}}>
                Target organizations
              </Heading>
              <span className="color-fg-muted">{targetingSubtitle('organization', 'organizations')}</span>
            </div>
            {!readOnly && (
              <div className="pb-3">
                <OrganizationTargetTypeSelector
                  currentOrgCondition={conditionsByObject.get('organization')!}
                  setOrgCondition={changeConditionType}
                />
              </div>
            )}
            <OrganizationTarget
              rulesetId={rulesetId}
              readOnly={readOnly}
              fnmatchHelpUrl={fnmatchHelpUrl}
              rulesetTarget={rulesetTarget}
              targetType={selectedTypeByObject.get('organization')!}
              parameters={conditionsByObject.get('organization')!.parameters}
              metadata={conditionsByObject.get('organization')!.metadata}
              updateParameters={parameters =>
                addOrUpdateCondition(selectedTypeByObject.get('organization')!, parameters)
              }
              supportsEmuTargeting={emuTargetingEnabled}
            />

            {!isAllCondition(
              selectedTypeByObject.get('organization')!,
              conditionsByObject.get('organization')!.parameters,
            ) && (
              <>
                <AffectedTargetsSummary
                  rulesetPreviewCount={rulesetPreviewCount}
                  rulesetPreviewSamples={rulesetPreviewSamples}
                  rulesetError={rulesetError}
                  conditions={conditions}
                  sourceName={source.name}
                  targetObjectType="organization"
                />
                <div className="d-flex flex-column">
                  {isEditing && dirtyConditions.some(x => TARGET_OBJECT_BY_TYPE[x.target] === 'organization') && (
                    <div className="text-small mt-1 d-flex color-fg-attention">
                      <AlertIcon />
                      <span className="ml-1" aria-live="polite">
                        Targets have changed and organization match list will update on save.
                      </span>
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
        {targetsRepos && (
          <div>
            <div className={`mb-${!readOnly ? 3 : 0}`}>
              <Heading as="h3" sx={{mb: 1, mt: 4, fontSize: 3, fontWeight: 'normal'}}>
                Target repositories
              </Heading>
              <span className="color-fg-muted">{targetingSubtitle('repository', 'repositories')}</span>
              {conditionErrors?.repository?.[0]?.message && (
                <RepositoryConditionsError
                  errors={conditionErrors?.repository}
                  errorId="repo-target-error"
                  errorRef={repositoryConditionRef as RefObject<HTMLDivElement>}
                />
              )}
            </div>
            {rulesetTarget === 'push' && (
              <div className="mb-3">
                <PushRulePublicTargetingBanner />
              </div>
            )}
            <div data-testid="targets-repository-name-conditions">
              {!readOnly && (
                <div className="pb-3">
                  <RepositoryTargetTypeSelector
                    excludeConditions={excludedRepoConditions}
                    currentRepoCondition={conditionsByObject.get('repository')!}
                    setRepoCondition={changeConditionType}
                  />
                </div>
              )}
              <RepositoryTarget
                rulesetId={rulesetId}
                readOnly={readOnly}
                fnmatchHelpUrl={fnmatchHelpUrl}
                rulesetTarget={rulesetTarget}
                targetType={selectedTypeByObject.get('repository')!}
                parameters={conditionsByObject.get('repository')!.parameters}
                metadata={conditionsByObject.get('repository')!.metadata}
                updateParameters={parameters =>
                  addOrUpdateCondition(selectedTypeByObject.get('repository')!, parameters)
                }
              />

              {!targetsOrgs &&
                !isAllCondition(
                  selectedTypeByObject.get('repository')!,
                  conditionsByObject.get('repository')!.parameters,
                ) && (
                  <>
                    <AffectedTargetsSummary
                      rulesetPreviewCount={rulesetPreviewCount}
                      rulesetPreviewSamples={rulesetPreviewSamples}
                      rulesetError={rulesetError}
                      conditions={conditions}
                      sourceName={source.name}
                      targetObjectType="repository"
                    />
                    <div className="d-flex flex-column">
                      {isEditing && dirtyConditions.some(x => TARGET_OBJECT_BY_TYPE[x.target] === 'repository') && (
                        <div className="text-small mt-1 d-flex color-fg-attention">
                          <AlertIcon />
                          <span className="ml-1" aria-live="polite">
                            Targets have changed and repository match list will update on save.
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                )}
            </div>
          </div>
        )}

        {targetsRefs && (
          <>
            <div className={`mb-${!readOnly ? 3 : 0}`}>
              <Heading as="h3" sx={{mb: 1, mt: 4, fontSize: 3, fontWeight: 'normal'}}>
                Target {pluralize(2, rulesetTarget, PLURAL_RULESET_TARGETS, false)}
              </Heading>
              {!readOnly && (
                <span className="fg-color-muted">
                  {targetingSubtitle(rulesetTarget, pluralize(2, rulesetTarget, PLURAL_RULESET_TARGETS, false))}
                </span>
              )}
              {conditionErrors?.ref?.[0]?.message && (
                <RulesetFormErrorFlash
                  errorId="ref-target-error"
                  sx={{mt: 1}}
                  errorRef={refConditionRef as RefObject<HTMLDivElement>}
                >
                  {conditionErrors.ref[0].message}
                </RulesetFormErrorFlash>
              )}
            </div>
            <div data-testid="targets-ref-name-conditions">
              <IncludeExcludeTarget
                rulesetId={rulesetId}
                readOnly={readOnly}
                rulesetTarget={rulesetTarget}
                fnmatchHelpUrl={fnmatchHelpUrl}
                parameters={conditionsByObject.get('ref')!.parameters as IncludeExcludeParameters}
                panelTitle={`${capitalize(rulesetTarget)} targeting criteria`}
                targetType="ref_name"
                updateParameters={parameters => addOrUpdateCondition(selectedTypeByObject.get('ref')!, parameters)}
                blankslate={{
                  heading: `${capitalize(rulesetTarget)} targeting has not been configured`,
                }}
              />

              {!targetsRepos && (
                <AffectedTargetsSummary
                  rulesetPreviewCount={rulesetPreviewCount}
                  rulesetPreviewSamples={rulesetPreviewSamples}
                  rulesetError={rulesetError}
                  conditions={conditions}
                  sourceName={source.name}
                  targetObjectType="ref"
                />
              )}

              <div className="d-flex flex-column">
                {isEditing && dirtyConditions.findIndex(x => TARGET_OBJECT_BY_TYPE[x.target] === 'ref') >= 0 && (
                  <div className="text-small mt-1 d-flex color-fg-attention">
                    <AlertIcon />
                    <span className="ml-1" aria-live="polite">
                      Targets have changed and {rulesetTarget} match list will update on save.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
