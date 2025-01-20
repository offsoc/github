# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class ContributionGraph < Seeds::Runner
      include GitHub::Memoizer

      def self.help
        <<~HELP
        Seed contribution graph for local development

        Seeding
        - Finds or creates a repository owned by monalisa with the specified `public` setting
        - Creates 1-4 Commits for each day between now and `number_of_days` ago
        - Backfills the repo with the new commit data
        HELP
      end

      def self.run(options = {})
        new.run(options)
      end

      def run(options = {})
        repo = is_public?(options) ? public_repo : private_repo
        days = number_of_days(options)

        puts "Creating #{repo.visibility} contributions for the last #{days} days"

        days.times do |day|
          puts "Creating #{commits_per_day} #{repo.visibility} contributions on "\
          "#{day.days.ago.strftime("%b %e, %Y")}"
          commits_per_day.times do
            Seeds::Objects::Commit.create(
              repo: repo,
              committer: monalisa,
              message: Faker::TvShows::RuPaul::quote,
              files: { "File.md" => Faker::GreekPhilosophers.quote },
              date: day.days.ago.iso8601
            )
          end
        end

        puts "Backfilling contributions for #{repo.full_name}"
        CommitContribution.backfill!(repo, true)
      end

      def number_of_days(options = {})
        options[:number_of_days] || 365
      end

      def is_public?(options = {})
        return options[:public] if options.key?(:public)
        true
      end

      def commits_per_day
        rand(0..4)
      end

      memoize def monalisa
        Seeds::Objects::User.monalisa
      end

      memoize def public_repo
        find_or_create_repo(is_public: true)
      end

      memoize def private_repo
        find_or_create_repo(is_public: false)
      end

      def find_or_create_repo(is_public: false)
        monalisa.repositories.where(public: is_public).first || create_repo(is_public: is_public)
      end

      def create_repo(is_public: false)
        Seeds::Objects::Repository.create(
          owner_name: "monalisa",
          repo_name: is_public ? "public_repo" : "private_repo",
          setup_master: true,
          is_public: is_public,
          description: "#{Faker::TvShows::Spongebob.quote}"
        )
      end
    end
  end
end
