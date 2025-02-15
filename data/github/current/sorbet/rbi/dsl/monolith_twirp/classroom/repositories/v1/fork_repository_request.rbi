# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Classroom::Repositories::V1::ForkRepositoryRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Classroom::Repositories::V1::ForkRepositoryRequest`.

class MonolithTwirp::Classroom::Repositories::V1::ForkRepositoryRequest
  sig do
    params(
      fork_name: T.nilable(String),
      installation_id: T.nilable(Integer),
      one_branch: T.nilable(T::Boolean),
      repo_id: T.nilable(Integer),
      should_grant_admin_access: T.nilable(T::Boolean),
      student_id: T.nilable(Integer),
      team_id: T.nilable(Integer)
    ).void
  end
  def initialize(fork_name: nil, installation_id: nil, one_branch: nil, repo_id: nil, should_grant_admin_access: nil, student_id: nil, team_id: nil); end

  sig { void }
  def clear_fork_name; end

  sig { void }
  def clear_installation_id; end

  sig { void }
  def clear_one_branch; end

  sig { void }
  def clear_repo_id; end

  sig { void }
  def clear_should_grant_admin_access; end

  sig { void }
  def clear_student_id; end

  sig { void }
  def clear_team_id; end

  sig { returns(String) }
  def fork_name; end

  sig { params(value: String).void }
  def fork_name=(value); end

  sig { returns(Integer) }
  def installation_id; end

  sig { params(value: Integer).void }
  def installation_id=(value); end

  sig { returns(T::Boolean) }
  def one_branch; end

  sig { params(value: T::Boolean).void }
  def one_branch=(value); end

  sig { returns(Integer) }
  def repo_id; end

  sig { params(value: Integer).void }
  def repo_id=(value); end

  sig { returns(T::Boolean) }
  def should_grant_admin_access; end

  sig { params(value: T::Boolean).void }
  def should_grant_admin_access=(value); end

  sig { returns(Integer) }
  def student_id; end

  sig { params(value: Integer).void }
  def student_id=(value); end

  sig { returns(Integer) }
  def team_id; end

  sig { params(value: Integer).void }
  def team_id=(value); end
end
