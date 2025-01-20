require "json"
require "fileutils"

module Hydro
  class Client
    # Build a Hydro::Client.
    #
    # environment - The Symbol :development, :test, :production, or :ghes.
    def initialize(environment: nil)
      @defaults = case environment.to_s
                  when "development" then Defaults::Development
                  when "production" then Defaults::Production
                  when "test" then Defaults::Test
                  when "ghes" then Defaults::GHES
                  else Defaults::Null.new(environment)
                  end
    end

    # Public: Build a Hydro::Publisher.
    #
    # sink      - Optional Hydro::Sink to which messages will be written.
    #             Defaults to the default sink for the environment:
    #             :development - Hydro::KafkaSink when the `seed_brokers`
    #                            option is present, otherwise a
    #                            Hydro::FileSink.
    #             :test        - A Hydro::MemorySink.
    #             :production  - A Hydro::KafkaSink.
    # encoder   - Optional Hydro::Encoder used to encode messages. Defaults to
    #             the protobuf encoder.
    # site      - Optional String site of origin.
    # topic_format_options - Optional default topic format options to use for publishing.
    # default_headers_proc - Optional proc that returns a hash (string keys and values) that will be set
    #                        as headers on all published messages
    # options              - Optional Hash passed along to the default Hydro::Sink.
    #                        :client_id - Required in production for Hydro::KafkaSink.
    #
    # Example:
    #
    #   client = Hydro::Client.new(environment: :production)
    #
    #   # Use defaults
    #   publisher = client.publisher({
    #     client_id: "my-hydro-publisher",
    #   })
    #
    #   # Mostly use defaults
    #   publisher = client.publisher({
    #     client_id: "my-hydro-publisher",
    #     seed_brokers: ["localhost:9092"]
    #   })
    #
    #   # Override the sink and site
    #   publisher = client.publisher({
    #     client_id: "my-hydro-publisher",
    #     sink: Hydro::MemorySink.new,
    #     site: "sdc42-sea",
    #   })
    #
    #   # Provide Kafka client SSL configuration. See: https://github.com/zendesk/ruby-kafka#setting-up-the-kafka-client
    #   sink = Hydro::KafkaSink.new({
    #     seed_brokers: ["hudson-1:9093", "hudson-2:9093"],
    #     client_id: "my-hydro-publisher",
    #     client_options: {ssl_ca_cert: File.read('/etc/ssl/cert.pem')},
    #     async: false,
    #   })
    #   publisher = client.publisher(sink: sink)
    #
    # Returns a Hydro::Publisher.
    def publisher(sink: nil, encoder: nil, site: nil, topic_format_options: nil, default_headers_proc: nil, **options)
      Hydro::Publisher.new(
        sink: sink || defaults.sink(**options),
        encoder: encoder || defaults.encoder(site),
        site: site,
        topic_format_options: Hydro::Topic::DEFAULT_FORMAT_OPTIONS.merge(topic_format_options || {}),
        default_headers_proc: default_headers_proc,
      )
    end

    # Public: Run a Hydro::Processor.
    # processor - Required Hydro::Processor instance.
    # consumer  - Optional Hydro::Consumer. Defaults to the default consumer for
    #             the environment.
    # options   - Optional Hash passed to the Hydro::Executor.
    #
    # Examples:
    #
    #   client = Hydro::Client.new(environment: :production)
    #   processor = MyHydroProcessor.new
    #   client.run(processor)
    #
    # Runs until the process receives a SIGINT.
    def run(processor, consumer: nil, **options)
      consumer ||= consumer(**processor.options)

      Executor.new(processor: processor, consumer: consumer, **options).run
    end

    # Public: Build a Hydro::Consumer.
    #
    # decoder - Optional Hydro::Decoder used to decode messages. Defaults to
    #           the protobuf decoder.
    # source  - Optional Hydro::Source from which to read messages. Defaults to
    #           the default source for the environment:
    #           :development - Hydro::KafkaSource when the `seed_brokers` option
    #                          is present, otherwise a Hydro::FileSource.
    #           :test        - A Hydro::MemorySource.
    #           :production  - A Hydro::KafkaSource.
    # deliver_tombstone_messages - Optional boolean to allow the delivery of tombstone messages.
    #           Defaults to false.
    # options - Optional Hash passed along to the default Hydro::Source.
    #           :subscribe_to - String, Regexp, Array<String> or Array<Regexp>.
    #                           Required in production for Hydro::KafkaSource.
    #           :group_id     - Required in production for Hydro::KafkaSource.
    # Example:
    #
    #   client = Hydro::Client.new(environment: :production)
    #
    #   # Use defaults
    #   consumer = client.consumer({
    #     group_id: "my-hydro-consumer",
    #     subscribe_to: ["my-topic"],
    #   })
    #
    #   # Mostly defaults
    #   consumer = client.consumer({
    #     group_id: "my-hydro-consumer",
    #     subscribe_to: /*.my-topic/,
    #     seed_brokers: ["localhost:9092"],
    #     commit_offsets: false,
    #   })
    #
    #   # Override the source
    #   sink = Hydro::MemorySink.new
    #   client.consumer({
    #     source: Hydro::MemorySource.new(sink: sink),
    #   })
    #
    #   client.consumer({
    #     # options passed through to the source
    #   })
    #
    # Returns a Hydro::Consumer.
    def consumer(decoder: nil, source: nil, decode_failure_handler: nil, deliver_tombstone_messages: false, **options)
      Hydro::Consumer.new(
        decoder: decoder || defaults.decoder,
        decode_failure_handler: decode_failure_handler,
        deliver_tombstone_messages: deliver_tombstone_messages,
        source: source || defaults.source(**options)
      )
    end

    private

    attr_reader :defaults

    module Defaults
      module Basic
        def sink(**options)
          @sink ||= Hydro::MemorySink.new
        end

        def source(**options)
          Hydro::MemorySource.new(**{ sink: sink }.merge(options))
        end

        def encoder(site)
          Hydro::ProtobufEncoder.new(site)
        end

        def decoder
          Hydro::Decoding::ProtobufDecoder.new
        end

        extend self
      end

      module Test
        extend Basic
      end

      module Development
        extend Basic

        FILENAME = "tmp/hydro-messages"

        def sink(**options)
          if options[:seed_brokers]
            Hydro::KafkaSink.new(**options)
          else
            log_sink = Hydro::LogSink.protobuf_as_json(*options[:logger])

            filename = options[:filename] || FILENAME
            FileUtils.touch(filename)
            File.truncate(filename, 0)

            file_sink = Hydro::FileSink.new(filename: filename)

            Hydro::Sink.tee(file_sink, log_sink)
          end
        end

        def source(**options)
          if options[:seed_brokers]
            Hydro::KafkaSource.new(**options)
          else
            filename = options[:filename] || FILENAME
            FileUtils.touch(filename)

            Hydro::FileSource.new(filename: filename)
          end
        end

        extend self
      end

      module Production
        extend Basic

        BROKERS = %w{
          hydro-kafka-potomac.service.ac4-iad.consul:9093
          hydro-kafka-potomac.service.ash1-iad.consul:9093
          hydro-kafka-potomac.service.va3-iad.consul:9093
        }

        SSL_CERT = "/etc/ssl/certs/cp1-iad-production-1487801205-root.pem"

        def sink(client_id:, **options)
          Hydro::KafkaSink.new(
            seed_brokers: options.fetch("seed_brokers", BROKERS),
            client_id: client_id,
            client_options: {
              ssl_ca_cert_file_path: SSL_CERT,
            },
            **options
          )
        end

        def source(subscribe_to:, **options)
          Hydro::KafkaSource.new(
            seed_brokers: options.fetch("seed_brokers", BROKERS),
            subscribe_to: subscribe_to,
            ssl_ca_cert_file_path: SSL_CERT,
            **options
          )
        end

        extend self
      end

      module GHES
        extend Basic

        BROKERS = %w{
          localhost:9092
        }

        def sink(client_id:, **options)
          Hydro::KafkaSink.new(
            seed_brokers: BROKERS,
            client_id: client_id,
            **options
          )
        end

        def source(subscribe_to:, **options)
          Hydro::KafkaSource.new(
            seed_brokers: BROKERS,
            subscribe_to: subscribe_to,
            **options
          )
        end

        extend self
      end

      class Null
        def initialize(env)
          @env = env
        end

        [:sink, :source, :encoder, :decoder].each do |method|
          define_method method do |*args|
            raise ArgumentError.new("No default #{method} for '#{@env}' environment")
          end
        end
      end
    end
  end
end
