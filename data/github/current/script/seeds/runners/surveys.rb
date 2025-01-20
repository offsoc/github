# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Surveys < Seeds::Runner
      def self.help
        <<~HELP
        Creates a survey with q questions and fills in answers for all users.
        -t [title] - The title of the survey
        -s [slug] - The slug of the survey
        -q [question_count] - The number of questions to create
        -u [user_count] - The number of users to create answers for. Default is total number of users in the databse.
        HELP
      end

      def self.run(options = {})
        title = options[:title]
        slug = options[:slug]
        question_size = options[:question_count] || 0
        user_count = options[:user_count] || 0

        return Seeds::Objects::Survey.create_filled(title: title, slug: slug, count: question_size, user_count: user_count) unless question_size.zero?

        Seeds::Objects::Survey.create(title: title, slug: slug)

      end
    end
  end
end
