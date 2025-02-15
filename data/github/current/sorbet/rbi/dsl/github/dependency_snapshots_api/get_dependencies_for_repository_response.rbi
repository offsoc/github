# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse`.
# Please instead update this file by running `bin/tapioca dsl Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse`.

class Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse
  sig do
    params(
      all_manifests: T.nilable(T.any(Google::Protobuf::RepeatedField[Github::DependencySnapshotsApi::Manifest], T::Array[Github::DependencySnapshotsApi::Manifest])),
      manifests: T.nilable(T.any(Google::Protobuf::Map[String, Github::DependencySnapshotsApi::Manifest], T::Hash[String, Github::DependencySnapshotsApi::Manifest])),
      snapshots: T.nilable(T.any(Google::Protobuf::Map[Integer, Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse::Snapshot], T::Hash[Integer, Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse::Snapshot]))
    ).void
  end
  def initialize(all_manifests: T.unsafe(nil), manifests: T.unsafe(nil), snapshots: T.unsafe(nil)); end

  sig { returns(Google::Protobuf::RepeatedField[Github::DependencySnapshotsApi::Manifest]) }
  def all_manifests; end

  sig { params(value: Google::Protobuf::RepeatedField[Github::DependencySnapshotsApi::Manifest]).void }
  def all_manifests=(value); end

  sig { void }
  def clear_all_manifests; end

  sig { void }
  def clear_manifests; end

  sig { void }
  def clear_snapshots; end

  sig { returns(Google::Protobuf::Map[String, Github::DependencySnapshotsApi::Manifest]) }
  def manifests; end

  sig { params(value: Google::Protobuf::Map[String, Github::DependencySnapshotsApi::Manifest]).void }
  def manifests=(value); end

  sig do
    returns(Google::Protobuf::Map[Integer, Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse::Snapshot])
  end
  def snapshots; end

  sig do
    params(
      value: Google::Protobuf::Map[Integer, Github::DependencySnapshotsApi::GetDependenciesForRepositoryResponse::Snapshot]
    ).void
  end
  def snapshots=(value); end
end
