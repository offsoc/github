# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class FeatureFlags < Seeds::Runner
      def self.help
        <<~HELP
        Seed feature flags for local development
        HELP
      end

      def self.run(options = {})
        return if FlipperFeature.find_by(name: options[:name])

        FlipperFeature.create!(
          name: options[:name],
          service_name: options[:service_name],
          tracking_issue_url: options.fetch(
            :tracking_issue_url,
            "https://github.com/github/github/1"
          ),
          stale_at: options.fetch(:stale_at, 1.month.from_now),
        )
      end
    end
  end
end
