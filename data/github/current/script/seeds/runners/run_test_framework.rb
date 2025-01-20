# typed: true
# frozen_string_literal: true

require_relative "../runner"
require_relative "actions_repos"
require_relative "complex_featured_topics"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class RunTestFramework < Seeds::Runner
      def self.help
        <<~HELP
          Runs the new test data framework scenerios.
        HELP
      end

      def self.execute_generator(scenario, arguments = "")
        system("DEVELOPMENT_MYSQL_POOL=20 rails runner script/dx/data/generator.rb #{scenario} -t 16 #{arguments}")
      end

      def self.run(options = {})
        Seeds::Runner::ComplexFeaturedTopics.execute
        Seeds::Runner::ActionsRepos.execute
        execute_generator("repositories", "--activity_multiple=5")
        execute_generator("syntax_highlighting")
        execute_generator("pages")
        execute_generator("discussions/from_issues")
        execute_generator("discussions/long_content_discussions")
        execute_generator("discussions/many_custom_categories")
        execute_generator("discussions/many_discussions")
      end
    end
  end
end
