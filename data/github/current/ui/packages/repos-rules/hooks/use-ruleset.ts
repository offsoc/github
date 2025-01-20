import type {Repository} from '@github-ui/current-repository'
import {useCurrentRepository} from '@github-ui/current-repository'
import {useCallback, useRef, useMemo, useState} from 'react'
import type {
  Condition,
  ConditionParameters,
  Parameter,
  Rule,
  RuleSchema,
  Ruleset,
  RulesetEnforcement,
  RulesetTarget,
  RulesetRoutePayload,
  TargetType,
} from '../types/rules-types'
import {OrgAdminBypassMode, type BypassActor, ActorBypassMode} from '@github-ui/bypass-actors/types'
import {RuleModalState} from '../types/rules-types'
import {
  mapRules,
  addRuleFactory,
  updateRuleParametersFactory,
  updateRuleModalStateFactory,
  toggleRuleFactory,
} from '../state/rules'
import {
  addBypassActorFactory,
  removeBypassActorFactory,
  mapBypassActors,
  updateBypassActorFactory,
} from '../state/bypass-actors'
import {mapConditions, addOrUpdateConditionFactory, removeConditionFactory} from '../state/conditions'
import {useValidateRulesetNameUnique} from './use-validate-ruleset-name-unique'
import {useRelativeNavigation} from '../hooks/use-relative-navigation'
import {debounce} from '@github/mini-throttle'

// Track client-side errors for each ruleset property, when possible
type FormErrors = Partial<Record<keyof Ruleset, string | undefined>>
type DebouncedFunction = (() => void) & {cancel: () => void}

type UseRuleset = {
  repo: Repository
  rulesetId?: number
  rulesetTarget: RulesetTarget
  rulesetName: string
  rulesetNameError?: string
  rulesetMatches: string | string[]
  dirtyRulesetName: string
  orgAdminBypassMode: OrgAdminBypassMode
  bypassActors: BypassActor[]
  setBypassActors: (bypassActors: BypassActor[]) => void
  dirtyOrgAdminBypassMode: OrgAdminBypassMode
  deployKeyBypass: boolean
  dirtyDeployKeyBypass: boolean
  enforcement: RulesetEnforcement
  dirtyEnforcement: RulesetEnforcement
  rules: Rule[]
  ruleSchemas: RuleSchema[]
  dirtyRules: Rule[]
  conditions: Condition[]
  dirtyConditions: Condition[]
  dirtyBypassActors: BypassActor[]

  initializeRuleset: (rulePayload: RulesetRoutePayload) => void
  addRule: (type: string) => void
  updateRuleParameters: (rule: Rule, parameters: Parameter) => void
  setRuleModalState: (rule: Rule, newModalState: RuleModalState) => void
  removeRule: (rule: Rule) => void
  restoreRule: (rule: Rule) => void

  addOrUpdateCondition: (target: TargetType, parameters: ConditionParameters) => void
  removeCondition: (condition: Condition) => void

  renameRuleset: (name: string) => void
  validateForm: () => Promise<FormErrors>
  setRulesetEnforcement: (enforcement: RulesetEnforcement) => void

  addBypassActor: (
    actorId: BypassActor['actorId'],
    actorType: BypassActor['actorType'],
    name: BypassActor['name'],
    bypassMode: BypassActor['bypassMode'],
    owner: BypassActor['owner'],
  ) => void
  removeBypassActor: (bypassActor: BypassActor) => void
  updateBypassActor: (bypassActor: BypassActor) => void
}

