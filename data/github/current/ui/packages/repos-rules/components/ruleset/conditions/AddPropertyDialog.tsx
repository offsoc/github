import type {FC, HTMLAttributes, RefObject} from 'react'
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {Button, FormControl, TextInputWithTokens, Truncate} from '@primer/react'
import {Dialog} from '@primer/react/experimental'
import {CodeIcon, EyeIcon, NoteIcon, RepoForkedIcon, TriangleDownIcon, type Icon} from '@primer/octicons-react'
import type {ExtendedItemProps} from '@github-ui/item-picker/ItemPicker'
import {ItemPicker} from '@github-ui/item-picker/ItemPicker'
import type {PropertyDescriptor, PropertySource} from '../../../types/rules-types'
import type {ValueType} from '@github-ui/custom-properties-types'
import {LANGUAGES} from '@github-ui/repos-filter/providers'

export type AddPropertyDialogProps = {
  properties: PropertyDescriptor[]
  onAdd: (name: string, source: PropertySource, values: string[]) => void
  onClose: () => void
  includeOrExclude: 'include' | 'exclude'
}

type TextValueInputProps = {
  valueInputRef: RefObject<HTMLInputElement>
  valueBoxKeyHandler: (event: React.KeyboardEvent) => void
  selectedValueTokens: ValueToken[]
  removeValue: (tokenId: string | number) => void
}

type SelectValueInputProps = {
  selectedValues: string[]
  setSelectedValues: (values: string[]) => void
  setFilterValueText: (filter: string) => void
}

type ValueToken = {
  text: string
  id: string
}

const LANGUAGE_NAMES = LANGUAGES.map(({name}) => name)

export const AddPropertyDialog: FC<AddPropertyDialogProps> = ({properties, onAdd, onClose, includeOrExclude}) => {
  const [filterText, setFilterText] = useState('')
  const [filteredProperties, setFilteredProperties] = useState<PropertyDescriptor[]>([])
  const [selectedProperty, setSelectedProperty] = useState<PropertyDescriptor | undefined>(undefined)
  const [showMissing, setShowMissing] = useState<boolean>(false)
  const [selectedValues, setSelectedValues] = useState<string[]>([])
  const [filterValueText, setFilterValueText] = useState<string>('')

  const selectedValueTokens: ValueToken[] = useMemo(() => {
    return selectedValues.map(v => ({
      text: v,
      id: v,
    }))
  }, [selectedValues])

  const updateSelectedProperty = useCallback((newProperty?: PropertyDescriptor) => {
    setSelectedValues([])
    setSelectedProperty(newProperty)
  }, [])

  const filterProperties = useCallback(
    async (newFilter: string) => {
      try {
        setFilteredProperties(properties.filter(p => p.name.toLowerCase().includes(newFilter.toLowerCase())))
      } catch (e) {
        // suppress loading errors
      }
    },
    [properties],
  )

  useEffect(() => {
    filterProperties(filterText)
  }, [filterText, filterProperties])

  const removeValue = useCallback(
    (tokenId: string | number) => {
      setSelectedValues(selectedValues.filter(value => value !== tokenId))
    },
    [selectedValues],
  )

  const saveProperty = useCallback(() => {
    let propertyValues = selectedValues
    if (selectedProperty?.valueType === 'string' && (valueInputRef.current?.value.length || 0 > 0)) {
      propertyValues = propertyValues.concat(valueInputRef.current?.value || '')
    }

    if (!selectedProperty || propertyValues.length === 0) {
      setShowMissing(true)
      return
    }

    onAdd(selectedProperty?.name || '', selectedProperty?.source, propertyValues)
  }, [selectedValues, selectedProperty, onAdd])

  const selectedPropertyAllowedValues = useMemo(() => {
    if (!selectedProperty) {
      return []
    }

    if (selectedProperty.name === 'language' && selectedProperty.source === 'system') {
      return LANGUAGE_NAMES
    }

    switch (selectedProperty.valueType) {
      case 'true_false':
        return ['true', 'false']
      case 'single_select':
      case 'multi_select':
        return selectedProperty.allowedValues || []
      default:
        return []
    }
  }, [selectedProperty])

  const filterValues = selectedPropertyAllowedValues.filter(v =>
    v.toLowerCase().includes(filterValueText.toLowerCase()),
  )

  const propertyToItemPickerItem = useCallback(
    (property: PropertyDescriptor): ExtendedItemProps<PropertyDescriptor> => {
      const truncationCharLimit = 24
      let truncatedPropertyName = property.displayName

      if (truncatedPropertyName.length > truncationCharLimit) {
        truncatedPropertyName = `${truncatedPropertyName.substring(0, truncationCharLimit)}...`
      }

      return {
        id: property.displayName,
        text: truncatedPropertyName,
        descriptionVariant: 'block',
        source: property,
        showDivider: true,
        leadingVisual: propertyIcons[property.icon],
      }
    },
    [],
  )

  const valueInputRef = useRef<HTMLInputElement>(null)
  const valueBoxKeyHandler = useCallback(
    (event: React.KeyboardEvent) => {
      // eslint-disable-next-line @github-ui/ui-commands/no-manual-shortcut-logic
      if (event.key === 'Enter' && valueInputRef) {
        event.preventDefault()
        setSelectedValues(selectedValues.concat(valueInputRef.current?.value || ''))
        valueInputRef.current!.value = ''
      }
    },
    [selectedValues],
  )

  const buttonText = selectedProperty?.displayName

  return (
    <Dialog
      title={`${capitalize(includeOrExclude)} repositories by property`}
      footerButtons={[
        {content: 'Cancel', buttonType: 'normal', onClick: onClose},
        {content: 'Add target', onClick: saveProperty, buttonType: 'primary'},
      ]}
      onClose={onClose}
      sx={{width: '500px'}}
    >
      <FormControl>
        <FormControl.Label>
          <span className="text-bold">Property</span>
        </FormControl.Label>
        <ItemPicker
          renderAnchor={anchorProps => (
            <Button trailingAction={TriangleDownIcon} alignContent="start" {...anchorProps}>
              <Truncate title={buttonText || 'Select property'} maxWidth={195}>
                {buttonText || 'Select property'}
              </Truncate>
            </Button>
          )}
          placeholderText="Search for properties"
          items={filteredProperties}
          enforceAtleastOneSelected={true}
          selectionVariant="single"
          initialSelectedItems={selectedProperty ? [selectedProperty] : []}
          maxVisibleItems={5}
          height="medium"
          width={'medium'}
          onSelectionChange={items => {
            if (items.length > 0) {
              updateSelectedProperty(items[0])
            }
          }}
          filterItems={setFilterText}
          getItemKey={p => `${p.name}-${p.source}`}
          convertToItemProps={propertyToItemPickerItem}
        />
        {showMissing && !selectedProperty && (
          <FormControl.Validation variant="error" aria-live="polite">
            Please select a property
          </FormControl.Validation>
        )}
      </FormControl>
      {selectedProperty && (
        <FormControl sx={{mt: 2}}>
          <FormControl.Label>Value</FormControl.Label>
          <PropertyValueControl
            valueType={selectedProperty.valueType}
            items={filterValues}
            valueInputRef={valueInputRef}
            valueBoxKeyHandler={valueBoxKeyHandler}
            selectedValueTokens={selectedValueTokens}
            removeValue={removeValue}
            selectedValues={selectedValues}
            setSelectedValues={setSelectedValues}
            setFilterValueText={setFilterValueText}
          />
          {showMissing && selectedValues.length === 0 && (
            <FormControl.Validation variant="error" aria-live="polite">
              Please select at least one value
            </FormControl.Validation>
          )}
        </FormControl>
      )}
    </Dialog>
  )
}

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const propertyIcons: Record<string, Icon> = {
  note: NoteIcon,
  eye: EyeIcon,
  'repo-forked': RepoForkedIcon,
  code: CodeIcon,
}

