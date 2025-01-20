# frozen_string_literal: true

require "json_schema"
require_relative "schema_v1/affected_package_versions"
require_relative "schema_v1/parsed_range"
require_relative "schema_v1/version_spec"
require_relative "schema_v1/vulnerable_version_ranges"

module AdvisoryDBToolkit
  module OSV
    module Transformers
      module SchemaV1
        extend self

        SchemaValidationError = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)
        UnsupportedOSVAlias = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)
        UnsupportedOSVEcosystem = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)
        UnsupportedOSVReferenceType = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)
        UnsupportedOSVSeverityType = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)
        UnsupportedOSVNoVulnerableVersionRanges = Class.new(AdvisoryDBToolkit::OSV::Transform::Error)

        # https://ossf.github.io/osv-schema/
        CURRENT_SCHEMA_VERSION = "1.4.0"

        # Convert an Advisory interface object to a hash suitable for
        # serializing as OSV JSON
        def to_osv(advisory)
          {
            "schema_version" => CURRENT_SCHEMA_VERSION,
            "id" => advisory.ghsa_id,
            "modified" => format_ghsa_datetime(advisory.updated_at),
            "published" => format_ghsa_datetime(advisory.published_at),
            "withdrawn" => format_ghsa_datetime(advisory.withdrawn_at),
            "aliases" => [advisory.cve_id].compact,
            # "related" => [], # Not currently used
            "summary" => advisory.summary,
            "details" => advisory.description&.gsub(/\R/, "\n"),
            "severity" => format_ghsa_severity_scores(advisory.cvss_v3, advisory.cvss_v4),
            "affected" => format_ghsa_vulnerabilities(advisory.vulnerabilities),
            "references" => format_ghsa_references(
              advisory.references,
              advisory.source_code_location,
            ),
            # "credits" => [], # Not currently used
            "database_specific" => {
              "cwe_ids" => advisory.cwe_ids,
              "severity" => advisory.severity,
              "github_reviewed" => advisory.reviewed,
              "github_reviewed_at" => format_ghsa_datetime(advisory.reviewed_at),
              "nvd_published_at" => format_ghsa_datetime(advisory.nvd_published_at),
            },
          }.compact
        end

        # Convert a parsed OSV JSON vulnerability to an Advisory interface
        # object. `osv_data` is expected to be a Ruby Hash, not raw JSON.
        def from_osv(osv_data, affected_function_extractor: nil)
          validate_schema!(osv_data)

          advisory = AdvisoryDBToolkit::OSV::Interfaces::Advisory.new

          advisory.description = osv_data["details"]
          # advisory.sources = [] # We don't store sources in OSV format
          advisory.cwe_ids = extract_cwe_ids(osv_data["database_specific"])
          advisory.severity = extract_severity(osv_data["database_specific"])
          advisory.summary = osv_data["summary"]
          advisory.vulnerabilities = format_osv_affected(
            osv_data["affected"],
            affected_function_extractor,
          )

          advisory.description = AdvisoryDBToolkit.normalize_description_line_endings(advisory.description) if AdvisoryDBToolkit::Utility.present?(advisory.description)

          # When converting GitHub-created OSV to GHSA, this is always true. But if we're using OSV transformers for anything else, this is wrong.
          advisory.ghsa_id = osv_data["id"] if is_ghsa_id?(osv_data["id"])

          # Separate out cve_id from aliases
          extract_osv_aliases(osv_data["aliases"], advisory:)

          # Separate out references from source_code_location
          extract_osv_references(osv_data["references"], advisory:)

          # Separate out cvss_v3 from severities
          extract_osv_severities(osv_data["severity"], advisory:)

          advisory
        end

        # Data is expected to be a Ruby Hash, not raw JSON
        def validate_schema!(osv_data)
          schema_file = File.expand_path("./schema_v1/schema.json",
            File.dirname(__FILE__))
          json_data = JSON.parse(File.read(schema_file))
          schema = JsonSchema.parse!(json_data)
          schema.validate!(osv_data, fail_fast: true)
        rescue JsonSchema::Error => error
          raise SchemaValidationError, "The OSV data is not valid according to the current OSV schema: #{error}"
        end

        private

        ##
        ## Advisory -> OSV helper methods
        ##

        # Convert advisory timestamps to OSV datetime strings
        def format_ghsa_datetime(datetime)
          datetime&.utc&.strftime("%FT%TZ")
        end

        # Converts advisory CVSS score to OSV severity
        def format_ghsa_severity_scores(cvss_v3_score, cvss_v4_score)
          scores = []
          unless cvss_v3_score.nil? || cvss_v3_score.empty?
            scores << {
              "type" => "CVSS_V3",
              "score" => cvss_v3_score,  
            }
          end

          unless cvss_v4_score.nil? || cvss_v4_score.empty?
            scores << {
              "type" => "CVSS_V4",
              "score" => cvss_v4_score,  
            }
          end

          scores
        end

        # Converts advisory references to OSV references.
        def format_ghsa_references(references, source_code_location)
          # First build an array of URL strings and sort them
          reference_urls = references.dup
          reference_urls.push(source_code_location) if AdvisoryDBToolkit::Utility.present?(source_code_location)
          sorted_reference_urls = ReferenceSorter.sorted_reference_list(reference_urls)

          # Then build into final structure with metadata such as type
          sorted_reference_urls.map do |url|
            if AdvisoryDBToolkit::Utility.present?(source_code_location) && url == source_code_location
              ref_type = "PACKAGE"
            else
              is_advisory_url = %r{github\.com/advisories/.+}.match?(url) ||
                                %r{nvd\.nist\.gov/vuln/detail/.+}.match?(url)
              ref_type = is_advisory_url ? "ADVISORY" : "WEB"
            end
            {
              "type" => ref_type,
              "url" => url,
            }
          end
        end

        # Map vulnerability interface objects to OSV affected package syntax
        def format_ghsa_vulnerabilities(vulnerabilities)
          vulnerabilities.map do |vulnerability|
            ecosystem = vulnerability.package_ecosystem
            mapped_ecosystem = Ecosystems.ghsa_to_osv_ecosystem(ecosystem)
            name = vulnerability.package_name

            unless mapped_ecosystem
              raise(UnsupportedOSVEcosystem,
                "The '#{ecosystem}' ecosystem does not have a valid OSV mapping")
            end

            affected = {
              "package" => {
                "ecosystem" => mapped_ecosystem,
                "name" => name,
              },
            }

            if vulnerability.affected_functions.any?
              affected["ecosystem_specific"] ||= {}
              affected["ecosystem_specific"]["affected_functions"] = vulnerability.affected_functions
            end

            affected_versions = AffectedPackageVersions.process do |versions|
              first_patched = vulnerability.first_patched_version
              raw_range = vulnerability.vulnerable_version_range
              parsed_range = ParsedRange.parse(raw_range)

              versions.process_vulnerability(parsed_range, first_patched)
            end

            if affected_versions.events.any?
              affected["ranges"] = [{
                "type" => "ECOSYSTEM",
                "events" => affected_versions.events,
              }]
            end

            if affected_versions.extra.any?
              affected["database_specific"] ||= {}
              affected["database_specific"].merge!(affected_versions.extra)
            end

            affected["versions"] = affected_versions.versions if affected_versions.versions.any?

            affected
          end
        end

        ##
        ## OSV -> Advisory helper methods
        ##

        def is_ghsa_id?(maybe_ghsa_id)
          maybe_ghsa_id.upcase.start_with?("GHSA-")
        end

        # Map OSV affected package syntax to vulnerability interface objects
        def format_osv_affected(affected_products, affected_function_extractor = nil)
          return [] unless affected_products.is_a?(Array)

          affected_products.flat_map do |affected|
            ecosystem = affected["package"]["ecosystem"]
            mapped_ecosystem = Ecosystems.osv_to_ghsa_ecosystem(ecosystem)
            name = affected["package"]["name"]

            unless ecosystem && mapped_ecosystem
              raise(UnsupportedOSVEcosystem,
                "The #{ecosystem} ecosystem does not have a valid OSV mapping")
            end

            vvrs = VulnerableVersionRanges.new(affected)
            vvrs.process_affected

            unless vvrs.vulnerable_version_ranges.count >= 1
              raise(UnsupportedOSVNoVulnerableVersionRanges,
                "The affected product #{affected} had no parsable vulnerable version ranges.")
            end

            ecosystem_specific = affected["ecosystem_specific"]
            affected_functions = if AdvisoryDBToolkit::Utility.present?(ecosystem_specific)
                                   if AdvisoryDBToolkit::Utility.present?(affected_function_extractor)
                                     affected_function_extractor.call(ecosystem_specific)
                                   else
                                     ecosystem_specific["affected_functions"]
                                   end
                                 end || []

            # first_patched_version is a bit of an oddity in the below function, it is a side effect
            # of how parsed OSV data has worked historically. First_patched_version ends up being the same
            # value even for different version segments as long as they share an affected product.
            vvrs.vulnerable_version_ranges.map do |v|
              result = AdvisoryDBToolkit::OSV::Interfaces::Vulnerability.new
              result.package_ecosystem = mapped_ecosystem
              result.package_name = name
              result.vulnerable_version_range = v.join(", ")
              result.affected_functions = affected_functions
              result.first_patched_version = vvrs.first_patched_version if AdvisoryDBToolkit::Utility.present?(vvrs.first_patched_version)
              result
            end
          end
        end

        # Extract advisory CVSS scores from OSV severities
        def extract_osv_severities(severities, advisory: nil)
          return unless severities.is_a?(Array) && severities.any?

          severities.each do |severity|
            case severity["type"]
            when "CVSS_V3"
              advisory.cvss_v3 = severity["score"]
            when "CVSS_V4"
              advisory.cvss_v4 = severity["score"]
            else
              raise UnsupportedOSVSeverityType, "The #{severity["type"]} severity type is not currently supported"
            end
          end
        end

        # Separate OSV references into advisory references and source code location
        def extract_osv_references(references, advisory: nil)
          # we should try to make sure we understand all OSV standard reference types:
          # https://ossf.github.io/osv-schema/#references-field
          # ADVISORY: A published security advisory for the vulnerability.
          # ARTICLE: An article or blog post describing the vulnerability.
          # REPORT: A report, typically on a bug or issue tracker, of the vulnerability.
          # FIX: A source code browser link to the fix (e.g., a GitHub commit) Note that the fix type is meant for viewing by people using web browsers. Programs interested in analyzing the exact commit range would do better to use the GIT-typed affected[].ranges entries (described above).
          # PACKAGE: A home web page for the package.
          # EVIDENCE: A demonstration of the validity of a vulnerability claim, e.g. app.any.run replaying the exploitation of the vulnerability.
          # WEB: A web page of some unspecified kind.
          unless references.is_a?(Array) && references.any?
            advisory.references = []
            return
          end

          references.each do |reference|
            case reference["type"]
            when "PACKAGE"
              advisory.source_code_location = reference["url"]
            when "ADVISORY", "WEB", "FIX", "ARTICLE", "REPORT"
              advisory.references ||= []
              advisory.references << reference["url"]
            when "EVIDENCE"
              # evidence is ignored because the format is unknown, but should not throw an error
            else
              raise UnsupportedOSVReferenceType, "The #{reference["type"]} reference type is not currently supported"
            end
          end
        end

        # Separate out advisory cve_id from aliases
        def extract_osv_aliases(aliases, advisory: nil)
          return unless aliases.is_a?(Array) && aliases.any?

          # NOTE: Aliases aren't part of the documented OSV schema, but they
          # can have point to other vulnerability databases. We only support
          # CVE and GHSA today. It's possible that raising here is
          # inappropriate (since we won't support all arbitrary aliases).
          aliases.each do |aka|
            if AdvisoryDBToolkit::CVEIDValidator.valid?(aka)
              advisory.cve_id = aka
            elsif AdvisoryDBToolkit::GHSAIDValidator.valid?(aka)
              advisory.ghsa_id = aka
            else
              raise UnsupportedOSVAlias, "The #{aka} alias type is not currently supported"
            end
          end
        end

        # Extract advisory CWE IDs from OSV database specific hash
        def extract_cwe_ids(database_specific)
          return unless database_specific.is_a?(Hash)

          database_specific["cwe_ids"]
        end

        # Extract advisory severity from OSV database specific hash
        def extract_severity(database_specific)
          return unless database_specific.is_a?(Hash)

          database_specific["severity"]&.downcase
        end
      end
    end
  end
end
