# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Selfhostedrunners::RegisterRunnerRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Selfhostedrunners::RegisterRunnerRequest`.

class GitHub::Launch::Services::Selfhostedrunners::RegisterRunnerRequest
  sig do
    params(
      billing_owner_id: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity),
      owner_id: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity),
      repository_id: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)
    ).void
  end
  def initialize(billing_owner_id: nil, owner_id: nil, repository_id: nil); end

  sig { returns(T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)) }
  def billing_owner_id; end

  sig { params(value: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)).void }
  def billing_owner_id=(value); end

  sig { void }
  def clear_billing_owner_id; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_repository_id; end

  sig { returns(T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)) }
  def owner_id; end

  sig { params(value: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)).void }
  def owner_id=(value); end

  sig { returns(T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)) }
  def repository_id; end

  sig { params(value: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)).void }
  def repository_id=(value); end
end
