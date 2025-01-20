# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Vulnerabilities < Seeds::Runner
      SEEDS = [
        {
          ecosystem: "RubyGems",
          severity: "critical",
          versions: [
            {
              package_name: "octokit",
              vulnerable_versions: ">= 4.10.0, < 4.14.0",
              fixed_in: "4.14.0",
            },
            {
              package_name: "octokit",
              vulnerable_versions: ">= 3.0.0, < 3.2.0",
              fixed_in: nil,
            },
          ],
        },
        {
          ecosystem: "RubyGems",
          severity: "moderate",
          versions: [
            {
              package_name: "multipart-post",
              vulnerable_versions: ">= 2.0.0",
              fixed_in: nil,
            },
          ],
        },
        {
          ecosystem: "RubyGems",
          severity: "high",
          versions: [
            {
              package_name: "faraday",
              vulnerable_versions: "> 0.1.0, < 0.15.4",
              fixed_in: "0.15.3",
            },
          ],
        },
        {
          ecosystem: "RubyGems",
          severity: "low",
          versions: [
            {
              package_name: "octokit",
              vulnerable_versions: "> 4.10.0",
              fixed_in: nil,
            },
          ],
        },
        {
          ecosystem: "pip",
          severity: "critical",
          versions: [
            {
              package_name: "pyyaml",
              vulnerable_versions: "< 4.1",
              fixed_in: "4.1"
            }
          ]
        }
      ]

      def self.help
        <<~HELP
          Creates vulnerbility alerts on the hub repo. This script will create a
          repository vulnerability alert and a security advisory.

          Usage: bin/seed notifications
        HELP
      end

      def self.run(options = {})
        hub_repo = Seeds::Objects::Repository.hub_repo
        hub_repo.enable_vulnerability_alerts(actor: hub_repo.owner)

        repository_vulnerability_alert(hub_repo)
        security_advisory(hub_repo)
      end

      def self.security_advisory(repo)
        vulnerability = Vulnerability.create!(
          ghsa_id: ::AdvisoryDB::GhsaIdGenerator.generate_unique_ghsa_id,
          severity: "critical",
          description: Faker::Lorem.paragraphs(number: 4).join("\n\n"),
          classification: "general",
          status: "published",
          published_at: Time.now.utc,
        )

        vulnerability.vulnerable_version_ranges.create!(
          affects: "pyyaml",
          ecosystem: "pip",
          requirements: "< 4.1",
          fixed_in: "4.1",
        )

        vae = VulnerabilityAlertingEvent.create!(reason: :on_process_alerts, vulnerability: vulnerability)

        status, rva = RepositoryVulnerabilityAlert.create_or_reintroduce(
          vulnerability_id: vulnerability.id,
          vulnerable_version_range_id: vulnerability.vulnerable_version_ranges.sample.id,
          repository_id: repo.id,
          vulnerable_manifest_path: "foo/bar.baz",
          vulnerable_requirements: "= 1.2.3",
          dependency_scope: "runtime",
          vulnerability_alerting_event_id: vae.id,
          push_id: 5,
        )

        rva.trigger_notifications(vulnerability_alerting_event: vae)
        vae.processed!
      end

      def self.repository_vulnerability_alert(repo)
        vae = VulnerabilityAlertingEvent.create!(reason: :on_push)

        SEEDS.each do |params|
          vulnerability = Vulnerability.create!(
            ghsa_id: ::AdvisoryDB::GhsaIdGenerator.generate_unique_ghsa_id,
            severity: params[:severity],
            description: Faker::Lorem.paragraphs(number: 4).join("\n\n"),
            classification: "general",
            status: "published",
            published_at: Time.now.utc,
          )

          params[:versions].each do |version|
            vulnerability.vulnerable_version_ranges.create!(
              affects: version[:package_name],
              ecosystem: params[:ecosystem],
              requirements: version[:vulnerable_versions],
              fixed_in: version[:fixed_in],
            )
          end

          status, rva = RepositoryVulnerabilityAlert.create_or_reintroduce(
            vulnerability_id: vulnerability.id,
            vulnerable_version_range_id: vulnerability.vulnerable_version_ranges.sample.id,
            repository_id: repo.id,
            vulnerable_manifest_path: "foo/bar.baz",
            vulnerable_requirements: "= 1.2.3",
            dependency_scope: "runtime",
            vulnerability_alerting_event_id: vae.id,
            push_id: 5,
          )

          rva.trigger_notifications(vulnerability_alerting_event: vae)
        end

        vae.processed!
      end
    end
  end
end
