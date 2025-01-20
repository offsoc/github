# frozen_string_literal: true

namespace :enterprise do
  namespace :dependabot_alerts do
    # Create the Dependabot Alerts default (global) auto-dismissal rule on an instance of GHES.
    #
    # This is run via `ghe-run-migrations`
    task create_default_rule: [:environment] do
      next unless GitHub.enterprise? || Rails.env.development?
      next if VulnerabilityAlertRule.exists?(target_type: "global", target_id: 0)

      VulnerabilityAlertRule.create(
        target_type: "global",
        target_id: 0,
        name: "Dismiss low-impact alerts for development-scoped dependencies",
        conditions: {
          "ecosystem" => ["npm"],
          "scope" => ["development"],
          "cwe" => RepositoryVulnerabilityAlert::AutoDismissal::ALLOWED_CWE_IDS
        },
        enablement_behavior: "enabled_by_default_for_public",
        actions: {
          "alert_actions" => { "auto_dismiss" => "indefinitely" },
          "version" => 1
        }
      )
    end
  end
end
