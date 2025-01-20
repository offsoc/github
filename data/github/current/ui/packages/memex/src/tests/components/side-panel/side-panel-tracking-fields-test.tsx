import {render, screen} from '@testing-library/react'

import type {ItemCompletion} from '../../../client/api/issues-graph/contracts'
import {TrackingFields} from '../../../client/components/side-panel/header/fields/tracking-fields'
import {useIssueContext} from '../../../client/state-providers/issues/use-issue-context'
import {autoFillColumnServerProps, trackedByColumn, tracksColumn} from '../../../mocks/data/columns'
import {DefaultOpenIssue, DefaultOpenSidePanelMetadata} from '../../../mocks/memex-items'
import {SimpleItemTrackedByParent} from '../../../mocks/memex-items/tracked-issues'
import {asMockHook} from '../../mocks/stub-utilities'
import {setupEnvironment} from './side-panel-test-helpers'

jest.mock('../../../client/state-providers/columns/use-all-columns')
jest.mock('../../../client/state-providers/issues/use-issue-context')

describe('TrackingFields', () => {
  describe('tracks-label', () => {
    it('should render with completions description', () => {
      const columns = autoFillColumnServerProps([{...tracksColumn, defaultColumn: true}])
      const completion = DefaultOpenIssue.memexProjectColumnValues.find(
        c => c.memexProjectColumnId === tracksColumn.id,
      )!.value as ItemCompletion
      asMockHook(useIssueContext).mockReturnValue({
        sidePanelMetadata: {
          ...DefaultOpenSidePanelMetadata,
          completion,
        },
      })

      const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])

      render(<TrackingFields />, {wrapper})

      const tracksField = screen.getByTestId('progress-text')
      expect(tracksField).toBeInTheDocument()
      expect(tracksField.textContent).toBe(`${completion.completed} of ${completion.total} tasks`)
    })

    it.each([
      {completion: {completed: 0, percent: 0, total: 0}, description: 'total equals to zero'},
      {completion: undefined, description: 'is undefined'},
    ])('should not render if the completion $description', ({completion}) => {
      const columns = autoFillColumnServerProps([{...tracksColumn, defaultColumn: true}])
      asMockHook(useIssueContext).mockReturnValue({
        sidePanelMetadata: {
          ...DefaultOpenSidePanelMetadata,
          completion,
        },
      })

      const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])

      render(<TrackingFields />, {wrapper})

      expect(screen.queryByTestId('progress-text')).not.toBeInTheDocument()
    })
  })

  describe('tracked-by-label', () => {
    it('should render with items', () => {
      const columns = autoFillColumnServerProps([{...trackedByColumn, defaultColumn: true}])
      asMockHook(useIssueContext).mockReturnValue({
        sidePanelMetadata: {
          ...DefaultOpenSidePanelMetadata,
          trackedBy: [{...SimpleItemTrackedByParent, titleHtml: SimpleItemTrackedByParent.title}],
        },
      })

      const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])

      render(<TrackingFields />, {wrapper})

      expect(screen.getByTestId('tracked-by-label')).toBeInTheDocument()

      const hyperlink = screen.getByTestId(`tracked-by-label-${SimpleItemTrackedByParent.itemId}`)
      expect(hyperlink).toBeInTheDocument()
      expect(hyperlink.getAttribute('href')).toBe(SimpleItemTrackedByParent.url)
      expect(hyperlink.getAttribute('data-hovercard-url')).toBe(`${SimpleItemTrackedByParent.url}/hovercard`)
    })

    it.each([
      {trackedBy: [], description: 'is empty'},
      {trackedBy: undefined, description: 'is undefined'},
    ])('should not render if the trackedBy field $description', ({trackedBy}) => {
      const columns = autoFillColumnServerProps([{...trackedByColumn, defaultColumn: true}])
      asMockHook(useIssueContext).mockReturnValue({
        sidePanelMetadata: {
          ...DefaultOpenSidePanelMetadata,
          trackedBy,
        },
      })

      const {wrapper} = setupEnvironment(columns, [DefaultOpenIssue])

      render(<TrackingFields />, {wrapper})

      expect(screen.queryByTestId('tracked-by-label')).not.toBeInTheDocument()
    })
  })
})
