import {act, renderHook} from '@testing-library/react'

import {apiUpdateMemex} from '../../../client/api/memex/api-update-memex'
import {useUpdateMemexShortDescription} from '../../../client/state-providers/memex/use-update-memex-short-description'
import {DefaultMemex} from '../../../mocks/data/memexes'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {existingProjectOptions, stubSetProject} from './helpers'

// Mocking this module to avoid the verified-fetch call and generating
// "Can not make cross-origin requests from verifiedFetch" errors in tests.
// This is because our test suite uses absolute URLs for this endpoint
// and a global `node-fetch` module to mock the `fetch` API complains
// about relative URLs being provided to it.
jest.mock('../../../client/api/memex/api-update-memex')

describe('useUpdateMemexShortDescription', () => {
  it('calls updateMemex and applies the result to the client state', async () => {
    const updatedShortDescription = 'an updated short description'

    const stubUpdateFn = stubResolvedApiResponse(apiUpdateMemex, {
      memexProject: {...DefaultMemex, shortDescription: updatedShortDescription},
    })

    const setProject = stubSetProject()

    const {result} = renderHook(useUpdateMemexShortDescription, existingProjectOptions({}, {setProject}))

    await act(async () => {
      await result.current.updateShortDescription(updatedShortDescription)
    })

    expect(stubUpdateFn).toHaveBeenCalledWith(expect.objectContaining({shortDescription: updatedShortDescription}))

    expect(setProject).toHaveBeenCalledTimes(1)
    expect(setProject).toHaveBeenCalledWith(expect.objectContaining({shortDescription: updatedShortDescription}))
  })

  it('an empty string or whitespace can be used to clear an existing short description', async () => {
    const emptyDescription = ''

    const stubUpdateFn = stubResolvedApiResponse(apiUpdateMemex, {
      memexProject: {...DefaultMemex, shortDescription: emptyDescription},
    })

    const setProject = stubSetProject()

    const {result} = renderHook(
      useUpdateMemexShortDescription,
      existingProjectOptions({shortDescription: 'some description'}, {setProject}),
    )

    await act(async () => {
      await result.current.updateShortDescription('')
    })
    expect(stubUpdateFn).toHaveBeenCalledWith({shortDescription: emptyDescription})

    expect(setProject).toHaveBeenCalledTimes(1)
    expect(setProject).toHaveBeenCalledWith(expect.objectContaining({shortDescription: emptyDescription}))

    await act(async () => {
      await result.current.updateShortDescription(`${emptyDescription}    `)
    })

    expect(stubUpdateFn).toHaveBeenCalledWith({shortDescription: emptyDescription})

    expect(setProject).toHaveBeenCalledTimes(2)
    expect(setProject).toHaveBeenCalledWith(expect.objectContaining({shortDescription: emptyDescription}))
  })
})
