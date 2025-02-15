# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Token::RevokeTokenRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Token::RevokeTokenRequest`.

class GitHub::Launch::Services::Token::RevokeTokenRequest
  sig { params(token: T.nilable(String), workflow_id: T.nilable(String)).void }
  def initialize(token: nil, workflow_id: nil); end

  sig { void }
  def clear_token; end

  sig { void }
  def clear_workflow_id; end

  sig { returns(String) }
  def token; end

  sig { params(value: String).void }
  def token=(value); end

  sig { returns(String) }
  def workflow_id; end

  sig { params(value: String).void }
  def workflow_id=(value); end
end
