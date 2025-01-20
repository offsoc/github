# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class CommitComment
      def self.create(repo: , user:, comment: "#{Faker::Lorem.sentence}")
        require_relative Rails.root.join("script/seeds/objects/commit")

        commit = Seeds::Objects::Commit.create(
          committer: user,
          repo: repo,
          branch_name: repo.default_branch,
          files: {
            "commit-notification.txt" => Faker::Lorem.paragraph(sentence_count: 20)
          },
          message: Faker::Lorem.sentence,
        )

        ::CommitComment.create!(
          repository: repo,
          user: user,
          commit_id: commit.oid,
          body: "#{Faker::Lorem.sentence}"
        )
      end
    end
  end
end
