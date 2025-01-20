import {expect, type Page} from '@playwright/test'

import {P_50_REACT_PROFILER_ID, p50Data, withItemsData} from '../mocks/data/performance'
import type {MemexApp} from './fixtures/memex-app'
import {test} from './fixtures/test-extended'
import {mustFind} from './helpers/dom/assertions'
import {waitForTitle} from './helpers/dom/interactions'
import {_} from './helpers/dom/selectors'
import {getSelectMenu, selectOption, setCellToEditMode, setCellToFocusMode} from './helpers/table/interactions'
import {cellEditorTestId, cellTestId, getCellMode, rowTestId} from './helpers/table/selectors'
import {CellMode} from './types/table'

/**
 * Threshold, in milliseconds per React commit, above which we should consider
 * rendering performance to have regressed.
 * TODO @olivia: investigate why migrating to integrations-tests seems to have caused this to increase.
 */
const RENDER_PERFORMANCE_REGRESSION_THRESHOLD = 153

/** In tests that involve scrolling, we scroll the page in increments of this many rows. */
const SCROLL_UNIT = 10

/**
 * In tests that involve scrolling, we wait this long in milliseconds before
 * initiating the next scroll event.
 *
 * This is because it takes roughly this long for the virtualized row that our
 * scrollings selector targets to actually be inserted into the DOM (and thus
 * consistently found). As a result, our goal should be to reduce this as much
 * as possible.
 */
const SCROLL_DELAY = 50

/** The number of times we repeat scrolling scenarios in an attempt to get consistent results. */
const SCROLL_ITERATIONS = 10

/**
 * The timeout, in milliseconds, that we use for tests that involve (which take
 * a bit longer to run than other tests).
 *
 * It is sometimes useful to increase this value temporarily while debugging.
 */
const SCROLL_TEST_TIMEOUT = 40000

/** The dimensions of the viewport we use for scrolling tests. */
const VIEWPORT_WIDTH = 1280
const VIEWPORT_HEIGHT = 800

const NUM_P50_ROWS = p50Data.items.length

async function clearComponentRenders(page: Page) {
  await page.evaluate(() => window.memexPerformance.clearComponentRenders())
}

async function getComponentRenders(page: Page) {
  const result = await page.evaluate(() => window.memexPerformance.getComponentRenders())
  if (!result) throw new Error('window.memexPeformance.getComponentRenders returned nothing')
  return result
}

async function getComponentRenderCount(
  page: Page,
  group?: string,
  component?: string,
  id?: string | number,
): Promise<number> {
  const counts = await getComponentRenders(page)

  if (!group) return counts.total
  const _group = counts.groups[group]

  if (!component) return _group?.total || 0
  const _component = _group?.components[component]

  if (!id) return _component?.total || 0

  id = id.toString()

  return _component?.ids[id] || 0
}

const clearProfilerMeasurements = async (page: Page) => {
  await page.evaluate(() => window.memexPerformance.clearProfilerMeasurements())
}

const getProfilerMeasurements = async (page: Page, id?: string, phase?: string) => {
  let result = await page.evaluate(() => window.memexPerformance.getProfilerMeasurements())
  if (!result) throw new Error('window.memexPeformance.getProfilerMeasurements returned nothing')

  if (id) {
    result = result.filter(datum => datum.id === id)
  }

  if (phase) {
    result = result.filter(datum => datum.phase === phase)
  }

  return result
}

/**
 * Computes the average duration from the given list of measurements.
 *
 * @param measurements A series of measurements of the React commit phase.
 * @returns Average commit duration in milliseconds.
 */
const computeAverageCommitDuration = (measurements: Array<ReactProfilerMeasurement>) => {
  const total = measurements.reduce((sum, datum) => sum + datum.actualDuration, 0)
  return measurements.length ? total / measurements.length : 0
}

/** Scrolls a page from top to bottom. */
const scrollDown = async (page: Page) => {
  for (let i = 0; i < NUM_P50_ROWS; i += SCROLL_UNIT) {
    const row = await mustFind(page, _(rowTestId(i)))
    await row.scrollIntoViewIfNeeded()
    await page.waitForTimeout(SCROLL_DELAY)
  }
}

/** Scrolls a page from bottom to top. */
const scrollUp = async (page: Page) => {
  for (let i = NUM_P50_ROWS - 1; i >= 0; i -= SCROLL_UNIT) {
    const row = await mustFind(page, _(rowTestId(i)))
    await row.scrollIntoViewIfNeeded()
    await page.waitForTimeout(SCROLL_DELAY)
  }
}

/**
 * Sets output parameters for GitHub Actions that can be consumed by subsequent
 * workflow steps to report metrics.
 */
