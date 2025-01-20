# frozen_string_literal: true

module AdvisoryDBToolkit
  module OSV
    module Transformers
      module SchemaV1
        class AffectedPackageVersions
          LAST_KNOWN_AFFECTED_KEY = "last_known_affected_version_range"

          RangeOperatorError = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)

          attr_reader :affects_all_prior, :events, :extra, :versions

          def self.process
            versions = new
            yield versions
            versions.finalize
            versions
          end

          def initialize
            @affects_all_prior = false
            @events = []
            @extra = {}
            @versions = []
          end

          def process_vulnerability(parsed_range, first_patched)
            if parsed_range.exact
              parse_exact_range(parsed_range.exact, first_patched)
            else
              if parsed_range.lower
                parse_lower_range(parsed_range.lower)
              else
                @affects_all_prior = true
              end

              if parsed_range.upper
                parse_upper_range(parsed_range.upper, first_patched)
              elsif AdvisoryDBToolkit::Utility.present?(first_patched)
                events.push({ "fixed" => first_patched })
              end
            end
          end

          def finalize
            events.unshift({ "introduced" => "0" }) if affects_all_prior
          end

          private

          def parse_exact_range(exact_range, first_patched)
            if AdvisoryDBToolkit::Utility.present?(first_patched)
              events.push({ "introduced" => exact_range.version })
              events.push({ "fixed" => first_patched })
            end
            versions.push(exact_range.version)
          end

          def parse_lower_range(lower_range)
            case lower_range.operator
            when ">="
              events.push({ "introduced" => lower_range.version })
            when ">"
              # We dont have a reliable way to detect the next version.
              raise(RangeOperatorError, "> operator is not supported by OSV") unless lower_range.version == "0"

              events.push({ "introduced" => "0" })
            end
          end

          def parse_upper_range(upper_range, first_patched)
            events.push({ "fixed" => first_patched }) if AdvisoryDBToolkit::Utility.present?(first_patched)

            unless upper_range.version == first_patched
              if AdvisoryDBToolkit::Utility.blank?(first_patched) && upper_range.operator == "<="
                events.push({ "last_affected" => upper_range.version })
              else
                hint = "#{upper_range.operator} #{upper_range.version}"
                extra[LAST_KNOWN_AFFECTED_KEY] = hint
              end
            end
          end
        end
      end
    end
  end
end
