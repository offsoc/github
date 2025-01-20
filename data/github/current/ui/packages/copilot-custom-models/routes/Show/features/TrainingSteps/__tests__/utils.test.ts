import type {Stage} from '../../../../../types'
import {allStatuses, shouldAutoClose, shouldAutoOpen, stageSortFn} from '../utils'

const ENQUEUED = 'PIPELINE_STAGE_STATUS_ENQUEUED'
const STARTED = 'PIPELINE_STAGE_STATUS_STARTED'
const indexEnqueued = allStatuses.indexOf(ENQUEUED)
const indexStarted = allStatuses.indexOf(STARTED)
const beforeStarted = allStatuses.slice(0, indexEnqueued)
const afterStarted = allStatuses.slice(indexStarted + 1)

describe('shouldAutoOpen', () => {
  describe('moving from earlier status to STARTED', () => {
    it('returns true', () => {
      for (const prev of beforeStarted) {
        const curr = STARTED
        expect(shouldAutoOpen(prev, curr)).toBeTruthy()
      }
    })
  })

  describe('moving from undefined to STARTED', () => {
    it('returns true', () => {
      const prev = undefined
      const curr = STARTED
      expect(shouldAutoOpen(prev, curr)).toBeTruthy()
    })
  })

  describe('staying at STARTED', () => {
    it('returns false', () => {
      const prev = STARTED
      const curr = STARTED
      expect(shouldAutoOpen(prev, curr)).toBeFalsy()
    })
  })

  describe('moving from STARTED to earlier status', () => {
    it('returns false', () => {
      const prev = STARTED
      for (const curr of beforeStarted) {
        expect(shouldAutoOpen(prev, curr)).toBeFalsy()
      }
    })
  })

  describe('moving from later status to STARTED', () => {
    it('returns false', () => {
      for (const prev of afterStarted) {
        const curr = STARTED
        expect(shouldAutoOpen(prev, curr)).toBeFalsy()
      }
    })
  })
})

describe('shouldAutoClose', () => {
  describe('moving from STARTED to later status', () => {
    it('returns true', () => {
      const prev = STARTED
      for (const curr of afterStarted) {
        expect(shouldAutoClose(prev, curr)).toBeTruthy()
      }
    })
  })

  describe('staying at STARTED', () => {
    it('returns false', () => {
      const prev = STARTED
      const curr = STARTED
      expect(shouldAutoClose(prev, curr)).toBeFalsy()
    })
  })

  describe('moving from STARTED to earlier status', () => {
    it('returns false', () => {
      const prev = STARTED
      for (const curr of beforeStarted) {
        expect(shouldAutoClose(prev, curr)).toBeFalsy()
      }
    })
  })

  describe('moving from later status to STARTED', () => {
    it('returns false', () => {
      for (const prev of afterStarted) {
        const curr = STARTED
        expect(shouldAutoClose(prev, curr)).toBeFalsy()
      }
    })
  })
})

describe('stageSortFn', () => {
  describe('when each order number is unique', () => {
    it('orders by order', () => {
      const stage10 = {order: 10, name: 'stage'} as Stage
      const stage1 = {order: 1, name: 'stage'} as Stage
      const stage4 = {order: 4, name: 'stage'} as Stage

      const original = [stage10, stage1, stage4]
      const actual = original.sort(stageSortFn)
      const expected = [stage1, stage4, stage10]

      expect(actual).toEqual(expected)
    })
  })

  describe('when each order number is not unique', () => {
    it('orders by order, then name', () => {
      const stage10a = {order: 10, name: 'a'} as Stage
      const stage10c = {order: 10, name: 'c'} as Stage
      const stage10b = {order: 10, name: 'b'} as Stage
      const stage1 = {order: 1, name: '1'} as Stage
      const stage2 = {order: 2, name: '2'} as Stage

      const original = [stage10a, stage10c, stage10b, stage1, stage2]
      const actual = original.sort(stageSortFn)
      const expected = [stage1, stage2, stage10a, stage10b, stage10c]

      expect(actual).toEqual(expected)
    })
  })
})
