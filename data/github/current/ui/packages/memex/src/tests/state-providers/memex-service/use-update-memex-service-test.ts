import {renderHook} from '@testing-library/react'

import type {MemexServiceData} from '../../../client/api/memex/contracts'
import useToasts, {ToastType} from '../../../client/components/toasts/use-toasts'
import {
  getMemexServiceQueryData,
  setMemexServiceQueryData,
} from '../../../client/state-providers/memex-service/query-client-api'
import {useUpdateMemexService} from '../../../client/state-providers/memex-service/use-update-memex-service'
import {Resources} from '../../../client/strings'
import {seedJSONIsland} from '../../../mocks/server/mock-server'
import {asMockHook} from '../../mocks/stub-utilities'
import {createTestQueryClient} from '../../test-app-wrapper'
import {createWrapperWithContexts} from '../../wrapper-utils'

jest.mock('../../../client/components/toasts/use-toasts')

const addToastStub = jest.fn()

asMockHook(useToasts).mockReturnValue({
  addToast: addToastStub,
})

describe('useUpdateMemexService', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('does nothing if no initial data in queryClient', () => {
    const queryClient = createTestQueryClient()

    // don't set up any initial query data

    const {result} = renderHook(useUpdateMemexService, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    result.current.updateMemexService({betaSignupBanner: 'hidden', killSwitchEnabled: true})

    const newMemexServiceQueryData = getMemexServiceQueryData(queryClient)

    expect(addToastStub).not.toHaveBeenCalled()
    expect(newMemexServiceQueryData).toBeUndefined()
  })

  it('does nothing if killSwitchEnabled stays false', () => {
    const queryClient = createTestQueryClient()

    const initialMemexServiceQueryData: MemexServiceData = {betaSignupBanner: 'hidden', killSwitchEnabled: false}
    setMemexServiceQueryData(queryClient, initialMemexServiceQueryData)

    const {result} = renderHook(useUpdateMemexService, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    result.current.updateMemexService({betaSignupBanner: 'hidden', killSwitchEnabled: false})

    const newMemexServiceQueryData = getMemexServiceQueryData(queryClient)

    expect(addToastStub).not.toHaveBeenCalled()
    expect(initialMemexServiceQueryData).toBe(newMemexServiceQueryData)
  })

  it('does nothing if killSwitchEnabled stays true', () => {
    const queryClient = createTestQueryClient()

    const initialMemexServiceQueryData: MemexServiceData = {betaSignupBanner: 'hidden', killSwitchEnabled: true}
    setMemexServiceQueryData(queryClient, initialMemexServiceQueryData)

    const {result} = renderHook(useUpdateMemexService, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    result.current.updateMemexService({betaSignupBanner: 'hidden', killSwitchEnabled: true})

    const newMemexServiceQueryData = getMemexServiceQueryData(queryClient)

    expect(addToastStub).not.toHaveBeenCalled()
    expect(initialMemexServiceQueryData).toBe(newMemexServiceQueryData)
  })

  it('updates query data and adds toast if killSwitchEnabled goes from true to false but does not set killSwitchRecentlyEnabled if PWL is enabled', () => {
    const queryClient = createTestQueryClient()
    seedJSONIsland('memex-enabled-features', ['memex_table_without_limits'])

    const initialMemexServiceQueryData: MemexServiceData = {betaSignupBanner: 'hidden', killSwitchEnabled: true}
    setMemexServiceQueryData(queryClient, initialMemexServiceQueryData)

    const {result} = renderHook(useUpdateMemexService, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    result.current.updateMemexService({betaSignupBanner: 'hidden', killSwitchEnabled: false})

    const newMemexServiceQueryData = getMemexServiceQueryData(queryClient)

    expect(addToastStub).toHaveBeenCalledTimes(1)
    expect(addToastStub).toHaveBeenCalledWith({
      type: ToastType.default,
      message: Resources.killSwitchDisabledToastMessage,
    })

    expect(newMemexServiceQueryData).not.toBe(initialMemexServiceQueryData)
    expect(newMemexServiceQueryData).toEqual({betaSignupBanner: 'hidden', killSwitchEnabled: false})
  })

  it('updates query data and adds toast if killSwitchEnabled goes from true to false sets killSwitchRecentlyDisabled: true if PWL is disabled', () => {
    const queryClient = createTestQueryClient()

    const initialMemexServiceQueryData: MemexServiceData = {betaSignupBanner: 'hidden', killSwitchEnabled: true}
    setMemexServiceQueryData(queryClient, initialMemexServiceQueryData)

    const {result} = renderHook(useUpdateMemexService, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    result.current.updateMemexService({betaSignupBanner: 'hidden', killSwitchEnabled: false})

    const newMemexServiceQueryData = getMemexServiceQueryData(queryClient)

    expect(addToastStub).toHaveBeenCalledTimes(1)
    expect(addToastStub).toHaveBeenCalledWith({
      type: ToastType.default,
      message: Resources.killSwitchDisabledToastMessage,
    })

    expect(newMemexServiceQueryData).not.toBe(initialMemexServiceQueryData)
    expect(newMemexServiceQueryData).toEqual({
      betaSignupBanner: 'hidden',
      killSwitchEnabled: false,
      killSwitchRecentlyDisabled: true,
    })
  })

  it('updates query data and adds toast if killSwitchEnabled goes from false to true', () => {
    const queryClient = createTestQueryClient()

    const initialMemexServiceQueryData: MemexServiceData = {betaSignupBanner: 'hidden', killSwitchEnabled: false}
    setMemexServiceQueryData(queryClient, initialMemexServiceQueryData)

    const {result} = renderHook(useUpdateMemexService, {
      wrapper: createWrapperWithContexts({
        QueryClient: {queryClient},
      }),
    })

    result.current.updateMemexService({betaSignupBanner: 'hidden', killSwitchEnabled: true})

    const newMemexServiceQueryData = getMemexServiceQueryData(queryClient)

    expect(addToastStub).toHaveBeenCalledTimes(1)
    expect(addToastStub).toHaveBeenCalledWith({
      type: ToastType.warning,
      message: Resources.killSwitchEnabledToastMessage,
    })

    expect(newMemexServiceQueryData).not.toBe(initialMemexServiceQueryData)
    expect(newMemexServiceQueryData).toEqual({betaSignupBanner: 'hidden', killSwitchEnabled: true})
  })
})
