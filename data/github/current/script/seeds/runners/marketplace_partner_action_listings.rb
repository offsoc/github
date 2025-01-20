# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class MarketplacePartnerActionListings < Seeds::Runner
      # This uses the list in /packages/management_tools/app/models/repository_actions/action_partners.rb
      CHECKOUT_ACTION_API_URL = "https://api.github.com/repos/actions/checkout"
      def self.help
        <<~HELP
        Creates a sample listing for all action partners with custom icons in the Marketplace for local development.
        HELP
      end

      class << self
        def run(options = {})
          # Delay loading these at it makes the script app slow because it boots github
          require_relative Rails.root.join("packages/management_tools/app/models/repository_actions/action_partners.rb")
          require_relative Rails.root.join("script/seeds/runners/actions_repos")

          user = Seeds::Objects::User.monalisa
          Seeds::Objects::User.two_factor_enable!(user: user)

          repo = JSON.parse(Net::HTTP.get_response(URI(CHECKOUT_ACTION_API_URL)).body)

          clone_path = clone_repo(repo, Dir.mktmpdir("checkout-"))

          begin
            puts "Make partner orgs and sample actions"
            RepositoryActions::ActionPartners::CUSTOM_ICON_PARTNERS.each do |partner|
              Seeds::Objects::Organization.create(login: partner, admin: user)
              make_sample_action_for_partner(user, clone_path, partner)
            end
          ensure
            FileUtils.rm_rf(clone_path)
          end
        end

        private

        def clone_repo(source_repo, destination)
          puts "Cloning Actions Repo #{source_repo['clone_url']}"
          puts "Creating directory #{destination}"
          puts "Git clone"
          system("git clone -q #{source_repo['clone_url']} #{destination}")

          Pathname.new(destination)
        end

        def make_sample_action_for_partner(user, clone_path, partner)
          require "pathname"

          partner_action_name = "#{partner}-sample"
          puts "Pushing to local for #{partner_action_name}"

          action_dir = clone_path.join(".git")
          action_path = if File.exist?(clone_path.join("action.yml"))
            "action.yml"
          elsif File.exist?(clone_path.join("Dockerfile"))
            "Dockerfile"
          end

          repo = Seeds::Objects::Repository.restore_premade_repo(location_premade_git: action_dir.realpath.to_s, owner_name: partner, repo_name: partner_action_name, is_public: true)

          # Required to make sure the repo is in the right state
          repo.reload

          # modify action.yml to have the repo name as the action name
          action_yml = YAML::load_file(clone_path.join(action_path))
          action_yml["name"] = partner_action_name
          File.open(clone_path.join("action.yml"), "w") do |f|
            f.write(action_yml.to_yaml)
          end

          Seeds::Objects::Commit.create(
            committer: user,
            repo: repo,
            branch_name: repo.default_branch,
            files: { "action.yml" => "" },
            message: "Update name in action.yml"
          )
          repo.reset_git_cache

          agreement = Marketplace::Agreement.latest_for_integrators || Seeds::Objects::MarketplaceAgreement.create(signatory_type: :integrator)

          puts "Creating action #{partner_action_name} and publishing to marketplace"
          Seeds::Runner::ActionsRepos.create_repo_action_and_publish_to_marketplace(repo, user, agreement, action_path)
        end
      end
    end
  end
end
