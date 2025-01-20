import type {MessageStreamingResponse} from '../utils/copilot-chat-types'

export class MockReader {
  chunks: MessageStreamingResponse[]
  encoder: TextEncoder

  constructor(chunks: MessageStreamingResponse[]) {
    this.chunks = chunks
    this.encoder = new TextEncoder()
  }

  read() {
    let result: ReadableStreamReadResult<Uint8Array>

    if (this.chunks.length) {
      const chunk = this.chunks.shift()
      const data = `data: ${JSON.stringify(chunk)}\n\n`

      result = {
        value: this.encoder.encode(data),
        done: false,
      }
    } else {
      result = {
        done: true,
      }
    }

    return Promise.resolve(result)
  }

  releaseLock() {}
  close() {}
  cancel() {
    this.chunks = []
    return Promise.resolve(undefined)
  }

  get closed() {
    return Promise.resolve(undefined)
  }
}
