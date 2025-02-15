# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DependabotApi::V1::UnpauseRepositoryRequest`.
# Please instead update this file by running `bin/tapioca dsl DependabotApi::V1::UnpauseRepositoryRequest`.

class DependabotApi::V1::UnpauseRepositoryRequest
  sig { params(reason: T.nilable(String), repository_github_id: T.nilable(Integer)).void }
  def initialize(reason: nil, repository_github_id: nil); end

  sig { void }
  def clear_reason; end

  sig { void }
  def clear_repository_github_id; end

  sig { returns(String) }
  def reason; end

  sig { params(value: String).void }
  def reason=(value); end

  sig { returns(Integer) }
  def repository_github_id; end

  sig { params(value: Integer).void }
  def repository_github_id=(value); end
end
