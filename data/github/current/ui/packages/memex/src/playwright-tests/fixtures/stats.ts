import {eventually} from '../helpers/utils'
import {BasePageViewWithMemexApp} from './base-page-view'
import {test} from './test-extended'

export class Stats extends BasePageViewWithMemexApp {
  async expectStatsToContain<T extends object>(...expectedStats: Array<T>) {
    await eventually(async () => {
      const allStats = await this.page.evaluate(() => {
        return window.__memexInMemoryServer.db.stats.all()
      })

      for (const expectedStat of expectedStats) {
        test.expect(allStats).toContainEqual({
          // Default to View 1 unless otherwise specified, since most tests do not change views
          memexProjectViewNumber: 1,
          ...expectedStat,
        })
      }
    })
  }

  async expectStatsToHaveLength(expectedLength: number) {
    await eventually(async () => {
      const count = await this.page.evaluate(() => {
        return window.__memexInMemoryServer.db.stats.count
      })

      test.expect(count).toEqual(expectedLength)
    })
  }
}
