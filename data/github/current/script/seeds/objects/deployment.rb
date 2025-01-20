# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Deployment
      def self.create_all_variations!(repository:, head_sha:, integration:)
        # Create abandoned deployment
        create(
          repository: repository,
          head_sha: head_sha,
          integration: integration,
          environment: "review-lab",
          transient_environment: true,
          production_environment: false
        )

        # Success -> Inactive = Destroyed
        review_lab_deployment = create(
          repository: repository,
          head_sha: head_sha,
          integration: integration,
          environment: "review-lab",
          transient_environment: true,
          production_environment: false
        )
        create_status(review_lab_deployment, "success", integration: integration)
        create_status(review_lab_deployment, "inactive", integration: integration)

        lab_deployment = create(
          repository: repository,
          head_sha: head_sha,
          integration: integration,
          environment: "lab",
          transient_environment: false,
          production_environment: false
        )
        create_status(lab_deployment, "success", integration: integration)
        create_status(lab_deployment, "inactive", integration: integration)

        # With one status each, but iterate all possible statuses
        ::DeploymentStatus::STATES.each do |state|
          loop_deployment = create(repository: repository, head_sha: head_sha, integration: integration)
          create_status(loop_deployment, state, integration: integration)
        end

        # Create a pinned environment, one "success" and one inactive
        pinned_deployment = create(
          repository: repository,
          head_sha: head_sha,
          integration: integration,
          environment: "pinned_environment",
          transient_environment: false,
          production_environment: false
        )
        create_status(pinned_deployment, "success", integration: integration)
        create_pin(pinned_deployment, repository)

        # Create a pinned environment with the latest status inactive and previous success
        inactive_pinned_deployment =  create(
          repository: repository,
          head_sha: head_sha,
          integration: integration,
          environment: "inactive_pinned_environment",
          transient_environment: false,
          production_environment: false
        )
        create_status(inactive_pinned_deployment, "success", integration: integration)
        create_status(inactive_pinned_deployment, "inactive", integration: integration)
        create_pin(inactive_pinned_deployment, repository)

        # Create a pending environment, but do not update the status, but still should be pending
        pending_deployment = create(
          repository: repository,
          head_sha: head_sha,
          integration: integration,
          environment: "pending_environment",
          transient_environment: false,
          production_environment: false
        )
      end

      def self.create(repository:, head_sha:, integration: nil, pull_request: nil, ref: nil,
        environment: "production", transient_environment: false, production_environment: true)
        raise Objects::ActionFailed, "integration or pull_request must be provided" unless integration || pull_request
        options = {}.tap do |opts|
          opts["sha"]                    = head_sha
          opts["ref"]                    = ref.nil? ? repository.default_branch : ref
          opts["creator"]                = integration.present? ? integration.bot : pull_request.user
          opts["repository"]             = repository
          opts["transient_environment"]  = transient_environment
          opts["production_environment"] = production_environment
          opts["environment"]            = environment
        end
        ::Deployment.create!(options)
      end

      def self.create_status(deployment, state, integration: nil)
        environment_url = state == "success" ? "https://example.com" : nil
        options = {}.tap do |opts|
          opts["deployment"]      = deployment
          opts["state"]           = state
          opts["creator"]         = integration.present? ? integration.bot : deployment.creator
          opts["log_url"]         = "https://heaven.githubapp.com/1234/logs"
          opts["environment_url"] = environment_url
        end
        ::DeploymentStatus.create!(options)
      end

      def self.create_pin(deployment, repository)
        env = ::Environment.first_or_create!(name: deployment.environment, repository: repository)
        ::PinnedEnvironment.first_or_create!(environment: env, repository: repository)
      end
    end
  end
end
