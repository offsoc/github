import {act, renderHook} from '@testing-library/react'

import {apiUpdateMemex} from '../../../client/api/memex/api-update-memex'
import {useUpdateMemexIsTemplate} from '../../../client/state-providers/memex/use-update-memex-is-template'
import {DefaultMemex} from '../../../mocks/data/memexes'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {createWrapperWithContexts} from '../../wrapper-utils'
import {projectStateContext, setProjectContext, stubSetProject} from './helpers'

// Mocking this module to avoid the verified-fetch call and generating
// "Can not make cross-origin requests from verifiedFetch" errors in tests.
// This is because our test suite uses absolute URLs for this endpoint
// and a global `node-fetch` module to mock the `fetch` API complains
// about relative URLs being provided to it.
jest.mock('../../../client/api/memex/api-update-memex')

describe('useUpdateMemexIsTemplate', () => {
  it('calls updateIsTemplate and applies the result to the client state', async () => {
    const setProject = stubSetProject()

    const stubUpdateFn = stubResolvedApiResponse(apiUpdateMemex, {memexProject: {...DefaultMemex, isTemplate: true}})

    const {result} = renderHook(useUpdateMemexIsTemplate, {
      wrapper: createWrapperWithContexts({
        SetProject: setProjectContext({setProject}),
        ProjectState: projectStateContext(),
      }),
    })

    await act(async () => {
      await result.current.updateIsTemplate(true)
    })

    expect(stubUpdateFn).toHaveBeenCalledWith({isTemplate: true})
    expect(setProject).toHaveBeenCalledTimes(1)
    expect(setProject).toHaveBeenCalledWith(expect.objectContaining({isTemplate: true}))
  })
})
