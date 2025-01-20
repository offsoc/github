import {render} from '@github-ui/react-core/test-utils'
import {screen} from '@testing-library/react'
import type {ComponentProps} from 'react'

import {ReposList} from '../components/ReposList'
import {getRepositoriesRoutePayload} from '../test-utils/mock-data'

const sampleProps: ComponentProps<typeof ReposList> = {
  compactMode: false,
  showSpinner: false,
  repositoryCount: 5000,
  repos: getRepositoriesRoutePayload().repositories,
  onSortingItemSelect: jest.fn(),
}
describe('ReposList', () => {
  it('renders header and all expected elements', () => {
    render(<ReposList {...sampleProps} />)

    expect(screen.getByText('5k repositories')).toBeInTheDocument()
    expect(screen.getByText('test-repo')).toBeInTheDocument()
    expect(screen.getByTestId('trains-topic-link')).toBeInTheDocument()
  })

  it('renders compact rows initially if remembered so', () => {
    render(<ReposList {...sampleProps} compactMode={true} />)

    expect(screen.getByText('5k repositories')).toBeInTheDocument()
    expect(screen.getByText('test-repo')).toBeInTheDocument()
  })
})
