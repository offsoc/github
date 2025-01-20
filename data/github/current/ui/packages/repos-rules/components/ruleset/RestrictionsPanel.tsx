import {useMemo, useState, type FC, type RefObject} from 'react'
import {Button, FormControl, Checkbox, Pagehead, Box, Heading, Label} from '@primer/react'
import {Blankslate} from '../Blankslate'
import type {
  Rule,
  ErrorRef,
  RuleModalState,
  RuleSchema,
  RuleWithSchema,
  RulesetTarget,
  SourceType,
  UpsellInfo,
  ValidationError,
} from '../../types/rules-types'
import {ListView} from '@github-ui/list-view'
import {RulesList} from './RulesList'
import {RulesetError} from '../rule-schema/errors/RulesetError'

type MetadataPatternRulesPanelProps = {
  readOnly: boolean
  upsellInfo: UpsellInfo
  helpUrl?: string
  title: string
  rules: RuleWithSchema[]
  availableRuleSchemas: RuleSchema[]
  removeRule: (rule: Rule) => void
  restoreRule: (rule: Rule) => void
  setRuleModalState: (rule: Rule, modalState: RuleModalState) => void
  addRule: (type: string) => void
  metadataPatternRuleSchemas: RuleSchema[]
  setMetadataRestrictionTypes: (metadataRestrictionTypes: string[]) => void
  sourceType: SourceType
  rulesetTarget: RulesetTarget
  ruleErrors: Record<string, ValidationError[]>
  errorRefs: ErrorRef
  addRestrictionButtonRef?: React.RefObject<HTMLButtonElement>
}

