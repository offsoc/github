/* eslint testing-library/render-result-naming-convention: off */

import {InsightsQueryElement} from '../src/insights-query-element'

if (!window.customElements.get('insights-query')) {
  window.customElements.define('insights-query', InsightsQueryElement)
}

describe('stripRenderCommentFromQuery', function () {
  const element = new InsightsQueryElement()

  it('tests query without chart config', async function () {
    const query = `-- render bar-chart \nSELECT * FROM Issues`

    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(`-- render bar-chart\nSELECT * FROM Issues`)
  })

  it('tests query with chart config', async function () {
    const query = `-- render bar-chart (chart-config-option-one:1,\nchart-config-option-two:"true")\nSELECT COUNT(*) FROM Issues`

    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(`-- render bar-chart\nSELECT COUNT(*) FROM Issues`)
  })

  it('tests query with chart config containing parentheses', async function () {
    const query = `-- scope project/2193
-- render stacked-area-chart (
    chart-title:"Category chart hello (test)",
    chart-subtitle:"stacked area chart",
    chart-label-x,
    chart-label-y
)
SELECT COUNT(*) FROM Issues`

    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(`-- scope project/2193
-- render stacked-area-chart
SELECT COUNT(*) FROM Issues`)
  })

  it('tests query with chart config - no spaces between chart and config options', async function () {
    const query = `-- render bar-chart(chart-config-option-one:1,chart-config-option-two:"true")
SELECT COUNT(*) FROM Issues`

    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(`-- render bar-chart
SELECT COUNT(*) FROM Issues`)
  })

  it('tests query with inner select with render', async function () {
    const query = `-- render bar-chart
SELECT * FROM (SELECT * FROM ISSUES)`

    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(query)
  })

  it('tests-query-with-inner-select-with-scope', async function () {
    const query = `-- scope project/2193
SELECT * FROM (SELECT * FROM ISSUES)`

    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(query)
  })

  it('tests-query-with-inner-select-with-all', async function () {
    const query = `-- scope project/2193
-- render bar-chart
SELECT * FROM (SELECT * FROM ISSUES)`
    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(query)
  })

  it('tests query with inner select with nothing', async function () {
    const query = `SELECT * FROM (SELECT * FROM ISSUES)`
    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(query)
  })

  it('tests query with inner select with space', async function () {
    const query = `


SELECT * FROM (SELECT * FROM ISSUES)`

    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe('SELECT * FROM (SELECT * FROM ISSUES)')
  })

  it('tests-query-with-crazy-spacing', async function () {
    const query = `

-- scope project/2193



-- render bar-chart



SELECT * FROM (




SELECT * FROM ISSUES




)`

    const expected = `-- scope project/2193
-- render bar-chart
SELECT * FROM (




SELECT * FROM ISSUES




)`
    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(expected)
  })

  it('tests query with options with scope', async function () {
    const query = `-- scope project/2193
-- render stacked-area-chart (
    chart-title:"Category chart hello (test)",
    chart-subtitle:"stacked area chart",
    chart-label-x,
    chart-label-y
)
SELECT * FROM (SELECT * FROM ISSUES)`

    const strippedQuery = element.stripRenderCommentFromQuery(query)
    const expected = `-- scope project/2193
-- render stacked-area-chart
SELECT * FROM (SELECT * FROM ISSUES)`

    expect(strippedQuery).toBe(expected)
  })

  it('tests query with options with no scope', async function () {
    const query = `-- render stacked-area-chart (
    chart-title:"Category chart hello (test)",
    chart-subtitle:"stacked area chart",
    chart-label-x,
    chart-label-y
)
SELECT * FROM (SELECT * FROM ISSUES)`

    const expected = `-- render stacked-area-chart
SELECT * FROM (SELECT * FROM ISSUES)`

    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(expected)
  })

  it('tests query with options with crazy spacing', async function () {
    const query = `

-- scope  project/2193

-- render   stacked-area-chart (

    chart-title:"Category chart hello (test)",

    chart-subtitle:"stacked area chart",

    chart-label-x,

    chart-label-y

)

SELECT *
FROM (SELECT * FROM ISSUES)`

    const strippedQuery = element.stripRenderCommentFromQuery(query)
    const expected = `-- scope  project/2193
-- render   stacked-area-chart
SELECT *
FROM (SELECT * FROM ISSUES)`

    expect(strippedQuery).toBe(expected)
  })

  it('tests query from example site', async function () {
    const query = `select
  distinct percentile_cont(0.5) within group (
      order by
  DaysToClose desc
) over () as [Median Time to Close (Days) ]
  from
  (
      select
  datediff(day, i.CreatedDate, i.ClosedDate) as DaysToClose
  from
  Issue i
  join IssueLabelMap m on i.IssueId = m.IssueId
  join Label l on m.labelId = l.labelId
  where
  RepositoryName = 'Insights'
  and l.name = 'bug'
  and i.State = 'closed'
) T`
    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(query)
  })

  it('returns the string when given only a render directive', async function () {
    const query = `--render stacked-area-chart`
    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(`--render stacked-area-chart\n`)
  })

  it('returns the string when given only a scope directive', async function () {
    const query = `--scope project/1234`
    const strippedQuery = element.stripRenderCommentFromQuery(query)
    expect(strippedQuery).toBe(`--scope project/1234\n`)
  })
})
