import type {MessageStreamingResponse, MessageStreamingResponseError} from './copilot-chat-types'

const MESSAGE_DELIMITER = '\n\n'
const MESSAGE_REGEXP = /^data:\s+/

export class CopilotStreamingError extends Error {
  error: MessageStreamingResponseError

  constructor(error: MessageStreamingResponseError) {
    super(error.description)
    this.error = error
  }
}

type Reader = ReadableStreamDefaultReader<Uint8Array>

export class CopilotChatMessageStreamer {
  reader: Reader

  constructor(reader: Reader) {
    this.reader = reader
  }

  async *stream(): AsyncIterable<MessageStreamingResponse> {
    const utf8Decoder = new TextDecoder('utf-8')

    let partialMessage = ''

    for (;;) {
      let value
      let done
      try {
        ;({value, done} = await this.reader.read())
      } catch (e) {
        const error: MessageStreamingResponseError = {
          type: 'error',
          errorType: 'networkError',
          description: 'NETWORK_CONNECTION_INTERRUPTED',
        }

        throw new CopilotStreamingError(error)
      }

      if (done) break

      // Keep track of partial messages in between stream chunks.
      partialMessage += utf8Decoder.decode(value)

      for (;;) {
        // Find the end of the first message. If there isn't one we need to get the next chunk in the stream.
        const messageEnd = partialMessage.indexOf(MESSAGE_DELIMITER)
        if (messageEnd === -1) break

        const rawMessage = partialMessage.slice(0, messageEnd).replace(MESSAGE_REGEXP, '')
        const parsedMessage: MessageStreamingResponse = JSON.parse(rawMessage)

        yield parsedMessage

        // If we get a complete or error message, then we know we are done and can exit early.
        if (parsedMessage.type === 'complete') return

        // Move to the next potential message in this chunk.
        partialMessage = partialMessage.slice(messageEnd + MESSAGE_DELIMITER.length)
      }
    }
  }

  async stop() {
    return this.reader.cancel()
  }
}
