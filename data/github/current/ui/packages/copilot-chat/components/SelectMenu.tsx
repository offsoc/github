import {SearchIcon} from '@primer/octicons-react'
import {ActionList, Box, Heading, TextInput} from '@primer/react'
import {useState} from 'react'

export interface SelectMenuItem {
  id: string
  text: string
  leadingVisual?: React.ReactNode
  href?: string
}

interface Props {
  title: string
  items: SelectMenuItem[]
  selectedItemID?: string | null
  onSelect?: (item: SelectMenuItem) => void
  searchPlaceholder?: string
  loading?: boolean
  asLinks?: boolean
}

export const SelectMenu = ({title, items, selectedItemID, onSelect, loading, searchPlaceholder, asLinks}: Props) => {
  const [filter, setFilter] = useState('')
  const filteredItems = items.filter(item => item.text.toLowerCase().includes(filter.toLowerCase()))

  return (
    <>
      <Box sx={{px: 3, py: 2}}>
        <Heading as="h1" sx={{fontSize: 1}}>
          {title}
        </Heading>
      </Box>
      <Box sx={{px: 2}}>
        <TextInput
          block
          contrast
          leadingVisual={SearchIcon}
          aria-label={searchPlaceholder || 'Search'}
          placeholder={searchPlaceholder || 'Search'}
          value={filter}
          onChange={event => setFilter(event.target.value)}
        />
        <span className="sr-only">Items will be filtered as you type</span>
      </Box>
      <ActionList sx={{py: 0}}>
        <ActionList.Divider sx={{mb: 0}} />
      </ActionList>
      <ActionList sx={{maxHeight: '30dvh', overflowY: 'auto', overflowX: 'hidden'}}>
        {loading ? (
          <ActionList.Item sx={{p: 3, textAlign: 'center'}}>Loading...</ActionList.Item>
        ) : !filteredItems.length ? (
          <ActionList.Item sx={{p: 3, textAlign: 'center'}}>No items</ActionList.Item>
        ) : (
          filteredItems.map(item =>
            asLinks ? (
              <ActionList.LinkItem
                key={item.id}
                active={item.id === selectedItemID}
                href={item.id !== selectedItemID ? item.href : undefined}
              >
                {item.leadingVisual && <ActionList.LeadingVisual>{item.leadingVisual}</ActionList.LeadingVisual>}
                {item.text}
              </ActionList.LinkItem>
            ) : (
              <ActionList.Item
                key={item.id}
                active={item.id === selectedItemID}
                onSelect={() => (item.id !== selectedItemID ? onSelect?.(item) : undefined)}
              >
                {item.leadingVisual && <ActionList.LeadingVisual>{item.leadingVisual}</ActionList.LeadingVisual>}
                {item.text}
              </ActionList.Item>
            ),
          )
        )}
      </ActionList>
    </>
  )
}
