# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class SecurityConfiguration
      def self.custom_configuration(org:, options:)
        default_for_new_public_repos = options.delete(:default_for_new_public_repos) || false
        default_for_new_private_repos = options.delete(:default_for_new_private_repos) || false
        base_attributes = {
          name: Faker::Lorem.word,
          description: Faker::Lorem.sentence(word_count: 3),
          enable_ghas: true,
          dependency_graph: :disabled,
          dependency_graph_autosubmit_action: :disabled,
          dependabot_alerts: :disabled,
          dependabot_security_updates: :disabled,
          code_scanning: :disabled,
          secret_scanning: :disabled,
          secret_scanning_push_protection: :disabled,
          secret_scanning_validity_checks: :disabled,
          secret_scanning_non_provider_patterns: :disabled,
          target: org
        }
        base_attributes.merge!(options)

        unless GitHub.enterprise?
          base_attributes[:private_vulnerability_reporting] = :not_set
        end

        config = ::SecurityConfiguration.create!(base_attributes)
        ::SecurityConfigurationDefault.create_or_update_defaults(
          target: org,
          default_for_new_public_repos:,
          default_for_new_private_repos:,
          security_configuration_id: T.must(config.id)
        )
      end
    end
  end
end
