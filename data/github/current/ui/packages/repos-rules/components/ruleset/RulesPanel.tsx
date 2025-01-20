import type {FC} from 'react'
import {useMemo, useState, useRef} from 'react'
import type {
  HelpUrls,
  Parameter,
  Rule,
  RuleSchema,
  RuleWithSchema,
  RulesetTarget,
  ErrorRef,
  SourceType,
  UpsellInfo,
  ValidationError,
} from '../../types/rules-types'
import {RuleModalState} from '../../types/rules-types'
import {Blankslate} from '../Blankslate'
import {BorderBox} from '../BorderBox'
import {RuleRow} from './RuleRow'
import {getRuleSchemasByType} from '../../helpers/rule-schema'
import {DirtyState, getRuleDirtyState} from '../../helpers/dirty-state'
import {AddMetadataPatternRuleDialog} from './AddMetadataPatternRuleDialog'
import {capitalize, humanize} from '../../helpers/string'
import {Box, Pagehead} from '@primer/react'
import {ListView} from '@github-ui/list-view'
import {PanelHeader} from './conditions/PanelHeader'
import {RestrictionsPanel} from './RestrictionsPanel'

type RulesPanelProps = {
  readOnly: boolean
  upsellInfo: UpsellInfo
  helpUrls?: HelpUrls
  rulesetId?: number
  rulesetTarget: RulesetTarget
  sourceType: SourceType
  rules: Rule[]
  ruleSchemas: RuleSchema[]
  ruleErrors: Record<string, ValidationError[]>
  errorRefs: ErrorRef
  addRule: (type: string) => void
  removeRule: (rule: Rule) => void
  restoreRule: (rule: Rule) => void
  setRuleModalState: (rule: Rule, modalState: RuleModalState) => void
  updateRuleParameters: (rule: Rule, parameters: Parameter) => void
}

export const RulesPanel: FC<RulesPanelProps> = ({
  readOnly,
  upsellInfo,
  helpUrls,
  rulesetId,
  rulesetTarget,
  sourceType,
  rules,
  ruleSchemas,
  ruleErrors,
  errorRefs,
  addRule,
  removeRule,
  restoreRule,
  setRuleModalState,
  updateRuleParameters,
}: RulesPanelProps) => {
  const [metadataRestrictionTypes, setMetadataRestrictionTypes] = useState<string[]>([])

  const visibleRules = useMemo(
    () =>
      rules.filter(
        rule => rule._modalState !== RuleModalState.CREATING && getRuleDirtyState(rule) !== DirtyState.REMOVED,
      ),
    [rules],
  )

  const ruleSchemaByType = useMemo(() => getRuleSchemasByType(ruleSchemas), [ruleSchemas])

  const {refRules, commitMetadataRules: metadataRules} = useMemo(() => {
    return visibleRules.reduce<{refRules: RuleWithSchema[]; commitMetadataRules: RuleWithSchema[]}>(
      (map, rule) => {
        const ruleWithSchema = {
          ...rule,
          schema: ruleSchemaByType[rule.ruleType]!,
        }

        if (ruleWithSchema.schema.metadataPatternSchema) {
          map.commitMetadataRules.push(ruleWithSchema)
        } else {
          map.refRules.push(ruleWithSchema)
        }

        return map
      },
      {
        refRules: [],
        commitMetadataRules: [],
      },
    )
  }, [ruleSchemaByType, visibleRules])

  const {branchRuleSchemas, metadataPatternRuleSchemas} = useMemo(() => {
    return ruleSchemas.reduce<{branchRuleSchemas: RuleSchema[]; metadataPatternRuleSchemas: RuleSchema[]}>(
      (map, ruleSchema) => {
        if (ruleSchema.metadataPatternSchema) {
          map.metadataPatternRuleSchemas.push(ruleSchema)
        } else {
          map.branchRuleSchemas.push(ruleSchema)
        }

        return map
      },
      {
        branchRuleSchemas: [],
        metadataPatternRuleSchemas: [],
      },
    )
  }, [ruleSchemas])

  const availableMetadataRuleSchemas = useMemo(() => {
    return metadataPatternRuleSchemas.filter(
      ruleSchema => !metadataRules.find(rule => rule.ruleType === ruleSchema.type),
    )
  }, [metadataPatternRuleSchemas, metadataRules])

  const pendingMetadataRule = useMemo(() => {
    const existing = rules.find(
      rule => rule._modalState && [RuleModalState.CREATING, RuleModalState.EDITING].includes(rule._modalState),
    )

    if (!existing) {
      return undefined
    }

    const ruleSchema = ruleSchemaByType[existing.ruleType]!

    if (!ruleSchema.metadataPatternSchema) {
      return undefined
    }

    return {
      ...existing,
      schema: ruleSchema,
    }
  }, [ruleSchemaByType, rules])

  const addRestrictionButtonRef = useRef<HTMLButtonElement>(null)

  return (
    <>
      <PanelHeader title="Rules" subtitle="Which rules should be applied?" />
      <div className={`d-flex flex-column gap-4`} data-testid="rules-panel">
        {(!readOnly || refRules.length) && branchRuleSchemas.length ? (
          <Box className="Box" sx={{borderTop: 0, borderLeft: 0, borderRight: 0, borderRadius: 0, mb: 0}}>
            <ListView
              title={`${capitalize(humanize(rulesetTarget))} rules`}
              metadata={<ProtectionsHeader rulesetTarget={rulesetTarget} />}
            >
              <ProtectionsList
                readOnly={readOnly}
                helpUrls={helpUrls}
                rulesetId={rulesetId}
                sourceType={sourceType}
                ruleErrors={ruleErrors}
                errorRefs={errorRefs}
                addRule={addRule}
                removeRule={removeRule}
                updateRuleParameters={updateRuleParameters}
                branchRuleSchemas={branchRuleSchemas}
                refRules={refRules}
              />
            </ListView>
          </Box>
        ) : (
          <BorderBox name={`${capitalize(humanize(rulesetTarget))} protections`} showHeader>
            {(!readOnly || refRules.length) && branchRuleSchemas.length ? (
              <ul>
                <ProtectionsList
                  readOnly={readOnly}
                  helpUrls={helpUrls}
                  rulesetId={rulesetId}
                  sourceType={sourceType}
                  ruleErrors={ruleErrors}
                  addRule={addRule}
                  removeRule={removeRule}
                  updateRuleParameters={updateRuleParameters}
                  branchRuleSchemas={branchRuleSchemas}
                  refRules={refRules}
                  errorRefs={errorRefs}
                />
              </ul>
            ) : (
              <Blankslate heading={`No ${humanize(rulesetTarget)} protections have been added`} />
            )}
          </BorderBox>
        )}

        {pendingMetadataRule && (
          <AddMetadataPatternRuleDialog
            rule={pendingMetadataRule}
            ruleSchema={pendingMetadataRule.schema}
            availableMetadataRuleSchemas={availableMetadataRuleSchemas.filter(option =>
              metadataRestrictionTypes.includes(option.type),
            )}
            removeRule={removeRule}
            setRuleModalState={setRuleModalState}
            updateRuleParameters={updateRuleParameters}
            returnFocusRef={addRestrictionButtonRef}
          />
        )}
      </div>
      {metadataPatternRuleSchemas.length > 0 && (
        <RestrictionsPanel
          readOnly={readOnly}
          upsellInfo={upsellInfo}
          helpUrl={helpUrls?.commitMetadataRules}
          title="Metadata"
          rules={metadataRules}
          availableRuleSchemas={availableMetadataRuleSchemas}
          removeRule={removeRule}
          restoreRule={restoreRule}
          setRuleModalState={setRuleModalState}
          addRule={addRule}
          metadataPatternRuleSchemas={metadataPatternRuleSchemas}
          setMetadataRestrictionTypes={setMetadataRestrictionTypes}
          sourceType={sourceType}
          rulesetTarget={rulesetTarget}
          ruleErrors={ruleErrors}
          errorRefs={errorRefs}
          addRestrictionButtonRef={addRestrictionButtonRef}
        />
      )}
    </>
  )
}

