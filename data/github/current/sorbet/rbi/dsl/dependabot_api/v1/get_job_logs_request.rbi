# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DependabotApi::V1::GetJobLogsRequest`.
# Please instead update this file by running `bin/tapioca dsl DependabotApi::V1::GetJobLogsRequest`.

class DependabotApi::V1::GetJobLogsRequest
  sig { params(repository_github_id: T.nilable(Integer), update_job_id: T.nilable(Integer)).void }
  def initialize(repository_github_id: nil, update_job_id: nil); end

  sig { void }
  def clear_repository_github_id; end

  sig { void }
  def clear_update_job_id; end

  sig { returns(Integer) }
  def repository_github_id; end

  sig { params(value: Integer).void }
  def repository_github_id=(value); end

  sig { returns(Integer) }
  def update_job_id; end

  sig { params(value: Integer).void }
  def update_job_id=(value); end
end
