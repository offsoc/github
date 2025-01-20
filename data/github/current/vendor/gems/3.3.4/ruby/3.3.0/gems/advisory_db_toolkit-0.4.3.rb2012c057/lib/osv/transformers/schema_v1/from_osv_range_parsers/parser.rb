# frozen_string_literal: true

require_relative "ecosystem"
require_relative "exact_version"
require_relative "parsed_term"
require_relative "semver"

module AdvisoryDBToolkit
  module OSV
    module Transformers
      module SchemaV1
        module FromOSVRangeParsers
          class Parser
            OSVRangeParsingError = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)

            attr_reader :parsed_segments, :type

            # Parses an OSV range into a well formed range that we can format.
            # Currently supports Semver and Ecosystem types. Makes the decision to parse as either.
            # Parses ranges as an array of segments available on parsed_segments:
            #   [Segment1, Segment2, Segment3]
            # Segments are arrays of terms:
            #   [Term1, Term2]
            # Terms are a local hash format for each "piece" of a segment:
            # {
            #   type: :fixed | :introduced | :last_affected
            #   version: string,
            #   comparator: nil | "<" | "<=" | ">" | ">=" | "=",
            #   hidden: true | false,
            # }
            def self.parse(range, last_known_affected_hint)
              range_parser = new(range, last_known_affected_hint)
              range_parser.parse!
              range_parser
            end

            # Finds the first matching term inside a set of parsed segments
            def self.first_term(parsed_segments)
              return nil if AdvisoryDBToolkit::Utility.blank?(parsed_segments)

              parsed_segments.each do |segment|
                segment.each do |term|
                  return term if yield term
                end
              end

              nil
            end

            def initialize(range, last_known_affected_hint)
              @range = range
              # We assume that the type is ecosystem if it's not specified, this is mostly an artifact of previous assumptions
              @type = range["type"] || "ecosystem"
              @last_known_affected_hint = last_known_affected_hint
            end

            def parse!
              raise(OSVRangeParsingError, "Only ecosystem and semver types are supported") unless valid_type?

              @parsed_segments = if is_ecosystem_range?
                                   Ecosystem.parse(@range, @last_known_affected_hint)
                                 elsif is_semver_range?
                                   Semver.parse(@range, @last_known_affected_hint)
                                 else
                                   raise(OSVRangeParsingError, "An invalid type was parsed.")
                                 end
            end

            def valid_type?
              is_semver_range? || is_ecosystem_range?
            end

            def is_semver_range?
              type.casecmp("semver").zero?
            end

            def is_ecosystem_range?
              type.casecmp("ecosystem").zero?
            end
          end
        end
      end
    end
  end
end
