# frozen_string_literal: true

module AdvisoryDBToolkit
  module OSV
    module Transformers
      module SchemaV1
        module FromOSVRangeParsers
          # The ecosystem OSVRangeParser is currently doing double duty:
          # Ecosystem type is much harder to understand without having
          # ecosystem-specific awareness, so much of the validation in this class
          # is dedicated to protecting against things we can't reliably parse.
          # ADDITIONALLY, this class has support for GHSA ingest specific needs,
          # specifically the use of a "last_known_affected_hint".
          module Ecosystem
            # Parses an OSV range into a well formed range that we can format.
            # Example of an ecosystem range:
            # {
            #   "events"=>[{"introduced"=>"0"}, {"fixed"=>"1.2.4"}]}
            # }
            # Note that: Type is OPTIONAL due to precedent, and only one vulnerability
            # range segment can be supported.
            def self.parse(range, last_known_affected_hint)
              range_events = range["events"] || []
              grouped_events = AdvisoryDBToolkit::Utility.group_by(range_events) do |e|
                e.keys.first.to_sym
              end

              validate_single_lower_upper_terms(grouped_events)

              vvr = ecosystem_vvr(grouped_events, last_known_affected_hint)
              # Ecosystem currently only supports single vulnerability ranges because we can't meaningfully sort.
              # Parsed events is an array of version ranges, so we adapt.
              [vvr]
            end

            def self.validate_single_lower_upper_terms(grouped_events)
              # This check is primarily used when we can't reliably order version ranges,
              # so we reject all ranges where there is a potential conflict of ordering.
              # As of the time of this writing, ECOSYSTEM ranges cannot be reliably ordered,
              # but SEMVER ranges can.
              grouped_events.each do |type, events|
                next if events.one?

                # The OSV spec allows for multiple events of each type so that
                # multiple affected versions of the same package can be grouped
                # together. We don't support that for any events we cannot order,
                # and the caller of the parser is responsible to "split out" all VVRs.
                raise VulnerableVersionRanges::TooManyOSVAffectedRangeEvents,
                  "Specifying more than one #{type} event type per affected package is not currently supported"
              end
            end

            def self.ecosystem_vvr(grouped_events, last_known_affected_hint)
              vvr = []
              introduced_value = grouped_events[:introduced]&.first&.values&.first
              if introduced_value
                vvr.push(ParsedTerm.new(
                  type: :introduced,
                  version: introduced_value,
                  comparator: introduced_value == "0" ? ">" : ">=",
                ))
              end
              fixed_value = grouped_events[:fixed]&.first&.values&.first
              if fixed_value
                vvr.push(ParsedTerm.new(
                  type: :fixed,
                  version: fixed_value,
                  comparator: "<",
                  # This is a very strange case that appears to be the following:
                  # If last_known_affected_hint (not an OSV concept but an advisory DB one)
                  # is provided, we dont use fixed as upper bound, but we still need access to
                  # the event to track it in first_patched_version.
                  hidden: last_known_affected_hint ? true : false,
                ))
              end
              unless last_known_affected_hint
                last_affected_value = grouped_events[:last_affected]&.first&.values&.first
                if last_affected_value
                  vvr.push(ParsedTerm.new(
                    type: :last_affected,
                    version: last_affected_value,
                    comparator: "<=",
                  ))
                end
              end
              # Funky special case we use to plumb an "override" for last affected in.
              if last_known_affected_hint
                vvr.push(ParsedTerm.new(
                  type: :last_affected,
                  version: last_known_affected_hint,
                  comparator: nil,
                ))
              end

              vvr
            end
          end
        end
      end
    end
  end
end
