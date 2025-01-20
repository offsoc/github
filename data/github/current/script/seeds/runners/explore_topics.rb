# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class ExploreTopics < Seeds::Runner
      FEATURED_TOPICS = %w(3d babel graphql hacktoberfest clojure terminal perl markdown npm pico-8 git).freeze
      CURATED_TOPICS = %w(vue android serverless macOS firefox elixir html ruby).freeze
      NORMAL_TOPICS = %w(iOS ubuntu react algorithm ajax continuous-integration dotnet crystal).freeze
      TOPICS_PER_REPO = 3
      MAX_TOPICS_PER_REPO = 20

      def self.help
        <<~HELP
        TODO
        HELP
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"

        new.run(options)
      end

      def run(options)
        create_explore_repo
        users = create_repository_owners
        repos = create_repositories(users)
        create_topics(repos)
      end

      private

      def create_explore_repo
        puts "Ensuring #{ExploreRepositoryFileReader.repository_name_with_owner} repo exists"
        Seeds::Objects::Repository.restore_premade_repo(
          owner_name: ExploreRepositoryFileReader::REPO_OWNER,
          repo_name: ExploreRepositoryFileReader::REPO_NAME,
          location_premade_git: "test/fixtures/git/examples/explore.git",
          is_public: true,
        )
      end

      def create_repository_owners
        total_users = 5
        users = User.limit(total_users).to_a

        if users.size < total_users
          total_to_make = total_users - users.size
          puts "Creating #{total_to_make} user(s)"
          total_to_make.times do
            users << FactoryBot.create(:user, :verified)
          end
        end

        users
      end

      def create_repositories(repo_owners)
        total_repos = 8
        repos = Repository.public_scope.limit(total_repos).to_a

        if repos.size < total_repos
          total_to_make = total_repos - repos.size
          total_to_make.times do
            repo_name = "repo-#{SecureRandom.hex(16)}"
            repo_owner_login = repo_owners.sample.login
            puts "Creating repository #{repo_owner_login}/#{repo_name}"
            repos << Seeds::Objects::Repository.create_with_nwo(
              nwo: "#{repo_owner_login}/#{repo_name}",
              setup_master: false,
              is_public: true,
            )
          end
        end

        repos
      end

      def create_topics(repos)
        FEATURED_TOPICS.each do |name|
          topic = create_topic(name, factory: :featured_topic)
          apply_topic_to_repositories(topic, repos)
        end
        CURATED_TOPICS.each do |name|
          topic = create_topic(name, factory: :curated_topic)
          apply_topic_to_repositories(topic, repos)
        end
        NORMAL_TOPICS.each do |name|
          topic = create_topic(name)
          apply_topic_to_repositories(topic, repos)
        end
      end

      def apply_topic_to_repositories(topic, repos)
        if topic.applied_repository_topics.count >= TOPICS_PER_REPO
          puts "- Already applied to #{TOPICS_PER_REPO} repositories"
          return
        end

        other_repos = repos.reject { |repo| repo.topics.include?(topic) || repo.topics.count >= MAX_TOPICS_PER_REPO }

        TOPICS_PER_REPO.times do
          repo = other_repos.sample
          add_topic_to_repository(topic, repo)
          other_repos -= [repo]
        end
      end

      def create_topic(name, factory: :topic)
        topic = Topic.find_by(name: name)

        if topic
          puts "Found topic #{name}"
        else
          description = if factory == :featured_topic
            "featured "
          elsif factory == :curated_topic
            "curated "
          end
          puts "Creating #{description}topic #{name}"
          topic = FactoryBot.create(factory, name: name)
        end

        if factory == :featured_topic && !topic.featured?
          puts "- Featuring topic"
          topic.update_attribute(:featured, true)
        end

        if factory == :curated_topic && topic.short_description.blank?
          puts "- Adding details to curated topic"
          topic.update_attribute(:short_description, Faker::Lorem.paragraph)
          topic.update_attribute(:wikipedia_url, "https://en.wikipedia.org/wiki/Bash_(Unix_shell)")
          topic.update_attribute(:github_url, "https://github.com/android")
          topic.update_attribute(:released, "January 2002")
          topic.update_aliases_from_names("c-plus-plus, cpp11, cpp14, cpp17, cpp98, cpps")
          topic.update_related_topics_from_names("vue, angular")
        end

        topic
      end

      def add_topic_to_repository(topic, repo)
        puts "- Adding #{topic} to #{repo.nwo}"
        FactoryBot.create(:repository_topic, topic: topic, repository: repo)
      end
    end
  end
end
