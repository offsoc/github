const MESSAGE_DELIMITER = '\n\n'
const MESSAGE_REGEXP = /^data:\s+/

export type ChatCompletionChunk = {
  choices: Array<{
    delta?: {
      content: string
    }
  }>
}

type Reader = ReadableStreamDefaultReader<Uint8Array>

export class MessageStreamer {
  reader: Reader

  constructor(reader: Reader) {
    this.reader = reader
  }

  async *stream(): AsyncIterable<ChatCompletionChunk> {
    const utf8Decoder = new TextDecoder('utf-8')

    let partialMessage = ''

    for (;;) {
      let value
      let done
      try {
        ;({value, done} = await this.reader.read())
      } catch (err) {
        throw err
      }

      if (done) break

      // Keep track of partial messages in between stream chunks.
      partialMessage += utf8Decoder.decode(value)

      for (;;) {
        // If we get a DONE chunk, we can exit early.
        if (partialMessage.startsWith('data: [DONE]')) return

        // Find the end of the first message. If there isn't one we need to get the next chunk in the stream.
        const messageEnd = partialMessage.indexOf(MESSAGE_DELIMITER)
        if (messageEnd === -1) break

        const rawMessage = partialMessage.slice(0, messageEnd).replace(MESSAGE_REGEXP, '')
        // Empty chunk, nothing to do.
        if (rawMessage === '') {
          // Move to the next potential message in this chunk.
          partialMessage = partialMessage.slice(messageEnd + MESSAGE_DELIMITER.length)
          continue
        }
        const parsedMessage: ChatCompletionChunk = JSON.parse(rawMessage)

        yield parsedMessage

        // Move to the next potential message in this chunk.
        partialMessage = partialMessage.slice(messageEnd + MESSAGE_DELIMITER.length)
      }
    }
  }

  async stop() {
    return this.reader.cancel()
  }
}
