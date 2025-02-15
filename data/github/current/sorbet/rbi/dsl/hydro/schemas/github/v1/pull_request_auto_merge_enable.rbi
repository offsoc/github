# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::PullRequestAutoMergeEnable`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::PullRequestAutoMergeEnable`.

class Hydro::Schemas::Github::V1::PullRequestAutoMergeEnable
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      auto_merge_request: T.nilable(Hydro::Schemas::Github::V1::Entities::AutoMergeRequest),
      protected_branch: T.nilable(Hydro::Schemas::Github::V1::Entities::ProtectedBranch),
      pull_request: T.nilable(Hydro::Schemas::Github::V1::Entities::PullRequest),
      repository: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository),
      unfulfilled_protected_branch_policy_reason_codes: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String]))
    ).void
  end
  def initialize(actor: nil, auto_merge_request: nil, protected_branch: nil, pull_request: nil, repository: nil, unfulfilled_protected_branch_policy_reason_codes: T.unsafe(nil)); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::AutoMergeRequest)) }
  def auto_merge_request; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::AutoMergeRequest)).void }
  def auto_merge_request=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_auto_merge_request; end

  sig { void }
  def clear_protected_branch; end

  sig { void }
  def clear_pull_request; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_unfulfilled_protected_branch_policy_reason_codes; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::ProtectedBranch)) }
  def protected_branch; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::ProtectedBranch)).void }
  def protected_branch=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::PullRequest)) }
  def pull_request; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::PullRequest)).void }
  def pull_request=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)).void }
  def repository=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def unfulfilled_protected_branch_policy_reason_codes; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def unfulfilled_protected_branch_policy_reason_codes=(value); end
end
