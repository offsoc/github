# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class RepoPullRequestsFromCommits < Seeds::Runner
      LABEL_MAX = 5

      def self.help
        <<~HELP
        Creates pull requests in a repo based on commit history, attempting to pull head into the most recent
        commit, and then from that commit into each subsequent commit, going back in time
        a configurable number of commits, or until all are exhausted.

        Example Usage:
          bin/seed repo_pull_requests_from_commits --nwo owner/repo --limit 100
        HELP
      end

      def self.run(options = {})
        repo = Repository.nwo(options[:nwo])
        user = Seeds::Objects::User.monalisa
        repo.add_member(user) unless repo.members.include?(user)
        limit = (options[:limit]&.to_i || 100)
        reviewers = repo.members

        puts "-> Seeding '#{repo.name}' with #{limit} PRs from commits."

        commits = repo.revision_list(repo.default_oid)
        commits.shift
        head = repo.default_branch

        created_count = 0
        commits.each do |commit|
          branch_name = "branch-#{commit}"
          ref_name = "refs/heads/#{branch_name}"
          next if repo.heads.include?(ref_name)
          created_head_ref = repo.heads.create(ref_name, commit, repo.members.sample)

          created_pull_request = ::PullRequest.create_for!(
            repo,
            user: repo.members.sample,
            title: Faker::Lorem.sentence,
            body: "#{Faker::Lorem.paragraph} Closes \##{repo.issues.sample&.number}",
            head: head,
            base: created_head_ref.name,
            reviewer_user_ids: repo.members.sample,
            draft: [true, false].sample,
          )

          created_pull_request.issue.add_labels(repo.labels.sample(rand(1..LABEL_MAX)))

          created_count += 1

          head = created_head_ref.name
          break if created_count >= limit
        end
      end
    end
  end
end
