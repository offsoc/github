# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Push
      def self.create(committer:, repo:, branch_name:, files:, message: "Example commit message for checks")
        metadata = {
          message: message,
          committer: committer,
          author: committer,
        }

        original = Rails.application.config.active_job.queue_adapter
        ref = Seeds::Objects::Repository.branch(repo, branch_name)
        begin
          Rails.application.config.active_job.queue_adapter = :inline
          after_commit = ref.append_commit(metadata, committer) do |changes|
            files.each do |name, content|
              changes.add(name, content)
            end
          end
        ensure
          Rails.application.config.active_job.queue_adapter = original
        end

        push = nil
        # The push doesn't appear in the database immediately, we need to wait for it.
        # We will try for 30 seconds, max in local testing was 15 seconds
        30.times do |i|
          push = Repositories::Domain::Pushes.new(:test).by_repo_id_and_after(
            repository_id: repo.id,
            after: after_commit.oid
          )
          break unless push.nil?
          puts "Retrying, push isn't in db yet, attempt: #{i + 1}"
          sleep(1.second)
        end
        raise Objects::CreateFailed, "Push was not created from commit" if push.nil?
        push
      end
    end
  end
end
