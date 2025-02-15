# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::ImportIssueCommentResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::ImportIssueCommentResponse`.

class MonolithTwirp::Octoshift::Imports::V1::ImportIssueCommentResponse
  sig { params(issue_comment: T.nilable(MonolithTwirp::Octoshift::Imports::V1::IssueComment)).void }
  def initialize(issue_comment: nil); end

  sig { void }
  def clear_issue_comment; end

  sig { returns(T.nilable(MonolithTwirp::Octoshift::Imports::V1::IssueComment)) }
  def issue_comment; end

  sig { params(value: T.nilable(MonolithTwirp::Octoshift::Imports::V1::IssueComment)).void }
  def issue_comment=(value); end
end
