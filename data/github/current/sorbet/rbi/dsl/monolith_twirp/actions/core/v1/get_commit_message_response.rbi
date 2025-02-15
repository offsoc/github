# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Actions::Core::V1::GetCommitMessageResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Actions::Core::V1::GetCommitMessageResponse`.

class MonolithTwirp::Actions::Core::V1::GetCommitMessageResponse
  sig { params(commit_message: T.nilable(String)).void }
  def initialize(commit_message: nil); end

  sig { void }
  def clear_commit_message; end

  sig { returns(String) }
  def commit_message; end

  sig { params(value: String).void }
  def commit_message=(value); end
end
