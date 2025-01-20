import {SelectPanel} from '@primer/react/experimental'
import {ActionList, Text} from '@primer/react'
import {useState} from 'react'
import type {CustomerSelection, Filters} from '../../types/usage'
import {getSelectedCustomerDisplayTest} from '../../utils/cost-centers'
import {Fonts} from '../../utils/style'

interface Props {
  anchorRef: React.RefObject<HTMLButtonElement>
  open: boolean
  setOpen: (open: boolean) => void
  selectedCustomer: CustomerSelection
  setSelectedCustomer: (customer: CustomerSelection) => void
  menuItems: CustomerSelection[]
  filtersSavedState: Filters
  setFilters: (filters: Filters) => void
  manageCostCentersLink: string
}

export default function SingleSelectPanel({
  anchorRef,
  open,
  setOpen,
  selectedCustomer,
  setSelectedCustomer,
  menuItems,
  filtersSavedState,
  setFilters,
  manageCostCentersLink,
}: Props) {
  const [filteredCustomers, setfilteredCustomers] = useState(menuItems)
  const [query, setQuery] = useState('')
  const onSubmit = () => {
    setfilteredCustomers(menuItems)
    setOpen(false)
  }
  const onCancel = () => {
    setOpen(false)
  }

  const onSearchInputChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const searchTerm = event.currentTarget.value
    setQuery(searchTerm)

    const filteredItems =
      query === ''
        ? menuItems
        : menuItems.filter(item => item.displayText.toLowerCase().includes(searchTerm.toLowerCase()))

    setfilteredCustomers(filteredItems)
  }

  return (
    <>
      <SelectPanel
        title="Switch cost center"
        description="View usage for individual cost centers"
        open={open}
        onSubmit={onSubmit}
        onCancel={onCancel}
        anchorRef={anchorRef}
        selectionVariant="instant"
      >
        <SelectPanel.Header data-testid="single-select-panel-header">
          <SelectPanel.SearchInput onChange={onSearchInputChange} data-testid="single-select-panel-search-input" />
        </SelectPanel.Header>
        <ActionList data-testid="single-select-panel-list">
          {filteredCustomers.length === 0 ? (
            <SelectPanel.Message variant="empty" title={`No cost center found`}>
              Try searching for a different cost center or add a new one
            </SelectPanel.Message>
          ) : (
            filteredCustomers.map(customer => (
              <ActionList.Item
                key={customer.id}
                onSelect={() => {
                  setSelectedCustomer(customer)
                  setFilters({...filtersSavedState, customer})
                  setOpen(false)
                }}
                selected={selectedCustomer?.id === customer.id}
              >
                {getSelectedCustomerDisplayTest(customer)}{' '}
                {customer.displayText === 'None' && (
                  <Text as="small" sx={{color: 'fg.muted', fontSize: Fonts.FontSizeSmall}}>
                    (usage excluding cost centers)
                  </Text>
                )}
              </ActionList.Item>
            ))
          )}
        </ActionList>
        <SelectPanel.Footer>
          <SelectPanel.SecondaryAction
            variant="link"
            href={manageCostCentersLink}
            data-testid="single-select-panel-footer-link"
          >
            Manage cost centers
          </SelectPanel.SecondaryAction>
        </SelectPanel.Footer>
      </SelectPanel>
    </>
  )
}
