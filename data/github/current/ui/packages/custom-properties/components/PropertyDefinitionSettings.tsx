import {CustomPropertyMultiSelectPanel} from '@github-ui/custom-properties-editing'
import type {PropertyDefinition, ValueType} from '@github-ui/custom-properties-types'
import type {OnDropArgs} from '@github-ui/drag-and-drop'
import {DragAndDrop, useDragAndDrop} from '@github-ui/drag-and-drop'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import sudo from '@github-ui/sudo'
import {useNavigate} from '@github-ui/use-navigate'
import {verifiedFetchJSON} from '@github-ui/verified-fetch'
import {KebabHorizontalIcon} from '@primer/octicons-react'
import {
  ActionList,
  ActionMenu,
  Box,
  Button,
  Checkbox,
  FormControl,
  IconButton,
  Label,
  Select,
  Textarea,
  TextInput,
} from '@primer/react'
import {useRef, useState} from 'react'
import {Link} from 'react-router-dom'

import {CustomPropertyBooleanSelect} from '../../custom-properties-editing/components/CustomPropertyBooleanSelect'
import {useSetFlash} from '../contexts/FlashContext'
import {definitionTypeLabels} from '../helpers/definition-type-labels'
import {useListPropertiesPath, useSavePropertyPath} from '../hooks/use-properties-paths'
import {type FormErrors, usePropertyDefinitionForm} from '../hooks/use-property-definition-form'
import {OrgConflictsDialog} from './OrgConflictsDialog'
import {RegexPatternInput} from './RegexPatternInput'
import {TestRegexValueDialog} from './TestRegexValueDialog'

