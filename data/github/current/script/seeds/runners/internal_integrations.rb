# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class InternalIntegrations < Seeds::Runner
      def self.help
        <<~EOF
        Create Internal GitHub-Owned Integrations.
        Creates Slack, Teams and chatops-unfurl (used by Slack).

        Override their URLs by using the SLACK_INTEGRATION_URL and TEAMS_INTEGRATION_URL env var.

        Force deletion and recreation of the integrations with FORCE=true.

        Print out the created app info with SLACK_PRINT_APP_INFO and TEAMS_PRINT_APP_INFO.
        EOF
      end

      def self.run(options = {})
        Seeds::Objects::Integration.create_slack_integration
        Seeds::Objects::Integration.create_msteams_integration
        Seeds::Objects::Integration.create_chatops_unfurl_integration unless GitHub.enterprise?
      end
    end
  end
end
