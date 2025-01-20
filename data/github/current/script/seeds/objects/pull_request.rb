# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class PullRequest
      def self.create(
        repo:,
        committer:,
        commit: nil,
        title: "New Pull Request",
        issue: nil,
        base_ref: nil,
        is_draft: false,
        reviewer_team_ids: [],
        reviewer_user_ids: []
      )
        filename = "file-#{SecureRandom.hex}.md"
        base_commit = Seeds::Objects::Commit.create(
          repo: repo,
          committer: committer,
          branch_name: repo.default_branch,
          files: {
            filename => "# File\n\nLast updated #{Time.current}"
          },
          message: "New commit - add #{filename}",
        )
        base_ref ||= repo.refs.first

        # Make a new commit
        commit = repo.commits.create({ message: "A contribution", committer: committer }, base_commit.oid) do |files|
          files.add "new-file-#{SecureRandom.hex}", "This is a new file\n\nLast updated #{Time.current}"
        end

        # Create the head ref
        branch_name = SecureRandom.hex
        head_ref = repo.refs.create("refs/heads/branch-#{branch_name}", commit.oid, committer)

        # Create the pull request
        ::PullRequest.create_for!(
          repo,
          user: committer,
          title: title,
          body: "This adds a new file to the repo.",
          head: head_ref.name,
          base: base_ref.name,
          issue: issue,
          draft: is_draft,
          reviewer_user_ids: reviewer_user_ids,
          reviewer_team_ids: reviewer_team_ids,
        )
      end
    end
  end
end
