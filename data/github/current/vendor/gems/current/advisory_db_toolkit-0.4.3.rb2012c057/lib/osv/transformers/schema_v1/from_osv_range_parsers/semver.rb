# frozen_string_literal: true

module AdvisoryDBToolkit
  module OSV
    module Transformers
      module SchemaV1
        module FromOSVRangeParsers
          # Parses an OSV range into a well formed range that we can format.
          module Semver
            SemverVersionRangeInvalidEventType = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)

            # Example of a semver range:
            # {
            #   "type" => "SEMVER",
            #   "events" => [
            #     { "introduced" => "0" }, { "fixed" => "1.11.13" },
            #     { "introduced" => "1.12.0" }, { "fixed" => "1.12.8" }
            #   ],
            # }
            def self.parse(range, _last_known_affected_hint)
              # Other validation implies each of these range containers should be semver.
              semantic_versions = range["events"].map { |e| create_semantic_version_range_event(e) }
              semantic_versions.sort! do |left, right|
                # "That's weird, we're using a special class to sort semantic versions, aren't we?"
                # Yes, it is weird, but Go issues advisories that are invalid SemVer as points (0 as introduced)
                #  AND issues fixed in with 0 version pre-releases.
                if left.custom_version_object == "0.0.0"
                  -1
                elsif right.custom_version_object == "0.0.0"
                  1
                else
                  left.custom_version_object <=> right.custom_version_object
                end
              end

              # If we have multiple versions in the list and the first is > 0, we drop it.
              if semantic_versions.count > 1 &&
                 semantic_versions.first.custom_version_object == Semantic::Version.new("0.0.0") &&
                 semantic_versions.first.comparator == ">"
                semantic_versions = semantic_versions[1..]
              end

              vvrs = []
              interim_vvr = []
              semantic_versions.each do |sv|
                if !interim_vvr.empty? && sv.type == :introduced
                  vvrs.push(interim_vvr)
                  interim_vvr = []
                end
                interim_vvr.push(sv)
              end

              vvrs.push(interim_vvr)
              vvrs
            end

            def self.create_semantic_version_range_event(event)
              if event.key? "introduced"
                semantic_version = Semantic::Version.new(event["introduced"] == "0" ? "0.0.0" : event["introduced"])
                ParsedTerm.new(
                  type: :introduced,
                  custom_version_object: semantic_version,
                  version: event["introduced"],
                  comparator: semantic_version == "0.0.0" ? ">" : ">=",
                )
              elsif event.key? "fixed"
                ParsedTerm.new(
                  type: :fixed,
                  custom_version_object: Semantic::Version.new(event["fixed"]),
                  version: event["fixed"],
                  comparator: "<",
                )
              else
                raise(SemverVersionRangeInvalidEventType,
                  "Semver version ranges currently only support :introduced and :fixed event types.")
              end
            end
          end
        end
      end
    end
  end
end
