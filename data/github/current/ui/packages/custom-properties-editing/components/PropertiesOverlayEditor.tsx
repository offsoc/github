import type {PropertyDefinition, PropertyValue} from '@github-ui/custom-properties-types'
import {
  getEmptyValueByType,
  isEmptyPropertyValue,
  isPropertyValueArray,
} from '@github-ui/custom-properties-types/helpers'
import {ownerPath} from '@github-ui/paths'
import {TriangleDownIcon} from '@primer/octicons-react'
import {AnchoredOverlay, Box, Button, FormControl, Link, Radio, RadioGroup, Truncate} from '@primer/react'
import {useState} from 'react'

import {useEditCustomProperties} from '../hooks/use-edit-custom-properties'
import {CustomPropertyInput} from './CustomPropertyInput'
import {getDisplayAnchorLabel} from './CustomPropertySelectPanel'

interface Props {
  appliedValue?: PropertyValue
  propertyDefinition: PropertyDefinition
  mixed: boolean
  org: string
  onApply: (value: PropertyValue) => void
}

const lineClampSx = {
  display: '-webkit-box',
  '-webkit-line-clamp': '5',
  '-webkit-box-orient': 'vertical',
  overflow: 'hidden',
  wordBreak: 'break-all',
  textOverflow: 'ellipsis',
}

export function PropertiesOverlayEditor({org, mixed, propertyDefinition, onApply, ...props}: Props) {
  const {valueType, defaultValue, propertyName} = propertyDefinition
  const appliedValue = props.appliedValue || getEmptyValueByType(valueType)

  const initialValueOption = isEmptyPropertyValue(appliedValue) && !mixed ? 'default' : 'custom'
  const [valueOption, setValueOption] = useState<string | null>(initialValueOption)

  const {propertyValuesMap, setPropertyValue, revertPropertyValue} = useEditCustomProperties(
    [{[propertyName]: appliedValue}],
    [propertyDefinition],
  )

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we can be certain that this key exists
  const valueField = propertyValuesMap[propertyName]!

  const [missingValueError, setMissingValueError] = useState('')

  const [open, setOpen] = useState(false)

  function handleApply() {
    setMissingValueError('')
    if (valueOption === 'custom') {
      if (valueField.error) {
        return
      } else if (valueField.value && !isEmptyPropertyValue(valueField.value)) {
        onApply(valueField.value)
      } else {
        setMissingValueError('Value is required')
        return
      }
    } else {
      onApply(getEmptyValueByType(valueType))
      setPropertyValue(propertyName, getEmptyValueByType(valueType))
    }
    setOpen(false)
  }

  function handleValueChange(value: PropertyValue) {
    setMissingValueError('')
    setPropertyValue(propertyName, value)
  }

  function resetAndClose() {
    setMissingValueError('')
    setValueOption(initialValueOption)
    revertPropertyValue(propertyName)
    setOpen(false)
  }

  const anchorLabel = getDisplayAnchorLabel(appliedValue, defaultValue, mixed)
  const defaultRadioLabel = getDefaultValueRadioLabel(defaultValue || '')

  const isMixed = isEmptyPropertyValue(valueField.value) && mixed
  const error = missingValueError || valueField.error

  return (
    <AnchoredOverlay
      open={open}
      onOpen={() => setOpen(true)}
      onClose={resetAndClose}
      renderAnchor={anchorProps => (
        <Button
          {...anchorProps}
          block
          alignContent="start"
          trailingAction={TriangleDownIcon}
          sx={{minWidth: 0, '>span[data-component="buttonContent"]': {flex: 1}}}
          data-testid="properties-overlay-editor"
        >
          <Truncate maxWidth="100%" title={anchorLabel}>
            {anchorLabel}
          </Truncate>
        </Button>
      )}
      side="outside-bottom"
      overlayProps={{role: 'dialog', sx: {width: 270}}}
    >
      <Box sx={{p: 3, borderBottom: 'solid 1px', borderBottomColor: 'border.muted', boxSizing: 'border-box'}}>
        <RadioGroup name="Property value options" onChange={selected => setValueOption(selected)}>
          <RadioGroup.Label visuallyHidden>Property value options</RadioGroup.Label>
          <FormControl>
            <Radio checked={valueOption === 'default'} value="default" />
            <FormControl.Label sx={lineClampSx}>{defaultRadioLabel}</FormControl.Label>
            <FormControl.Caption>
              Inherited from{' '}
              <Link inline href={ownerPath({owner: org})}>
                {org}
              </Link>
            </FormControl.Caption>
          </FormControl>

          <FormControl>
            <Radio checked={valueOption === 'custom'} value="custom" />
            <FormControl.Label>Custom value</FormControl.Label>
            <FormControl.Caption>Set your own value</FormControl.Caption>
          </FormControl>
          <Box sx={{pl: 4}}>
            {valueOption === 'custom' && (
              <CustomPropertyInput
                block
                hideDefaultPlaceholder
                propertyDefinition={propertyDefinition}
                propertyValue={valueField.value}
                mixed={isMixed}
                onChange={handleValueChange}
                orgName={org}
              />
            )}
            {error && (
              <FormControl.Validation variant="error" sx={{pt: 2}}>
                {error}
              </FormControl.Validation>
            )}
          </Box>
        </RadioGroup>
      </Box>
      <Box sx={{p: 3, display: 'flex', gap: 2, justifyContent: 'end'}}>
        <Button size="small" onClick={resetAndClose}>
          Cancel
        </Button>
        <Button size="small" variant="primary" onClick={handleApply}>
          Apply
        </Button>
      </Box>
    </AnchoredOverlay>
  )
}

function getDefaultValueRadioLabel(value: PropertyValue): string {
  if (isPropertyValueArray(value)) {
    return `default (${value.join(', ')})`
  }

  return `default (${value})`
}
