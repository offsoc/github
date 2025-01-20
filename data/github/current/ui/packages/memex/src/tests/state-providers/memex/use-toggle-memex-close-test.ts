import {act, renderHook} from '@testing-library/react'

import {apiUpdateMemex} from '../../../client/api/memex/api-update-memex'
import {useToggleMemexClose} from '../../../client/state-providers/memex/use-toggle-memex-close'
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

describe('useToggleMemexClose', () => {
  it('calls through to updateMemex API and applies change to client state', async () => {
    const setProject = stubSetProject()

    const updateMemex = stubResolvedApiResponse(apiUpdateMemex, {
      memexProject: {...DefaultMemex, closedAt: 'some-string-value'},
    })

    const {result} = renderHook(useToggleMemexClose, {
      wrapper: createWrapperWithContexts({
        SetProject: setProjectContext({setProject}),
        ProjectDetails: defaultProjectDetails(),
      }),
    })

    await act(async () => {
      await result.current.toggleMemexClose(true)
    })

    expect(updateMemex).toHaveBeenCalledWith({closed: true})

    expect(setProject).toHaveBeenCalledTimes(1)
    expect(setProject).toHaveBeenCalledWith(expect.objectContaining({closedAt: 'some-string-value'}))
  })
})