const reportResult = (commitDuration: number) => {
  /* eslint eslint-comments/no-use: off */
  /* eslint-disable no-console */
  console.log(`average_react_commit_duration=${commitDuration} >> $GITHUB_OUTPUT`)
  console.log(`scroll_unit=${SCROLL_UNIT} >> $GITHUB_OUTPUT`)
  console.log(`scroll_delay=${SCROLL_DELAY} >> $GITHUB_OUTPUT`)
  console.log(`scroll_iterations=${SCROLL_ITERATIONS} >> $GITHUB_OUTPUT`)
  console.log(`viewport_dimensions=${VIEWPORT_WIDTH}x${VIEWPORT_HEIGHT} >> $GITHUB_OUTPUT`)
  /* eslint-enable no-console */
}

/**
 *  expectComponentRenderCount is a helper for asserting the render count of a given
 *  group/component/id from `performanceMeasurements.ts`. It's main purpose is to log the
 *  render count data if there is a failure to assist debugging.
 *
 * @param [group, component, id] - group and optional component/id to assert counts for
 * @param runAssertion - a function passed the requested count in which to run normal
 *                       jest assertions in
 */
async function expectComponentRenderCount(
  page: Page,
  [group, component, id]: [group: string, component?: string, id?: string | number],
  runAssertion: (count: number) => void,
) {
  const actualCount = await getComponentRenderCount(page, group, component, id)

  try {
    runAssertion(actualCount)
  } catch (e) {
    const renders = await getComponentRenders(page)

    if (e instanceof Error) {
      e.message += `\nPerformance Measurements:\n${JSON.stringify(renders, null, 2)}`
    }

    throw e
  }
}

test.describe('Table navigation performance', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {liveUpdatesEnabled: false})
  })

  test('All cell renderers should be measured', async ({page}) => {
    const initialRenders = 1
    const totalCellCount = withItemsData.items.length * withItemsData.columns.length
    await expectComponentRenderCount(page, ['Table', 'ReactTable'], count => expect(count).toBe(initialRenders))
    await expectComponentRenderCount(page, ['CellRenderer'], count =>
      expect(count % totalCellCount).toBeLessThanOrEqual(totalCellCount * initialRenders),
    )

    await expectComponentRenderCount(page, ['CellRenderer', 'TitleRenderer'], count => expect(count).toBeGreaterThan(0))
    await expectComponentRenderCount(page, ['CellRenderer', 'MilestoneRenderer'], count =>
      expect(count).toBeGreaterThan(0),
    )
    await expectComponentRenderCount(page, ['CellRenderer', 'AssigneesRenderer'], count =>
      expect(count).toBeGreaterThan(0),
    )
    await expectComponentRenderCount(page, ['CellRenderer', 'TextRenderer'], count => expect(count).toBeGreaterThan(0))
    await expectComponentRenderCount(page, ['CellRenderer', 'LabelsRenderer'], count =>
      expect(count).toBeGreaterThan(0),
    )
  })

  test('Focusing a cell should not re-render any CellRenderers', async ({page}) => {
    await clearComponentRenders(page)

    await setCellToFocusMode(page, _(cellTestId(3, 'Title')))

    await expectComponentRenderCount(page, ['CellRenderer'], count => expect(count).toEqual(0))
  })

  test('Keyboard navigating should not re-render any CellRenderers', async ({page}) => {
    await setCellToFocusMode(page, _(cellTestId(3, 'Title')))
    await clearComponentRenders(page)

    await page.keyboard.press('ArrowDown')

    await expectComponentRenderCount(page, ['CellRenderer'], count => expect(count).toEqual(0))
  })
})

