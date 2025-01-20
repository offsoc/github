# frozen_string_literal: true

module GitHub
  module Telemetry
    module Logs
      module Formatters
        # Provides logfmt formatted log records
        #
        # Records contain the following fields to have parity with uber/zap
        # - `ts`: Timestamp
        # - `logger`: Name of the logger object for Rails apps that will be the classname
        # - `level`: Human readable severity level TRACE...FATAL
        # - `msg`: Event name provided in log event
        #
        # **Notes**
        #
        # - All other fields use strict `logfmt` key-value pairs
        # - All values are surrounded by double quotes
        # - New lines are escaped in values
        # - Only Primative Value Types are supported (String, Numeric, Float)
        # - Object Values Types are converted to JSON escaped representation
        # - Supports tags, named tags, and local record payloads
        # - Duplicate fields are overriden giving preference to payloads then named tags then tags
        # - All tags are converted to fields with boolean value set to true e.g. `happy=true`
        #
        # @example Usage
        #   SemanticLogger.add_appender(io: $stdout, formatter: GitHub::Telemetry::Logs::Formatters::Logfmt.new)
        class Logfmt
          TIME_PRECISION = 6
          DEFAULT_PAYLOAD = {}.freeze
          LEVEL_MAP = {
            trace: "TRACE",
            debug: "DEBUG",
            info: "INFO",
            warn: "WARN",
            error: "ERROR",
            fatal: "FATAL",
          }.freeze

          # Regular expression used to test if a value should be surrounded by double quotes.
          # ' ' is a delimeter for a set of key-value pairs
          # `=` is a delimeter between a key and value
          # `:` and `,` are special characters in systems like [Splunk](https://github.com/asenchi/scrolls/pull/48)
          # `"` is the quote character which requires escaping
          REQUIRES_QUOTES_REGEXP = /[ =:,\"]/.freeze

          RESERVED_KEYS = Set.new(%w[Timestamp InstrumentationScope SeverityText Body]).freeze

          def initialize(exception_formatter: SemConvException.new)
            @exception_formatter = exception_formatter
          end

          # Formats a log event into a logfmt string
          #
          # @param log [SemanticLogger::Log] event record to format
          # @param logger [SemanticLogger::Logger] not used
          # @return [String] `logfmt` formatted string
          def call(log, _)
            record = {
              "Timestamp" => log.time.utc.iso8601(TIME_PRECISION),
              "InstrumentationScope" => log.name,
              "SeverityText" => LEVEL_MAP[log.level],
              "Body" => log.message,
            }

            otel_context = log.context&.[](:otel_context)

            if otel_context
              span_context = otel_context[:span_context].dup
              unless span_context.empty?
                record["TraceId"] = span_context.delete("trace_id")
                record["SpanId"] =  span_context.delete("span_id")
                record["ParentSpanId"] = span_context.delete("parent_span_id")
                record["TraceFlags"] = span_context.delete("trace_flags")
                record.merge!(span_context)
              end
            end

            record["gh.unnamed_tags"] = log.tags.join(",") if log.tags.any?

            log.named_tags.each { |k, v| record[k.to_s] = v }

            log.payload&.each { |k, v| record[k.to_s] = v }

            record.merge!(format_exception(log)) if log.exception
            record.merge!(otel_context[:resource_attributes]) if otel_context&.[](:resource_attributes)

            formatted_record = +"" # unfrozen string literal
            record.each do |(key, value)|
              case value
              # Technically we should not support symbols per the OTEL Spec
              when Symbol, TrueClass, FalseClass, Numeric, Float
                formatted_record.concat(key).concat('="').concat(value.to_s).concat('" ')
              when Time
                utc = value.utc? ? value : value.getutc
                formatted_record.concat(key).concat('="').concat(utc.iso8601(TIME_PRECISION)).concat('" ')
              when NilClass
                next
              else
                formatted_record.concat(key).concat('="').concat(format_string_value(value)).concat('" ')
              end
            end

            formatted_record.strip!
            formatted_record.gsub!("\n", "\\n")
            formatted_record
          end

          # @api private
          # Formats a string using Strict Logfmt formats
          #
          # * All string values are enclosed in double quotes
          # * Strings that contain double quotes are escaped
          #
          # Inspired by https://github.com/asenchi/scrolls/blob/master/lib/scrolls/parser.rb#L7
          #
          # @param String value to format
          # @return String
          def format_string_value(value)
            v = value.to_s

            if v.match?(REQUIRES_QUOTES_REGEXP) && v.include?('"')
              # Since at least one double quote is found,
              # we must escape all instances before wrapping in double quotes
              v.gsub(/\\|"/) { |c| "\\#{c}" }
            else
              v
            end
          end

          def format_exception(log)
            @exception_formatter.call(log)
          end
        end
      end
    end
  end
end
