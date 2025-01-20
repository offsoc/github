import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import DataCard from '../DataCard'
import {ActionList, ActionMenu, Link} from '@primer/react'

describe('DataCard', () => {
  const defaultProps = {
    cardTitle: "I'm a card!",
  }

  test('Renders the DataCard with Counter', () => {
    render(
      <DataCard {...defaultProps}>
        <DataCard.Counter count={100} metric={{singular: 'thing', plural: 'things'}} />
        <DataCard.Description>An interesting description</DataCard.Description>
      </DataCard>,
    )
    expect(screen.getByText("I'm a card!")).toBeInTheDocument()
    expect(screen.getByText('100')).toBeInTheDocument()
    expect(screen.getByText('things')).toBeInTheDocument()
    expect(screen.getByText('An interesting description')).toBeInTheDocument()
    expect(screen.queryByTestId('data-card-action-link')).not.toBeInTheDocument()
  })

  test('Renders the DataCard with action link', () => {
    render(
      <DataCard
        {...defaultProps}
        action={
          <Link href="test" data-testid="data-card-action-link">
            View details
          </Link>
        }
      >
        <DataCard.Description>An interesting description</DataCard.Description>
      </DataCard>,
    )
    expect(screen.getByText("I'm a card!")).toBeInTheDocument()
    expect(screen.getByTestId('data-card-action-link').textContent).toBe('View details')
    expect(screen.getByTestId('data-card-action-link')).toHaveAttribute('href', 'test')
    expect(screen.getByText('An interesting description')).toBeInTheDocument()
  })

  test('Renders the DataCard with action menu', () => {
    render(
      <DataCard
        {...defaultProps}
        action={
          <ActionMenu>
            <ActionMenu.Button variant="invisible" size="small" data-testid="data-card-action-menu">
              Group by
            </ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item>Foo</ActionList.Item>
                <ActionList.Item>Bar</ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        }
      >
        <DataCard.Description>An interesting description</DataCard.Description>
      </DataCard>,
    )
    expect(screen.getByText("I'm a card!")).toBeInTheDocument()
    expect(screen.getByTestId('data-card-action-menu').textContent).toBe('Group by')
    expect(screen.getByText('An interesting description')).toBeInTheDocument()
  })

  test('Renders the DataCard with Counter and a singular metric', () => {
    render(
      <DataCard {...defaultProps}>
        <DataCard.Counter count={1} metric={{singular: 'thing', plural: 'things'}} />
        <DataCard.Description>An interesting description</DataCard.Description>
      </DataCard>,
    )
    expect(screen.getByText("I'm a card!")).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('thing')).toBeInTheDocument()
    expect(screen.getByText('An interesting description')).toBeInTheDocument()
  })
  test('Renders the DataCard with a single ProgressBar', () => {
    render(
      <DataCard {...defaultProps}>
        <DataCard.ProgressBar data={[{progress: 30}]} />
      </DataCard>,
    )
    expect(screen.getByText("I'm a card!")).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '30')
  })

  test('Renders the DataCard with a multi ProgressBar', () => {
    const data = [
      {progress: 20, label: 'Item'},
      {progress: 20, label: 'Item'},
      {progress: 20, label: 'Item'},
    ]

    render(
      <DataCard {...defaultProps}>
        <DataCard.ProgressBar data={data} />
      </DataCard>,
    )
    expect(screen.getByText("I'm a card!")).toBeInTheDocument()
    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.getAllByLabelText('Item')).toHaveLength(3)
  })

  test('Renders the DataCard with a NoData component if no content prop is passed', () => {
    render(<DataCard cardTitle="I'm a card with no Data!" />)
    expect(screen.getByText("I'm a card with no Data!")).toBeInTheDocument()
    expect(screen.getByText('Data unavailable')).toBeInTheDocument()
  })

  test('Datacard accepts sx props', () => {
    render(<DataCard cardTitle="I'm a card with no Data!" sx={{width: 'auto'}} data-testid="test-id" />)
    expect(screen.getByText("I'm a card with no Data!")).toBeInTheDocument()
    expect(screen.getByText('Data unavailable')).toBeInTheDocument()
    expect(screen.getByTestId('test-id')).toHaveStyle({width: 'auto'})
  })
})