interface Props {
  definition?: PropertyDefinition
  existingPropertyNames: string[]
  setFormError: (error: string) => void
}
export function PropertyDefinitionSettings({definition, existingPropertyNames, setFormError}: Props) {
  const navigate = useNavigate()
  const setFlash = useSetFlash()
  const [saving, setSaving] = useState(false)
  const [showRegexTestValueDialog, setShowRegexTestValueDialog] = useState(false)
  const isEditing = !!definition

  const {
    valueTypeField,
    propertyNameField,
    defaultValueField,
    allowedValuesField,
    newAllowedValueField,
    repoActorsEditingAllowedField,
    descriptionField,
    requiredField,
    regexField,
    regexEnabledField,
    validateForm,
  } = usePropertyDefinitionForm({definition, existingPropertyNames})
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const [showOrgConflicts, setShowOrgConflicts] = useState(false)

  const propertyNameRef = useRef<HTMLInputElement>(null)
  const regexInputRef = useRef<HTMLInputElement>(null)

  const propertyDescriptionRef = useRef<HTMLTextAreaElement>(null)
  const propertyStringDefaultValueRef = useRef<HTMLInputElement>(null)
  const propertySingleSelectDefaultValueRef = useRef<HTMLSelectElement>(null)
  const propertyBooleanDefaultValueRef = useRef<HTMLButtonElement>(null)
  const propertyMultiSelectDefaultValueRef = useRef<HTMLElement>(null)
  const newAllowedValueRef = useRef<HTMLInputElement>(null)
  const testRegexValuesRef = useRef<HTMLButtonElement>(null)

  const isText = valueTypeField.value === 'string'
  const isSingleSelect = valueTypeField.value === 'single_select'
  const isTrueFalse = valueTypeField.value === 'true_false'
  const isMultiSelect = valueTypeField.value === 'multi_select'

  const regexEnabled = isText && regexEnabledField.value

  const regexSupported = useFeatureFlag('custom_properties_regex') && isText

  const selectedDefinitionTypeLabel = definitionTypeLabels[valueTypeField.value] || definitionTypeLabels.string

  const savePropertyPath = useSavePropertyPath()
  const listPropertiesPath = useListPropertiesPath()

  function addAllowedValue() {
    if (newAllowedValueField.validate()) {
      return newAllowedValueRef.current?.focus()
    }

    allowedValuesField.update([...allowedValuesField.value, newAllowedValueField.value])
    newAllowedValueField.reset()
  }

  function removeAllowedValue(index: number) {
    allowedValuesField.update(allowedValuesField.value.filter((_, currentIndex) => currentIndex !== index))
  }

  function focusFirstInvalidField(errors: FormErrors) {
    const refs = [
      {
        element: propertyNameRef.current,
        invalid: !!errors.propertyName,
      },
      {
        element: propertyDescriptionRef.current,
        invalid: !!errors.description,
      },
      {
        element: regexInputRef.current,
        invalid: !!errors.regex,
      },
      {
        element: newAllowedValueRef.current,
        invalid: !!errors.allowedValues,
      },
      {
        element: propertyStringDefaultValueRef.current,
        invalid: !!errors.defaultValue,
      },
      {
        element: propertySingleSelectDefaultValueRef.current,
        invalid: !!errors.defaultValue,
      },
      {
        element: propertyBooleanDefaultValueRef.current,
        invalid: !!errors.defaultValue,
      },
      {
        element: propertyMultiSelectDefaultValueRef.current,
        invalid: !!errors.defaultValue,
      },
    ]

    const firstInvalidItem = refs.find(item => item.element && item.invalid)
    firstInvalidItem?.element?.focus()
  }

  async function formCanBeSaved() {
    const validationErrors = await validateForm()

    if (validationErrors.allowedValues) {
      setFormError(validationErrors.allowedValues)
    }

    if (Object.values(validationErrors).some(x => x)) {
      focusFirstInvalidField(validationErrors)
      return false
    }

    return true
  }

  async function saveDefinition(body: PropertyDefinition) {
    setFormError('')
    if (!(await formCanBeSaved())) {
      return
    }
    setSaving(true)

    if (!(await sudo())) {
      setFormError('Unauthorized')
      setSaving(false)
      return
    }

    const result = await verifiedFetchJSON(savePropertyPath, {
      method: 'POST',
      body,
    })

    if (result.ok) {
      setFlash(isEditing ? 'definition.updated.success' : 'definition.created.success')
      returnToList()
    } else {
      const responseBody = await result.json()
      setFormError(responseBody?.error || 'Something went wrong.')
      setSaving(false)
    }
  }

  function returnToList() {
    navigate(listPropertiesPath)
  }

  const onDrop = ({dragMetadata, dropMetadata, isBefore}: OnDropArgs<string>) => {
    if (dragMetadata.id === dropMetadata?.id) {
      return
    }

    const items = allowedValuesField.value
    const reorderedOption = items.find(item => item === dragMetadata.id)!

    const newlyOrderedItems = items.reduce<string[]>((newItems, item) => {
      if (item === reorderedOption) {
        return newItems
      }

      if (item !== dropMetadata?.id) {
        newItems.push(item)
      } else if (isBefore) {
        newItems.push(reorderedOption, item)
      } else if (!isBefore) {
        newItems.push(item, reorderedOption)
      }

      return newItems
    }, [])

    allowedValuesField.update(newlyOrderedItems)
  }

  const allowableDefaultValues = isTrueFalse ? ['true', 'false'] : allowedValuesField.value

  const propertyNameValidationId = 'property-name-validation-error'
  const defaultValues = isMultiSelect ? (defaultValueField.value as string[]) : [defaultValueField.value]

  const propertyNameValidationResult = propertyNameField.validationError

  return (
    <>
      <Box data-hpc sx={{mb: 4}} data-testid="settings-page-content">
        <FormControl disabled={isEditing} sx={{mb: 3, maxWidth: '480px'}}>
          <FormControl.Label>Name *</FormControl.Label>
          <TextInput
            block
            ref={propertyNameRef}
            aria-describedby={propertyNameField.validationError ? propertyNameValidationId : undefined}
            aria-invalid={!propertyNameField.isValid()}
            value={propertyNameField.value}
            onChange={e => propertyNameField.update(e.target.value)}
          />

          {propertyNameValidationResult && (
            <>
              <FormControl.Validation variant="error" id={propertyNameValidationId}>
                {propertyNameValidationResult.message}
              </FormControl.Validation>
              {!!propertyNameValidationResult?.orgConflicts?.usages.length && (
                <>
                  <FormControl.Caption>
                    See{' '}
                    <Link to="#" onClick={() => setShowOrgConflicts(true)}>
                      organizations
                    </Link>{' '}
                    with this property
                  </FormControl.Caption>
                  {showOrgConflicts && (
                    <OrgConflictsDialog
                      onClose={() => setShowOrgConflicts(false)}
                      orgConflicts={propertyNameValidationResult.orgConflicts}
                    />
                  )}
                </>
              )}
            </>
          )}
        </FormControl>

        <FormControl sx={{mb: 3, maxWidth: '480px'}}>
          <FormControl.Label>Description</FormControl.Label>
          <Textarea
            block
            rows={4}
            resize="vertical"
            placeholder="A short description about this property"
            ref={propertyDescriptionRef}
            value={descriptionField.value}
            onChange={e => descriptionField.update(e.target.value)}
            onBlur={descriptionField.validate}
          />

          {descriptionField.validationError && (
            <FormControl.Validation variant="error">{descriptionField.validationError}</FormControl.Validation>
          )}
        </FormControl>

        <Box sx={{display: 'flex'}}>
          <FormControl sx={{mb: isSingleSelect || isMultiSelect ? 3 : 0, maxWidth: '285px'}} disabled={isEditing}>
            <FormControl.Label>Type</FormControl.Label>
            <ActionMenu
              open={typeDropdownOpen}
              onOpenChange={open => {
                if (isEditing) return
                setTypeDropdownOpen(open)
              }}
            >
              <ActionMenu.Button inactive={isEditing} aria-label={`Type: ${selectedDefinitionTypeLabel}`}>
                {selectedDefinitionTypeLabel}
              </ActionMenu.Button>
              <ActionMenu.Overlay>
                <ActionList selectionVariant="single">
                  {Object.entries(definitionTypeLabels).map(([key, label]) => (
                    <ActionList.Item
                      key={key}
                      onSelect={() => valueTypeField.update(key as ValueType)}
                      selected={valueTypeField.value === key}
                    >
                      {label}
                    </ActionList.Item>
                  ))}
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </FormControl>
        </Box>

        {(isSingleSelect || isMultiSelect) && (
          <Box sx={{border: 'solid 1px var(--borderColor-default, var(--color-border-default))', borderRadius: '5px'}}>
            <FormControl sx={{p: 3}}>
              <FormControl.Label htmlFor="option-input" visuallyHidden>
                Options
              </FormControl.Label>
              <Box sx={{display: 'flex', gap: 2, width: '100%'}}>
                <TextInput
                  block
                  id="option-input"
                  placeholder="Add option..."
                  ref={newAllowedValueRef}
                  aria-invalid={!newAllowedValueField.isValid()}
                  value={newAllowedValueField.value}
                  onChange={e => newAllowedValueField.update(e.target.value)}
                  // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
                  onKeyDown={e => e.key === 'Enter' && addAllowedValue()}
                />

                <Button onClick={addAllowedValue}>Add</Button>
              </Box>
              {newAllowedValueField.validationError && (
                <FormControl.Validation variant="error">{newAllowedValueField.validationError}</FormControl.Validation>
              )}
            </FormControl>

            {allowedValuesField.value.length > 0 ? (
              <DragAndDrop
                items={allowedValuesField.value.map(value => {
                  return {id: value, title: value}
                })}
                onDrop={onDrop}
                style={{listStyleType: 'none', maxHeight: '500px', overflowY: 'auto'}}
                renderOverlay={({id: value}, index) => (
                  <DragAndDrop.Item
                    aria-label={value}
                    index={index}
                    id={value}
                    title={value}
                    key={value}
                    hideSortableItemTrigger
                    style={{borderTop: 'solid 1px var(--borderColor-default, var(--color-border-default))'}}
                    isDragOverlay
                  >
                    <AllowedValueItem
                      value={value}
                      isDefaultValue={defaultValues.includes(value)}
                      onDelete={() => removeAllowedValue(index)}
                      index={index}
                    />
                  </DragAndDrop.Item>
                )}
              >
                {allowedValuesField.value.map((value, index) => (
                  <DragAndDrop.Item
                    aria-label={value}
                    index={index}
                    id={value}
                    title={value}
                    key={value}
                    hideSortableItemTrigger
                    style={{borderTop: 'solid 1px var(--borderColor-default, var(--color-border-default))'}}
                  >
                    <AllowedValueItem
                      value={value}
                      isDefaultValue={defaultValues.includes(value)}
                      onDelete={() => removeAllowedValue(index)}
                      index={index}
                    />
                  </DragAndDrop.Item>
                ))}
              </DragAndDrop>
            ) : (
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  color: 'fg.muted',
                  textAlign: 'center',
                  borderTop: 'solid 1px var(--borderColor-default, var(--color-border-default))',
                }}
              >
                No options
              </Box>
            )}
          </Box>
        )}

        <Box
          sx={{
            pt: 3,
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            borderTop: '1px solid',
            borderColor: 'border.muted',
            '> *': {borderBottom: '1px solid', borderColor: 'border.muted', pb: 3},
          }}
        >
          {regexSupported && (
            <div>
              <FormControl>
                <FormControl.Label>Match regular expression</FormControl.Label>
                <Checkbox
                  checked={regexEnabledField.value}
                  onChange={() => regexEnabledField.update(!regexEnabledField.value)}
                  aria-label="Use regular expression"
                />
              </FormControl>
              {regexEnabled && (
                <>
                  <Box sx={{mt: 3, maxWidth: '180px'}}>
                    <RegexPatternInput
                      ref={regexInputRef}
                      onChange={value => regexField.update(value)}
                      value={regexField.value}
                      validationError={regexField.validationError}
                    />
                  </Box>

                  <Button ref={testRegexValuesRef} onClick={() => setShowRegexTestValueDialog(true)} sx={{mt: 3}}>
                    Test values…
                  </Button>
                  {showRegexTestValueDialog && (
                    <TestRegexValueDialog
                      onDismiss={() => setShowRegexTestValueDialog(false)}
                      onRegexPatternChange={value => regexField.update(value)}
                      regexPattern={regexField.value}
                      regexPatternValidationError={regexField.validationError}
                      returnFocusRef={testRegexValuesRef}
                    />
                  )}
                </>
              )}
            </div>
          )}

          <FormControl>
            <Checkbox
              checked={repoActorsEditingAllowedField.value}
              onChange={() => repoActorsEditingAllowedField.update(!repoActorsEditingAllowedField.value)}
            />
            <FormControl.Label>Allow repository actors to set this property</FormControl.Label>
            <FormControl.Caption>
              Repository users and apps with the repository-level &quot;custom properties&quot; fine-grained permission
              can set and update the value for their repository.
            </FormControl.Caption>
          </FormControl>

          <div>
            <FormControl>
              <Checkbox checked={requiredField.value} onChange={() => requiredField.update(!requiredField.value)} />
              <FormControl.Label>Require this property for all repositories</FormControl.Label>
              <FormControl.Caption>
                Repositories that don&apos;t have an explicit value for this property will inherit the default value.
              </FormControl.Caption>
            </FormControl>
            <Box sx={{display: 'flex', gap: 2, width: '100%'}}>
              {requiredField.value && (
                <FormControl sx={{pt: 2, px: 4}}>
                  <FormControl.Label>Default value *</FormControl.Label>
                  {isMultiSelect && (
                    <div>
                      <CustomPropertyMultiSelectPanel
                        anchorRef={propertyMultiSelectDefaultValueRef}
                        propertyValue={defaultValueField.value as string[]}
                        mixed={false}
                        onChange={values => defaultValueField.update(values)}
                        propertyDefinition={{
                          propertyName: propertyNameField.value,
                          valueType: valueTypeField.value,
                          allowedValues: allowableDefaultValues,
                          // Not important
                          required: requiredField.value,
                          description: null,
                          valuesEditableBy: 'org_actors',
                          defaultValue: null,
                          regex: null,
                        }}
                      />
                    </div>
                  )}

                  {isSingleSelect && (
                    <Select
                      placeholder="Select an option"
                      defaultValue={defaultValueField.value}
                      ref={propertySingleSelectDefaultValueRef}
                      aria-invalid={!defaultValueField.isValid()}
                      onChange={e => defaultValueField.update(e.target.value)}
                    >
                      {allowableDefaultValues.map(value => (
                        <Select.Option key={value} value={value}>
                          {value}
                        </Select.Option>
                      ))}
                    </Select>
                  )}

                  {isTrueFalse && (
                    <Box sx={{width: '220px'}}>
                      <CustomPropertyBooleanSelect
                        propertyValue={defaultValueField.value as string}
                        onChange={defaultValueField.update}
                        ref={propertyBooleanDefaultValueRef}
                        anchorProps={{'aria-invalid': !defaultValueField.isValid()}}
                      />
                    </Box>
                  )}

                  {isText && (
                    <TextInput
                      block
                      value={defaultValueField.value}
                      ref={propertyStringDefaultValueRef}
                      aria-describedby="property-default-value-caption"
                      aria-invalid={!defaultValueField.isValid()}
                      onChange={e => defaultValueField.update(e.target.value)}
                    />
                  )}
                  {defaultValueField.validationError && (
                    <FormControl.Validation variant="error" sx={{mt: 1}}>
                      {defaultValueField.validationError}
                    </FormControl.Validation>
                  )}
                  <FormControl.Caption>
                    This is the default value that will be set for this property. Changing it has immediate effect,
                    although on large organizations it may take minutes to be available in search results.
                  </FormControl.Caption>
                </FormControl>
              )}
            </Box>
          </div>
        </Box>
      </Box>
      <Box sx={{display: 'flex', gap: 2}}>
        <Button
          variant="primary"
          disabled={saving}
          onClick={() =>
            saveDefinition({
              propertyName: propertyNameField.value,
              valueType: valueTypeField.value,
              required: requiredField.value,
              defaultValue: requiredField.value ? defaultValueField.value : null,
              description: descriptionField.value.trim() || null,
              allowedValues: isSingleSelect || isMultiSelect ? allowedValuesField.value : null,
              valuesEditableBy: repoActorsEditingAllowedField.value ? 'org_and_repo_actors' : 'org_actors',
              regex: (regexEnabled && regexField.value) || null,
            })
          }
        >
          {saving ? 'Saving...' : 'Save property'}
        </Button>

        <Button onClick={returnToList}>Cancel</Button>
      </Box>
    </>
  )
}

