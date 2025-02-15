# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Blackbird::Query::V2::Location`.
# Please instead update this file by running `bin/tapioca dsl Blackbird::Query::V2::Location`.

class Blackbird::Query::V2::Location
  sig do
    params(
      commit_sha: T.nilable(String),
      is_repo_public: T.nilable(T::Boolean),
      network_id: T.nilable(Integer),
      owner_id: T.nilable(Integer),
      path: T.nilable(String),
      ref_name: T.nilable(String),
      repo_id: T.nilable(Integer),
      repo_nwo: T.nilable(String),
      repo_score: T.nilable(Integer),
      score: T.nilable(Float)
    ).void
  end
  def initialize(commit_sha: nil, is_repo_public: nil, network_id: nil, owner_id: nil, path: nil, ref_name: nil, repo_id: nil, repo_nwo: nil, repo_score: nil, score: nil); end

  sig { void }
  def clear_commit_sha; end

  sig { void }
  def clear_is_repo_public; end

  sig { void }
  def clear_network_id; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_path; end

  sig { void }
  def clear_ref_name; end

  sig { void }
  def clear_repo_id; end

  sig { void }
  def clear_repo_nwo; end

  sig { void }
  def clear_repo_score; end

  sig { void }
  def clear_score; end

  sig { returns(String) }
  def commit_sha; end

  sig { params(value: String).void }
  def commit_sha=(value); end

  sig { returns(T::Boolean) }
  def is_repo_public; end

  sig { params(value: T::Boolean).void }
  def is_repo_public=(value); end

  sig { returns(Integer) }
  def network_id; end

  sig { params(value: Integer).void }
  def network_id=(value); end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(String) }
  def path; end

  sig { params(value: String).void }
  def path=(value); end

  sig { returns(String) }
  def ref_name; end

  sig { params(value: String).void }
  def ref_name=(value); end

  sig { returns(Integer) }
  def repo_id; end

  sig { params(value: Integer).void }
  def repo_id=(value); end

  sig { returns(String) }
  def repo_nwo; end

  sig { params(value: String).void }
  def repo_nwo=(value); end

  sig { returns(Integer) }
  def repo_score; end

  sig { params(value: Integer).void }
  def repo_score=(value); end

  sig { returns(Float) }
  def score; end

  sig { params(value: Float).void }
  def score=(value); end
end
