import '../../../mocks/platform/utils'

import {render, screen, within} from '@testing-library/react'

import {SystemColumnId} from '../../../../client/api/columns/contracts/memex-column'
import {
  type ExtendedRepository,
  type Milestone,
  MilestoneState,
  type Privileges,
  Role,
} from '../../../../client/api/common-contracts'
import {ItemType} from '../../../../client/api/memex-items/item-type'
import {dateStringFromISODate} from '../../../../client/helpers/date-string-from-iso-string'
import {overrideDefaultPrivileges} from '../../../../client/helpers/viewer-privileges'
import {Resources} from '../../../../client/strings'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../../factories/columns/custom-column-factory'
import {systemColumnFactory} from '../../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../../factories/memex-items/draft-issue-factory'
import {viewFactory} from '../../../factories/views/view-factory'
import {mockUseHasColumnData} from '../../../mocks/hooks/use-has-column-data'
import {mockUseRepositories} from '../../../mocks/hooks/use-repositories'
import {setupRoadmapView} from '../../../test-app-wrapper'
import {defaultRoadmapColumns} from './roadmap-test-helpers'

jest.mock('../../../../client/components/react_table/hooks/use-is-omnibar-fixed', () => ({
  useIsOmnibarFixed: jest.fn(() => false),
}))

