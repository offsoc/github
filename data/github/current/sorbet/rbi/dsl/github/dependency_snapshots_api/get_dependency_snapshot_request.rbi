# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Github::DependencySnapshotsApi::GetDependencySnapshotRequest`.
# Please instead update this file by running `bin/tapioca dsl Github::DependencySnapshotsApi::GetDependencySnapshotRequest`.

class Github::DependencySnapshotsApi::GetDependencySnapshotRequest
  sig { params(repository_id: T.nilable(Integer), snapshot_id: T.nilable(Integer)).void }
  def initialize(repository_id: nil, snapshot_id: nil); end

  sig { void }
  def clear_repository_id; end

  sig { void }
  def clear_snapshot_id; end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end

  sig { returns(Integer) }
  def snapshot_id; end

  sig { params(value: Integer).void }
  def snapshot_id=(value); end
end
