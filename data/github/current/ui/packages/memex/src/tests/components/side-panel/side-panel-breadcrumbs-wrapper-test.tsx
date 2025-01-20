import {render, screen} from '@testing-library/react'

import {SidePanelBreadcrumbsWrapper} from '../../../client/components/side-panel/breadcrumbs-wrapper'
import {useSidePanelBreadcrumbHistory} from '../../../client/hooks/use-side-panel'
import {createSidePanelContext} from '../../mocks/state-providers/side-panel-context'
import {createWrapperWithContexts} from '../../wrapper-utils'
import {MockHierarchySidePanelItemFactory} from './side-panel-test-helpers'

jest.mock('../../../client/hooks/use-side-panel', () => {
  return {
    ...jest.requireActual('../../../client/hooks/use-side-panel'),
    useSidePanelBreadcrumbHistory: jest.fn(),
  }
})
const mockedHistory = jest.mocked(useSidePanelBreadcrumbHistory)

describe('SidePanelBreadcrumbsWrapper', () => {
  it('should show the repo name and issue number when there is only one issue', () => {
    const history = [
      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 0,
      }),
    ]

    mockedHistory.mockReturnValue(history)

    render(<SidePanelBreadcrumbsWrapper />, {
      wrapper: createWrapperWithContexts({
        SidePanel: createSidePanelContext(),
      }),
    })
    const firstBreadcrumb = screen.getByTitle('repository 0 #0')

    expect(firstBreadcrumb).toBeInTheDocument()
  })

  it('should show the repo name and two issue numbers when the two issues are in the same repo', () => {
    const history = [
      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 0,
      }),
      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 1,
      }),
    ]
    mockedHistory.mockReturnValue(history)
    render(<SidePanelBreadcrumbsWrapper />, {
      wrapper: createWrapperWithContexts({
        SidePanel: createSidePanelContext(),
      }),
    })

    const firstBreadcrumb = screen.getByTitle('repository 0 #0')
    const secondBreadcrumb = screen.getByTitle('#1')
    expect(firstBreadcrumb).toBeInTheDocument()
    expect(secondBreadcrumb).toBeInTheDocument()
  })

  it('should show the repo name and three subsequent issue numbers when the three issues are in the same repo', () => {
    const history = [
      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 0,
      }),
      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 1,
      }),
      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 2,
      }),
    ]
    mockedHistory.mockReturnValue(history)
    render(<SidePanelBreadcrumbsWrapper />, {
      wrapper: createWrapperWithContexts({
        SidePanel: createSidePanelContext(),
      }),
    })

    const firstBreadcrumb = screen.getByTitle('repository 0 #0')
    const secondBreadcrumb = screen.getByTitle('#1')
    const thirdBreadcrumb = screen.getByTitle('#2')
    expect(firstBreadcrumb).toBeInTheDocument()
    expect(secondBreadcrumb).toBeInTheDocument()
    expect(thirdBreadcrumb).toBeInTheDocument()
  })

  it('should show the repo name and five subsequent issue numbers when the last five issues are in the same repo', () => {
    const history = [
      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 0,
      }),

      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 1,
      }),

      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 2,
      }),

      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 3,
      }),
      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 4,
      }),
      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 5,
      }),
    ]

    mockedHistory.mockReturnValue(history)

    render(<SidePanelBreadcrumbsWrapper />, {
      wrapper: createWrapperWithContexts({
        SidePanel: createSidePanelContext(),
      }),
    })

    const firstBreadcrumb = screen.getByTitle('repository 0 #1')
    const secondBreadcrumb = screen.getByTitle('#2')
    const thirdBreadcrumb = screen.getByTitle('#3')
    const fourBreadcrumb = screen.getByTitle('#4')
    const fiveBreadcrumb = screen.getByTitle('#5')

    expect(firstBreadcrumb).toBeInTheDocument()
    expect(secondBreadcrumb).toBeInTheDocument()
    expect(thirdBreadcrumb).toBeInTheDocument()
    expect(fourBreadcrumb).toBeInTheDocument()
    expect(fiveBreadcrumb).toBeInTheDocument()
  })

  it('should show the repo name and issue number when ever issue is in a different repo', () => {
    const history = [
      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 0,
      }),

      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 1',
        getItemNumber: () => 1,
      }),

      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 2',
        getItemNumber: () => 2,
      }),
    ]

    mockedHistory.mockReturnValue(history)

    render(<SidePanelBreadcrumbsWrapper />, {
      wrapper: createWrapperWithContexts({
        SidePanel: createSidePanelContext(),
      }),
    })

    const firstBreadcrumb = screen.getByTitle('repository 0 #0')
    const secondBreadcrumb = screen.getByTitle('repository 1 #1')
    const thirdBreadcrumb = screen.getByTitle('repository 2 #2')
    expect(firstBreadcrumb).toBeInTheDocument()
    expect(secondBreadcrumb).toBeInTheDocument()
    expect(thirdBreadcrumb).toBeInTheDocument()
  })

  it('should show the repo name, two issues, and then a repo name and one issue', () => {
    const history = [
      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 0,
      }),

      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 0',
        getItemNumber: () => 1,
      }),

      MockHierarchySidePanelItemFactory.build({
        getRepositoryName: () => 'repository 2',
        getItemNumber: () => 2,
      }),
    ]

    mockedHistory.mockReturnValue(history)

    render(<SidePanelBreadcrumbsWrapper />, {
      wrapper: createWrapperWithContexts({
        SidePanel: createSidePanelContext(),
      }),
    })

    const firstBreadcrumb = screen.getByTitle('repository 0 #0')
    const secondBreadcrumb = screen.getByTitle('#1')
    const thirdBreadcrumb = screen.getByTitle('repository 2 #2')

    expect(firstBreadcrumb).toBeInTheDocument()
    expect(secondBreadcrumb).toBeInTheDocument()
    expect(thirdBreadcrumb).toBeInTheDocument()
  })
})
