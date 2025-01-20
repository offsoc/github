import {render, screen} from '@testing-library/react'
import {SummaryCard} from '../SummaryCard'
import {ActivationState} from '../../types/activation-state'
import {CheckIcon} from '@primer/octicons-react'

const defaultTestProps = {
  activationState: ActivationState.Active,
  headerIconComponent: CheckIcon,
  title: 'Default Title',
  headerMenu: <div>Default Header Menu</div>,
  children: <div>Default Card Body</div>,
}
const renderSummaryCard = (overrideProps = {}) => {
  const combinedProps = {...defaultTestProps, ...overrideProps}
  return render(<SummaryCard {...combinedProps} />)
}

describe('SummaryCard Component', () => {
  test('happy path: check that title is rendered', () => {
    renderSummaryCard({title: 'Test Title'})

    const titleEl = screen.queryByTestId('summary-card-title')
    expect(titleEl).toBeInTheDocument()
    expect(titleEl).toHaveTextContent('Test Title')
  })

  test('when activationState is inactive, header should include inactive label', () => {
    renderSummaryCard({activationState: ActivationState.Inactive})

    const inactiveLabelEl = screen.queryByTestId('summary-card-label-inactive')
    expect(inactiveLabelEl).toBeInTheDocument()
  })

  test('when activationState is trial, header should include active trial label', () => {
    renderSummaryCard({activationState: ActivationState.Trial})

    const activeTrialLabel = screen.queryByTestId('summary-card-label-trial')
    expect(activeTrialLabel).toBeInTheDocument()
  })

  test('when activationState is expired trial, header should include expired trial label', () => {
    renderSummaryCard({activationState: ActivationState.TrialExpired})

    const expiredTrialLabel = screen.queryByTestId('summary-card-label-trial-expired')
    expect(expiredTrialLabel).toBeInTheDocument()
  })

  test('when header menu is provided, should be rendered', () => {
    renderSummaryCard({headerMenu: <div>Menu Item</div>})

    const headerMenuContainerEl = screen.queryByTestId('summary-card-header-menu')
    expect(headerMenuContainerEl).toBeInTheDocument()
    expect(headerMenuContainerEl).toHaveTextContent('Menu Item')
  })

  test('when header menu is not provided, none should be rendered', () => {
    renderSummaryCard({headerMenu: undefined})

    const headerMenuContainerEl = screen.queryByTestId('summary-card-header-menu')
    expect(headerMenuContainerEl).not.toBeInTheDocument()
  })

  test('when card body is not provided, should not be rendered', () => {
    renderSummaryCard({children: undefined})

    const bodyContainerEl = screen.queryByTestId('summary-card-body')
    expect(bodyContainerEl).not.toBeInTheDocument()
  })

  test('when card body is not provided, class .summaryCardHeaderNoBody should be included on the header', () => {
    renderSummaryCard({children: undefined})

    const header = screen.queryByTestId('summary-card-header')
    expect(header).toHaveClass('summaryCardHeaderNoBody')
  })

  test('when card body is provided, should be rendered', () => {
    renderSummaryCard({cardBody: <div>Card Body</div>})

    const bodyContainerEl = screen.queryByTestId('summary-card-body')
    expect(bodyContainerEl).toBeInTheDocument()
    expect(bodyContainerEl).toHaveTextContent('Card Body')
  })

  test('when card body is provided, class .summaryCardHeaderNoBody should not be included on the header', () => {
    renderSummaryCard({cardBody: <div>Something</div>})

    const header = screen.queryByTestId('summary-card-header')
    expect(header).not.toHaveClass('summaryCardHeaderNoBody')
  })
})