test.describe('Suggestions state performance', () => {
  test.beforeEach(async ({memex}) => {
    await memex.navigateToStory('integrationTestsWithItems', {liveUpdatesEnabled: false})
  })

  test('Editing assignees should not cause excessive re-renders', async ({page}) => {
    const cell = _(cellTestId(3, 'Assignees'))
    const editor = _(cellEditorTestId(3, 'Assignees'))

    const cellTextBefore = await page.textContent(cell)

    await clearComponentRenders(page)

    await setCellToEditMode(page, cell)
    const menu = await getSelectMenu(page, editor)
    await selectOption(menu, 'dmarcey')
    await setCellToFocusMode(page, cell)

    // Temporary space at the beginning due to https://github.com/github/memex/issues/16409
    expect(await page.textContent(cell)).toEqual(` dmarcey and ${cellTextBefore}`)

    await new Promise(resolve => {
      setTimeout(resolve, 1000)
    })

    /**
     * At the moment we're seeing a lot of re-renders due to the fact that updating a single field
     * causes the whole model to change.
     * This issue will be fixed, tracked here: https://github.com/github/memex/issues/7673
     */
    await expectComponentRenderCount(page, ['CellRenderer', 'AssigneesRenderer'], count => expect(count).toEqual(5))
    await expectComponentRenderCount(page, ['CellRenderer', 'DateRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'IterationRenderer'], count => expect(count).toEqual(0))
    await expectComponentRenderCount(page, ['CellRenderer', 'LabelsRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'LinkedPullRequestsRenderer'], count =>
      expect(count).toEqual(1),
    )
    await expectComponentRenderCount(page, ['CellRenderer', 'MilestoneRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'NumberRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'ReviewersRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'RepositoryRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'SingleSelectRenderer'], count => expect(count).toEqual(2))
    await expectComponentRenderCount(page, ['CellRenderer', 'TextRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'TitleRenderer'], count => expect(count).toEqual(1))

    await expectComponentRenderCount(page, ['CellEditor'], count => expect(count).toEqual(2))
    await expectComponentRenderCount(page, ['CellEditor', 'AssigneesEditor'], count => expect(count).toEqual(2))
  })

  test('Editing labels should not cause excessive re-renders', async ({page}) => {
    const cell = _(cellTestId(3, 'Labels'))
    const editor = _(cellEditorTestId(3, 'Labels'))

    const cellTextBefore = await page.textContent(cell)

    await clearComponentRenders(page)

    await setCellToEditMode(page, cell)
    const menu = await getSelectMenu(page, editor)
    await selectOption(menu, '🏓 Table')
    await setCellToFocusMode(page, cell)

    expect(await page.textContent(cell)).toEqual(`🏓 Table${cellTextBefore}`)

    await new Promise(resolve => {
      setTimeout(resolve, 1000)
    })

    /**
     * At the moment we're seeing a lot of re-renders due to the fact that updating a single field
     * causes the whole model to change.
     * This issue will be fixed, tracked here: https://github.com/github/memex/issues/7673
     */
    await expectComponentRenderCount(page, ['CellRenderer', 'AssigneesRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'DateRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'IterationRenderer'], count => expect(count).toEqual(0))
    await expectComponentRenderCount(page, ['CellRenderer', 'LabelsRenderer'], count => expect(count).toEqual(5))
    await expectComponentRenderCount(page, ['CellRenderer', 'LinkedPullRequestsRenderer'], count =>
      expect(count).toEqual(1),
    )
    await expectComponentRenderCount(page, ['CellRenderer', 'MilestoneRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'IssueTypeRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'NumberRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'ReviewersRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'RepositoryRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'SingleSelectRenderer'], count => expect(count).toEqual(2))
    await expectComponentRenderCount(page, ['CellRenderer', 'TextRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'TitleRenderer'], count => expect(count).toEqual(1))

    await expectComponentRenderCount(page, ['CellEditor'], count => expect(count).toEqual(3))
    await expectComponentRenderCount(page, ['CellEditor', 'LabelsEditor'], count => expect(count).toEqual(3))
  })

  test('Editing milestone should not cause excessive re-renders', async ({page}) => {
    const cell = _(cellTestId(3, 'Milestone'))
    const editor = _(cellEditorTestId(3, 'Milestone'))

    await clearComponentRenders(page)

    await setCellToEditMode(page, cell)
    const menu = await getSelectMenu(page, editor)
    await selectOption(menu, 'v1.0 - Limited Beta')
    expect(await getCellMode(page, cell)).toBe(CellMode.FOCUSED)

    expect(await page.textContent(cell)).toEqual('v1.0 - Limited Beta')

    await new Promise(resolve => {
      setTimeout(resolve, 1000)
    })

    /**
     * At the moment we're seeing a lot of re-renders due to the fact that updating a single field
     * causes the whole model to change.
     * This issue will be fixed, tracked here: https://github.com/github/memex/issues/7673
     */
    await expectComponentRenderCount(page, ['CellRenderer', 'AssigneesRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'DateRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'IterationRenderer'], count => expect(count).toEqual(0))
    await expectComponentRenderCount(page, ['CellRenderer', 'LabelsRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'LinkedPullRequestsRenderer'], count =>
      expect(count).toEqual(1),
    )
    await expectComponentRenderCount(page, ['CellRenderer', 'MilestoneRenderer'], count => expect(count).toEqual(4))
    await expectComponentRenderCount(page, ['CellRenderer', 'IssueTypeRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'NumberRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'ReviewersRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'RepositoryRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'SingleSelectRenderer'], count => expect(count).toEqual(2))
    await expectComponentRenderCount(page, ['CellRenderer', 'TextRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'TitleRenderer'], count => expect(count).toEqual(1))

    await expectComponentRenderCount(page, ['CellEditor'], count => expect(count).toEqual(2))
    await expectComponentRenderCount(page, ['CellEditor', 'MilestoneEditor'], count => expect(count).toEqual(2))

    await expectComponentRenderCount(page, ['Table', 'TableHeader'], count => expect(count).toBe(1))
  })

  test('Editing issue type should not cause excessive re-renders', async ({page}) => {
    const cell = _(cellTestId(3, 'Type'))
    const editor = _(cellEditorTestId(3, 'Type'))

    await clearComponentRenders(page)

    await setCellToEditMode(page, cell)
    const menu = await getSelectMenu(page, editor)
    await selectOption(menu, 'Bug')
    expect(await getCellMode(page, cell)).toBe(CellMode.FOCUSED)

    expect(await page.textContent(cell)).toEqual('Bug')

    await new Promise(resolve => {
      setTimeout(resolve, 1000)
    })

    /**
     * At the moment we're seeing a lot of re-renders due to the fact that updating a single field
     * causes the whole model to change.
     * This issue will be fixed, tracked here: https://github.com/github/memex/issues/7673
     */
    await expectComponentRenderCount(page, ['CellRenderer', 'AssigneesRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'DateRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'IterationRenderer'], count => expect(count).toEqual(0))
    await expectComponentRenderCount(page, ['CellRenderer', 'LabelsRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'LinkedPullRequestsRenderer'], count =>
      expect(count).toEqual(1),
    )
    await expectComponentRenderCount(page, ['CellRenderer', 'MilestoneRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'IssueTypeRenderer'], count => expect(count).toEqual(4))
    await expectComponentRenderCount(page, ['CellRenderer', 'NumberRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'ReviewersRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'RepositoryRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'SingleSelectRenderer'], count => expect(count).toEqual(2))
    await expectComponentRenderCount(page, ['CellRenderer', 'TextRenderer'], count => expect(count).toEqual(1))
    await expectComponentRenderCount(page, ['CellRenderer', 'TitleRenderer'], count => expect(count).toEqual(1))

    await expectComponentRenderCount(page, ['CellEditor'], count => expect(count).toEqual(2))
    await expectComponentRenderCount(page, ['CellEditor', 'IssueTypeEditor'], count => expect(count).toEqual(2))

    await expectComponentRenderCount(page, ['Table', 'TableHeader'], count => expect(count).toBe(1))
  })
})

test.describe('Table rendering performance', () => {
  const setupTableRenderingPerfTest = async (page: Page, memex: MemexApp) => {
    await memex.navigateToStory('integrationTestsP50')
    await page.setViewportSize({
      width: VIEWPORT_WIDTH,
      height: VIEWPORT_HEIGHT,
    })
    await clearProfilerMeasurements(page)
  }

  // Flaky: https://github.com/github/memex/issues/9280
  // https://github.com/github/memex/issues/9333
  test.fixme(
    `Updates the DOM in less than ${RENDER_PERFORMANCE_REGRESSION_THRESHOLD}ms on average when scrolling`,
    async ({page, memex}, testInfo) => {
      await setupTableRenderingPerfTest(page, memex)
      testInfo.setTimeout(SCROLL_TEST_TIMEOUT)
      const dataPoints = new Array<number>()
      let scrollingDown = true

      for (let i = 0; i < SCROLL_ITERATIONS; i++) {
        await (scrollingDown ? scrollDown(page) : scrollUp(page))
        dataPoints.push(computeAverageCommitDuration(await getProfilerMeasurements(page, P_50_REACT_PROFILER_ID)))
        await clearProfilerMeasurements(page)
        scrollingDown = !scrollingDown
      }

      const averageCommitDuration = Math.round(
        dataPoints.length ? dataPoints.reduce((sum, datum) => sum + datum) / dataPoints.length : 0,
      )

      expect(averageCommitDuration).toBeLessThanOrEqual(RENDER_PERFORMANCE_REGRESSION_THRESHOLD)

      reportResult(averageCommitDuration)
    },
  )

  test('Receiving a live update does not cause excessive re-renders', async ({page, memex}) => {
    await setupTableRenderingPerfTest(page, memex)

    await clearComponentRenders(page)
    await expectComponentRenderCount(page, ['Table', 'ReactTable'], count => expect(count).toBe(0))

    await page.evaluate(() => {
      return window.__memexInMemoryServer.memexes.update({title: "My Team's Memex(Updated by socket)"})
    })

    const emitted = await page.evaluate(() => {
      return window.__memexInMemoryServer.liveUpdate.sendSocketMessage({
        type: 'github.memex.v0.MemexProjectEvent',
      })
    })

    test.expect(emitted).toBeTruthy()

    await waitForTitle(page, "My Team's Memex(Updated by socket")

    // Ideally this number would be 1, but since we have multiple
    // data sources this ends up being a bit larger as we update unrelated
    // parts of the app.
    // Hopefully this should at least catch a massive number of re-renders, like
    // we encountered in https://github.com/github/memex/issues/7477
    const expectedTableRenders = 2

    await expectComponentRenderCount(page, ['Table', 'ReactTable'], count => expect(count).toBe(expectedTableRenders))
  })
})
