# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class CheckSuite
      # Manually create a check suite
      def self.create(repo:, app:, head_branch:, head_sha:, push: nil, attrs: nil)
        check_suite_attrs = {
          repository_id: repo.id,
          github_app_id: app.id,
          head_branch: head_branch,
          head_sha: head_sha,
          creator_id: push&.pusher_id,
          push_id: push&.id
        }

        check_suite_attrs.merge!(attrs) if attrs
        check_suite_attrs[:name] = Faker::App.name if check_suite_attrs[:name].blank?

        check_suite = ::CheckSuite.create!(check_suite_attrs)

        check_suite
      end

      def self.create_artifacts(check_suite, additional = {})
        artifacts_data = [
          {
            name: "Artifact 1",
            source_url: "https://dev.azure.com/Account/project/_build/artifacts_1.zip",
            size: 102400,
            created_at: "2019-06-05T00:00:00Z",
            repository: check_suite.repository,
          },
          {
            name: "Artifact 2",
            source_url: "https://dev.azure.com/Account/project/_build/artifacts_2.zip",
            size: 204800,
            created_at: "2019-06-05T00:01:00Z",
            repository: check_suite.repository,
          },
        ]

        artifacts_data << additional if additional.present?
        check_suite.artifacts.build(artifacts_data)
        check_suite.save!
      end
    end
  end
end
