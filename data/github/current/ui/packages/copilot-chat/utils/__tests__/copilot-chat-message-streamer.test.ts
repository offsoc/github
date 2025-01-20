import {MockReader} from '../../test-utils/mock-reader'
import {CopilotChatMessageStreamer, CopilotStreamingError} from '../copilot-chat-message-streamer'
import type {MessageStreamingResponse, MessageStreamingResponseContent} from '../copilot-chat-types'

describe('CopilotChatMessageStreamer', () => {
  function setupStreamer(chunks: MessageStreamingResponse[]) {
    const reader = new MockReader(chunks)
    const streamer = new CopilotChatMessageStreamer(reader)

    return streamer
  }

  it('streams an empty stream', async () => {
    const streamer = setupStreamer([])
    const result = []

    for await (const chunk of streamer.stream()) {
      result.push(chunk)
    }

    expect(result).toHaveLength(0)
  })

  it('streams a chunk', async () => {
    const streamer = setupStreamer([{type: 'content', body: '🌞'}])
    const result = []

    for await (const chunk of streamer.stream()) {
      result.push(chunk)
    }

    expect(result).toHaveLength(1)

    const response = result[0] as MessageStreamingResponseContent

    expect(response.body).toBe('🌞')
  })

  it('stops on a complete chunk', async () => {
    const streamer = setupStreamer([
      {type: 'content', body: ''},
      {type: 'complete', id: '', turnID: '', createdAt: '', intent: '', references: null},
      {type: 'content', body: 'oh no'},
    ])
    const result = []

    for await (const chunk of streamer.stream()) {
      result.push(chunk)
    }

    expect(result).toHaveLength(2)

    expect(result[0]?.type).toBe('content')
    expect(result[1]?.type).toBe('complete')
  })

  class MockReaderError extends MockReader {
    override read(): Promise<ReadableStreamReadResult<Uint8Array>> {
      throw new Error('NETWORK_CONNECTION_INTERRUPTED')
    }
  }

  it('throws an error on an network error', async () => {
    const chunks: MessageStreamingResponse[] = [
      {type: 'content', body: ''},
      {type: 'complete', id: '', turnID: '', createdAt: '', intent: '', references: null},
      {type: 'content', body: 'oh no'},
    ]

    const reader = new MockReaderError(chunks)
    const streamer = new CopilotChatMessageStreamer(reader)

    const result: MessageStreamingResponse[] = []

    await expect(async () => {
      for await (const chunk of streamer.stream()) {
        result.push(chunk)
      }
    }).rejects.toThrow(CopilotStreamingError)
  })

  it('allows a stream to be stopped', async () => {
    const streamer = setupStreamer([
      {type: 'content', body: 'cool'},
      {type: 'content', body: 'still cool'},
      {type: 'content', body: 'YA DUN GOOFED'},
    ])
    const result = []
    let remaining = 2

    for await (const chunk of streamer.stream()) {
      result.push(chunk)

      remaining -= 1

      if (remaining === 0) {
        await streamer.stop()
      }
    }

    expect(result).toHaveLength(2)

    const last = result.pop() as MessageStreamingResponseContent

    expect(last.body).not.toBe('YA DUN GOOFED')
  })
})
