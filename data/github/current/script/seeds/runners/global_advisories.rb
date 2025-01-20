# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class GlobalAdvisories < Seeds::Runner
      def self.help
        <<~HELP
        Create sample vulnerabilities that will show up as global advisories.
        HELP
      end

      def self.run(options = {})
        mona = Seeds::Objects::User.monalisa

        actions_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "moderate",
          classification: "general",
          ecosystem: "actions",
        )

        composer_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "low",
          classification: "general",
          ecosystem: "composer",
        )

        erlang_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "low",
          classification: "general",
          ecosystem: "erlang",
        )

        go_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "moderate",
          classification: "general",
          ecosystem: "go",
        )

        maven_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "high",
          classification: "general",
          ecosystem: "maven",
        )

        npm_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "critical",
          classification: "general",
          ecosystem: "npm",
        )

        nuget_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "moderate",
          classification: "general",
          ecosystem: "nuget",
        )

        pip_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "moderate",
          classification: "general",
          ecosystem: "pip",
        )

        pub_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "moderate",
          classification: "general",
          ecosystem: "pub",
        )

        rubygems_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "moderate",
          classification: "general",
          ecosystem: "RubyGems",
        )

        rust_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "high",
          classification: "general",
          ecosystem: "rust",
        )

        swift_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "low",
          classification: "general",
          ecosystem: "swift",
        )

        other_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "moderate",
          classification: "general",
          ecosystem: "other",
        )

        unreviewed_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "unreviewed",
          severity: nil,
          classification: "general",
          description: Faker::Lorem.sentence,
          ecosystem: nil,
          affects: nil,
          requirements: nil,
        )

        malware_issue = Seeds::Objects::GlobalAdvisory.create(
          actor: mona,
          status: "published",
          severity: "critical",
          classification: "malware",
          ecosystem: "npm",
          requirements: "> 0",
        )
      end
    end
  end
end
