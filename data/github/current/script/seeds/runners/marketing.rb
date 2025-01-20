# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Marketing < Seeds::Runner
      FLAGS = %w(
        marketing_cookie_consent_banner
        marketing_microsoft_analytics
        site_features_copilot_plans_page
        site_premium_support_redesign
        site_security_react
      )

      def self.help
        <<~EOF
        Enable Marketing pages feature flags for local development: #{FLAGS.join(", ")}
        EOF
      end

      def self.run(options = {})
        FLAGS.each do |flag|
          Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: flag)
        end
      end
    end
  end
end
