import {screen} from '@testing-library/react'
import {render} from '@github-ui/react-core/test-utils'
import {noop} from '@github-ui/noop'
import {QueryBuilder} from '../QueryBuilder'

const Component = () => {
  return (
    <QueryBuilder
      label="filter"
      id={'archive-query-builder'}
      onChange={noop}
      inputValue={''}
      placeholder={'Filter in QueryBuilder'}
      data-testid="archive-query-builder"
      onRequestProvider={noop}
    />
  )
}

test('Renders the QueryBuilder', () => {
  render(<Component />)
  expect(screen.getByTestId('query-builder-form')).toBeInTheDocument()
})
