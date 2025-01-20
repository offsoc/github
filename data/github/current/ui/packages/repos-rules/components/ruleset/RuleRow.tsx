import type {FC, RefObject} from 'react'
import {useMemo, useState} from 'react'
import {ActionList, ActionMenu, FormControl, Checkbox, TextInput, Label, Box, Button, Text} from '@primer/react'
import {ChevronDownIcon, ChevronUpIcon} from '@primer/octicons-react'
import type {
  Rule,
  RuleSchema,
  ValidationError,
  HelpUrls,
  Parameter,
  RuleConfigMetadata,
  SourceType,
  RegisteredRuleErrorComponent,
  FieldRef,
} from '../../types/rules-types'
import {componentRegistry, errorRegistry, visibilityRegistry} from '../rule-schema'
import {rangeBounds, rangeToArray} from '../../helpers/range'
import {RulesetError} from '../rule-schema/errors/RulesetError'

type RuleRowProps = {
  readOnly: boolean
  rulesetId?: number
  sourceType: SourceType
  rule?: Rule
  ruleSchema: RuleSchema
  errors: ValidationError[]
  errorRef?: RefObject<HTMLDivElement>
  fieldRefs?: FieldRef
  helpUrls?: HelpUrls
  onAdd: () => void
  onRemove: () => void
  onUpdateParameters: (parameters: Parameter) => void
}

function dropdownForNumberField(field: RuleSchema['parameterSchema']['fields'][0]): boolean {
  if (field.type !== 'integer') {
    return false
  }

  const bounds = rangeBounds(field.allowed_range)
  if (typeof bounds === 'undefined') {
    return false
  }

  // Temporarily support no `ui_prefer_dropdown` setting for deploy safety.
  if (typeof field.ui_prefer_dropdown === 'undefined') {
    return true
  }

  return field.ui_prefer_dropdown
}

