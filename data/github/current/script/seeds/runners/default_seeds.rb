# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class DefaultSeeds < Seeds::Runner
      def self.help
        <<~HELP
        Generates seeds that are default for local GitHub application development.
        These seeds include:
        - The monalisa user (as a stafftools user)
        - The github organization
        - The github/hub repo, with default branch
        HELP
      end

      def self.run(options = {})
        mona = Seeds::Objects::User.monalisa
        Seeds::Objects::Organization.github(admin: mona)
        Seeds::Objects::User.add_stafftools(mona)

        begin
          hub_repo = Seeds::Objects::Repository.hub_repo
          Seeds::Objects::Repository.branch(hub_repo, hub_repo.default_branch)
        rescue Git::Ref::ReferenceExistsError => err
          puts "Failed to set up hub repository seed: #{err.message}"
        end
      end
    end
  end
end