describe('Roadmap Omnibar', () => {
  beforeEach(() => {
    // Mock async data fetching hooks to avoid open handles
    mockUseHasColumnData()
    mockUseRepositories()
  })

  it('should render omnibar', async () => {
    const {Roadmap} = setupRoadmapView({
      columns: defaultRoadmapColumns,
      viewerPrivileges: overrideDefaultPrivileges({role: Role.Write}),
    })
    render(<Roadmap />)

    const roadmapOmnibarElement = await screen.findByTestId('roadmap-omnibar-item')
    expect(roadmapOmnibarElement).toBeInTheDocument()
  })

  it('should not render omnibar when user has no write permissions', () => {
    const {Roadmap} = setupRoadmapView({
      columns: defaultRoadmapColumns,
      viewerPrivileges: overrideDefaultPrivileges({role: Role.Read}),
    })
    render(<Roadmap />)

    expect(screen.queryByTestId('roadmap-omnibar-item')).toBeNull()
  })

  describe('Grouped context', () => {
    const buildGroupedRoadmap = (
      viewerPrivileges: Privileges,
      groupBy: SystemColumnId = SystemColumnId.Status,
      hasItems: boolean = true,
    ) => {
      const today = dateStringFromISODate(new Date().toISOString())
      const repository = systemColumnFactory.repository().build()
      const milestone = systemColumnFactory.milestone().build()
      const status = systemColumnFactory.status({optionNames: ['Todo', 'In Progress', 'Done']}).build()
      const date = customColumnFactory.date().build({name: 'Date'})

      const columns = [systemColumnFactory.title().build(), milestone, repository, status, date]

      let groupById
      switch (groupBy) {
        case SystemColumnId.Milestone:
          groupById = milestone.databaseId
          break
        case SystemColumnId.Repository:
          groupById = repository.databaseId
          break
        case SystemColumnId.Status:
        default:
          groupById = status.databaseId
          break
      }

      const view = viewFactory.roadmap().withDefaultColumnsAsVisibleFields(columns)
      const views = [view.build({name: 'All issues', groupBy: [groupById]})]
      const memexRepository: ExtendedRepository = {
        name: 'memex',
        nameWithOwner: 'github/memex',
        id: 1111,
        url: 'https://github.com/github/memex',
        isForked: false,
        isPublic: false,
        isArchived: false,
        hasIssues: true,
      }
      const nextReleaseMilestone: Milestone = {
        id: 2222,
        title: 'Next Release',
        url: 'https://github.com/github/memex/milestones/5678',
        state: MilestoneState.Open,
        repoNameWithOwner: 'github/memex',
      }

      const {Roadmap} = setupRoadmapView({
        items: hasItems
          ? [
              draftIssueFactory.build({
                memexProjectColumnValues: [
                  columnValueFactory.title('First', ItemType.DraftIssue).build(),
                  columnValueFactory.milestone(nextReleaseMilestone).build(),
                  columnValueFactory.repository(memexRepository).build(),
                  columnValueFactory.status('Todo', columns).build(),
                  columnValueFactory.date(today, 'Date', columns).build(),
                ],
              }),
              draftIssueFactory.build({
                memexProjectColumnValues: [
                  columnValueFactory.title('Second', ItemType.DraftIssue).build(),
                  columnValueFactory.milestone(nextReleaseMilestone).build(),
                  columnValueFactory.repository(memexRepository).build(),
                  columnValueFactory.status('In Progress', columns).build(),
                  columnValueFactory.date(today, 'Date', columns).build(),
                ],
              }),
              draftIssueFactory.build({
                memexProjectColumnValues: [
                  columnValueFactory.title('Third', ItemType.DraftIssue).build(),
                  columnValueFactory.milestone(nextReleaseMilestone).build(),
                  columnValueFactory.repository(memexRepository).build(),
                  columnValueFactory.status('Done', columns).build(),
                  columnValueFactory.date(today, 'Date', columns).build(),
                ],
              }),
            ]
          : [],
        columns,
        views,
        viewerPrivileges,
      })

      return Roadmap
    }

    it('should render omnibar for each group as user with write privilege', async () => {
      const Roadmap = buildGroupedRoadmap(overrideDefaultPrivileges({role: Role.Write}))
      render(<Roadmap />)
      expect(await screen.findAllByTestId('roadmap-omnibar-item')).toHaveLength(3)
    })

    it('should render omnibar as user with write privilege if there are no rows', async () => {
      const Roadmap = buildGroupedRoadmap(overrideDefaultPrivileges({role: Role.Write}), undefined, false)
      render(<Roadmap />)
      expect(await screen.findAllByTestId('roadmap-omnibar-item')).toHaveLength(1)
    })

    it('should not render omnibar as user with read privilege', () => {
      const Roadmap = buildGroupedRoadmap(overrideDefaultPrivileges({role: Role.Read}))
      render(<Roadmap />)
      expect(screen.queryByTestId('roadmap-omnibar-item')).toBeNull()
    })

    it('is enabled when grouped by non milestone field', async () => {
      const Roadmap = buildGroupedRoadmap(overrideDefaultPrivileges({role: Role.Write}), SystemColumnId.Status)
      render(<Roadmap />)

      const omnibar = await screen.findAllByTestId('roadmap-omnibar-item')
      const el = within(omnibar[0]).getByText(Resources.addItem)
      expect(el).toBeVisible()
      expect(within(omnibar[0]).getByRole('combobox')).toBeEnabled()
    })

    it('is enabled when grouped by milestone', async () => {
      const Roadmap = buildGroupedRoadmap(overrideDefaultPrivileges({role: Role.Write}), SystemColumnId.Milestone)
      render(<Roadmap />)

      const omnibar = await screen.findAllByTestId('roadmap-omnibar-item')
      const el = within(omnibar[0]).getByText(Resources.addItem)
      expect(el).toBeVisible()
      expect(within(omnibar[0]).getByRole('combobox')).toBeEnabled()
    })

    it('is enabled when grouped by issue type', async () => {
      const Roadmap = buildGroupedRoadmap(overrideDefaultPrivileges({role: Role.Write}), SystemColumnId.IssueType)
      render(<Roadmap />)

      const omnibar = await screen.findAllByTestId('roadmap-omnibar-item')
      const el = within(omnibar[0]).getByText(Resources.addItem)
      expect(el).toBeVisible()
      expect(within(omnibar[0]).getByRole('combobox')).toBeEnabled()
    })
  })
})
