import type {PropertyDefinition, PropertyValue} from '@github-ui/custom-properties-types'
import {isEmptyPropertyValue} from '@github-ui/custom-properties-types/helpers'
import {ownerPath} from '@github-ui/paths'
import {useFeatureFlag} from '@github-ui/react-core/use-feature-flag'
import {KebabHorizontalIcon, ShieldLockIcon, SyncIcon, UndoIcon} from '@primer/octicons-react'
import {ActionList, ActionMenu, Box, FormControl, IconButton, Link, Text, Token, Truncate} from '@primer/react'
import {type ReactNode, useMemo} from 'react'

import type {PropertyField} from '../hooks/use-edit-custom-properties'
import {CustomPropertyInput} from './CustomPropertyInput'
import {PropertiesOverlayEditor} from './PropertiesOverlayEditor'

interface ReadTableProps {
  definitions: PropertyDefinition[]
  propertyValuesMap: Record<string, PropertyField>
  orgName: string
  showLockMessages?: boolean
  showUndo?: boolean
  // TODO: cleanup with custom_properties_edit_modal FF.
  propertiesOverlayEditorEnabled?: boolean
}

interface EditTableProps extends ReadTableProps {
  editableDefinitions: PropertyDefinition[]
  setPropertyValue: (propertyName: string, value: PropertyValue) => void
  revertPropertyValue: (propertyName: string) => void
}

type CustomPropertyValuesTableProps = ReadTableProps | EditTableProps

export function CustomPropertyValuesTable(props: CustomPropertyValuesTableProps) {
  const {
    definitions,
    propertyValuesMap,
    orgName,
    showLockMessages = true,
    showUndo = true,
    propertiesOverlayEditorEnabled,
  } = props

  const {editableDefinitions} = props as EditTableProps
  const editableDefinitionsSet = useMemo(
    () => new Set((editableDefinitions || []).map((definition: PropertyDefinition) => definition.propertyName)),
    [editableDefinitions],
  )

  if (definitions.length === 0) {
    return null
  }

  return (
    <Box
      sx={{
        border: '1px solid',
        borderColor: 'border.muted',
        borderRadius: 2,
        'div:last-child': {
          borderBottomWidth: 0,
        },
      }}
      data-testid="custom-property-values-table"
    >
      {definitions.map(definition => {
        const {propertyName} = definition
        const field = propertyValuesMap[propertyName]
        const isEditable = 'editableDefinitions' in props && editableDefinitionsSet.has(propertyName)

        return (
          <Box
            sx={{
              px: 3,
              borderBottomWidth: 1,
              borderBottomStyle: 'solid',
              borderBottomColor: 'border.default',
            }}
            data-testid="property-row"
            key={propertyName}
          >
            {isEditable ? (
              <CustomPropertyEditValueRow
                key={propertyName}
                changed={!!field?.changed}
                mixed={!!field?.mixed}
                propertyValue={field?.value}
                definition={definition}
                error={field?.error}
                onChange={newValue => props.setPropertyValue(propertyName, newValue)}
                onReset={() => props.revertPropertyValue(propertyName)}
                showUndo={showUndo}
                orgName={orgName}
                propertiesOverlayEditorEnabled={propertiesOverlayEditorEnabled}
              />
            ) : (
              <CustomPropertyReadValueRow
                key={propertyName}
                propertyValue={field?.value || definition.defaultValue || ''}
                definition={definition}
                showLockMessages={showLockMessages}
                orgName={orgName}
              />
            )}
          </Box>
        )
      })}
    </Box>
  )
}

function CustomPropertyReadValueRow({
  propertyValue,
  definition,
  showLockMessages,
  orgName,
}: {
  propertyValue?: PropertyValue
  definition: PropertyDefinition
  showLockMessages: boolean
  orgName: string
}) {
  const {description} = definition

  return (
    <DataTableRow
      label={getControlLabel(definition)}
      description={description}
      value={<DisplayPropertyValue propertyValue={propertyValue} definition={definition} />}
      bottomMessage={
        showLockMessages && (
          <Box sx={{display: 'inline'}}>
            <Text sx={{color: 'fg.subtle'}}>
              <ShieldLockIcon size={'small'} /> Managed by{' '}
            </Text>
            <Link inline href={ownerPath({owner: orgName})}>
              {orgName}
            </Link>
          </Box>
        )
      }
    />
  )
}

function CustomPropertyEditValueRow({
  propertyValue,
  definition,
  changed,
  mixed = false,
  error,
  onChange,
  onReset,
  showUndo,
  orgName,
  propertiesOverlayEditorEnabled,
}: {
  propertyValue?: PropertyValue
  definition: PropertyDefinition
  changed: boolean
  mixed?: boolean
  error?: string
  onChange: (value: PropertyValue) => void
  onReset(): void
  showUndo: boolean
  // TODO: cleanup with custom_properties_edit_modal FF.
  propertiesOverlayEditorEnabled?: boolean
  orgName: string
}) {
  const {propertyName, description} = definition

  const booleanMenuEnabled = useFeatureFlag('boolean_property_value_toggle')
  const useNewBooleanMenu = definition.valueType === 'true_false' && booleanMenuEnabled

  const propertyNameValidationId = `${propertyName}-validation-error`

  return (
    <DataTableRow
      label={getControlLabel(definition)}
      description={description}
      value={
        <>
          <Box sx={{display: 'flex', gap: 2}}>
            {propertiesOverlayEditorEnabled && definition.required && !useNewBooleanMenu ? (
              <PropertiesOverlayEditor
                propertyDefinition={definition}
                mixed={mixed}
                appliedValue={propertyValue}
                onApply={onChange}
                org={orgName}
              />
            ) : (
              <CustomPropertyInput
                propertyDefinition={definition}
                propertyValue={propertyValue}
                mixed={mixed}
                block={true}
                onChange={onChange}
                orgName={orgName}
                booleanMenuEnabled={booleanMenuEnabled}
                inputProps={error ? {'aria-describedby': propertyNameValidationId} : {}}
              />
            )}
          </Box>
          {error && (
            <FormControl.Validation variant="error" id={propertyNameValidationId} sx={{pt: 2}}>
              {error}
            </FormControl.Validation>
          )}
        </>
      }
      trailing={
        <ResetDropdown required={definition.required} {...{propertyName, changed, onReset, onChange, showUndo}} />
      }
    />
  )
}