export const RuleRow: FC<RuleRowProps> = ({
  readOnly,
  rulesetId,
  sourceType,
  rule,
  ruleSchema,
  errors,
  errorRef,
  fieldRefs,
  helpUrls,
  onAdd,
  onUpdateParameters,
  onRemove,
}) => {
  const [additionalOptionsExpanded, setAdditionalOptionsExpanded] = useState(false)

  const ErrorComponent: React.FC<RegisteredRuleErrorComponent> | undefined =
    rule?.ruleType && errors.length > 0
      ? errorRegistry[rule.ruleType] || ((props: RegisteredRuleErrorComponent) => <RulesetError {...props} />)
      : undefined

  const fields = !readOnly
    ? ruleSchema.parameterSchema.fields
    : ruleSchema.parameterSchema.fields.filter(
        field =>
          // defer to visibility registery if defined
          (field.ui_control && visibilityRegistry[field.ui_control]?.(rule?.parameters[field.name], readOnly)) ??
          (field.type !== 'boolean' || (rule?.parameters[field.name] as boolean) === true),
      )
  const hideContainer = ruleSchema.parameterSchema.ui_options?.hide_settings_container || false

  const renderErrorComponent = useMemo(() => {
    // No errors, no component to render
    if (errors.length === 0) {
      return false
    }
    // Rule is disabled don't show the error
    if (rule === undefined) {
      return false
    }

    return true
  }, [errors.length, rule])

  return (
    <div className={`d-flex flex-1 flex-column`}>
      {!readOnly ? (
        <FormControl>
          <Checkbox
            checked={typeof rule !== 'undefined'}
            aria-errormessage={`${rule?.ruleType}-error`}
            aria-invalid={renderErrorComponent && !!ErrorComponent}
            onChange={e => {
              if (e.target.checked) {
                setAdditionalOptionsExpanded(true)
                onAdd()
              } else {
                onRemove()
              }
            }}
          />
          {ruleSchema.beta ? (
            <FormControl.Label sx={{display: 'flex', justifyContent: 'center'}}>
              {ruleSchema.displayName}
              <Label variant="success" sx={{marginLeft: 2}}>
                Beta
              </Label>
            </FormControl.Label>
          ) : (
            <FormControl.Label>{ruleSchema.displayName}</FormControl.Label>
          )}
          <FormControl.Caption>{ruleSchema.description}</FormControl.Caption>
        </FormControl>
      ) : (
        <div>
          {ruleSchema.beta ? (
            <span className="d-flex flex-items-center text-bold">
              {ruleSchema.displayName}
              <Label variant="success" sx={{marginLeft: 2}}>
                Beta
              </Label>
            </span>
          ) : (
            <span className="text-bold">{ruleSchema.displayName}</span>
          )}
          <span className="d-block text-small color-fg-muted">{ruleSchema.description}</span>
        </div>
      )}

      {renderErrorComponent && ErrorComponent ? (
        <div className="flex-1">
          <Box sx={{pl: 2}}>
            <Box sx={{px: 3}}>
              <ErrorComponent
                errorId={`${rule?.ruleType}-error`}
                rulesetId={rulesetId}
                errors={errors}
                sourceType={sourceType}
                errorRef={errorRef}
                fields={fields}
              />
            </Box>
          </Box>
        </div>
      ) : null}

      {rule && fields.length > 0 && (
        <>
          {hideContainer ? (
            <div className="flex-1 mt-2">
              <Box sx={{pl: `${readOnly ? '-2px' : '2'}`}}>
                <AdditionalSettings
                  readOnly={readOnly}
                  rulesetId={rulesetId}
                  sourceType={sourceType}
                  helpUrls={helpUrls}
                  fields={fields}
                  fieldRefs={fieldRefs}
                  errors={errors || []}
                  parameters={rule.parameters}
                  metadata={rule.metadata}
                  onParametersChange={onUpdateParameters}
                />
              </Box>
            </div>
          ) : (
            <div className="flex-1 mt-2">
              <Box sx={{pl: `${readOnly ? '0' : '12px'}`}}>
                <Button
                  variant="invisible"
                  sx={{color: 'fg.subtle'}}
                  onClick={() => setAdditionalOptionsExpanded(prev => !prev)}
                >
                  <Text sx={{mr: 1}}>
                    {additionalOptionsExpanded ? 'Hide additional settings' : 'Show additional settings'}
                  </Text>
                  {additionalOptionsExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
                </Button>
              </Box>
              {additionalOptionsExpanded && (
                <Box sx={{pl: `${readOnly ? '-2px' : '10px'}`}}>
                  <AdditionalSettings
                    readOnly={readOnly}
                    rulesetId={rulesetId}
                    sourceType={sourceType}
                    helpUrls={helpUrls}
                    fields={fields}
                    errors={errors || []}
                    fieldRefs={fieldRefs}
                    parameters={rule.parameters}
                    metadata={rule.metadata}
                    onParametersChange={onUpdateParameters}
                  />
                </Box>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function AdditionalSettingsDropdownMenu<Value extends string | number>({
  ariaLabel,
  selectedValue,
  options,
  onSelect,
}: {
  ariaLabel: string
  selectedValue: Value
  options: Array<{label: string; value: Value}>
  onSelect: (value: Value) => void
}) {
  return (
    <ActionMenu>
      <ActionMenu.Button aria-label={ariaLabel}>
        {options.find(option => option.value === selectedValue)?.label || ''}
      </ActionMenu.Button>
      <ActionMenu.Overlay width="small">
        <ActionList selectionVariant="single">
          {options.map(option => {
            return (
              <ActionList.Item
                key={option.value}
                selected={option.value === selectedValue}
                onSelect={() => {
                  onSelect(option.value)
                }}
              >
                {option.label}
              </ActionList.Item>
            )
          })}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}

const AdditionalSettings = ({
  readOnly,
  rulesetId,
  sourceType,
  fields,
  errors,
  fieldRefs,
  parameters,
  metadata,
  helpUrls,
  onParametersChange,
}: Pick<RuleRowProps, 'readOnly' | 'rulesetId' | 'sourceType' | 'helpUrls'> & {
  fields: RuleSchema['parameterSchema']['fields']
  fieldRefs?: FieldRef
  errors: ValidationError[]
  parameters: Parameter
  metadata?: RuleConfigMetadata
  onParametersChange: (paramters: Parameter) => void
}) => (
  <ul>
    {fields.map(field => {
      let control: React.ReactNode = null

      const fieldErrors = errors.filter(error => error.field === field.name)
      if (field.ui_control) {
        const RegisteredComponent = componentRegistry[field.ui_control]
        if (!RegisteredComponent) {
          throw new Error(`Unsupported control: ${field.ui_control}`)
        }

        control = (
          <RegisteredComponent
            readOnly={readOnly}
            rulesetId={rulesetId}
            sourceType={sourceType}
            helpUrls={helpUrls}
            field={field}
            fieldRef={fieldRefs?.[field.name]}
            value={parameters[field.name]}
            metadata={metadata}
            errors={fieldErrors}
            onValueChange={newValue =>
              onParametersChange({
                ...parameters,
                [field.name]: newValue,
              })
            }
          />
        )
      } else {
        switch (field.type) {
          case 'array':
          case 'object':
            throw new Error(`Field type requires custom control: ${JSON.stringify(field)}`)
          case 'boolean': {
            const fieldLabel = `${field.name}Label`
            control = !readOnly ? (
              <FormControl>
                <Checkbox
                  checked={(parameters[field.name] as boolean) || false}
                  onChange={e => {
                    onParametersChange({
                      ...parameters,
                      [field.name]: e.target.checked,
                    })
                  }}
                />
                <FormControl.Label id={fieldLabel}>{field.display_name}</FormControl.Label>
                <FormControl.Caption>{field.description}</FormControl.Caption>
              </FormControl>
            ) : (
              <div>
                <span className="text-bold">{field.display_name}</span>
                <span className="d-block text-small color-fg-muted">{field.description}</span>
              </div>
            )
            break
          }
          default:
            control = !readOnly ? (
              <FormControl>
                <FormControl.Label>{field.display_name}</FormControl.Label>
                <FormControl.Caption>{field.description}</FormControl.Caption>
                {field.type === 'integer' ? (
                  field.allowed_range && dropdownForNumberField(field) ? (
                    <AdditionalSettingsDropdownMenu
                      ariaLabel="Select number"
                      selectedValue={(parameters[field.name] || 0) as number}
                      options={rangeToArray(field.allowed_range).map(value => ({
                        label: value.toString(),
                        value,
                      }))}
                      onSelect={selectedValue => {
                        onParametersChange({
                          ...parameters,
                          [field.name]: selectedValue,
                        })
                      }}
                    />
                  ) : (
                    <TextInput
                      className="width-full"
                      type={'number'}
                      ref={fieldRefs?.[field.name] as RefObject<HTMLInputElement>}
                      min={rangeBounds(field.allowed_range)?.min}
                      max={rangeBounds(field.allowed_range)?.max}
                      aria-invalid={fieldErrors.length > 0}
                      value={(parameters[field.name] || 0) as number}
                      onChange={e => {
                        onParametersChange({
                          ...parameters,
                          [field.name]: parseInt(e.target.value),
                        })
                      }}
                    />
                  )
                ) : field.allowed_options ? (
                  <AdditionalSettingsDropdownMenu
                    ariaLabel={`Select ${field.display_name}`}
                    selectedValue={
                      (parameters[field.name] || field.default_value || field.allowed_options[0]?.value) as string
                    }
                    options={field.allowed_options.map(option => ({label: option.display_name, value: option.value}))}
                    onSelect={selectedValue => {
                      onParametersChange({
                        ...parameters,
                        [field.name]: selectedValue,
                      })
                    }}
                  />
                ) : field.allowed_values ? (
                  <AdditionalSettingsDropdownMenu
                    ariaLabel={`Select ${field.display_name}`}
                    selectedValue={(parameters[field.name] || field.default_value || field.allowed_values[0]) as string}
                    options={field.allowed_values.map(value => ({label: value, value}))}
                    onSelect={selectedValue => {
                      onParametersChange({
                        ...parameters,
                        [field.name]: selectedValue,
                      })
                    }}
                  />
                ) : (
                  <TextInput
                    className="width-full"
                    type={'text'}
                    aria-invalid={fieldErrors.length > 0}
                    ref={fieldRefs?.[field.name] as RefObject<HTMLInputElement>}
                    value={(parameters[field.name] || '') as string}
                    onChange={e => {
                      onParametersChange({
                        ...parameters,
                        [field.name]: e.target.value,
                      })
                    }}
                  />
                )}
                {fieldErrors.length > 0 && (
                  <FormControl.Validation variant="error">{fieldErrors[0]?.message}</FormControl.Validation>
                )}
              </FormControl>
            ) : (
              <div>
                <span className="text-bold">{field.display_name}: </span>
                <span>{parameters[field.name] as string | number}</span>
                <span className="d-block text-small color-fg-muted">{field.description}</span>
              </div>
            )
            break
        }
      }

      return (
        <li key={field.name} className="px-3 py-2 d-flex flex-column">
          {control}
        </li>
      )
    })}
  </ul>
)