export const useRuleset = (initialRuleset: Ruleset, initialRuleSchemas: RuleSchema[]): UseRuleset => {
  const localRuleId = useRef(-1)
  const [ruleset, setRuleset] = useState(initialRuleset)
  const [conditions, setConditions] = useState<Condition[]>(mapConditions(ruleset.conditions))
  const [orgAdminBypassMode, setOrgAdminBypassMode] = useState(ruleset.orgAdminBypassMode)
  const [deployKeyBypass, setDeployKeyBypass] = useState(ruleset.deployKeyBypass)
  const [bypassActors, setBypassActors] = useState(mapBypassActors(ruleset.bypassActors, localRuleId))
  const [rulesetName, setRulesetName] = useState(ruleset.name ?? '')
  const [rulesetNameError, setRulesetNameError] = useState<string | undefined>(undefined)
  const [rulesetEnforcement, setRulesetEnforcement] = useState(ruleset.enforcement)
  const [ruleSchemas, setRuleSchemas] = useState<RuleSchema[]>(initialRuleSchemas)
  const [rules, setRules] = useState<Rule[]>(mapRules(ruleset.rules, localRuleId))
  const debounceValidateRulesetNameRef = useRef<DebouncedFunction | undefined>(undefined)
  const abortValidateRulesetNameRef = useRef<AbortController | undefined>(undefined)
  const {resolvePath} = useRelativeNavigation()

  const nameValidationPath = resolvePath('../validate_value')
  const rulesetNameUniqueValidator = useValidateRulesetNameUnique(nameValidationPath)

  const repo = useCurrentRepository()

  const dirtyRules = useMemo(
    () => rules.filter(rule => rule._dirty && rule._modalState !== RuleModalState.CREATING),
    [rules],
  )
  const dirtyConditions = useMemo(() => conditions.filter(condition => condition._dirty), [conditions])
  const dirtyBypassActors = useMemo(() => bypassActors.filter(bypassActor => bypassActor._dirty), [bypassActors])

  // Cancel previous requests because we are only interested in the latest value
  const validateRulesetNameReset = () => {
    debounceValidateRulesetNameRef.current?.cancel()
    abortValidateRulesetNameRef.current?.abort()
  }

  const validateRulesetName = useCallback(
    async (value: string, skipDebounce: boolean = false): Promise<string | undefined> => {
      const name = value.trim()
      validateRulesetNameReset()

      if (!name) {
        const message = 'Name cannot be empty'
        setRulesetNameError(message)
        return message
      }

      abortValidateRulesetNameRef.current = new AbortController()

      if (skipDebounce) {
        const valid = await rulesetNameUniqueValidator.validate(name, ruleset.id, {
          signal: abortValidateRulesetNameRef.current.signal,
        })
        const message = valid ? undefined : 'Name must be unique'
        setRulesetNameError(message)
        return message
      }

      debounceValidateRulesetNameRef.current = debounce(async () => {
        const valid = await rulesetNameUniqueValidator.validate(name, ruleset.id, {
          signal: abortValidateRulesetNameRef.current?.signal,
        })
        setRulesetNameError(valid ? undefined : 'Name must be unique')
      }, 500)
      debounceValidateRulesetNameRef?.current()
    },
    [ruleset.id, rulesetNameUniqueValidator],
  )

  const validateForm = useCallback(async () => {
    // Cancel any existing async validation
    validateRulesetNameReset()
    // call validator immediately rather than debouncing
    const nameError = await validateRulesetName(rulesetName, true)

    const errors: FormErrors = {
      name: nameError,
    }

    return errors
  }, [validateRulesetName, rulesetName])

  return {
    repo,
    rulesetId: ruleset.id ?? undefined,
    rulesetTarget: ruleset.target,
    rulesetName: ruleset.name,
    rulesetMatches: ruleset.matches,
    dirtyRulesetName: rulesetName,
    orgAdminBypassMode: ruleset.orgAdminBypassMode,
    dirtyOrgAdminBypassMode: orgAdminBypassMode,
    deployKeyBypass: ruleset.deployKeyBypass,
    dirtyDeployKeyBypass: deployKeyBypass,
    enforcement: ruleset.enforcement,
    dirtyEnforcement: rulesetEnforcement,
    bypassActors,
    setBypassActors,
    rules,
    ruleSchemas,
    dirtyRules,
    conditions,
    dirtyConditions,
    dirtyBypassActors,
    rulesetNameError,

    initializeRuleset: useCallback(payload => {
      localRuleId.current = -1
      setRules(mapRules(payload.ruleset.rules, localRuleId))
      setConditions(mapConditions(payload.ruleset.conditions))
      setBypassActors(mapBypassActors(payload.ruleset.bypassActors, localRuleId))
      setOrgAdminBypassMode(payload.ruleset.orgAdminBypassMode)
      setDeployKeyBypass(payload.ruleset.deployKeyBypass)
      setRulesetName(payload.ruleset.name)
      setRulesetNameError(undefined)
      setRulesetEnforcement(payload.ruleset.enforcement)
      setRuleset(payload.ruleset)
      setRuleSchemas(payload.ruleSchemas)
    }, []),
    addRule: useCallback(
      (type: string) => {
        setRules(prev => {
          const ruleSchema = ruleSchemas.find(schema => schema.type === type)
          if (!ruleSchema) {
            throw new Error('Rule schema not found')
          }

          if (!ruleSchema.metadataPatternSchema) {
            const existingRule = prev.find(rule => rule.ruleType === type)
            if (existingRule) {
              return toggleRuleFactory(existingRule, true)(prev)
            }
          }

          return addRuleFactory(ruleSchema, type, localRuleId.current--)(prev)
        })
      },
      [ruleSchemas],
    ),
    updateRuleParameters: useCallback((rule, parameters) => {
      setRules(updateRuleParametersFactory(rule, parameters))
    }, []),
    setRuleModalState: useCallback((rule, newModalState) => {
      setRules(updateRuleModalStateFactory(rule, newModalState))
    }, []),
    removeRule: useCallback(rule => {
      setRules(toggleRuleFactory(rule, false))
    }, []),
    restoreRule: useCallback(rule => {
      setRules(toggleRuleFactory(rule, true))
    }, []),
    addOrUpdateCondition: useCallback((target, parameters) => {
      setConditions(addOrUpdateConditionFactory(target, parameters))
    }, []),
    removeCondition: useCallback(condition => {
      setConditions(removeConditionFactory(condition))
    }, []),
    renameRuleset: useCallback(
      name => {
        setRulesetName(name)
        setRulesetNameError(undefined)
        validateRulesetName(name)
      },
      [validateRulesetName],
    ),
    validateForm,
    setRulesetEnforcement,
    addBypassActor: useCallback((actorId, actorType, name, bypassMode, owner) => {
      if (actorType === 'OrganizationAdmin') {
        setOrgAdminBypassMode(
          bypassMode === ActorBypassMode.ALWAYS ? OrgAdminBypassMode.OrgBypassAny : OrgAdminBypassMode.OrgBypassPRsOnly,
        )
      } else if (actorType === 'DeployKey') {
        setDeployKeyBypass(true)
      } else {
        setBypassActors(addBypassActorFactory(actorId, actorType, name, bypassMode, owner, localRuleId.current--))
      }
    }, []),
    removeBypassActor: useCallback(bypassActor => {
      if (bypassActor.actorType === 'OrganizationAdmin') {
        setOrgAdminBypassMode(OrgAdminBypassMode.NoOrgBypass)
      } else if (bypassActor.actorType === 'DeployKey') {
        setDeployKeyBypass(false)
      } else {
        setBypassActors(removeBypassActorFactory(bypassActor))
      }
    }, []),
    updateBypassActor: useCallback(bypassActor => {
      if (bypassActor.actorType === 'OrganizationAdmin') {
        setOrgAdminBypassMode(
          bypassActor.bypassMode === ActorBypassMode.ALWAYS
            ? OrgAdminBypassMode.OrgBypassAny
            : OrgAdminBypassMode.OrgBypassPRsOnly,
        )
      } else if (bypassActor.actorType === 'DeployKey') {
        setDeployKeyBypass(false)
      } else {
        setBypassActors(updateBypassActorFactory(bypassActor))
      }
    }, []),
  }
}
