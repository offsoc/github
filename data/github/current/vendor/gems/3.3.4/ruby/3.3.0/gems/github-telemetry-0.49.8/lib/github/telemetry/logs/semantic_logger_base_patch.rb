# frozen_string_literal: true

module GitHub
  module Telemetry
    module Logs
      # Extended version of the `SemanticLogger::Base` class
      # that includes additional methods such as `named_tagged`
      # and `with_named_tags`
      module SemanticLoggerBasePatch
        # Public: set a hash of named_tags for the span of the block
        #
        # hash - hash of key-value pairs to add to every log within the block
        # block - block of work to add the key value pairs to
        #
        # Example:
        # logger.named_tagged(foo: :bar) do
        #   logger.info("boo")
        #   logger.warn("baz")
        # end
        # => Severity="INFO" Body="boo" foo="bar"
        # => Severity="WARN" Body="baz" foo="bar"
        #
        def named_tagged(hash)
          block = -> { yield(self) }
          SemanticLogger.named_tagged(hash, &block)
        end

        # Public: set a hash of named_tags for the span of the block
        #
        # hash - hash of key-value pairs to add to every log within the block
        # block - block of work to add the key value pairs to
        #
        # Example:
        # logger.named_tagged(foo: :bar) do
        #   logger.info("boo")
        #   logger.warn("baz")
        # end
        # => Severity="INFO" Body="boo" foo="bar"
        # => Severity="WARN" Body="baz" foo="bar"
        #
        alias with_named_tags named_tagged
      end

      # Extended version of the `SemanticLogger::Logger` class
      # that includes additional mthods such as `async!`
      module SemanticLoggerLoggerPatch
        def async!
          @mutex ||= Mutex.new
          @mutex.synchronize do
            @processor = SemanticLogger::Processor.new
          end
        end
      end
    end
  end
end

SemanticLogger::Base.prepend(GitHub::Telemetry::Logs::SemanticLoggerBasePatch)
SemanticLogger::Logger.singleton_class.prepend(GitHub::Telemetry::Logs::SemanticLoggerLoggerPatch)
