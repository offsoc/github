# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Milestones < Seeds::Runner
      def self.help
        <<~HELP
        Create some generic milestones.

        Example Usage:
          # Create 10 milestones for the github/hub repository
          bin/seed milestones

          # Create 20 milestones for the monalisa/smile repository
          bin/seed milestones --repo_name=monalisa/smile --milestone_count=20
        HELP
      end

      def self.run(options = {})
        repo_name = options[:repo_name]
        milestone_count = options[:milestone_count]

        puts "Creating #{repo_name} repository..."
        repo = Seeds::Objects::Repository.create_with_nwo(
          nwo: repo_name,
          setup_master: true,
          is_public: true
        )

        new.run(repo, milestone_count)
      end

      def run(repo, milestone_count)
        create_milestones(repo: repo, milestone_count: milestone_count)
        repo
      end

      private

      def create_milestones(repo:, milestone_count: 10)
        puts "Creating #{milestone_count} #{repo.name_with_owner} milestones..."
        milestone_count.times do
          Seeds::Objects::Milestone.create(repository: repo)
        end
      end
    end
  end
end
