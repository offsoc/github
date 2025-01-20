# frozen_string_literal: true

module GitHub
  module Telemetry
    module Logs
      module Formatters
        # Converts a log event with exception information into a logfmt friendly hash using semantic convention keys
        #
        # [Semantic Attribute Names](https://github.com/github/github-semantic-conventions/blob/main/combined-docs/trace/exceptions.md#attributes)
        # - `Body`: The message that was recorded in the log event.
        # - `exception.type`: the exception class name
        # - `exception.message`: the exception message
        # - `exception.stacktrace`: A non-tty formatted stacktrace based on [`Exception#full_message`](https://ruby-doc.org/core-2.6/Exception.html#method-i-full_message)
        #
        # This class omits the backtrace for common exceptions raised by the Rails Framework whose backtrace information is not useful for debugging via logs.
        #
        # **Notes**
        #
        # - If no custom message was logged, it will fallback to `Body=exception` to match Span Event Exception Format
        #
        class SemConvException
          REPLACEMENT_CHARACTER = "�"
          EMPTY_RECORD = {}.freeze
          OMIT_BACKTRACE_CLASSES = %w[ActionController::BadRequest
                                      ActionController::InvalidAuthenticityToken
                                      AbstractController::ActionNotFound
                                      ActionController::RoutingError
                                      ActionController::UnknownHttpMethod
                                      ActionDispatch::Http::MimeNegotiation::InvalidType
                                      ActiveRecord::RecordInvalid].freeze

          attr_reader :omit_backtrace_classes

          # Creates a new instance of SemConvException
          # @param {Array<String>} omit_backtrace_classes an array of exception class names to omit exception.backtrace attribute
          def initialize(omit_backtrace_classes: OMIT_BACKTRACE_CLASSES)
            @omit_backtrace_classes = Set.new(Array(omit_backtrace_classes)).freeze
          end

          # Converts a log event with exception information into a logfmt friendly hash using semantic convention keys
          #
          # @param log [SemanticLogger::Log]
          # @return [Hash] with semantic key value pairs or an empty hash if no exception is present
          def call(log)
            return EMPTY_RECORD unless log.exception

            {}.tap do |record|
              record["Body"] = "exception" if log.message.nil?
              record[OpenTelemetry::SemanticConventions::Trace::EXCEPTION_TYPE] = log.exception.class.to_s
              record[OpenTelemetry::SemanticConventions::Trace::EXCEPTION_MESSAGE] = log.exception.message.encode("UTF-8", invalid: :replace, undef: :replace, replace: REPLACEMENT_CHARACTER)

              if include_backtrace?(log.exception)
                # https://github.com/open-telemetry/opentelemetry-ruby/blob/main/sdk/lib/opentelemetry/sdk/trace/span.rb#L158
                record[OpenTelemetry::SemanticConventions::Trace::EXCEPTION_STACKTRACE] = log.exception.full_message(highlight: false, order: :top).encode("UTF-8", invalid: :replace, undef: :replace, replace: REPLACEMENT_CHARACTER)
              end
            end
          end

          private

          def include_backtrace?(exception)
            (omit_backtrace_classes & exception.class.ancestors.map(&:to_s)).empty?
          end
        end
      end
    end
  end
end
