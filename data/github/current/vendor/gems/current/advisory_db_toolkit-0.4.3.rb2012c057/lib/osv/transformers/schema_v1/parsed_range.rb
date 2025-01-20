# frozen_string_literal: true

module AdvisoryDBToolkit
  module OSV
    module Transformers
      module SchemaV1
        class ParsedRange
          VERSION_REGEX = /\A(?<operator>[^\s\w.-]+)?\s*(?<version>.+)/

          RangeParsingError = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)

          attr_reader :exact, :lower, :upper

          def self.parse(range)
            parsed_range = new(range)
            parsed_range.parse!
            parsed_range
          end

          def initialize(range)
            @range = range
          end

          # Parses a GHSA version range.
          # Current known ranges include "<", ">=", "<=", "=", and ">"
          def parse!
            parts = @range.split(",").map(&:strip)
            parts.each do |part|
              operator = part.slice(VERSION_REGEX, :operator)
              version = part.slice(VERSION_REGEX, :version)
              spec = VersionSpec.new(operator: operator, version: version)

              if operator.nil? && AdvisoryDBToolkit::Utility.present?(version)
                spec.operator = "="
                @exact = spec
              else
                case operator
                when "="
                  @exact = spec
                when ">=", ">"
                  @lower = spec
                when "<=", "<"
                  @upper = spec
                else
                  raise RangeParsingError, "Unknown operator: #{operator}"
                end
              end
            end

            unless valid?
              raise(RangeParsingError,
                "Ranges with both exact and lower/upper bounds are not supported by OSV: #{@range}")
            end
          end

          private

          # A parsed range cannot have both an exact version and an upper or
          # lower bound version
          def valid?
            return true unless exact

            !lower && !upper
          end
        end
      end
    end
  end
end
