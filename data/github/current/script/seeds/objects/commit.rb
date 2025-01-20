# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Commit
      DEFAULT_NUM_RANDOM_COMMITS = 20

      def self.create(
        repo:,
        message: "A Message",
        committer:,
        branch_name: repo.default_branch,
        files: { "File.md" => "My Content" },
        from_branch: repo.default_branch,
        date: Time.now.iso8601
      )
        metadata = {
          message: message,
          committer: committer,
          author: committer,
          pushed_date: date,
          commit_date: date,
          authored_date: date
        }

        # a branch can't branch from itself
        if branch_name == from_branch
          from_branch = nil
        end

        ref = Seeds::Objects::Git::Ref.find_or_create_branch_ref(repo: repo, ref_name: branch_name, target_ref_name: from_branch)
        ref.append_commit(metadata, committer) do |changes|
          files.each do |name, content|
            changes.add(name, content)
          end
        end
      end

      # Creates a random commit using the repo's existing file contents.
      class << self
        def random_create(
          repo:,
          users: [],
          count: DEFAULT_NUM_RANDOM_COMMITS,
          branch: repo.default_branch,
          rng: Random.new,
          files: {}
        )
          require_relative "../transaction_helper"
          Faker::Config.random = rng

          if files.empty?
            files = Seeds::Objects::Repository.get_repo_blob_contents(repo: repo, branch: branch)
          end

          if users.empty?
            users = repo.members
          end

          commits = []
          Seeds::TransactionHelper.repeat_in_batches_with_transaction(batch_size: 5, times: count, record: ::Push) do
            user = users.sample(1, random: rng).first
            commits << random_commit(repo: repo, branch: branch, rng: rng, files: files, user: user)
          end

          commits
        end

        private

        # Given a repo, generate a number of commits with random changes to the repo.
        def random_commit(repo:, branch:, rng:, files:, user:)
          random_files = pick_random_files(files: files, rng: rng)
          file_changes = random_changes_for_files(files: random_files, rng: rng)

          commit = create(
            repo: repo,
            committer: user,
            branch_name: branch,
            message: rng.rand(0..1) == 0 ? Faker::Quote.matz : Faker::Quote.yoda,
            files: file_changes,
          )

          # Maintain changes in memory so that we don't have to rebuild the file contents after each commit.
          files.merge!(file_changes)
          commit
        end

        # Picks a random number of files and return a hash of the same format.
        def pick_random_files(files:, rng:)
          file_count = files.length
          return files if file_count == 1

          number_of_files_to_sample = rng.rand(1..files.length)
          Hash[files.to_a.sample(number_of_files_to_sample, random: rng)]
        end

        # Generates a random list of file changes using file content from the given repo.
        def random_changes_for_files(files:, rng:)
          files.transform_values { |file_content|
            file_content.empty? ? Faker::Lorem.sentence : random_change_for_text(file_content, rng: rng)
          }
        end

        # Applies random edits to the given text content.
        # This was borrowed and modified from PullRequestSyntaxHighlighting.make_random_changes
        def random_change_for_text(text, rng:)
          operation_shuffle_line = -> (content) {
            lines = content.split("\n")
            rand_line_position = rng.rand(0..lines.length - 1)
            shuffled_line = lines[rand_line_position].split("").shuffle(random: rng).join
            lines[rand_line_position] = shuffled_line
            lines.join("\n")
          }

          operation_add_new_line = -> (content) {
            rng.rand(0..1) == 0 ? content + "\n" : "\n" + content
          }

          operations = [operation_shuffle_line, operation_add_new_line]
          operation_index = rng.rand(0..(operations.count - 1))
          random_operation = operations[operation_index]
          random_operation.call(text)
        end
      end
    end
  end
end
