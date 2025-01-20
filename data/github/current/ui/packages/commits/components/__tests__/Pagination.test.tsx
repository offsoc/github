import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'

import {getCommitsRoutePayload} from '../../test-utils/mock-data'
import {Pagination} from '../Commits/Pagination'

test('Renders the next button properly when there are more commits', async () => {
  const {filters} = getCommitsRoutePayload()

  render(<Pagination paginationInfo={filters.pagination} />)

  const nextButton = screen.getByTestId('pagination-next-button')
  expect(nextButton).toBeInTheDocument()
  expect(nextButton).not.toHaveAttribute('aria-disabled')
  //generating the URL in jest is weird, but testing to make sure the appropriate after param is used should be sufficient
  expect(nextButton).toHaveAttribute('href', '/?after=j9234jig82hhj1895345%2B34')
})

test('Renders the next button properly when there are more commits and clicking it works', async () => {
  const {
    filters: {pagination},
  } = getCommitsRoutePayload()
  pagination.hasNextPage = false
  pagination.endCursor = ''

  render(<Pagination paginationInfo={pagination} />)

  const nextButton = screen.getByTestId('pagination-next-button')
  expect(nextButton).toBeInTheDocument()
  expect(nextButton).toHaveAttribute('aria-disabled')
})

test('Renders the prev button properly when there are more commits (2)', async () => {
  const {
    filters: {pagination},
  } = getCommitsRoutePayload()
  pagination.hasNextPage = false
  pagination.endCursor = ''

  render(<Pagination paginationInfo={pagination} />)

  const prevButton = screen.getByTestId('pagination-prev-button')
  expect(prevButton).toBeInTheDocument()
  expect(prevButton).not.toHaveAttribute('aria-disabled')
  //generating the URL in jest is weird, but testing to make sure the appropriate after param is used should be sufficient
  expect(prevButton).toHaveAttribute('href', '/?before=jg92935718357f8d8%2B34')
})

test('Renders the prev button properly when the user is not at the start of the commit history', async () => {
  const {
    filters: {pagination},
  } = getCommitsRoutePayload()
  pagination.hasPreviousPage = false
  pagination.endCursor = ''

  render(<Pagination paginationInfo={pagination} />)

  const prevButton = screen.getByTestId('pagination-prev-button')
  expect(prevButton).toBeInTheDocument()
  expect(prevButton).toHaveAttribute('aria-disabled')
})
