import DOMPurify from 'dompurify'

import {SystemColumnId} from '../../client/api/columns/contracts/memex-column'
import type {DraftIssueTitleValue} from '../../client/api/columns/contracts/title'
import type {DraftIssue} from '../../client/api/memex-items/contracts'
import {ItemType} from '../../client/api/memex-items/item-type'
import {
  isForbiddenError,
  isRequestError,
  parseMillisecondsToDate,
  parseTextFromHtmlStr,
  parseTitleDefaultHtml,
  parseTitleDefaultRaw,
  progressAsFraction,
  progressAsPercent,
} from '../../client/helpers/parsing'
import {createMemexItemModel} from '../../client/models/memex-item-model'
import {DefaultRedactedItem} from '../../mocks/memex-items'

function createStubDraftIssueNoColumns(): DraftIssue {
  return {
    contentType: ItemType.DraftIssue,
    content: {
      id: 1,
    },
    id: 1,
    priority: 0,
    updatedAt: new Date().toISOString(),
    memexProjectColumnValues: [],
  }
}

function createStubDraftIssue(value: DraftIssueTitleValue): DraftIssue {
  return {
    contentType: ItemType.DraftIssue,
    content: {
      id: 1,
    },
    id: 1,
    priority: 0,
    updatedAt: new Date().toISOString(),
    memexProjectColumnValues: [
      {
        memexProjectColumnId: SystemColumnId.Title,
        value,
      },
    ],
  }
}

describe('Parsing', () => {
  describe('parseTitleDefaultRaw', () => {
    it('returns empty string when no column data found', () => {
      const draftIssue = createStubDraftIssueNoColumns()
      const model = createMemexItemModel(draftIssue)

      expect(parseTitleDefaultRaw(model.columns.Title)).toEqual('')
    })

    it('returns raw string when new format stored in column data', () => {
      const draftIssue = createStubDraftIssue({title: {raw: 'raw title', html: 'html title'}})
      const model = createMemexItemModel(draftIssue)

      expect(parseTitleDefaultRaw(model.columns.Title)).toEqual('raw title')
    })

    it('returns default title for redacted items', () => {
      const model = createMemexItemModel(DefaultRedactedItem)

      expect(parseTitleDefaultRaw(model.columns.Title)).toEqual("You don't have permission to access this item")
    })
  })

  describe('getTitleDefaultHtml', () => {
    it('returns empty string when no column data found', () => {
      const draftIssue = createStubDraftIssueNoColumns()
      const model = createMemexItemModel(draftIssue)

      expect(parseTitleDefaultHtml(model.columns.Title)).toEqual('')
    })

    it('returns raw string when new format stored in column data', () => {
      const draftIssue = createStubDraftIssue({title: {raw: 'raw title', html: 'html title'}})

      const model = createMemexItemModel(draftIssue)

      expect(parseTitleDefaultHtml(model.columns.Title)).toEqual('html title')
    })

    it('returns default title for redacted items', () => {
      const model = createMemexItemModel(DefaultRedactedItem)

      expect(parseTitleDefaultHtml(model.columns.Title)).toEqual("You don't have permission to access this item")
    })
  })

  describe('isRequestError', () => {
    it(`should be falsy on falsy values`, () => {
      for (const value of [undefined, null, '', 0]) {
        expect(isRequestError(value)).toBeFalsy()
      }
    })

    it('should be falsy for a plain javascript error', () => {
      expect(isRequestError(new Error('some error'))).toBeFalsy()
    })

    it('should be truthy for a request error containing a status and a message', () => {
      expect(isRequestError({status: 500, message: 'server error'})).toBeTruthy()
    })
  })

  describe('isForbiddenError', () => {
    it('should be truthy for forbidden errors', () => {
      expect(isForbiddenError({status: 403, message: 'forbidden'})).toBeTruthy()
    })
  })

  describe('progressAsFraction', () => {
    it('should return undefined for undefined progress', () => {
      expect(progressAsFraction(undefined)).toBe(undefined)
    })

    it('should return undefined for zero total', () => {
      expect(progressAsFraction({percent: 0, completed: 1, total: 0})).toBe(undefined)
    })

    it('should return 0.5 for 2 of 4 completed', () => {
      expect(progressAsFraction({percent: 50, completed: 2, total: 4})).toBe(0.5)
    })
  })

  describe('progressAsPercent', () => {
    it('should return 0 for undefined progress', () => {
      expect(progressAsPercent(undefined)).toBe(0)
    })

    it('should return 0 for zero total', () => {
      expect(progressAsPercent({percent: 0, completed: 1, total: 0})).toBe(0)
    })

    it('should return 50 for 503 of 1000 completed', () => {
      expect(progressAsPercent({percent: 50, completed: 503, total: 1000})).toBe(50)
    })
  })

  describe('parseTextFromHtmlStr', () => {
    it('should not parse falsy values', () => {
      const spy = jest.spyOn(DOMPurify, 'sanitize')
      const result = parseTextFromHtmlStr('')

      expect(spy).not.toHaveBeenCalled()
      expect(result).toBeFalsy()
    })

    it('should return only text content', () => {
      const spy = jest.spyOn(DOMPurify, 'sanitize')
      const result = parseTextFromHtmlStr('<div><h1>OKR: </h1><p>text content</p></div>')

      expect(spy).toHaveBeenCalled()
      expect(result).toBe('OKR: text content')
    })
  })

  describe('parseMillisecondsToDate', () => {
    it('should return null if argument is NaN', () => {
      expect(parseMillisecondsToDate('abc')).toBeNull()
    })

    it('should return date object for milliseconds provided', () => {
      const date = new Date()
      const millisecondsAsString = date.valueOf().toString()
      expect(parseMillisecondsToDate(millisecondsAsString)?.valueOf()).toEqual(date.valueOf())
    })
  })
})
