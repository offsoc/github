import {Autocomplete, TextInput, TextInputWithTokens} from '@primer/react'
import {useMemo, useState, type ChangeEventHandler} from 'react'
import type {Language} from '../../types'
import {LanguageToken} from './LanguageToken'

interface AutocompleteItem {
  id: string
  color: string
  selected?: boolean
  text: string
}

interface Props {
  initialLanguages?: string[]
  availableLanguages: Language[]
}

const languagesToAutocompleteItems: (languages: Language[]) => AutocompleteItem[] = (languages: Language[]) => {
  return languages.map(({color: color, id: id, name: text}) => ({color, id: id.toString(), text}))
}

export function AutocompleteLanguages({availableLanguages, initialLanguages}: Props) {
  const allItems = useMemo(() => languagesToAutocompleteItems(availableLanguages), [availableLanguages])

  const tokenizedInitialLanguages = languagesToAutocompleteItems(
    availableLanguages.filter(e => initialLanguages?.includes(e.name)),
  )

  const [filterVal, setFilterVal] = useState<string>('')
  const [selectedItems, setSelectedItems] = useState(tokenizedInitialLanguages)
  const selectedItemIds = useMemo(() => selectedItems.map(t => t.id), [selectedItems])

  const onTokenRemove = (itemId: string | number): void => {
    setSelectedItems(selectedItems.filter(item => item.id !== itemId))
  }

  const handleChange: ChangeEventHandler<HTMLInputElement> = e => {
    setFilterVal(e.currentTarget.value)
  }

  const onSelectedChange = (newSelectedItems: AutocompleteItem | AutocompleteItem[]) => {
    if (!Array.isArray(newSelectedItems)) return
    setSelectedItems(newSelectedItems.map(({color, id, text}) => ({color, id, text})))
    setFilterVal('')
  }

  const customFilterFn = (item: AutocompleteItem) => {
    if (!filterVal.trim()) return false
    return item.text.toLowerCase().includes(filterVal.trim().toLowerCase())
  }

  return (
    <Autocomplete>
      <Autocomplete.Input
        aria-label="Language input"
        as={TextInputWithTokens}
        tokenComponent={LanguageToken}
        tokens={selectedItems}
        onTokenRemove={onTokenRemove}
        onChange={handleChange}
        sx={{width: '100%'}}
      />
      <Autocomplete.Overlay sx={{maxHeight: 'min(50vh, 280px)', overflowY: 'auto'}}>
        <Autocomplete.Menu
          aria-labelledby="autocompleteLabel"
          emptyStateText={filterVal.trim() ? 'No languages found' : 'Type to search'}
          filterFn={customFilterFn}
          items={allItems}
          onSelectedChange={onSelectedChange}
          selectedItemIds={selectedItemIds}
          selectionVariant="multiple"
        />
      </Autocomplete.Overlay>
      <TextInput
        readOnly
        id="languages"
        name="languages"
        value={selectedItems.map(item => item.text).join(',')}
        sx={{display: 'none'}}
      />
    </Autocomplete>
  )
}
