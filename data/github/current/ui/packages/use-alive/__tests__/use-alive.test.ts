import {connectAliveSubscription} from '@github-ui/alive/connect-alive-subscription'
import {renderHook, waitFor} from '@testing-library/react'
import {AliveTestProvider, signChannel, useTestSubscribeToAlive} from '../TestAliveSubscription'
import {useAlive} from '../use-alive'

const channel = 'channel-name'
const signedChannel = signChannel(channel)
const callback = jest.fn()

jest.mock('@github-ui/alive', () => ({
  getSession: jest.fn().mockReturnValue('FAKE_SESSION'),
}))

jest.mock('@github-ui/alive/connect-alive-subscription', () => ({
  connectAliveSubscription: jest.fn(),
}))
const mockedConnectAliveSubscription = jest.mocked(connectAliveSubscription)

jest.mock('../TestAliveSubscription', () => {
  const actual = jest.requireActual('../TestAliveSubscription')
  return {
    ...actual,
    useTestSubscribeToAlive: jest.fn().mockReturnValue(null),
  }
})
const mockUseTestSubscribeToAlive = jest.mocked(useTestSubscribeToAlive)

describe('useAlive', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should subscribe to alive', async () => {
    renderHook(() => useAlive(signedChannel, callback))

    await waitFor(() => expect(mockedConnectAliveSubscription).toHaveBeenCalledTimes(1))
    expect(mockedConnectAliveSubscription).toHaveBeenCalledWith('FAKE_SESSION', signedChannel, callback)
  })

  it('should use test / mock alive mode', async () => {
    const mockTestSubscribeToAlive = jest.fn()
    mockUseTestSubscribeToAlive.mockReturnValueOnce(mockTestSubscribeToAlive)

    renderHook(() => useAlive(signedChannel, callback), {wrapper: AliveTestProvider})

    await waitFor(() => expect(mockedConnectAliveSubscription).not.toHaveBeenCalled())
    await waitFor(() => expect(mockUseTestSubscribeToAlive).toHaveBeenCalledTimes(1))
    expect(mockTestSubscribeToAlive).toHaveBeenCalledWith(signedChannel, callback)
  })
})
