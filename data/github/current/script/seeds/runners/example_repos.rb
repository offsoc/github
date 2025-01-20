# typed: true
# frozen_string_literal: true

require_relative "../runner"

# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class ExampleRepos < Seeds::Runner
      # Only GitHub-owned repos with test data should be included here in order to avoid privacy issues.
      REPOS = %w[example-rails-app example-golang-app]
      CLONE_URL_TEMPLATE = "git@github.com:github/%s.git"
      DEFAULT_COMMIT_COUNT = 10
      DEFAULT_RAND_SEED_VALUE = 200

      def self.help
        <<~HELP
        Seeds pre-made repos with existing test file data and persists changes to the local database. These repos
        are owned by GitHub and are used for testing purposes only.
        HELP
      end

      def self.run(options = {})
        mona = Seeds::Objects::User.monalisa
        puts "-> #{REPOS.count} example repos will be cloned and persisted to the local database."
        repos = clone_example_repos(options)

        commit_count = options[:commit_count] || DEFAULT_COMMIT_COUNT
        seed_value = options[:seed_value] || DEFAULT_RAND_SEED_VALUE

        if commit_count == 0
          puts " -> Skipping commit generation because commit_count is 0."
        end

        rng = Random.new(seed_value)
        Faker::Config.random = rng

        additional_user_count = options[:user_count] || 0
        users = get_users(additional_user_count, rng)

        repos.each do |repo|
          repo.add_members(users)

          # The strategy relies on a random number generator seed value. It's important that no other random number
          # generator is used in this process, otherwise the results will be different between runs.
          puts "   -> Generating #{commit_count} commits for repo '#{repo.name}'..."
          Seeds::Objects::Commit.random_create(repo: repo, count: commit_count, rng: rng)
        end

        repos
      end

      def self.get_clone_url(repo_name)
        CLONE_URL_TEMPLATE % [repo_name]
      end

      def self.get_repos
        REPOS
      end

      def self.clone_example_repos(options = {})
        repos = []
        get_repos.each do |repo_name|
          repo = clone_repo(repo_name, options)
          repo.reload
          repos << repo
        end

        repos
      end

      # Clones repo and assigns it to GitHub. If the repo already exists, it will be deleted and re-cloned.
      def self.clone_repo(repo_name, options)
        repo = ::Repository.find_by(name: repo_name, owner_login: "github")
        if repo
          puts " -> Repo '#{repo.name}' exists. Deleting repo and related data before cloning..."
          ::Issue.delete_by(repository_id: repo.id)
          ::IssueComment.delete_by(repository_id: repo.id)
          ::Label.delete_by(repository_id: repo.id)
          ::PullRequest.delete_by(repository_id: repo.id)
          ::PullRequestReview.delete_by(repository_id: repo.id)
          ::PullRequestReviewThread.delete_by(repository_id: repo.id)
          repo.delete
        end

        clone_url = get_clone_url(repo_name)
        puts " -> Cloning repo '#{repo_name}'..."
        repo = Seeds::Objects::Repository.restore_premade_repo(
          location_premade_git: clone_url,
          owner_name: "github",
          repo_name: repo_name,
          is_public: true,
          import_users: options[:import_users]
        )

        repo
      end

      def self.get_users(count = 0, rng)
        users = [Seeds::Objects::User.monalisa]
        puts " -> Getting #{count + 1} repo participant(s)..."
        if count > 0
          users << Seeds::Objects::User.random_create(count: count, rng: rng)
        end
        users
      end
    end
  end
end
