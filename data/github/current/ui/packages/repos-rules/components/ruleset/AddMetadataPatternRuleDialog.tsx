import type {FC} from 'react'
import {useState} from 'react'
import {Box, FormControl, Select, TextInput} from '@primer/react'
import type {DialogButtonProps} from '@primer/react/experimental'
import {Dialog} from '@primer/react/experimental'
import {useRoutePayload} from '@github-ui/react-core/use-route-payload'
import type {Rule, RuleSchema, Parameter, RulesetRoutePayload} from '../../types/rules-types'
import {RuleModalState} from '../../types/rules-types'
import {generateMetadataDescription} from '../../helpers/rule-schema'
import {useValidateRegex} from '@github-ui/repos-async-validation/use-validate-regex'

type AddMetadataPatternRuleDialogProps = {
  rule: Rule
  ruleSchema: RuleSchema
  availableMetadataRuleSchemas: RuleSchema[]
  removeRule: (rule: Rule) => void
  updateRuleParameters: (rule: Rule, parameters: Parameter) => void
  setRuleModalState: (rule: Rule, modalState: RuleModalState) => void
  returnFocusRef?: React.RefObject<HTMLButtonElement>
}

export const AddMetadataPatternRuleDialog: FC<AddMetadataPatternRuleDialogProps> = ({
  rule,
  ruleSchema,
  availableMetadataRuleSchemas,
  removeRule,
  updateRuleParameters,
  setRuleModalState,
  returnFocusRef,
}) => {
  const [parameters, setParameters] = useState(rule.parameters)
  const regexValidator = useValidateRegex()
  const [metadataPatternValidation, setMetadataPatternValidation] = useState({
    isValid: false,
    touched: false,
  })
  const showMetadataPatternError = !metadataPatternValidation.isValid && metadataPatternValidation.touched
  const {source, sourceType} = useRoutePayload<RulesetRoutePayload>()

  const isOpen = rule._modalState === RuleModalState.CREATING || rule._modalState === RuleModalState.EDITING
  const metadataRuleSchemaOptions =
    rule._modalState === RuleModalState.EDITING
      ? availableMetadataRuleSchemas.concat(ruleSchema) // when editing, include the current rule schema in the list
      : availableMetadataRuleSchemas

  const onClose = () => {
    if (rule._modalState === RuleModalState.CREATING) {
      removeRule(rule)
    }

    setRuleModalState(rule, RuleModalState.CLOSED)
    setParameters(rule.parameters)
  }

  const onSave = async () => {
    if (!regexValidator.isValid || !metadataPatternValidation.isValid) {
      const pattern = (parameters.pattern as string) ?? ''
      let invalid = false
      if (pattern.trim() === '') {
        setMetadataPatternValidation({isValid: false, touched: true})
        invalid = true
      }
      if (!(await regexValidator.validate(pattern))) {
        invalid = true
      }
      if (invalid) {
        return
      }
    }

    updateRuleParameters(rule, parameters)
    setRuleModalState(rule, RuleModalState.CLOSED)
  }

  if (!isOpen) {
    return null
  }

  let title = `${rule._modalState === RuleModalState.CREATING ? 'Add' : 'Edit'} a metadata restriction`
  let subtitle: string | null =
    'Restrict commit author email addresses, committer email addresses, commit message content, and other metadata'
  if (rule._modalState === RuleModalState.CREATING && availableMetadataRuleSchemas.length === 0) {
    title = 'All metadata restrictions have been used'
    subtitle = null
  }

  const footerButtons: DialogButtonProps[] =
    rule._modalState === RuleModalState.CREATING && availableMetadataRuleSchemas.length === 0
      ? [{content: 'Ok', onClick: onClose, buttonType: 'normal'}]
      : [
          {content: 'Cancel', onClick: onClose, buttonType: 'normal'},
          {
            content: `${rule._modalState === RuleModalState.CREATING ? 'Add' : 'Update'}`,
            onClick: onSave,
            buttonType: 'primary',
          },
        ]

  return (
    <Box
      sx={{
        display: 'absolute',
      }}
    >
      <Dialog
        title={title}
        subtitle={subtitle}
        footerButtons={footerButtons}
        height="auto"
        width="xlarge"
        onClose={onClose}
        returnFocusRef={returnFocusRef}
      >
        {metadataRuleSchemaOptions.length ? (
          <div className="d-flex flex-column gap-3">
            <FormControl>
              <FormControl.Label>Applies to</FormControl.Label>
              <Select
                block
                value={rule.ruleType}
                aria-label="Property"
                onChange={e => {
                  updateRuleParameters(
                    {
                      ...rule,
                      ruleType: e.target.value,
                    },
                    parameters,
                  )
                }}
              >
                {metadataRuleSchemaOptions.map(schema => (
                  <Select.Option key={schema.type} value={schema.type}>
                    {schema.metadataPatternSchema?.propertyDescription}
                  </Select.Option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormControl.Label>Requirement</FormControl.Label>
              <Select
                block
                value={parameters.operator + (parameters.negate ? ':negate' : '')}
                aria-label="Operator"
                onChange={e => {
                  const [newOperator, strNegate] = e.target.value.split(':')
                  const pattern = (parameters.pattern as string) ?? ''

                  if (newOperator === 'regex') {
                    regexValidator.validate(pattern)
                  } else if (parameters.operator) {
                    regexValidator.reset(true)
                  }
                  if (showMetadataPatternError) {
                    setMetadataPatternValidation({isValid: pattern.trim() !== '', touched: true})
                  }

                  setParameters(prevParameters => ({
                    ...prevParameters,
                    operator: newOperator,
                    negate: strNegate === 'negate',
                  }))
                }}
              >
                {ruleSchema.metadataPatternSchema?.supportedOperators?.map(supportedOperator => (
                  <Select.Option key={supportedOperator.type} value={supportedOperator.type}>
                    Must {supportedOperator.displayName}
                  </Select.Option>
                ))}

                {ruleSchema.metadataPatternSchema?.supportedOperators?.map(supportedOperator => (
                  <Select.Option key={`${supportedOperator.type}:true`} value={`${supportedOperator.type}:negate`}>
                    Must not {supportedOperator.displayName}
                  </Select.Option>
                ))}
              </Select>
            </FormControl>

            <FormControl required>
              {regexValidator.showError ? (
                <FormControl.Validation variant="error" aria-live="polite">
                  Invalid pattern
                </FormControl.Validation>
              ) : null}
              {showMetadataPatternError ? (
                <FormControl.Validation variant="error" aria-live="polite">
                  Pattern cannot be empty
                </FormControl.Validation>
              ) : null}
              <FormControl.Label>Matching pattern</FormControl.Label>
              <TextInput
                block
                value={parameters.pattern as string | undefined}
                onChange={e => {
                  setParameters({
                    ...parameters,
                    pattern: e.target.value,
                  })

                  regexValidator.reset()
                  setMetadataPatternValidation({isValid: false, touched: false})
                }}
                onBlur={() => {
                  const pattern = (parameters.pattern as string) ?? ''
                  if (parameters.operator === 'regex') {
                    regexValidator.validate(pattern)
                  } else if (parameters.operator) {
                    regexValidator.reset(true)
                  }
                  setMetadataPatternValidation({isValid: pattern.trim() !== '', touched: true})
                }}
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Description</FormControl.Label>
              <TextInput
                block
                value={parameters.name as string | undefined}
                onChange={e =>
                  setParameters({
                    ...parameters,
                    name: e.target.value,
                  })
                }
                placeholder={generateMetadataDescription(
                  {
                    ...rule,
                    parameters,
                  },
                  ruleSchema,
                  true,
                )}
              />
              <FormControl.Caption>
                How this rule will appear to your {sourceType}&#39;s users throughout {source.name}.
              </FormControl.Caption>
            </FormControl>
          </div>
        ) : (
          'This ruleset uses all metadata restriction types. You can edit the existing restrictions or remove them to add new ones.'
        )}
      </Dialog>
    </Box>
  )
}
