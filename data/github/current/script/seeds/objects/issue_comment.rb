# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class IssueComment
      def self.create(issue:, user:, body: " #{Faker::Lorem.sentence}")
        issue_comment = ::IssueComment.build(
          issue: issue,
          user: user,
          body: body,
          skip_create_issue_comment_orchestration: true,
        )
        issue_comment.save

        o = IssueCommentOrchestration.create_issue_comment!(actor: user, comment: issue_comment)
        o.execute!(synchronous: true)

        raise Objects::CreateFailed, issue_comment.errors.full_messages.to_sentence unless issue_comment.valid?
        issue_comment
      end

      def self.create_random(issue:, users: [], count: 20, rng: Random.new, batch_size: 25)
        require_relative "../transaction_helper"
        issue_comments = []
        Seeds::TransactionHelper.repeat_in_batches_with_transaction(
            batch_size: batch_size,
            times: count,
            record: ::IssueComment
        ) do
          issue_comments << random_issue_comment(issue: issue, users: users, rng: rng)
        end
        issue_comments
      end

      def self.random_issue_comment(issue:, users: [], rng: Random.new)
        Faker::Config.random = rng

        create(
          issue: issue,
          body: random_body(rng: rng),
          user: users.sample(random: rng),
        )
      end

      def self.random_body(rng: Random.new)
        num_paragraphs = rng.rand(1..20)
        body = ""

        num_paragraphs.times do
          body += Faker::Lorem.paragraph(sentence_count: 10, random_sentences_to_add: 5)
          body += "\n\n"
        end

        body
      end

      private_class_method :random_issue_comment, :random_body
    end
  end
end
