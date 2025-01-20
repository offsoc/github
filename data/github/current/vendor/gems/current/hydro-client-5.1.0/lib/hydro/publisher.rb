module Hydro
  class Publisher

    # Triggered whenever a message is published.
    PUBLISH_EVENT = "publish.publisher.hydro"

    # Triggered whenever a message is encoded.
    ENCODE_EVENT = "encode.publisher.hydro"

    attr_reader :sink, :default_topic_format_options

    # Public: Create a new publisher for publishing messages to Hydro.
    #
    # sink                 - Required Sink instance to use.
    # encoder              - Optional default Encoder for the publisher.
    # site                 - Optional site of origin used by encoding.
    # topic_format_options - Optional default topic format options.
    # verification_secrets_mapping - Optional Hash that maps topic names to secrets and secret labels
    #                                Expected format: { "fully qualified topic name" => { secret: "the secret", label: "the label" } }
    # default_headers_proc - Optional proc that returns a hash (string keys and values) that will be set
    #                        as headers on all published messages
    def initialize(
      sink:,
      encoder: nil,
      site: nil,
      topic_format_options: nil,
      verification_secrets_mapping: {},
      default_headers_proc: nil
    )
      @sink = sink
      @default_encoder = encoder || Hydro::ProtobufEncoder.new(site)
      @default_topic_format_options = Hydro::Topic::DEFAULT_FORMAT_OPTIONS.merge(topic_format_options || {})
      @verification_secrets_mapping = verification_secrets_mapping
      @default_headers_proc = default_headers_proc
    end

    # Public: publish a message. If the publisher is in batch mode, the message
    # is enqueued to the batch. Otherwise the message is written to the sink.
    #
    # message - Required message contents. The expected type depends on the
    #           capabilities of the encoder implementation.
    #
    # Options
    #   schema                    - Required String message schema name.
    #   topic                     - Optional String name of the topic
    #   key                       - Optional message key.
    #   partition_key             - Optional partition key.
    #   partition                 - Optional destination topic partition.
    #   timestamp                 - Optional Numeric UNIX timestamp.
    #   compress                  - Optional Boolean to enable compression (if supported by the sink).
    #   encoder                   - Optional encoder used to encode the message.
    #   headers                   - Optional Hash (string keys and values) headers that will be sent along with the message
    #   verification_secret_label - Optional String used to indentify secret when verifing
    #                               signature - will override producer level setting (must be
    #                               specified if verification_secret is specified)
    #   verification_secret       - Optional String secret used to generate verification signature
    #                               - will override producer level setting (must be specified if
    #                               verification_secret_label is specified)
    #   topic_format_options      - Optional topic format options to override defaults set during initialization.
    def publish(
      message,
      schema:, encoder: default_encoder, headers: {},
      topic: nil, key: nil, partition: nil, partition_key: nil, timestamp: nil, compress: false,
      verification_secret_label: nil, verification_secret: nil,
      topic_format_options: nil
    )
      topic_format_options = default_topic_format_options.merge(topic_format_options || {})
      topic = Hydro::Topic.format(name: topic || schema, **topic_format_options)

      verification_secret_label ||= verification_secrets_mapping.dig(topic, :label)
      verification_secret ||= verification_secrets_mapping.dig(topic, :secret)

      if verification_secret_label.nil? ^ verification_secret.nil?
        raise ArgumentError.new("Both verification_secret_label and verification_secret must be specified if either one of them is specified")
      end

      timestamp ||= Time.now.to_f

      Hydro.instrumenter.instrument(PUBLISH_EVENT, schema: schema, topic: topic) do
        encoded = encode(message,
          schema: schema,
          encoder: encoder,
          timestamp: timestamp
        )

        verification_headers = build_verification_headers(
          secret: verification_secret,
          label: verification_secret_label,
          data: encoded
        )

        default_headers = default_headers_proc ? default_headers_proc.call : {}

        message = Message.new(
          key: key,
          data: encoded,
          schema: schema,
          topic: topic,
          partition: partition,
          partition_key: partition_key,
          timestamp: timestamp,
          headers: default_headers.merge(**headers, **verification_headers),
          compress: compress,
        )

        @sink.write([message])
      end
    end

    # Public: batch published events for the duration of the block.
    #
    # Yields the publisher to the given block. If the sink supports batching, a
    # batch is started before the block and flushed after it returns.
    def batch(&block)
      start_batch
      yield self
    ensure
      flush_batch
    end

    # Public: start batching published messages.
    #
    # No-op if the sink doesn't support batching.
    def start_batch
      @sink.start_batch if @sink.batchable?
    end

    # Public: flush a batch of messages and return to single-message mode.
    #
    # No-op if the sink doesn't support batching.
    def flush_batch
      @sink.flush_batch if @sink.batchable?
    end

    # Public: close down the sink and clean up.
    def close
      @sink.close
    end

    # Internal: encode a message.
    #
    # message - Required message contents. The expected type depends on the
    #           capabilities of the encoder implementation.
    #
    # Options
    #   schema    - Required String message schema name.
    #   encoder   - Required Hydro::Encoder to use when encoding.
    #   timestamp - Optional Numeric UNIX message timestamp.
    #
    # Returns a Hydro::Message populated with the encoded message and its topic,
    # partition, key, and timestamp. Raises EncodingError if the message cannot
    # be encoded.
    def encode(message, schema:, encoder:, timestamp: nil)
      Hydro.instrumenter.instrument(ENCODE_EVENT, schema: schema) do
        if encoder
          encoder.encode(message, schema: schema, timestamp: timestamp)
        else
          raise NoEncoderError.new(schema: schema)
        end
      end
    end

    private

    attr_reader :default_encoder, :verification_secrets_mapping, :default_headers_proc

    def build_verification_headers(secret:, label:, data:)
      return {} if secret.nil?

      {
        verification_signature: OpenSSL::HMAC.hexdigest("SHA256", secret, data),
        verification_secret_label: label,
      }
    end
  end
end
