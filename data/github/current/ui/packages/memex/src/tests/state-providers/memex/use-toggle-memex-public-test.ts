import {act, renderHook} from '@testing-library/react'

import {apiUpdateMemex} from '../../../client/api/memex/api-update-memex'
import {useToggleMemexPublic} from '../../../client/state-providers/memex/use-toggle-memex-public'
import {DefaultMemex} from '../../../mocks/data/memexes'
import {stubResolvedApiResponse} from '../../mocks/api/memex'
import {createWrapperWithContexts} from '../../wrapper-utils'
import {defaultProjectDetails, setProjectContext, stubSetProject} from './helpers'

// Mocking this module to avoid the verified-fetch call and generating
// "Can not make cross-origin requests from verifiedFetch" errors in tests.
// This is because our test suite uses absolute URLs for this endpoint
// and a global `node-fetch` module to mock the `fetch` API complains
// about relative URLs being provided to it.
jest.mock('../../../client/api/memex/api-update-memex')

describe('useToggleMemexPublic', () => {
  it('calls through to MemexStore and applies change to client state', async () => {
    const setProject = stubSetProject()

    const stubUpdateFn = stubResolvedApiResponse(apiUpdateMemex, {memexProject: {...DefaultMemex, public: true}})

    const {result} = renderHook(useToggleMemexPublic, {
      wrapper: createWrapperWithContexts({
        SetProject: setProjectContext({setProject}),
        ProjectDetails: defaultProjectDetails(),
      }),
    })

    await act(async () => {
      await result.current.toggleMemexPublic(true)
    })

    expect(stubUpdateFn).toHaveBeenCalledWith({public: true})

    expect(setProject).toHaveBeenCalledTimes(1)
    expect(setProject).toHaveBeenCalledWith(expect.objectContaining({public: true}))
  })
})
