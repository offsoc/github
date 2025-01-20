# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class OrganizationProgrammaticAccess < Seeds::Runner
      def self.help
        <<~HELP
        Creates a PAT V2 for the given user and target (organization)
        HELP
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"

        # TODO accept permissions, repos, repo_selection, etc
        user = User.find_by_login(options[:user]) || Seeds::Objects::User.monalisa
        organization = Organization.find_by_login(options[:target]) || Seeds::Objects::Organization.github
        repositories = organization.repositories.to_a if organization.login == "github"

        grant_request = ProgrammaticAccessGrantRequest.create(
          actor: user,
          target: organization,
          access: FactoryBot.create(:user_programmatic_access, owner: user),
          repository_selection: :all,
          permissions: { "metadata" => :read }
        )

        ProgrammaticAccessGrantRequest.approve(grant_request, organization.admins.first, entry_point: :test_helper)
      end
    end
  end
end
