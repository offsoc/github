# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Issue
      ASSIGNEE_MAX = 5
      LABEL_MAX = 5

      def self.create(repo:, actor:, title: "My Issue", body: " #{Faker::Lorem.sentence}", state: "open", labels: [], assignees: [])
        issue = ::Issue.build(
          repository: repo,
          user: actor,
          title: title,
          body: body,
          state: state,
          labels: labels,
          assignees: assignees,
          skip_create_issue_orchestration: true,
        )
        issue.save

        o = IssueOrchestration.create_issue!(actor: issue.user, issue: issue)
        o.execute!(synchronous: true)

        raise Objects::CreateFailed, issue.errors.full_messages.to_sentence unless issue.valid?
        issue
      end

      def self.create_random(
        repo:,
        users: [],
        count: 20,
        rng: Random.new,
        labels: [],
        commit_reference_max: 0,
        issue_comment_max: 0,
        linked_issue_max: 0,
        batch_size: 25,
        batch_callback: nil
      )
        require_relative "../transaction_helper"
        issues = []
        Seeds::TransactionHelper.repeat_in_batches_with_transaction(
          batch_size: batch_size,
          batch_callback: batch_callback,
          times: count,
          record: ::Issue
        ) do
          issues << random_issue(
            repo: repo,
            users: users,
            rng: rng,
            issues: issues,
            labels: labels,
            commit_reference_max: commit_reference_max,
            issue_comment_max: issue_comment_max,
            linked_issue_max: linked_issue_max
          )
        end
        issues
      end

      def self.random_issue(
        repo:,
        users: [],
        rng: Random.new,
        issues: [],
        labels: [],
        commit_reference_max: 0,
        issue_comment_max: 0,
        linked_issue_max: 0
      )
        Faker::Config.random = rng

        issue = create(
          repo: repo,
          actor: users.sample(random: rng),
          title: Faker::Lorem.sentence,
          body: random_body(rng: rng, issues: issues, linked_issue_max: linked_issue_max),
          state: random_state(rng),
          labels: random_labels(rng: rng, labels: labels),
          assignees: random_assignees(users: users, rng: rng),
        )

        add_commit_references_to_issue(
          repo: repo,
          rng: rng,
          issue: issue,
          users: users,
          commit_reference_max: commit_reference_max
        )

        add_issue_comments_to_issue(
          issue: issue,
          repo: repo,
          rng: rng,
          issue_comment_max: issue_comment_max
        )

        issue
      end

      def self.random_assignees(users:, rng: Random.new)
        num_assignees = rng.rand(1..ASSIGNEE_MAX)
        users.sample(num_assignees, random: rng)
      end

      def self.random_state(rng = Random.new)
        rng.rand(0..1) == 0 ? "open" : "closed"
      end

      def self.random_body(rng: Random.new, issues: [], linked_issue_max: 0)
        num_paragraphs = rng.rand(1..20)
        body = ""

        num_paragraphs.times do
          body += Faker::Lorem.paragraph(sentence_count: 10, random_sentences_to_add: 5)
          body += "\n\n"
        end

        if linked_issue_max > 0
          num_related_issues = rng.rand(1..linked_issue_max)
          related_issues = issues.sample(num_related_issues, random: rng)

          related_issues.each do |issue|
            body += "Associated issue: ##{issue.number}\n\n"
          end
        end

        body
      end

      def self.random_labels(rng: Random.new, labels: [])
        num_labels = rng.rand(1..LABEL_MAX)
        labels.sample(num_labels, random: rng)
      end

      def self.random_commits(repo:, rng:, count: 10)
        branch = repo.heads.first
        return [] unless branch
        head = repo.rpc.read_refs["refs/heads/#{branch.name}"]
        repo.rpc.list_revision_history(head).sample(count, random: rng)
      end

      def self.add_commit_references_to_issue(repo:, rng:, issue:, users: [], commit_reference_max: 0)
        return unless commit_reference_max > 0

        number_references = rng.rand(1..commit_reference_max)
        commits = random_commits(repo: repo, count: number_references, rng: rng)
        user = users.sample(random: rng)
        commits.each do |commit|
          issue.reference_from_commit(user, commit, repo)
        end
      end

      def self.add_issue_comments_to_issue(issue:, repo:, rng:, issue_comment_max: 0)
        return unless issue_comment_max > 0

        number_comments = rng.rand(1..issue_comment_max)
        Seeds::Objects::IssueComment.create_random(
          issue: issue,
          users: repo.members,
          rng: rng,
          count: number_comments
        )
      end

      private_class_method :random_state, :random_body, :random_assignees, :random_labels, :random_commits,
          :add_commit_references_to_issue, :add_issue_comments_to_issue
    end
  end
end
