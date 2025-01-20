import {Heading, Text, Button} from '@primer/react'
import {useRef, useState} from 'react'
import {TriangleDownIcon} from '@primer/octicons-react'
import type {CustomerSelection, Filters} from '../../types/usage'
import {Fonts, pageHeadingStyle} from '../../utils/style'
import SingleSelectPanel from './SingleSelectPanel'

interface Props {
  menuItems: CustomerSelection[]
  filtersSavedState: Filters
  setFilters: (filters: Filters) => void
  manageCostCentersLink: string
  useUsageChartDataEndpoint?: boolean
}

export default function UsageCustomerSelectPanel({
  menuItems,
  filtersSavedState,
  setFilters,
  manageCostCentersLink,
  useUsageChartDataEndpoint,
}: Props) {
  const anchorRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(filtersSavedState.customer)

  return (
    <>
      <Heading as="h2" data-testid="select-cost-center" sx={pageHeadingStyle}>
        Metered usage
      </Heading>
      {!useUsageChartDataEndpoint && (
        <>
          <Button
            trailingVisual={TriangleDownIcon}
            onClick={() => setOpen(!open)}
            ref={anchorRef}
            data-testid="usage-customer-panel-dialog-container"
            variant="invisible"
            sx={{ml: '-12px'}}
          >{`Cost center: ${selectedCustomer.displayText}`}</Button>
          <SingleSelectPanel
            anchorRef={anchorRef}
            open={open}
            setOpen={setOpen}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            setFilters={setFilters}
            filtersSavedState={filtersSavedState}
            menuItems={menuItems}
            manageCostCentersLink={manageCostCentersLink}
          />
        </>
      )}
      <Text as="small" sx={{color: 'fg.muted', fontSize: Fonts.FontSizeSmall, mt: 1}}>
        {!useUsageChartDataEndpoint &&
          (selectedCustomer.displayText === 'None'
            ? 'Showing usage for your enterprise excluding cost centers.'
            : 'Showing cost for the selected cost center.')}
      </Text>
    </>
  )
}
