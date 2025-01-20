import {render, waitFor} from '@testing-library/react'
import type {PropsWithChildren} from 'react'
import {AliveTestProvider, dispatchAliveTestMessage, signChannel} from '../TestAliveSubscription'
import {useAlive} from '../use-alive'

const channel = 'some-channel'
const signedChannel = signChannel(channel)
const callback = jest.fn()

function TestComponent() {
  useAlive(signedChannel, callback)
  return null
}

describe('test-utils', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('AliveTestProvider and dispatchAliveTestMessage', () => {
    it('throws an error if the test context is not present when calling dispatchAliveTestMessage', async () => {
      expect(() => dispatchAliveTestMessage(channel, 'test message')).toThrow(
        'Test helper `dispatchAliveTestMessage` called outside `AliveTestProvider`. Please wrap your component under test in `AliveTestProvider` from "@github-ui/use-alive/test-utils".',
      )
    })

    it('calls subscribers when within test context', async () => {
      render(<TestComponent />, {wrapper: AliveTestProvider})

      // we need to wait for async imports etc. to resolve
      await waitFor(() => expect(() => dispatchAliveTestMessage(channel, 'test message')).not.toThrow())
      expect(callback).toHaveBeenCalledWith('test message')
    })

    it('renders with initial messages', async () => {
      function WrapperWithInitialMessages({children}: PropsWithChildren) {
        return <AliveTestProvider initialMessages={[[channel, 'initial message']]}>{children}</AliveTestProvider>
      }

      render(<TestComponent />, {wrapper: WrapperWithInitialMessages})

      await waitFor(() => expect(callback).toHaveBeenCalledWith('initial message'))

      expect(() => dispatchAliveTestMessage(channel, 'next message')).not.toThrow()
      expect(callback).toHaveBeenCalledWith('next message')
    })
  })

  describe('signChannel', () => {
    it('returns a signed channel', () => {
      const [channelData, signature] = signedChannel.split('--')

      expect(JSON.parse(atob(channelData!))).toEqual({
        c: channel,
        t: 1234567890,
      })
      expect(signature).toEqual('SIGNATURE')
    })

    it('allows passing a timestamp and signature', () => {
      const timedChannel = signChannel('time-channel', 123, 'FAKE SIGNATURE')
      const [channelData, signature] = timedChannel.split('--')

      expect(JSON.parse(atob(channelData!))).toEqual({
        c: 'time-channel',
        t: 123,
      })
      expect(signature).toEqual('FAKE SIGNATURE')
    })
  })
})
