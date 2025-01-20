# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class GlobalAdvisory
      def self.create(actor:, status:, severity:, classification:, description: Faker::Lorem.sentence, published_at: Time.now, ecosystem:, affects: "test_package#{rand(100)}", requirements: "< 1.2")
        ghsa_id = ::AdvisoryDB::GhsaIdGenerator.generate_ghsa_id

        vulnerability = ::Vulnerability.create(ghsa_id: ghsa_id, status: status, severity: severity, classification: classification, description: description, published_at: published_at)
        raise Objects::CreateFailed, vulnerability.errors.full_messages.to_sentence unless vulnerability.valid?
        create_cve_id_and_cve_epss(vulnerability)

        if affects.present?
          vvr = vulnerability.vulnerable_version_ranges.new(ecosystem: ecosystem, affects: affects, requirements: requirements)
          raise Objects::CreateFailed, vvr.errors.full_messages.to_sentence unless vvr.valid?

          vvr.save!
        end

        vulnerability.save!
        vulnerability = vulnerability.class.find(T.must(vulnerability.id))

        Search.add_to_search_index("vulnerability", vulnerability.id)

        vulnerability
      end

      def self.create_cve_id_and_cve_epss(vulnerability)
        begin
          cve_id = "CVE-#{Date.current.year}-#{vulnerability.id.to_s.rjust(6, "0")}"
          vulnerability.cve_id = cve_id

          cve_epss = CVEEPSS.create!(
            cve_id: cve_id,
            percentage: Faker::Number.between(from: 0.0, to: 1.0).round(9).to_s.ljust(11, "0"),
            percentile: Faker::Number.between(from: 0.0, to: 1.0).round(9).to_s.ljust(11, "0"),
            calculation_date: Faker::Date.between(from: "2023-01-01", to: Date.today)
          )
        rescue ActiveRecord::RecordInvalid => e
          raise Objects::CreateFailed, "Failed to create CVE ID or CVE EPSS: #{e.message}"
        rescue StandardError => e
          raise Objects::CreateFailed, "An unexpected error occurred: #{e.message}"
        end
      end
    end
  end
end