function PropertyValueControl({
  valueType,
  items,
  valueInputRef,
  valueBoxKeyHandler,
  selectedValueTokens,
  removeValue,
  selectedValues,
  setSelectedValues,
  setFilterValueText,
}: {
  valueType: ValueType
  items: string[]
} & TextValueInputProps &
  SelectValueInputProps) {
  const dropdownProps = {setSelectedValues, selectedValues, setFilterValueText, items}

  switch (valueType) {
    case 'string':
      return (
        <TextInputWithTokens
          sx={{width: '100%'}}
          size="large"
          ref={valueInputRef}
          onKeyDown={valueBoxKeyHandler}
          tokens={selectedValueTokens}
          onTokenRemove={removeValue}
        />
      )
    case 'single_select':
    case 'multi_select':
      return (
        <ValueItemPicker
          renderAnchor={anchorProps => (
            <Button alignContent="start" trailingAction={TriangleDownIcon} {...anchorProps}>
              {selectedValues.length > 0
                ? selectedValues.length > 1
                  ? `${selectedValues.length} values selected`
                  : selectedValues[0]
                : 'Select a value'}
            </Button>
          )}
          selectionVariant="multiple"
          {...dropdownProps}
        />
      )
    case 'true_false':
      return (
        <ValueItemPicker
          {...dropdownProps}
          selectionVariant="single"
          renderAnchor={anchorProps => (
            <Button alignContent="start" trailingAction={TriangleDownIcon} {...anchorProps}>
              {selectedValues.length > 0 ? selectedValues[0] : 'Select a value'}
            </Button>
          )}
        />
      )
    default:
      return null
  }
}

function ValueItemPicker({
  renderAnchor,
  items,
  selectedValues,
  selectionVariant,
  setSelectedValues,
  setFilterValueText,
}: SelectValueInputProps & {
  selectionVariant: 'single' | 'multiple'
  renderAnchor: (props: HTMLAttributes<HTMLElement>) => JSX.Element
  items: string[]
}) {
  const valueToItemPickerItem = (item: string) => {
    const truncationCharLimit = 24
    let truncatedValue = item

    if (truncatedValue.length > truncationCharLimit) {
      truncatedValue = `${truncatedValue.substring(0, truncationCharLimit)}...`
    }

    return {
      id: item,
      text: truncatedValue,
      source: item,
    }
  }

  return (
    <ItemPicker
      renderAnchor={renderAnchor}
      placeholderText="Search for values"
      items={items}
      loading={false}
      selectionVariant={selectionVariant}
      initialSelectedItems={selectedValues}
      onSelectionChange={setSelectedValues}
      getItemKey={v => v}
      convertToItemProps={valueToItemPickerItem}
      filterItems={setFilterValueText}
    />
  )
}
