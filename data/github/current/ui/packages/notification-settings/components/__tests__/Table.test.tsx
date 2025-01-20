import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {Button} from '@primer/react'
import Table from '../Table'
import Row, {type RowProps} from '../table/Row'
import Header from '../table/Header'

describe('table rendering', () => {
  const row: RowProps = {
    title: 'Row title',
    subtitle: 'Row subtitle',
    action: <Button key="button">Button 1</Button>,
  }

  test('renders the header)', () => {
    render(
      <Table>
        <Header>Title</Header>
      </Table>,
    )

    expect(screen.getByText('Title')).toBeVisible()
    expect(screen.getByRole('heading', {level: 2})).toBeInTheDocument()
  })

  test('does not render the header)', () => {
    render(<Table />)

    expect(screen.queryByText('Title')).toBeNull()
    expect(screen.queryByRole('heading', {level: 4})).not.toBeInTheDocument()
  })

  test('renders the rows)', () => {
    render(
      <Table>
        {[row, row].map((r, index) => (
          <Row key={index} {...r} />
        ))}
      </Table>,
    )

    expect(screen.queryAllByText('Row title').length).toEqual(2)
  })

  test('renders the titles)', () => {
    render(
      <Table>
        {[row].map((r, index) => (
          <Row key={index} {...r} />
        ))}
      </Table>,
    )

    expect(screen.getByText('Row title')).toBeVisible()
    expect(screen.getByText('Row subtitle')).toBeVisible()
  })

  test('renders the buttons)', () => {
    render(
      <Table>
        {[row].map((r, index) => (
          <Row key={index} {...r} />
        ))}
      </Table>,
    )

    expect(screen.getByRole('button', {name: 'Button 1'})).toBeInTheDocument()
  })
})

describe('table rendering without optional elements', () => {
  const row: RowProps = {
    title: 'Row title',
    action: <Button key="button">Change</Button>,
  }

  test('renders the rows)', () => {
    render(
      <Table>
        {[row, row].map((r, index) => (
          <Row key={index} {...r} />
        ))}
      </Table>,
    )

    expect(screen.queryAllByText('Row title').length).toEqual(2)
  })

  test('renders the title)', () => {
    render(
      <Table>
        {[row].map((r, index) => (
          <Row key={index} {...r} />
        ))}
      </Table>,
    )

    expect(screen.getByText('Row title')).toBeVisible()
  })

  test('does not render the subtitle)', () => {
    render(
      <Table>
        {[row].map((r, index) => (
          <Row key={index} {...r} />
        ))}
      </Table>,
    )

    expect(screen.queryByText('Row subtitle')).toBeNull()
  })

  test('renders the buttons)', () => {
    render(
      <Table>
        {[row].map((r, index) => (
          <Row key={index} {...r} />
        ))}
      </Table>,
    )

    expect(screen.getByRole('button', {name: 'Change'})).toBeInTheDocument()
  })
})
