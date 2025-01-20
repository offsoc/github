# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class ActionsRepos < Seeds::Runner
      ACTIONS_API_URL = "https://api.github.com/orgs/actions/repos?per_page=100"

      def self.help
        <<~HELP
        Copies over a number of repositories from the actions org and instantiates repo actions Marketplace Listings for them
        HELP
      end

      class << self
        def run(options = {})
          user = User.find_by(login: options[:login]) || Seeds::Objects::User.monalisa
          Seeds::Objects::User.two_factor_enable!(user: user)

          if options[:use_marketplace]
            puts "Making sure there's an integrators agreement in place"
            agreement = Marketplace::Agreement.latest_for_integrators || Seeds::Objects::MarketplaceAgreement.create(signatory_type: :integrator)
          end

          org = Seeds::Objects::Organization.create(login: "actions", admin: user)
          response = Net::HTTP.get_response(URI(ACTIONS_API_URL))
          repos = JSON.parse(response.body).reject { |r| r["archived"] }
          repos = repos.first(options[:count]) if options[:count]
          msg = "Found #{repos.size} repos from the actions org"
          msg += " of the requested #{options[:count]}"
          puts msg

          Dir.mktmpdir do |dir|
            Dir.chdir(dir) do
              repos.each { |r| puts "=" * 30; copy_repo(user, agreement, r, options[:use_marketplace]) }
            end
          end
        end

        private

        # Wrapping this makes it easy to test
        def run_cmd(cmd)
          system(cmd)
        end

        def copy_repo(user, agreement, actions_repo, use_marketplace)
          puts "Cloning Actions Repo #{actions_repo['clone_url']}"
          puts "Creating directory #{actions_repo['name']}"
          FileUtils.mkdir(actions_repo["name"]) # Make sure the path isnt empty, useful for tests
          puts "Git clone"
          run_cmd("git clone -q #{actions_repo['clone_url']} #{actions_repo["name"]}")
          clone_path = Pathname.new(actions_repo["name"])
          action_dir = clone_path.join(".git")
          action_path = if File.exist?(clone_path.join("action.yml"))
            "action.yml"
          elsif File.exist?(clone_path.join("Dockerfile"))
            "Dockerfile"
          end

          puts "Pushing to local"
          # We're only pulling the public repos, so these should be public too
          if Rails.env.test?
            repo = Seeds::Objects::Repository.create_with_nwo(nwo: actions_repo["full_name"], setup_master: false, is_public: true)
          else
            repo = Seeds::Objects::Repository.restore_premade_repo(location_premade_git: action_dir.realpath.to_s, owner_name: "actions", repo_name: actions_repo["name"], is_public: true)
          end

          # Required to make sure the repo is in the right state
          repo.reload

          # Mock out some data to help tests hit these code paths.
          # This is needed since we dont actually clone the repo
          if Rails.env.test?
            FileUtils.touch("action.yml")
            Seeds::Objects::Commit.create(
              committer: user,
              repo: repo,
              branch_name: repo.default_branch,
              files: { "action.yml" => "" },
              message: "Add action.yml"
            )
            repo.reset_git_cache

            action_path = "action.yml"
          end

          if use_marketplace
            create_repo_action_and_publish_to_marketplace(repo, user, agreement, action_path)
          end
        end

        public

        def create_repo_action_and_publish_to_marketplace(repo, user, agreement, action_path)
          return unless action_path

          puts "Creating RepositoryAction for #{action_path}"
          action = ::RepositoryAction.find_by(repository: repo, path: action_path) || ::RepositoryAction.create!(name: repo.name, repository: repo, path: action_path)
          action.update_column(:security_email, user.emails.first.email) if action.security_email.blank?

          puts "Signing agreement for that action"
          if action.owned_by_org?
            unless action.org_has_signed_integrator_agreement?(org: action.owner, agreement: agreement)
              action.sign_developer_agreement(actor: user, agreement: agreement, org: action.owner)
            end
          else
            unless action.has_signed_integrator_agreement?(user: user, agreement: agreement)
              action.sign_developer_agreement(actor: user, agreement: agreement)
            end
          end

          puts "Creating a release and publishing on marketplace: tag v#{repo.releases.count + 1}.0.0"
          release = Release.create!(
            repository: action.repository,
            author: user,
            state: :published,
            name: "#{repo.name} Release ##{repo.releases.count + 1}",
            tag_name: "v#{repo.releases.count + 1}.0.0",
          )
          action.repository_action_releases << RepositoryActionRelease.new(release: release, published_on_marketplace: true)
          action.listed!
          action.categories = Marketplace::Category.all.sample(2)
          action.save!
        end
      end
    end
  end
end
