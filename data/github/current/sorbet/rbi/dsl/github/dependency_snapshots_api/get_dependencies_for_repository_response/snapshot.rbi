# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse::Snapshot`.
# Please instead update this file by running `bin/tapioca dsl Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse::Snapshot`.

class Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse::Snapshot
  sig do
    params(
      detector: T.nilable(Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse::Snapshot::DetectorMetadata),
      scanned: T.nilable(Google::Protobuf::Timestamp)
    ).void
  end
  def initialize(detector: nil, scanned: nil); end

  sig { void }
  def clear_detector; end

  sig { void }
  def clear_scanned; end

  sig do
    returns(T.nilable(Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse::Snapshot::DetectorMetadata))
  end
  def detector; end

  sig do
    params(
      value: T.nilable(Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse::Snapshot::DetectorMetadata)
    ).void
  end
  def detector=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def scanned; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def scanned=(value); end
end
