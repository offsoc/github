# typed: true
# frozen_string_literal: true

require_relative "../runner"
require_relative "github_repo"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class ComplexFeaturedTopics < Seeds::Runner
      def self.help
        <<~HELP
        Loads the latest real data from the explore repository into the database, if not already present, and
        adds anywhere from 1 to 20 topics to the given repository.

        Example Usage:
          bin/seed complex_featured_topics --nwo owner/repo --topics_to_add 20
        HELP
      end

      def self.run(options = {})
        if options[:nwo].present?
          repo = Repository.nwo(options[:nwo])
          raise Runner::RunnerError, "Could not find repo '#{options[:nwo]}'" if repo.blank?

          puts "-> Creating topics for #{repo.name}"
        end

        topics_to_add = options[:topics_to_add] || RepositoryTopic::LIMIT_PER_REPOSITORY
        if topics_to_add > RepositoryTopic::LIMIT_PER_REPOSITORY || topics_to_add < 1
          topics_to_add = RepositoryTopic::LIMIT_PER_REPOSITORY
        end
        require_relative "../factory_bot_loader"

        if Repository.nwo("github/explore").blank?
          Seeds::Runner::GitHubRepo.run(nwo: "github/explore")
          importer = TopicImporter.new
          latest_sha = importer.topics_repository.heads.find(importer.topics_repository.default_branch).try(:target_oid)
          _, tree_entries, _ = importer.topics_repository.tree_entries(latest_sha, TopicImporter::TOPICS_PATH)
          all_topic_directories = tree_entries.select { |entry| entry.type == "tree" }.pluck(:name)
          importer.import(dry_run: false, topic_names: all_topic_directories)
          Topic.update_all(featured: true)
        end

        return if repo.blank?

        max_offset = Topic.count - topics_to_add
        max_offset = 0 if max_offset < 0

        # Assign the repo to a random set of topics
        Topic.offset(rand(max_offset)).limit(topics_to_add).each do |topic|
          begin
            FactoryBot.create(:repository_topic, topic: topic, repository: repo)
          rescue ActiveRecord::RecordInvalid => e
            # this happens if a repo was already assigned to some topics, because of the global 20 topic limit
            break
          end
        end
      end
    end
  end
end