function AllowedValueItem({
  value,
  isDefaultValue,
  onDelete,
  index,
}: {
  value: string
  isDefaultValue: boolean
  onDelete(): void
  index: number
}) {
  const {openMoveModal} = useDragAndDrop()

  return (
    <Box
      sx={{
        px: 2,
        py: 1,
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        wordBreak: 'break-all',
        alignItems: 'center',
      }}
    >
      <Box sx={{display: 'flex', alignItems: 'center', gap: 2}}>
        <DragAndDrop.DragTrigger style={{marginRight: 0}} />
        {value}
        {isDefaultValue && <Label variant="accent">Default</Label>}
      </Box>
      <div>
        <ActionMenu>
          <ActionMenu.Anchor>
            {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
            <IconButton
              unsafeDisableTooltip={true}
              icon={KebabHorizontalIcon}
              variant="invisible"
              aria-label={`More options for ${value}`}
            />
          </ActionMenu.Anchor>

          <ActionMenu.Overlay>
            <ActionList>
              <ActionList.Item onSelect={() => openMoveModal(value, index)} aria-label={`Move option ${value}`}>
                Move
              </ActionList.Item>
              <ActionList.Item variant="danger" onSelect={onDelete} aria-label={`Delete option ${value}`}>
                Delete
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </div>
    </Box>
  )
}
