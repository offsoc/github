import type {PageError} from '@github-ui/react-core/app-routing-types'

import {extractFileTree, makeErrorPayload, makePermalinkPayload} from '../make-payload'
import {testTreePayload} from '../../__tests__/test-helpers'

describe('makeErrorPayload', () => {
  test('with an error', async () => {
    const newPath = 'new-path'
    const payload = testTreePayload
    const error = {httpStatus: 404, type: 'httpError'} as PageError

    const errorPayload = makeErrorPayload(payload, error, newPath)

    expect(errorPayload.path).toEqual(newPath)
    expect(errorPayload.refInfo).toEqual(payload.refInfo)
    expect(errorPayload.repo).toEqual(payload.repo)
    expect(errorPayload.currentUser).toEqual(payload.currentUser)
    expect('blob' in errorPayload).toBe(false)
    expect(errorPayload.error).toEqual({httpStatus: 404, type: 'httpError'})
  })
})

describe('makePermalinkPayload', () => {
  it('returns a new payload when receiving a blob payload', () => {
    const permalinkPayload = makePermalinkPayload(testTreePayload)

    expect(permalinkPayload.refInfo.refType).toBeUndefined()
    expect(permalinkPayload.refInfo.canEdit).toEqual(false)
  })

  it('returns a new payload when receiving a tree payload', () => {
    const permalinkPayload = makePermalinkPayload(testTreePayload)

    expect(permalinkPayload.refInfo.refType).toBeUndefined()
    expect(permalinkPayload.refInfo.canEdit).toEqual(false)
  })
})

test('extractFileTree returns the fileTree when receiving a tree payload', () => {
  const fileTree = extractFileTree(testTreePayload)

  expect(fileTree).toEqual({
    '': {
      totalCount: 0,
      items: [],
    },
    'src/app': {
      totalCount: 0,
      items: [],
    },
  })
})