export const RestrictionsPanel: FC<MetadataPatternRulesPanelProps> = ({
  readOnly,
  upsellInfo,
  helpUrl,
  title,
  rules,
  availableRuleSchemas,
  removeRule,
  restoreRule,
  setRuleModalState,
  addRule,
  metadataPatternRuleSchemas,
  setMetadataRestrictionTypes,
  rulesetTarget,
  sourceType,
  ruleErrors,
  errorRefs,
  addRestrictionButtonRef,
}) => {
  const protectionsHeader = (
    <Pagehead
      sx={{
        mb: 0,
        pb: 2,
        fontSize: 3,
        fontWeight: 'normal',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      Restrictions
      {upsellInfo.enterpriseRulesets.cta.visible && (
        <Label variant="attention" size="large" sx={{ml: 1}}>
          Enterprise
        </Label>
      )}
    </Pagehead>
  )
  const restrictions = [
    {
      metadataRestrictionTypes: ['commit_message_pattern', 'commit_author_email_pattern', 'committer_email_pattern'],
      label: 'Restrict commit metadata',
      caption:
        'Restrict commit author email addresses, committer email addresses, commit message content, and other metadata',
    },
    {
      metadataRestrictionTypes: ['branch_name_pattern', 'tag_name_pattern'],
      label: `Restrict ${rulesetTarget} names`,
      caption: `Restrict ${rulesetTarget} names`,
    },
  ]

  return rules.length > 0 || !readOnly ? (
    <Box className="Box" sx={{borderTop: 0, borderLeft: 0, borderRight: 0, borderRadius: 0}}>
      <ListView title="Restrictions" metadata={protectionsHeader}>
        {restrictions.map(restriction => (
          <RestrictionsBox
            key={restriction.label}
            readOnly={readOnly}
            upsellInfo={upsellInfo}
            helpUrl={helpUrl}
            title={title}
            rules={rules.filter(rule => restriction.metadataRestrictionTypes.includes(rule.ruleType))}
            removeRule={removeRule}
            restoreRule={restoreRule}
            setRuleModalState={setRuleModalState}
            metadataRestrictionTypes={restriction.metadataRestrictionTypes}
            label={restriction.label}
            caption={restriction.caption}
            availableRuleSchemas={availableRuleSchemas}
            addRule={addRule}
            metadataPatternRuleSchemas={metadataPatternRuleSchemas}
            setMetadataRestrictionTypes={setMetadataRestrictionTypes}
            sourceType={sourceType}
            errors={Object.fromEntries(
              Object.entries(ruleErrors).filter(([errorType, _]) =>
                restriction.metadataRestrictionTypes.includes(errorType),
              ),
            )}
            errorRef={
              // Find the errors associated with metadataRestrictionTypes
              // Then find the first error and get it's errorRef
              errorRefs[
                Object.keys(ruleErrors).find(errorType => restriction.metadataRestrictionTypes.includes(errorType)) ??
                  ''
              ]?.errorRef
            }
            addRestrictionButtonRef={addRestrictionButtonRef}
          />
        ))}
      </ListView>
    </Box>
  ) : (
    <Box sx={{mb: 4}}>
      <Heading as="h3" sx={{mb: 1, mt: 3, fontSize: 3, fontWeight: 'normal'}}>
        Restrictions
      </Heading>
      <div className="Box mt-0">
        <Blankslate heading={'No restrictions have been added'} />
      </div>
    </Box>
  )
}

type RestrictionsBoxProps = {
  readOnly: boolean
  upsellInfo: UpsellInfo
  helpUrl?: string
  title: string
  rules: RuleWithSchema[]
  removeRule: (rule: Rule) => void
  restoreRule: (rule: Rule) => void
  setRuleModalState: (rule: Rule, modalState: RuleModalState) => void
  metadataRestrictionTypes: string[]
  label: string
  caption: string
  availableRuleSchemas: RuleSchema[]
  addRule: (type: string) => void
  metadataPatternRuleSchemas: RuleSchema[]
  setMetadataRestrictionTypes: (metadataRestrictionTypes: string[]) => void
  sourceType: SourceType
  errors: Record<string, ValidationError[]>
  errorRef?: RefObject<HTMLDivElement>
  addRestrictionButtonRef?: React.RefObject<HTMLButtonElement>
}

export const RestrictionsBox: FC<RestrictionsBoxProps> = ({
  readOnly,
  upsellInfo,
  helpUrl,
  title,
  rules,
  removeRule,
  restoreRule,
  setRuleModalState,
  metadataRestrictionTypes,
  label,
  caption,
  availableRuleSchemas,
  addRule,
  metadataPatternRuleSchemas,
  setMetadataRestrictionTypes,
  sourceType,
  errors,
  errorRef,
  addRestrictionButtonRef,
}) => {
  const [boxChecked, setBoxChecked] = useState(rules.length > 0)

  const hasErrors = useMemo(() => {
    return Object.values(errors).flat().length > 0
  }, [errors])

  return (
    <li className={`Box-row d-flex flex-justify-between flex-items-center gap-2 pl-0`}>
      <div className={`d-flex flex-1 flex-column`}>
        {!readOnly ? (
          <>
            <FormControl>
              <Checkbox
                checked={boxChecked}
                onChange={() => {
                  if (boxChecked) {
                    for (const rule of rules) {
                      removeRule(rule)
                    }
                  }
                  setBoxChecked(!boxChecked)
                }}
              />
              <FormControl.Label>{label}</FormControl.Label>
              <FormControl.Caption>{caption}</FormControl.Caption>
            </FormControl>
            {boxChecked && hasErrors && (
              <div className="pl-2">
                <div className="px-3">
                  <RulesetError
                    errorRef={errorRef}
                    errorId={`${label}-error`}
                    sourceType={sourceType}
                    fields={[]}
                    errors={Object.values(errors).flat()}
                  />
                </div>
              </div>
            )}
          </>
        ) : (
          <div>
            <span className="text-bold">{label}</span>
            <span className="d-block text-small color-fg-muted">{caption}</span>
          </div>
        )}
        {boxChecked && (
          <div className="pl-2 mt-2">
            <div className="px-3 py-2 d-flex flex-column">
              <div className="d-flex flex-column gap-2">
                <div className={`Box`}>
                  <div className="Box-header d-flex flex-items-center p-2">
                    <div className="Box-title flex-1">Metadata restrictions</div>
                    {!readOnly && (
                      <Button
                        ref={addRestrictionButtonRef}
                        className="ml-2"
                        type="button"
                        aria-label="Add workflow"
                        size="small"
                        onClick={() => {
                          setMetadataRestrictionTypes(metadataRestrictionTypes)
                          addRule(
                            availableRuleSchemas.find(option => metadataRestrictionTypes.includes(option.type))?.type ||
                              metadataPatternRuleSchemas.find(option => metadataRestrictionTypes.includes(option.type))!
                                .type,
                          )
                        }}
                      >
                        Add restriction
                      </Button>
                    )}
                  </div>
                  <RulesList
                    readOnly={readOnly}
                    upsellInfo={upsellInfo}
                    helpUrl={helpUrl}
                    title={title}
                    rules={rules}
                    removeRule={removeRule}
                    restoreRule={restoreRule}
                    setRuleModalState={setRuleModalState}
                    errors={Object.values(errors).flat() || []}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </li>
  )
}
