# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Deployments < Seeds::Runner
      def self.help
        "Create all variations of a deployment and its status"
      end

      def self.run(options = {})
        repo = if options[:nwo].present?
          Seeds::Objects::Repository.create_with_nwo(nwo: options[:nwo], setup_master: true, is_public: false)
        else
          Seeds::Objects::Repository.hub_repo
        end

        # Attempt to find an existing installation if possible.
        integration =
          if (app = Integration.find_by(owner: repo.owner))
            installation = IntegrationInstallation.with_repository(repo).find_by(integration: app)
            installation.present? ? app : nil
          end

        app_name = options[:integration_slug].present? ? options[:integration_slug] : "Deployment Bot"
        integration ||= Seeds::Objects::Integration.create(repo: repo, owner: repo.owner, app_name: app_name)
        user = repo.owner.is_a?(Organization) ? repo.owner.admins.first : repo.owner

        pr = if options[:pr].present?
          PullRequest.with_number_and_repo(options[:pr], repo)
        else
          Seeds::Objects::PullRequest.create(repo: repo, committer: user)
        end

        if pr.nil?
          raise Runner::RunnerError, "Pull Request could not be found/created with PR number #{options[:pr]} on repo #{repo.nwo}"
        end

        Seeds::Objects::Deployment.create_all_variations!(repository: repo, head_sha: pr.head_sha, integration: integration)
      end
    end
  end
end
