# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Stars < Seeds::Runner
      def self.help
        <<~HELP
        Create stars for repositories.

        If a repository nwo is provided, ensures that it exists, creating it
        if not.
        HELP
      end

      def self.run(options = {})
        # Repository.
        puts "Setting up repository."
        repo_nwo = options["repo"] || "monalisa/#{Faker::Color.color_name}"
        repo = Seeds::Objects::Repository.create_with_nwo(nwo: repo_nwo, setup_master: true, is_public: true)
        puts "... Set up repository #{repo.nwo}."

        puts "Generating #{options["star-count"]} stars."
        options["star-count"].times do |n|
          user = Seeds::Objects::User.create(login: "#{Faker::Name.unique.first_name}#{n}")
          raise Objects::CreateFailed, user.errors.full_messages.to_sentence unless user.valid?

          star = repo.stars.create(user_id: user.id)
          raise Objects::CreateFailed, star.errors.full_messages.to_sentence unless star.valid?

          repo.update_stargazer_count!
        end
      end
    end
  end
end
