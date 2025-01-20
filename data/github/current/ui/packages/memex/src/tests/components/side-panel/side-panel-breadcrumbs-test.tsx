import {noop} from '@github-ui/noop'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {SidePanelBreadcrumbs} from '../../../client/components/side-panel/breadcrumbs'

const mockItems = [
  {
    url: 'http://github.localhost/monalisa/smile/issues/2',
    repoName: 'smile',
    issueNumber: '#1090',
    id: 1,
  },
  {
    url: 'http://github.localhost/monalisa/smile/issues/2',
    repoName: '',
    issueNumber: '#511',
    id: 2,
  },
  {
    url: 'http://github.localhost/monalisa/smile/issues/3',
    repoName: '',
    issueNumber: '#121',
    id: 3,
  },
]

describe('SidePanelBreadcrumbs', () => {
  it('renders a breadcrumb label for each entry in the items array', () => {
    render(<SidePanelBreadcrumbs items={mockItems} onClick={noop} />)
    const firstBreadcrumb = screen.getByTitle(`${mockItems[0].repoName} ${mockItems[0].issueNumber}`.trim())
    const secondBreadcrumb = screen.getByTitle(`${mockItems[1].repoName} ${mockItems[1].issueNumber}`.trim())
    const thirdBreadcrumb = screen.getByTitle(`${mockItems[2].repoName} ${mockItems[2].issueNumber}`.trim())

    expect(firstBreadcrumb).toBeInTheDocument()
    expect(secondBreadcrumb).toBeInTheDocument()
    expect(thirdBreadcrumb).toBeInTheDocument()
    expect(screen.queryByTestId('side-panel-nav-button-up')).toBeEnabled()
  })

  it('enables the nav button when there is more than one breadcrumb', () => {
    render(<SidePanelBreadcrumbs items={mockItems} onClick={noop} />)

    expect(screen.queryByTestId('side-panel-nav-button-up')).toBeEnabled()
  })

  it('does not display the nav button when there is only one breadcrumb', () => {
    render(<SidePanelBreadcrumbs items={mockItems.slice(0, 1)} onClick={noop} />)
    const firstBreadcrumb = screen.getByTitle(`${mockItems[0].repoName} ${mockItems[0].issueNumber}`.trim())

    expect(firstBreadcrumb).toBeInTheDocument()

    const button = screen.queryByTestId('side-panel-nav-button-up')
    expect(button).toBeNull()
  })

  it('calls onClick when the nav button is clicked', async () => {
    const onClick = jest.fn()
    render(<SidePanelBreadcrumbs items={mockItems} onClick={onClick} />)

    const button = screen.getByTestId('side-panel-nav-button-up')
    expect(button).toBeEnabled()

    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
