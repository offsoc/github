# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Github::DependencySnapshotsApi::GetDependencySnapshotResponse`.
# Please instead update this file by running `bin/tapioca dsl Github::DependencySnapshotsApi::GetDependencySnapshotResponse`.

class Github::DependencySnapshotsApi::GetDependencySnapshotResponse
  sig { params(payload: T.nilable(String), repository_id: T.nilable(Integer), snapshot_id: T.nilable(Integer)).void }
  def initialize(payload: nil, repository_id: nil, snapshot_id: nil); end

  sig { void }
  def clear_payload; end

  sig { void }
  def clear_repository_id; end

  sig { void }
  def clear_snapshot_id; end

  sig { returns(String) }
  def payload; end

  sig { params(value: String).void }
  def payload=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end

  sig { returns(Integer) }
  def snapshot_id; end

  sig { params(value: Integer).void }
  def snapshot_id=(value); end
end
