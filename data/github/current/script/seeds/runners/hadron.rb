# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Hadron < Seeds::Runner
      REPOS_ORG = "repos-org"
      REPO_NAME = "maximum-effort"
      CONFIG_REPO_NAME = ".github"

      def self.help
        <<~HELP
        - Adds copilot_hadron_editor feature flag and corresponding feature preview.
        HELP
      end

      def self.run(options = {})
        require_relative "../../create-launch-github-app"

        user = Seeds::Objects::User.monalisa
        puts "--- Creating features ---"
        create_features(user)
      end

      def self.create_features(user)
        if !FlipperFeature.find_by(name: :copilot_hadron_editor)
          FlipperFeature.create(name: :copilot_hadron_editor).enable(user)
          puts "Created FlipperFeature: copilot_hadron_editor"
        else
          puts "FlipperFeature: copilot_hadron_editor already exists"
        end

        copilot_hadron_editor_feature = FlipperFeature.find_by(name: :copilot_hadron_editor)

        if !Feature.find_by(slug: :copilot_hadron_editor)
          Feature.create(
            public_name: "New PR authorship experience",
            slug: :copilot_hadron_editor,
            flipper_feature: copilot_hadron_editor_feature,
            feedback_link: "https://github.com/community/community/discussions/categories/general-feedback",
            enrolled_by_default: true
          )
          puts "Created Feature: Hadron editor"
        else
          puts "Feature: Hadron editor already exists"
        end
      end
    end
  end
end