function ProtectionsHeader({rulesetTarget}: {rulesetTarget: RulesetTarget}) {
  return (
    <Pagehead sx={{mb: 0, pb: 2, fontSize: 3, fontWeight: 'normal'}}>
      {capitalize(humanize(rulesetTarget))} rules
    </Pagehead>
  )
}

type ProtectionsListProps = {
  readOnly: boolean
  helpUrls?: HelpUrls
  rulesetId?: number
  sourceType: SourceType
  ruleErrors: Record<string, ValidationError[]>
  errorRefs: ErrorRef
  addRule: (type: string) => void
  removeRule: (rule: Rule) => void
  updateRuleParameters: (rule: Rule, parameters: Parameter) => void
  branchRuleSchemas: RuleSchema[]
  refRules: RuleWithSchema[]
}

export const ProtectionsList: FC<ProtectionsListProps> = ({
  readOnly,
  helpUrls,
  rulesetId,
  sourceType,
  ruleErrors,
  errorRefs,
  addRule,
  removeRule,
  updateRuleParameters,
  branchRuleSchemas,
  refRules,
}: ProtectionsListProps) => {
  return (
    <>
      {branchRuleSchemas.map(ruleSchema => {
        const existing = refRules.find(rule => rule.ruleType === ruleSchema.type)

        if (readOnly && !existing) {
          return null
        }

        return (
          <li key={ruleSchema.type} className={`Box-row d-flex flex-justify-between flex-items-center gap-2 pl-0`}>
            <RuleRow
              rulesetId={rulesetId}
              sourceType={sourceType}
              helpUrls={helpUrls}
              readOnly={readOnly}
              rule={existing}
              ruleSchema={ruleSchema}
              errors={ruleErrors[ruleSchema.type] || []}
              errorRef={errorRefs[ruleSchema.type]?.errorRef}
              fieldRefs={errorRefs[ruleSchema.type]?.fields}
              onAdd={() => addRule(ruleSchema.type)}
              onRemove={() => removeRule(refRules.find(rule => rule.ruleType === ruleSchema.type)!)}
              onUpdateParameters={parameters => updateRuleParameters(existing!, parameters)}
            />
          </li>
        )
      })}
    </>
  )
}
