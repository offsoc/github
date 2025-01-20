# frozen_string_literal: true

module AdvisoryDBToolkit
  module OSV
    module Interfaces
      # A plain old ruby object representing an Advisory that will be
      # transformed to OSV JOSN or was rehydrated from OSV JSON.
      class Advisory
        # General info
        attr_accessor :ghsa_id, :summary, :description, :severity, :cve_id

        # Metadata
        attr_accessor :cvss_v3, :cvss_v4, :identifier, :reviewed, :source_code_location

        # Relationships
        attr_accessor :credits, :cwe_ids, :references, :vulnerabilities

        # Date fields
        attr_accessor :nvd_published_at, :published_at, :reviewed_at, :updated_at, :withdrawn_at

        def initialize
          # credits should eventually be it's own interface object.
          # For now it's an array of hashes
          self.credits = []

          # A simple array of ID strings
          self.cwe_ids = []

          # A simple array of URL strings
          self.references = []

          # An array of AdvisoryDBToolkit::OSV::Interfaces::Vulnerabilities
          self.vulnerabilities = []
        end

        def to_h
          {
            # General info
            ghsa_id:,
            summary:,
            description:,
            severity:,
            cve_id:,

            # Metadata
            cvss_v3:,
            cvss_v4:,
            identifier:,
            reviewed:,
            source_code_location:,

            # Relationships
            credits:,
            cwe_ids:,
            references:,
            vulnerabilities: vulnerabilities.map(&:to_h),

            # Date fields
            nvd_published_at:,
            published_at:,
            reviewed_at:,
            updated_at:,
            withdrawn_at:,
          }
        end
      end
    end
  end
end
