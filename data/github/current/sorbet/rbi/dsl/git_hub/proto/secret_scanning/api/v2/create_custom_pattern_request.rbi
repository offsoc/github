# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V2::CreateCustomPatternRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V2::CreateCustomPatternRequest`.

class GitHub::Proto::SecretScanning::Api::V2::CreateCustomPatternRequest
  sig do
    params(
      business_scope: T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternBusinessScope),
      created_by_id: T.nilable(Integer),
      display_name: T.nilable(String),
      dry_run_repositories: T.nilable(T.any(Google::Protobuf::RepeatedField[Integer], T::Array[Integer])),
      expression: T.nilable(String),
      feature_flags: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      max_dry_run_repositories: T.nilable(Integer),
      org_scope: T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternOrgScope),
      origin_id: T.nilable(Integer),
      post_processing: T.nilable(GitHub::Proto::SecretScanning::Api::V2::PostProcessing),
      repo_scope: T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternRepoScope),
      slug: T.nilable(String)
    ).void
  end
  def initialize(business_scope: nil, created_by_id: nil, display_name: nil, dry_run_repositories: T.unsafe(nil), expression: nil, feature_flags: T.unsafe(nil), max_dry_run_repositories: nil, org_scope: nil, origin_id: nil, post_processing: nil, repo_scope: nil, slug: nil); end

  sig { returns(T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternBusinessScope)) }
  def business_scope; end

  sig { params(value: T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternBusinessScope)).void }
  def business_scope=(value); end

  sig { void }
  def clear_business_scope; end

  sig { void }
  def clear_created_by_id; end

  sig { void }
  def clear_display_name; end

  sig { void }
  def clear_dry_run_repositories; end

  sig { void }
  def clear_expression; end

  sig { void }
  def clear_feature_flags; end

  sig { void }
  def clear_max_dry_run_repositories; end

  sig { void }
  def clear_org_scope; end

  sig { void }
  def clear_origin_id; end

  sig { void }
  def clear_post_processing; end

  sig { void }
  def clear_repo_scope; end

  sig { void }
  def clear_slug; end

  sig { returns(Integer) }
  def created_by_id; end

  sig { params(value: Integer).void }
  def created_by_id=(value); end

  sig { returns(String) }
  def display_name; end

  sig { params(value: String).void }
  def display_name=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Integer]) }
  def dry_run_repositories; end

  sig { params(value: Google::Protobuf::RepeatedField[Integer]).void }
  def dry_run_repositories=(value); end

  sig { returns(String) }
  def expression; end

  sig { params(value: String).void }
  def expression=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def feature_flags; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def feature_flags=(value); end

  sig { returns(Integer) }
  def max_dry_run_repositories; end

  sig { params(value: Integer).void }
  def max_dry_run_repositories=(value); end

  sig { returns(T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternOrgScope)) }
  def org_scope; end

  sig { params(value: T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternOrgScope)).void }
  def org_scope=(value); end

  sig { returns(Integer) }
  def origin_id; end

  sig { params(value: Integer).void }
  def origin_id=(value); end

  sig { returns(T.nilable(GitHub::Proto::SecretScanning::Api::V2::PostProcessing)) }
  def post_processing; end

  sig { params(value: T.nilable(GitHub::Proto::SecretScanning::Api::V2::PostProcessing)).void }
  def post_processing=(value); end

  sig { returns(T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternRepoScope)) }
  def repo_scope; end

  sig { params(value: T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternRepoScope)).void }
  def repo_scope=(value); end

  sig { returns(T.nilable(Symbol)) }
  def scope; end

  sig { returns(String) }
  def slug; end

  sig { params(value: String).void }
  def slug=(value); end
end
