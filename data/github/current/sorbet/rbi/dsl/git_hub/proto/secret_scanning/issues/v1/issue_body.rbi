# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Issues::V1::IssueBody`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Issues::V1::IssueBody`.

class GitHub::Proto::SecretScanning::Issues::V1::IssueBody
  sig { params(body: T.nilable(String)).void }
  def initialize(body: nil); end

  sig { returns(String) }
  def body; end

  sig { params(value: String).void }
  def body=(value); end

  sig { void }
  def clear_body; end
end
