import {act, renderHook} from '@testing-library/react'

import {apiUpdateMemex} from '../../../client/api/memex/api-update-memex'
import {useUpdateMemexDescription} from '../../../client/state-providers/memex/use-update-memex-description'
import {DefaultMemex} from '../../../mocks/data/memexes'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {existingProjectOptions, stubSetProject} from './helpers'

// Mocking this module to avoid the verified-fetch call and generating
// "Can not make cross-origin requests from verifiedFetch" errors in tests.
// This is because our test suite uses absolute URLs for this endpoint
// and a global `node-fetch` module to mock the `fetch` API complains
// about relative URLs being provided to it.
jest.mock('../../../client/api/memex/api-update-memex')

describe('useUpdateMemexDescription', () => {
  it('calls updateMemex and applies the result to the client state', async () => {
    const updatedDescription = 'an updated title'

    const updateMemex = stubResolvedApiResponse(apiUpdateMemex, {
      memexProject: {...DefaultMemex, description: updatedDescription},
    })

    const setProject = stubSetProject()

    const {result} = renderHook(useUpdateMemexDescription, existingProjectOptions({}, {setProject}))

    await act(async () => {
      await result.current.updateDescription(updatedDescription)
    })

    expect(updateMemex).toHaveBeenCalledWith({description: updatedDescription})

    expect(setProject).toHaveBeenCalledTimes(1)
    expect(setProject).toHaveBeenCalledWith(expect.objectContaining({description: updatedDescription}))
  })

  it('an empty string or whitespace can be used to clear an existing description', async () => {
    const emptyDescription = ''

    const updateMemex = stubResolvedApiResponse(apiUpdateMemex, {
      memexProject: {...DefaultMemex, description: emptyDescription},
    })

    const setProject = stubSetProject()

    const {result} = renderHook(
      useUpdateMemexDescription,
      existingProjectOptions({description: 'some description'}, {setProject}),
    )

    await act(async () => {
      await result.current.updateDescription(emptyDescription)
    })

    expect(updateMemex).toHaveBeenCalledWith({description: emptyDescription})

    expect(setProject).toHaveBeenCalledTimes(1)
    expect(setProject).toHaveBeenCalledWith(expect.objectContaining({description: emptyDescription}))

    await act(async () => {
      await result.current.updateDescription(`${emptyDescription}    `)
    })

    expect(updateMemex).toHaveBeenCalledWith({description: emptyDescription})

    expect(setProject).toHaveBeenCalledTimes(2)
    expect(setProject).toHaveBeenCalledWith(expect.objectContaining({description: emptyDescription}))
  })
})