const formControlStyle = {
  display: 'grid',
  flex: 1,
  py: 3,
  gridTemplateColumns: ['1fr auto', '1fr auto', '1fr 220px minmax(39px, auto)'],
  gridTemplateRows: ['auto auto auto auto', 'auto auto auto auto', 'min-content min-content 1fr'],
  gridTemplateAreas: [
    '"name trailing" "description trailing" "value trailing" "bottomMessage trailing"',
    '"name trailing" "description trailing" "value trailing" "bottomMessage trailing"',
    '"name value trailing" "description value trailing" "bottomMessage value trailing"',
  ],
}

function DataTableRow({
  label,
  description,
  bottomMessage,
  value,
  trailing,
}: {
  label: string
  description: string | null
  bottomMessage?: ReactNode
  value: ReactNode
  trailing?: ReactNode
}) {
  return (
    <FormControl sx={formControlStyle}>
      <FormControl.Label
        sx={{gridArea: 'name', pr: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}
        data-testid="property-name"
      >
        {label}
      </FormControl.Label>

      <Box sx={{gridArea: 'value', mt: [1, 1, 0]}}>{value}</Box>

      {trailing && <Box sx={{gridArea: 'trailing', pl: 2, mt: 0}}>{trailing}</Box>}

      {description && (
        <FormControl.Caption sx={{gridArea: 'description', pr: 3, mt: 0}}>{description}</FormControl.Caption>
      )}
      {bottomMessage && <Box sx={{gridArea: 'bottomMessage', mt: 1}}>{bottomMessage}</Box>}
    </FormControl>
  )
}

function DisplayPropertyValue({
  propertyValue,
  definition,
}: {
  propertyValue?: PropertyValue
  definition: PropertyDefinition
}) {
  if (isEmptyPropertyValue(propertyValue)) {
    return <Text sx={{color: 'fg.muted'}}>(Empty)</Text>
  }

  switch (definition.valueType) {
    case 'single_select':
    case 'true_false':
      return (
        <Token
          sx={{color: 'fg.default'}}
          text={
            <Truncate title={propertyValue as string} maxWidth="100%">
              {propertyValue}
            </Truncate>
          }
        />
      )
    case 'multi_select':
      return (
        <>
          {(propertyValue as string[]).map(v => (
            <Token
              key={v}
              sx={{color: 'fg.default', mr: 1}}
              text={
                <Truncate title={v} maxWidth="100%">
                  {v}
                </Truncate>
              }
            />
          ))}
        </>
      )
    case 'string':
      return (
        <Truncate title={propertyValue as string} maxWidth="100%">
          {propertyValue}
        </Truncate>
      )
  }
}

export function getControlLabel({propertyName, required}: PropertyDefinition) {
  return `${propertyName}${required ? ' *' : ''}`
}

function ResetDropdown({
  propertyName,
  required,
  changed,
  showUndo = true,
  onReset,
  onChange,
}: {
  propertyName: string
  required: boolean
  changed: boolean
  showUndo?: boolean
  onReset(): void
  onChange: (value: string) => void
}) {
  const undoTitle = `Undo ${propertyName} changes`
  const resetToDefaultTitle = `Reset ${propertyName} to default value`

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        {/* eslint-disable-next-line primer-react/a11y-remove-disable-tooltip */}
        <IconButton
          unsafeDisableTooltip={true}
          icon={KebabHorizontalIcon}
          variant="invisible"
          aria-label={`Open reset options for ${propertyName}`}
        />
      </ActionMenu.Anchor>

      <ActionMenu.Overlay width="small">
        <ActionList>
          {showUndo && (
            <ActionList.Item
              onSelect={onReset}
              aria-label={undoTitle}
              inactiveText={changed ? undefined : 'No change to undo'}
            >
              <ActionList.LeadingVisual>
                <UndoIcon />
              </ActionList.LeadingVisual>
              <Text sx={{fontWeight: 'bold', display: 'block'}}>Undo</Text>
              <Text sx={{fontSize: 'small', color: 'fg.subtle'}}>Reset to the last used value</Text>
            </ActionList.Item>
          )}
          {required && (
            <ActionList.Item onSelect={() => onChange('')} aria-label={resetToDefaultTitle}>
              <ActionList.LeadingVisual>
                <SyncIcon />
              </ActionList.LeadingVisual>
              <Text sx={{fontWeight: 'bold', display: 'block'}}>Reset to default</Text>
              <Text sx={{fontSize: 'small', color: 'fg.subtle'}}>Inherit the value defined by the organization</Text>
            </ActionList.Item>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  )
}
