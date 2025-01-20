# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds

  class Runner
    class IssuesLoad < Seeds::Runner
      def self.help
        <<~HELP
        Create seed data to help investigate scalability of Issues by creating large volume of issues and labels
        HELP
      end

      def self.mona
        Seeds::Objects::User.monalisa
      end

      def self.run(options = {})
        repo_name = options[:repo_name]
        label_count = options[:label_count]
        issue_count = options[:issue_count]
        org = Seeds::Objects::Organization.github

        puts "Creating repository..."
        repo = Seeds::Objects::Repository.create_with_nwo(
          nwo: repo_name,
          setup_master: true,
          is_public: true
        )

        GitHub::RateLimitedCreation.disable_content_creation_rate_limits do
          Label.delete_all
          Label.transaction do
            label_count.times do |i|
              puts "Creating label " + i.to_s + "/" + label_count.to_s
              Seeds::Objects::Label.create(
                repo: repo,
                name: "label " + i.to_s
              )
            end
          end

          labels = repo.sorted_labels
          label_count = labels.length

          Issue.transaction do
            issue_count.times do |i|
              puts "Creating issue " + i.to_s + "/" + issue_count.to_s
              Seeds::Objects::Issue.create(
                repo: repo,
                actor: self.mona,
                title: Faker::Book.title,
                body: "This is the body of issue " + i.to_s,
                labels: [labels[rand(label_count)]]
              )
            end
          end
        end

        repo
      end
    end
  end
end
