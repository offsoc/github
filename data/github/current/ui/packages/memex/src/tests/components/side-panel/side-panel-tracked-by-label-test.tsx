import {ThemeProvider} from '@primer/react'
import {render, screen} from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {HierarchySidePanelItem} from '../../../client/api/memex-items/hierarchy'
import {TrackedByLabel} from '../../../client/components/side-panel/header/fields/tracked-by-label'
import {useSidePanel} from '../../../client/hooks/use-side-panel'
import {SimpleItemTrackedByParent} from '../../../mocks/memex-items/tracked-issues'
import {asMockHook} from '../../mocks/stub-utilities'

jest.mock('../../../client/hooks/use-side-panel')

function createHistoryItem() {
  return new HierarchySidePanelItem(
    {
      key: {
        repoId: SimpleItemTrackedByParent.repositoryId,
        issueId: SimpleItemTrackedByParent.itemId,
      },
      title: SimpleItemTrackedByParent.title,
      url: SimpleItemTrackedByParent.url,
      state: SimpleItemTrackedByParent.state,
      stateReason: SimpleItemTrackedByParent.stateReason,
      repoName: SimpleItemTrackedByParent.repositoryName,
      number: SimpleItemTrackedByParent.displayNumber,
      assignees: SimpleItemTrackedByParent.assignees,
      labels: SimpleItemTrackedByParent.labels,
    },
    {completed: 0, total: 0, percent: 0},
  )
}

describe('tracked-by-label', () => {
  beforeEach(() => {
    asMockHook(useSidePanel).mockReturnValue({
      openPaneHistoryItem: jest.fn(),
    })
  })

  it('should not render if the current value is empty', () => {
    render(<TrackedByLabel currentValue={[]} />)
    expect(screen.queryByTestId('tracked-by-label')).not.toBeInTheDocument()
  })

  it('should render the tracked by issue display number', () => {
    const currentValue = [{...SimpleItemTrackedByParent, titleHtml: SimpleItemTrackedByParent.title}]

    render(<TrackedByLabel currentValue={currentValue} />)

    expect(screen.getByTestId('tracked-by-label')).toBeInTheDocument()
    expect(screen.getByText(`#${SimpleItemTrackedByParent.displayNumber}`)).toBeInTheDocument()
    expect(screen.queryByText(`Tracking: ${SimpleItemTrackedByParent.title}`)).not.toBeInTheDocument()
  })

  it('should render the action menu if the label container is out of bounds', () => {
    const currentValue = [{...SimpleItemTrackedByParent, titleHtml: SimpleItemTrackedByParent.title}]
    const originalInnerWidth = window.innerWidth

    window.innerWidth = -1

    render(
      <ThemeProvider>
        <TrackedByLabel currentValue={currentValue} />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('tracked-by-label')).toBeInTheDocument()
    expect(screen.getByText(`Tracking: ${SimpleItemTrackedByParent.title}`)).toBeInTheDocument()

    window.innerWidth = originalInnerWidth
  })

  it('should allow users to navigate to the tracked by issue in the side panel', async () => {
    const currentValue = [{...SimpleItemTrackedByParent, titleHtml: SimpleItemTrackedByParent.title}]

    const openPaneHistoryItemStub = jest.fn()
    asMockHook(useSidePanel).mockReturnValue({openPaneHistoryItem: openPaneHistoryItemStub})

    render(<TrackedByLabel currentValue={currentValue} />)

    expect(screen.getByTestId('tracked-by-label')).toBeInTheDocument()

    const trackedByItem = screen.getByText(`#${SimpleItemTrackedByParent.displayNumber}`)
    expect(trackedByItem).toBeInTheDocument()

    // simulate navigational click
    await userEvent.click(trackedByItem)
    expect(openPaneHistoryItemStub).toHaveBeenCalledTimes(1)
    expect(openPaneHistoryItemStub).toHaveBeenCalledWith({
      item: createHistoryItem(),
    })
  })

  it('should allow users to navigate to the tracked by issue in the side panel from the action menu', async () => {
    const currentValue = [{...SimpleItemTrackedByParent, titleHtml: SimpleItemTrackedByParent.title}]
    const originalInnerWidth = window.innerWidth

    window.innerWidth = -1

    const openPaneHistoryItemStub = jest.fn()
    asMockHook(useSidePanel).mockReturnValue({openPaneHistoryItem: openPaneHistoryItemStub})

    render(
      <ThemeProvider>
        <TrackedByLabel currentValue={currentValue} />
      </ThemeProvider>,
    )

    expect(screen.getByTestId('tracked-by-label')).toBeInTheDocument()

    const trackedByItem = screen.getByText(`Tracking: ${SimpleItemTrackedByParent.title}`)
    expect(trackedByItem).toBeInTheDocument()

    // simulate navigational click
    await userEvent.click(trackedByItem)
    expect(openPaneHistoryItemStub).toHaveBeenCalledTimes(1)
    expect(openPaneHistoryItemStub).toHaveBeenCalledWith({
      item: createHistoryItem(),
    })

    window.innerWidth = originalInnerWidth
  })
})
