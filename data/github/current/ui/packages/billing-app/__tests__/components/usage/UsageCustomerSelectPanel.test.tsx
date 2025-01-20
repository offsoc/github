import {render} from '@github-ui/react-core/test-utils'
import {act, screen} from '@testing-library/react'
import {CUSTOMER_SELECTIONS, DEFAULT_FILTERS} from '../../../test-utils/mock-data'

import {UsageCustomerSelectPanel} from '../../../components/usage'

describe('UsageCustomerSelectPanel', () => {
  test('opens select panel when trigger button is clicked', () => {
    render(
      <UsageCustomerSelectPanel
        menuItems={CUSTOMER_SELECTIONS}
        filtersSavedState={DEFAULT_FILTERS}
        setFilters={() => {}}
        manageCostCentersLink=""
      />,
    )

    expect(screen.queryByTestId('single-select-panel-header')).not.toBeInTheDocument()
    const selectPanelContainer = screen.queryByTestId('usage-customer-panel-dialog-container')
    act(() => {
      if (selectPanelContainer) {
        selectPanelContainer.click()
      }
    })
    expect(screen.getByTestId('single-select-panel-header')).toBeVisible()
  })
})
