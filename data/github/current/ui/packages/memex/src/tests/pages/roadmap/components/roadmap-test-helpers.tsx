import '../../../mocks/platform/utils'

import {ItemType} from '../../../../client/api/memex-items/item-type'
import {dateStringFromISODate} from '../../../../client/helpers/date-string-from-iso-string'
import {columnValueFactory} from '../../../factories/column-values/column-value-factory'
import {customColumnFactory} from '../../../factories/columns/custom-column-factory'
import {buildSystemColumns} from '../../../factories/columns/system-column-factory'
import {draftIssueFactory} from '../../../factories/memex-items/draft-issue-factory'
import {issueFactory} from '../../../factories/memex-items/issue-factory'
import {viewFactory} from '../../../factories/views/view-factory'
import {setupRoadmapView} from '../../../test-app-wrapper'

const today = dateStringFromISODate(new Date().toISOString())

const dateColumn = customColumnFactory.date().build({name: 'Date'})

const buildColumns = () => {
  const columns = buildSystemColumns()
  columns.push(dateColumn)
  return columns
}

/** returns default system columns plus a 'Date' custom date field */
export const defaultRoadmapColumns = buildColumns()

/** returns a draft issue with today's date in a date field, as required for visibility of the roadmap pill */
const buildRoadmapDraftIssue = (title: string, dateValue?: string) =>
  draftIssueFactory.build({
    memexProjectColumnValues: [
      columnValueFactory.title(title, ItemType.DraftIssue).build(),
      columnValueFactory.date(dateValue || today, 'Date', defaultRoadmapColumns).build(),
    ],
  })

/** returns an issue with today's date in a date field, as required for visibility of the roadmap pill */
const buildRoadmapIssue = (title: string) =>
  issueFactory.build({
    memexProjectColumnValues: [
      columnValueFactory.title(title, ItemType.Issue).build(),
      columnValueFactory.date(today, 'Date', defaultRoadmapColumns).build(),
    ],
  })

export function setupRoadmapViewWithDates() {
  const view = viewFactory
    .roadmap()
    .withDefaultColumnsAsVisibleFields(defaultRoadmapColumns)
    .build({
      name: 'Product Roadmap',
      layoutSettings: {roadmap: {dateFields: [dateColumn.databaseId]}},
    })

  const {Roadmap} = setupRoadmapView({
    items: [
      buildRoadmapDraftIssue('Explore performance issues'),
      buildRoadmapDraftIssue('Some random title'),
      buildRoadmapIssue('Important issue'),
    ],
    columns: defaultRoadmapColumns,
    views: [view],
  })

  return {Roadmap}
}
