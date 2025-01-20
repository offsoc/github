# frozen_string_literal: true

require "semantic"
require_relative "from_osv_range_parsers/parser"

module AdvisoryDBToolkit
  module OSV
    module Transformers
      module SchemaV1
        class VulnerableVersionRanges
          SUPPORTED_EVENT_TYPES = %i[fixed introduced last_affected].freeze

          TooManyOSVAffectedRanges = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)
          TooManyOSVAffectedRangeEvents = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)
          TooManyOSVAffectedVersions = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)
          UnsupportedOSVAffectedRangeEventType = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)
          ExclusiveOSVAffectedRangeEventType = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)

          attr_accessor :first_patched_version, :vulnerable_version_ranges

          def initialize(affected)
            @affected = affected
            validate!

            @first_patched_version = nil
            @vulnerable_version_ranges = []
          end

          def process_affected
            fixed_term = nil

            parsed_ranges.each do |parsed|
              # Look for a fixed version
              if AdvisoryDBToolkit::Utility.blank?(fixed_term)
                first_fixed_term = FromOSVRangeParsers::Parser.first_term(parsed) { |term| term.type == :fixed }
                fixed_term = first_fixed_term.version if first_fixed_term
              end

              # Aggregate all parsed segments
              parsed.each do |parsed_segment|
                interim_vvr = []
                parsed_segment.each do |term|
                  next if term.hidden

                  # We join here instead of concatenate because some shenanigans inside version parsers
                  # can end up with a blank comparator and an already formatted string in version.
                  interim_vvr.push([term.comparator, term.version].compact.join(" "))
                end
                vulnerable_version_ranges.push(interim_vvr)
              end
            end

            self.first_patched_version = fixed_term
          end

          def validate!
            validate_ranges!
            validate_events!
            validate_versions!
          end

          private

          def last_known_affected
            @last_known_affected ||= begin
              database_specific = @affected.fetch("database_specific", {})
              database_specific[AffectedPackageVersions::LAST_KNOWN_AFFECTED_KEY]
            end
          end

          def ranges
            @affected.fetch("ranges", [])
          end

          def versions
            @affected.fetch("versions", [])
          end

          def range_events
            first_range = ranges.first
            if first_range
              first_range["events"] || []
            else
              []
            end
          end

          def grouped_events
            return @grouped_events if @grouped_events

            @grouped_events = AdvisoryDBToolkit::Utility.group_by(range_events) do |e|
              e.keys.first.to_sym
            end
          end

          def parsed_ranges
            @parsed_ranges ||= if versions.one?
                                  [FromOSVRangeParsers::ExactVersion.parse(versions.first, ranges&.first, last_known_affected)]
                               else
                                 ranges.map do |range|
                                   FromOSVRangeParsers::Parser.parse(range, last_known_affected).parsed_segments
                                 end
                               end
          end

          def validate_events!
            event_types = grouped_events.keys
            unsupported_events = event_types - SUPPORTED_EVENT_TYPES

            # The OSV spec also supports a limit event, but our GHSA -> OSV
            # transformer will only output fixed and introduced events. Anything
            # else here means an unsupported event type was manually added by a
            # contribution.
            unless unsupported_events.empty?
              raise(UnsupportedOSVAffectedRangeEventType,
                "Only fixed, introduced, and last_affected range event types are currently supported")
            end

            # Run our parsing, which will fail with version specific issues if necessary
            parsed_ranges

            # the gem json_schema passes validation for this despite the schema.json having if-then
            # constructs that make such a situation invalid. Alternative gems were considered, but
            # they don't seem to support those constructs in order to actually make validation fail.
            # So as a workaround we validate it manually here. For more details, see
            # https://github.com/github/team-advisory-database/issues/2606#issuecomment-1242424891
            if event_types.include?(:fixed) && event_types.include?(:last_affected)
              raise ExclusiveOSVAffectedRangeEventType,
                "The events fixed and last_affected cannot appear together for the range. Use either of them, giving preference to fixed."
            end
          end

          def validate_versions!
            return unless versions.size > 1

            # Our GHSA -> OSV transformer will only ever output one explicit
            # version, mainly as a rehydration hind for `= a.b.c` range
            # specifiers, so an error here means additional versions were added
            # via a contribution.
            raise TooManyOSVAffectedVersions,
              "Explicitly listing more than one affected version is not currently supported. Use range events instead."
          end

          def validate_ranges!
            return unless ranges.size > 1

            # Having more than one OSV range node makes it difficult if not
            # impossible to correctly parse version specifiers back to GHSA
            # format, at least not without doing fancy ecosystem-specific version
            # string parsing which we are trying to avoid.
            #
            # Our GHSA -> OSV transformer will only output one range per package,
            # so any error here means a new range node was manually added by a
            # contribution.
            raise TooManyOSVAffectedRanges, "Specifying more than one range per package is not currently supported"
          end
        end
      end
    end
  end
end
