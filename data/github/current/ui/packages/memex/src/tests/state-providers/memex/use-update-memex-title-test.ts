import {act, renderHook} from '@testing-library/react'

import {apiUpdateMemex} from '../../../client/api/memex/api-update-memex'
import {useUpdateMemexTitle} from '../../../client/state-providers/memex/use-update-memex-title'
import {DefaultMemex} from '../../../mocks/data/memexes'
import {stubRejectedApiResponse, stubResolvedApiResponse} from '../../mocks/api/memex'
import {existingProjectOptions, stubSetProject} from './helpers'

// Mocking this module to avoid the verified-fetch call and generating
// "Can not make cross-origin requests from verifiedFetch" errors in tests.
// This is because our test suite uses absolute URLs for this endpoint
// and a global `node-fetch` module to mock the `fetch` API complains
// about relative URLs being provided to it.
jest.mock('../../../client/api/memex/api-update-memex')

describe('useUpdateMemexTitle', () => {
  it('calls updateMemex and applies the result to the client state', async () => {
    const updatedTitle = 'an updated title'

    const updateMemex = stubResolvedApiResponse(apiUpdateMemex, {memexProject: {...DefaultMemex, title: updatedTitle}})

    const setProject = stubSetProject()

    const {result} = renderHook(useUpdateMemexTitle, existingProjectOptions({}, {setProject}))

    await act(async () => {
      await result.current.updateTitle(updatedTitle)
    })

    expect(updateMemex).toHaveBeenCalledWith({title: updatedTitle})

    expect(setProject).toHaveBeenCalledTimes(1)
    expect(setProject).toHaveBeenCalledWith(expect.objectContaining({title: updatedTitle}))
  })

  it('using an empty string or whitespace for title is ignored', async () => {
    const updateMemex = stubRejectedApiResponse(apiUpdateMemex, new Error('fail on update'))

    const setProject = stubSetProject()

    const {result} = renderHook(useUpdateMemexTitle, existingProjectOptions({}, {setProject}))

    await act(async () => {
      await result.current.updateTitle('')
    })

    expect(updateMemex).not.toHaveBeenCalled()
    expect(setProject).not.toHaveBeenCalled()

    await act(async () => {
      await result.current.updateTitle('    ')
    })

    expect(updateMemex).not.toHaveBeenCalled()
    expect(setProject).not.toHaveBeenCalled()
  })

  it('title is correctly trimmed', async () => {
    const updatedTitle = 'an updated title'

    const updateMemex = stubResolvedApiResponse(apiUpdateMemex, {memexProject: {...DefaultMemex, title: updatedTitle}})

    const setProject = stubSetProject()

    const {result} = renderHook(useUpdateMemexTitle, existingProjectOptions({}, {setProject}))

    await act(async () => {
      await result.current.updateTitle(`      ${updatedTitle}  `)
    })

    expect(setProject).toHaveBeenCalledTimes(1)
    expect(setProject).toHaveBeenCalledWith(expect.objectContaining({title: updatedTitle}))
    expect(updateMemex).toHaveBeenCalledWith({title: updatedTitle})
  })
})
