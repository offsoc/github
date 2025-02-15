# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Artifactsexchange::DeleteArtifactRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Artifactsexchange::DeleteArtifactRequest`.

class GitHub::Launch::Services::Artifactsexchange::DeleteArtifactRequest
  sig do
    params(
      artifact_name: T.nilable(String),
      check_suite_id: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity),
      execution_id: T.nilable(String),
      repository_id: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)
    ).void
  end
  def initialize(artifact_name: nil, check_suite_id: nil, execution_id: nil, repository_id: nil); end

  sig { returns(String) }
  def artifact_name; end

  sig { params(value: String).void }
  def artifact_name=(value); end

  sig { returns(T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)) }
  def check_suite_id; end

  sig { params(value: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)).void }
  def check_suite_id=(value); end

  sig { void }
  def clear_artifact_name; end

  sig { void }
  def clear_check_suite_id; end

  sig { void }
  def clear_execution_id; end

  sig { void }
  def clear_repository_id; end

  sig { returns(String) }
  def execution_id; end

  sig { params(value: String).void }
  def execution_id=(value); end

  sig { returns(T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)) }
  def repository_id; end

  sig { params(value: T.nilable(GitHub::Launch::Pbtypes::GitHub::Identity)).void }
  def repository_id=(value); end
end
