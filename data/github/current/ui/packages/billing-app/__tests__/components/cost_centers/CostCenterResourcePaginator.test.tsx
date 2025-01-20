import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import ResourcePaginator from '../../../components/pickers/ResourcePaginator'
import {USER_RESOURCE_LIST} from '../../../test-utils/mock-data'

describe('ResourcePaginator', () => {
  test('renders members list pagination', () => {
    render(
      <ResourcePaginator
        totalResources={USER_RESOURCE_LIST.length}
        pageCount={1}
        currentPage={1}
        onPageChange={() => {}}
      />,
    )

    expect(screen.getByTestId('pagination-wrapper')).toBeVisible()
    expect(screen.getByTestId('pagination-page-text')).toHaveTextContent('1-10 of 11')
  })
})
